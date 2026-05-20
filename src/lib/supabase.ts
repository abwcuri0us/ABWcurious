import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// Supabase Client Initialization
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Client features will not work.')
}

if (!supabaseServiceKey) {
  console.warn('[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations will not work.')
}

/** Public client for client-side operations (limited permissions via anon key) */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** Admin client for server-side operations (full permissions via service role key) */
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// TypeScript Interfaces for all database tables
// ============================================================================

export interface UserRow {
  id: string
  email: string
  name: string | null
  avatar: string | null
  country: string | null
  city: string | null
  pincode: string | null
  phone: string | null
  date_of_birth: string | null
  provider: string
  role: string
  created_at: string
  updated_at: string
}

export interface BlogCategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface BlogPostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  published: boolean
  author_id: string
  category_id: string | null
  created_at: string
  updated_at: string
  // Joined fields
  author?: Pick<UserRow, 'id' | 'name' | 'email' | 'avatar'> | null
  category?: Pick<BlogCategoryRow, 'id' | 'name' | 'slug'> | null
}

export interface ContactRow {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  created_at: string
}

export interface NewsletterRow {
  id: string
  email: string
  created_at: string
}

export interface EventRow {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  type: string
  registration_url: string | null
  is_registration_open: boolean
  max_registrations: number | null
  created_at: string
  updated_at: string
}

export interface StatusUpdateRow {
  id: string
  service: string
  status: string
  message: string | null
  created_at: string
  updated_at: string
}

