// components/aria/AriaNotification.tsx
// Notification proactive d'Aria — insight détecté en arrière-plan.
// Apparaît en bas à gauche, au-dessus de la bulle Aria.

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter }                         from "next/navigation";
import type { Route }                        from "next";
import { AriaAvatar }                        from "./AriaAvatar";
import { useAriaStore }                      from "@/store/aria-store";

interface Notification {
  id:           string;
  message:      string;
  action_label?: string;
  action_url?:  string;
}

export function AriaNotification() {
  const router              = useRouter();
  const { isOpen }          = useAriaStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Charger les recommandations proactives au montage
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res  = await fetch("/api/aria/recommendations");
        if (!res.ok || cancelled) return;
        const data = await res.json() as { recommendations?: Notification[] };
        if (!cancelled && data.recommendations?.length) {
          setNotifications(data.recommendations.slice(0, 1)); // 1 à la fois
        }
      } catch { /* silencieux */ }
    };

    // Délai avant le premier check (ne pas bloquer le rendu)
    const timer = setTimeout(() => void load(), 4000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    void fetch("/api/aria/dismiss", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suggestion_id: id }),
    }).catch(() => {});
  }, []);

  const handleAction = useCallback((notif: Notification) => {
    dismiss(notif.id);
    if (notif.action_url) router.push(notif.action_url as Route);
  }, [dismiss, router]);

  // Masquer si panel Aria est ouvert
  if (isOpen || notifications.length === 0) return null;

  const notif = notifications[0]!;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position:       "fixed",
        bottom:         90,
        right:          24,
        zIndex:         9996,
        width:          300,
        background:     "#0a0e1a",
        border:         "1px solid rgba(110,231,183,0.22)",
        borderLeft:     "3px solid #6ee7b7",
        borderRadius:   10,
        padding:        "12px 14px",
        boxShadow:      "0 8px 40px rgba(0,0,0,0.55)",
        animation:      "aria-notif-in 350ms cubic-bezier(0.22,1,0.36,1)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <AriaAvatar size={18} animated />
        <span style={{
          fontSize: 10, fontWeight: 700, color: "#6ee7b7",
          textTransform: "uppercase", letterSpacing: "0.07em",
        }}>
          Aria · Insight
        </span>
        <button
          type="button"
          onClick={() => dismiss(notif.id)}
          aria-label="Fermer"
          style={{
            marginLeft: "auto", background: "none", border: "none",
            color: "rgba(200,202,216,0.30)", cursor: "pointer",
            fontSize: 16, lineHeight: 1, padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>

      {/* Message */}
      <p style={{
        fontSize: 12, color: "rgba(200,202,216,0.82)",
        lineHeight: 1.6, margin: "0 0 8px",
      }}>
        {notif.message}
      </p>

      {/* Action */}
      {notif.action_label && (
        <button
          type="button"
          onClick={() => handleAction(notif)}
          style={{
            background:   "rgba(110,231,183,0.10)",
            border:       "1px solid rgba(110,231,183,0.22)",
            borderRadius: 6,
            padding:      "4px 10px",
            fontSize:     11,
            fontWeight:   600,
            color:        "#6ee7b7",
            cursor:       "pointer",
            transition:   "background 150ms ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(110,231,183,0.18)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(110,231,183,0.10)"; }}
        >
          {notif.action_label} →
        </button>
      )}

      <style>{`
        @keyframes aria-notif-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
