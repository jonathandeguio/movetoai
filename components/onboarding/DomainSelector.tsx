"use client";

type DomainSelectorProps = {
  domains: string[];
  selected: string[];
  maxSelectable: number;
  onToggle: (domain: string) => void;
};

export function DomainSelector({
  domains,
  selected,
  maxSelectable,
  onToggle,
}: DomainSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {domains.map((domain) => {
        const isSelected = selected.includes(domain);
        const isLocked = !isSelected && selected.length >= maxSelectable;

        return (
          <button
            key={domain}
            type="button"
            onClick={() => onToggle(domain)}
            disabled={isLocked}
            aria-pressed={isSelected}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
              isSelected
                ? "border-[--green-border] bg-[--green-dim] text-[--green] shadow-soft-sm"
                : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--green-border] hover:bg-[--bg-hover]"
            } ${isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {domain}
          </button>
        );
      })}
    </div>
  );
}
