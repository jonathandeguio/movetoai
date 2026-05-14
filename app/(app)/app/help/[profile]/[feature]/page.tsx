import fs from "fs"
import path from "path"
import type { Route } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

const PROFILE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  executive: "Directeur / Exécutif",
  "business-owner": "Responsable Métier",
  "it-manager": "Responsable IT",
  consultant: "Consultant",
  member: "Collaborateur",
}

const FEATURE_LABELS: Record<string, string> = {
  "getting-started": "Prise en main",
  opportunities: "Opportunités IA",
  "use-cases": "Cas d'usage",
  dashboard: "Tableau de bord",
  "ai-features": "Fonctionnalités IA",
  settings: "Paramètres",
}

const VALID_FEATURES = new Set(Object.keys(FEATURE_LABELS))
const VALID_PROFILES = new Set(Object.keys(PROFILE_LABELS))

function loadMarkdown(feature: string): string {
  try {
    const filePath = path.join(
      process.cwd(),
      "lib",
      "guide",
      "content",
      "fr",
      `${feature}.md`
    )
    return fs.readFileSync(filePath, "utf-8")
  } catch {
    return `# ${FEATURE_LABELS[feature] ?? feature}\n\nCette documentation est en cours de rédaction. Revenez prochainement.`
  }
}

/** Minimal but correct markdown-to-JSX renderer */
function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n")
  const nodes: React.ReactNode[] = []
  let key = 0
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // H1
    if (line.startsWith("# ")) {
      nodes.push(
        <h1 key={key++} style={{
          fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)",
          letterSpacing: "-0.02em", marginBottom: "1rem", marginTop: "0",
        }}>
          {inlineMarkdown(line.slice(2))}
        </h1>
      )
      i++
      continue
    }

    // H2
    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={key++} style={{
          fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)",
          letterSpacing: "-0.01em", marginBottom: "0.75rem", marginTop: "1.75rem",
          paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)",
        }}>
          {inlineMarkdown(line.slice(3))}
        </h2>
      )
      i++
      continue
    }

    // H3
    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={key++} style={{
          fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)",
          marginBottom: "0.5rem", marginTop: "1.25rem",
        }}>
          {inlineMarkdown(line.slice(4))}
        </h3>
      )
      i++
      continue
    }

    // Table detection
    if (line.startsWith("|")) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i])
        i++
      }
      // Filter out separator rows (---|---)
      const rowLines = tableLines.filter(l => !l.match(/^\|[\s\-|]+\|$/))
      const rows = rowLines.map(l =>
        l.split("|").slice(1, -1).map(cell => cell.trim())
      )
      if (rows.length > 0) {
        nodes.push(
          <div key={key++} style={{ overflowX: "auto", marginBottom: "1rem", marginTop: "0.5rem" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse", fontSize: "0.875rem",
            }}>
              <thead>
                <tr>
                  {rows[0].map((cell, ci) => (
                    <th key={ci} style={{
                      padding: "0.625rem 0.875rem", textAlign: "left",
                      color: "var(--text-secondary)", fontWeight: 600,
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}>
                      {inlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{
                        padding: "0.625rem 0.875rem",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border)",
                      }}>
                        {inlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""))
        i++
      }
      nodes.push(
        <ol key={key++} style={{
          paddingLeft: "1.5rem", marginBottom: "1rem", color: "var(--text-primary)",
          fontSize: "0.9375rem", lineHeight: "1.75",
        }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: "0.375rem" }}>{inlineMarkdown(item)}</li>
          ))}
        </ol>
      )
      continue
    }

    // Unordered list
    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <ul key={key++} style={{
          paddingLeft: "1.5rem", marginBottom: "1rem", color: "var(--text-primary)",
          fontSize: "0.9375rem", lineHeight: "1.75",
        }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: "0.375rem" }}>{inlineMarkdown(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Code block
    if (line.startsWith("```")) {
      i++ // skip opening fence
      const codeLines: string[] = []
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing fence
      nodes.push(
        <pre key={key++} style={{
          padding: "1rem 1.25rem", borderRadius: "0.75rem",
          background: "var(--bg-secondary)", border: "1px solid var(--border)",
          fontSize: "0.8125rem", overflowX: "auto", marginBottom: "1rem",
          color: "var(--text-primary)", fontFamily: "monospace",
        }}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      )
      continue
    }

    // Blank line
    if (line.trim() === "") {
      i++
      continue
    }

    // Paragraph
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("-") && !lines[i].startsWith("|") && !/^\d+\.\s/.test(lines[i]) && !lines[i].startsWith("```")) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      nodes.push(
        <p key={key++} style={{
          color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: "1.75",
          marginBottom: "0.875rem",
        }}>
          {inlineMarkdown(paraLines.join(" "))}
        </p>
      )
    }
  }

  return nodes
}

