"use client"
import type { Route } from "next"
import { useState, useRef } from "react"
import type { TooltipContent } from "@/lib/guide/tooltips"
import Link from "next/link"

interface Props {
  content: TooltipContent
  children: React.ReactNode
  position?: "top" | "bottom" | "left" | "right"
}

export function GuideTooltip({ content, children, position = "top" }: Props) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="relative inline-flex" ref={ref}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className={`absolute z-50 w-[280px] rounded-lg border p-3 shadow-xl text-sm
          ${position === "top" ? "bottom-full mb-2 left-1/2 -translate-x-1/2" : ""}
          ${position === "bottom" ? "top-full mt-2 left-1/2 -translate-x-1/2" : ""}
          ${position === "left" ? "right-full mr-2 top-1/2 -translate-y-1/2" : ""}
          ${position === "right" ? "left-full ml-2 top-1/2 -translate-y-1/2" : ""}
        `}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{content.title}</p>
          <p style={{ color: "var(--text-secondary)" }}>{content.description}</p>
          {content.learnMoreHref && (
            <Link href={content.learnMoreHref as Route} className="mt-2 inline-block text-xs font-medium"
              style={{ color: "var(--green)" }}>
              En savoir plus →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
