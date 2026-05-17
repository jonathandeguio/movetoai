/**
 * Extended certification catalogue — Sprint 5.
 * Adds linkedProcessCodes (SAP/LeanIX L3 codes), mandatorySectors (new French onboarding codes),
 * cost/timeline estimates, prerequisites and AI automation potential.
 *
 * Process codes reference lib/seed/process-catalogue.ts.
 * Only codes that exist in the catalogue are used.
 */

export interface CertCatalogueEntry {
  code: string;
  linkedProcessCodes: string[];
  mandatorySectors: string[];
  estimatedCostMin: number;
  estimatedCostMax: number;
  implementationMin: number;
  implementationMax: number;
  prerequisites: string[];
  compatibleWith: string[];
  aiAutomationPotential: "low" | "medium" | "high";
}

export const CERT_CATALOGUE_EXTENDED: CertCatalogueEntry[] = [
  {
    code: "ISO-9001",
    linkedProcessCodes: [
      "FIN-ACC-01", "FIN-ACC-02",
      "MFG-QUA-01", "MFG-QUA-02",
      "MFG-OPS-01",
      "PROC-OPS-01", "PROC-OPS-02", "PROC-OPS-03",
      "HR-TAL-02",
    ],
    mandatorySectors: ["aeronautique", "nucleaire"],
    estimatedCostMin: 3000, estimatedCostMax: 20000,
    implementationMin: 6,   implementationMax: 18,
    prerequisites: [],
    compatibleWith: ["ISO-14001", "ISO-45001", "ISO-27001"],
    aiAutomationPotential: "high",
  },
  {
    code: "ISO-14001",
    linkedProcessCodes: [
      "PROC-SUP-01", "PROC-SUP-02",
      "MFG-OPS-01", "MFG-QUA-01",
    ],
    mandatorySectors: [],
    estimatedCostMin: 4000, estimatedCostMax: 25000,
    implementationMin: 8,   implementationMax: 18,
    prerequisites: [],
    compatibleWith: ["ISO-9001", "ISO-45001"],
    aiAutomationPotential: "high",
  },
  {
    code: "ISO-45001",
    linkedProcessCodes: [
      "HR-ADM-01", "HR-ADM-02",
      "MFG-OPS-01", "PROC-OPS-01",
    ],
    mandatorySectors: [],
    estimatedCostMin: 4000, estimatedCostMax: 22000,
    implementationMin: 8,   implementationMax: 18,
    prerequisites: [],
    compatibleWith: ["ISO-9001", "ISO-14001"],
    aiAutomationPotential: "medium",
  },
  {
    code: "ISO-27001",
    linkedProcessCodes: [
      "PROC-SUP-01", "PROC-SUP-02",
      "HR-ADM-01", "HR-ADM-02",
      "GRC-RISK-01", "GRC-RISK-02", "GRC-RISK-04",
    ],
    mandatorySectors: ["finance_banque"],
    estimatedCostMin: 8000, estimatedCostMax: 40000,
    implementationMin: 9,   implementationMax: 18,
    prerequisites: [],
    compatibleWith: ["ISO-9001", "ISO-22301"],
    aiAutomationPotential: "high",
  },
  {
    code: "ISO-22000",
    linkedProcessCodes: [
      "MFG-QUA-01", "MFG-QUA-02",
      "MFG-OPS-01",
      "PROC-SUP-01", "PROC-SUP-02",
      "PROC-OPS-01",
    ],
    mandatorySectors: [],
    estimatedCostMin: 5000, estimatedCostMax: 30000,
    implementationMin: 8,   implementationMax: 18,
    prerequisites: [],
    compatibleWith: ["ISO-9001", "ISO-14001"],
    aiAutomationPotential: "high",
  },
  {
    code: "ISO-50001",
    linkedProcessCodes: [
      "MFG-OPS-01", "MFG-OPS-02",
    ],
    mandatorySectors: ["energie_environnement"],
    estimatedCostMin: 5000, estimatedCostMax: 25000,
    implementationMin: 8,   implementationMax: 18,
    prerequisites: [],
    compatibleWith: ["ISO-9001", "ISO-14001"],
    aiAutomationPotential: "high",
  },
  {
    code: "ISO-22301",
    linkedProcessCodes: [
      "PROC-SUP-01",
      "GRC-RISK-01", "GRC-RISK-04",
    ],
    mandatorySectors: ["finance_banque"],
    estimatedCostMin: 10000, estimatedCostMax: 50000,
    implementationMin: 10,   implementationMax: 24,
    prerequisites: [],
    compatibleWith: ["ISO-27001", "ISO-9001"],
    aiAutomationPotential: "medium",
  },
  {
    code: "IATF-16949",
    linkedProcessCodes: [
      "MFG-QUA-01", "MFG-QUA-02",
      "MFG-OPS-01", "MFG-OPS-02",
      "PROC-SUP-01", "PROC-SUP-02",
      "PROC-OPS-01", "PROC-OPS-02",
    ],
    mandatorySectors: ["automobile"],
    estimatedCostMin: 8000, estimatedCostMax: 35000,
    implementationMin: 12,   implementationMax: 24,
    prerequisites: ["ISO-9001"],
    compatibleWith: ["ISO-9001", "ISO-14001"],
    aiAutomationPotential: "high",
  },
  {
    code: "EN-9100",
    linkedProcessCodes: [
      "MFG-QUA-01", "MFG-QUA-02",
      "MFG-OPS-01",
      "PROC-SUP-01", "PROC-SUP-02",
      "PROC-OPS-01",
    ],
    mandatorySectors: ["aeronautique"],
    estimatedCostMin: 10000, estimatedCostMax: 45000,
    implementationMin: 12,   implementationMax: 24,
    prerequisites: ["ISO-9001"],
    compatibleWith: ["ISO-9001", "ISO-14001"],
    aiAutomationPotential: "medium",
  },
  {
    code: "ISO-13485",
    linkedProcessCodes: [
      "MFG-QUA-01", "MFG-QUA-02",
      "MFG-OPS-01",
      "PROC-SUP-01", "PROC-SUP-02",
      "GRC-RISK-04",
    ],
    mandatorySectors: ["sante_medical"],
    estimatedCostMin: 8000, estimatedCostMax: 40000,
    implementationMin: 12,   implementationMax: 24,
    prerequisites: [],
    compatibleWith: ["ISO-9001"],
    aiAutomationPotential: "high",
  },
  {
    code: "ISO-22716",
    linkedProcessCodes: [
      "MFG-QUA-01", "MFG-QUA-02",
      "MFG-OPS-01",
    ],
    mandatorySectors: ["cosmetique_luxe"],
    estimatedCostMin: 5000, estimatedCostMax: 25000,
    implementationMin: 8,   implementationMax: 18,
    prerequisites: [],
    compatibleWith: ["ISO-9001", "ISO-14001"],
    aiAutomationPotential: "medium",
  },
  {
    code: "ISO-19443",
    linkedProcessCodes: [
      "MFG-QUA-01", "MFG-QUA-02",
      "MFG-OPS-01",
      "PROC-SUP-01", "PROC-SUP-02",
      "GRC-RISK-01", "GRC-RISK-04",
    ],
    mandatorySectors: ["nucleaire"],
    estimatedCostMin: 15000, estimatedCostMax: 60000,
    implementationMin: 18,   implementationMax: 36,
    prerequisites: ["ISO-9001"],
    compatibleWith: ["ISO-9001"],
    aiAutomationPotential: "low",
  },
  {
    code: "ISO-TS-22163",
    linkedProcessCodes: [
      "MFG-QUA-01", "MFG-QUA-02",
      "PROC-SUP-01", "PROC-SUP-02",
    ],
    mandatorySectors: ["ferroviaire"],
    estimatedCostMin: 8000, estimatedCostMax: 35000,
    implementationMin: 12,   implementationMax: 24,
    prerequisites: ["ISO-9001"],
    compatibleWith: ["ISO-9001", "ISO-14001"],
    aiAutomationPotential: "medium",
  },
  {
    code: "ISO-IEC-20000",
    linkedProcessCodes: [
      "PROC-OPS-01", "PROC-OPS-02",
      "GRC-RISK-01",
    ],
    mandatorySectors: [],
    estimatedCostMin: 8000, estimatedCostMax: 35000,
    implementationMin: 10,   implementationMax: 20,
    prerequisites: [],
    compatibleWith: ["ISO-27001", "ISO-9001"],
    aiAutomationPotential: "high",
  },
];

/** Quick lookup: get extended data for a cert code */
export function getCertExtended(code: string): CertCatalogueEntry | undefined {
  return CERT_CATALOGUE_EXTENDED.find((c) => c.code === code);
}
