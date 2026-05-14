// components/aria/AriaButton.tsx
// Bulle flottante permanente en bas à droite — ouvre/ferme le panel Aria.

"use client";

import { useAria }     from "@/hooks/useAria";
import { AriaAvatar }  from "./AriaAvatar";

export function AriaButton() {
  const { isOpen, unreadCount, toggle } = useAria();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        unreadCount > 0
          ? `Aria — ${unreadCount} recommandation(s) non lue(s)`
          : "Aria — Assistante IA"
      }
      aria-expanded={isOpen}
      style={{
        position:       "fixed",
        bottom:         24,
        right:          24,
        zIndex:         9999,
        width:          52,
        height:         52,
        borderRadius:   "50%",
        border:         isOpen
          ? "2px solid #6ee7b7"
          : "2px solid rgba(110,231,183,0.28)",
        background:     isOpen
          ? "rgba(110,231,183,0.12)"
          : "rgba(6,8,16,0.90)",
        cursor:         "pointer",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        boxShadow:      isOpen
          ? "0 0 0 4px rgba(110,231,183,0.10), 0 4px 24px rgba(0,0,0,0.45)"
          : "0 4px 24px rgba(0,0,0,0.45)",
        transition:     "border-color 200ms ease, background 200ms ease, box-shadow 200ms ease, transform 200ms ease",
        backdropFilter: "blur(10px)",
        transform:      isOpen ? "scale(1.06)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        if (!isOpen) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(110,231,183,0.60)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(110,231,183,0.28)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }
      }}
    >
      <AriaAvatar size={26} animated={isOpen} />

      {/* Badge non-lus */}
      {unreadCount > 0 && !isOpen && (
        <span
          aria-hidden="true"
          style={{
            position:       "absolute",
            top:            -4,
            right:          -4,
            background:     "#f87171",
            color:          "#fff",
            borderRadius:   "50%",
            minWidth:       18,
            height:         18,
            fontSize:       10,
            fontWeight:     700,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            border:         "2px solid #060810",
            lineHeight:     1,
            padding:        "0 3px",
          }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
