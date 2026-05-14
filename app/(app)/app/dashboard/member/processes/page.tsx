import { Workflow, Eye } from "lucide-react";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { processRepo }                from "@/lib/repositories/process.repo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MemberProcessesPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const processes = workspace?.id
    ? await processRepo.findByWorkspace(workspace.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-[--text-primary]">Processus de mon équipe</h1>
        <p className="text-sm text-[--text-muted]">
          {processes.length} processus visibles dans ce workspace — lecture seule.
        </p>
      </div>

      {processes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[--border] bg-[--bg-card] px-6 py-16 text-center">
          <Workflow className="mx-auto h-8 w-8 text-[--text-muted] mb-3" />
          <p className="text-sm font-medium text-[--text-muted]">Aucun processus dans ce workspace.</p>
          <p className="text-xs text-[--text-muted] mt-1">Votre responsable ajoutera des processus prochainement.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {processes.map((p) => (
            <Card key={p.id} className="border-[--border] shadow-sm hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[--text-secondary] leading-snug">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.description && (
                  <p className="text-xs text-[--text-muted] line-clamp-2 leading-relaxed">{p.description}</p>
                )}
                <div className="space-y-1.5">
                  {p.domain?.name && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[--text-muted] w-14 shrink-0">Domaine</span>
                      <span className="rounded border border-[--border] bg-[--bg-hover] px-1.5 py-0.5 text-[10px] text-[--text-secondary]">
                        {p.domain.name}
                      </span>
                    </div>
                  )}
                  {p.owner?.name && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[--text-muted] w-14 shrink-0">Pilote</span>
                      <span className="text-[10px] text-[--text-secondary]">{p.owner.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[--text-muted]">
                  <Eye className="h-3 w-3" />
                  Lecture seule
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
