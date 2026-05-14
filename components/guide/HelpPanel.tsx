"use client"
import type { Route } from "next"
import { X, BookOpen, Search, Keyboard } from "lucide-react"
import Link from "next/link"

interface Props {
  isOpen: boolean
  onClose: () => void
  activeTab: "search" | "guide" | "shortcuts"
  onTabChange: (tab: "search" | "guide" | "shortcuts") => void
}

export function HelpPanel({ isOpen, onClose, activeTab, onTabChange }: Props) {
  if (!isOpen) return null

  const QUICK_LINKS = [
    { label: "Créer une opportunité IA", href: "/app/opportunities/new" },
    { label: "Lancer un assessment", href: "/app/assessments" },
    { label: "Voir le Tech Radar", href: "/app/insights/tech-radar" },
    { label: "Configurer les webhooks", href: "/app/admin/webhooks" },
    { label: "Consulter l'audit log", href: "/app/admin/audit" },
  ]

  const SHORTCUTS = [
    { keys: ["Cmd", "K"], label: "Recherche globale" },
    { keys: ["?"], label: "Ouvrir l'aide" },
    { keys: ["Esc"], label: "Fermer les modales" },
    { keys: ["G", "D"], label: "Aller au Dashboard" },
    { keys: ["G", "O"], label: "Aller aux Opportunités" },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 z-50 flex flex-col shadow-2xl"
        style={{ background: "var(--bg-card)", borderLeft: "1px solid var(--border)" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Centre d'aide</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity">
            <X size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
          {([
            { id: "guide", label: "Guide", icon: BookOpen },
            { id: "search", label: "Recherche", icon: Search },
            { id: "shortcuts", label: "Raccourcis", icon: Keyboard },
          ] as const).map(tab => (
            <button key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors"
              style={{
                color: activeTab === tab.id ? "var(--green)" : "var(--text-secondary)",
                borderBottom: activeTab === tab.id ? "2px solid var(--green)" : "2px solid transparent",
              }}>
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {activeTab === "guide" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                  LIENS RAPIDES
                </h3>
                <div className="space-y-2">
                  {QUICK_LINKS.map(link => (
                    <Link key={link.href} href={link.href as Route} onClick={onClose}
                      className="flex items-center gap-2 p-3 rounded-lg hover:opacity-80 transition-opacity text-sm"
                      style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                      → {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                  DOCUMENTATION
                </h3>
                <Link href={"/app/help" as Route} onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-lg text-sm font-medium"
                  style={{ background: "var(--bg-secondary)", color: "var(--green)" }}>
                  <span>Ouvrir le centre d'aide complet</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Utilisez <kbd className="px-1.5 py-0.5 rounded text-xs font-mono"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>Cmd+K</kbd> pour la recherche globale.
              </p>
              <Link href={"/app/help" as Route} onClick={onClose}
                className="block p-3 rounded-lg text-sm"
                style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                Rechercher dans la documentation →
              </Link>
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div className="space-y-3">
              {SHORTCUTS.map(sc => (
                <div key={sc.label} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "var(--bg-secondary)" }}>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{sc.label}</span>
                  <div className="flex gap-1">
                    {sc.keys.map(k => (
                      <kbd key={k} className="px-2 py-1 rounded text-xs font-mono"
                        style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href={"/app/help" as Route} onClick={onClose}
            className="block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--green)", color: "#000" }}>
            Documentation complète
          </Link>
        </div>
      </div>
    </>
  )
}