export interface CareerRow {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SolutionRow {
  id: string
  user_id: string
  title: string
  description: string | null
  type: string
  status: string
  budget: string | null
  timeline: string | null
  created_at: string
  updated_at: string
}

export interface PartnershipRow {
  id: string
  user_id: string
  organization_name: string
  partnership_type: string
  message: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface SponsorshipRow {
  id: string
  user_id: string
  organization_name: string
  sponsorship_type: string
  message: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface FeedbackRow {
  id: string
  user_id: string
  type: string
  subject: string
  message: string
  status: string
  created_at: string
  updated_at: string
}

export interface NotificationRow {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

export interface MessageRow {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface EventRegistrationRow {
  id: string
  event_id: string
  user_id: string
  created_at: string
}

export interface CareerApplicationRow {
  id: string
  career_id: string
  user_id: string
  resume_url: string | null
  cover_letter: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface LegalPageRow {
  id: string
  type: string
  title: string
  content: string
  updated_at: string
  updated_by: string | null
}

// ============================================================================
// Helper: Auth - Verify token and get user from Supabase Auth
// ============================================================================

export async function verifyAuthToken(accessToken: string): Promise<{
  authUser: { id: string; email: string; name: string | null; avatar: string | null } | null
  dbUser: UserRow | null
}> {
  if (!supabaseUrl || !supabaseServiceKey) {
    return { authUser: null, dbUser: null }
  }

  try {
    const { data: userData, error } = await supabaseAdmin.auth.getUser(accessToken)
    if (error || !userData.user) {
      return { authUser: null, dbUser: null }
    }

    const authUser = {
      id: userData.user.id,
      email: userData.user.email || '',
      name: userData.user.user_metadata?.name || null,
      avatar: userData.user.user_metadata?.avatar_url || null,
    }

    // Look up the user in our users table
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single()

    return { authUser, dbUser: dbUser as UserRow | null }
  } catch {
    return { authUser: null, dbUser: null }
  }
}

// ============================================================================
// Helper: Get user with role from token
// ============================================================================

export async function getUserFromToken(accessToken: string): Promise<{
  id: string
  email: string
  name: string | null
  role: string
  avatar: string | null
} | null> {
  if (!accessToken) return null

  const { authUser, dbUser } = await verifyAuthToken(accessToken)

  if (dbUser) {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      avatar: dbUser.avatar,
    }
  }

  if (authUser) {
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: 'user',
      avatar: authUser.avatar,
    }
  }

  return null
}

// ============================================================================
// Helper: Verify admin/editor/author access
// ============================================================================

export async function verifyAccess(
  accessToken: string,
  allowedRoles: string[] = ['admin', 'editor']
): Promise<{ authorized: boolean; user: { id: string; email: string; role: string } | null }> {
  const user = await getUserFromToken(accessToken)
  if (!user) return { authorized: false, user: null }

  if (allowedRoles.includes(user.role)) {
    return { authorized: true, user: { id: user.id, email: user.email, role: user.role } }
  }

  return { authorized: false, user: null }
}

// ============================================================================
// Users CRUD helpers
// ============================================================================

export const usersDb = {
  async findById(id: string): Promise<UserRow | null> {
    const { data } = await supabaseAdmin.from('users').select('*').eq('id', id).single()
    return data as UserRow | null
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    const { data } = await supabaseAdmin.from('users').select('*').eq('email', email).single()
    return data as UserRow | null
  },

  async create(userData: Omit<UserRow, 'id' | 'created_at' | 'updated_at'>): Promise<UserRow | null> {
    const { data, error } = await supabaseAdmin.from('users').insert([userData]).select().single()
    if (error) {
      console.error('[Supabase] User create error:', error)
      return null
    }
    return data as UserRow | null
  },

  async update(id: string, updates: Partial<UserRow>): Promise<UserRow | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('[Supabase] User update error:', error)
      return null
    }
    return data as UserRow | null
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
    if (error) {
      console.error('[Supabase] User delete error:', error)
      return false
    }
    return true
  },

  async list(options?: { orderBy?: string; limit?: number }): Promise<UserRow[]> {
    let query = supabaseAdmin.from('users').select('*')
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    const { data } = await query
    return (data as UserRow[]) || []
  },

  async listWithSelect(selectFields: string): Promise<Partial<UserRow>[]> {
    const { data } = await supabaseAdmin.from('users').select(selectFields).order('created_at', { ascending: false })
    return (data as Partial<UserRow>[]) || []
  },
}

// ============================================================================
// Blog Posts CRUD helpers
// ============================================================================

export const blogsDb = {
  async findById(id: string): Promise<BlogPostRow | null> {
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('*, author:users(id, name, email, avatar), category:blog_categories(id, name, slug)')
      .eq('id', id)
      .single()
    return data as BlogPostRow | null
  },

  async findBySlug(slug: string): Promise<BlogPostRow | null> {
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('*, author:users(id, name, email, avatar), category:blog_categories(id, name, slug)')
      .eq('slug', slug)
      .single()
    return data as BlogPostRow | null
  },

  async findPublished(): Promise<BlogPostRow[]> {
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('*, author:users(id, name, avatar), category:blog_categories(id, name, slug)')
      .eq('published', true)
      .order('created_at', { ascending: false })
    return (data as BlogPostRow[]) || []
  },

  async list(options?: { authorId?: string }): Promise<BlogPostRow[]> {
    let query = supabaseAdmin
      .from('blog_posts')
      .select('*, author:users(id, name, email, avatar), category:blog_categories(id, name, slug)')
      .order('created_at', { ascending: false })

    if (options?.authorId) {
      query = query.eq('author_id', options.authorId)
    }

    const { data } = await query
    return (data as BlogPostRow[]) || []
  },

  async create(postData: Omit<BlogPostRow, 'id' | 'created_at' | 'updated_at' | 'author' | 'category'>): Promise<BlogPostRow | null> {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([postData])
      .select('*, author:users(id, name, email, avatar), category:blog_categories(id, name, slug)')
      .single()
    if (error) {
      console.error('[Supabase] Blog post create error:', error)
      return null
    }
    return data as BlogPostRow | null
  },

  async update(id: string, updates: Partial<BlogPostRow>): Promise<BlogPostRow | null> {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, author:users(id, name, email, avatar), category:blog_categories(id, name, slug)')
      .single()
    if (error) {
      console.error('[Supabase] Blog post update error:', error)
      return null
    }
    return data as BlogPostRow | null
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id)
    if (error) {
      console.error('[Supabase] Blog post delete error:', error)
      return false
    }
    return true
  },
}

// ============================================================================
// Blog Categories CRUD helpers
// ============================================================================

export const blogCategoriesDb = {
  async list(): Promise<BlogCategoryRow[]> {
    const { data } = await supabaseAdmin.from('blog_categories').select('*').order('name', { ascending: true })
    return (data as BlogCategoryRow[]) || []
  },

  async findById(id: string): Promise<BlogCategoryRow | null> {
    const { data } = await supabaseAdmin.from('blog_categories').select('*').eq('id', id).single()
    return data as BlogCategoryRow | null
  },

  async create(catData: Omit<BlogCategoryRow, 'id' | 'created_at'>): Promise<BlogCategoryRow | null> {
    const { data, error } = await supabaseAdmin.from('blog_categories').insert([catData]).select().single()
    if (error) {
      console.error('[Supabase] Blog category create error:', error)
      return null
    }
    return data as BlogCategoryRow | null
  },
}

// ============================================================================
// Contacts CRUD helpers
// ============================================================================

export const contactsDb = {
  async create(contactData: Omit<ContactRow, 'id' | 'created_at'>): Promise<ContactRow | null> {
    const { data, error } = await supabaseAdmin.from('contacts').insert([contactData]).select().single()
    if (error) {
      console.error('[Supabase] Contact create error:', error)
      return null
    }
    return data as ContactRow | null
  },

  async list(): Promise<ContactRow[]> {
    const { data } = await supabaseAdmin.from('contacts').select('*').order('created_at', { ascending: false })
    return (data as ContactRow[]) || []
  },
}

// ============================================================================
// Newsletter CRUD helpers
// ============================================================================

export const newsletterDb = {
  async findByEmail(email: string): Promise<NewsletterRow | null> {
    const { data } = await supabaseAdmin.from('newsletters').select('*').eq('email', email).maybeSingle()
    return data as NewsletterRow | null
  },

  async create(email: string): Promise<NewsletterRow | null> {
    const { data, error } = await supabaseAdmin.from('newsletters').insert([{ email }]).select().single()
    if (error) {
      console.error('[Supabase] Newsletter create error:', error)
      return null
    }
    return data as NewsletterRow | null
  },
}

// ============================================================================
// Events CRUD helpers
// ============================================================================

export const eventsDb = {
  async list(options?: { upcoming?: boolean }): Promise<EventRow[]> {
    let query = supabaseAdmin.from('events').select('*')
    if (options?.upcoming) {
      query = query.gte('date', new Date().toISOString())
    }
    const { data } = await query.order('date', { ascending: options?.upcoming ?? false })
    return (data as EventRow[]) || []
  },

  async create(eventData: Omit<EventRow, 'id' | 'created_at' | 'updated_at'>): Promise<EventRow | null> {
    const { data, error } = await supabaseAdmin.from('events').insert([eventData]).select().single()
    if (error) {
      console.error('[Supabase] Event create error:', error)
      return null
    }
    return data as EventRow | null
  },

  async update(id: string, updates: Partial<EventRow>): Promise<EventRow | null> {
    const { data, error } = await supabaseAdmin
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('[Supabase] Event update error:', error)
      return null
    }
    return data as EventRow | null
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id)
    if (error) {
      console.error('[Supabase] Event delete error:', error)
      return false
    }
    return true
  },
}

