"use client";

import { useState } from "react";
import { Bot, ChevronDown, ChevronUp, Copy, Check, Pencil, Save, X, RotateCcw } from "lucide-react";

type PromptCategory = "onboarding" | "analysis" | "recommendation" | "assistant";

interface SystemPrompt {
  key: string;
  label: string;
  description: string;
  category: PromptCategory;
  model: string;
  temperature: number;
  content: string;
}

const CATEGORY_BADGE: Record<PromptCategory, string> = {
  onboarding: "border-cyan-800 bg-cyan-950/50 text-cyan-300",
  analysis: "border-violet-800 bg-violet-950/50 text-violet-300",
  recommendation: "border-emerald-800 bg-emerald-950/50 text-emerald-300",
  assistant: "border-amber-800 bg-amber-950/50 text-amber-300",
};

const INITIAL_PROMPTS: SystemPrompt[] = [
  {
    key: "process_recommendations",
    label: "Recommandations de processus",
    description: "Génère une liste priorisée de processus à automatiser à partir du profil utilisateur.",
    category: "recommendation",
    model: "claude-sonnet-4-6",
    temperature: 0,
    content: `Tu es un expert en transformation digitale et en IA d'entreprise.
À partir du profil d'une organisation, tu dois identifier les processus métier qui bénéficieraient le plus d'une automatisation ou d'une augmentation par l'IA.
Réponds UNIQUEMENT avec un JSON valide suivant le schéma fourni.
Classe les processus par impact décroissant.
Limite-toi à 8 processus maximum.`,
  },
  {
    key: "it_roadmap",
    label: "Roadmap d'intégration IT",
    description: "Génère une roadmap IT en 3 phases pour intégrer l'IA dans le système d'information.",
    category: "onboarding",
    model: "claude-sonnet-4-6",
    temperature: 0,
    content: `Tu es un architecte IA spécialisé dans l'intégration de solutions d'intelligence artificielle dans des systèmes d'information d'entreprise.
À partir des systèmes existants et des contraintes fournies, génère une roadmap d'intégration structurée en 3 phases.
Chaque phase doit contenir : titre, description, durée estimée, systèmes concernés, prérequis, risques et notes RGPD.
Réponds UNIQUEMENT avec un JSON valide.`,
  },
  {
    key: "consultant_use_cases",
    label: "Cas d'usage consultants",
    description: "Génère 5 cas d'usage IA personnalisés pour un consultant IA.",
    category: "onboarding",
    model: "claude-sonnet-4-6",
    temperature: 0,
    content: `Tu es un expert en conseil IA et en développement de pratiques de consulting.
À partir du profil d'un consultant (spécialisation, expérience, secteurs, outils), génère 5 cas d'usage IA spécifiques qu'il peut proposer à ses clients.
Pour chaque cas d'usage : titre, valeur client, secteur cible, outils utilisés, durée de mission estimée, fourchette de prix, complexité.
Ajoute un résumé de positionnement et une suggestion de niveau partenaire.
Réponds UNIQUEMENT avec un JSON valide.`,
  },
  {
    key: "opportunity_analysis",
    label: "Analyse d'opportunité IA",
    description: "Analyse un processus spécifique et identifie les opportunités d'automatisation.",
    category: "analysis",
    model: "claude-sonnet-4-6",
    temperature: 0,
    content: `Tu es un expert en automatisation et en IA appliquée aux processus métier.
Analyse le processus fourni et identifie les opportunités concrètes d'automatisation ou d'augmentation par l'IA.
Évalue chaque opportunité selon : impact business, faisabilité technique, ROI estimé, délai de mise en œuvre.
Priorise les quick wins (impact élevé, effort faible).
Réponds UNIQUEMENT avec un JSON valide.`,
  },
  {
    key: "workspace_assistant",
    label: "Assistant workspace",
    description: "Prompt système pour l'assistant IA conversationnel dans les workspaces.",
    category: "assistant",
    model: "claude-sonnet-4-6",
    temperature: 0.3,
    content: `Tu es BluePilot, un assistant IA spécialisé en transformation digitale et en pilotage de l'IA en entreprise.
Tu aides les équipes à cartographier leurs processus, identifier des opportunités d'automatisation et construire leur feuille de route IA.
Reste factuel, concret et orienté action. Évite le jargon technique sauf si l'utilisateur est technique.
Ne fournis jamais de conseils financiers, juridiques ou médicaux.
Rappelle-toi du contexte du workspace courant pour personnaliser tes réponses.`,
  },
];

function PromptCard({ prompt, onSave }: { prompt: SystemPrompt; onSave: (key: string, content: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(prompt.content);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    onSave(prompt.key, draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setDraft(prompt.content);
    setEditing(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-100">{prompt.label}</p>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_BADGE[prompt.category]}`}>
              {prompt.category}
            </span>
            {saved && <span className="text-[10px] text-emerald-400">Sauvegardé ✓</span>}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{prompt.description}</p>
          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-600">
            <span className="font-mono">{prompt.model}</span>
            <span>temp={prompt.temperature}</span>
            <span className="font-mono text-slate-700">{prompt.key}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={handleCopy} className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-200 transition">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => { setExpanded(!expanded); if (!expanded) setEditing(false); }}
            className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-200 transition"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-800 px-5 py-4 space-y-3">
          {editing ? (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={10}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-mono text-xs text-slate-200 focus:border-rose-700 focus:outline-none"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 transition">
                  <Save className="h-3.5 w-3.5" /> Sauvegarder
                </button>
                <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition">
                  <RotateCcw className="h-3.5 w-3.5" /> Annuler
                </button>
              </div>
            </>
          ) : (
            <>
              <pre className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-300 leading-relaxed">
                {prompt.content}
              </pre>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
              >
                <Pencil className="h-3.5 w-3.5" /> Modifier
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>(INITIAL_PROMPTS);
  const [filter, setFilter] = useState<"all" | PromptCategory>("all");

  function handleSave(key: string, content: string) {
    setPrompts((prev) => prev.map((p) => (p.key === key ? { ...p, content } : p)));
  }

  const filtered = filter === "all" ? prompts : prompts.filter((p) => p.category === filter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-50">Prompts IA globaux</h1>
          <p className="text-sm text-slate-400">{prompts.length} prompts système — modifications appliquées à tous les nouveaux appels.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-xs text-rose-400">
          <Bot className="h-3.5 w-3.5 shrink-0" />
          Modèle par défaut : claude-sonnet-4-6
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "onboarding", "analysis", "recommendation", "assistant"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              filter === cat
                ? "border-rose-700 bg-rose-950/50 text-rose-300"
                : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
            }`}
          >
            {cat === "all" ? `Tous (${prompts.length})` : `${cat} (${prompts.filter((p) => p.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Prompt cards */}
      <div className="space-y-3">
        {filtered.map((prompt) => (
          <PromptCard key={prompt.key} prompt={prompt} onSave={handleSave} />
        ))}
      </div>
    </div>
  );
}
