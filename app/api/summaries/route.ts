import { NextResponse } from "next/server";
import { createSummaryAction } from "@/app/dashboard/summaries/utils/summary-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { externalFileId, topic, targetWords } = body;

    if (!externalFileId || typeof externalFileId !== "string") {
      return NextResponse.json(
        { message: "Valid external file ID is required" },
        { status: 400 }
      );
    }

    const result = await createSummaryAction({
      externalFileId,
      topic,
      targetWords,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.summary, { status: 201 });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}