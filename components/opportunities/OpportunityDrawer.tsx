"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, PenLine, Users, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { NaturalLanguageInput } from "@/components/opportunities/NaturalLanguageInput";
import { DomainBadge } from "@/components/shared/domain-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import type { StructuredOpportunity } from "@/app/actions/structureOpportunity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = "natural" | "manual" | "terrain";
type DrawerStep = "input" | "structured" | "saving" | "success" | "error";

const DOMAINS = ["Finance", "RH", "Commercial", "Marketing", "Ops", "Support", "Juridique", "Achats", "IT"] as const;
const PRIORITIES = ["P0", "P1", "P2"] as const;
const COMPLEXITIES = [
  { value: "low",    label: "Faible" },
  { value: "medium", label: "Moyenne" },
  { value: "high",   label: "Élevée" },
] as const;

const ManualSchema = z.object({
  title: z.string().min(5, "Minimum 5 caractères").max(80, "Maximum 80 caractères"),
  domain: z.enum(DOMAINS, { required_error: "Domaine requis" }),
  description: z.string().min(30, "Minimum 30 caractères"),
  gain_estimate: z.string().max(255).optional(),
  complexity: z.enum(["low", "medium", "high"]),
  priority: z.enum(["P0", "P1", "P2"]),
});
type ManualFormValues = z.infer<typeof ManualSchema>;

// ── Main Component ────────────────────────────────────────────────────────────

interface OpportunityDrawerProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: Mode;
}

