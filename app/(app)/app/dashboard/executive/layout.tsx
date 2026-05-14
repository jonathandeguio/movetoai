import type { ReactNode } from "react";
import Link from "next/link";

const NAV = [
  { href: "/app/dashboard/executive", label: "Vue d'ensemble" },
  { href: "/app/dashboard/executive/strategy", label: "Stratégie" },
  { href: "/app/dashboard/executive/roi", label: "ROI & finances" },
  { href: "/app/dashboard/executive/team", label: "Équipe projet" },
  { href: "/app/dashboard/executive/reports", label: "Rapports" }
];

export default function ExecutiveDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      {/* Sub-nav */}
      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-[--border] bg-[--bg-card] p-1 shadow-sm">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-[--text-secondary] transition-colors hover:bg-[--purple-dim] hover:text-[--purple]"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
