import { NextResponse } from "next/server";
import type { FileUpload } from "@mjackson/form-data-parser";
import { parseFormData } from "@mjackson/form-data-parser";
import { createWriteStream, readFileSync } from "fs";
import { Readable } from "node:stream";
import { ReadableStream as WebReadable } from "node:stream/web";
import { randomUUID } from "node:crypto";

import { getServerSession } from "@/utils/session.server";
import llamaCloudServer from "@/utils/llama.cloud.server";
import { db } from "@/utils/db.server";
import { llamaFile } from "@/db/schema";
import { LLamaCloudFileService } from "llama-cloud-services";

function makeTmpPath(original: string) {
  const safe = original.replace(/[^\w.\-]/g, "_");
  return `/tmp/${Date.now()}-${randomUUID()}-${safe}`;
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const saved = { path: "", originalName: "" };

  async function uploadHandler(fileUpload: FileUpload) {
    saved.originalName = fileUpload.name ?? "upload.bin";
    const webStream = fileUpload.stream() as WebReadable;
    const nodeStream = Readable.fromWeb(webStream);
    const tmpPath = makeTmpPath(saved.originalName);
    await new Promise<void>((resolve, reject) => {
      const sink = createWriteStream(tmpPath);
      sink.on("finish", () => resolve());
      sink.on("error", reject);
      nodeStream.pipe(sink);
    });
    saved.path = tmpPath;
    // Returning the tmp path so formData has a value, but we rely on `saved`
    return tmpPath;
  }

  try {
    await parseFormData(request, uploadHandler);
    if (!saved.path) {
      return NextResponse.json(
        { message: "No file found in multipart payload" },
        { status: 400 },
      );
    }

    const externalFileId = `${userId}:${randomUUID()}`;
    const index = llamaCloudServer();

    // Get the project and pipeline IDs from the index
    const projectId = await index.getProjectId();
    const pipelineId = await index.getPipelineId();

    // Create a Blob from the temporary file for Node.js compatibility
    const fileBuffer = readFileSync(saved.path);
    const blob = new Blob([fileBuffer], { type: "application/octet-stream" });

    // Upload file using LlamaCloudFileService
    const fileId = await LLamaCloudFileService.addFileToPipeline(
      projectId,
      pipelineId,
      blob,
      { externalFileId },
    );
    console.log("fileId", fileId);

    await db.insert(llamaFile).values({
      fileId,
      userId,
      externalFileId,
      fileName: saved.originalName,
      status: "uploaded",
    });

    return NextResponse.json(
      {
        message: "Upload accepted",
        fileId,
        externalFileId,
        fileName: saved.originalName,
        status: "uploaded",
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown upload error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

