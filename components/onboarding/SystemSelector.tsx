"use client";

import { Check } from "lucide-react";

export type SystemOption = {
  id: string;
  label: string;
  category: string;
};

type SystemSelectorProps = {
  systems: SystemOption[];
  selected: string[];
  onToggle: (id: string) => void;
};

export function SystemSelector({ systems, selected, onToggle }: SystemSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {systems.map((system) => {
        const isSelected = selected.includes(system.id);
        return (
          <button
            key={system.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(system.id)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
              isSelected
                ? "border-[--blue-border] bg-[--blue-dim] text-[--blue]"
                : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--blue-border] hover:bg-[--blue-dim]"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                isSelected
                  ? "border-[--blue] bg-[--blue] text-[--on-green]"
                  : "border-[--border]"
              }`}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </span>
            <span className="flex-1">
              <span className="font-medium">{system.label}</span>
              <span className="block text-xs text-[--text-muted]">
                {system.category}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
