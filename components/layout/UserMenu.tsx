"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

import { LogoutModal } from "@/components/auth/LogoutModal";

type UserMenuProps = {
  userLabel:     string;
  roleLabel?:    string;
  userInitials?: string;
};

export function UserMenu({ userLabel, roleLabel, userInitials }: UserMenuProps) {
  const [isOpen,       setIsOpen]       = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const derivedInitials =
    userLabel
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";
  const initials = userInitials ?? derivedInitials;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    try {
      const bc = new BroadcastChannel("mta-auth");
      bc.onmessage = (e) => {
        if (e.data?.type === "LOGOUT") window.location.href = "/login?logout=true";
      };
      return () => bc.close();
    } catch {
      const handler = (e: StorageEvent) => {
        if (e.key === "mta-logout") window.location.href = "/login?logout=true";
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }
  }, []);

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "0.5rem",
          padding:      "0.375rem 0.75rem",
          borderRadius: "var(--r-lg)",
          border:       "1px solid var(--border)",
          background:   "var(--bg-card)",
          cursor:       "pointer",
          transition:   "border-color var(--t-fast), background var(--t-fast)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
          (e.currentTarget as HTMLButtonElement).style.background  = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLButtonElement).style.background  = "var(--bg-card)";
        }}
      >
        <span
          style={{
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            width:           "28px",
            height:          "28px",
            borderRadius:    "50%",
            background:      "var(--green-dim)",
            border:          "1px solid var(--green-border)",
            fontSize:        "11px",
            fontWeight:      600,
            color:           "var(--green)",
          }}
        >
          {initials}
        </span>
        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
          {userLabel}
        </span>
        <ChevronDown
          size={13}
          style={{
            color:      "var(--text-muted)",
            transform:  isOpen ? "rotate(180deg)" : "none",
            transition: "transform var(--t-fast)",
          }}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          style={{
            position:     "absolute",
            right:        0,
            top:          "100%",
            marginTop:    "6px",
            width:        "220px",
            borderRadius: "var(--r-lg)",
            border:       "1px solid var(--border)",
            background:   "var(--bg-secondary)",
            zIndex:       50,
            overflow:     "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding:      "0.75rem 1rem",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              {userLabel}
            </p>
            {roleLabel && (
              <p style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "2px" }}>
                {roleLabel}
              </p>
            )}
          </div>

          {/* Links */}
          <div style={{ padding: "0.25rem 0" }}>
            {[
              { href: "/app/settings/profile", icon: User,     label: "Mon profil"  },
              { href: "/app/settings",         icon: Settings, label: "Paramètres"  },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href as `/${string}`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        "0.5rem",
                  padding:    "0.5rem 1rem",
                  fontSize:   "13px",
                  color:      "var(--text-secondary)",
                  transition: "background var(--t-fast), color var(--t-fast)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)";
                  (e.currentTarget as HTMLAnchorElement).style.color      = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color      = "var(--text-secondary)";
                }}
              >
                <Icon size={14} style={{ color: "var(--text-muted)" }} />
                {label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "0.25rem 0" }}>
            <button
              type="button"
              role="menuitem"
              onClick={() => { setIsOpen(false); setIsLogoutOpen(true); }}
              style={{
                display:    "flex",
                width:      "100%",
                alignItems: "center",
                gap:        "0.5rem",
                padding:    "0.5rem 1rem",
                fontSize:   "13px",
                color:      "var(--red)",
                background: "transparent",
                border:     "none",
                cursor:     "pointer",
                transition: "background var(--t-fast)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--red-dim)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <LogOut size={14} />
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </div>
  );
}
