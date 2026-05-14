// lib/ai/task-registry.ts
// Registre task → complexité (détermine le provider prioritaire)

import type { TaskComplexity } from "./providers/base";

const TASK_COMPLEXITY: Record<string, TaskComplexity> = {
  // ── SIMPLE — Ollama / Groq en priorité ──────────────────────────────────
  opportunity_structure:   "simple",  // Structuration JSON opportunité
  opportunity_enrich:      "simple",  // Enrichissement champs
  usecase_extract_fields:  "simple",  // Extraction champs use case
  readiness_score:         "simple",  // Scoring AI Readiness
  change_summary_bpmn:     "simple",  // Résumé changements BPMN (15 mots)
  duplicate_detect:        "simple",  // Détection doublons
  domain_classify:         "simple",  // Classification domaine
  process_step_label:      "simple",  // Renommage étape processus
  gap_detect:              "simple",  // Détection champs vides
  relationship_suggest:    "simple",  // Matching entités

  // ── COMPLEX — Groq → Claude ──────────────────────────────────────────────
  usecase_generate_full:   "complex", // Génération fiche use case complète
  modernization_advice:    "complex", // Conseil modernisation application
  opportunity_qualify:     "complex", // Qualification opportunité multi-facteurs
  board_narrative:         "complex", // Rapport exécutif / board narrative
  executive_copilot:       "complex", // Executive Copilot NLP → query
  scenario_simulate:       "complex", // Simulation de scénario
  improvement_suggest:     "complex", // Suggestion améliorations processus
  weekly_briefing:         "complex", // Rapport hebdomadaire IA transformation
  ingestion_extract:       "complex", // Extraction entités depuis document ingéré

  // ── ARIA — Assistante IA contextuelle ───────────────────────────────────
  aria_chat:              "complex",   // Conversation Aria — réponse contextuelle
  aria_recommendations:   "complex",   // Recommandations proactives workspace
  aria_context_analysis:  "simple",    // Analyse légère du contexte de page

  // ── CRITICAL — Claude UNIQUEMENT ────────────────────────────────────────
  bpmn_generate:           "critical", // Génération BPMN 2.0 XML (syntaxe stricte)
  governance_check:        "critical", // Vérification principes d'architecture
  rgpd_compliance:         "critical", // Conformité RGPD
  legal_document:          "critical", // Documents légaux
};

export const taskRegistry = {
  tasks: TASK_COMPLEXITY,

  getComplexity(task: string): TaskComplexity {
    return TASK_COMPLEXITY[task] ?? "complex"; // Défaut conservateur
  },

  isSimple(task: string):   boolean { return this.getComplexity(task) === "simple"; },
  isComplex(task: string):  boolean { return this.getComplexity(task) === "complex"; },
  isCritical(task: string): boolean { return this.getComplexity(task) === "critical"; },
};
