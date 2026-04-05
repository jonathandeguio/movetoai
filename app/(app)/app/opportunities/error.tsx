"use client";

import { BusinessStructureErrorState } from "@/components/business-structure/error-state";

export default function OpportunitiesError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <BusinessStructureErrorState error={error} reset={reset} />;
}
