import { redirect } from "next/navigation";

import { TeamSetupForm } from "@/components/onboarding/TeamSetupForm";
import { getCurrentWorkspaceContext } from "@/server/auth";

export default async function TeamSetupPage() {
  const { workspace } = await getCurrentWorkspaceContext({ requireMembership: true });
  if (!workspace?.id) redirect("/onboarding");

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

      {/* Step indicator — steps 1 & 2 done, step 3 active */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem" }}>
        {[1, 2].map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--green)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#fff",
            }}>
              ✓
            </div>
            <div style={{ width: 32, height: 2, background: "var(--green)", borderRadius: 2 }} />
          </div>
        ))}
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--green)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff",
        }}>
          3
        </div>
        <span style={{ fontSize: 13, color: "var(--text-tertiary)", marginLeft: 4 }}>
          Votre équipe
        </span>
      </div>

      {/* Form */}
      <div style={{ width: "100%", maxWidth: 480 }}>
        <TeamSetupForm />
      </div>
    </main>
  );
}
