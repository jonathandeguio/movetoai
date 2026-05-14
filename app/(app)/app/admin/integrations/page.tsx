"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Lock, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";

type IntegStatus = "connected" | "available" | "enterprise";

type Integration = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: IntegStatus;
  logo: string;
};

const INTEGRATIONS: Integration[] = [
  // CRM
  { id: "salesforce", name: "Salesforce", category: "CRM", description: "Synchronisez vos opportunités IA avec vos projets CRM.", status: "available", logo: "SF" },
  { id: "hubspot", name: "HubSpot", category: "CRM", description: "Liez les automatisations IA à vos pipelines commerciaux.", status: "available", logo: "HS" },
  // ERP
  { id: "sap", name: "SAP S/4HANA", category: "ERP", description: "Connectez vos processus SAP pour une cartographie automatisée.", status: "enterprise", logo: "SAP" },
  { id: "odoo", name: "Odoo", category: "ERP", description: "Import automatique des processus depuis vos modules Odoo.", status: "available", logo: "OD" },
  // Collaboration
  { id: "slack", name: "Slack", category: "Collaboration", description: "Recevez les alertes décisionnelles Move to AI dans vos canaux.", status: "available", logo: "SL" },
  { id: "teams", name: "Microsoft Teams", category: "Collaboration", description: "Notifications et rapports directement dans Teams.", status: "available", logo: "MT" },
  // Data
  { id: "powerbi", name: "Power BI", category: "Analytics", description: "Exportez vos données ROI vers vos dashboards Power BI.", status: "enterprise", logo: "PBI" },
  { id: "notion", name: "Notion", category: "Collaboration", description: "Synchronisez vos fiches processus avec votre Notion.", status: "available", logo: "NO" }
];

const CATEGORIES = ["Tous", "CRM", "ERP", "Collaboration", "Analytics"];

const STATUS_CONFIG: Record<IntegStatus, { label: string; className: string }> = {
  connected: { label: "Connecté", className: "bg-[--green-dim] text-[--green] border-[--green-border]" },
  available: { label: "Disponible", className: "bg-[--blue-dim] text-[--blue] border-[--blue-border]" },
  enterprise: { label: "Enterprise", className: "bg-[--bg-hover] text-[--text-muted] border-[--border]" }
};

export default function AdminIntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered = INTEGRATIONS.filter(
    (i) => activeCategory === "Tous" || i.category === activeCategory
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">Intégrations</h1>
        <p className="mt-1 text-sm text-[--text-muted]">
          Connectez Move to AI à vos outils existants.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-[--blue] text-[--on-green]"
                : "border border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--blue-border] hover:text-[--blue]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Integration cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((integ) => {
          const statusInfo = STATUS_CONFIG[integ.status];
          return (
            <div
              key={integ.id}
              className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[--bg-hover] text-xs font-bold text-[--text-secondary]">
                    {integ.logo}
                  </div>
                  <div>
                    <p className="font-semibold text-[--text-primary]">{integ.name}</p>
                    <p className="text-xs text-[--text-muted]">{integ.category}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="mb-4 text-sm text-[--text-muted] leading-relaxed">{integ.description}</p>
              <div className="flex gap-2">
                {integ.status === "connected" && (
                  <>
                    <Button size="sm" variant="outline" className="flex-1 border-[--green-border] text-[--green]">
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Configuré
                    </Button>
                    <Button size="sm" variant="outline" className="border-[--border] text-[--text-muted]" asChild>
                      <a href="#"><ExternalLink className="h-3.5 w-3.5" /></a>
                    </Button>
                  </>
                )}
                {integ.status === "available" && (
                  <Button size="sm" className="flex-1 bg-[--blue] text-[--on-green]">
                    <Plug className="mr-1.5 h-3.5 w-3.5" /> Connecter
                  </Button>
                )}
                {integ.status === "enterprise" && (
                  <Button size="sm" variant="outline" className="flex-1 border-[--border] text-[--text-disabled]" disabled>
                    <Lock className="mr-1.5 h-3.5 w-3.5" /> Enterprise requis
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[--text-muted]">
        Une intégration manquante ?{" "}
        <a href="mailto:integrations@move-to-ai.com" className="text-[--blue] hover:underline">
          Contactez-nous
        </a>{" "}
        — nous priorisons selon les demandes clients.
      </p>
    </div>
  );
}
