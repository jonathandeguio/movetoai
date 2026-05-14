import { cn } from "@/lib/utils";

// ── Opportunity statuses ──────────────────────────────────────────────────────

type OppStatus = "DRAFT" | "VALIDATED" | "CONVERTED" | "REJECTED" |
  "IDENTIFIED" | "ASSESSING" | "PRIORITIZED" | "APPROVED" |
  "IN_PROGRESS" | "LIVE" | "BLOCKED" | "ARCHIVED";

const OPP_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT:      { label: "Brouillon",  className: "bg-[--bg-hover]    text-[--text-secondary] border-[--border]"       },
  IDENTIFIED: { label: "Identifiée", className: "bg-[--blue-dim]    text-[--blue]           border-[--blue-border]"  },
  ASSESSING:  { label: "En analyse", className: "bg-[--amber-dim]   text-[--amber]          border-[--amber-dim]"    },
  PRIORITIZED:{ label: "Priorisée",  className: "bg-[--purple-dim]  text-[--purple]         border-[--purple-border]"},
  APPROVED:   { label: "Approuvée",  className: "bg-[--green-dim]   text-[--green]          border-[--green-border]" },
  VALIDATED:  { label: "Validée",    className: "bg-[--green-dim]   text-[--green]          border-[--green-border]" },
  IN_PROGRESS:{ label: "En cours",   className: "bg-[--blue-dim]    text-[--blue]           border-[--blue-border]"  },
  LIVE:       { label: "Live",       className: "bg-[--green-dim]   text-[--green]          border-[--green-border]" },
  CONVERTED:  { label: "Convertie",  className: "bg-[--purple-dim]  text-[--purple]         border-[--purple-border]"},
  REJECTED:   { label: "Rejetée",    className: "bg-[--red-dim]     text-[--red]            border-[--red-dim]"      },
  BLOCKED:    { label: "Bloquée",    className: "bg-[--red-dim]     text-[--red]            border-[--red-dim]"      },
  ARCHIVED:   { label: "Archivée",   className: "bg-[--bg-hover]    text-[--text-muted]     border-[--border]"       },
};

// ── Use case statuses ─────────────────────────────────────────────────────────

const UC_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  backlog:  { label: "Backlog",    className: "bg-[--bg-hover]   text-[--text-secondary] border-[--border]"       },
  analysis: { label: "En analyse", className: "bg-[--amber-dim]  text-[--amber]          border-[--amber-dim]"    },
  active:   { label: "Actif",      className: "bg-[--blue-dim]   text-[--blue]           border-[--blue-border]"  },
  deployed: { label: "Déployé",    className: "bg-[--green-dim]  text-[--green]          border-[--green-border]" },
  paused:   { label: "Pausé",      className: "bg-[--amber-dim]  text-[--amber]          border-[--amber-dim]"    },
};

const BASE = "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-[11px] font-medium";

interface OpportunityStatusBadgeProps {
  status: OppStatus | string;
  className?: string;
}

export function OpportunityStatusBadge({ status, className }: OpportunityStatusBadgeProps) {
  const config = OPP_STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-[--bg-hover] text-[--text-secondary] border-[--border]",
  };
  return (
    <span className={cn(BASE, config.className, className)}>
      {config.label}
    </span>
  );
}

interface UseCaseStatusBadgeProps {
  status: string;
  className?: string;
}

export function UseCaseStatusBadge({ status, className }: UseCaseStatusBadgeProps) {
  const config = UC_STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-[--bg-hover] text-[--text-secondary] border-[--border]",
  };
  return (
    <span className={cn(BASE, config.className, className)}>
      {config.label}
    </span>
  );
}

export { OPP_STATUS_CONFIG, UC_STATUS_CONFIG };
