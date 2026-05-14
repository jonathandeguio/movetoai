"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Plus, Users, X } from "lucide-react";

export function TeamSetupForm() {
  const [emails,              setEmails]              = useState<string[]>([]);
  const [emailInput,          setEmailInput]          = useState("");
  const [emailError,          setEmailError]          = useState("");
  const [emailNotifications,  setEmailNotifications]  = useState(true);
  const [weeklyDigest,        setWeeklyDigest]        = useState(true);
  const [isPending,           startTransition]        = useTransition();
  const [error,               setError]               = useState("");
  const router = useRouter();

  function addEmail() {
    const trimmed = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Adresse email invalide.");
      return;
    }
    if (emails.includes(trimmed)) {
      setEmailError("Cet email est déjà dans la liste.");
      return;
    }
    if (emails.length >= 10) {
      setEmailError("Maximum 10 invitations à la fois.");
      return;
    }
    setEmails((prev) => [...prev, trimmed]);
    setEmailInput("");
    setEmailError("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addEmail(); }
  }

  function handleSubmit(skip = false) {
    startTransition(() => {
      void (async () => {
        setError("");
        const res = await fetch("/api/onboarding/team-setup", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inviteEmails:       skip ? [] : emails,
            emailNotifications,
            weeklyDigest,
          }),
        });

        const payload = await res.json().catch(() => null) as {
          ok: boolean; redirectTo?: string;
        } | null;

        if (!res.ok || !payload?.ok) {
          setError("Une erreur est survenue. Réessayez.");
          return;
        }

        router.push((payload.redirectTo ?? "/app/admin/quick-start") as Route);
        router.refresh();
      })();
    });
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg-input, var(--bg-primary))",
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
    minWidth: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-xl, 16px)",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: 24,
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Users size={18} style={{ color: "var(--green)", flexShrink: 0 }} />
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Invitez votre équipe
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: "2px 0 0" }}>
            Optionnel — vous pouvez le faire plus tard depuis les paramètres.
          </p>
        </div>
      </div>

      {/* Invite input */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={labelStyle}>Adresses email des collaborateurs</span>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="email"
            placeholder="collaborateur@entreprise.fr"
            value={emailInput}
            onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
            onKeyDown={handleKeyDown}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={addEmail}
            aria-label="Ajouter"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 42, height: 42, flexShrink: 0,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-hover)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {emailError && (
          <p style={{ fontSize: 12, color: "var(--red)", margin: 0 }}>{emailError}</p>
        )}

        {/* Email chips */}
        {emails.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {emails.map((email) => (
              <span key={email} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                border: "1px solid var(--green-border)",
                background: "var(--green-dim)",
                fontSize: 12, fontWeight: 500, color: "var(--green)",
              }}>
                {email}
                <button
                  type="button"
                  onClick={() => setEmails((prev) => prev.filter((e) => e !== email))}
                  aria-label={`Retirer ${email}`}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Notification toggles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={labelStyle}>Préférences de notifications</span>

        {[
          {
            label:   "Notifications par email",
            hint:    "Alertes importantes sur votre workspace",
            value:   emailNotifications,
            toggle:  () => setEmailNotifications((v) => !v),
          },
          {
            label:   "Récapitulatif hebdomadaire",
            hint:    "Résumé de l'activité chaque lundi matin",
            value:   weeklyDigest,
            toggle:  () => setWeeklyDigest((v) => !v),
          },
        ].map(({ label, hint, value, toggle }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{label}</p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "2px 0 0" }}>{hint}</p>
            </div>
            {/* Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={value}
              onClick={toggle}
              style={{
                position: "relative",
                flexShrink: 0,
                width: 44, height: 24,
                borderRadius: 12,
                border: "none",
                background: value ? "var(--green)" : "var(--border)",
                cursor: "pointer",
                transition: "background 0.2s",
                padding: 0,
              }}
            >
              <span style={{
                position: "absolute",
                top: 3, left: value ? 23 : 3,
                width: 18, height: 18,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              }} />
            </button>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          fontSize: 13, color: "var(--red)",
        }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isPending}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "12px 20px",
            borderRadius: 10,
            background: "var(--green)", color: "#fff",
            fontWeight: 600, fontSize: 14,
            border: "none",
            cursor: isPending ? "wait" : "pointer",
            opacity: isPending ? 0.8 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {isPending
            ? <><Loader2 size={15} className="animate-spin" /> Enregistrement…</>
            : <>{emails.length > 0 ? `Inviter ${emails.length} collaborateur${emails.length > 1 ? "s" : ""} →` : "Terminer la configuration"} <ArrowRight size={15} /></>
          }
        </button>

        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={isPending}
          style={{
            background: "none", border: "none",
            cursor: isPending ? "not-allowed" : "pointer",
            fontSize: 13, color: "var(--text-tertiary)",
            padding: "6px 0", textAlign: "center",
          }}
        >
          Ignorer cette étape
        </button>
      </div>
    </div>
  );
}
