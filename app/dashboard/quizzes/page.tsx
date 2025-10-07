import { QuizClient } from "./components/client";
import { requireAuth } from "@/utils/session.server";
import { db } from "@/utils/db.server";
import { llamaFile } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UserFile = {
  fileId: string;
  fileName: string | null;
  externalFileId: string;
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

  return (
    <div className="space-y-6">
      <QuizClient files={files} />
    </div>
  );
}
