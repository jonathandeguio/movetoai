import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Validates a Cloudflare Turnstile token server-side.
 * Returns true if valid, false otherwise.
 * In development with no secret key configured, always returns true.
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Dev fallback: no key configured → skip check
  if (!secretKey) {
    if (process.env.NODE_ENV !== "production") return true;
    return false;
  }

  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret: secretKey, response: token });
    if (ip) body.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
