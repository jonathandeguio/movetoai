import { CheckSquare, Workflow, Bell, MessageSquare, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

import { AriaBanner } from "@/components/aria/AriaBanner";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { processRepo }                from "@/lib/repositories/process.repo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

// Mock notifications — replace with real notification model when available
const MOCK_NOTIFICATIONS = [
  { id: "1", text: "Nouveau processus assigné : Clôture mensuelle", time: "il y a 2h", type: "process" },
  { id: "2", text: "Commentaire de Marie sur 'Relance clients'", time: "il y a 5h", type: "comment" },
  { id: "3", text: "Mise à jour du workflow RH par Jean", time: "hier", type: "update" },
];

export default async function MemberDashboardPage() {
  const { session, workspace, user } = await getCurrentWorkspaceContext({ requireMembership: true });

  const prefs = user.preferences as Record<string, unknown> | null;
  const memberOnboarding = prefs?.memberOnboarding as Record<string, unknown> | null;
  const firstName = typeof memberOnboarding?.firstName === "string" ? memberOnboarding.firstName : (user.name?.split(" ")[0] ?? "");

  // Fetch processes this member has access to via their workspace
  const processes = workspace?.id
    ? await processRepo.findRecent(workspace.id, 5)
    : [];

  return (
    <div className="space-y-6">
      <AriaBanner />
      {/* Welcome */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] px-6 py-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[--text-primary]">
          Bonjour{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-[--text-muted]">
          Workspace : <span className="font-medium text-[--text-secondary]">{workspace?.name ?? "—"}</span>
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tasks */}
        <Card className="border-[--border] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[--text-secondary]">
              <CheckSquare className="h-4 w-4 text-[--text-muted]" />
              Mes tâches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[--text-primary]">3</p>
            <p className="mt-1 text-xs text-[--amber] font-medium">2 en attente</p>
            <Link href="/app/dashboard/member/tasks" className="mt-3 flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--text-secondary] transition">
              Voir toutes <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Processes */}
        <Card className="border-[--border] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[--text-secondary]">
              <Workflow className="h-4 w-4 text-[--text-muted]" />
              Processus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[--text-primary]">{processes.length}</p>
            <p className="mt-1 text-xs text-[--text-muted]">dans ce workspace</p>
            <Link href="/app/dashboard/member/processes" className="mt-3 flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--text-secondary] transition">
              Voir tous <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-[--border] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[--text-secondary]">
              <Bell className="h-4 w-4 text-[--text-muted]" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[--text-primary]">{MOCK_NOTIFICATIONS.length}</p>
            <p className="mt-1 text-xs text-[--text-muted]">non lues</p>
          </CardContent>
        </Card>

        {/* Assistant */}
        <Card className="border-[--border] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[--text-secondary]">
              <MessageSquare className="h-4 w-4 text-[--text-muted]" />
              Assistant IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[--text-muted] mt-1 leading-relaxed">Posez vos questions métier.</p>
            <Link href="/app/dashboard/member/assistant" className="mt-3 flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--text-secondary] transition">
              Ouvrir <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent processes */}
        <Card className="border-[--border] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[--text-secondary]">
              <Workflow className="h-4 w-4 text-[--text-muted]" />
              Processus récents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {processes.length === 0 ? (
              <p className="text-sm text-[--text-muted]">Aucun processus dans votre workspace.</p>
            ) : (
              processes.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-[--border-subtle] bg-[--bg-hover] px-3 py-2.5">
                  <div className="h-2 w-2 rounded-full bg-[--text-muted] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[--text-secondary] truncate">{p.name}</p>
                    {p.domain?.name && <p className="text-xs text-[--text-muted]">{p.domain.name}</p>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-[--border] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[--text-secondary]">
              <Bell className="h-4 w-4 text-[--text-muted]" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_NOTIFICATIONS.map((notif) => (
              <div key={notif.id} className="flex items-start gap-3 rounded-xl border border-[--border-subtle] bg-[--bg-hover] px-3 py-2.5">
                <div className="mt-1 h-2 w-2 rounded-full bg-[--blue] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[--text-secondary]">{notif.text}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[--text-muted]">
                    <Clock className="h-2.5 w-2.5" />
                    {notif.time}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
