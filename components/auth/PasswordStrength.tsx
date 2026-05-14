"use client";

interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const RULES: Rule[] = [
  { label: "8 caractères minimum", test: (pw) => pw.length >= 8 },
  { label: "Une majuscule", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Un chiffre", test: (pw) => /\d/.test(pw) },
  { label: "Un caractère spécial", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const LEVELS = [
  { label: "Faible",  color: "var(--red)" },
  { label: "Moyen",   color: "var(--amber)" },
  { label: "Fort",    color: "var(--green)" },
];

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const passed = RULES.filter((r) => r.test(password)).length;
  // 0-1 → level 0, 2-3 → level 1, 4 → level 2
  const level = passed <= 1 ? 0 : passed <= 3 ? 1 : 2;
  const { label, color } = LEVELS[level];

  return (
    <div className="space-y-2 pt-1">
      {/* Segment bar */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i <= level ? color : "var(--border)",
            }}
          />
        ))}
      </div>

      {/* Level label */}
      <p className="text-xs font-medium" style={{ color }}>
        {label}
      </p>

      {/* Rules checklist */}
      <ul className="space-y-0.5">
        {RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className="flex items-center gap-1.5 text-xs">
              <span style={{ color: ok ? "var(--green)" : "var(--text-disabled)" }}>
                {ok ? "✓" : "○"}
              </span>
              <span style={{ color: ok ? "var(--text-secondary)" : "var(--text-muted)" }}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
