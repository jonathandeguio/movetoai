"use client";

import type { RecommendedProcess } from "@/lib/claude";

type ProcessCardProps = {
  process: RecommendedProcess;
  isSelected: boolean;
  isLocked: boolean;
  onToggle: (id: string) => void;
  copy: {
    gainLabel: string;
    complexityLabel: string;
    complexity: { low: string; medium: string; high: string };
  };
};

const COMPLEXITY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  low:    { bg: "--green-dim",  color: "--green",  border: "--green-border"  },
  medium: { bg: "--amber-dim",  color: "--amber",  border: "--amber-border"  },
  high:   { bg: "--red-dim",    color: "--red",    border: "--red-dim"       },
};

export function ProcessCard({
  process,
  isSelected,
  isLocked,
  onToggle,
  copy,
}: ProcessCardProps) {
  const complexity = COMPLEXITY_STYLES[process.complexity] ?? COMPLEXITY_STYLES.medium;

  return (
    <button
      type="button"
      onClick={() => onToggle(process.id)}
      disabled={isLocked}
      aria-pressed={isSelected}
      style={{
        width: "100%",
        borderRadius: "var(--r-xl)",
        border: isSelected ? "1px solid var(--green-border)" : "1px solid var(--border)",
        background: isSelected ? "var(--green-dim)" : "var(--bg-card)",
        padding: "1rem",
        textAlign: "left",
        transition: "border-color var(--t-fast), background var(--t-fast)",
        cursor: isLocked ? "not-allowed" : "pointer",
        opacity: isLocked ? 0.5 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[--text-muted]">
              {process.domain}
            </span>
            <span
              style={{
                borderRadius: "var(--r-sm)",
                border: `1px solid var(${complexity.border})`,
                background: `var(${complexity.bg})`,
                color: `var(${complexity.color})`,
                padding: "1px 8px",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {copy.complexityLabel}: {copy.complexity[process.complexity]}
            </span>
          </div>

          <p className="text-base font-semibold text-[--text-primary]">
            {process.label}
          </p>
          <p className="text-sm leading-6 text-[--text-secondary]">
            {process.description}
          </p>

          <p className="text-xs font-medium text-[--green]">
            {copy.gainLabel}: {process.estimated_gain}
          </p>
        </div>

        <div
          style={{
            marginTop: "2px",
            width: "20px",
            height: "20px",
            flexShrink: 0,
            borderRadius: "var(--r-sm)",
            border: isSelected ? "1px solid var(--green)" : "1px solid var(--border)",
            background: isSelected ? "var(--green)" : "var(--bg-input)",
          }}
        />
      </div>
    </button>
  );
}
