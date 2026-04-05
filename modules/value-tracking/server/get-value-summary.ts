import "server-only";

import type { ValueSummary, ValueTableItem } from "@/modules/value-tracking/model/value.types";

export function getValueSummary(items: ValueTableItem[]): ValueSummary {
  const totalExpectedValue = items.reduce((sum, item) => sum + item.expectedValue, 0);
  const totalRealizedValue = items.reduce((sum, item) => sum + item.realizedValue, 0);
  const adoptionValues = items
    .map((item) => item.adoption)
    .filter((value): value is number => value !== null);

  const adoptionOverview =
    adoptionValues.length > 0
      ? adoptionValues.reduce((sum, value) => sum + value, 0) / adoptionValues.length
      : null;

  return {
    totalExpectedValue,
    totalRealizedValue,
    adoptionOverview
  };
}
