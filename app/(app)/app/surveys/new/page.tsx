"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

type QuestionDraft = {
  _key: string;
  type: "text" | "rating" | "choice" | "yesno";
  label: string;
  options: string;
  required: boolean;
};

function generateKey() {
  return Math.random().toString(36).slice(2, 9);
}

export default function NewSurveyPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [dueDate, setDueDate] = useState("");
  const [targetEntityType, setTargetEntityType] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { _key: generateKey(), type: "text", label: "", options: "", required: false },
    ]);
  }

  function removeQuestion(key: string) {
    setQuestions((prev) => prev.filter((q) => q._key !== key));
  }

  function updateQuestion(key: string, patch: Partial<QuestionDraft>) {
    setQuestions((prev) =>
      prev.map((q) => (q._key === key ? { ...q, ...patch } : q))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      dueDate: dueDate || undefined,
      targetEntityType: targetEntityType || undefined,
      questions: questions
        .filter((q) => q.label.trim())
        .map((q) => ({
          type: q.type,
          label: q.label.trim(),
          options:
            q.type === "choice"
              ? q.options
                  .split("\n")
                  .map((o) => o.trim())
                  .filter(Boolean)
              : undefined,
          required: q.required,
        })),
    };

    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      const { id } = await res.json();
      router.push(`/app/surveys/${id}` as Route);
    } catch {
      setError("Impossible de créer le sondage. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[--text-primary]">Nouvelle enquête</h1>
        <p className="mt-1 text-sm text-[--text-secondary]">
          Définissez les paramètres et les questions de votre enquête.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <section className="rounded-xl border border-[--border] bg-[--bg-card] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[--text-primary]">Informations générales</h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[--text-secondary]">
              Titre <span className="text-[--red]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              placeholder="Ex. : Évaluation de la maturité IA"
              className="w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:border-[--green] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[--text-secondary]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={3}
              placeholder="Description optionnelle…"
              className="w-full resize-y rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:border-[--green] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[--text-secondary]">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "active")}
                disabled={submitting}
                className="w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] focus:border-[--green] focus:outline-none disabled:opacity-50"
              >
                <option value="draft">Brouillon</option>
                <option value="active">Actif</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[--text-secondary]">
                Date d&apos;échéance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] focus:border-[--green] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[--text-secondary]">
              Type d&apos;entité cible
            </label>
            <select
              value={targetEntityType}
              onChange={(e) => setTargetEntityType(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] focus:border-[--green] focus:outline-none disabled:opacity-50"
            >
              <option value="">—</option>
              <option value="application">Application</option>
              <option value="process">Processus</option>
              <option value="capability">Capacité</option>
            </select>
          </div>
        </section>

        {/* Questions */}
        <section className="rounded-xl border border-[--border] bg-[--bg-card] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[--text-primary]">
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              disabled={submitting}
              className="rounded-lg border border-[--green-border] bg-[--green-dim] px-3 py-1.5 text-xs font-medium text-[--green] hover:bg-[--green] hover:text-white transition-colors disabled:opacity-50"
            >
              + Ajouter une question
            </button>
          </div>

          {questions.length === 0 ? (
            <p className="text-sm text-[--text-muted] text-center py-4">
              Aucune question ajoutée. Cliquez sur &quot;Ajouter une question&quot; pour commencer.
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q._key}
                  className="rounded-lg border border-[--border-subtle] bg-[--bg-hover] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[--text-muted]">
                      Question {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q._key)}
                      disabled={submitting}
                      className="text-xs text-[--text-muted] hover:text-[--red] transition-colors disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs text-[--text-secondary]">Type</label>
                      <select
                        value={q.type}
                        onChange={(e) =>
                          updateQuestion(q._key, {
                            type: e.target.value as QuestionDraft["type"],
                          })
                        }
                        disabled={submitting}
                        className="w-full rounded-lg border border-[--border] bg-[--bg-card] px-2 py-1.5 text-xs text-[--text-primary] focus:border-[--green] focus:outline-none disabled:opacity-50"
                      >
                        <option value="text">Texte</option>
                        <option value="rating">Note (1-5)</option>
                        <option value="choice">Choix</option>
                        <option value="yesno">Oui / Non</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(q._key, { required: e.target.checked })}
                          disabled={submitting}
                          className="accent-[--green]"
                        />
                        <span className="text-xs text-[--text-secondary]">Obligatoire</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-[--text-secondary]">Intitulé</label>
                    <input
                      type="text"
                      value={q.label}
                      onChange={(e) => updateQuestion(q._key, { label: e.target.value })}
                      disabled={submitting}
                      placeholder="Ex. : Comment évaluez-vous la maturité de ce processus ?"
                      className="w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-1.5 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:border-[--green] focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  {q.type === "choice" && (
                    <div className="space-y-1">
                      <label className="block text-xs text-[--text-secondary]">
                        Options (une par ligne)
                      </label>
                      <textarea
                        value={q.options}
                        onChange={(e) => updateQuestion(q._key, { options: e.target.value })}
                        disabled={submitting}
                        rows={3}
                        placeholder={"Option A\nOption B\nOption C"}
                        className="w-full resize-y rounded-lg border border-[--border] bg-[--bg-card] px-3 py-1.5 text-xs text-[--text-primary] placeholder:text-[--text-muted] focus:border-[--green] focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <p className="rounded-lg border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[--green] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Création…" : "Créer le sondage"}
          </button>
        </div>
      </form>
    </div>
  );
}
