import "server-only";
import { opportunityRepo } from "@/lib/repositories/opportunity.repo";
import { processRepo }     from "@/lib/repositories/process.repo";

export interface OverviewMetrics {
  processCount:        number;
  opportunityCount:    number;
  approvedOrLiveCount: number;
  realizedValue:       number;
}

export interface SpotlightRow {
  title:           string;
  status:          string;
  badge:           string | null;
  overallScore:    number;
  expectedValue:   number;
  processName:     string;
  ownerName:       string | null;
  decisionStatus:  string | null;
}

export interface ChartPoint {
  name:  string;
  score: number;
}

export interface OverviewPageData {
  metrics:       OverviewMetrics;
  spotlightRows: SpotlightRow[];
  chartData:     ChartPoint[];
}

export const overviewService = {
  async getPageData(workspaceId: string): Promise<OverviewPageData> {
    const [processCounts, opportunityCounts, active, realizedValue, opportunities] =
      await Promise.all([
        processRepo.countStats(workspaceId),
        opportunityRepo.countStats(workspaceId),
        opportunityRepo.countActive(workspaceId),
        opportunityRepo.sumRealizedValue(workspaceId),
        opportunityRepo.findForOverview(workspaceId),
      ]);

    // ── Pipeline chart — avg score par processus ────────────────────────────
    const processGroups = new Map<string, { totalScore: number; count: number }>();
    for (const opp of opportunities) {
      const key      = opp.process.name;
      const existing = processGroups.get(key) ?? { totalScore: 0, count: 0 };
      processGroups.set(key, {
        totalScore: existing.totalScore + Number(opp.overallScore ?? 0),
        count:      existing.count + 1,
      });
    }

    const chartData: ChartPoint[] = Array.from(processGroups.entries())
      .map(([name, v]) => ({
        name:  name.length > 20 ? `${name.slice(0, 20)}…` : name,
        score: Number((v.totalScore / v.count).toFixed(0)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // ── Spotlight — top 6 par score ─────────────────────────────────────────
    const spotlightRows: SpotlightRow[] = [...opportunities]
      .sort((a, b) => Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0))
      .slice(0, 6)
      .map((opp) => ({
        title:          opp.title,
        status:         opp.status,
        badge:          opp.badge,
        overallScore:   Number(opp.overallScore ?? 0),
        expectedValue:  Number(opp.expectedValue ?? 0),
        processName:    opp.process.name,
        ownerName:      opp.owner?.name ?? null,
        decisionStatus: opp.currentDecision?.status ?? null,
      }));

    return {
      metrics: {
        processCount:        processCounts.total,
        opportunityCount:    opportunityCounts.total,
        approvedOrLiveCount: active,
        realizedValue,
      },
      spotlightRows,
      chartData,
    };
  },
};
