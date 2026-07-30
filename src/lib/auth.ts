/**
 * Authentication utilities — Supabase Auth only.
 * All session/token management is handled by Supabase Auth JWT tokens.
 */

import { supabaseAdmin } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// ============================================================
// Password Hashing (scrypt)
// ============================================================

const SALT_LENGTH = 16
const KEY_LENGTH = 64

/**
 * Hash a password using scrypt with a random salt.
 * Returns format: `salt:hash` (both hex-encoded)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH)
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verify a password against a stored hash.
 * The stored hash format is `salt:derivedKey` (both hex-encoded).
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':')
    if (!salt || !hash) return false
    const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH)
    const hashBuffer = Buffer.from(hash, 'hex')
    const derivedBuffer = Buffer.from(derivedKey)
    if (hashBuffer.length !== derivedBuffer.length) return false
    return crypto.timingSafeEqual(hashBuffer, derivedBuffer)
  } catch {
    return false
  }
}

// ============================================================
// Supabase Auth Token Verification
// ============================================================

/**
 * Verify a Supabase Auth JWT token.
 * Returns the Supabase Auth user if valid, or null if invalid/expired.
 */
export async function verifyAuthToken(token: string): Promise<User | null> {
  if (!supabaseAdmin) {
    console.error('[Auth] Supabase admin client is not available.')
    return null
  }
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error) return null
    return data.user ?? null
  } catch {
    return null
  }
}

/**
 * Create a new user in Supabase Auth.
 */
export async function createAuthUser(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
): Promise<User | null> {
  if (!supabaseAdmin) return null
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    })
    if (error) return null
    return data.user ?? null
  } catch {
    return null
  }
}

// ============================================================
// Request-Level Auth Helpers (used by API routes)
// ============================================================

/**
 * Authenticate a request by extracting and verifying the Bearer token.
 * Returns the Supabase Auth user, or null if unauthorized.
 */
export async function authenticateRequest(request: Request): Promise<User | null> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null
  return verifyAuthToken(token)
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

// ============================================================
// Standard HTTP Error Responses
// ============================================================

/**
 * Return a 401 Unauthorized JSON response.
 */
export function unauthorizedResponse(message = 'Authentication required.') {
  return NextResponse.json({ success: false, error: message }, { status: 401 })
}

/**
 * Return a 403 Forbidden JSON response.
 */
export function forbiddenResponse(message = 'Insufficient permissions.') {
  return NextResponse.json({ success: false, error: message }, { status: 403 })
}

/**
 * Return a 404 Not Found JSON response.
 */
export function notFoundResponse(message = 'Resource not found.') {
  return NextResponse.json({ success: false, error: message }, { status: 404 })
}

/**
 * Return a 400 Bad Request JSON response.
 */
export function badRequestResponse(message = 'Invalid request.') {
  return NextResponse.json({ success: false, error: message }, { status: 400 })
}

// ============================================================
// Admin Credentials Check
// ============================================================

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8')
  const bufB = Buffer.from(b, 'utf-8')
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Check if the provided credentials match the admin credentials
 * from environment variables. Used for initial admin setup only.
 */
export function isAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) return false
  return safeEqual(email, adminEmail) && safeEqual(password, adminPassword)
}
