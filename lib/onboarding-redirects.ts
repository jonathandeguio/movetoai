/**
 * Matrice de redirection post-onboarding.
 * Calcule la page d'entrée la plus pertinente selon le rôle utilisateur
 * (userFunction) et la taille de l'entreprise (companySize).
 */

type RedirectBySize = Record<string, string>;
type RedirectMatrix = Record<string, RedirectBySize | string>;

const REDIRECT_MATRIX: RedirectMatrix = {
  transformation_manager: {
    pme: "/app",
    eti: "/app/portfolio",
    grand_groupe: "/app/portfolio",
  },
  enterprise_architect: {
    pme: "/app/opportunities",
    eti: "/app/opportunities",
    grand_groupe: "/app/opportunities",
  },
};

// Legacy mapping for accounts created before the role migration
const LEGACY_FUNCTION_MAP: Record<string, string> = {
  executive:      "transformation_manager",
  ai_lead:        "transformation_manager",
  business_owner: "transformation_manager",
  other:          "transformation_manager",
  data_it:        "enterprise_architect",
  it_manager:     "enterprise_architect",
  consultant:     "enterprise_architect",
};

export function computeOnboardingRedirect(
  userFunction: string | null | undefined,
  companySize: string | null | undefined
): string {
  const raw = userFunction ?? "transformation_manager";
  // Normalize legacy values
  const fn = LEGACY_FUNCTION_MAP[raw] ?? raw;
  const size = companySize ?? "pme";
  const entry = REDIRECT_MATRIX[fn];

  if (!entry) return "/app";
  if (typeof entry === "string") return entry;
  return entry[size] ?? "/app";
}
