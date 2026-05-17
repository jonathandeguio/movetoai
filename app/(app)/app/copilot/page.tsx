import { requireAnyPermission } from "@/server/permissions";
import { CopilotChat } from "@/components/copilot/CopilotChat";
import { AriaBanner }  from "@/components/aria/AriaBanner";

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
  await requireAnyPermission(["opportunities.manage", "analytics.view"]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      <AriaBanner />
      {/* Header */}
      <div
        style={{
          borderRadius: "1.5rem",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              display: "inline-flex",
              borderRadius: "9999px",
              border: "1px solid var(--green-border)",
              background: "var(--green-dim)",
              padding: "2px 12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--green)",
            }}
          >
            IA
          </span>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Copilot IA
          </h1>
        </div>
        <p
          style={{
            marginTop: "0.375rem",
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
          }}
        >
          Posez des questions sur votre transformation IA, obtenez des synthèses de votre portefeuille
          et des recommandations actionnables basées sur vos données.
        </p>
      </div>

      {/* Chat — fills remaining height */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <CopilotChat />
      </div>
    </div>
  );
}
