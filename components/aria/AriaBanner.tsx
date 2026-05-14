// components/aria/AriaBanner.tsx
// Bannière contextuelle proactive — apparaît en haut du contenu selon la config de la page.

"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname }                  from "next/navigation";
import { AriaAvatar }                   from "./AriaAvatar";
import { ARIA_PAGE_CONFIGS }            from "@/lib/aria/page-configs";
import type { PageContext }             from "@/lib/aria/page-configs";

// Clé localStorage pour ne pas re-afficher une bannière déjà vue dans cette session
const SESSION_KEY = "aria_banners_seen";

function getSeenSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function markSeen(key: string) {
  try {
    const seen = getSeenSet();
    seen.add(key);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...seen]));
  } catch { /* ignore */ }
}

export function AriaBanner() {
  const pathname = usePathname();

  const [message,   setMessage]   = useState<string | null>(null);
  const [visible,   setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Reset lors d'un changement de page
  const prevPathRef = useRef<string>("");
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    setDismissed(false);
    setVisible(false);
    setMessage(null);
  }, [pathname]);

  useEffect(() => {
    if (dismissed) return;

    const config = ARIA_PAGE_CONFIGS[pathname];
    if (!config || config.banner_trigger === "never") return;

    // Bannière déjà vue dans cette session → skip
    const seenKey = `${pathname}:banner`;
    if (config.banner_trigger === "first_visit" && getSeenSet().has(seenKey)) return;

    fetch(`/api/aria/context?page=${encodeURIComponent(pathname)}`)
      .then((r) => r.json() as Promise<PageContext>)
      .then((ctx) => {
        // Pour "empty_state", n'afficher que si AUCUNE donnée n'existe
        if (config.banner_trigger === "empty_state") {
          const hasData = Object.values(ctx).some((v) => typeof v === "number" && v > 0);
          if (hasData) return;
        }

        const msg = config.banner_message(ctx);
        if (!msg) return;

        setMessage(msg);
        const timer = setTimeout(() => {
          setVisible(true);
          if (config.banner_trigger === "first_visit") markSeen(seenKey);
        }, 700);

        return () => clearTimeout(timer);
      })
      .catch(() => {});
  }, [pathname, dismissed]);

  if (!visible || !message || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display:      "flex",
        alignItems:   "flex-start",
        gap:          12,
        padding:      "12px 16px",
        marginBottom: 20,
        background:   "rgba(110,231,183,0.05)",
        border:       "1px solid rgba(110,231,183,0.16)",
        borderLeft:   "3px solid #6ee7b7",
        borderRadius: 10,
        animation:    "aria-banner-in 300ms ease",
      }}
    >
      {/* Avatar */}
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        <AriaAvatar size={20} />
      </div>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display:       "inline",
            fontSize:      11,
            fontWeight:    700,
            color:         "#6ee7b7",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginRight:   8,
          }}
        >
          Aria
        </span>
        <span style={{ fontSize: 13, color: "rgba(200,202,216,0.88)", lineHeight: 1.65 }}>
          {message}
        </span>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(() => setDismissed(true), 250);
        }}
        aria-label="Fermer le message Aria"
        style={{
          background: "none",
          border:     "none",
          color:      "rgba(200,202,216,0.30)",
          cursor:     "pointer",
          fontSize:   18,
          lineHeight: 1,
          padding:    "0 2px",
          flexShrink: 0,
          transition: "color 150ms ease",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c8cad8"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,202,216,0.30)"; }}
      >
        ×
      </button>

      <style>{`
        @keyframes aria-banner-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
