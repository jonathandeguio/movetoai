// app/api/aria/dismiss/route.ts
// POST — enregistre le dismiss d'une suggestion Aria pour ne plus la montrer.

import { NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { prisma }       from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const { suggestion_id, page_path } = await request.json() as {
      suggestion_id: string;
      page_path:     string;
    };

    if (!suggestion_id) return NextResponse.json({ ok: false }, { status: 400 });

    await prisma.ariaDismissal.upsert({
      where: {
        userId_suggestionId: {
          userId:       session.user.id,
          suggestionId: suggestion_id,
        },
      },
      create: {
        userId:       session.user.id,
        suggestionId: suggestion_id,
        pagePath:     page_path ?? "",
      },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
