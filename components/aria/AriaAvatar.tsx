// components/aria/AriaAvatar.tsx
// Avatar SVG d'Aria — étoile à 4 branches sur fond circulaire vert menthe.

export function AriaAvatar({
  size = 32,
  animated = false,
}: {
  size?: number;
  animated?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Halo extérieur */}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="rgba(110,231,183,0.07)"
        stroke="rgba(110,231,183,0.20)"
        strokeWidth="1"
      />
      {/* Cercle principal */}
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="rgba(110,231,183,0.10)"
        stroke="#6ee7b7"
        strokeWidth="1.5"
        style={animated ? { animation: "aria-avatar-pulse 2s ease-in-out infinite" } : undefined}
      />
      {/* Étoile à 4 branches */}
      <path
        d="M16 7.5 L17.1 14.9 L24.5 16 L17.1 17.1 L16 24.5 L14.9 17.1 L7.5 16 L14.9 14.9 Z"
        fill="#6ee7b7"
        opacity="0.92"
      />
      {/* Point central */}
      <circle cx="16" cy="16" r="1.8" fill="rgba(6,8,16,0.8)" />

      <style>{`
        @keyframes aria-avatar-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </svg>
  );
}
