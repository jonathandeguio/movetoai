import assert from "node:assert/strict";

import {
  DataProductMedallionStage,
  DataProductReadinessStatus,
} from "../domain/data-product.enums.ts";
import {
  deriveDataProductReadiness,
  deriveFreshnessTier,
  deriveReadinessBadgeVariant,
  deriveReadinessLabel,
} from "../domain/readiness.ts";
import {
  deriveMedallionDescription,
  deriveMedallionLabel,
} from "../domain/medallion.ts";

assert.equal(
  deriveMedallionLabel(DataProductMedallionStage.BRONZE),
  "Bronze",
);
assert.equal(
  deriveMedallionDescription(DataProductMedallionStage.GOLD),
  "Trusted and reusable for reporting and production-oriented AI.",
);

assert.equal(
  deriveReadinessLabel(DataProductReadinessStatus.IN_PROGRESS),
  "In Progress",
);
assert.equal(
  deriveReadinessBadgeVariant(DataProductReadinessStatus.READY),
  "success",
);

assert.equal(deriveFreshnessTier("hourly sync"), "LIVE");
assert.equal(deriveFreshnessTier("daily refresh"), "RECENT");
assert.equal(deriveFreshnessTier("manual upload"), "MANUAL");
assert.equal(deriveFreshnessTier(null), "NONE");

const certified = deriveDataProductReadiness({
  medallionStage: DataProductMedallionStage.GOLD,
  freshness: "daily refresh",
  qualitySignalCount: 3,
  reportingAssetCount: 2,
});

assert.equal(certified.status, DataProductReadinessStatus.CERTIFIED);
assert.equal(certified.badgeVariant, "success");
assert.equal(certified.hasQualitySignals, true);
assert.equal(certified.hasReportingAssets, true);

const ready = deriveDataProductReadiness({
  medallionStage: DataProductMedallionStage.SILVER,
  freshness: "weekly refresh",
  qualitySignalCount: 1,
  reportingAssetCount: 0,
});

assert.equal(ready.status, DataProductReadinessStatus.READY);
assert.equal(ready.freshnessTier, "PERIODIC");

const inProgress = deriveDataProductReadiness({
  medallionStage: DataProductMedallionStage.BRONZE,
  freshness: "manual upload",
  qualitySignalCount: 0,
  reportingAssetCount: 0,
});

assert.equal(inProgress.status, DataProductReadinessStatus.IN_PROGRESS);
assert.equal(inProgress.badgeVariant, "warning");

const draft = deriveDataProductReadiness({
  medallionStage: DataProductMedallionStage.BRONZE,
  freshness: null,
  qualitySignalCount: 0,
  reportingAssetCount: 0,
});

assert.equal(draft.status, DataProductReadinessStatus.DRAFT);
assert.equal(draft.label, "Draft");

console.log("data products readiness tests passed");
