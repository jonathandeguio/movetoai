import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { workspaceRepo } from "@/lib/repositories/workspace.repo";

export const dynamic = "force-dynamic";

export default async function ExecutiveTeamPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const members = workspace?.id
    ? await workspaceRepo.findActiveMembers(workspace.id)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[--text-primary]">Équipe projet IA</h1>
        <p className="mt-1 text-sm text-[--text-muted]">
          Vue des membres actifs impliqués dans la transformation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => {
          const initials = (m.user.name ?? m.user.email ?? "?")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          const roleColor =
            m.role?.code === "WORKSPACE_ADMIN"
              ? "bg-[--purple-dim] text-[--purple]"
              : m.role?.code === "MEMBER"
              ? "bg-[--bg-hover] text-[--text-secondary]"
              : "bg-[--blue-dim] text-[--blue]";

          return (
            <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-[--border] bg-[--bg-card] p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--purple-dim] text-sm font-bold text-[--purple]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[--text-primary]">{m.user.name ?? "—"}</p>
                <p className="truncate text-xs text-[--text-muted]">{m.user.email}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleColor}`}>
                  {m.role?.name ?? "Membre"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[--border-strong] bg-[--bg-hover] px-6 py-12 text-center">
          <p className="text-sm text-[--text-muted]">Aucun membre actif dans ce workspace.</p>
        </div>
      )}

      <p className="text-xs text-[--text-muted]">
        Pour inviter des membres ou modifier les accès, contactez votre administrateur workspace.
      </p>
    </div>
  );
}
