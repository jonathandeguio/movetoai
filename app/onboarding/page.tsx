import { redirect } from "next/navigation";
import type { Route } from "next";

import { getCurrentWorkspaceContext } from "@/server/auth";

export default async function OnboardingPage() {
  const { workspace } = await getCurrentWorkspaceContext();
  if (workspace) redirect("/app" as Route);
  // Route new users through the intelligent sector-based workspace setup wizard
  redirect("/onboarding/workspace-setup" as Route);
}
