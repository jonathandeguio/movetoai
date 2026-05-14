"use client";

import { useRouter } from "next/navigation";
import { Building2, Server, UserCheck } from "lucide-react";

const ACCOUNT_TYPES = [
  {
    id: "enterprise",
    icon: Building2,
    title: "Mon entreprise veut automatiser ses processus",
    description:
      "Vous représentez une organisation et souhaitez piloter sa transformation IA. Vous devenez admin du workspace.",
    colorVar: "--blue",
    dimVar: "--blue-dim",
    borderVar: "--blue-border",
    href: "/onboarding",
  },
  {
    id: "it_manager",
    icon: Server,
    title: "DSI / IT Manager — Gouvernance technique",
    description:
      "Vous pilotez l'architecture, les intégrations et la conformité RGPD des projets IA. Obtenez une roadmap d'intégration personnalisée.",
    colorVar: "--blue",
    dimVar: "--blue-dim",
    borderVar: "--blue-border",
    href: "/onboarding?type=it_manager",
  },
  {
    id: "consultant",
    icon: UserCheck,
    title: "Je suis consultant / intégrateur IA",
    description:
      "Vous accompagnez plusieurs entreprises clientes. Vous gérez des workspaces pour le compte de vos clients.",
    colorVar: "--purple",
    dimVar: "--purple-dim",
    borderVar: "--purple-border",
    href: "/onboarding?type=consultant",
  },
] as const;

export function AccountTypeSelector() {
  const router = useRouter();

  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      {ACCOUNT_TYPES.map((type) => {
        const Icon = type.icon;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => router.push(type.href)}
            style={{
              border: `2px solid var(${type.borderVar})`,
              background: `var(${type.dimVar})`,
              borderRadius: "var(--r-xl)",
              padding: "1.75rem",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "1rem",
              transition: "border-color var(--t-fast), background var(--t-fast)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = `var(${type.colorVar})`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = `var(${type.borderVar})`;
            }}
          >
            <span
              style={{
                borderRadius: "var(--r-lg)",
                padding: "0.75rem",
                background: "var(--bg-card)",
                color: `var(${type.colorVar})`,
                display: "inline-flex",
              }}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div className="space-y-2">
              <h2 className="text-base font-semibold leading-snug text-[--text-primary]">
                {type.title}
              </h2>
              <p className="text-sm leading-6 text-[--text-secondary]">{type.description}</p>
            </div>
            <span className="mt-auto text-sm font-semibold" style={{ color: `var(${type.colorVar})` }}>
              Choisir ce profil →
            </span>
          </button>
        );
      })}
    </div>
  );
}
