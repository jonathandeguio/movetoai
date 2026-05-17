import "server-only";

import { prisma } from "@/lib/prisma";
import { CERT_CATALOGUE_EXTENDED } from "@/lib/seed/certification-catalogue";

export interface CertCatalogBasic {
  id: string;
  code: string;
  name: string;
  shortName: string;
  family: string;
  description: string;
  estimatedCostMin: number | null;
  estimatedCostMax: number | null;
  implementationMin: number | null;
  implementationMax: number | null;
  aiAutomationPotential: string | null;
  linkedProcessCount: number;
}

export interface SectorCerts {
  mandatory: CertCatalogBasic[];
  recommended: CertCatalogBasic[];
}

/**
 * Get certifications relevant for a given sector and company size.
 * Uses the new French sector codes (mandatorySectors) for mandatory,
 * and the existing English codes (sectors) for recommended.
 */
export async function getCertsBySector(
  sectorCode: string,
  _companySize: string
): Promise<SectorCerts> {
  // Find codes that are mandatory for this sector
  const mandatoryCodes = CERT_CATALOGUE_EXTENDED
    .filter((e) => e.mandatorySectors.includes(sectorCode))
    .map((e) => e.code);

  // Get ALL active certs from DB
  const allCerts = await prisma.certificationCatalog.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      shortName: true,
      family: true,
      description: true,
      sectors: true,
      sizeMin: true,
      estimatedCostMin: true,
      estimatedCostMax: true,
      implementationMin: true,
      implementationMax: true,
      aiAutomationPotential: true,
      linkedProcessCodes: true,
    },
    orderBy: { name: "asc" },
  });

  const toBasic = (c: (typeof allCerts)[0]): CertCatalogBasic => ({
    id: c.id,
    code: c.code,
    name: c.name,
    shortName: c.shortName,
    family: c.family,
    description: c.description,
    estimatedCostMin: c.estimatedCostMin,
    estimatedCostMax: c.estimatedCostMax,
    implementationMin: c.implementationMin,
    implementationMax: c.implementationMax,
    aiAutomationPotential: c.aiAutomationPotential,
    linkedProcessCount: Array.isArray(c.linkedProcessCodes) ? c.linkedProcessCodes.length : 0,
  });

  const mandatory = allCerts
    .filter((c) => mandatoryCodes.includes(c.code))
    .map(toBasic);

  const mandatorySet = new Set(mandatoryCodes);

  // Recommended: those that have sector code in their "sectors" JSON field, and aren't mandatory
  const recommended = allCerts
    .filter((c) => {
      if (mandatorySet.has(c.code)) return false;
      const sectors = c.sectors as string[] | null;
      if (!sectors) return false;
      return sectors.includes(sectorCode);
    })
    .map(toBasic);

  return { mandatory, recommended };
}
