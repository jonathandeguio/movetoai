/**
 * Onboarding sector mapping — bridges new French sector codes
 * (used in the onboarding wizard v2) to the legacy English codes
 * stored in workspace.sectorCode and used throughout the app.
 */

export const ONBOARDING_SECTORS = [
  { code: "agroalimentaire",          label: "Agroalimentaire",           icon: "🍔", legacyCode: "agri_food"       },
  { code: "automobile",               label: "Automobile",                icon: "🚗", legacyCode: "automotive"      },
  { code: "aeronautique",             label: "Aéronautique & Défense",   icon: "✈️", legacyCode: "manufacturing"   },
  { code: "nucleaire",                label: "Nucléaire",                 icon: "⚛️", legacyCode: "energy"          },
  { code: "sante_medical",            label: "Santé & Médical",           icon: "🏥", legacyCode: "healthcare"      },
  { code: "cosmetique_luxe",          label: "Cosmétique & Luxe",         icon: "💄", legacyCode: "luxury"          },
  { code: "numerique_esn",            label: "Numérique / ESN / SaaS",    icon: "💻", legacyCode: "tech"            },
  { code: "btp_construction",         label: "BTP & Construction",        icon: "🏗️", legacyCode: "real_estate"     },
  { code: "energie_environnement",    label: "Énergie & Environnement",   icon: "⚡", legacyCode: "energy"          },
  { code: "transport_logistique",     label: "Transport & Logistique",    icon: "🚚", legacyCode: "logistics"       },
  { code: "industrie_manufacturiere", label: "Industrie manufacturière",  icon: "🏭", legacyCode: "manufacturing"   },
  { code: "ferroviaire",              label: "Ferroviaire",               icon: "🚃", legacyCode: "manufacturing"   },
  { code: "finance_banque",           label: "Finance & Banque",          icon: "🏦", legacyCode: "finance"         },
  { code: "services_conseil",         label: "Services & Conseil",        icon: "👔", legacyCode: "consulting"      },
  { code: "chimie_pharmacie",         label: "Chimie & Pharmacie",        icon: "🧪", legacyCode: "pharma"          },
  { code: "distribution_retail",      label: "Distribution & Retail",     icon: "🛒", legacyCode: "retail"          },
] as const;

export type OnboardingSectorCode = (typeof ONBOARDING_SECTORS)[number]["code"];
export type LegacySectorCode = (typeof ONBOARDING_SECTORS)[number]["legacyCode"];

/** Convert new French onboarding sector code → legacy English code */
export function toLegatySectorCode(onboardingCode: OnboardingSectorCode): LegacySectorCode {
  const found = ONBOARDING_SECTORS.find((s) => s.code === onboardingCode);
  return found?.legacyCode ?? "other" as LegacySectorCode;
}

/** Convert legacy English sector code → onboarding sector code (first match) */
export function toLegacySectorLabel(legacyCode: string): string {
  const found = ONBOARDING_SECTORS.find((s) => s.legacyCode === legacyCode);
  return found?.label ?? legacyCode;
}

/** Get all onboarding sector codes that map to a given legacy code */
export function getOnboardingCodesForLegacy(legacyCode: string): OnboardingSectorCode[] {
  return ONBOARDING_SECTORS
    .filter((s) => s.legacyCode === legacyCode)
    .map((s) => s.code);
}
