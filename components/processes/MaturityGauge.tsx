import { getMaturityFromScore } from "@/lib/processes/maturity-calculator";

interface MaturityGaugeProps {
  score: number;
  size?: number;
}

export function MaturityGauge({ score, size = 100 }: MaturityGaugeProps) {
  const level = getMaturityFromScore(score);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-label={`Score de maturité : ${score}/100`}
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={8}
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={level.color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        {/* Score text — counter-rotate to keep it upright */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            fill: level.color,
            fontSize: size * 0.2,
            fontWeight: 700,
            fontFamily: "inherit",
          }}
        >
          {score}
        </text>
      </svg>
      <span
        className="text-xs font-medium text-center leading-tight"
        style={{ color: level.color, maxWidth: size }}
      >
        {level.label_fr}
      </span>
    </div>
  );
}
