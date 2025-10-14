import { QuizClient } from "./components/client";
import { requireAuth } from "@/utils/session.server";
import { db } from "@/utils/db.server";
import { llamaFile, quiz as quizTable, quizAttempt } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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
  streakDays: number;
};

function computeStreak(dates: Date[], now = new Date()): number {
  const set = new Set(dates.map(d => d.toISOString().slice(0, 10)));
  let streak = 0;
  const cur = new Date(now.toDateString());
  
  while (set.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  
  return streak;
}

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

  const [{ avg, totalAttempts }] = await db
    .select({
      avg: sql<number>`COALESCE(ROUND(AVG(${quizAttempt.score})), 0)`,
      totalAttempts: sql<number>`COUNT(*)`,
    })
    .from(quizAttempt)
    .where(eq(quizAttempt.userId, session.user.id));

  const datesRows = await db
    .select({
      d: sql<Date>`DATE(${quizAttempt.created_at})`,
    })
    .from(quizAttempt)
    .where(eq(quizAttempt.userId, session.user.id))
    .groupBy(sql`DATE(${quizAttempt.created_at})`)
    .orderBy(sql`DATE(${quizAttempt.created_at}) DESC`)
    .limit(60);

  const streakDays = computeStreak(datesRows.map(r => new Date(r.d)));

  const stats: QuizStats = {
    quizzesCount: quizzes.length,
    totalAttempts: Number(totalAttempts),
    avgScore: Number(totalAttempts) > 0 ? String(avg) : "-",
    streakDays,
  };

  return (
    <div className="space-y-6">
      <QuizClient files={files} quizzes={quizzes} stats={stats} />
    </div>
  );
}
