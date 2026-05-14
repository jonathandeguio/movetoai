import type { ReactNode } from "react";
import Link from "next/link";
import { CheckSquare, Workflow, MessageSquare, LayoutDashboard } from "lucide-react";

const TABS = [
  { href: "/app/dashboard/member", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/app/dashboard/member/tasks", label: "Mes tâches", icon: CheckSquare },
  { href: "/app/dashboard/member/processes", label: "Processus", icon: Workflow },
  { href: "/app/dashboard/member/assistant", label: "Assistant IA", icon: MessageSquare },
] as const;

export default function MemberDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      {/* Sub-nav */}
      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-[--border] bg-[--bg-card] p-1 shadow-sm">
        {TABS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-[--text-muted] transition hover:bg-[--bg-hover] hover:text-[--text-secondary] aria-[current=page]:bg-[--bg-hover] aria-[current=page]:text-[--text-primary]"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
