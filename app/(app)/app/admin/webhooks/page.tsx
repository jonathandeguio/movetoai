import { requirePermission } from "@/server/permissions";
import { webhookRepo } from "@/lib/repositories/webhook.repo";
import { WebhooksPageClient } from "@/components/admin/WebhooksPageClient";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  const { workspace } = await requirePermission("business-structure.manage");

  const webhooks = await webhookRepo.findByWorkspace(workspace!.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">Webhooks</h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            Recevez des notifications push vers vos systèmes externes lors d'événements clés.
          </p>
        </div>
      </div>

      <WebhooksPageClient initialWebhooks={webhooks} />
    </div>
  );
}
