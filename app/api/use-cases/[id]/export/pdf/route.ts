export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceContext } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCurrency(v: number | null | undefined): string {
  if (v == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useCase: any = await prisma.useCase.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      opportunity: {
        select: { title: true, domainLabel: true, gainEstimate: true, status: true },
      },
    },
  }).catch(() => null);

  if (!useCase) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const kpis: Array<{ label: string; target: string; unit: string }> =
    Array.isArray(useCase.kpis) ? useCase.kpis : [];
  const risks: Array<{ label: string; level: string; mitigation: string }> =
    Array.isArray(useCase.risks) ? useCase.risks : [];
  const processSteps: string[] = Array.isArray(useCase.processSteps) ? useCase.processSteps : [];
  const nextSteps: string[] = Array.isArray(useCase.nextSteps) ? useCase.nextSteps : [];
  const dataRequired: string[] = Array.isArray(useCase.dataRequired) ? useCase.dataRequired : [];
  const recommendedTools: string[] = Array.isArray(useCase.recommendedTools)
    ? useCase.recommendedTools
    : [];
  const roi = useCase.roiEstimated ?? {};

  const RISK_COLORS: Record<string, string> = {
    low:    "#22c55e",
    medium: "#f59e0b",
    high:   "#ef4444",
  };

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Use Case — ${esc(useCase.opportunity?.title ?? useCase.id)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #0f172a;
      background: #ffffff;
      padding: 40px 48px;
    }
    @media print {
      body { padding: 20px 24px; }
      .no-print { display: none !important; }
      a { text-decoration: none; color: inherit; }
    }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
    .header-left .brand { font-size: 11px; font-weight: 700; color: #22c55e; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .header-left h1 { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.2; max-width: 480px; }
    .header-meta { text-align: right; }
    .header-meta .date { font-size: 10px; color: #64748b; }
    .header-meta .status-badge { display: inline-block; margin-top: 6px; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 600; background: #dcfce7; color: #16a34a; }

    /* Section */
    .section { margin-bottom: 24px; }
    .section-title { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }

    /* Grid */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

    /* Card */
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
    .card-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
    .card-value { font-size: 18px; font-weight: 700; color: #0f172a; }
    .card-sub { font-size: 10px; color: #64748b; margin-top: 2px; }

    /* ROI */
    .roi-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; }
    .roi-value { font-size: 22px; font-weight: 800; color: #16a34a; }

    /* Text */
    p.body-text { font-size: 12px; color: #334155; line-height: 1.7; }

    /* List */
    ul.styled { list-style: none; padding: 0; }
    ul.styled li { display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: #334155; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
    ul.styled li:last-child { border-bottom: none; }
    ul.styled li::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22c55e; margin-top: 5px; flex-shrink: 0; }

    /* Ordered steps */
    ol.steps { list-style: none; counter-reset: step; padding: 0; }
    ol.steps li { counter-increment: step; display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; color: #334155; }
    ol.steps li::before { content: counter(step); display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 9px; font-weight: 700; flex-shrink: 0; }

    /* Tags */
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { padding: 3px 10px; border-radius: 999px; background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 10px; color: #475569; }

    /* KPI table */
    table.kpi-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    table.kpi-table th { text-align: left; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; padding: 6px 8px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    table.kpi-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    table.kpi-table tr:last-child td { border-bottom: none; }

    /* Risk table */
    table.risk-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    table.risk-table th { text-align: left; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; padding: 6px 8px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    table.risk-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    table.risk-table tr:last-child td { border-bottom: none; }
    .risk-badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 600; color: white; }

    /* Footer */
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }

    /* Print button */
    .print-btn { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
    .print-btn button { background: #22c55e; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .print-btn button:hover { background: #16a34a; }
  </style>
</head>
<body>

  <!-- Print button (hidden on print) -->
  <div class="print-btn no-print">
    <button onclick="window.print()">⬇ Exporter en PDF</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="brand">BluePilot · Use Case</div>
      <h1>${esc(useCase.opportunity?.title ?? "Use Case")}</h1>
      ${useCase.opportunity?.domainLabel ? `<p style="font-size:11px;color:#64748b;margin-top:4px;">${esc(useCase.opportunity.domainLabel)}</p>` : ""}
    </div>
    <div class="header-meta">
      <div class="date">Généré le ${formatDate(new Date())}</div>
      <div class="status-badge">${esc(useCase.status ?? "Backlog")}</div>
    </div>
  </div>

  <!-- Overview grid -->
  <div class="section">
    <div class="section-title">Vue d'ensemble</div>
    <div class="grid-3">
      ${
        roi.netGain != null
          ? `<div class="roi-card">
              <div class="card-label">Gain net estimé</div>
              <div class="roi-value">${formatCurrency(roi.netGain)}</div>
              <div class="card-sub">sur ${roi.timeframeMonths ?? "?"} mois</div>
             </div>`
          : ""
      }
      ${
        useCase.effortDays != null
          ? `<div class="card">
              <div class="card-label">Effort estimé</div>
              <div class="card-value">${useCase.effortDays}j</div>
              <div class="card-sub">homme-jours</div>
             </div>`
          : ""
      }
      ${
        roi.roi != null
          ? `<div class="card">
              <div class="card-label">ROI</div>
              <div class="card-value">${Math.round(roi.roi)}%</div>
              <div class="card-sub">retour sur investissement</div>
             </div>`
          : ""
      }
    </div>
  </div>

  <!-- Solution description -->
  ${
    useCase.solutionDescription
      ? `<div class="section">
          <div class="section-title">Solution proposée</div>
          <p class="body-text">${esc(useCase.solutionDescription)}</p>
         </div>`
      : ""
  }

  <!-- Expected outcome -->
  ${
    useCase.expectedOutcome
      ? `<div class="section">
          <div class="section-title">Résultats attendus</div>
          <p class="body-text">${esc(useCase.expectedOutcome)}</p>
         </div>`
      : ""
  }

  <!-- Process steps -->
  ${
    processSteps.length > 0
      ? `<div class="section">
          <div class="section-title">Étapes du processus (${processSteps.length})</div>
          <ol class="steps">
            ${processSteps.map((s: string) => `<li>${esc(s)}</li>`).join("")}
          </ol>
         </div>`
      : ""
  }

  <!-- KPIs -->
  ${
    kpis.length > 0
      ? `<div class="section">
          <div class="section-title">KPIs (${kpis.length})</div>
          <table class="kpi-table">
            <thead>
              <tr>
                <th>Indicateur</th>
                <th>Cible</th>
                <th>Unité</th>
              </tr>
            </thead>
            <tbody>
              ${kpis
                .map(
                  (k: { label: string; target: string; unit: string }) =>
                    `<tr><td>${esc(k.label)}</td><td>${esc(k.target)}</td><td>${esc(k.unit)}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
         </div>`
      : ""
  }

  <!-- Risks -->
  ${
    risks.length > 0
      ? `<div class="section">
          <div class="section-title">Risques identifiés</div>
          <table class="risk-table">
            <thead>
              <tr>
                <th>Risque</th>
                <th>Niveau</th>
                <th>Mitigation</th>
              </tr>
            </thead>
            <tbody>
              ${risks
                .map(
                  (r: { label: string; level: string; mitigation: string }) =>
                    `<tr>
                      <td>${esc(r.label)}</td>
                      <td><span class="risk-badge" style="background:${RISK_COLORS[r.level] ?? "#64748b"}">${esc(r.level)}</span></td>
                      <td>${esc(r.mitigation)}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
         </div>`
      : ""
  }

  <!-- Data required -->
  ${
    dataRequired.length > 0
      ? `<div class="section">
          <div class="section-title">Données requises</div>
          <ul class="styled">
            ${dataRequired.map((d: string) => `<li>${esc(d)}</li>`).join("")}
          </ul>
         </div>`
      : ""
  }

  <!-- Tools -->
  ${
    recommendedTools.length > 0
      ? `<div class="section">
          <div class="section-title">Outils recommandés</div>
          <div class="tags">
            ${recommendedTools.map((t: string) => `<span class="tag">${esc(t)}</span>`).join("")}
          </div>
         </div>`
      : ""
  }

  <!-- Next steps -->
  ${
    nextSteps.length > 0
      ? `<div class="section">
          <div class="section-title">Prochaines étapes</div>
          <ul class="styled">
            ${nextSteps.map((s: string) => `<li>${esc(s)}</li>`).join("")}
          </ul>
         </div>`
      : ""
  }

  <!-- Footer -->
  <div class="footer">
    <span>BluePilot AI — ${esc(workspace.name ?? "Workspace")}</span>
    <span>Confidentiel — ${formatDate(new Date())}</span>
  </div>

  <script>
    // Auto-open print dialog after a short delay for better UX
    // Disabled by default — user clicks the button above
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Suggest print filename
      "Content-Disposition": `inline; filename="use-case-${id}.pdf"`,
    },
  });
}
