"use client"
import { useState } from "react"
import { Search } from "lucide-react"

const HELP_TOPICS = [
  { label: "Créer une opportunité IA", href: "/app/help/admin/opportunities" },
  { label: "Configurer le Tech Radar", href: "/app/help/admin/settings" },
  { label: "Comprendre le score de maturité", href: "/app/help/member/getting-started" },
  { label: "Utiliser le Copilot IA", href: "/app/help/member/ai-features" },
  { label: "Gérer les webhooks", href: "/app/help/admin/settings" },
  { label: "Lancer un assessment", href: "/app/help/member/getting-started" },
  { label: "Inviter des membres", href: "/app/help/admin/settings" },
  { label: "Créer un scénario IA", href: "/app/help/consultant/getting-started" },
]

export function HelpSearch() {
  const [query, setQuery] = useState("")

  const results = query.length > 1
    ? HELP_TOPICS.filter(t => t.label.toLowerCase().includes(query.toLowerCase()))
    : []

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <Search size={18} style={{ color: "var(--text-secondary)" }} />
        <input
          type="text"
          placeholder="Rechercher dans la documentation…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--text-primary)" }}
        />
      </div>
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-xl shadow-xl overflow-hidden z-10"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {results.map(r => (
            <a key={r.href} href={r.href}
              className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity text-sm"
              style={{ borderBottom: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <Search size={14} style={{ color: "var(--text-secondary)" }} />
              {r.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
