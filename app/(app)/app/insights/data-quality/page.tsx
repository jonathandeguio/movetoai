export const dynamic = "force-dynamic";

import { AlertTriangle, Zap, Info, BarChart2 } from "lucide-react";
import { insightsRepo }           from "@/lib/repositories/insights.repo";
import { requireAnyPermission }  from "@/server/permissions";
import { DataQualityRefreshButton } from "@/components/insights/DataQualityRefreshButton";

interface QualityIssue {
  field: string;
  count: number;
  severity: "critical" | "warning" | "info";
  message: string;
}

interface QualityRecommendation {
  priority: number;
  action: string;
  impact: string;
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  let color: string;
  let label: string;
  if (score >= 70) {
    color = "var(--green, #22c55e)";
    label = "Bon";
  } else if (score >= 40) {
    color = "var(--amber, #f59e0b)";
    label = "Moyen";
  } else {
    color = "var(--red, #ef4444)";
    label = "Insuffisant";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={130} height={130} viewBox="0 0 130 130">
        {/* Background ring */}
        <circle
          cx={65}
          cy={65}
          r={radius}
          fill="none"
          stroke="var(--border, rgba(255,255,255,0.1))"
          strokeWidth={10}
        />
        {/* Progress ring */}
        <circle
          cx={65}
          cy={65}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Score text */}
        <text
          x={65}
          y={60}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 26, fontWeight: 700, fill: color }}
        >
          {score}
        </text>
        <text
          x={65}
          y={80}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 11, fill: "var(--text-muted, #888)" }}
        >
          / 100
        </text>
      </svg>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 9999,
          backgroundColor:
            score >= 70
              ? "var(--green-dim, rgba(34,197,94,0.12))"
              : score >= 40
              ? "var(--amber-dim, rgba(251,191,36,0.12))"
              : "var(--red-dim, rgba(239,68,68,0.12))",
          color,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SeverityIcon({ severity }: { severity: "critical" | "warning" | "info" }) {
  if (severity === "critical") {
    return <AlertTriangle size={16} color="var(--red, #ef4444)" style={{ flexShrink: 0 }} />;
  }
  if (severity === "warning") {
    return <Zap size={16} color="var(--amber, #f59e0b)" style={{ flexShrink: 0 }} />;
  }
  return <Info size={16} color="var(--blue, #3b82f6)" style={{ flexShrink: 0 }} />;
}

function severityColor(severity: "critical" | "warning" | "info"): string {
  if (severity === "critical") return "var(--red, #ef4444)";
  if (severity === "warning") return "var(--amber, #f59e0b)";
  return "var(--blue, #3b82f6)";
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DataQualityPage() {
  const { workspace } = await requireAnyPermission(["analytics.view", "opportunities.manage"]);

  const report = workspace?.id
    ? await insightsRepo.findLatestDataQualityReport(workspace.id, "workspace")
    : null;

  const issues: QualityIssue[] = Array.isArray(report?.issues)
    ? (report.issues as unknown as QualityIssue[])
    : [];

  const recommendations: QualityRecommendation[] = Array.isArray(report?.recommendations)
    ? (report.recommendations as unknown as QualityRecommendation[])
    : [];

  const sortedRecs = [...recommendations].sort((a, b) => a.priority - b.priority);
  const sortedIssues = [...issues].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BarChart2 size={24} color="var(--text-primary)" />
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
              Qualité des données
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 9999,
                backgroundColor: "rgba(249,115,22,0.12)",
                color: "#f97316",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Insights
            </span>
          </div>
          {report && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #888)" }}>
              Dernière analyse : {formatDate(report.generatedAt)}
            </p>
          )}
        </div>
        <DataQualityRefreshButton />
      </div>

      {/* Empty state */}
      {!report && (
        <div
          style={{
            padding: "48px 32px",
            textAlign: "center",
            borderRadius: 12,
            border: "1px dashed var(--border)",
            color: "var(--text-muted, #888)",
          }}
        >
          <BarChart2 size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
            Aucun rapport disponible
          </h2>
          <p style={{ margin: "0 0 20px", fontSize: 14 }}>
            Lancez une première analyse pour évaluer la qualité des données de votre workspace.
          </p>
          <DataQualityRefreshButton />
        </div>
      )}

      {/* Score card */}
      {report && (
        <div
          style={{
            padding: "28px 32px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-card)",
            display: "flex",
            alignItems: "center",
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          <ScoreGauge score={report.overallScore} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              Score global de qualité
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted, #888)", lineHeight: 1.6 }}>
              Ce score reflète la complétude et la richesse des données saisies dans votre workspace.
              Un score élevé garantit des analyses IA plus précises et des recommandations plus pertinentes.
            </p>
            {sortedIssues.filter((i) => i.severity === "critical").length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  backgroundColor: "var(--red-dim, rgba(239,68,68,0.1))",
                  color: "var(--red, #ef4444)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {sortedIssues.filter((i) => i.severity === "critical").length} problème(s) critique(s) à résoudre en priorité
              </div>
            )}
          </div>
        </div>
      )}

      {/* Issues */}
      {report && sortedIssues.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>
            Problèmes détectés
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedIssues.map((issue, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1px solid var(--border)`,
                  backgroundColor: "var(--bg-card)",
                }}
              >
                <div style={{ paddingTop: 2 }}>
                  <SeverityIcon severity={issue.severity} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
                    {issue.message}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-muted, #888)" }}>
                    Champ : <code style={{ fontFamily: "monospace" }}>{issue.field}</code>
                    {" — "}
                    {issue.count} occurrence{issue.count !== 1 ? "s" : ""}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 9999,
                    backgroundColor:
                      issue.severity === "critical"
                        ? "var(--red-dim, rgba(239,68,68,0.1))"
                        : issue.severity === "warning"
                        ? "var(--amber-dim, rgba(251,191,36,0.1))"
                        : "var(--blue-dim, rgba(59,130,246,0.1))",
                    color: severityColor(issue.severity),
                    whiteSpace: "nowrap",
                  }}
                >
                  {issue.severity === "critical"
                    ? "Critique"
                    : issue.severity === "warning"
                    ? "Attention"
                    : "Info"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report && sortedRecs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>
            Recommandations
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedRecs.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-card)",
                }}
              >
                {/* Priority number */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor:
                      rec.priority === 1
                        ? "var(--green-dim, rgba(34,197,94,0.15))"
                        : rec.priority === 2
                        ? "var(--amber-dim, rgba(251,191,36,0.15))"
                        : "var(--bg-muted, rgba(255,255,255,0.06))",
                    color:
                      rec.priority === 1
                        ? "var(--green, #22c55e)"
                        : rec.priority === 2
                        ? "var(--amber, #f59e0b)"
                        : "var(--text-muted, #888)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {rec.priority}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
                    {rec.action}
                  </p>
                  {rec.impact && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted, #888)" }}>
                      Impact : {rec.impact}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No issues when report exists */}
      {report && sortedIssues.length === 0 && (
        <div
          style={{
            padding: "24px",
            borderRadius: 10,
            border: "1px solid var(--green-border, #22c55e)",
            backgroundColor: "var(--green-dim, rgba(34,197,94,0.08))",
            color: "var(--green, #22c55e)",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Aucun problème détecté — vos données sont en excellente qualité !
        </div>
      )}
    </div>
  );
}
