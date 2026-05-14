"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { useLocaleContext } from "@/components/providers/locale-provider";
import { appNavigation, type AppNavKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  workspaceName: string;
  planName: string;
  visibleNavKeys?: AppNavKey[];
};

export function AppSidebar({ workspaceName, planName, visibleNavKeys }: AppSidebarProps) {
  const pathname = usePathname();
  const { messages } = useLocaleContext();

  const visibleNav = visibleNavKeys
    ? appNavigation.filter((item) => visibleNavKeys.includes(item.key))
    : appNavigation;

  return (
    <aside
      data-tour="sidebar"
      className="hidden w-[240px] shrink-0 lg:flex lg:flex-col"
      style={{
        background:   "var(--bg-secondary)",
        borderRight:  "1px solid var(--border-subtle)",
        padding:      "1.5rem 1rem",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "1.5rem", padding: "0 0.5rem" }}>
        <BrandLogo href="/app" size="sm" variant="dark" animated withWordmark />
      </div>

      {/* Workspace pill */}
      <div
        style={{
          borderRadius:  "var(--r-lg)",
          border:        "1px solid var(--green-border)",
          background:    "var(--green-dim)",
          padding:       "0.75rem 1rem",
          marginBottom:  "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <span
            style={{
              fontSize:      "10px",
              fontWeight:    600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color:         "var(--green)",
            }}
          >
            {messages.common.labels.multilingual}
          </span>
          <span
            style={{
              fontSize:   "10px",
              fontWeight: 500,
              padding:    "2px 8px",
              borderRadius: "var(--r-pill)",
              background:  "var(--green-dim)",
              border:      "1px solid var(--green-border)",
              color:       "var(--green)",
            }}
          >
            {planName}
          </span>
        </div>
        <p
          style={{
            fontSize:    "15px",
            fontWeight:  600,
            color:       "var(--text-primary)",
            lineHeight:  1.3,
          }}
        >
          {workspaceName}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/app"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.key}
              href={item.href as Route}
              data-tour={`nav-${item.key}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? "bg-[--green-dim] text-[--green] border-r-2 border-[--green]"
                  : "text-[--text-secondary] hover:bg-[--bg-hover] hover:text-[--text-primary]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="font-medium">
                {messages.app.nav[item.key].title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade hint */}
      <div
        style={{
          marginTop:    "auto",
          paddingTop:   "1rem",
          borderTop:    "1px solid var(--border-subtle)",
        }}
      >
        <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
          {messages.common.labels.featureGate}
        </p>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "0.75rem" }}>
          {messages.common.featureGating.upgradeHint}
        </p>
        <Link
          href={"/pricing" as Route}
          style={{
            display:      "block",
            textAlign:    "center",
            fontSize:     "12px",
            fontWeight:   500,
            padding:      "6px 12px",
            borderRadius: "var(--r-pill)",
            border:       "1px solid var(--green-border)",
            background:   "var(--green-dim)",
            color:        "var(--green)",
            transition:   "var(--t-fast)",
          }}
        >
          {messages.common.ctas.comparePlans}
        </Link>
      </div>
    </aside>
  );
}
