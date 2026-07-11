/**
 * In-memory rate limiter with automatic cleanup.
 *
 * Usage:
 *   const result = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
 *   if (!result.success) return rateLimitResponse()
 */

import { NextResponse } from 'next/server'

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

/**
 * Core rate limit function.
 */
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

// ============================================================
// Request-Level Helpers (used by API routes)
// ============================================================

/**
 * Extract the client IP address from a request.
 * Checks X-Forwarded-For, X-Real-IP, then falls back to 'unknown'.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return 'unknown'
}

/**
 * Check rate limit for an incoming request.
 * Uses the client IP as the rate limit key.
 *
 * Usage:
 *   const rateResult = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
 *   if (!rateResult.success) return rateLimitResponse()
 */
export function checkRateLimit(
  request: Request,
  options: RateLimitOptions = { limit: 10, windowMs: 60_000 }
): RateLimitResult {
  const ip = getClientIp(request)
  return rateLimit(ip, options)
}

/**
 * Return a standard 429 Too Many Requests response.
 */
export function rateLimitResponse(message = 'Too many requests. Please try again later.') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 429, headers: { 'Retry-After': '60' } }
  )
}
