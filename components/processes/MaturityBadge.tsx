import { cn } from "@/lib/utils";
import { getMaturityFromScore } from "@/lib/processes/maturity-calculator";

interface MaturityBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function MaturityBadge({ score, size = "md" }: MaturityBadgeProps) {
  const level = getMaturityFromScore(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
      style={{
        backgroundColor: `${level.color}22`,
        border: `1px solid ${level.color}55`,
        color: level.color,
      }}
    >
      <span
        className={cn("rounded-full shrink-0", size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")}
        style={{ backgroundColor: level.color }}
      />
      {level.label_fr}
    </span>
  );
}
