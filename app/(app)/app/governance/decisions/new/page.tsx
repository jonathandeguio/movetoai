"use client";

import type { Route } from "next";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ADRStatus = "proposed" | "accepted" | "superseded" | "deprecated";

interface FormErrors {
  title?: string;
  context?: string;
  decision?: string;
  rationale?: string;
  decisionDate?: string;
  form?: string;
}

const STATUS_OPTIONS: { value: ADRStatus; label: string }[] = [
  { value: "proposed", label: "Proposée" },
  { value: "accepted", label: "Acceptée" },
  { value: "superseded", label: "Remplacée" },
  { value: "deprecated", label: "Obsolète" },
];

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}
    >
      {children}
      {required && <span style={{ color: "var(--red, #ef4444)", marginLeft: "0.2rem" }}>*</span>}
    </label>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <span style={{ fontSize: "0.75rem", color: "var(--red, #ef4444)" }}>{error}</span>
  );
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  padding: "0.55rem 0.75rem",
  border: `1px solid ${hasError ? "var(--red, #ef4444)" : "var(--border)"}`,
  borderRadius: "0.5rem",
  background: "var(--bg-input, var(--bg-card))",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  lineHeight: 1.5,
});

const textareaStyle = (hasError: boolean): React.CSSProperties => ({
  ...inputStyle(hasError),
  minHeight: "120px",
  resize: "vertical",
  fontFamily: "inherit",
});

export default function NewDecisionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ADRStatus>("proposed");
  const [decisionDate, setDecisionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [context, setContext] = useState("");
  const [decision, setDecision] = useState("");
  const [rationale, setRationale] = useState("");
  const [consequences, setConsequences] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (title.trim().length < 2) newErrors.title = "Le titre est requis (min. 2 caractères).";
    if (!decisionDate) newErrors.decisionDate = "La date de décision est requise.";
    if (context.trim().length === 0) newErrors.context = "Le contexte est requis.";
    if (decision.trim().length === 0) newErrors.decision = "La décision est requise.";
    if (rationale.trim().length === 0) newErrors.rationale = "La justification est requise.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const body = {
        title: title.trim(),
        status,
        decisionDate: new Date(decisionDate).toISOString(),
        context: context.trim(),
        decision: decision.trim(),
        rationale: rationale.trim(),
        consequences: consequences.trim() || null,
      };

      const res = await fetch("/api/governance/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Erreur lors de la création.");
      }

      const created = await res.json() as { id: string };
      router.push(`/app/governance/decisions/${created.id}` as Route);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Erreur inconnue" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "820px" }}>
      {/* Back link */}
      <Link
        href={"/app/governance/decisions" as Route}
        style={{
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        ← Retour aux décisions
      </Link>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Nouvelle décision architecturale
        </h1>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Documentez une décision technique ou architecturale pour en assurer la traçabilité.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          borderRadius: "1rem",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Global error */}
        {errors.form && (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: "color-mix(in srgb, var(--red, #ef4444) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--red, #ef4444) 30%, transparent)",
              color: "var(--red, #ef4444)",
              fontSize: "0.85rem",
            }}
          >
            {errors.form}
          </div>
        )}

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <FieldLabel htmlFor="title" required>
            Titre
          </FieldLabel>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Adoption de PostgreSQL comme base de données principale"
            style={inputStyle(!!errors.title)}
          />
          <FieldError error={errors.title} />
        </div>

        {/* Status + Date in a row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <FieldLabel htmlFor="status" required>
              Statut
            </FieldLabel>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ADRStatus)}
              style={inputStyle(false)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <FieldLabel htmlFor="decisionDate" required>
              Date de décision
            </FieldLabel>
            <input
              id="decisionDate"
              type="date"
              value={decisionDate}
              onChange={(e) => setDecisionDate(e.target.value)}
              style={inputStyle(!!errors.decisionDate)}
            />
            <FieldError error={errors.decisionDate} />
          </div>
        </div>

        {/* Context */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <FieldLabel htmlFor="context" required>
            Contexte
          </FieldLabel>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Décrivez la situation, les contraintes et les besoins qui ont conduit à cette décision.
          </p>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: Notre équipe fait face à des limitations de performance avec notre base de données actuelle…"
            style={textareaStyle(!!errors.context)}
          />
          <FieldError error={errors.context} />
        </div>

        {/* Decision */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <FieldLabel htmlFor="decision" required>
            Décision
          </FieldLabel>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Décrivez la décision prise de manière claire et concise.
          </p>
          <textarea
            id="decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Ex: Nous adopterons PostgreSQL comme base de données relationnelle principale…"
            style={textareaStyle(!!errors.decision)}
          />
          <FieldError error={errors.decision} />
        </div>

        {/* Rationale */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <FieldLabel htmlFor="rationale" required>
            Justification
          </FieldLabel>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Expliquez pourquoi cette décision a été prise plutôt que d&apos;autres alternatives.
          </p>
          <textarea
            id="rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Ex: PostgreSQL offre de meilleures performances pour nos workloads…"
            style={textareaStyle(!!errors.rationale)}
          />
          <FieldError error={errors.rationale} />
        </div>

        {/* Consequences (optional) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <FieldLabel htmlFor="consequences">
            Conséquences{" "}
            <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optionnel)</span>
          </FieldLabel>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Décrivez les impacts attendus, positifs ou négatifs, de cette décision.
          </p>
          <textarea
            id="consequences"
            value={consequences}
            onChange={(e) => setConsequences(e.target.value)}
            placeholder="Ex: La migration des données existantes nécessitera 2 sprints…"
            style={textareaStyle(false)}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            paddingTop: "0.5rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.6rem 1.5rem",
              borderRadius: "0.5rem",
              background: loading ? "var(--border)" : "var(--green)",
              color: loading ? "var(--text-muted)" : "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "Enregistrement…" : "Enregistrer la décision"}
          </button>

          <Link
            href={"/app/governance/decisions" as Route}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              fontWeight: 500,
              fontSize: "0.875rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
