export type WorkspacePlanType = "FREE" | "PRO" | "ENTERPRISE";

export type QuotaSnapshot = {
  allowedValue: number | null;
  consumedValue: number;
};
