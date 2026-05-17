export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getCertsBySector } from "@/lib/certifications/sector-mapper";

// ── GET ?sector=automobile&size=pme ──────────────────────────────────────────

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector") ?? "";
  const size   = searchParams.get("size") ?? "pme";

  const result = await getCertsBySector(sector, size);
  return NextResponse.json(result);
}
