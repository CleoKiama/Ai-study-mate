"use server";
import { env } from "@/utils/env.server";
import llamaCloudServer from "@/utils/llama.cloud.server";
import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import { ContextChatEngine, Settings } from "llamaindex";
import { getServerSession } from "@/utils/session.server";
import { db } from "@/utils/db.server";
import { llamaFile, summary } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  apiKey: env.GEMINI_API_KEY,
});

export type GenerateSummaryParams = {
  userId: string;
  externalFileId: string;
  topic?: string;
  targetWords?: number;
};

export type SummaryResult = {
  title: string;
  content: string;
  model: string;
  tokens?: number;
};

function getSummaryPrompt(targetWords: number = 200, topic?: string) {
  const baseInstructions = `
You are an expert document summarizer. Your task is to create a comprehensive yet concise summary.

CRITICAL INSTRUCTIONS:
- Base your summary ONLY on the provided document context
- Do NOT hallucinate or add information not present in the documents
- Aim for approximately ${targetWords} words
- Structure your response exactly as: "Title: [descriptive title]" followed by "Summary: [summary content]"
- Make the summary informative, well-structured, and easy to understand
- Use bullet points or paragraphs as appropriate for clarity
`;

  if (topic) {
    return (
      baseInstructions +
      `
- Focus specifically on content related to: "${topic}"
- If the topic is not well-covered in the documents, mention this limitation
- Organize the summary around the key aspects of this topic found in the documents
`
    );
  }

  return (
    baseInstructions +
    `
- Provide a comprehensive overview of the entire document
- Include the main themes, key points, and important conclusions
- Organize logically with clear structure
`
  );
}

function parseSummaryResponse(text: string): {
  title: string;
  content: string;
} {
  try {
    let title = "Document Summary";
    let content = text;

    // Look for "Title:" pattern
    const titleMatch = text.match(/Title:\s*(.+?)(?:\n|$)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // Look for "Summary:" pattern
    const summaryMatch = text.match(/Summary:\s*([\s\S]+)/i);
    if (summaryMatch) {
      content = summaryMatch[1].trim();
    }

    return { title, content };
  } catch (error) {
    console.error("Failed to parse summary response:", error);
    return {
      title: "Document Summary",
      content: text.trim(),
    };
  }
}

export async function generateSummary(
  params: GenerateSummaryParams,
): Promise<SummaryResult> {
  const { externalFileId, topic, targetWords = 200 } = params;

  if (!externalFileId) {
    throw new Error("External file ID is required");
  }

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

  const chatEngine = new ContextChatEngine({
    retriever,
    systemPrompt: getSummaryPrompt(targetWords, topic),
  });

  const message = topic
    ? `Create a focused summary about: ${topic}`
    : "Create a comprehensive summary of the document";

  const response = await chatEngine.chat({ message });

  if (!response.message?.content) {
    throw new Error("No response received from AI");
  }

  const messageContent = response.message.content as string;
  const { title, content } = parseSummaryResponse(messageContent);

  return {
    title,
    content,
    model: GEMINI_MODEL.GEMINI_2_0_FLASH,
    tokens: undefined, // Gemini doesn't easily expose token counts
  };
}

export async function getSummariesAction() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const summaries = await db
      .select({
        id: summary.id,
        title: summary.title,
        content: summary.content,
        model: summary.model,
        tokens: summary.tokens,
        createdAt: summary.created_at,
        updatedAt: summary.updated_at,
        fileName: llamaFile.fileName,
      })
      .from(summary)
      .leftJoin(llamaFile, eq(summary.fileId, llamaFile.fileId))
      .where(eq(summary.userId, session.user.id))
      .orderBy(desc(summary.created_at));

    return { success: true, summaries };
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch summaries",
    };
  }
}

export async function createSummaryAction(input: {
  externalFileId: string;
  topic?: string;
  targetWords?: number;
}) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    const { externalFileId, topic, targetWords = 200 } = input;

    if (!externalFileId) {
      return { success: false, error: "File ID is required" };
    }

    if (targetWords < 50 || targetWords > 1000) {
      return {
        success: false,
        error: "Target words must be between 50 and 1000",
      };
    }

    if (topic && topic.length > 100) {
      return { success: false, error: "Topic must be 100 characters or less" };
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

    const fileId = userFile[0].fileId;

    // Generate the summary
    const summaryResult = await generateSummary({
      userId,
      externalFileId,
      topic,
      targetWords,
    });

    // Save to database
    const [savedSummary] = await db
      .insert(summary)
      .values({
        userId,
        fileId,
        externalFileId,
        title: summaryResult.title,
        content: summaryResult.content,
        model: summaryResult.model,
        tokens: summaryResult.tokens,
      })
      .returning();

    return { success: true, summary: savedSummary };
  } catch (error) {
    console.error("Summary generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate summary",
    };
  }
}

