type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Prune expired entries every minute to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}, 60_000);

/**
 * In-memory sliding-window rate limiter.
 * @param key    Unique key (e.g. "login:1.2.3.4")
 * @param max    Maximum allowed requests within the window
 * @param windowMs  Window size in milliseconds
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: max - entry.count };
}
