/**
 * Can the user edit the BPMN process diagram?
 */
export function canEditProcessDiagram(role: string): boolean {
  return [
    "WORKSPACE_ADMIN",
    "ENTERPRISE_ARCHITECT",
    "TRANSFORMATION_MANAGER",
  ].includes(role);
}

/**
 * Can the user view (read-only) the BPMN process diagram?
 */
export function canViewProcessDiagram(_role: string): boolean {
  return true;
}
