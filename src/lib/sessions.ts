/**
 * Server-Side Session Management
 *
 * Uses the Supabase `sessions` table to store and validate sessions.
 * Tokens are SHA-256 hashed before storage — the raw token is only
 * returned once (on creation) and set as an httpOnly cookie.
 */

import crypto from 'crypto'
import { supabaseAdmin } from './supabase'

const SESSION_COOKIE_NAME = 'abwcurious_session'
const SESSION_EXPIRY_HOURS = 24
const SESSION_MAX_AGE_SECONDS = SESSION_EXPIRY_HOURS * 60 * 60

export interface SessionData {
  userId: string
  email?: string
  role?: string
  userAgent?: string
  ipAddress?: string
}

export interface SessionValidationResult {
  valid: boolean
  userId?: string
  email?: string
  role?: string
}

interface SessionRow {
  id: string
  user_id: string
  token_hash: string
  user_agent: string | null
  ip_address: string | null
  expires_at: string
  created_at: string
  last_accessed_at: string
  is_revoked: boolean
}

interface ProfileRow {
  id: string
  email: string
  role: string
  name: string | null
  avatar: string | null
}

/**
 * Create a new session in the database. Returns the raw (unhashed) token
 * that should be set as an httpOnly cookie.
 */
export async function createSession(data: SessionData, req?: Request): Promise<string> {
  const token = crypto.randomBytes(48).toString('hex')
  const tokenHash = hashToken(token)
  const userAgent = req?.headers.get('user-agent') || undefined
  const ipAddress = req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req?.headers.get('x-real-ip') || undefined
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()

  const insertData: Record<string, unknown> = {
    user_id: data.userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  }
  if (userAgent) insertData.user_agent = userAgent
  if (ipAddress) insertData.ip_address = ipAddress

  const { error } = await supabaseAdmin
    .from('sessions')
    .insert([insertData])

  if (error) {
    console.error('[Sessions] Failed to create session:', error.message)
  }

  return token
}

/**
 * Validate a session token (raw, unhashed). Returns user info if valid.
 */
export async function validateSession(token: string): Promise<SessionValidationResult> {
  const tokenHash = hashToken(token)

  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .select('user_id, is_revoked, expires_at')
    .eq('token_hash', tokenHash)
    .limit(1)
    .maybeSingle()

  if (error || !session) {
    return { valid: false }
  }

  if (session.is_revoked || new Date(session.expires_at) <= new Date()) {
    return { valid: false }
  }

  // Look up profile for email and role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email, role')
    .eq('id', session.user_id)
    .maybeSingle()

  if (!profile) {
    return { valid: false }
  }

  // Update last accessed (fire and forget)
  supabaseAdmin
    .from('sessions')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)
    .then()

  return {
    valid: true,
    userId: profile.id,
    email: profile.email,
    role: profile.role,
  }
}

/**
 * Revoke a single session by its raw token.
 */
export async function revokeSession(token: string): Promise<void> {
  const tokenHash = hashToken(token)
  await supabaseAdmin
    .from('sessions')
    .update({ is_revoked: true })
    .eq('token_hash', tokenHash)
}

/**
 * Revoke all sessions for a given user.
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  await supabaseAdmin
    .from('sessions')
    .update({ is_revoked: true })
    .eq('user_id', userId)
}

/**
 * Delete expired and revoked sessions. Returns count of deleted rows.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .delete()
    .or(`expires_at.lt.${now},is_revoked.eq.true`)
    .select('id')

  if (error) {
    console.error('[Sessions] Cleanup error:', error.message)
    return 0
  }
  return data?.length || 0
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME
}

export function getSessionMaxAge(): number {
  return SESSION_MAX_AGE_SECONDS
}

/**
 * Extract session token from a request (httpOnly cookie only).
 * Validates the token and returns user info.
 */
export async function getSessionFromRequest(req: Request): Promise<SessionValidationResult & { token?: string }> {
  const token = (req as Request & { cookies?: { get: (name: string) => { value: string } | undefined } }).cookies?.get(SESSION_COOKIE_NAME)?.value
  if (!token) return { valid: false }

  const result = await validateSession(token)
  return { ...result, token }
}