// ============================================================================
// Status Updates CRUD helpers
// ============================================================================

export const statusDb = {
  async list(): Promise<StatusUpdateRow[]> {
    const { data } = await supabaseAdmin.from('status_updates').select('*').order('updated_at', { ascending: false })
    return (data as StatusUpdateRow[]) || []
  },

  async create(statusData: Omit<StatusUpdateRow, 'id' | 'created_at' | 'updated_at'>): Promise<StatusUpdateRow | null> {
    const { data, error } = await supabaseAdmin.from('status_updates').insert([statusData]).select().single()
    if (error) {
      console.error('[Supabase] Status create error:', error)
      return null
    }
    return data as StatusUpdateRow | null
  },

  async update(id: string, updates: Partial<StatusUpdateRow>): Promise<StatusUpdateRow | null> {
    const { data, error } = await supabaseAdmin
      .from('status_updates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('[Supabase] Status update error:', error)
      return null
    }
    return data as StatusUpdateRow | null
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('status_updates').delete().eq('id', id)
    if (error) {
      console.error('[Supabase] Status delete error:', error)
      return false
    }
    return true
  },
}

// ============================================================================
// Careers CRUD helpers
// ============================================================================

export const careersDb = {
  async list(options?: { activeOnly?: boolean }): Promise<CareerRow[]> {
    let query = supabaseAdmin.from('careers').select('*')
    if (options?.activeOnly) {
      query = query.eq('is_active', true)
    }
    const { data } = await query.order('created_at', { ascending: false })
    return (data as CareerRow[]) || []
  },

  async create(careerData: Omit<CareerRow, 'id' | 'created_at' | 'updated_at'>): Promise<CareerRow | null> {
    const { data, error } = await supabaseAdmin.from('careers').insert([careerData]).select().single()
    if (error) {
      console.error('[Supabase] Career create error:', error)
      return null
    }
    return data as CareerRow | null
  },

  async update(id: string, updates: Partial<CareerRow>): Promise<CareerRow | null> {
    const { data, error } = await supabaseAdmin
      .from('careers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('[Supabase] Career update error:', error)
      return null
    }
    return data as CareerRow | null
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('careers').delete().eq('id', id)
    if (error) {
      console.error('[Supabase] Career delete error:', error)
      return false
    }
    return true
  },
}

