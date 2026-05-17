import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

const STEPS = [
  { label: "Secteur",          href: "/app/onboarding/sector"        as Route },
  { label: "Certifications",   href: "/app/onboarding/certifications" as Route },
  { label: "Processus",        href: "/app/onboarding/processes"      as Route },
  { label: "Opportunités IA",  href: "/app/onboarding/opportunities"  as Route },
  { label: "Terminé",          href: "/app/onboarding/complete"       as Route },
];

export default function OnboardingLayout({
  children,
  // We can't directly get pathname in layout — steps indicator is decorative
}: {
  children: ReactNode;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 16px",
    }}>
      {/* Logo / brand */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/app" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", letterSpacing: -0.5 }}>
            Move to AI
          </span>
        </Link>
      </div>

      {/* Step indicator */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        marginBottom: 40,
        overflowX: "auto",
        maxWidth: 700,
        width: "100%",
      }}>
        {STEPS.map((step, i) => (
          <div key={step.href} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "2px solid var(--border)",
                background: "var(--bg-card)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, textAlign: "center", whiteSpace: "nowrap" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 1, flex: 1, background: "var(--border)", marginBottom: 18 }} />
            )}
          </div>
        ))}
      </div>

      {/* Page content */}
      <div style={{ width: "100%", maxWidth: 720 }}>
        {children}
      </div>
    </div>
  );
}
