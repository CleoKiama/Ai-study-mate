"use server";
import { env } from "@/utils/env.server";
import llamaCloudServer from "@/utils/llama.cloud.server";
import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import { ContextChatEngine, Settings } from "llamaindex";
import { getServerSession } from "@/utils/session.server";
import { db } from "@/utils/db.server";
import { llamaFile } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { quiz as quizTable, quizAttempt } from "@/db/schema";
import { redirect } from "next/navigation";

Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  apiKey: env.GEMINI_API_KEY,
});

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

export type QuizResult = {
  quiz: QuizQuestion[];
};

export type GenerateQuizParams = {
  userId: string;
  externalFileIds: string[];
  topic?: string;
  count?: number;
  difficulty?: "easy" | "medium" | "hard";
};

export type CreateQuizInput = {
  externalFileIds: string[];
  topic?: string;
  count?: number;
  difficulty?: "easy" | "medium" | "hard";
};

function parseQuizJson(text: string): QuizResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    const parsed = JSON.parse(jsonText);

    if (!parsed.quiz || !Array.isArray(parsed.quiz)) {
      throw new Error("Invalid quiz format: missing quiz array");
    }

    const questions: QuizQuestion[] = parsed.quiz.map(
      (q: unknown, index: number) => {
        const question = q as {
          question?: string;
          options?: unknown[];
          answer?: string;
        };

        if (
          !question.question ||
          !Array.isArray(question.options) ||
          !question.answer
        ) {
          throw new Error(`Invalid question format at index ${index}`);
        }

        let correctAnswer = 0;
        const answerText = question.answer.toString().trim().toLowerCase();

        for (let i = 0; i < question.options.length; i++) {
          if (
            question.options[i]?.toString().trim().toLowerCase() === answerText
          ) {
            correctAnswer = i;
            break;
          }
        }

        return {
          question: question.question,
          options: question.options.map((opt) => opt?.toString() || ""),
          correctAnswer,
        };
      },
    );

    return { quiz: questions };
  } catch (error) {
    console.error("Failed to parse quiz JSON:", error);
    throw new Error("Failed to parse quiz response from AI");
  }
}

async function generateQuizName(topic?: string, quizQuestions?: QuizQuestion[]): Promise<string> {
  try {
    const prompt = topic 
      ? `Generate a short, descriptive name (max 6 words) for a quiz about: ${topic}. Return only the name, no explanation.`
      : `Generate a short, descriptive name (max 6 words) for a quiz based on these questions: ${quizQuestions?.slice(0, 2).map(q => q.question).join(", ")}. Return only the name, no explanation.`;
    
    const response = await Settings.llm?.chat({ 
      messages: [{ content: prompt, role: "user" }] 
    });
    const name = response?.message?.content?.toString()?.trim();
    
    if (name && name.length > 0 && name.length <= 50) {
      return name.replace(/^["']|["']$/g, "");
    }
  } catch (error) {
    console.error("Failed to generate quiz name:", error);
  }
  
  return "Untitled Quiz";
}

const getSystemPrompt = (count = 5, difficulty = "medium") => {
  const difficultyInstructions = {
    easy: "Focus on basic concepts and straightforward questions.",
    medium: "Include moderate complexity questions that require understanding.",
    hard: "Create challenging questions that require deep analysis and critical thinking.",
  };

  return `
You are a helpful quiz generator. 
Create a quiz with exactly ${count} questions based on the provided document context.
${difficultyInstructions[difficulty as keyof typeof difficultyInstructions]}

Return the result as valid JSON in the following format:

{
  "quiz": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}

Important:
- Include exactly ${count} questions
- Each question must have exactly 4 options
- The "answer" field must match one of the options exactly
- Do not include any text outside the JSON object
- Base questions only on the provided document context
`;
};

export async function generateQuiz(
  params: GenerateQuizParams,
): Promise<QuizResult> {
  const { externalFileIds, topic, count = 5, difficulty = "medium" } = params;

  if (externalFileIds.length === 0) {
    throw new Error("At least one document must be selected");
  }

  const index = llamaCloudServer();
  const retriever = index.asRetriever({
    similarityTopK: 8,
    filters: {
      filters: externalFileIds.map((id) => ({
        key: "externalFileId",
        value: id,
      })),
    },
  });

  const chatEngine = new ContextChatEngine({
    retriever,
    systemPrompt: getSystemPrompt(count, difficulty),
  });

  const message = topic
    ? `Generate a quiz about: ${topic}`
    : "Generate a quiz based on the selected documents";

  const response = await chatEngine.chat({ message });

  if (!response.message?.content) {
    throw new Error("No response received from AI");
  }

  const messageContent = response.message.content as string;
  return parseQuizJson(messageContent);
}

export async function recordQuizAttempt(quizId: string, score: number) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    if (score < 0 || score > 100) {
      return { success: false, error: "Score must be between 0 and 100" };
    }

    await db.transaction(async (tx) => {
      await tx.insert(quizAttempt).values({
        userId: session.user.id,
        quizId,
        score,
      });

      await tx
        .update(quizTable)
        .set({
          attempts: sql`${quizTable.attempts} + 1`,
          score: sql`GREATEST(${quizTable.score}, ${score})`,
          updated_at: sql`now()`,
        })
        .where(and(eq(quizTable.id, quizId), eq(quizTable.userId, session.user.id)));
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to record quiz attempt:", error);
    return { success: false, error: "Failed to record attempt" };
  }
}

export async function createQuizAction(input: CreateQuizInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    const { externalFileIds, topic, count = 5, difficulty = "medium" } = input;

    if (!externalFileIds || externalFileIds.length === 0) {
      return { success: false, error: "Please select at least one document" };
    }

    if (count < 1 || count > 20) {
      return {
        success: false,
        error: "Question count must be between 1 and 20",
      };
    }

    const userFiles = await db
      .select({ externalFileId: llamaFile.externalFileId })
      .from(llamaFile)
      .where(eq(llamaFile.userId, userId));

    const ownedFileIds = userFiles.map((f) => f.externalFileId);

    if (ownedFileIds.length === 0) {
      return {
        success: false,
        error: "No documents found. Please upload documents first.",
      };
    }

    const authorizedFileIds = externalFileIds.filter((id) =>
      ownedFileIds.includes(id),
    );

    if (authorizedFileIds.length === 0) {
      return {
        success: false,
        error: "Selected documents are not accessible or do not exist.",
      };
    }

    const quiz = await generateQuiz({
      userId,
      externalFileIds: authorizedFileIds,
      topic: topic || undefined,
      count,
      difficulty: difficulty as "easy" | "medium" | "hard",
    });

    const name = await generateQuizName(topic, quiz.quiz);

    const [{ quizId }] = await db
      .insert(quizTable)
      .values({
        userId,
        name,
        quiz,
        attempts: 0,
        score: 0,
      })
      .returning({
        quizId: quizTable.id,
      });
    
    redirect(`/dashboard/quizzes/${quizId}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error("Quiz generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate quiz",
    };
  }
}