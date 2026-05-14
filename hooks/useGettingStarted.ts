"use client"
import { useState, useEffect, useCallback } from "react"

interface ChecklistStep {
  id: string
  label: string
  description: string
  href: string
  completedAt: string | null
}

interface ChecklistData {
  steps: ChecklistStep[]
  completedCount: number
  totalCount: number
}

export function useGettingStarted() {
  const [data, setData] = useState<ChecklistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/guide/checklist")
      if (res.ok) {
        const json = await res.json()
        setData(json)
        // Show widget if not all steps done
        if (json.completedCount < json.totalCount) {
          setIsVisible(true)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const completeStep = useCallback(async (stepId: string) => {
    await fetch("/api/guide/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId }),
    })
    await load()
  }, [load])

  const dismiss = useCallback(() => setIsVisible(false), [])

  const progress = data ? Math.round((data.completedCount / data.totalCount) * 100) : 0

  return { data, loading, isVisible, progress, completeStep, dismiss }
}
