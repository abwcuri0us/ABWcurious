import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getSessionFromRequest } from './sessions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-secret'

const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

if (!isSupabaseConfigured) {
  console.warn('[Supabase] Missing environment variables. Auth features will not work.')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Supabase] Missing service role key. Admin operations will not work.')
}

// Public client for client-side operations (limited permissions)
export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Admin client for server-side operations (full permissions)
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseSecretKey)

/** Check if Supabase is properly configured before making queries */
export function isConfigured(): boolean {
  return isSupabaseConfigured
}

// ============================================================
// Supabase with Timeout Wrapper
// ============================================================

/**
 * Execute a Supabase query with a timeout.
 * Returns null if the query times out.
 */
export async function supabaseWithTimeout<T extends Record<string, any>>(
  queryFn: (client: SupabaseClient) => PromiseLike<T>,
  timeoutMs = 5000
): Promise<T | null> {
  if (!supabaseAdmin) return null

  try {
    const result = await Promise.race([
      Promise.resolve(queryFn(supabaseAdmin)),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
      ),
    ])
    return result as T
  } catch (err) {
    if (err instanceof Error && err.message === 'Query timeout') {
      console.warn('[Supabase] Query timed out after', timeoutMs, 'ms')
    }
    return null
  }
}

// ============================================================
// Type definitions for Supabase tables
// ============================================================

