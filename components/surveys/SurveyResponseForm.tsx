"use client";

import { useState } from "react";

type Question = {
  id: string;
  type: string;
  label: string;
  options: unknown;
  required: boolean;
};

type SurveyResponseFormProps = {
  surveyId: string;
  questions: Question[];
};

function parseOptions(options: unknown): string[] {
  if (Array.isArray(options)) return options.map(String);
  return [];
}

export function SurveyResponseForm({ surveyId, questions }: SurveyResponseFormProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function validate(): string | null {
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === "") {
          return `La question "${q.label}" est obligatoire.`;
        }
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/surveys/${surveyId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Impossible de soumettre la réponse. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-[--green-border] bg-[--green-dim] p-6 text-center">
        <p className="text-sm font-semibold text-[--green]">Merci pour votre réponse !</p>
        <p className="mt-1 text-xs text-[--text-secondary]">Votre réponse a été enregistrée avec succès.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q, idx) => (
        <div key={q.id} className="space-y-2">
          <label className="block text-sm font-medium text-[--text-primary]">
            <span className="text-[--text-muted] mr-1">{idx + 1}.</span>
            {q.label}
            {q.required && <span className="ml-1 text-[--red]">*</span>}
          </label>

          {q.type === "text" && (
            <textarea
              disabled={submitting}
              rows={3}
              value={(answers[q.id] as string) ?? ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              className="w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:border-[--green] focus:outline-none resize-y disabled:opacity-50"
              placeholder="Votre réponse…"
            />
          )}

          {q.type === "rating" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const current = (answers[q.id] as number) ?? 0;
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={submitting}
                    onClick={() => setAnswer(q.id, star)}
                    className={`text-2xl transition-transform hover:scale-110 disabled:opacity-50 ${
                      star <= current ? "text-[--amber]" : "text-[--border]"
                    }`}
                    aria-label={`Note ${star}`}
                  >
                    ★
                  </button>
                );
              })}
              {!!answers[q.id] && (
                <span className="self-center ml-2 text-xs text-[--text-muted]">
                  {String(answers[q.id])}/5
                </span>
              )}
            </div>
          )}

          {q.type === "choice" && (
            <div className="space-y-1.5">
              {parseOptions(q.options).map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    disabled={submitting}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswer(q.id, opt)}
                    className="accent-[--green] disabled:opacity-50"
                  />
                  <span className="text-sm text-[--text-secondary] group-hover:text-[--text-primary] transition-colors">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          )}

          {q.type === "yesno" && (
            <div className="flex gap-3">
              {(["Oui", "Non"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={submitting}
                  onClick={() => setAnswer(q.id, opt)}
                  className={`rounded-lg border px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                    answers[q.id] === opt
                      ? "border-[--green] bg-[--green-dim] text-[--green]"
                      : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--green] hover:text-[--text-primary]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {error && (
        <p className="rounded-lg border border-[--red-dim] bg-[--red-dim] px-4 py-2 text-sm text-[--red]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-[--green] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Envoi en cours…" : "Soumettre la réponse"}
      </button>
    </form>
  );
}
