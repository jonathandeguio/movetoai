import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { VsPageTemplate, type VsPageTemplateProps } from "@/components/marketing/VsPageTemplate";

type Slug = "leanix" | "celonis" | "signavio" | "consulting" | "ardoq";

const VS_DATA: Record<Slug, VsPageTemplateProps & { metaTitle: string; metaDescription: string }> = {
  leanix: {
    metaTitle: "Move to AI vs LeanIX — Moins cher, plus rapide, IA native",
    metaDescription:
      "LeanIX coûte 30 000 €/an et prend 3 mois à déployer. Move to AI est gratuit et donne des résultats en 48h. Comparatif complet.",
    competitor: { name: "LeanIX", tagline: "Enterprise Architecture Management", color: "#38bdf8" },
    headline: "Move to AI vs LeanIX",
    subheadline:
      "LeanIX est excellent pour la cartographie d'architecture d'entreprise. Move to AI identifie vos opportunités IA en 48h — gratuitement.",
    rows: [
      { label: "Prix", competitor: "30 000 €/an", movetoai: "Gratuit", movetoaiPositive: true },
      { label: "Délai premiers résultats", competitor: "3 mois", movetoai: "< 48h", movetoaiPositive: true },
      { label: "IA générative intégrée", competitor: "✗", movetoai: "✓ natif", movetoaiPositive: true },
      { label: "Adapté PME", competitor: "✗", movetoai: "✓", movetoaiPositive: true },
      { label: "ROI mesuré", competitor: "✗", movetoai: "✓", movetoaiPositive: true },
      { label: "Cartographie d'architecture", competitor: "✓", movetoai: "Partielle" },
      { label: "Consultants IA inclus", competitor: "✗", movetoai: "✓ inclus", movetoaiPositive: true },
    ],
    competitorDescription:
      "LeanIX est une plateforme de gestion de l'architecture d'entreprise reconnue, idéale pour les grandes organisations souhaitant cartographier et gouverner leur SI. Puissant mais coûteux et complexe à déployer.",
    movetoaiPitch:
      "Move to AI se concentre sur l'identification et la structuration des opportunités IA — avec une IA générative native. Résultats en 48h, gratuit, et adapté aux PME comme aux ETI.",
  },
  celonis: {
    metaTitle: "Move to AI vs Celonis — IA native vs process mining",
    metaDescription:
      "Celonis coûte 50 000 €/an et prend 6 mois. Move to AI est gratuit avec des résultats en 48h. Comparatif process mining vs AI Opportunity Intelligence.",
    competitor: { name: "Celonis", tagline: "Process Mining & Execution Management", color: "#a78bfa" },
    headline: "Move to AI vs Celonis",
    subheadline:
      "Celonis est la référence du process mining. Move to AI identifie vos opportunités IA dès les premières heures — sans intégration lourde.",
    rows: [
      { label: "Prix", competitor: "50 000 €/an", movetoai: "Gratuit", movetoaiPositive: true },
      { label: "Délai premiers résultats", competitor: "6 mois", movetoai: "< 48h", movetoaiPositive: true },
      { label: "IA générative intégrée", competitor: "Partielle", movetoai: "✓ natif", movetoaiPositive: true },
      { label: "ROI mesuré", competitor: "✓", movetoai: "✓", competitorPositive: true, movetoaiPositive: true },
      { label: "Adapté PME", competitor: "✗", movetoai: "✓", movetoaiPositive: true },
      { label: "Process mining avancé", competitor: "✓", movetoai: "Basique" },
      { label: "Consultants IA inclus", competitor: "✗", movetoai: "✓ inclus", movetoaiPositive: true },
    ],
    competitorDescription:
      "Celonis est le leader mondial du process mining. Idéal pour analyser vos processus via les logs ERP. Puissant, mais réservé aux grandes entreprises avec des budgets conséquents.",
    movetoaiPitch:
      "Move to AI n'a pas besoin de vos logs ERP pour vous donner des insights. L'IA générative identifie vos opportunités à partir de votre description métier — en 48h, gratuitement.",
  },
  signavio: {
    metaTitle: "Move to AI vs Signavio (SAP) — IA native vs BPM",
    metaDescription:
      "SAP Signavio est puissant mais lourd. Move to AI identifie vos opportunités IA en 48h, gratuitement, sans intégration SAP requise.",
    competitor: { name: "SAP Signavio", tagline: "Business Process Management", color: "#fbbf24" },
    headline: "Move to AI vs SAP Signavio",
    subheadline:
      "Signavio excelle en modélisation BPMN et conformité des processus. Move to AI vous donne vos premières opportunités IA sans attendre la cartographie complète.",
    rows: [
      { label: "Prix", competitor: "Sur devis (cher)", movetoai: "Gratuit", movetoaiPositive: true },
      { label: "Délai premiers résultats", competitor: "4-6 mois", movetoai: "< 48h", movetoaiPositive: true },
      { label: "IA générative intégrée", competitor: "✗", movetoai: "✓ natif", movetoaiPositive: true },
      { label: "Adapté PME", competitor: "✗", movetoai: "✓", movetoaiPositive: true },
      { label: "Modélisation BPMN", competitor: "✓", movetoai: "✓", competitorPositive: true, movetoaiPositive: true },
      { label: "ROI mesuré", competitor: "✗", movetoai: "✓", movetoaiPositive: true },
      { label: "Consultants IA inclus", competitor: "✗", movetoai: "✓ inclus", movetoaiPositive: true },
    ],
    competitorDescription:
      "SAP Signavio est une solution BPM de référence, particulièrement adaptée aux entreprises déjà dans l'écosystème SAP. Excellente pour la documentation et la conformité des processus.",
    movetoaiPitch:
      "Move to AI intègre la modélisation BPMN ET l'identification IA en un seul outil. Pas besoin d'être client SAP. Gratuit, opérationnel en 48h.",
  },
  consulting: {
    metaTitle: "Move to AI vs Cabinet de conseil IA — 50× moins cher",
    metaDescription:
      "Un cabinet de conseil IA facture 200 000 €+ pour 6-12 mois de mission. Move to AI livre les mêmes résultats en 48h, gratuitement.",
    competitor: { name: "Cabinet de conseil", tagline: "McKinsey, BCG, Accenture…", color: "#fb923c" },
    headline: "Move to AI vs Cabinet de conseil",
    subheadline:
      "Un cabinet livre un rapport en 6 mois à 200 000 €+. Move to AI livre vos use cases IA structurés en 48h — et vous prépare à travailler avec un consultant si vous en avez besoin.",
    rows: [
      { label: "Coût", competitor: "200 000 €+", movetoai: "Gratuit", movetoaiPositive: true },
      { label: "Délai premiers résultats", competitor: "6 – 12 mois", movetoai: "< 48h", movetoaiPositive: true },
      { label: "IA générative intégrée", competitor: "✗", movetoai: "✓ natif", movetoaiPositive: true },
      { label: "ROI mesuré", competitor: "✗", movetoai: "✓", movetoaiPositive: true },
      { label: "Adapté PME", competitor: "✗", movetoai: "✓", movetoaiPositive: true },
      { label: "Expertise sectorielle deep", competitor: "✓", movetoai: "Via le réseau" },
      { label: "Consultants IA inclus", competitor: "✓ (très cher)", movetoai: "✓ inclus", movetoaiPositive: true },
    ],
    competitorDescription:
      "Les grands cabinets apportent une expertise sectorielle profonde et une exécution de haut niveau. Indispensables pour les transformations complexes — mais hors de portée pour la plupart des PME.",
    movetoaiPitch:
      "Move to AI identifie et structure vos opportunités IA en 48h. Vous arrivez chez votre consultant avec un brief prêt — et économisez des semaines de cadrage. Complémentaire, pas concurrent.",
  },
  ardoq: {
    metaTitle: "Move to AI vs Ardoq — IA native vs cartographie EA",
    metaDescription:
      "Ardoq est une plateforme EA cloud. Move to AI se concentre sur l'identification des opportunités IA en 48h, gratuitement. Comparatif complet.",
    competitor: { name: "Ardoq", tagline: "Enterprise Architecture & Transformation", color: "#38bdf8" },
    headline: "Move to AI vs Ardoq",
    subheadline:
      "Ardoq est une plateforme EA collaborative. Move to AI identifie vos opportunités IA sans cartographier tout votre SI au préalable.",
    rows: [
      { label: "Prix", competitor: "Sur devis", movetoai: "Gratuit", movetoaiPositive: true },
      { label: "Délai premiers résultats", competitor: "2-4 mois", movetoai: "< 48h", movetoaiPositive: true },
      { label: "IA générative intégrée", competitor: "Partielle", movetoai: "✓ natif", movetoaiPositive: true },
      { label: "Adapté PME", competitor: "Partiel", movetoai: "✓", movetoaiPositive: true },
      { label: "Cartographie EA", competitor: "✓", movetoai: "Basique" },
      { label: "ROI mesuré", competitor: "✗", movetoai: "✓", movetoaiPositive: true },
      { label: "Consultants IA inclus", competitor: "✗", movetoai: "✓ inclus", movetoaiPositive: true },
    ],
    competitorDescription:
      "Ardoq est une plateforme EA cloud collaborative et moderne, adaptée aux équipes qui veulent une vision partagée de leur architecture d'entreprise.",
    movetoaiPitch:
      "Move to AI ne remplace pas votre EA tool — il l'anticipe. Identifiez vos opportunités IA en 48h avant même d'avoir terminé votre cartographie.",
  },
};

export async function generateStaticParams() {
  return (Object.keys(VS_DATA) as Slug[]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = VS_DATA[params.slug as Slug];
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: { type: "website", locale: "fr_FR", siteName: "Move to AI" },
  };
}

export default function VsPage({ params }: { params: { slug: string } }) {
  const data = VS_DATA[params.slug as Slug];
  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <VsPageTemplate {...data} />
      <SiteFooter />
    </>
  );
}
