"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

import { structureOpportunity, type StructuredOpportunity } from "@/app/actions/structureOpportunity";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NaturalLanguageInputProps {
  onStructured: (data: StructuredOpportunity, rawText: string) => void;
}

const PLACEHOLDER = `Décrivez votre problème métier en langage naturel...

Ex : "Je passe 3h par semaine à relancer manuellement les factures impayées. C'est chronophage et les relances sont souvent en retard."

Ex : "Notre équipe RH saisit encore manuellement les données de CV dans notre SIRH — on traite 80 candidatures par mois, chaque saisie prend 15 min."`;

export function NaturalLanguageInput({ onStructured }: NaturalLanguageInputProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAnalyse() {
    if (text.trim().length < 20) {
      setError("Décrivez votre problème en au moins 20 caractères.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await structureOpportunity(text.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onStructured(result.data, text.trim());
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          className="min-h-[180px] resize-none rounded-xl border-[--border] text-sm leading-7 focus:border-[--border-focus] focus:ring-[--green-dim]"
          aria-label="Description du problème métier"
          aria-describedby={error ? "nlp-error" : undefined}
          disabled={isPending}
        />
        <p className="mt-1.5 text-right text-xs text-[--text-muted]">{text.length} caractères</p>
      </div>

      {error && (
        <p id="nlp-error" role="alert" className="flex items-start gap-2 rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {isPending && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[--green-border] bg-[--green-dim] px-6 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[--green]" />
          <div>
            <p className="text-sm font-semibold text-[--text-primary]">Analyse en cours…</p>
            <p className="mt-0.5 text-xs text-[--text-muted]">Claude structure votre opportunité (max 30s)</p>
          </div>
          {/* Skeleton bars */}
          <div className="mt-2 w-full space-y-2">
            {[80, 60, 70].map((w, i) => (
              <div key={i} className="h-3 animate-pulse rounded-full bg-[--bg-hover]" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      )}

      {!isPending && (
        <Button
          onClick={handleAnalyse}
          disabled={text.trim().length < 20}
          className="w-full gap-2"
          size="lg"
        >
          <Sparkles className="h-4 w-4" />
          Analyser avec l'IA →
        </Button>
      )}
    </div>
  );
}
