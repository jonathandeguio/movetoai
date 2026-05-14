"use client";

type Strength = 0 | 1 | 2 | 3 | 4;

function getStrength(password: string): Strength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score as Strength;
}

const LABELS: Record<Strength, string> = {
  0: "",
  1: "Faible",
  2: "Moyen",
  3: "Bon",
  4: "Fort",
};

const COLORS: Record<Strength, string> = {
  0: "bg-[--bg-hover]",
  1: "bg-[--red]",
  2: "bg-[--amber]",
  3: "bg-[--blue]",
  4: "bg-[--green]",
};

type PasswordStrengthIndicatorProps = {
  password: string;
};

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = getStrength(password);
  const label = LABELS[strength];

  return (
    <div role="status" aria-live="polite" className="space-y-1.5">
      <div className="flex gap-1">
        {([1, 2, 3, 4] as Strength[]).map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              strength >= level ? COLORS[strength] : "bg-[--bg-hover]"
            }`}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs font-medium text-[--text-muted]">
          Force du mot de passe :{" "}
          <span
            className={
              strength <= 1
                ? "text-[--red]"
                : strength === 2
                ? "text-[--amber]"
                : strength === 3
                ? "text-[--blue]"
                : "text-[--green]"
            }
          >
            {label}
          </span>
        </p>
      )}
    </div>
  );
}
