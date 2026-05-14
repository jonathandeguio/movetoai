export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { extractEntitiesFromText } from "@/lib/ai/ingestion-extractor";

const TEXT_TYPES = ["text/plain", "text/csv", "application/csv"];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  const jobs = await db.ingestionJob.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      status: true,
      targetEntityType: true,
      errorMessage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ error: "No workspace" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const targetEntityType = formData.get("targetEntityType");
  const targetType =
    typeof targetEntityType === "string" && targetEntityType !== "auto"
      ? targetEntityType
      : null;

  const fileName = file.name;
  const fileType = file.type || "application/octet-stream";
  const fileSize = file.size;

  // Determine file extension category
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const isTextBased =
    TEXT_TYPES.includes(fileType) ||
    ext === "txt" ||
    ext === "csv";

  let rawContent: string | null = null;
  let statusNote: string | null = null;

  if (isTextBased) {
    try {
      rawContent = await file.text();
    } catch {
      return NextResponse.json({ error: "Failed to read file content" }, { status: 400 });
    }
  } else {
    // For binary formats (pdf, docx, xlsx), store file name and mark for future processing
    statusNote = `Binary file "${fileName}" uploaded. Content extraction for ${ext.toUpperCase()} files requires a document parser. Raw text extraction skipped.`;
  }

  // Create ingestion job
  const job = await db.ingestionJob.create({
    data: {
      workspaceId: workspace.id,
      fileName,
      fileType: ext || "unknown",
      fileSize,
      status: rawContent ? "pending" : "failed",
      rawContent,
      targetEntityType: targetType,
      errorMessage: statusNote,
    },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      status: true,
      createdAt: true,
    },
  });

  // Fire and forget extraction for text-based files
  if (rawContent) {
    extractEntitiesFromText(rawContent, workspace.id, job.id).catch((err) => {
      console.error("[ingestion] background extraction error:", err);
    });
  }

  return NextResponse.json(
    {
      job,
      message: rawContent
        ? "File uploaded. Extraction started in background."
        : statusNote,
    },
    { status: 202 }
  );
}
