"use client"
import { useState, useCallback } from "react"

export function useHelpPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"search" | "guide" | "shortcuts">("guide")

  const open = useCallback((tab?: "search" | "guide" | "shortcuts") => {
    setIsOpen(true)
    if (tab) setActiveTab(tab)
    // Record help open in API
    fetch("/api/guide/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open_help" }),
    }).catch(() => {})
  }, [])

  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(v => !v), [])

  return { isOpen, activeTab, setActiveTab, open, close, toggle }
}
