import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { getServerSession } from "@/utils/session.server";
import llamaCloudServer from "@/utils/llama.cloud.server";
import { db } from "@/utils/db.server";
import { llamaFile } from "@/db/auth-schema";
import { LLamaCloudFileService } from "llama-cloud-services";

export async function DELETE({ params }: { params: { fileId: string } }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { fileId } = params;

  try {
    // First, verify user owns this file
    const [file] = await db
      .select()
      .from(llamaFile)
      .where(and(eq(llamaFile.fileId, fileId), eq(llamaFile.userId, userId)))
      .limit(1);

    if (!file) {
      return NextResponse.json(
        { message: "File not found or access denied" },
        { status: 404 },
      );
    }

    const index = llamaCloudServer();
    const projectId = await index.getProjectId();
    const pipelineId = await index.getPipelineId();

    // FIX: update this delete file does not exist
    await LLamaCloudFileService.deleteFile(projectId, pipelineId, fileId);

    // Update database status to deleted
    await db
      .update(llamaFile)
      .set({ status: "deleted" })
      .where(eq(llamaFile.fileId, fileId));

    return NextResponse.json(
      {
        message: "File deleted successfully",
        fileId,
        fileName: file.fileName,
        status: "deleted",
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown delete error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

