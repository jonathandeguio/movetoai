/**
 * Fine-grained permission helpers for the Opportunity & UseCase modules.
 *
 * Role codes (4-role model):
 *   WORKSPACE_ADMIN       – workspace operator
 *   ENTERPRISE_ARCHITECT  – process/data/tech mapping expert
 *   TRANSFORMATION_MANAGER – intake + prioritisation + governance
 */

type RoleCode = string;

const ADMIN_ROLES    = ["WORKSPACE_ADMIN"] as const;
const PORTFOLIO_ROLES = ["WORKSPACE_ADMIN", "TRANSFORMATION_MANAGER"] as const;

// ── Opportunities ─────────────────────────────────────────────────────────────

/**
 * Can the user create a new opportunity?
 */
export function canCreateOpportunity(role: RoleCode): boolean {
  return [
    "WORKSPACE_ADMIN",
    "TRANSFORMATION_MANAGER",
    "ENTERPRISE_ARCHITECT",
  ].includes(role);
}

/**
 * Can the user submit a terrain signal (simplified intake)?
 */
export function canSubmitTerrainSignal(role: RoleCode): boolean {
  return canCreateOpportunity(role);
}

/**
 * Can the user read the full opportunity list?
 */
export function canReadOpportunities(_role: RoleCode): boolean {
  return true;
}

/**
 * Can the user edit an opportunity?
 */
export function canEditOpportunity(
  role: RoleCode,
  _options?: { userDomain?: string; opportunityDomain?: string }
): boolean {
  return [
    "WORKSPACE_ADMIN",
    "TRANSFORMATION_MANAGER",
    "ENTERPRISE_ARCHITECT",
  ].includes(role);
}

/**
 * Can the user validate (approve) an opportunity?
 */
export function canValidateOpportunity(role: RoleCode): boolean {
  return ["WORKSPACE_ADMIN", "TRANSFORMATION_MANAGER"].includes(role);
}

/**
 * Can the user reject an opportunity?
 */
export function canRejectOpportunity(role: RoleCode): boolean {
  return ["WORKSPACE_ADMIN", "TRANSFORMATION_MANAGER"].includes(role);
}

/**
 * Can the user convert a validated opportunity to a use case?
 */
export function canConvertToUseCase(
  role: RoleCode,
  _options?: { userDomain?: string; opportunityDomain?: string }
): boolean {
  return [
    "WORKSPACE_ADMIN",
    "TRANSFORMATION_MANAGER",
    "ENTERPRISE_ARCHITECT",
  ].includes(role);
}

// ── Use Cases ──────────────────────────────────────────────────────────────────

/**
 * Can the user read the full use case list?
 */
export function canReadUseCases(_role: RoleCode): boolean {
  return true;
}

/**
 * Can the user edit the business sections of a use case?
 */
export function canEditUseCase(
  role: RoleCode,
  _options?: { userDomain?: string; useCaseDomain?: string }
): boolean {
  return [
    "WORKSPACE_ADMIN",
    "TRANSFORMATION_MANAGER",
    "ENTERPRISE_ARCHITECT",
  ].includes(role);
}

/**
 * Can the user edit the technical section of a use case?
 */
export function canEditTechnicalSection(role: RoleCode): boolean {
  return ["WORKSPACE_ADMIN", "ENTERPRISE_ARCHITECT"].includes(role);
}

/**
 * Can the user validate (go/no-go) a use case?
 */
export function canValidateUseCase(role: RoleCode): boolean {
  return ["WORKSPACE_ADMIN", "TRANSFORMATION_MANAGER"].includes(role);
}

/**
 * Can the user update real post-deployment metrics?
 */
export function canUpdateRealMetrics(role: RoleCode): boolean {
  return [
    "WORKSPACE_ADMIN",
    "TRANSFORMATION_MANAGER",
    "ENTERPRISE_ARCHITECT",
  ].includes(role);
}

/**
 * Can the user trigger AI scans / Claude actions?
 */
export function canTriggerAIScan(role: RoleCode): boolean {
  return [
    "WORKSPACE_ADMIN",
    "TRANSFORMATION_MANAGER",
    "ENTERPRISE_ARCHITECT",
  ].includes(role);
}
