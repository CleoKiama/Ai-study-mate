import { quiz as quizTable } from "@/db/schema";
import { db } from "@/utils/db.server";
import { requireAuth } from "@/utils/session.server";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { QuizModal } from "../components/quiz-component";
import type { QuizResult } from "../utils/quiz-server";

export default async function QuizPage({
  params,
}: {
  params: { quizId: string };
}) {
  const session = await requireAuth();
  const userId = session.user.id;
  const { quizId } = params;

  const rows = await db
    .select({ value: quizTable.quiz })
    .from(quizTable)
    .where(and(eq(quizTable.id, quizId), eq(quizTable.userId, userId)))
    .limit(1);

  const record = rows[0];
  if (!record) notFound();

  const quizResult = record.value as QuizResult;
  return <QuizModal quiz={quizResult.quiz} quizId={quizId} />;
}
