export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── GET — list all catalog entries (optionally filtered by ?sector=) ───────────

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector");

  const catalogs = await prisma.certificationCatalog.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      shortName: true,
      family: true,
      description: true,
      scope: true,
      keyRequirements: true,
      typicalProcesses: true,
      certifyingBody: true,
      validityYears: true,
      auditFrequency: true,
      isMandatory: true,
      mandatoryFor: true,
      riskIfMissing: true,
      officialUrl: true,
      costEstimate: true,
      sectors: true,
      sizeMin: true,
      linkedProcessCodes: true,
      mandatorySectors: true,
      estimatedCostMin: true,
      estimatedCostMax: true,
      implementationMin: true,
      implementationMax: true,
      prerequisites: true,
      compatibleWith: true,
      aiAutomationPotential: true,
    },
    orderBy: [{ family: "asc" }, { name: "asc" }],
  });

  // Filter by sector if provided (check both mandatorySectors and sectors JSON fields)
  const filtered = sector
    ? catalogs.filter((c) => {
        const mandatorySectors = c.mandatorySectors as string[];
        const sectors = c.sectors as string[] | null;
        return (
          mandatorySectors.includes(sector) ||
          (sectors?.includes(sector) ?? false)
        );
      })
    : catalogs;

  return NextResponse.json({ catalog: filtered });
}
