import type { Route } from "next"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

interface Props {
  icon: LucideIcon
  title: string
  description: string
  href: string
  color?: string
}

export function FeatureCard({ icon: Icon, title, description, href, color = "var(--green)" }: Props) {
  return (
    <Link href={href as Route}
      className="block p-5 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-lg flex-shrink-0" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{description}</p>
        </div>
      </div>
      <p className="mt-3 text-xs font-medium" style={{ color }}>Voir le guide →</p>
    </Link>
  )
}
