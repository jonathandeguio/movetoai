import type { ReactNode } from "react";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/navigation/app-sidebar";
import { AppTopbar } from "@/components/navigation/app-topbar";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { hasCompletedProcessFocusOnboarding } from "@/modules/workspace/server/process-focus-onboarding";

export const dynamic = "force-dynamic";

export default async function ProductLayout({
  children
}: {
  children: ReactNode;
}) {
  const { session, workspace, subscriptionPlan, role } = await getCurrentWorkspaceContext({
    requireMembership: true
  });

  if (workspace?.id && session.user?.id) {
    const hasCompletedOnboarding = await hasCompletedProcessFocusOnboarding(session.user.id);

    if (!hasCompletedOnboarding) {
      redirect("/onboarding/process-focus" as Route);
    }
  }

  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const workspaceName = workspace?.name ?? messages.app.shell.noWorkspace;
  const planName = subscriptionPlan?.name ?? messages.common.labels.free;
  const userLabel = session.user?.name ?? session.user?.email ?? "";

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <AppSidebar planName={planName} workspaceName={workspaceName} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppTopbar
          title={messages.meta.title}
          subtitle={messages.app.overview.subtitle}
          planName={planName}
          workspaceName={workspaceName}
          userLabel={userLabel ?? ""}
          roleLabel={role?.name ?? session.user?.roleName ?? ""}
        />
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
