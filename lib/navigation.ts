import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  CheckSquare,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  ListOrdered,
  Monitor,
  Network,
  Plug,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Lightbulb,
  BookOpen,
  Cpu,
  Workflow,
  Flame,
  GitMerge,
  ClipboardList,
  BadgeCheck,
  FileSearch,
  Link2,
  Upload,
  FileCog,
  Bot,
  CalendarRange,
  // Sprint 4
  Layers,
  PieChart,
  Radio,
  MapPin,
  ShieldAlert,
  Webhook,
  ScrollText,
  TriangleAlert,
  // Compliance
  Medal,
} from "lucide-react";

export type MarketingNavKey =
  | "method"
  | "platform"
  | "examples"
  | "diagnostic";
export type AppNavKey =
  | "overview"
  | "portfolio"
  | "value"
  | "domains"
  | "opportunities"
  | "useCases"
  | "processes"

  | "governance"
  | "analytics"
  | "settings"
  | "adminTeam"
  | "adminQuickStart"
  | "adminProcesses"
  | "adminAnalytics"
  | "adminSettings"
  | "adminBilling"
  | "adminIntegrations"
  | "techDashboard"
  | "consultingDashboard"
  | "memberDashboard"
  | "executiveDashboard"
  // New role dashboards
  | "workspaceAdminDashboard"
  | "enterpriseArchitectDashboard"
  | "transformationManagerDashboard"
  // Knowledge section
  | "knowledgeApplications"
  | "knowledgeCapabilities"
  | "knowledgeProcesses"
  | "knowledgeTechnologies"
  // Insights section
  | "insightsMaturity"
  | "insightsDependencyGraph"
  | "insightsDataQuality"
  // Sprint 3
  | "surveys"
  | "governanceAttestations"
  | "governanceDecisions"
  | "adminIngestion"
  | "insightsRelationships"
  // P24 & P31
  | "copilot"
  | "insightsBriefing"
  // Sprint 4
  | "scenarios"
  | "roiDashboard"
  | "insightsTechRadar"
  | "roadmap"
  | "governanceRisks"
  | "adminWebhooks"
  | "adminAudit"
  // Compliance
  | "compliance"
  | "help";

export type MarketingNavItem = {
  key: MarketingNavKey;
  href: string;
};

export type AppNavItem = {
  key: AppNavKey;
  href: string;
  icon: LucideIcon;
};

export const marketingNavigation: MarketingNavItem[] = [
  { key: "method", href: "/methode" },
  { key: "platform", href: "/plateforme" },
  { key: "examples", href: "/exemples" },
  { key: "diagnostic", href: "/diagnostic-ia" }
];

export const appNavigation: AppNavItem[] = [
  { key: "overview", href: "/app", icon: LayoutDashboard },
  { key: "portfolio", href: "/app/portfolio", icon: ListOrdered },
  { key: "value", href: "/app/value", icon: TrendingUp },
  { key: "domains", href: "/app/domains", icon: LayoutGrid },
  { key: "opportunities", href: "/app/opportunities", icon: Sparkles },
  { key: "useCases", href: "/app/use-cases", icon: Lightbulb },
  { key: "processes", href: "/app/processes", icon: Network },

  { key: "governance", href: "/app/governance", icon: ShieldCheck },
  { key: "analytics", href: "/app/analytics", icon: BarChart3 },
  { key: "settings", href: "/app/settings", icon: Settings },
  { key: "adminQuickStart", href: "/app/admin/quick-start", icon: Rocket },
  { key: "adminTeam", href: "/app/admin/team", icon: Users },
  { key: "adminProcesses", href: "/app/admin/processes", icon: Network },
  { key: "adminAnalytics", href: "/app/admin/analytics", icon: BarChart3 },
  { key: "adminSettings", href: "/app/admin/settings", icon: Settings },
  { key: "adminBilling", href: "/app/admin/billing", icon: CreditCard },
  { key: "adminIntegrations", href: "/app/admin/integrations", icon: Plug },
  { key: "techDashboard", href: "/app/dashboard/tech", icon: Server },
  { key: "consultingDashboard", href: "/app/dashboard/consulting", icon: Briefcase },
  { key: "memberDashboard", href: "/app/dashboard/member", icon: CheckSquare },
  { key: "executiveDashboard", href: "/app/dashboard/executive", icon: TrendingUp },
  // New role dashboards
  { key: "workspaceAdminDashboard", href: "/app/dashboard/workspace-admin", icon: Settings },
  { key: "enterpriseArchitectDashboard", href: "/app/dashboard/architect", icon: Server },
  { key: "transformationManagerDashboard", href: "/app/dashboard/transformation", icon: TrendingUp },
  // Knowledge section
  { key: "knowledgeApplications", href: "/app/knowledge/applications", icon: Monitor },
  { key: "knowledgeCapabilities", href: "/app/knowledge/capabilities", icon: BookOpen },
  { key: "knowledgeProcesses", href: "/app/knowledge/processes", icon: Workflow },
  { key: "knowledgeTechnologies", href: "/app/knowledge/technologies", icon: Cpu },
  // Insights section
  { key: "insightsMaturity", href: "/app/insights/maturity", icon: Flame },
  { key: "insightsDependencyGraph", href: "/app/insights/dependency-graph", icon: GitMerge },
  { key: "insightsDataQuality", href: "/app/insights/data-quality", icon: FileSearch },
  { key: "insightsRelationships", href: "/app/insights/relationships", icon: Link2 },
  // Sprint 3
  { key: "surveys", href: "/app/surveys", icon: ClipboardList },
  { key: "governanceAttestations", href: "/app/governance/attestations", icon: BadgeCheck },
  { key: "governanceDecisions", href: "/app/governance/decisions", icon: FileCog },
  { key: "adminIngestion", href: "/app/admin/ingestion", icon: Upload },
  // P24 & P31
  { key: "copilot", href: "/app/copilot", icon: Bot },
  { key: "insightsBriefing", href: "/app/insights/briefing", icon: CalendarRange },
  // Sprint 4
  { key: "scenarios", href: "/app/scenarios", icon: Layers },
  { key: "roiDashboard", href: "/app/value/roi-dashboard", icon: PieChart },
  { key: "insightsTechRadar", href: "/app/insights/tech-radar", icon: Radio },
  { key: "roadmap", href: "/app/roadmap", icon: MapPin },
  { key: "governanceRisks", href: "/app/governance/risks", icon: TriangleAlert },
  { key: "adminWebhooks", href: "/app/admin/webhooks", icon: Webhook },
  { key: "adminAudit", href: "/app/admin/audit", icon: ScrollText },
  // Compliance
  { key: "compliance", href: "/app/compliance", icon: Medal },
  // Help
  { key: "help", href: "/app/help", icon: HelpCircle },
];
