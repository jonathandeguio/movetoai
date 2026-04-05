"use client";

import { BusinessStructureErrorState } from "@/components/business-structure/error-state";

export default function GovernanceErrorPage(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <BusinessStructureErrorState {...props} />;
}