// ============================================================================
// Solutions CRUD helpers
// ============================================================================

export const solutionsDb = {
  async findByUserId(userId: string): Promise<SolutionRow[]> {
    const { data } = await supabaseAdmin.from('solutions').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data as SolutionRow[]) || []
  },

  async list(): Promise<(SolutionRow & { user?: { name: string | null; email: string } | null })[]> {
    const { data } = await supabaseAdmin
      .from('solutions')
      .select('*, user:users(id, name, email)')
      .order('created_at', { ascending: false })
    return (data as (SolutionRow & { user?: { name: string | null; email: string } | null })[]) || []
  },

  async update(id: string, updates: Partial<SolutionRow>): Promise<SolutionRow | null> {
    const { data, error } = await supabaseAdmin
      .from('solutions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('[Supabase] Solution update error:', error)
      return null
    }
    return data as SolutionRow | null
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('solutions').delete().eq('id', id)
    if (error) {
      console.error('[Supabase] Solution delete error:', error)
      return false
    }
    return true
  },

  async create(solutionData: Omit<SolutionRow, 'id' | 'created_at' | 'updated_at'>): Promise<SolutionRow | null> {
    const { data, error } = await supabaseAdmin.from('solutions').insert([solutionData]).select().single()
    if (error) {
      console.error('[Supabase] Solution create error:', error)
      return null
    }
    return data as SolutionRow | null
  },
}

// ============================================================================
// Partnerships CRUD helpers
// ============================================================================

export const partnershipsDb = {
  async findByUserId(userId: string): Promise<PartnershipRow[]> {
    const { data } = await supabaseAdmin.from('partnerships').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data as PartnershipRow[]) || []
  },

  async list(): Promise<(PartnershipRow & { user?: { name: string | null; email: string } | null })[]> {
    const { data } = await supabaseAdmin
      .from('partnerships')
      .select('*, user:users(id, name, email)')
      .order('created_at', { ascending: false })
    return (data as (PartnershipRow & { user?: { name: string | null; email: string } | null })[]) || []
  },

  async update(id: string, updates: Partial<PartnershipRow>): Promise<PartnershipRow | null> {
    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('[Supabase] Partnership update error:', error)
      return null
    }
    return data as PartnershipRow | null
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('partnerships').delete().eq('id', id)
    if (error) {
      console.error('[Supabase] Partnership delete error:', error)
      return false
    }
    return true
  },

  async create(partnershipData: Omit<PartnershipRow, 'id' | 'created_at' | 'updated_at'>): Promise<PartnershipRow | null> {
    const { data, error } = await supabaseAdmin.from('partnerships').insert([partnershipData]).select().single()
    if (error) {
      console.error('[Supabase] Partnership create error:', error)
      return null
    }
    return data as PartnershipRow | null
  },
}

// ============================================================================
// Sponsorships CRUD helpers
// ============================================================================

export const sponsorshipsDb = {
  async findByUserId(userId: string): Promise<SponsorshipRow[]> {
    const { data } = await supabaseAdmin.from('sponsorships').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data as SponsorshipRow[]) || []
  },

  async list(): Promise<(SponsorshipRow & { user?: { name: string | null; email: string } | null })[]> {
    const { data } = await supabaseAdmin
      .from('sponsorships')
      .select('*, user:users(id, name, email)')
      .order('created_at', { ascending: false })
    return (data as (SponsorshipRow & { user?: { name: string | null; email: string } | null })[]) || []
  },

  async update(id: string, updates: Partial<SponsorshipRow>): Promise<SponsorshipRow | null> {
    const { data, error } = await supabaseAdmin
      .from('sponsorships')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('[Supabase] Sponsorship update error:', error)
      return null
    }
    return data as SponsorshipRow | null
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('sponsorships').delete().eq('id', id)
    if (error) {
      console.error('[Supabase] Sponsorship delete error:', error)
      return false
    }
    return true
  },

  async create(sponsorshipData: Omit<SponsorshipRow, 'id' | 'created_at' | 'updated_at'>): Promise<SponsorshipRow | null> {
    const { data, error } = await supabaseAdmin.from('sponsorships').insert([sponsorshipData]).select().single()
    if (error) {
      console.error('[Supabase] Sponsorship create error:', error)
      return null
    }
    return data as SponsorshipRow | null
  },
}

// ============================================================================
// Feedbacks CRUD helpers
// ============================================================================

