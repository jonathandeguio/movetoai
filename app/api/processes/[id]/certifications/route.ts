export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { getLinkedCertsForProcess } from "@/lib/certifications/process-linker";

type RouteContext = { params: Promise<{ id: string }> };

// ── GET — certifications linked to a process ──────────────────────────────────
// Two sources:
//  1. CertificationLink records (explicit links via workspaceCertification)
//  2. linkedProcessCodes matching process.catalogCode in CERT_CATALOGUE_EXTENDED

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) {
    return NextResponse.json({ code: "NO_WORKSPACE" }, { status: 400 });
  }

  const { id } = await params;

  const process = await prisma.process.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    select: { id: true, name: true, catalogCode: true },
  });

  if (!process) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  // 1. Get certifications linked via CertificationLink
  const explicitLinks = await prisma.certificationLink.findMany({
    where: { entityType: "process", entityId: id },
    include: {
      certification: {
        include: {
          catalog: {
            select: {
              code: true, name: true, shortName: true, family: true,
              aiAutomationPotential: true, mandatorySectors: true,
            },
          },
        },
      },
    },
  });

  // 2. Get certifications from linkedProcessCodes matching process.catalogCode
  const catalogLinked = process.catalogCode
    ? getLinkedCertsForProcess(process.catalogCode)
    : [];

  // Resolve workspace certification statuses for the catalog-linked ones
  const catalogCodes = catalogLinked.map((c) => c.code);
  const workspaceCerts = catalogCodes.length > 0
    ? await prisma.workspaceCertification.findMany({
        where: {
          workspaceId: workspace.id,
          catalog: { code: { in: catalogCodes } },
        },
        include: { catalog: { select: { code: true } } },
      })
    : [];

  const statusByCatalogCode = new Map(
    workspaceCerts.map((wc) => [wc.catalog.code, wc.status])
  );
  const explicitLinkCertIds = new Set(
    explicitLinks.map((l) => l.certification.catalog.code)
  );

  const catalogLinkedWithStatus = catalogLinked.map((c) => ({
    source: "catalog_linked" as const,
    certCode: c.code,
    name: c.name,
    shortName: c.shortName,
    family: c.family,
    aiAutomationPotential: c.aiAutomationPotential,
    mandatorySectors: c.mandatorySectors,
    workspaceStatus: statusByCatalogCode.get(c.code) ?? "not_declared",
    isExplicitlyLinked: explicitLinkCertIds.has(c.code),
  }));

  const explicitLinkedFormatted = explicitLinks.map((l) => ({
    source: "explicit_link" as const,
    certCode: l.certification.catalog.code,
    name: l.certification.catalog.name,
    shortName: l.certification.catalog.shortName,
    family: l.certification.catalog.family,
    aiAutomationPotential: l.certification.catalog.aiAutomationPotential,
    mandatorySectors: l.certification.catalog.mandatorySectors as string[],
    workspaceStatus: l.certification.status,
    coverage: l.coverage,
  }));

  return NextResponse.json({
    process: { id: process.id, name: process.name, catalogCode: process.catalogCode },
    catalogLinked: catalogLinkedWithStatus,
    explicitLinked: explicitLinkedFormatted,
  });
}
