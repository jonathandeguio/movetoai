async function run() {
  await import("./auth.test.ts");
  await import("./protected-routes.test.ts");
  await import("./scoring.test.ts");
  await import("./plan-gating.test.ts");

  console.log("all core tests passed");
}

void run();
