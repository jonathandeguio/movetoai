"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import type { Route } from "next";
import { ArrowRight, Building2, Loader2 } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const COMPANY_SIZES = [
  { value: "pme",         label: "PME  (< 500 personnes)" },
  { value: "eti",         label: "ETI  (500 – 5 000 personnes)" },
  { value: "grand_groupe",label: "Grand groupe  (> 5 000 personnes)" },
] as const;

const SECTORS = [
  "Agriculture & Agroalimentaire",
  "Banque & Finance",
  "Commerce & Distribution",
  "Construction & Immobilier",
  "Éducation & Formation",
  "Énergie & Environnement",
  "Industrie & Manufacturing",
  "Logistique & Transport",
  "Média & Communication",
  "Santé & Pharma",
  "Services aux entreprises",
  "Technologie & SaaS",
  "Tourisme & Hôtellerie",
  "Secteur public",
  "Autre",
] as const;

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  companyName:   z.string().trim().min(2, "Requis — au moins 2 caractères"),
  workspaceName: z.string().trim().min(2, "Requis — au moins 2 caractères"),
  sector:        z.string().optional(),
  companySize:   z.enum(["pme", "eti", "grand_groupe"]).optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────

export function OnboardingForm() {
  const [error, setError]     = useState("");
  const [isPending, start]    = useTransition();
  const router                = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName:   "",
      workspaceName: "",
      sector:        "",
      companySize:   undefined,
    },
  });

  // Auto-fill workspace name from company name (only until user edits it manually)
  const companyName     = form.watch("companyName");
  const workspaceName   = form.watch("workspaceName");

  useEffect(() => {
    if (companyName.length >= 2 && !workspaceName) {
      form.setValue("workspaceName", companyName, { shouldValidate: false });
    }
  }, [companyName, workspaceName, form]);

  const onSubmit = (values: FormValues) => {
    start(() => {
      void (async () => {
        setError("");
        const res = await fetch("/api/onboarding", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName:   values.companyName,
            workspaceName: values.workspaceName,
            sector:        values.sector   || undefined,
            companySize:   values.companySize || undefined,
            // non-redundant defaults — already set at signup
            preferredLocale: "fr",
            accountType:     "enterprise",
          }),
        });

        const payload = await res.json().catch(() => null) as { code?: string } | null;

        if (!res.ok) {
          setError(
            payload?.code === "ALREADY_ONBOARDED"
              ? "Un espace de travail existe déjà pour ce compte."
              : "Une erreur est survenue, veuillez réessayer."
          );
          return;
        }

        router.push("/onboarding/process-focus" as Route);
        router.refresh();
      })();
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg-input, var(--bg-primary))",
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: 6,
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-xl, 16px)",
      padding: "2rem",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Building2 size={18} style={{ color: "var(--green)" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Votre entreprise
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0 }}>
          Ces informations permettent de personnaliser BluePilot pour votre contexte.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Company name */}
        <div>
          <label htmlFor="companyName" style={labelStyle}>
            Nom de l'entreprise <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <input
            id="companyName"
            style={inputStyle}
            placeholder="Acme Corp"
            {...form.register("companyName")}
          />
          {form.formState.errors.companyName && (
            <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>
              {form.formState.errors.companyName.message}
            </p>
          )}
        </div>

        {/* Sector */}
        <div>
          <label htmlFor="sector" style={labelStyle}>
            Secteur d'activité
            <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-tertiary)", marginLeft: 6 }}>
              optionnel
            </span>
          </label>
          <select
            id="sector"
            style={inputStyle}
            {...form.register("sector")}
          >
            <option value="">Sélectionnez un secteur</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Company size */}
        <div>
          <label htmlFor="companySize" style={labelStyle}>
            Taille de l'entreprise
            <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-tertiary)", marginLeft: 6 }}>
              optionnel
            </span>
          </label>
          <select
            id="companySize"
            style={inputStyle}
            {...form.register("companySize")}
          >
            <option value="">Sélectionnez une taille</option>
            {COMPANY_SIZES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />

        {/* Workspace name */}
        <div>
          <label htmlFor="workspaceName" style={labelStyle}>
            Nom de l'espace de travail <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <input
            id="workspaceName"
            style={inputStyle}
            placeholder="Mon Entreprise"
            {...form.register("workspaceName")}
          />
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 5 }}>
            Rempli automatiquement depuis le nom de votre entreprise — modifiable.
          </p>
          {form.formState.errors.workspaceName && (
            <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>
              {form.formState.errors.workspaceName.message}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            fontSize: 13,
            color: "var(--red)",
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "12px 20px",
            borderRadius: 10,
            background: "var(--green)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            border: "none",
            cursor: isPending ? "wait" : "pointer",
            opacity: isPending ? 0.8 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Création en cours…
            </>
          ) : (
            <>
              Créer mon espace de travail
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
