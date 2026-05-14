import { requireAnyPermission } from "@/server/permissions";
import { governanceRepo }         from "@/lib/repositories/governance.repo";
import { Badge } from "@/components/ui/badge";
import { RiskDashboardClient } from "@/components/governance/RiskDashboardClient";

export const dynamic = "force-dynamic";

export default async function RiskDashboardPage() {
  const { workspace } = await requireAnyPermission(["opportunities.manage", "analytics.view"]);

  const risks = await governanceRepo.findRisks(workspace!.id);

  const total = risks.length;
  const critical = risks.filter((r) => r.severity === "CRITICAL").length;
  const high = risks.filter((r) => r.severity === "HIGH").length;
  const medium = risks.filter((r) => r.severity === "MEDIUM").length;
  const openCount = risks.filter((r) => r.status === "OPEN").length;

  const stats = [
    { label: "CRITICAL", value: critical, color: "text-[--red]", bg: "bg-[--red-dim]", border: "border-[--red-dim]" },
    { label: "HIGH", value: high, color: "text-[--amber]", bg: "bg-[--amber-dim]", border: "border-[--border]" },
    { label: "MEDIUM", value: medium, color: "text-[--blue]", bg: "bg-[--blue-dim]", border: "border-[--border]" },
    { label: "Ouverts", value: openCount, color: "text-[--text-primary]", bg: "bg-[--bg-hover]", border: "border-[--border]" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-[--green-border] bg-[--bg-card] p-8 shadow-soft-sm">
        <div className="space-y-3">
          <Badge>Gouvernance</Badge>
          <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-[--text-primary] text-balance">
            Risk Dashboard
          </h2>
          <p className="max-w-2xl text-base leading-8 text-[--text-secondary]">
            Identifiez, priorisez et suivez les risques liés à vos initiatives et opportunités IA.
          </p>
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border ${s.border} bg-[--bg-card] p-5 shadow-sm`}
          >
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-sm font-medium text-[--text-secondary]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Client component: matrix + table + filters */}
      <RiskDashboardClient
        risks={risks.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description ?? null,
          severity: r.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          status: r.status as "OPEN" | "MITIGATED" | "ACCEPTED" | "CLOSED",
          owner: r.owner ?? null,
          opportunity: r.opportunity ?? null,
        }))}
        total={total}
      />
    </div>
  );
}
