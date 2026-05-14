import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

/**
 * 5 attempts per 15 minutes — for login & OTP endpoints
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "rl:auth",
    })
  : null;

/**
 * 3 registrations per hour per IP — for signup endpoint
 */
export const registerRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "rl:register",
    })
  : null;

/**
 * Returns { limited: true } if the given identifier has exceeded the limit.
 * Falls back to { limited: false } when Redis is not configured.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ limited: boolean }> {
  if (!limiter) return { limited: false };
  const { success } = await limiter.limit(identifier);
  return { limited: !success };
}
