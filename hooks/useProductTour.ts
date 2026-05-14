"use client"
import { useState, useCallback } from "react"
import type { TourStep } from "@/lib/guide/tours"

export function useProductTour() {
  const [isRunning, setIsRunning] = useState(false)

  const startTour = useCallback(async (steps: TourStep[], onComplete?: () => void) => {
    if (typeof window === "undefined") return
    setIsRunning(true)
    try {
      const { driver } = await import("driver.js")
      // @ts-ignore — CSS module import for driver.js styles
      await import("driver.js/dist/driver.css")

      const driverObj = driver({
        showProgress: true,
        progressText: "{{current}} / {{total}}",
        nextBtnText: "Suivant →",
        prevBtnText: "← Précédent",
        doneBtnText: "Terminer",
        animate: true,
        overlayColor: "#060810",
        overlayOpacity: 0.85,
        steps: steps.map(s => ({
          element: s.element,
          popover: {
            ...s.popover,
            className: "movetoai-tour-popover",
          }
        })),
        onDestroyed: () => {
          setIsRunning(false)
          onComplete?.()
        }
      })
      driverObj.drive()
    } catch (e) {
      console.error("Tour failed to load", e)
      setIsRunning(false)
    }
  }, [])

  const stopTour = useCallback(async () => {
    // driver.js doesn't expose a global instance easily — we rely on onDestroyed
    setIsRunning(false)
  }, [])

  return { isRunning, startTour, stopTour }
}
