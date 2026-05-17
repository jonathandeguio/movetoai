import type { ReactNode } from "react";
import type { Route } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/navigation/app-sidebar";
import { AppTopbar } from "@/components/navigation/app-topbar";
import { GettingStarted } from "@/components/guide/GettingStarted";
import { NavigationProgress } from "@/components/navigation/NavigationProgress";
import { AriaButton }       from "@/components/aria/AriaButton";
import { AriaPanel }        from "@/components/aria/AriaPanel";
import { AriaNotification } from "@/components/aria/AriaNotification";
import { getCurrentWorkspaceContext } from "@/lib/current-workspace";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { hasCompletedProcessFocusOnboarding } from "@/modules/workspace/server/process-focus-onboarding";
import type { AppNavKey } from "@/lib/navigation";

const ADMIN_ROLES = ["WORKSPACE_ADMIN"] as const;

const CORE_NAV_KEYS: AppNavKey[] = [
  "overview", "portfolio", "value", "domains",
  "opportunities", "useCases", "processes",
  "governance", "analytics",
  // Knowledge section
  "knowledgeProcesses", "knowledgeCapabilities", "knowledgeApplications",
  // Insights section
  "insightsMaturity", "insightsDependencyGraph", "insightsDataQuality", "insightsRelationships",
  "insightsTechRadar", "insightsBriefing",
  // Sprint 3
  "surveys", "governanceAttestations", "governanceDecisions",
  // Sprint 4
  "copilot", "scenarios", "roiDashboard", "roadmap", "governanceRisks",
  "settings",
  // Compliance
  "compliance",
  // Help
  "help",
];

/** Legacy userFunction values from accounts created before the 4-role migration. */
const LEGACY_FUNCTION_MAP: Record<string, string> = {
  executive:      "transformation_manager",
  ai_lead:        "transformation_manager",
  business_owner: "transformation_manager",
  other:          "transformation_manager",
  data_it:        "enterprise_architect",
  it_manager:     "enterprise_architect",
  consultant:     "enterprise_architect",
};

function computeVisibleNavKeys(
  roleCode: string | null | undefined,
  rawUserFunction: string | null | undefined
): AppNavKey[] {
  // Normalize legacy userFunction values
  const userFunction = rawUserFunction
    ? (LEGACY_FUNCTION_MAP[rawUserFunction] ?? rawUserFunction)
    : null;

  const keys: AppNavKey[] = [...CORE_NAV_KEYS];

  // Workspace Admins get all admin items + their dashboard
  if (roleCode && (ADMIN_ROLES as readonly string[]).includes(roleCode)) {
    keys.push(
      "workspaceAdminDashboard",
      "adminQuickStart",
      "adminTeam",
      "adminProcesses",
      "adminAnalytics",
      "adminSettings",
      "adminBilling",
      "adminIntegrations",
      "adminIngestion",
      "adminWebhooks",
      "adminAudit"
    );
  }

  // Role-based dashboards by userFunction
  if (userFunction === "transformation_manager") {
    keys.push("transformationManagerDashboard");
  } else if (userFunction === "enterprise_architect") {
    keys.push("enterpriseArchitectDashboard");
  }

  // Keep legacy dashboard keys for accounts that still reference old accountType values
  if (rawUserFunction === "executive") {
    keys.push("executiveDashboard");
  } else if (rawUserFunction === "it_manager") {
    keys.push("techDashboard");
  } else if (rawUserFunction === "consultant") {
    keys.push("consultingDashboard");
  }

  return keys;
}

export const dynamic = "force-dynamic";

export default async function ProductLayout({
  children
}: {
  children: ReactNode;
}) {
  const { session, workspace, subscriptionPlan, role, user } = await getCurrentWorkspaceContext({
    requireMembership: true
  });

  // Platform Admins bypass workspace layout and go directly to /platform-admin
  const userExt = user as typeof user & { isPlatformAdmin?: boolean; userFunction?: string | null };
  if (userExt.isPlatformAdmin) {
    redirect("/admin" as Route);
  }

  // Compute visible nav items and resolve userFunction early (needed for onboarding redirect too)
  const prefs = user.preferences as Record<string, unknown> | null;
  const rawUserFunction = userExt.userFunction
    ?? (typeof prefs?.userFunction === "string" ? prefs.userFunction : null)
    // backward compat: some accounts stored persona in accountType
    ?? (typeof prefs?.accountType === "string" ? prefs.accountType : null);

  if (workspace?.id && session.user?.id) {
    // All users now go through process-focus onboarding (executive-setup is retired)
    const done = await hasCompletedProcessFocusOnboarding(session.user.id);
    if (!done) redirect("/onboarding/process-focus" as Route);
  }

  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const workspaceName = workspace?.name ?? messages.app.shell.noWorkspace;
  const planName = subscriptionPlan?.name ?? messages.common.labels.free;
  const userLabel = session.user?.name ?? session.user?.email ?? "";

  const visibleNavKeys = computeVisibleNavKeys(role?.code, rawUserFunction);

  return (
    <div className="min-h-screen bg-[--bg-secondary] lg:flex">
      <Suspense>
        <NavigationProgress />
      </Suspense>
      <AppSidebar planName={planName} workspaceName={workspaceName} visibleNavKeys={visibleNavKeys} />
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
      <GettingStarted />
      {/* Aria — présente sur toutes les pages authentifiées */}
      <AriaButton />
      <AriaPanel />
      <AriaNotification />
    </div>
  );
}
