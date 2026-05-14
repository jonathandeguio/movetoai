import "server-only";

import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  Flag,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Shield,
  Users,
  Workflow,
} from "lucide-react";

import { requireSuperAdminAccess } from "@/server/auth";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const ADMIN_NAV = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/workspaces", label: "Workspaces", icon: Workflow },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/billing", label: "Facturation", icon: CreditCard },
  { href: "/admin/flags", label: "Feature flags", icon: Flag },
  { href: "/admin/prompts", label: "Prompts IA", icon: MessageSquare },
  { href: "/admin/logs", label: "Journaux", icon: ScrollText },
  { href: "/admin/support", label: "Support", icon: Headphones },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = await requireSuperAdminAccess();

  const initials =
    user.name
      ?.split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "SA";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-rose-900/30 bg-slate-950 px-5 py-8 lg:flex lg:flex-col">
        {/* Brand */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Logo href="/admin" dark />
            <Badge className="border-rose-800 bg-rose-950 text-rose-400 text-[10px]">
              ADMIN
            </Badge>
          </div>

          {/* Environment badge */}
          <div className="flex items-center gap-2 rounded-xl border border-rose-900/40 bg-rose-950/50 px-4 py-3">
            <Shield className="h-4 w-4 shrink-0 text-rose-500" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-rose-400">Back-office interne</p>
              <p className="truncate text-[10px] text-rose-600">
                Accès restreint — Move to AI Team uniquement
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-950/50 hover:text-rose-300 aria-[current=page]:bg-rose-950/60 aria-[current=page]:text-rose-300"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User strip */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">{user.name ?? user.email}</p>
            <p className="text-[10px] text-rose-400">Platform Admin</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-slate-800 bg-slate-950/95 px-6 backdrop-blur">
          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-rose-500">
              Move to AI — Back-office
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Production</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
