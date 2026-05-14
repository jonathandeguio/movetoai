import type { TourStep } from "./admin.tour";

export type { TourStep };

export { adminTour } from "./admin.tour";
export { executiveTour } from "./executive.tour";
export { businessOwnerTour } from "./business-owner.tour";
export { itManagerTour } from "./it-manager.tour";
export { consultantTour } from "./consultant.tour";
export { memberTour } from "./member.tour";

import { adminTour } from "./admin.tour";
import { executiveTour } from "./executive.tour";
import { businessOwnerTour } from "./business-owner.tour";
import { itManagerTour } from "./it-manager.tour";
import { consultantTour } from "./consultant.tour";
import { memberTour } from "./member.tour";

export const TOURS_BY_ROLE: Record<string, TourStep[]> = {
  // New role codes
  workspace_admin:       adminTour,
  transformation_manager: executiveTour,
  enterprise_architect:  itManagerTour,
  // Legacy aliases
  admin:             adminTour,
  "super-admin":     adminTour,
  executive:         executiveTour,
  "business-owner":  businessOwnerTour,
  "it-manager":      itManagerTour,
  consultant:        consultantTour,
  member:            memberTour,
};

export function getTourForRole(role: string): TourStep[] {
  const normalized = role.toLowerCase().replace(/_/g, "-");
  // Try normalized first, then original
  return TOURS_BY_ROLE[normalized] ?? TOURS_BY_ROLE[role] ?? TOURS_BY_ROLE["member"];
}
