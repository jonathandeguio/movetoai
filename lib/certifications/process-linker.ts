import { CERT_CATALOGUE_EXTENDED } from "@/lib/seed/certification-catalogue";
import { CERTIFICATION_CATALOG } from "@/lib/seed/certifications";

export interface CertInfo {
  code: string;
  name: string;
  shortName: string;
  family: string;
  aiAutomationPotential: "low" | "medium" | "high";
  mandatorySectors: string[];
}

/**
 * Get all certifications whose linkedProcessCodes includes the given catalogCode.
 * Returns enriched info from CERTIFICATION_CATALOG for display.
 */
export function getLinkedCertsForProcess(catalogCode: string): CertInfo[] {
  const matchedEntries = CERT_CATALOGUE_EXTENDED.filter((entry) =>
    entry.linkedProcessCodes.includes(catalogCode)
  );

  return matchedEntries.map((entry) => {
    const catalog = CERTIFICATION_CATALOG.find((c) => c.code === entry.code);
    return {
      code: entry.code,
      name: catalog?.name ?? entry.code,
      shortName: catalog?.shortName ?? entry.code,
      family: catalog?.family ?? "qualite",
      aiAutomationPotential: entry.aiAutomationPotential,
      mandatorySectors: entry.mandatorySectors,
    };
  });
}
