// Server Component
import { db } from "@/utils/db.server";
import { requireAuth } from "@/utils/session.server";
import { llamaFile } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Client from "./client";

export type ManagedFile = {
  id: string;
  filename: string;
  uploadedAt: string;
  externalFileId: string;
};

export default async function UploadPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const rows = await db
    .select({
      id: llamaFile.fileId,
      filename: llamaFile.fileName,
      uploadedAt: llamaFile.created_at,
      externalFileId: llamaFile.externalFileId,
    })
    .from(llamaFile)
    .where(eq(llamaFile.userId, userId))
    .orderBy(desc(llamaFile.created_at));

  const managedFiles: ManagedFile[] = rows.map((r) => ({
    id: r.id,
    filename: r.filename ?? "Untitled",
    uploadedAt: r.uploadedAt ? new Date(r.uploadedAt).toISOString() : "",
    externalFileId: r.externalFileId,
  }));

  return <Client initialManagedFiles={managedFiles} />;
}
