import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";

  if (!slug || slug.length < 3 || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const existing = await prisma.workspace.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}
