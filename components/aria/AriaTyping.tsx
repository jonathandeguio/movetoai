// components/aria/AriaTyping.tsx
// Animation 3 points de frappe pendant qu'Aria génère une réponse.

export function AriaTyping() {
  return (
    <div
      role="status"
      aria-label="Aria rédige une réponse…"
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          5,
        padding:      "9px 14px",
        background:   "rgba(110,231,183,0.06)",
        border:       "1px solid rgba(110,231,183,0.14)",
        borderRadius: 10,
        width:        "fit-content",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width:       6,
            height:      6,
            borderRadius: "50%",
            background:  "#6ee7b7",
            display:     "inline-block",
            animation:   `aria-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            opacity:     0.4,
          }}
        />
      ))}
      <style>{`
        @keyframes aria-dot-bounce {
          0%, 80%, 100% { transform: scale(1);   opacity: 0.4; }
          40%            { transform: scale(1.4); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
