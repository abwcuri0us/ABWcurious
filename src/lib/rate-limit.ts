/**
 * In-memory rate limiter with automatic cleanup.
 * 
 * Usage:
 *   const result = rateLimit(ip, { limit: 10, windowMs: 60_000 })
 *   if (!result.success) return Response.json({ error: 'Too many requests' }, { status: 429 })
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  limit: number       // Max requests per window
  windowMs: number    // Window duration in milliseconds
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60_000 }
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: options.limit - 1, resetAt }
  }

  if (entry.count >= options.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: options.limit - entry.count, resetAt: entry.resetAt }
}
