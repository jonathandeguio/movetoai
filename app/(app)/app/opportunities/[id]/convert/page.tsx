import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getCurrentWorkspaceContext } from "@/server/auth";
import { opportunityRepo } from "@/lib/repositories/opportunity.repo";
import { ConversionWizard } from "@/components/use-cases/ConversionWizard";

type PageProps = { params: Promise<{ id: string }> };

export default async function ConvertOpportunityPage({ params }: PageProps) {
  const { id } = await params;
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  const opportunity = await opportunityRepo.findByIdForConvert(id, workspace!.id);

  if (!opportunity) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      {/* Back link */}
      <div className="flex items-center gap-2">
        <Link
          href={`/app/opportunities/${id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[--border] bg-[--bg-card] text-[--text-muted] hover:text-[--text-secondary] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs text-[--text-muted]">Opportunité</p>
          <p className="text-sm font-medium text-[--text-primary]">{opportunity.title}</p>
        </div>
      </div>

      {/* Wizard */}
      <ConversionWizard
        opportunity={{
          id: opportunity.id,
          title: opportunity.title,
          domainLabel: opportunity.domainLabel,
          gainEstimate: opportunity.gainEstimate,
        }}
      />
    </div>
  );
}
