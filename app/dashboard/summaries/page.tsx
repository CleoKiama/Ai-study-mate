import { db } from "@/utils/db.server";
import { requireAuth } from "@/utils/session.server";
import { llamaFile, summary } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import SummariesClient from "./client";
import type { Summary, Doc } from "./client";

export default async function SummariesPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  // Fetch summaries
  const summariesData = await db
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
    .where(eq(summary.userId, userId))
    .orderBy(desc(summary.created_at));

  // Fetch documents/files
  const docsData = await db
    .select({
      id: llamaFile.fileId,
      fileName: llamaFile.fileName,
      externalFileId: llamaFile.externalFileId,
      createdAt: llamaFile.created_at,
    })
    .from(llamaFile)
    .where(eq(llamaFile.userId, userId))
    .orderBy(desc(llamaFile.created_at));

  // Serialize for client
  const initialSummaries: Summary[] = summariesData.map((s) => ({
    id: s.id,
    title: s.title,
    content: s.content,
    model: s.model,
    tokens: s.tokens,
    createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: s.updatedAt ? s.updatedAt.toISOString() : null,
    fileName: s.fileName,
  }));

  const initialDocs: Doc[] = docsData.map((d) => ({
    id: d.id,
    fileName: d.fileName,
    externalFileId: d.externalFileId,
    createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
  }));

  return (
    <SummariesClient
      initialSummaries={initialSummaries}
      initialDocs={initialDocs}
    />
  );
}
