import type { ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  BrainCircuit,
  CreditCard,
  Network,
  Plug,
  Rocket,
  Settings,
  Users
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/app/admin/quick-start", label: "Démarrage", icon: Rocket },
  { href: "/app/admin/processes", label: "Processus", icon: Network },
  { href: "/app/admin/team", label: "Équipe", icon: Users },
  { href: "/app/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/admin/llm", label: "IA / LLM", icon: BrainCircuit },
  { href: "/app/admin/integrations", label: "Intégrations", icon: Plug },
  { href: "/app/admin/settings", label: "Paramètres", icon: Settings },
  { href: "/app/admin/billing", label: "Facturation", icon: CreditCard }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      {/* Admin sub-nav */}
      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-[--border] bg-[--bg-card] p-1 shadow-sm">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[--text-secondary] transition-colors hover:bg-[--bg-hover] hover:text-[--text-primary]"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
