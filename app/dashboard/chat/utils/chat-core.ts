import { env } from "@/utils/env.server";
import llamaCloudServer from "@/utils/llama.cloud.server";
import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import { ContextChatEngine, Settings } from "llamaindex";
import { getServerSession } from "@/utils/session.server";
import { db } from "@/utils/db.server";
import { llamaFile } from "@/db/schema";
import { eq } from "drizzle-orm";

Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  apiKey: env.GEMINI_API_KEY,
});

export type ChatSetupInput = {
  externalFileId: string;
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

export type ChatSetupResult = 
  | { 
      success: true; 
      chatEngine: ContextChatEngine; 
      contextualMessage: string; 
    }
  | { 
      success: false; 
      error: string; 
      status?: number; 
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

export async function setupChatEngine(
  input: ChatSetupInput,
): Promise<ChatSetupResult> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required", status: 401 };
    }

    const { externalFileId, message, history } = input;

    // Validate input
    if (!externalFileId) {
      return { success: false, error: "File ID is required", status: 400 };
    }

    if (!message || message.trim().length === 0) {
      return { success: false, error: "Message is required", status: 400 };
    }

    if (message.length > 2000) {
      return {
        success: false,
        error: "Message must be 2000 characters or less",
        status: 400,
      };
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
        status: 404,
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

    return {
      success: true,
      chatEngine,
      contextualMessage,
    };
  } catch (error) {
    console.error("Error setting up chat engine:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to setup chat engine",
      status: 500,
    };
  }
}