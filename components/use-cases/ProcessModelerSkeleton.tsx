export function ProcessModelerSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "var(--bg-primary)",
      }}
    >
      {/* Toolbar skeleton */}
      <div
        style={{
          height: 44,
          background: "var(--bg-primary)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
        }}
      >
        {[48, 36, 36, 100, 80].map((w, i) => (
          <div
            key={i}
            style={{
              width: w,
              height: 24,
              borderRadius: 6,
              background: "rgba(255,255,255,0.06)",
              animation: `bpmnPulse 1.5s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Canvas skeleton */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
        }}
      >
        <div style={{ textAlign: "center", opacity: 0.4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "2px solid rgba(110,231,183,0.3)",
              borderTopColor: "var(--green)",
              animation: "bpmnSpin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Chargement du diagramme…
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bpmnSpin { to { transform: rotate(360deg); } }
        @keyframes bpmnPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
}
