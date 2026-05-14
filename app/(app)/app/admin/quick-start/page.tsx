import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, Users, Network, Sparkles, BarChart3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { processRepo }    from "@/lib/repositories/process.repo";
import { opportunityRepo } from "@/lib/repositories/opportunity.repo";
import { workspaceRepo }  from "@/lib/repositories/workspace.repo";

export const dynamic = "force-dynamic";

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  done: boolean;
};

export default async function AdminQuickStartPage() {
  const { user, workspace, tenant, role } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!workspace?.id) redirect("/onboarding");

  // Gather completion signals
  const prefs = user.preferences as Record<string, unknown> | null;
  const [processStats, opportunityStats, memberCount] = await Promise.all([
    processRepo.countStats(workspace.id),
    opportunityRepo.countStats(workspace.id),
    workspaceRepo.countActiveMembers(workspace.id),
  ]);
  const processCount     = processStats.total;
  const opportunityCount = opportunityStats.total;
  const aiOnboardingDone = !!(prefs?.aiOnboarding);
  const tenantSettings = (tenant as { settings?: Record<string, unknown> } | null)?.settings as Record<string, unknown> | null;
  const sector = typeof tenantSettings?.sector === "string" ? tenantSettings.sector : null;
  const companySize = typeof tenantSettings?.companySize === "string" ? tenantSettings.companySize : null;

  const companySizeLabel: Record<string, string> = {
    pme: "PME",
    eti: "ETI",
    grand_groupe: "Grand groupe",
  };

  const checklist: ChecklistItem[] = [
    {
      id: "profile",
      title: "Compléter votre profil",
      description: "Renseignez votre poste et vos informations personnelles.",
      href: "/app/settings/profile",
      icon: CheckCircle2,
      done: !!(user.name && user.email),
    },
    {
      id: "processes",
      title: "Cartographier vos premiers processus",
      description: "Ajoutez au moins 3 processus métier pour commencer l'analyse.",
      href: "/app/processes",
      icon: Network,
      done: processCount >= 3,
    },
    {
      id: "opportunities",
      title: "Identifier vos opportunités IA",
      description: "Capturez vos premières idées d'automatisation par processus.",
      href: "/app/opportunities",
      icon: Sparkles,
      done: opportunityCount >= 1,
    },
    {
      id: "team",
      title: "Inviter votre équipe",
      description: "Ajoutez des collaborateurs pour travailler à plusieurs.",
      href: "/app/admin/team",
      icon: Users,
      done: memberCount >= 2,
    },
    {
      id: "analytics",
      title: "Consulter le dashboard analytique",
      description: "Suivez la progression et la valeur générée par vos initiatives IA.",
      href: "/app/analytics",
      icon: BarChart3,
      done: false,
    },
  ];

  const completedCount = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((completedCount / checklist.length) * 100);

  // Compute AI maturity score (simple heuristic from profile data)
  const maturityScore = Math.min(
    100,
    (aiOnboardingDone ? 20 : 0) +
    (processCount >= 3 ? 20 : processCount * 5) +
    (opportunityCount >= 5 ? 20 : opportunityCount * 4) +
    (memberCount >= 3 ? 20 : memberCount * 5) +
    (sector ? 10 : 0) +
    (companySize ? 10 : 0)
  );

  const maturityLabel =
    maturityScore < 30 ? "Débutant" :
    maturityScore < 60 ? "En progression" :
    maturityScore < 85 ? "Avancé" : "Expert";

  const maturityColor =
    maturityScore < 30 ? "text-[--red]" :
    maturityScore < 60 ? "text-[--amber]" :
    maturityScore < 85 ? "text-[--blue]" : "text-[--green]";

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      {/* Header */}
      <div className="space-y-3">
        <Badge variant="default">Workspace Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-[--text-primary]">
          Bienvenue, {user.name?.split(" ")[0] ?? "Admin"} 👋
        </h1>
        <p className="text-base leading-7 text-[--text-secondary]">
          Votre workspace <strong>{workspace.name}</strong> est prêt.
          Suivez cette checklist pour en tirer le meilleur parti dès le premier jour.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Processus", value: processCount },
          { label: "Opportunités IA", value: opportunityCount },
          { label: "Membres actifs", value: memberCount },
          { label: "Tâches complétées", value: `${completedCount}/${checklist.length}` },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-[--border] bg-[--bg-card] p-4 text-center">
            <p className="text-2xl font-semibold text-[--text-primary]">{kpi.value}</p>
            <p className="mt-1 text-xs text-[--text-muted]">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Maturity score */}
      <Card className="border-[--green-border] bg-[--bg-card] shadow-soft-sm">
        <CardHeader>
          <CardTitle className="text-base">Score de maturité IA — estimé par Move to AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <p className={`text-4xl font-semibold ${maturityColor}`}>{maturityScore}%</p>
            <p className={`text-sm font-semibold ${maturityColor}`}>{maturityLabel}</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[--bg-hover]">
            <div
              className={`h-full rounded-full transition-all ${
                maturityScore < 30 ? "bg-[--red]" :
                maturityScore < 60 ? "bg-[--amber]" :
                maturityScore < 85 ? "bg-[--blue]" : "bg-[--green]"
              }`}
              style={{ width: `${maturityScore}%` }}
            />
          </div>
          <p className="text-xs text-[--text-muted]">
            Ce score est calculé à partir de votre profil onboarding, du nombre de processus cartographiés,
            d'opportunités identifiées et des membres actifs. Il progresse automatiquement.
          </p>
          {sector && (
            <p className="text-xs text-[--text-disabled]">
              Secteur : <span className="font-medium text-[--text-secondary]">{sector}</span>
              {companySize && ` · ${companySizeLabel[companySize] ?? companySize}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[--text-secondary]">Progression de la configuration</span>
          <span className="font-semibold text-[--green]">{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[--bg-hover]">
          <div
            className="h-full rounded-full bg-[--green] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {checklist.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-start gap-4 rounded-2xl border p-5 transition ${
                item.done
                  ? "border-[--green-border] bg-[--green-dim]"
                  : "border-[--border] bg-[--bg-card] hover:border-[--green-border] hover:bg-[--green-dim]"
              }`}
            >
              <span
                className={`mt-0.5 rounded-xl p-2 ${
                  item.done ? "bg-[--green-dim] text-[--green]" : "bg-[--bg-hover] text-[--text-muted] group-hover:bg-[--green-dim] group-hover:text-[--green]"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className={`font-semibold ${item.done ? "text-[--green] line-through" : "text-[--text-primary]"}`}>
                  {item.title}
                </p>
                <p className="text-sm leading-6 text-[--text-muted]">{item.description}</p>
              </div>
              {!item.done && (
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[--text-disabled] transition group-hover:text-[--green]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* CTA to main app */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="flex-1">
          <Link href="/app">Accéder au dashboard →</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1">
          <Link href="/app/admin/team">Gérer l'équipe</Link>
        </Button>
      </div>
    </div>
  );
}
