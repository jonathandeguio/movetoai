import assert from "node:assert/strict";

import {
  DataProductMedallionStage,
  DataProductReadinessStatus,
} from "../domain/data-product.enums.ts";
import {
  mapListReadinessFilter,
  mapListReadinessStatus,
  normalizeDataProductListSearch,
  toDataProductListItemViewModel,
} from "../server/data-product-list.helpers.ts";

assert.equal(normalizeDataProductListSearch("  Claims data  "), "Claims data");
assert.equal(normalizeDataProductListSearch("   "), undefined);

assert.equal(mapListReadinessFilter(DataProductReadinessStatus.DRAFT), "NOT_READY");
assert.equal(
  mapListReadinessFilter(DataProductReadinessStatus.IN_PROGRESS),
  "PARTIALLY_READY",
);
assert.equal(mapListReadinessFilter(DataProductReadinessStatus.READY), "READY");

assert.equal(mapListReadinessStatus("NOT_READY"), DataProductReadinessStatus.DRAFT);
assert.equal(
  mapListReadinessStatus("PARTIALLY_READY"),
  DataProductReadinessStatus.IN_PROGRESS,
);

const item = toDataProductListItemViewModel({
  id: "dp_1",
  name: "Claims operations product",
  description: "Supports claims intake and triage.",
  medallionStage: DataProductMedallionStage.SILVER,
  readinessStatus: "PARTIALLY_READY",
  _count: {
    processLinks: 2,
    opportunityLinks: 3,
    reportingAssets: 1,
  },
});

assert.equal(item.name, "Claims operations product");
assert.equal(item.medallionStage, DataProductMedallionStage.SILVER);
assert.equal(item.readinessStatus, DataProductReadinessStatus.IN_PROGRESS);
assert.equal(item.processCount, 2);
assert.equal(item.opportunityCount, 3);
assert.equal(item.reportingAssetCount, 1);

console.log("data products list tests passed");
