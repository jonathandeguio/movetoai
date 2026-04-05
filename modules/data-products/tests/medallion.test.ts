import assert from "node:assert/strict";

import { DataProductMedallionStage } from "../domain/data-product.enums.ts";
import {
  deriveMedallionDescription,
  deriveMedallionLabel,
} from "../domain/medallion.ts";

assert.equal(deriveMedallionLabel(DataProductMedallionStage.BRONZE), "Bronze");
assert.equal(deriveMedallionLabel(DataProductMedallionStage.SILVER), "Silver");
assert.equal(
  deriveMedallionDescription(DataProductMedallionStage.GOLD),
  "Trusted and reusable for reporting and production-oriented AI.",
);

console.log("data products medallion tests passed");
