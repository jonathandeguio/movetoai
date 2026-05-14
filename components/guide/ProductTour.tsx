"use client"
import { useEffect } from "react"
import { useProductTour } from "@/hooks/useProductTour"
import type { TourStep } from "@/lib/guide/tours"

interface Props {
  tourId: string
  steps: TourStep[]
  autoStart?: boolean
}

export function ProductTour({ tourId, steps, autoStart = false }: Props) {
  const { startTour } = useProductTour()

  useEffect(() => {
    if (!autoStart) return
    let cancelled = false

    async function checkAndStart() {
      try {
        const res = await fetch("/api/guide/progress")
        if (!res.ok) return
        const data = await res.json()
        const completed: string[] = data.toursCompleted ?? []
        const dismissed: string[] = data.toursDismissed ?? []
        if (completed.includes(tourId) || dismissed.includes(tourId)) return
        if (cancelled) return
        await startTour(steps, () => {
          fetch("/api/guide/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "complete_tour", tourId }),
          }).catch(() => {})
        })
      } catch {
        // ignore
      }
    }

    // Small delay to let the page render before starting tour
    const timer = setTimeout(checkAndStart, 800)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [autoStart, tourId, steps, startTour])

  return null
}
