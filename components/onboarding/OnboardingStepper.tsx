"use client";

interface Step {
  id: number;
  label: string;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep: number; // 1-based
}

export function OnboardingStepper({ steps, currentStep }: OnboardingStepperProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%", maxWidth: 520, margin: "0 auto 2rem" }}>
      {steps.map((step, idx) => {
        const done    = step.id < currentStep;
        const active  = step.id === currentStep;
        const lineAfter = idx < steps.length - 1;

        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center", flex: lineAfter ? "1" : "0 0 auto" }}>
            {/* Circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600,
                transition: "all 0.2s",
                background: done || active ? "var(--green)" : "var(--bg-card)",
                color: done || active ? "#fff" : "var(--text-muted)",
                border: `2px solid ${done || active ? "var(--green)" : "var(--border)"}`,
                flexShrink: 0,
              }}>
                {done ? "✓" : step.id}
              </div>
              <span style={{
                fontSize: 10, fontWeight: active ? 600 : 400,
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                whiteSpace: "nowrap",
                display: "block",
              }}>
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {lineAfter && (
              <div style={{
                flex: 1, height: 2,
                margin: "0 4px",
                marginBottom: 16, // align with circle center
                background: done ? "var(--green)" : "var(--border)",
                transition: "background 0.2s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
