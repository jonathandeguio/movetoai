export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── POST /api/guide/page-visit ────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { pagePath } = body as Record<string, unknown>;
  if (typeof pagePath !== "string" || pagePath.trim() === "") {
    return NextResponse.json({ error: "Missing pagePath" }, { status: 400 });
  }

  const userId = session.user.id;

  // Check if record already exists before upserting so we can report isFirstVisit
  const existing = await prisma.pageFirstVisit.findUnique({
    where: { userId_pagePath: { userId, pagePath } },
    select: { id: true },
  });

  if (!existing) {
    await prisma.pageFirstVisit.create({
      data: { userId, pagePath },
    });
    return NextResponse.json({ isFirstVisit: true });
  }

  return NextResponse.json({ isFirstVisit: false });
}
