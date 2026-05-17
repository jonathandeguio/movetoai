// components/aria/AriaTooltip.tsx
// Tooltip éducatif d'Aria — icône "?" verte sur les éléments complexes.
// Survol → explication contextuelle envoyée automatiquement à Aria.

"use client";

import { useState, useRef, useCallback } from "react";
import { useAria }                        from "@/hooks/useAria";
import { AriaAvatar }                     from "./AriaAvatar";

interface AriaTooltipProps {
  /** Question pré-formulée envoyée à Aria au clic */
  query: string;
  /** Taille de l'icône (défaut 14) */
  size?: number;
  /** Position du tooltip (défaut "top") */
  position?: "top" | "bottom" | "left" | "right";
}

export function AriaTooltip({ query, size = 14, position = "top" }: AriaTooltipProps) {
  const [visible, setVisible] = useState(false);
  const { open, sendMessage } = useAria();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const showTooltip = () => {
    timerRef.current = setTimeout(() => setVisible(true), 400);
  };

  const hideTooltip = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  const handleClick = useCallback(() => {
    hideTooltip();
    open();
    setTimeout(() => void sendMessage(query), 320);
  }, [open, sendMessage, query]);

  const tooltipStyles: React.CSSProperties = {
    position:   "absolute",
    zIndex:     9990,
    background: "#0a0e1a",
    border:     "1px solid rgba(110,231,183,0.25)",
    borderRadius: 8,
    padding:    "8px 12px",
    minWidth:   180,
    maxWidth:   260,
    fontSize:   12,
    color:      "rgba(200,202,216,0.88)",
    lineHeight: 1.55,
    whiteSpace: "normal",
    boxShadow:  "0 8px 32px rgba(0,0,0,0.45)",
    animation:  "aria-tooltip-in 150ms ease",
    pointerEvents: "none",
    ...(position === "top"    && { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" }),
    ...(position === "bottom" && { top: "calc(100% + 6px)",   left: "50%", transform: "translateX(-50%)" }),
    ...(position === "left"   && { right: "calc(100% + 6px)", top: "50%",  transform: "translateY(-50%)" }),
    ...(position === "right"  && { left:  "calc(100% + 6px)", top: "50%",  transform: "translateY(-50%)" }),
  };

  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {/* Icône déclencheur */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Demander à Aria"
        style={{
          display:        "inline-flex",
          alignItems:     "center",
          justifyContent: "center",
          width:          size + 4,
          height:         size + 4,
          borderRadius:   "50%",
          border:         "1px solid rgba(110,231,183,0.30)",
          background:     "rgba(110,231,183,0.06)",
          color:          "#6ee7b7",
          cursor:         "pointer",
          fontSize:       size - 2,
          fontWeight:     700,
          lineHeight:     1,
          transition:     "background 150ms ease, border-color 150ms ease",
          flexShrink:     0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(110,231,183,0.14)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(110,231,183,0.55)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(110,231,183,0.06)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(110,231,183,0.30)";
        }}
      >
        ?
      </button>

      {/* Tooltip */}
      {visible && (
        <span style={tooltipStyles}>
          <span
            style={{
              display:       "flex",
              alignItems:    "center",
              gap:           5,
              marginBottom:  4,
              fontSize:      10,
              fontWeight:    700,
              color:         "#6ee7b7",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <AriaAvatar size={12} />
            Aria peut vous expliquer
          </span>
          <span style={{ fontSize: 11, color: "rgba(200,202,216,0.70)" }}>
            Cliquez pour demander à Aria →
          </span>
        </span>
      )}

      <style>{`
        @keyframes aria-tooltip-in {
          from { opacity: 0; transform: translateX(-50%) translateY(3px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </span>
  );
}
