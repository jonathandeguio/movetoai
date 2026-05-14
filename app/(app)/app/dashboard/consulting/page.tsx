import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Briefcase,
  FileText,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";
import type { ConsultantRecommendationResult } from "@/lib/claude-consultant";

export const dynamic = "force-dynamic";

const TIER_CONFIG: Record<string, { label: string; colorClass: string; bgClass: string; icon: React.ElementType }> = {
  Explorer: {
    label: "Explorer",
    colorClass: "text-[--text-secondary]",
    bgClass: "bg-[--bg-hover] border-[--border]",
    icon: Star,
  },
  Certified: {
    label: "Certified Partner",
    colorClass: "text-[--amber]",
    bgClass: "bg-[--amber-dim] border-[--amber-border]",
    icon: Award,
  },
  Expert: {
    label: "Expert Partner",
    colorClass: "text-[--purple]",
    bgClass: "bg-[--purple-dim] border-[--purple-border]",
    icon: Award,
  },
};

const COMPLEXITY_BADGE: Record<string, string> = {
  low: "bg-[--green-dim] text-[--green] border-[--green-border]",
  medium: "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  high: "bg-[--red-dim] text-[--red] border-[--red-dim]",
};

// Mock client workspaces (will be replaced by real multi-tenant query)
const MOCK_CLIENT_WORKSPACES = [
  {
    id: "ws_1",
    name: "Acme Corp",
    sector: "Industrie",
    activeProcesses: 8,
    activeOpportunities: 5,
    lastActivity: "Il y a 2h",
    status: "active" as const,
  },
  {
    id: "ws_2",
    name: "RetailPlus",
    sector: "Commerce / Retail",
    activeProcesses: 4,
    activeOpportunities: 3,
    lastActivity: "Hier",
    status: "active" as const,
  },
  {
    id: "ws_3",
    name: "FinServ SA",
    sector: "Finance",
    activeProcesses: 12,
    activeOpportunities: 7,
    lastActivity: "Il y a 3 jours",
    status: "idle" as const,
  },
];

export default async function ConsultingDashboardPage() {
  const { user, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const prefs = user.preferences as Record<string, unknown> | null;
  const consultantData = prefs?.consultantOnboarding as Record<string, unknown> | null;
  const recommendation = consultantData?.recommendation as ConsultantRecommendationResult | null;
  const specialization = typeof consultantData?.specialization === "string" ? consultantData.specialization : null;
  const simultaneousClients = typeof consultantData?.simultaneousClients === "string" ? consultantData.simultaneousClients : null;
  const partnerTier = typeof consultantData?.partnerTier === "string" ? consultantData.partnerTier : "Explorer";

  const tierConfig = TIER_CONFIG[partnerTier] ?? TIER_CONFIG.Explorer;
  const TierIcon = tierConfig.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-[--amber-border] bg-[--amber-dim] text-[--amber]">
            Consultant IA
          </Badge>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tierConfig.bgClass} ${tierConfig.colorClass}`}
          >
            <TierIcon className="h-3.5 w-3.5" />
            {tierConfig.label}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">
          Dashboard consultant
        </h1>
        <p className="text-sm text-[--text-muted]">
          {specialization && <>Spécialisation : <span className="font-medium text-[--text-secondary]">{specialization}</span> · </>}
          {simultaneousClients && <>{simultaneousClients} en mission</>}
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Workspaces clients", value: MOCK_CLIENT_WORKSPACES.length, icon: Briefcase, colorClass: "text-[--amber]" },
          { label: "Processus actifs", value: MOCK_CLIENT_WORKSPACES.reduce((s, w) => s + w.activeProcesses, 0), icon: TrendingUp, colorClass: "text-[--blue]" },
          { label: "Opportunités IA", value: MOCK_CLIENT_WORKSPACES.reduce((s, w) => s + w.activeOpportunities, 0), icon: Zap, colorClass: "text-[--amber]" },
          { label: "Templates créés", value: 0, icon: FileText, colorClass: "text-[--green]" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="flex flex-col items-start gap-2 rounded-2xl border border-[--border] bg-[--bg-card] p-4"
            >
              <Icon className={`h-5 w-5 ${kpi.colorClass}`} />
              <p className={`text-2xl font-semibold ${kpi.colorClass}`}>{kpi.value}</p>
              <p className="text-xs text-[--text-muted]">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client workspaces card */}
        <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[--amber]" />
                Mes workspaces clients
              </span>
              <Link
                href="/app/dashboard/consulting/clients"
                className="text-xs font-normal text-[--amber] hover:underline"
              >
                Voir tout →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_CLIENT_WORKSPACES.map((ws) => (
              <div
                key={ws.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[--border] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[--text-primary]">{ws.name}</p>
                  <p className="text-xs text-[--text-disabled]">
                    {ws.sector} · {ws.activeProcesses} processus · {ws.activeOpportunities} opportunités
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-[--text-disabled] sm:block">{ws.lastActivity}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${ws.status === "active" ? "bg-[--green]" : "bg-[--border-strong]"}`}
                  />
                </div>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full border-dashed">
              <Link href="/app/dashboard/consulting/clients">
                <Users className="mr-2 h-4 w-4" />
                Ajouter un client
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Top use cases */}
        {recommendation && (
          <Card className="border-[--border] bg-[--bg-card] shadow-soft-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 text-[--amber]" />
                Vos cas d'usage prioritaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recommendation.use_cases.slice(0, 3).map((uc, i) => {
                const badgeClass = COMPLEXITY_BADGE[uc.complexity] ?? COMPLEXITY_BADGE.medium;
                return (
                  <div
                    key={uc.id}
                    className="flex items-start gap-3 rounded-xl border border-[--border] px-4 py-3"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--amber-dim] text-xs font-bold text-[--amber]">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[--text-primary]">
                        {uc.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeClass}`}>
                          {uc.mission_days}
                        </span>
                        <span className="text-xs font-semibold text-[--amber]">{uc.price_range}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Button asChild variant="ghost" size="sm" className="w-full text-[--amber]">
                <Link href="/app/dashboard/consulting/resources">
                  Voir les ressources de vente <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick access */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/app/dashboard/consulting/templates",
            label: "Mes templates",
            description: "Modèles réutilisables pour vos missions clients",
            icon: FileText,
            colorClass: "text-[--blue]",
            bgClass: "bg-[--blue-dim]",
          },
          {
            href: "/app/dashboard/consulting/academy",
            label: "Academy Move to AI",
            description: "Formations et certifications partenaires",
            icon: BookOpen,
            colorClass: "text-[--purple]",
            bgClass: "bg-[--purple-dim]",
          },
          {
            href: "/app/dashboard/consulting/partner",
            label: "Programme partenaire",
            description: "Commissions, co-marketing et support dédié",
            icon: Trophy,
            colorClass: "text-[--amber]",
            bgClass: "bg-[--amber-dim]",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-4 rounded-2xl border border-[--border] bg-[--bg-card] p-5 transition hover:border-[--amber-border] hover:shadow-soft-sm"
            >
              <span className={`rounded-xl p-2.5 ${action.bgClass}`}>
                <Icon className={`h-5 w-5 ${action.colorClass}`} />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-[--text-primary] group-hover:text-[--amber]">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[--text-muted]">{action.description}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[--text-disabled] transition group-hover:text-[--amber]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Import missing icon
function BookOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function Trophy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}
