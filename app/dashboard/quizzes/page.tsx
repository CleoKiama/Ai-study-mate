import { QuizClient } from "./components/client";
import { requireAuth } from "@/utils/session.server";
import { db } from "@/utils/db.server";
import { llamaFile, quiz as quizTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UserFile = {
  fileId: string;
  fileName: string | null;
  externalFileId: string;
};

export type UserQuiz = {
  id: string;
  name: string;
  createdAt: Date;
  attempts: number;
  score: number;
};

export type QuizStats = {
  quizzesCount: number;
  totalAttempts: number;
  avgScore: string;
};

export default async function QuizzesPage() {
  const session = await requireAuth();

  const files = await db
    .select({
      fileId: llamaFile.fileId,
      fileName: llamaFile.fileName,
      externalFileId: llamaFile.externalFileId,
    })
    .from(llamaFile)
    .where(eq(llamaFile.userId, session.user.id));

  const quizzes = await db
    .select({
      id: quizTable.id,
      name: quizTable.name,
      createdAt: quizTable.created_at,
      attempts: quizTable.attempts,
      score: quizTable.score,
    })
    .from(quizTable)
    .where(eq(quizTable.userId, session.user.id))
    .orderBy(quizTable.created_at);

  const stats: QuizStats = {
    quizzesCount: quizzes.length,
    totalAttempts: quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0),
    avgScore: quizzes.length > 0 
      ? Math.round(quizzes.reduce((sum, quiz) => sum + (quiz.attempts > 0 ? quiz.score : 0), 0) / quizzes.filter(q => q.attempts > 0).length || 0).toString()
      : "-",
  };

  return (
    <div className="space-y-6">
      <QuizClient files={files} quizzes={quizzes} stats={stats} />
    </div>
  );
}
