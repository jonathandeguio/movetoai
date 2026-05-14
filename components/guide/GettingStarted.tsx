"use client"
import type { Route } from "next"
import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X } from "lucide-react"
import { useGettingStarted } from "@/hooks/useGettingStarted"

export function GettingStarted() {
  const { data, isVisible, progress, completeStep, dismiss } = useGettingStarted()
  const [expanded, setExpanded] = useState(true)

  if (!isVisible || !data) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 rounded-xl shadow-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

      {/* Header */}
      <div className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
        style={{ borderBottom: expanded ? "1px solid var(--border)" : "none" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="var(--border)" strokeWidth="2.5" />
              <circle cx="16" cy="16" r="13" fill="none" stroke="var(--green)" strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 13}`}
                strokeDashoffset={`${2 * Math.PI * 13 * (1 - progress / 100)}`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
              style={{ color: "var(--green)" }}>{progress}%</span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Démarrage</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {data.completedCount}/{data.totalCount} étapes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {expanded ? <ChevronDown size={16} style={{ color: "var(--text-secondary)" }} />
            : <ChevronUp size={16} style={{ color: "var(--text-secondary)" }} />}
          <button onClick={(e) => { e.stopPropagation(); dismiss() }} className="ml-1 p-0.5 rounded hover:opacity-70">
            <X size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
      </div>

      {/* Steps */}
      {expanded && (
        <div className="max-h-72 overflow-y-auto">
          {data.steps.map(step => (
            <div key={step.id} className="flex items-start gap-3 p-3 hover:opacity-80 transition-opacity"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <button onClick={() => !step.completedAt && completeStep(step.id)} className="mt-0.5 flex-shrink-0">
                {step.completedAt
                  ? <CheckCircle2 size={18} style={{ color: "var(--green)" }} />
                  : <Circle size={18} style={{ color: "var(--text-secondary)" }} />
                }
              </button>
              <div className="flex-1 min-w-0">
                <Link href={step.href as Route}>
                  <p className={`text-sm font-medium ${step.completedAt ? "line-through opacity-60" : ""}`}
                    style={{ color: "var(--text-primary)" }}>{step.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
