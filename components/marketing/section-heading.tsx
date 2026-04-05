import { Badge } from "@/components/ui/badge";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left"
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";

  return (
    <div className={`space-y-4 ${alignment}`}>
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 text-balance md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-base leading-8 text-slate-600 md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
