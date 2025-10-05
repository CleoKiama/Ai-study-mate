import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/utils/session.server";
import { db } from "@/utils/db.server";
import { llamaFile } from "@/db/schema";
import { env } from "@/utils/env.server";
import llamaCloudServer, { llamaCloudConfig } from "@/utils/llama.cloud.server";
import { tryCatch } from "@/utils/misc";

const deleteFile = async (fileId: string, projectId: string) => {
  const url = new URL(`https://api.cloud.llamaindex.ai/api/v1/files/${fileId}`);
  url.searchParams.set("project_id", projectId);
  url.searchParams.set("organization_id", llamaCloudConfig.organizationId);

  const config = {
    method: "delete",
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${env.LLAMA_API_KEY}`,
    },
  };
  const res = await fetch(url, config);
  if (res.status !== 204) {
    console.log(`error deleteing file from llama cloud satus ${res.status}`);
    throw new Error("something went wrong deleting the file");
  }
};

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ fileId: string }>;
  },
) {
  const { fileId } = await params;
  if (!fileId)
    return NextResponse.json(
      { message: "No file Id provided" },
      { status: 401 },
    );

  const { data: session, error } = await tryCatch(getServerSession());
  if (error)
    return NextResponse.json(
      { message: "something went wrong" },
      { status: 500 },
    );

  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  console.log("fileId", fileId);

  try {
    // First, verify user owns this file
    const [file] = await db
      .select()
      .from(llamaFile)
      .where(and(eq(llamaFile.fileId, fileId), eq(llamaFile.userId, userId)))
      .limit(1)
      .execute();

    if (!file) {
      return NextResponse.json(
        { message: "File not found or access denied" },
        { status: 404 },
      );
    }

    const index = llamaCloudServer();
    const projectId = await index.getProjectId();

    await deleteFile(fileId, projectId);

    // Update database status to deleted
    await db.delete(llamaFile).where(eq(llamaFile.fileId, fileId));

    return new Response("", {
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown delete error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
