"use client";

import { useState } from "react";
import { Monitor } from "lucide-react";
import { ApplicationCard } from "./ApplicationCard";

type Application = {
  id: string;
  name: string;
  vendor?: string | null;
  description?: string | null;
  lifecycleState?: string | null;
  criticality?: string | null;
  deploymentType?: string | null;
  annualCost?: number | null;
  userCount?: number | null;
  aiReadinessScore?: number | null;
  businessOwner?: { name: string | null } | null;
  itOwner?: { name: string | null } | null;
  _count: {
    processes: number;
    capabilities: number;
    opportunities: number;
  };
};

const LIFECYCLE_TABS = [
  { key: "all",      label: "Toutes" },
  { key: "active",   label: "Actives" },
  { key: "tolerate", label: "Tolérées" },
  { key: "phaseout", label: "À retirer" },
  { key: "retire",   label: "Retrait" },
] as const;

type LifecycleTab = typeof LIFECYCLE_TABS[number]["key"];

export function ApplicationsGrid({ applications }: { applications: Application[] }) {
  const [activeTab, setActiveTab] = useState<LifecycleTab>("all");

  const filtered =
    activeTab === "all"
      ? applications
      : applications.filter(
          (a) => (a.lifecycleState ?? "").toLowerCase() === activeTab
        );

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {LIFECYCLE_TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? applications.length
              : applications.filter(
                  (a) => (a.lifecycleState ?? "").toLowerCase() === tab.key
                ).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "border-[--green-border] bg-[--green-dim] text-[--green]"
                  : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:bg-[--bg-hover] hover:text-[--text-primary]"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Grid ou empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[--border] bg-[--bg-hover] py-16 text-center">
          <Monitor className="h-10 w-10 text-[--text-disabled]" />
          <div>
            <p className="font-medium text-[--text-secondary]">Aucune application dans cette catégorie</p>
            <p className="mt-1 text-sm text-[--text-muted]">
              Ajoutez des applications ou changez de filtre.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              id={app.id}
              name={app.name}
              vendor={app.vendor}
              description={app.description}
              lifecycleState={app.lifecycleState}
              criticality={app.criticality}
              deploymentType={app.deploymentType}
              annualCost={app.annualCost}
              userCount={app.userCount}
              aiReadinessScore={app.aiReadinessScore}
              businessOwner={app.businessOwner}
              itOwner={app.itOwner}
              _count={app._count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