/** Render inline markdown: **bold**, *italic*, `code`, [text](href) */
function inlineMarkdown(text: string): React.ReactNode {
  // We process the string and build segments
  const segments: React.ReactNode[] = []
  let remaining = text
  let segKey = 0

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.*?)\*\*(.*)$/)
    if (boldMatch) {
      if (boldMatch[1]) segments.push(boldMatch[1])
      segments.push(<strong key={segKey++} style={{ fontWeight: 700 }}>{boldMatch[2]}</strong>)
      remaining = boldMatch[3]
      continue
    }

    // Inline code `code`
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/)
    if (codeMatch) {
      if (codeMatch[1]) segments.push(codeMatch[1])
      segments.push(
        <code key={segKey++} style={{
          fontSize: "0.8125em", padding: "1px 5px", borderRadius: "4px",
          background: "var(--bg-secondary)", color: "var(--text-primary)",
          fontFamily: "monospace",
        }}>{codeMatch[2]}</code>
      )
      remaining = codeMatch[3]
      continue
    }

    // Link [text](href)
    const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)$/)
    if (linkMatch) {
      if (linkMatch[1]) segments.push(linkMatch[1])
      segments.push(
        <a key={segKey++} href={linkMatch[3]} style={{ color: "var(--green)", textDecoration: "underline" }}>
          {linkMatch[2]}
        </a>
      )
      remaining = linkMatch[4]
      continue
    }

    // No more patterns
    segments.push(remaining)
    break
  }

  return segments.length === 1 ? segments[0] : <>{segments}</>
}

export default async function FeatureDocPage({
  params,
}: {
  params: Promise<{ profile: string; feature: string }>
}) {
  const { profile, feature } = await params

  if (!VALID_PROFILES.has(profile) || !VALID_FEATURES.has(feature)) {
    notFound()
  }

  const profileLabel = PROFILE_LABELS[profile]
  const featureLabel = FEATURE_LABELS[feature]
  const markdown = loadMarkdown(feature)
  const rendered = renderMarkdown(markdown)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
        <Link href={"/app/help" as Route} style={{ color: "var(--text-secondary)", textDecoration: "none" }} className="hover:opacity-70">
          Aide
        </Link>
        <span>/</span>
        <Link href={`/app/help/${profile}` as Route} style={{ color: "var(--text-secondary)", textDecoration: "none" }} className="hover:opacity-70">
          {profileLabel}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{featureLabel}</span>
      </nav>

      {/* Content card */}
      <div
        style={{
          borderRadius: "1.5rem",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: "2rem 2.5rem",
          boxShadow: "0 1px 4px 0 rgb(0 0 0 / .04)",
        }}
      >
        {rendered}
      </div>

      {/* Back link */}
      <Link
        href={`/app/help/${profile}` as Route}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
          textDecoration: "none",
        }}
        className="hover:opacity-70"
      >
        <ChevronLeft size={16} />
        Retour au guide {profileLabel}
      </Link>
    </div>
  )
}
