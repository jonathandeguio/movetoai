import type { ReactNode } from "react";
import Link from "next/link";
import { Server, Shield, BookOpen, ScrollText, Network } from "lucide-react";

const TECH_NAV = [
  { href: "/app/dashboard/tech", label: "Vue d'ensemble", icon: Server, exact: true },
  { href: "/app/dashboard/tech/integrations", label: "Intégrations", icon: Network },
  { href: "/app/dashboard/tech/security", label: "RGPD & Sécurité", icon: Shield },
  { href: "/app/dashboard/tech/api", label: "API Move to AI", icon: BookOpen },
  { href: "/app/dashboard/tech/logs", label: "Journaux", icon: ScrollText },
  { href: "/app/dashboard/tech/architecture", label: "Architecture", icon: Network },
] as const;

export default function TechDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <nav
        aria-label="Navigation tableau de bord technique"
        className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto border-b border-border/60 px-4 pb-0 md:-mx-6 md:px-6"
      >
        {TECH_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 pb-3 pt-1 text-sm font-medium text-[--text-muted] transition-colors hover:border-[--blue] hover:text-[--blue] aria-[current=page]:border-[--blue] aria-[current=page]:text-[--blue]"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Page content */}
      {children}
    </div>
  );
}
