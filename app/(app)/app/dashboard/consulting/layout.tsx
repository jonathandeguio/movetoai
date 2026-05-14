import type { ReactNode } from "react";
import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  FileText,
  LayoutGrid,
  Trophy,
} from "lucide-react";

const CONSULTING_NAV = [
  { href: "/app/dashboard/consulting", label: "Vue d'ensemble", icon: LayoutGrid, exact: true },
  { href: "/app/dashboard/consulting/clients", label: "Mes clients", icon: Briefcase },
  { href: "/app/dashboard/consulting/templates", label: "Templates", icon: FileText },
  { href: "/app/dashboard/consulting/academy", label: "Academy", icon: BookOpen },
  { href: "/app/dashboard/consulting/partner", label: "Programme partenaire", icon: Trophy },
  { href: "/app/dashboard/consulting/resources", label: "Ressources", icon: FileText },
] as const;

export default function ConsultingDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <nav
        aria-label="Navigation consultant"
        className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto border-b border-border/60 px-4 pb-0 md:-mx-6 md:px-6"
      >
        {CONSULTING_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 pb-3 pt-1 text-sm font-medium text-[--text-muted] transition-colors hover:border-[--amber] hover:text-[--amber] aria-[current=page]:border-[--amber] aria-[current=page]:text-[--amber]"
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
