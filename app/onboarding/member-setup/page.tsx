import { redirect } from "next/navigation";
import type { Route } from "next";

import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { MemberProfileForm } from "@/components/onboarding/MemberProfileForm";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberSetupPage() {
  const { session, workspace, user, role } = await getCurrentWorkspaceContext({
    requireMembership: true,
  });

  // Already completed — send to member dashboard
  if (user.preferences && typeof user.preferences === "object") {
    const prefs = user.preferences as Record<string, unknown>;
    if (prefs.memberOnboarding) {
      redirect("/app/dashboard/member" as Route);
    }
  }

  const workspaceName = workspace?.name ?? "votre équipe";
  const inviterName = session.user?.name ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Badge className="gap-1.5 border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              Invitation confirmée
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bienvenue dans l'équipe !</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Complétez votre profil en 1 minute pour accéder à votre espace.
          </p>
        </div>

        {/* Context card */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-4 text-sm text-slate-600 leading-relaxed shadow-sm">
          Vous rejoignez le workspace{" "}
          <span className="font-semibold text-slate-900">{workspaceName}</span>.{" "}
          {inviterName && (
            <>
              <span className="font-semibold text-slate-900">{inviterName}</span> vous attend !
            </>
          )}{" "}
          Votre accès est limité à votre périmètre assigné.
        </div>

        {/* Form */}
        <MemberProfileForm
          defaultName={user.name ?? ""}
          workspaceName={workspaceName}
        />
      </div>
    </div>
  );
}
