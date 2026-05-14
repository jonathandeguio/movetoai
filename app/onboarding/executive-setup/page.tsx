import type { Route } from "next";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { ExecutiveOnboardingForm } from "@/components/onboarding/ExecutiveOnboardingForm";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ExecutiveSetupPage() {
  const { workspace, user } = await getCurrentWorkspaceContext({
    requireMembership: true
  });

  // Already completed — skip to dashboard
  if (user.preferences && typeof user.preferences === "object") {
    const prefs = user.preferences as Record<string, unknown>;
    if (prefs.executiveOnboarding) {
      redirect("/app/dashboard/executive" as Route);
    }
  }

  const workspaceName = workspace?.name ?? "votre organisation";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-100 flex items-start justify-center p-6 pt-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Badge className="gap-1.5 border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 shadow-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              Vue Dirigeant
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Personnalisons votre dashboard
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            3 étapes pour configurer votre vision stratégique IA dans{" "}
            <span className="font-semibold text-slate-700">{workspaceName}</span>.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 shadow-sm">
          <ExecutiveOnboardingForm workspaceName={workspaceName} />
        </div>
      </div>
    </div>
  );
}
