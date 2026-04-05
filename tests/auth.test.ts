import assert from "node:assert/strict";

import { hashPassword, verifyPassword } from "../lib/password.ts";

const password = "Admin123!";
const storedHash = hashPassword(password);

assert.notEqual(storedHash, password);
assert.equal(storedHash.startsWith("pbkdf2$"), true);
assert.equal(verifyPassword(password, storedHash), true);
assert.equal(verifyPassword("WrongPassword!", storedHash), false);
assert.equal(verifyPassword(password, "invalid"), false);
assert.equal(verifyPassword(password, null), false);

console.log("auth tests passed");
