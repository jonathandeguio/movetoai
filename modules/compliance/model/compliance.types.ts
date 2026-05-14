export type CertificationStatus =
  | "obtained"
  | "in_progress"
  | "planned"
  | "not_applicable"
  | "expired";

export const STATUS_META: Record<CertificationStatus, { label: string; color: string; icon: string }> = {
  obtained:       { label: "Certifié",          color: "var(--green)",      icon: "✅" },
  in_progress:    { label: "En cours d'audit",  color: "var(--blue)",       icon: "🔄" },
  planned:        { label: "Objectif déclaré",  color: "var(--purple)",     icon: "🎯" },
  not_applicable: { label: "Non applicable",    color: "var(--text-muted)", icon: "—"  },
  expired:        { label: "Expirée",           color: "var(--red)",        icon: "❌" },
};
