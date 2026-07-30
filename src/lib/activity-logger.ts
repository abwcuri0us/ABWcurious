/**
 * Activity Logger
 *
 * A helper function to log activities to the activity_logs table in Supabase.
 * Can be called from any API route to record key actions.
 *
 * Usage:
 *   import { logActivity } from '@/lib/activity-logger'
 *   await logActivity('auth', 'user_signup', 'New user signed up', userId, userEmail, request)
 */

import { supabaseAdmin, isConfigured } from './supabase'
import { randomUUID } from 'crypto'
import type { NextRequest } from 'next/server'

export type ActivityCategory =
  | 'auth'
  | 'content'
  | 'system'
  | 'user'
  | 'feedback'
  | 'contact'
  | 'newsletter'
  | 'general'

interface LogActivityOptions {
  category: ActivityCategory | string
  action: string
  details?: string
  userId?: string | null
  userEmail?: string | null
  request?: NextRequest | Request
}

/**
 * Log an activity to the activity_logs table.
 * This is fire-and-forget — errors are logged but don't throw.
 */
export async function logActivity(
  category: ActivityCategory | string,
  action: string,
  details?: string,
  userId?: string | null,
  userEmail?: string | null,
  request?: NextRequest | Request
): Promise<void> {
  try {
    if (!isConfigured()) return

    const ipAddress = request
      ? (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         null)
      : null

    const userAgent = request
      ? request.headers.get('user-agent') || null
      : null

    const { error } = await supabaseAdmin
      .from('activity_logs')
      .insert([{
        id: randomUUID(),
        user_id: userId || null,
        user_email: userEmail || null,
        action,
        details: details || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        category,
      }])

    // Silently ignore errors — activity logging is non-critical
    if (error) {
      // Table might not exist yet; suppress noisy warnings
    }
  } catch {
    // Silently ignore — activity logging is non-critical
  }
}
