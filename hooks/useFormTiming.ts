"use client";

import { useRef, useCallback } from "react";

/**
 * Returns the elapsed time (in ms) since the hook was first mounted.
 * Used to detect bot submissions that arrive too fast.
 */
export function useFormTiming() {
  const startedAt = useRef(Date.now());

  const getElapsed = useCallback(() => Date.now() - startedAt.current, []);

  return { getElapsed };
}