export const feedbacksDb = {
  async findByUserId(userId: string): Promise<FeedbackRow[]> {
    const { data } = await supabaseAdmin.from('feedbacks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data as FeedbackRow[]) || []
  },

  async create(feedbackData: Omit<FeedbackRow, 'id' | 'created_at' | 'updated_at'>): Promise<FeedbackRow | null> {
    const { data, error } = await supabaseAdmin.from('feedbacks').insert([feedbackData]).select().single()
    if (error) {
      console.error('[Supabase] Feedback create error:', error)
      return null
    }
    return data as FeedbackRow | null
  },
}

// ============================================================================
// Notifications CRUD helpers
// ============================================================================

export const notificationsDb = {
  async findByUserId(userId: string): Promise<NotificationRow[]> {
    const { data } = await supabaseAdmin.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data as NotificationRow[]) || []
  },

  async markAsRead(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('notifications').update({ is_read: true }).eq('id', id)
    return !error
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    return !error
  },

  async create(notificationData: Omit<NotificationRow, 'id' | 'created_at'>): Promise<NotificationRow | null> {
    const { data, error } = await supabaseAdmin.from('notifications').insert([notificationData]).select().single()
    if (error) {
      console.error('[Supabase] Notification create error:', error)
      return null
    }
    return data as NotificationRow | null
  },
}

// ============================================================================
// Messages CRUD helpers
// ============================================================================

export const messagesDb = {
  async findConversation(userId1: string, userId2: string): Promise<MessageRow[]> {
    const { data } = await supabaseAdmin
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true })
    return (data as MessageRow[]) || []
  },

  async create(messageData: Omit<MessageRow, 'id' | 'created_at'>): Promise<MessageRow | null> {
    const { data, error } = await supabaseAdmin.from('messages').insert([messageData]).select().single()
    if (error) {
      console.error('[Supabase] Message create error:', error)
      return null
    }
    return data as MessageRow | null
  },
}

// ============================================================================
// Legal Pages CRUD helpers
// ============================================================================

export const legalPagesDb = {
  async findByType(type: string): Promise<LegalPageRow | null> {
    const { data } = await supabaseAdmin.from('legal_pages').select('*').eq('type', type).single()
    return data as LegalPageRow | null
  },

  async upsert(pageData: Omit<LegalPageRow, 'id'>): Promise<LegalPageRow | null> {
    const { data, error } = await supabaseAdmin
      .from('legal_pages')
      .upsert(pageData, { onConflict: 'type' })
      .select()
      .single()
    if (error) {
      console.error('[Supabase] Legal page upsert error:', error)
      return null
    }
    return data as LegalPageRow | null
  },
}

// ============================================================================
// Career Applications CRUD helpers
// ============================================================================

export const careerApplicationsDb = {
  async findByCareerId(careerId: string): Promise<CareerApplicationRow[]> {
    const { data } = await supabaseAdmin.from('career_applications').select('*').eq('career_id', careerId).order('created_at', { ascending: false })
    return (data as CareerApplicationRow[]) || []
  },

  async findByUserId(userId: string): Promise<CareerApplicationRow[]> {
    const { data } = await supabaseAdmin.from('career_applications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data as CareerApplicationRow[]) || []
  },

  async create(applicationData: Omit<CareerApplicationRow, 'id' | 'created_at' | 'updated_at'>): Promise<CareerApplicationRow | null> {
    const { data, error } = await supabaseAdmin.from('career_applications').insert([applicationData]).select().single()
    if (error) {
      console.error('[Supabase] Career application create error:', error)
      return null
    }
    return data as CareerApplicationRow | null
  },
}

// ============================================================================
// Event Registrations CRUD helpers
// ============================================================================

export const eventRegistrationsDb = {
  async findByEventId(eventId: string): Promise<EventRegistrationRow[]> {
    const { data } = await supabaseAdmin.from('event_registrations').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    return (data as EventRegistrationRow[]) || []
  },

  async findByUserId(userId: string): Promise<EventRegistrationRow[]> {
    const { data } = await supabaseAdmin.from('event_registrations').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data as EventRegistrationRow[]) || []
  },

  async create(registrationData: Omit<EventRegistrationRow, 'id' | 'created_at'>): Promise<EventRegistrationRow | null> {
    const { data, error } = await supabaseAdmin.from('event_registrations').insert([registrationData]).select().single()
    if (error) {
      console.error('[Supabase] Event registration create error:', error)
      return null
    }
    return data as EventRegistrationRow | null
  },
}
