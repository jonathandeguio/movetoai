export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import {
  recommendProcessesForOnboarding,
  type RecommendedProcess,
} from "@/lib/claude";

/** Processus par défaut appliqués si l'appel Claude échoue (fallback gracieux). */
const FALLBACK_PROCESSES: RecommendedProcess[] = [
  {
    id: "invoice_processing",
    label: "Traitement des factures",
    domain: "Finance & Comptabilité",
    description:
      "Automatiser la saisie et la validation des factures fournisseurs pour réduire les délais de paiement.",
    priority: 1,
    estimated_gain: "-60% de traitement manuel",
    complexity: "low",
  },
  {
    id: "employee_onboarding",
    label: "Onboarding collaborateurs",
    domain: "Ressources Humaines",
    description:
      "Automatiser les étapes administratives d'intégration pour accélérer la montée en compétences.",
    priority: 2,
    estimated_gain: "-3 jours par recrutement",
    complexity: "medium",
  },
  {
    id: "sales_reporting",
    label: "Reporting commercial",
    domain: "Commercial & Ventes",
    description:
      "Générer automatiquement les rapports de performance commerciale hebdomadaires.",
    priority: 3,
    estimated_gain: "-4h/semaine par manager",
    complexity: "low",
  },
  {
    id: "customer_support_triage",
    label: "Triage support client",
    domain: "Support Client & SAV",
    description:
      "Classifier et router automatiquement les tickets entrants selon leur priorité et nature.",
    priority: 4,
    estimated_gain: "-40% de temps de traitement",
    complexity: "medium",
  },
  {
    id: "supply_chain_alerts",
    label: "Alertes supply chain",
    domain: "Opérations & Logistique",
    description:
      "Détecter proactivement les anomalies et retards dans la chaîne d'approvisionnement.",
    priority: 5,
    estimated_gain: "-25% de ruptures de stock",
    complexity: "high",
  },
  {
    id: "contract_review",
    label: "Revue de contrats",
    domain: "Juridique & Conformité",
    description:
      "Analyser et extraire automatiquement les clauses clés des contrats entrants.",
    priority: 6,
    estimated_gain: "-70% du temps de revue",
    complexity: "high",
  },
];

const recommendSchema = z.object({
  companySize: z.string().min(1),
  userFunction: z.string().min(1),
  selectedDomains: z.array(z.string().min(1)).min(1).max(3),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = recommendSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
  }

  try {
    const result = await recommendProcessesForOnboarding(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    // Fallback gracieux : l'onboarding ne doit jamais bloquer sur une erreur API
    return NextResponse.json({
      ok: true,
      recommended_processes: FALLBACK_PROCESSES,
      profile_summary:
        "Profil détecté — recommandations standards appliquées.",
      redirect_slug: "default",
      fallback: true,
    });
  }
}
