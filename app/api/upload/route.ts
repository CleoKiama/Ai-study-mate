import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { parseFormData } from "@mjackson/form-data-parser";
import { getServerSession } from "@/utils/session.server";
import llamaCloudServer from "@/utils/llama.cloud.server";
import { db } from "@/utils/db.server";
import { llamaFile } from "@/db/schema";
import { LLamaCloudFileService } from "llama-cloud-services";

async function uploadHandler(file: File, userId: string) {
  const externalFileId = `${userId}:${randomUUID()}`;
  const index = llamaCloudServer();

  // Get the project and pipeline IDs from the index
  const projectId = await index.getProjectId();
  const pipelineId = await index.getPipelineId();

  const fileId = await LLamaCloudFileService.addFileToPipeline(
    projectId,
    pipelineId,
    file,
    { externalFileId }, // file/node  metadata
  );

  return {
    fileId,
    externalFileId,
  };
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const formData = await parseFormData(request);
    const file = formData.get("doc") as File;

    const result = await uploadHandler(file, userId);

    await db.insert(llamaFile).values({
      fileId: result.fileId,
      userId,
      externalFileId: result.externalFileId,
      fileName: file.name,
      status: "uploaded",
    });

    return NextResponse.json(
      {
        message: "Upload accepted",
        status: "uploaded",
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown upload error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
