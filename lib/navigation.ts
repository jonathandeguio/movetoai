import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Database,
  LayoutDashboard,
  LayoutGrid,
  ListOrdered,
  Network,
  Settings,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { TrendingUp } from "lucide-react";

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
  | "processes"
  | "dataProducts"
  | "governance"
  | "analytics"
  | "settings";

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
  { key: "processes", href: "/app/processes", icon: Network },
  { key: "dataProducts", href: "/app/data-products", icon: Database },
  { key: "governance", href: "/app/governance", icon: ShieldCheck },
  { key: "analytics", href: "/app/analytics", icon: BarChart3 },
  { key: "settings", href: "/app/settings", icon: Settings }
];
