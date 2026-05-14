import { redirect } from "next/navigation";
import { UserPlus, Shield, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { membershipRepo } from "@/lib/repositories/membership.repo";
import { requireAnyPermission } from "@/server/permissions";
import { TeamInviteForm } from "@/components/admin/TeamInviteForm";
import { TeamMemberActions } from "@/components/admin/TeamMemberActions";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ROLE_COLORS: Record<string, string> = {
  WORKSPACE_ADMIN:       "bg-[--blue-dim] text-[--blue] border-[--blue-border]",
  ENTERPRISE_ARCHITECT:  "bg-[--purple-dim] text-[--purple] border-[--purple-border]",
  TRANSFORMATION_MANAGER:"bg-[--amber-dim] text-[--amber] border-[--amber-border]",
};

export default async function AdminTeamPage() {
  await requireAnyPermission(["users.manage", "workspace.view"]);

  const { workspace, role } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

  const session = await auth();

  const canManage = role?.code === "WORKSPACE_ADMIN";

  const [memberships, availableRoles] = await Promise.all([
    membershipRepo.findByWorkspace(workspace.id),
    membershipRepo.findRoles(workspace.id),
  ]);

  const active  = memberships.filter((m) => m.status === "ACTIVE");
  const invited = memberships.filter((m) => m.status === "INVITED");

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">Gestion de l'équipe</h1>
          <p className="text-sm text-[--text-secondary]">
            {active.length} membre{active.length !== 1 ? "s" : ""} actif{active.length !== 1 ? "s" : ""}
            {invited.length > 0 && ` · ${invited.length} invitation${invited.length !== 1 ? "s" : ""} en attente`}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[--green]" />
            <span className="text-sm font-medium text-[--green]">Admin workspace</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        {/* Members list */}
        <div className="space-y-6">
          {/* Active members */}
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-[--text-muted]" />
                Membres actifs ({active.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {active.length === 0 && (
                <p className="text-sm text-[--text-muted]">Aucun membre actif.</p>
              )}
              {active.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--bg-hover] px-4 py-3">
                  {/* Avatar */}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[--green-dim] text-sm font-semibold text-[--green]">
                    {m.user.name
                      ? m.user.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
                      : (m.user.email?.[0]?.toUpperCase() ?? "?")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[--text-primary]">
                      {m.user.name ?? m.user.email}
                    </p>
                    {m.user.name && (
                      <p className="truncate text-xs text-[--text-muted]">{m.user.email}</p>
                    )}
                    {m.user.jobTitle && (
                      <p className="truncate text-xs text-[--text-muted]">{m.user.jobTitle}</p>
                    )}
                  </div>
                  {canManage ? (
                    <TeamMemberActions
                      membershipId={m.id}
                      currentRoleCode={m.role.code}
                      memberId={m.user.id}
                      currentUserId={session?.user?.id ?? ""}
                      availableRoles={availableRoles}
                      canManage={canManage}
                    />
                  ) : (
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        ROLE_COLORS[m.role.code] ?? "bg-[--bg-hover] text-[--text-secondary] border-[--border]"
                      }`}
                    >
                      {m.role.name}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending invitations */}
          {invited.length > 0 && (
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-[--text-muted]" />
                  Invitations en attente ({invited.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {invited.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border border-[--amber-border] bg-[--amber-dim] px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[--amber-dim] text-sm font-semibold text-[--amber]">
                      {m.user.email?.[0]?.toUpperCase() ?? "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[--text-primary]">{m.user.email}</p>
                      <p className="text-xs text-[--amber]">Invitation envoyée</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-[--amber-border] text-[--amber]">
                      {m.role.name}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invite form — only for admins */}
        {canManage && (
          <TeamInviteForm
            availableRoles={availableRoles.map((r) => ({ code: r.code, name: r.name }))}
          />
        )}
      </div>
    </div>
  );
}
