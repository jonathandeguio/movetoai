import "server-only";

import { prisma } from "@/lib/prisma";
import { CERT_CATALOGUE_EXTENDED } from "@/lib/seed/certification-catalogue";

export interface MissingCert {
  code: string;
  name: string;
  mandatoryFor: string[];
}

export interface ComplianceScore {
  score: number;
  total: number;
  obtained: number;
  expiring: number;
  expired: number;
  missingMandatory: MissingCert[];
}

/**
 * Calculate compliance score for a workspace.
 * -20 per missing mandatory cert (sector-specific)
 * -15 per expired cert
 * -5  per expiring cert (within 90 days)
 * Max 100, min 0.
 */
export async function calculateComplianceScore(workspaceId: string): Promise<ComplianceScore> {
  const [workspace, workspaceCerts] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { sectorCode: true, companySize: true },
    }),
    prisma.workspaceCertification.findMany({
      where: { workspaceId },
      include: { catalog: { select: { code: true, name: true, mandatorySectors: true } } },
    }),
  ]);

  const sectorCode = workspace?.sectorCode ?? "";
  const now = new Date();
  const in90Days = new Date(Date.now() + 90 * 86_400_000);

  let score = 100;
  let obtained = 0;
  let expiring = 0;
  let expired = 0;

  for (const wc of workspaceCerts) {
    if (wc.status === "obtained") {
      obtained++;
      if (wc.expiryDate && wc.expiryDate <= in90Days && wc.expiryDate > now) {
        expiring++;
        score -= 5;
      }
    } else if (wc.status === "expired") {
      expired++;
      score -= 15;
    }
  }

  // Determine which mandatory certs are missing for this sector
  const obtainedCodes = new Set(
    workspaceCerts
      .filter((wc) => wc.status === "obtained" || wc.status === "in_progress")
      .map((wc) => wc.catalog.code)
  );

  const missingMandatory: MissingCert[] = [];

  for (const entry of CERT_CATALOGUE_EXTENDED) {
    if (entry.mandatorySectors.length === 0) continue;
    if (!entry.mandatorySectors.includes(sectorCode)) continue;
    if (!obtainedCodes.has(entry.code)) {
      score -= 20;
      // Find name from workspace certs or use code
      const existingWc = workspaceCerts.find((wc) => wc.catalog.code === entry.code);
      missingMandatory.push({
        code: entry.code,
        name: existingWc?.catalog.name ?? entry.code,
        mandatoryFor: entry.mandatorySectors,
      });
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    total: workspaceCerts.length,
    obtained,
    expiring,
    expired,
    missingMandatory,
  };
}
