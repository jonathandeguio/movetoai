import { redis } from "./redis.js"

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }
  } catch {
    // Redis unavailable — fall through to fn()
  }

  const result = await fn()

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(result))
  } catch {
    // Redis unavailable — ignore
  }

  return result
}
