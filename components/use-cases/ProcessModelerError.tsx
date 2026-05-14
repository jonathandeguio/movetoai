interface Props {
  message: string;
  onRetry?: () => void;
}

export function ProcessModelerError({ message, onRetry }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        background: "var(--bg-primary)",
        gap: 12,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--red-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          color: "var(--red)",
        }}
      >
        ⚠
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", maxWidth: 320 }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            border: "1px solid var(--green-border)",
            background: "var(--green-dim)",
            color: "var(--green)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
