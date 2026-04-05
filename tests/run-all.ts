async function run() {
  await import("../modules/data-products/tests/medallion.test.ts");
  await import("../modules/data-products/tests/readiness.test.ts");
  await import("../modules/data-products/tests/data-product-list.test.ts");
  await import("./auth.test.ts");
  await import("./protected-routes.test.ts");
  await import("./scoring.test.ts");
  await import("./plan-gating.test.ts");

  console.log("all core tests passed");
}

void run();
