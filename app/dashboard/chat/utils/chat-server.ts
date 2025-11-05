"use server";
import { env } from "@/utils/env.server";
import llamaCloudServer from "@/utils/llama.cloud.server";
import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import { ContextChatEngine, Settings } from "llamaindex";
import { getServerSession } from "@/utils/session.server";
import { db } from "@/utils/db.server";
import { llamaFile } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  apiKey: env.GEMINI_API_KEY,
});

export type UserFile = {
  fileId: string;
  externalFileId: string;
  fileName: string;
  uploadDate: string;
};

export type AskDocQuestionInput = {
  externalFileId: string;
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

export type AskDocQuestionResult = {
  success: boolean;
  answer?: string;
  error?: string;
  model?: string;
  tokens?: number;
};

function getChatPrompt() {
  return `
You are an expert document assistant. Your task is to answer questions based strictly on the provided document context.

CRITICAL INSTRUCTIONS:
- Base your answers ONLY on the provided document context
- Do NOT hallucinate or add information not present in the documents
- If you cannot answer based on the context, clearly state "I cannot find information about that in the provided document"
- Provide clear, concise, and helpful answers
- When relevant, cite specific parts of the document to support your answer
- If the question is unclear, ask for clarification
- Maintain a helpful and professional tone
`;
}

export async function getUserFilesAction(): Promise<{
  success: boolean;
  files?: UserFile[];
  error?: string;
}> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const files = await db
      .select({
        fileId: llamaFile.fileId,
        externalFileId: llamaFile.externalFileId,
        fileName: llamaFile.fileName,
        uploadDate: llamaFile.created_at,
      })
      .from(llamaFile)
      .where(eq(llamaFile.userId, session.user.id))
      .orderBy(desc(llamaFile.created_at));

    const formattedFiles: UserFile[] = files.map((file) => ({
      fileId: file.fileId,
      externalFileId: file.externalFileId,
      fileName: file.fileName || "Untitled Document",
      uploadDate: new Date(file.uploadDate).toLocaleDateString(),
    }));

    return { success: true, files: formattedFiles };
  } catch (error) {
    console.error("Error fetching user files:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch files",
    };
  }
}

export async function askDocQuestionAction(
  input: AskDocQuestionInput,
): Promise<AskDocQuestionResult> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const { externalFileId, message, history } = input;

    // Validate input
    if (!externalFileId) {
      return { success: false, error: "File ID is required" };
    }

    if (!message || message.trim().length === 0) {
      return { success: false, error: "Message is required" };
    }

    if (message.length > 2000) {
      return { success: false, error: "Message must be 2000 characters or less" };
    }

    // Verify user owns this file
    const userFile = await db
      .select({ fileId: llamaFile.fileId })
      .from(llamaFile)
      .where(eq(llamaFile.externalFileId, externalFileId))
      .limit(1);

    if (userFile.length === 0) {
      return {
        success: false,
        error: "File not found or access denied",
      };
    }

    // Set up LlamaIndex retriever with file filter
    const index = llamaCloudServer();
    const retriever = index.asRetriever({
      similarityTopK: 8,
      filters: {
        filters: [
          {
            key: "externalFileId",
            value: externalFileId,
          },
        ],
      },
    });

    // Create chat engine
    const chatEngine = new ContextChatEngine({
      retriever,
      systemPrompt: getChatPrompt(),
    });

    // Prepare the message with history context if provided
    let contextualMessage = message;
    if (history && history.length > 0) {
      const historyContext = history
        .slice(-4) // Keep last 4 messages for context
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
      contextualMessage = `Previous conversation:\n${historyContext}\n\nCurrent question: ${message}`;
    }

    // Get AI response
    const response = await chatEngine.chat({ message: contextualMessage });

    if (!response.message?.content) {
      throw new Error("No response received from AI");
    }

    const answer = response.message.content as string;

    return {
      success: true,
      answer,
      model: GEMINI_MODEL.GEMINI_2_0_FLASH,
      tokens: undefined, // Gemini doesn't easily expose token counts
    };
  } catch (error) {
    console.error("Chat error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process question",
    };
  }
}