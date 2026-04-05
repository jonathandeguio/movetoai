import assert from "node:assert/strict";

import { getRouteProtectionRedirect } from "../modules/auth/server/route-protection.ts";

assert.equal(getRouteProtectionRedirect("/app", false), "/login?from=%2Fapp");
assert.equal(getRouteProtectionRedirect("/app", true), null);
assert.equal(getRouteProtectionRedirect("/onboarding", false), "/login?from=%2Fonboarding");
assert.equal(getRouteProtectionRedirect("/pricing", false), null);
assert.equal(getRouteProtectionRedirect("/login", false), null);

console.log("protected route tests passed");
