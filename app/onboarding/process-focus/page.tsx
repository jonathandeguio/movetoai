import { redirect } from "next/navigation";

import { AIProcessFocusForm } from "@/components/onboarding/AIProcessFocusForm";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { getProcessFocusOnboardingData } from "@/modules/workspace/server/process-focus-onboarding";

export default async function ProcessFocusOnboardingPage() {
  const locale    = await getRequestLocale();
  const messages  = getMessages(locale);
  const { user, workspace } = await getCurrentWorkspaceContext({ requireMembership: true });

  if (!workspace?.id) redirect("/onboarding");

  const onboardingData = await getProcessFocusOnboardingData(user.id, workspace.id);
  if (onboardingData.isCompleted) redirect("/app");

  const aiFlow = messages.onboarding.processFocus.aiFlow;

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "3rem 1rem 4rem",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 26,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.02em",
        }}>
          move<span style={{ color: "var(--green)" }}>.</span>ai
        </span>
      </div>

      {/* Step indicator */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: "1.75rem",
      }}>
        {/* Step 1 — done */}
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--green)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff",
        }}>
          ✓
        </div>
        <div style={{ width: 32, height: 2, background: "var(--green)", borderRadius: 2 }} />
        {/* Step 2 — active */}
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--green)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff",
        }}>
          2
        </div>
        <span style={{ fontSize: 13, color: "var(--text-tertiary)", marginLeft: 4 }}>
          Vos priorités IA
        </span>
      </div>

      {/* Form */}
      <div style={{ width: "100%", maxWidth: 560 }}>
        <AIProcessFocusForm
          userFunction={onboardingData.userFunction}
          companySize={onboardingData.companySize}
          copy={{
            domainsTitle:            aiFlow.domainsTitle,
            domainsSubtitle:         aiFlow.domainsSubtitle,
            domainsConfirm:          aiFlow.domainsConfirm,
            domainsMin:              aiFlow.domainsMin,
            loadingTitle:            aiFlow.loadingTitle,
            loadingSubtitle:         aiFlow.loadingSubtitle,
            recommendationsTitle:    aiFlow.recommendationsTitle,
            recommendationsSubtitle: aiFlow.recommendationsSubtitle,
            profileLabel:            aiFlow.profileLabel,
            gainLabel:               aiFlow.gainLabel,
            complexityLabel:         aiFlow.complexityLabel,
            complexity:              aiFlow.complexity,
            confirmButton:           aiFlow.confirmButton,
            selectAll:               aiFlow.selectAll,
            domains:                 aiFlow.domains,
            errors:                  aiFlow.errors,
          }}
        />
      </div>
    </main>
  );
}