export function OpportunityDrawer({ open, onClose, defaultMode = "natural" }: OpportunityDrawerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [step, setStep] = useState<DrawerStep>("input");
  const [structured, setStructured] = useState<StructuredOpportunity | null>(null);
  const [rawText, setRawText] = useState("");
  const [sourceExpanded, setSourceExpanded] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ManualFormValues>({
    resolver: zodResolver(ManualSchema),
    defaultValues: {
      complexity: "medium",
      priority: "P2",
      domain: "Ops",
    },
  });

  // When Claude returns structured data, pre-fill the form
  function handleStructured(data: StructuredOpportunity, raw: string) {
    setStructured(data);
    setRawText(raw);
    form.reset({
      title: data.title,
      domain: DOMAINS.includes(data.domain as typeof DOMAINS[number]) ? (data.domain as typeof DOMAINS[number]) : "Ops",
      description: data.description,
      gain_estimate: data.gain_estimate,
      complexity: data.complexity,
      priority: data.priority_suggestion,
    });
    setStep("structured");
  }

  async function submitOpportunity(values: ManualFormValues, asDraft: boolean) {
    setGlobalError(null);
    setStep("saving");

    const payload = {
      ...values,
      detected_by: mode === "natural" ? "ai" : mode === "terrain" ? "terrain" : "manual",
      source_text: mode === "natural" ? rawText : undefined,
    };

    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setGlobalError(err.error ?? "Erreur lors de la création");
        setStep("structured");
        return;
      }

      setStep("success");
      router.refresh();
      setTimeout(() => { onClose(); setStep("input"); }, 1500);
    } catch {
      setGlobalError("Erreur réseau");
      setStep("structured");
    }
  }

  function handleClose() {
    if (step === "saving") return;
    onClose();
    setTimeout(() => { setStep("input"); setStructured(null); form.reset(); setGlobalError(null); }, 300);
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Nouvelle opportunité"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col bg-[--bg-card] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[--border] px-6 py-5">
          <h2 className="text-base font-semibold text-[--text-primary]">Nouvelle opportunité IA</h2>
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-[--text-muted] hover:bg-[--bg-hover] hover:text-[--text-secondary]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 border-b border-[--border] px-6 pt-3">
          {([ ["natural", Sparkles, "Langage naturel"], ["manual", PenLine, "Manuel"], ["terrain", Users, "Signal terrain"] ] as const).map(([m, Icon, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setStep("input"); setStructured(null); }}
              className={cn(
                "flex items-center gap-1.5 border-b-2 pb-3 pt-1 text-sm font-medium transition",
                mode === m
                  ? "border-[--green] text-[--green]"
                  : "border-transparent text-[--text-muted] hover:text-[--text-primary]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── Success state ── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[--green-dim]">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-sm font-semibold text-[--text-primary]">Opportunité créée avec succès !</p>
            </div>
          )}

          {/* ── Saving state ── */}
          {step === "saving" && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[--green]" />
              <p className="text-sm text-[--text-secondary]">Enregistrement…</p>
            </div>
          )}

          {/* ── Natural language input ── */}
          {step === "input" && mode === "natural" && (
            <NaturalLanguageInput onStructured={handleStructured} />
          )}

          {/* ── Terrain signal ── */}
          {step === "input" && mode === "terrain" && (
            <div className="space-y-4">
              <p className="text-sm text-[--text-secondary]">Décrivez simplement la tâche qui vous prend le plus de temps.</p>
              <NaturalLanguageInput onStructured={handleStructured} />
            </div>
          )}

          {/* ── Manual / Structured form ── */}
          {(step === "input" && mode === "manual") || step === "structured" ? (
            <form className="space-y-5" onSubmit={form.handleSubmit((v) => submitOpportunity(v, true))}>

              {/* Source text (collapsible, structured mode only) */}
              {step === "structured" && rawText && (
                <div className="rounded-xl border border-[--border] bg-[--bg-hover]">
                  <button
                    type="button"
                    onClick={() => setSourceExpanded((s) => !s)}
                    className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium text-[--text-muted]"
                  >
                    <span>Texte source original</span>
                    {sourceExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                  {sourceExpanded && (
                    <p className="border-t border-[--border] px-4 py-3 text-xs leading-6 text-[--text-secondary]">{rawText}</p>
                  )}
                </div>
              )}

              {/* AI suggestion banner */}
              {step === "structured" && structured && (
                <div className="rounded-xl border border-[--green-border] bg-[--green-dim] px-4 py-3">
                  <p className="text-xs font-semibold text-[--green]">Suggestion Claude</p>
                  <p className="mt-0.5 text-xs text-[--text-secondary]">{structured.rationale}</p>
                  {structured.quick_solution && (
                    <p className="mt-1 text-xs text-[--text-muted]">Solution suggérée : {structured.quick_solution}</p>
                  )}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Titre <span className="text-[--red]">*</span></Label>
                <div className="relative">
                  <Input id="title" {...form.register("title")} placeholder="Automatisation des relances factures..." maxLength={80} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[--text-muted]">
                    {form.watch("title")?.length ?? 0}/80
                  </span>
                </div>
                {form.formState.errors.title && (
                  <p className="text-xs text-[--red]">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Domain */}
              <div className="space-y-1.5">
                <Label htmlFor="domain">Domaine <span className="text-[--red]">*</span></Label>
                <select
                  id="domain"
                  {...form.register("domain")}
                  className="w-full rounded-xl border border-[--border] bg-[--bg-input] px-3 py-2 text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--green-dim]"
                >
                  {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description <span className="text-[--red]">*</span></Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Décrivez le problème et son impact actuel sur l'organisation…"
                  className="min-h-[100px] resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-[--red]">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* Gain estimate */}
              <div className="space-y-1.5">
                <Label htmlFor="gain_estimate">Gain estimé <span className="text-[--text-muted]">(optionnel)</span></Label>
                <Input
                  id="gain_estimate"
                  {...form.register("gain_estimate")}
                  placeholder="ex : -40% temps de traitement, +20% taux de conversion"
                />
              </div>

              {/* Complexity */}
              <div className="space-y-2">
                <Label>Complexité <span className="text-[--red]">*</span></Label>
                <div className="flex gap-2">
                  {COMPLEXITIES.map(({ value, label }) => (
                    <label key={value} className="flex-1 cursor-pointer">
                      <input type="radio" value={value} {...form.register("complexity")} className="sr-only" />
                      <span className={cn(
                        "flex items-center justify-center rounded-xl border py-2 text-sm font-medium transition",
                        form.watch("complexity") === value
                          ? "border-[--green-border] bg-[--green-dim] text-[--green]"
                          : "border-[--border] text-[--text-secondary] hover:border-[--border-strong]"
                      )}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priorité <span className="text-[--red]">*</span></Label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <label key={p} className="flex-1 cursor-pointer">
                      <input type="radio" value={p} {...form.register("priority")} className="sr-only" />
                      <span className={cn(
                        "flex items-center justify-center rounded-xl border py-2 transition",
                        form.watch("priority") === p ? "border-[--green-border] bg-[--green-dim]" : "border-[--border] hover:border-[--border-strong]"
                      )}>
                        <PriorityBadge priority={p} />
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Global error */}
              {globalError && (
                <p role="alert" className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
                  {globalError}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  Enregistrer comme brouillon
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => form.handleSubmit((v) => submitOpportunity(v, false))()}
                >
                  Valider directement
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </aside>
    </>
  );
}
