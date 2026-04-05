"use client";

import { BusinessStructureErrorState } from "@/components/business-structure/error-state";

export default function DataProductsErrorPage(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <BusinessStructureErrorState {...props} />;
}
