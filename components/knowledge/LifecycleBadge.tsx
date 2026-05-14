const LIFECYCLE_COLORS: Record<string, string> = {
  plan:      "bg-[--blue-dim] text-[--blue] border-[--blue-dim]",
  active:    "bg-[--green-dim] text-[--green] border-[--green-border]",
  tolerate:  "bg-[--amber-dim] text-[--amber] border-[--amber-border]",
  phaseout:  "bg-[--red-dim] text-[--red] border-[--red-dim]",
  retire:    "bg-[--bg-hover] text-[--text-muted] border-[--border]",
};

const LIFECYCLE_LABELS: Record<string, string> = {
  plan:      "Planifiée",
  active:    "Active",
  tolerate:  "Tolérée",
  phaseout:  "En retrait",
  retire:    "Retirée",
};

type LifecycleBadgeProps = {
  lifecycle: string | null | undefined;
  className?: string;
};

export function LifecycleBadge({ lifecycle, className = "" }: LifecycleBadgeProps) {
  if (!lifecycle) {
    return (
      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium bg-[--bg-hover] text-[--text-muted] border-[--border] ${className}`}>
        Non défini
      </span>
    );
  }

  const key = lifecycle.toLowerCase();
  const colorClass = LIFECYCLE_COLORS[key] ?? "bg-[--bg-hover] text-[--text-muted] border-[--border]";
  const label = LIFECYCLE_LABELS[key] ?? lifecycle;

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  );
}
