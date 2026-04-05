import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";

const PBKDF2_ITERATIONS = 310_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);

  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) {
    return false;
  }

  const [algorithm, rawIterations, salt, hashHex] = storedHash.split("$");

  if (algorithm !== "pbkdf2" || !rawIterations || !salt || !hashHex) {
    return false;
  }

  const iterations = Number.parseInt(rawIterations, 10);

  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const expected = Buffer.from(hashHex, "hex");
  const actual = pbkdf2Sync(password, salt, iterations, expected.length, DIGEST);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