export interface ProfileRow {
  id: string
  email: string
  name: string | null
  avatar: string | null
  provider: string
  role: 'admin' | 'editor' | 'author' | 'user'
  country: string | null
  city: string | null
  bio: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface ContactRow {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  type: string | null
  status: string
  user_id: string | null
  created_at: string
}

export interface NewsletterRow {
  id: string
  email: string
  is_active: boolean
  created_at: string
}

export interface EventRow {
  id: string
  title: string
  description: string | null
  date: string
  end_date: string | null
  time: string | null
  location: string | null
  type: 'webinar' | 'conference' | 'workshop' | 'meetup' | 'training' | 'hackathon'
  section: string | null
  registration_url: string | null
  cover_image: string | null
  video_url: string | null
  max_registrations: number | null
  registered_count: number | null
  registration_enabled: boolean | null
  is_published: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  slug?: string | null
}

export interface EventRegistrationRow {
  id: string
  event_id: string
  user_id: string
  status: 'registered' | 'attended' | 'cancelled'
  created_at: string
  event?: EventRow
  profile?: ProfileRow
}

export interface CareerRow {
  id: string
  title: string
  slug: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'internship' | 'contract'
  description: string
  requirements: string | null
  salary_range: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface JobApplicationRow {
  id: string
  career_id: string
  user_id: string
  resume_url: string | null
  cover_letter: string | null
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  notes: string | null
  created_at: string
  updated_at: string
  career?: CareerRow
  profile?: ProfileRow
}

export interface StatusUpdateRow {
  id: string
  service: string
  status: 'operational' | 'degraded' | 'outage' | 'maintenance'
  message: string | null
  created_at: string
  updated_at: string
}

export interface NotificationRow {
  id: string
  user_id: string | null
  title: string
  message: string
  type: 'newsletter' | 'event' | 'system' | 'message' | 'success' | 'warning' | 'info'
  link: string | null
  is_read: boolean
  created_at: string
}

export interface PartnershipRow {
  id: string
  organization: string
  user_id: string | null
  email: string
  phone: string | null
  partnership_type: 'technology' | 'strategic' | 'academic' | 'reseller' | 'other'
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface SponsorshipRow {
  id: string
  user_id: string | null
  name: string
  email: string
  organization: string | null
  sponsorship_type: 'event' | 'content' | 'general'
  budget: string | null
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface SolutionRow {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string
  features: string[] | null
  pricing: string | null
  demo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SolutionOrderRow {
  id: string
  solution_id: string
  user_id: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  solution?: SolutionRow
  profile?: ProfileRow
}

export interface FeedbackRow {
  id: string
  user_id: string | null
  name: string
  email: string
  subject: string
  message: string
  rating: number | null
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
}

export interface MessageRow {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export interface LegalPageRow {
  id: string
  slug: string
  title: string
  content: string
  updated_at: string
}

export interface StatusIncidentRow {
  id: string
  service: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  title: string
  description: string | null
  started_at: string
  resolved_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Auth Helper: Verify admin access from request
// ============================================================

export async function verifyAdmin(request: Request): Promise<{ authorized: boolean; user?: { id: string; email: string; role: string } }> {
  try {
    // 1. Check server-side session (httpOnly cookie or Bearer header)
    const sessionResult = await getSessionFromRequest(request)
    if (sessionResult.valid && sessionResult.userId) {
      if (['admin', 'editor'].includes(sessionResult.role || '')) {
        return { authorized: true, user: { id: sessionResult.userId, email: sessionResult.email || '', role: sessionResult.role || 'user' } }
      }
      return { authorized: false }
    }

    // 2. Fallback: try Supabase JWT from Authorization header
    const authHeader = request.headers.get('authorization')
    const jwtToken = authHeader?.replace('Bearer ', '')
    if (!jwtToken) return { authorized: false }

    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwtToken)
    if (error || !userData.user) return { authorized: false }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .eq('id', userData.user.id)
      .single()

    if (profile && ['admin', 'editor'].includes(profile.role)) {
      return { authorized: true, user: { id: profile.id, email: profile.email, role: profile.role } }
    }
  } catch {
    // ignore
  }

  return { authorized: false }
}

/**
 * Verify access — alias for verifyAdmin used by API routes.
 * Returns user info or unauthorized response.
 */
export async function verifyAccess(request: Request): Promise<{ authorized: boolean; user?: { id: string; email: string; role: string } }> {
  return verifyAdmin(request)
}

/**
 * Verify author or admin access
 */
export async function verifyAuthorOrAdmin(request: Request): Promise<{ authorized: boolean; user?: { id: string; email: string; role: string } }> {
  try {
    // 1. Check server-side session
    const sessionResult = await getSessionFromRequest(request)
    if (sessionResult.valid && sessionResult.userId) {
      if (['admin', 'editor', 'author'].includes(sessionResult.role || '')) {
        return { authorized: true, user: { id: sessionResult.userId, email: sessionResult.email || '', role: sessionResult.role || 'user' } }
      }
      return { authorized: false }
    }

    // 2. Fallback: try Supabase JWT
    const authHeader = request.headers.get('authorization')
    const jwtToken = authHeader?.replace('Bearer ', '')
    if (!jwtToken) return { authorized: false }

    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwtToken)
    if (error || !userData.user) return { authorized: false }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .eq('id', userData.user.id)
      .single()

    if (profile && ['admin', 'editor', 'author'].includes(profile.role)) {
      return { authorized: true, user: { id: profile.id, email: profile.email, role: profile.role } }
    }
  } catch {
    // ignore
  }

  return { authorized: false }
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: Request): Promise<{ id: string; email: string; role: string; name: string | null } | null> {
  try {
    // 1. Check server-side session
    const sessionResult = await getSessionFromRequest(request)
    if (sessionResult.valid && sessionResult.userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, role, name')
        .eq('id', sessionResult.userId)
        .maybeSingle()
      return profile || null
    }

    // 2. Fallback: try Supabase JWT
    const authHeader = request.headers.get('authorization')
    const jwtToken = authHeader?.replace('Bearer ', '')
    if (!jwtToken) return null

    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwtToken)
    if (error || !userData.user) return null

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, name')
      .eq('id', userData.user.id)
      .single()

    return profile || null
  } catch {
    return null
  }
}

/**
 * Get user from a token directly (used by auth-helpers).
 * Tries session validation first, falls back to Supabase JWT.
 */
export async function getUserFromToken(token: string): Promise<{ id: string; email: string; role: string; name: string | null; avatar: string | null } | null> {
  try {
    // 1. Try session validation
    const { validateSession } = await import('./sessions')
    const sessionResult = await validateSession(token)
    if (sessionResult.valid && sessionResult.userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, role, name, avatar')
        .eq('id', sessionResult.userId)
        .maybeSingle()
      return profile || null
    }

    // 2. Fallback: try Supabase JWT
    const { data: userData, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !userData.user) return null

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, name, avatar')
      .eq('id', userData.user.id)
      .single()

    return profile || null
  } catch {
    return null
  }
}

// ============================================================
// Database Helper Modules (table-specific CRUD)
// These are thin wrappers used by API routes that import
// { usersDb, etc. } from '@/lib/supabase'
// ============================================================

export const usersDb = {
  async findById(id: string) {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', id).maybeSingle()
    if (error) return null
    return data
  },
  async findByEmail(email: string) {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('email', email).maybeSingle()
    if (error) return null
    return data
  },
  async list(limit = 100, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return []
    return data
  },
  async count() {
    const { count, error } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    if (error) return 0
    return count ?? 0
  },
  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async delete(id: string) {
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const careersDb = {
  async listActive(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('careers')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { careers: [], total: 0 }
    return { careers: data ?? [], total: count ?? 0 }
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('careers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { careers: [], total: 0 }
    return { careers: data ?? [], total: count ?? 0 }
  },
  async findBySlug(slug: string) {
    const { data, error } = await supabaseAdmin.from('careers').select('*').eq('slug', slug).maybeSingle()
    if (error) return null
    return data
  },
  async findById(id: string) {
    const { data, error } = await supabaseAdmin.from('careers').select('*').eq('id', id).maybeSingle()
    if (error) return null
    return data
  },
  async create(careerData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('careers').insert([careerData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('careers').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async delete(id: string) {
    const { error } = await supabaseAdmin.from('careers').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const careerApplicationsDb = {
  async create(appData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('job_applications').insert([appData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async listByCareer(careerId: string) {
    const { data, error } = await supabaseAdmin
      .from('job_applications')
      .select('*, career:careers(id, title, department), profile:profiles(id, name, email)')
      .eq('career_id', careerId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
  async listByUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('job_applications')
      .select('*, career:careers(id, title, department, location, type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('job_applications')
      .select('*, career:careers(id, title, department), profile:profiles(id, name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { applications: [], total: 0 }
    return { applications: data ?? [], total: count ?? 0 }
  },
  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('job_applications').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
}

export const eventsDb = {
  async listActive(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1)
    if (error) return { events: [], total: 0 }
    return { events: data ?? [], total: count ?? 0 }
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { events: [], total: 0 }
    return { events: data ?? [], total: count ?? 0 }
  },
  async findById(id: string) {
    const { data, error } = await supabaseAdmin.from('events').select('*').eq('id', id).maybeSingle()
    if (error) return null
    return data
  },
  async findBySlug(slug: string) {
    const { data, error } = await supabaseAdmin.from('events').select('*').eq('slug', slug).maybeSingle()
    if (error) return null
    return data
  },
  async create(eventData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('events').insert([eventData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('events').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async delete(id: string) {
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const eventRegistrationsDb = {
  async create(regData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('event_registrations').insert([regData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async listByEvent(eventId: string) {
    const { data, error } = await supabaseAdmin
      .from('event_registrations')
      .select('*, profile:profiles(id, name, email)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
  async listByUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('event_registrations')
      .select('*, event:events(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('event_registrations')
      .select('*, event:events(id, title, date), profile:profiles(id, name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { registrations: [], total: 0 }
    return { registrations: data ?? [], total: count ?? 0 }
  },
  async countByEvent(eventId: string) {
    const { count, error } = await supabaseAdmin
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    if (error) return 0
    return count ?? 0
  },
}

export const solutionsDb = {
  async listActive(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('solutions')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { solutions: [], total: 0 }
    return { solutions: data ?? [], total: count ?? 0 }
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('solutions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { solutions: [], total: 0 }
    return { solutions: data ?? [], total: count ?? 0 }
  },
  async findById(id: string) {
    const { data, error } = await supabaseAdmin.from('solutions').select('*').eq('id', id).maybeSingle()
    if (error) return null
    return data
  },
  async findBySlug(slug: string) {
    const { data, error } = await supabaseAdmin.from('solutions').select('*').eq('slug', slug).maybeSingle()
    if (error) return null
    return data
  },
  async create(solData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('solutions').insert([solData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('solutions').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async delete(id: string) {
    const { error } = await supabaseAdmin.from('solutions').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const partnershipsDb = {
  async create(pData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('partnerships').insert([pData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async listByUser(userId: string) {
    const { data, error } = await supabaseAdmin.from('partnerships').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('partnerships')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { partnerships: [], total: 0 }
    return { partnerships: data ?? [], total: count ?? 0 }
  },
  async findById(id: string) {
    const { data, error } = await supabaseAdmin.from('partnerships').select('*').eq('id', id).maybeSingle()
    if (error) return null
    return data
  },
  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('partnerships').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
}

export const sponsorshipsDb = {
  async create(sData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('sponsorships').insert([sData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async listByUser(userId: string) {
    const { data, error } = await supabaseAdmin.from('sponsorships').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('sponsorships')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { sponsorships: [], total: 0 }
    return { sponsorships: data ?? [], total: count ?? 0 }
  },
  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('sponsorships').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
}

export const notificationsDb = {
  async create(nData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('notifications').insert([nData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async listByUser(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return []
    return data ?? []
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { notifications: [], total: 0 }
    return { notifications: data ?? [], total: count ?? 0 }
  },
  async markRead(id: string) {
    const { data, error } = await supabaseAdmin.from('notifications').update({ is_read: true }).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async markAllRead(userId: string) {
    const { error } = await supabaseAdmin.from('notifications').update({ is_read: true }).eq('user_id', userId)
    if (error) throw new Error(error.message)
  },
  async countUnread(userId: string) {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    if (error) return 0
    return count ?? 0
  },
}

export const feedbacksDb = {
  async create(fData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('feedback').insert([fData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async listByUser(userId: string) {
    const { data, error } = await supabaseAdmin.from('feedback').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { feedbacks: [], total: 0 }
    return { feedbacks: data ?? [], total: count ?? 0 }
  },
  async findById(id: string) {
    const { data, error } = await supabaseAdmin.from('feedback').select('*').eq('id', id).maybeSingle()
    if (error) return null
    return data
  },
  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('feedback').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async delete(id: string) {
    const { error } = await supabaseAdmin.from('feedback').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const solutionOrdersDb = {
  async create(orderData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('solution_orders').insert([orderData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async listByUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('solution_orders')
      .select('*, solution:solutions(id, name, slug, tagline, pricing, demo_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('solution_orders')
      .select('*, solution:solutions(id, name, slug), profile:profiles(id, name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { orders: [], total: 0 }
    return { orders: data ?? [], total: count ?? 0 }
  },
  async findById(id: string) {
    const { data, error } = await supabaseAdmin.from('solution_orders').select('*').eq('id', id).maybeSingle()
    if (error) return null
    return data
  },
  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('solution_orders').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async delete(id: string) {
    const { error } = await supabaseAdmin.from('solution_orders').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const messagesDb = {
  async create(mData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('user_messages').insert([mData]).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async listByUser(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('user_messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return []
    return data ?? []
  },
  async listAll(limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('user_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return { messages: [], total: 0 }
    return { messages: data ?? [], total: count ?? 0 }
  },
  async markRead(id: string) {
    const { error } = await supabaseAdmin.from('user_messages').update({ is_read: true }).eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const legalPagesDb = {
  async findBySlug(slug: string) {
    const { data, error } = await supabaseAdmin.from('legal_pages').select('*').eq('slug', slug).maybeSingle()
    if (error) return null
    return data
  },
  async listAll() {
    const { data, error } = await supabaseAdmin.from('legal_pages').select('*').order('updated_at', { ascending: false })
    if (error) return []
    return data ?? []
  },
  async upsert(pageData: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('legal_pages').upsert([pageData], { onConflict: 'slug' }).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  async delete(slug: string) {
    const { error } = await supabaseAdmin.from('legal_pages').delete().eq('slug', slug)
    if (error) throw new Error(error.message)
  },
}


