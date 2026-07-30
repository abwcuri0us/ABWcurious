/**
 * Supabase Database Service
 *
 * A comprehensive database service that uses the Supabase REST API (via the JS client)
 * for ALL CRUD operations.
 *
 * Usage:
 *   import { supabaseDb } from '@/lib/supabase-db'
 *   const user = await supabaseDb.findUserByEmail('test@example.com')
 *
 * All operations use supabaseAdmin (service role key) which bypasses RLS.
 * Errors are handled gracefully — returning null or empty arrays on failure.
 */

import { supabaseAdmin } from './supabase'
import { randomUUID } from 'crypto'
import type {
  User,
  Contact,
  Newsletter as NewsletterType,
  Event as EventType,
  EventRegistration,
  StatusUpdate,
  Career,
  CareerApplication,
  Solution,
  Partnership,
  Sponsorship,
  Notification as NotificationType,
  Feedback,
  CreateUserInput,
  UpdateUserInput,
  CreateContactInput,
  CreateEventInput,
  CreateEventRegistrationInput,
  UpdateEventInput,
  CreateStatusInput,
  UpdateStatusInput,
  CreateCareerInput,
  UpdateCareerInput,
  CreateCareerApplicationInput,
  CreateSolutionInput,
  CreatePartnershipInput,
  CreateSponsorshipInput,
  CreateNotificationInput,
  CreateFeedbackInput,
  UpdateNotificationInput,
} from './supabase-types'

// ============================================================================
// Internal helpers
// ============================================================================

/** Remove undefined values from an object so Supabase doesn't complain */
function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value
    }
  }
  return result
}

/** Log a Supabase error with context and return a safe fallback */
function logError(context: string, error: unknown): void {
  if (error && typeof error === 'object' && 'message' in error) {
    console.warn(`[Supabase DB] ${context}:`, (error as { message: string }).message)
  } else {
    console.warn(`[Supabase DB] ${context}:`, error)
  }
}

// ============================================================================
// Database Service
// ============================================================================

export const supabaseDb = {
  // ==========================================================================
  // Users
  // ==========================================================================

  /**
   * Find a user by their email address.
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (error) {
        logError('findUserByEmail', error)
        return null
      }

      return data as User | null
    } catch (err) {
      logError('findUserByEmail', err)
      return null
    }
  },

  /**
   * Find a user by their ID.
   */
  async findUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        logError('findUserById', error)
        return null
      }

      return data as User | null
    } catch (err) {
      logError('findUserById', err)
      return null
    }
  },

  /**
   * Create a new user.
   */
  async createUser(data: CreateUserInput): Promise<User> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: data.id ?? randomUUID(),
      email: data.email,
      name: data.name ?? null,
      avatar: data.avatar ?? null,
      bio: data.bio ?? null,
      provider: data.provider ?? 'credentials',
      role: data.role ?? 'user',
      password_hash: data.password_hash ?? null,
      phone: data.phone ?? null,
      city: data.city ?? null,
      country: data.country ?? null,
      pincode: data.pincode ?? null,
      date_of_birth: data.date_of_birth ?? null,
    })

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createUser', error)
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return user as User
  },

  /**
   * Update an existing user by ID.
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const updateData = stripUndefined({
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      bio: data.bio,
      provider: data.provider,
      role: data.role,
      password_hash: data.password_hash,
      phone: data.phone,
      city: data.city,
      country: data.country,
      pincode: data.pincode,
      date_of_birth: data.date_of_birth,
    })

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('updateUser', error)
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return user as User
  },

  /**
   * Delete a user by ID.
   */
  async deleteUser(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) {
      logError('deleteUser', error)
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  },

  /**
   * List all users, ordered by creation date (newest first).
   */
  async listUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        logError('listUsers', error)
        return []
      }

      return (data as User[]) ?? []
    } catch (err) {
      logError('listUsers', err)
      return []
    }
  },

  // ==========================================================================
  // Contacts
  // ==========================================================================

  /**
   * Create a new contact submission.
   */
  async createContact(data: CreateContactInput): Promise<Contact> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      subject: data.subject,
      message: data.message,
    })

    const { data: contact, error } = await supabaseAdmin
      .from('contact_submissions')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createContact', error)
      throw new Error(`Failed to create contact: ${error.message}`)
    }

    return contact as Contact
  },

  /**
   * List all contact submissions, ordered by creation date (newest first).
   */
  async listContacts(): Promise<Contact[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        logError('listContacts', error)
        return []
      }

      return (data as Contact[]) ?? []
    } catch (err) {
      logError('listContacts', err)
      return []
    }
  },

  // ==========================================================================
  // Newsletter
  // ==========================================================================

  /**
   * Subscribe an email to the newsletter.
   * Throws if the email already exists (unique constraint).
   */
  async subscribeNewsletter(email: string): Promise<NewsletterType> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const { data, error } = await supabaseAdmin
      .from('newsletters')
      .insert([{ id: randomUUID(), email }])
      .select()
      .single()

    if (error) {
      // Unique constraint violation (23505)
      if (error.code === '23505') {
        throw new Error('This email is already subscribed to the newsletter.')
      }
      logError('subscribeNewsletter', error)
      throw new Error(`Failed to subscribe: ${error.message}`)
    }

    return data as NewsletterType
  },

  /**
   * Check if an email is already subscribed to the newsletter.
   */
  async checkNewsletterExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('newsletters')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (error) {
        logError('checkNewsletterExists', error)
        return false
      }

      return !!data
    } catch (err) {
      logError('checkNewsletterExists', err)
      return false
    }
  },

  // ==========================================================================
  // Events
  // ==========================================================================

  /**
   * List all events, ordered by date (ascending for upcoming events).
   */
  async listEvents(): Promise<EventType[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (error) {
        logError('listEvents', error)
        return []
      }

      return (data as EventType[]) ?? []
    } catch (err) {
      logError('listEvents', err)
      return []
    }
  },

  /**
   * List events ordered by date descending (most recent first).
   */
  async listEventsDesc(): Promise<EventType[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        logError('listEventsDesc', error)
        return []
      }

      return (data as EventType[]) ?? []
    } catch (err) {
      logError('listEventsDesc', err)
      return []
    }
  },

  /**
   * Create a new event.
   */
  async createEvent(data: CreateEventInput): Promise<EventType> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      title: data.title,
      description: data.description ?? null,
      date: data.date,
      location: data.location ?? null,
      type: data.type ?? 'webinar',
      registration_url: data.registration_url ?? null,
      category: data.category ?? data.type ?? 'webinar',
      registration_enabled: data.registration_enabled ?? false,
      max_registrations: data.max_registrations ?? null,
      registered_count: data.registered_count ?? 0,
    })

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createEvent', error)
      throw new Error(`Failed to create event: ${error.message}`)
    }

    return event as EventType
  },

  /**
   * Update an existing event by ID.
   */
  async updateEvent(id: string, data: UpdateEventInput): Promise<EventType> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const updateData = stripUndefined({
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
      type: data.type,
      registration_url: data.registration_url,
      category: data.category,
      registration_enabled: data.registration_enabled,
      max_registrations: data.max_registrations,
      registered_count: data.registered_count,
    })

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('updateEvent', error)
      throw new Error(`Failed to update event: ${error.message}`)
    }

    return event as EventType
  },

  /**
   * Delete an event by ID.
   */
  async deleteEvent(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      logError('deleteEvent', error)
      throw new Error(`Failed to delete event: ${error.message}`)
    }
  },

  /**
   * Find an event by ID.
   */
  async findEventById(id: string): Promise<EventType | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        logError('findEventById', error)
        return null
      }

      return data as EventType | null
    } catch (err) {
      logError('findEventById', err)
      return null
    }
  },

  // ==========================================================================
  // Event Registrations
  // ==========================================================================

  /**
   * Create a new event registration.
   * Throws if the email is already registered for the event (unique constraint).
   */
  async createEventRegistration(data: CreateEventRegistrationInput): Promise<EventRegistration> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      event_id: data.event_id,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
    })

    const { data: registration, error } = await supabaseAdmin
      .from('event_registrations')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      // Unique constraint violation (23505)
      if (error.code === '23505') {
        throw new Error('This email is already registered for this event.')
      }
      logError('createEventRegistration', error)
      throw new Error(`Failed to register: ${error.message}`)
    }

    return registration as EventRegistration
  },

  /**
   * List all registrations for a specific event.
   */
  async listEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (error) {
        logError('listEventRegistrations', error)
        return []
      }

      return (data as EventRegistration[]) ?? []
    } catch (err) {
      logError('listEventRegistrations', err)
      return []
    }
  },

  /**
   * Count registrations for a specific event.
   */
  async countEventRegistrations(eventId: string): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('event_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)

      if (error) {
        logError('countEventRegistrations', error)
        return 0
      }

      return count ?? 0
    } catch (err) {
      logError('countEventRegistrations', err)
      return 0
    }
  },

  /**
   * Increment the registered_count field on an event.
   */
  async incrementEventRegisteredCount(eventId: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    // Use raw SQL via RPC or do a read-then-update approach
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('registered_count')
      .eq('id', eventId)
      .single()

    if (fetchError || !event) {
      logError('incrementEventRegisteredCount: fetch', fetchError)
      throw new Error('Failed to fetch event for count increment')
    }

    const newCount = (event.registered_count ?? 0) + 1
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ registered_count: newCount })
      .eq('id', eventId)

    if (updateError) {
      logError('incrementEventRegisteredCount: update', updateError)
      throw new Error('Failed to update registered count')
    }
  },

  /**
   * List all event registrations for a specific email address.
   */
  async listRegistrationsByEmail(email: string): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('event_registrations')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })

      if (error) {
        logError('listRegistrationsByEmail', error)
        return []
      }

      return (data as EventRegistration[]) ?? []
    } catch (err) {
      logError('listRegistrationsByEmail', err)
      return []
    }
  },

  // ==========================================================================
  // Newsletter (additional methods)
  // ==========================================================================

  /**
   * List all newsletter subscriber emails.
   */
  async listNewsletterSubscribers(): Promise<NewsletterType[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        logError('listNewsletterSubscribers', error)
        return []
      }

      return (data as NewsletterType[]) ?? []
    } catch (err) {
      logError('listNewsletterSubscribers', err)
      return []
    }
  },

  /**
   * List all newsletter subscriber emails.
   */
  async listNewsletterEmails(): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('newsletters')
        .select('email')
        .order('created_at', { ascending: false })

      if (error) {
        logError('listNewsletterEmails', error)
        return []
      }

      return ((data as { email: string }[]) ?? []).map((d) => d.email)
    } catch (err) {
      logError('listNewsletterEmails', err)
      return []
    }
  },

  // ==========================================================================
  // Status Updates
  // ==========================================================================

  /**
   * List all status updates, ordered by updated_at (most recently updated first).
   */
  async listStatusUpdates(): Promise<StatusUpdate[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('status_updates')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        logError('listStatusUpdates', error)
        return []
      }

      return (data as StatusUpdate[]) ?? []
    } catch (err) {
      logError('listStatusUpdates', err)
      return []
    }
  },

  /**
   * Create a new status update.
   */
  async createStatusUpdate(data: CreateStatusInput): Promise<StatusUpdate> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      service: data.service,
      status: data.status,
      message: data.message ?? null,
    })

    const { data: statusUpdate, error } = await supabaseAdmin
      .from('status_updates')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createStatusUpdate', error)
      throw new Error(`Failed to create status update: ${error.message}`)
    }

    return statusUpdate as StatusUpdate
  },

  /**
   * Update an existing status update by ID.
   */
  async updateStatusUpdate(id: string, data: UpdateStatusInput): Promise<StatusUpdate> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const updateData = stripUndefined({
      service: data.service,
      status: data.status,
      message: data.message,
    })

    const { data: statusUpdate, error } = await supabaseAdmin
      .from('status_updates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('updateStatusUpdate', error)
      throw new Error(`Failed to update status: ${error.message}`)
    }

    return statusUpdate as StatusUpdate
  },

  // ==========================================================================
  // Careers
  // ==========================================================================

  /**
   * List only active career listings, ordered by creation date (newest first).
   */
  async listActiveCareers(): Promise<Career[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('careers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        logError('listActiveCareers', error)
        return []
      }

      return (data as Career[]) ?? []
    } catch (err) {
      logError('listActiveCareers', err)
      return []
    }
  },

  /**
   * List all career listings (active + inactive), ordered by creation date (newest first).
   */
  async listAllCareers(): Promise<Career[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('careers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        logError('listAllCareers', error)
        return []
      }

      return (data as Career[]) ?? []
    } catch (err) {
      logError('listAllCareers', err)
      return []
    }
  },

  /**
   * Create a new career listing.
   */
  async createCareer(data: CreateCareerInput): Promise<Career> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type ?? 'full-time',
      description: data.description,
      requirements: data.requirements ?? null,
      is_active: data.is_active ?? true,
      slug: data.slug,
    })

    const { data: career, error } = await supabaseAdmin
      .from('careers')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createCareer', error)
      throw new Error(`Failed to create career: ${error.message}`)
    }

    return career as Career
  },

  /**
   * Update an existing career listing by ID.
   */
  async updateCareer(id: string, data: UpdateCareerInput): Promise<Career> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const updateData = stripUndefined({
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type,
      description: data.description,
      requirements: data.requirements,
      is_active: data.is_active,
    })

    const { data: career, error } = await supabaseAdmin
      .from('careers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('updateCareer', error)
      throw new Error(`Failed to update career: ${error.message}`)
    }

    return career as Career
  },

  /**
   * Delete a career listing by ID.
   */
  async deleteCareer(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const { error } = await supabaseAdmin
      .from('careers')
      .delete()
      .eq('id', id)

    if (error) {
      logError('deleteCareer', error)
      throw new Error(`Failed to delete career: ${error.message}`)
    }
  },

  // ==========================================================================
  // Career Applications
  // ==========================================================================

  async createCareerApplication(data: CreateCareerApplicationInput): Promise<CareerApplication> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      career_id: data.career_id,
      user_id: data.user_id ?? null,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      cover_letter: data.cover_letter ?? null,
      resume_url: data.resume_url ?? null,
    })

    const { data: app, error } = await supabaseAdmin
      .from('job_applications')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createCareerApplication', error)
      throw new Error(`Failed to create career application: ${error.message}`)
    }

    return app as CareerApplication
  },

  async listCareerApplicationsByEmail(email: string): Promise<CareerApplication[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('job_applications')
        .select('*, career:careers(id, title, department, location, type)')
        .eq('email', email)
        .order('created_at', { ascending: false })

      if (error) { logError('listCareerApplicationsByEmail', error); return [] }
      return (data as CareerApplication[]) ?? []
    } catch (err) {
      logError('listCareerApplicationsByEmail', err)
      return []
    }
  },

  // ==========================================================================
  // Solutions
  // ==========================================================================

  async createSolution(data: CreateSolutionInput): Promise<Solution> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      tagline: data.tagline ?? null,
      description: data.description,
      features: data.features ?? null,
      pricing: data.pricing ?? null,
      demo_url: data.demo_url ?? null,
      is_active: data.is_active ?? true,
    })

    const { data: solution, error } = await supabaseAdmin
      .from('solutions')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createSolution', error)
      throw new Error(`Failed to create solution: ${error.message}`)
    }

    return solution as Solution
  },

  async listSolutionsActive(): Promise<Solution[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('solutions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) { logError('listSolutionsActive', error); return [] }
      return (data as Solution[]) ?? []
    } catch (err) {
      logError('listSolutionsActive', err)
      return []
    }
  },

  async listAllSolutions(): Promise<Solution[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) { logError('listAllSolutions', error); return [] }
      return (data as Solution[]) ?? []
    } catch (err) {
      logError('listAllSolutions', err)
      return []
    }
  },

  // ==========================================================================
  // Partnerships
  // ==========================================================================

  async createPartnership(data: CreatePartnershipInput): Promise<Partnership> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      user_id: data.user_id ?? null,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      organization: data.organization ?? null,
      partnership_type: data.partnership_type,
      message: data.message,
    })

    const { data: partnership, error } = await supabaseAdmin
      .from('partnerships')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createPartnership', error)
      throw new Error(`Failed to create partnership: ${error.message}`)
    }

    return partnership as Partnership
  },

  async listPartnershipsByEmail(email: string): Promise<Partnership[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('partnerships')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })

      if (error) { logError('listPartnershipsByEmail', error); return [] }
      return (data as Partnership[]) ?? []
    } catch (err) {
      logError('listPartnershipsByEmail', err)
      return []
    }
  },

  // ==========================================================================
  // Sponsorships
  // ==========================================================================

  async createSponsorship(data: CreateSponsorshipInput): Promise<Sponsorship> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      user_id: data.user_id ?? null,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      organization: data.organization ?? null,
      sponsorship_type: data.sponsorship_type,
      message: data.message,
      budget: data.budget ?? null,
    })

    const { data: sponsorship, error } = await supabaseAdmin
      .from('sponsorships')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createSponsorship', error)
      throw new Error(`Failed to create sponsorship: ${error.message}`)
    }

    return sponsorship as Sponsorship
  },

  async listSponsorshipsByEmail(email: string): Promise<Sponsorship[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('sponsorships')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })

      if (error) { logError('listSponsorshipsByEmail', error); return [] }
      return (data as Sponsorship[]) ?? []
    } catch (err) {
      logError('listSponsorshipsByEmail', err)
      return []
    }
  },

  // ==========================================================================
  // Feedback
  // ==========================================================================

  async createFeedback(data: CreateFeedbackInput): Promise<Feedback> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      user_id: data.user_id ?? null,
      name: data.name,
      email: data.email,
      type: data.type,
      subject: data.subject,
      message: data.message,
      rating: data.rating ?? null,
    })

    const { data: feedback, error } = await supabaseAdmin
      .from('feedback')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createFeedback', error)
      throw new Error(`Failed to create feedback: ${error.message}`)
    }

    return feedback as Feedback
  },

  async listFeedbackByEmail(email: string): Promise<Feedback[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('feedback')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })

      if (error) { logError('listFeedbackByEmail', error); return [] }
      return (data as Feedback[]) ?? []
    } catch (err) {
      logError('listFeedbackByEmail', err)
      return []
    }
  },

  // ==========================================================================
  // Notifications
  // ==========================================================================

  async createNotification(data: CreateNotificationInput): Promise<NotificationType> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const insertData = stripUndefined({
      id: randomUUID(),
      user_id: data.user_id ?? null,
      title: data.title,
      message: data.message,
      type: data.type ?? 'system',
      link: data.link ?? null,
    })

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      logError('createNotification', error)
      throw new Error(`Failed to create notification: ${error.message}`)
    }

    return notification as NotificationType
  },

  async listNotificationsByUserId(userId: string): Promise<NotificationType[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) { logError('listNotificationsByUserId', error); return [] }
      return (data as NotificationType[]) ?? []
    } catch (err) {
      logError('listNotificationsByUserId', err)
      return []
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      logError('markNotificationRead', error)
      throw new Error(`Failed to mark notification as read: ${error.message}`)
    }
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('[Supabase DB] supabaseAdmin is not available')
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)

    if (error) {
      logError('markAllNotificationsRead', error)
      throw new Error(`Failed to mark all notifications as read: ${error.message}`)
    }
  },
}

// ============================================================================
// Convenience: also export as `db` for legacy imports from `@/lib/db`.
// ============================================================================

/**
 * Database interface that routes all operations
 * through the Supabase REST API.
 *
 * This object exposes a `db` shape:
 *   db.user.findUnique({ where: { email } })
 *   db.user.findMany({ ... })
 *   db.user.create({ data: { ... } })
 *   db.user.update({ where: { id }, data: { ... } })
 *   db.user.delete({ where: { id } })
 *
 * But internally uses supabaseDb for all operations.
 */
export const db = {
  user: {
    findUnique: async (args: { where: { id?: string; email?: string } }): Promise<User | null> => {
      if (args.where.email) return supabaseDb.findUserByEmail(args.where.email)
      if (args.where.id) return supabaseDb.findUserById(args.where.id)
      return null
    },

    findMany: async (args?: {
      select?: Record<string, boolean>
      orderBy?: Record<string, string>
    }): Promise<User[]> => {
      const users = await supabaseDb.listUsers()
      // Handle select: filter fields if specified
      if (args?.select) {
        const fields = Object.keys(args.select).filter((k) => args.select![k])
        return users.map((u) => {
          const filtered: Record<string, unknown> = {}
          for (const f of fields) {
            filtered[f] = u[f as keyof User]
          }
          return filtered as unknown as User
        })
      }
      return users
    },

    create: async (args: { data: CreateUserInput }): Promise<User> => {
      return supabaseDb.createUser(args.data)
    },

    update: async (args: { where: { id?: string; email?: string }; data: UpdateUserInput }): Promise<User> => {
      let id = args.where.id
      if (!id && args.where.email) {
        const user = await supabaseDb.findUserByEmail(args.where.email)
        if (!user) throw new Error('User not found')
        id = user.id
      }
      if (!id) throw new Error('No identifier provided for user update')
      return supabaseDb.updateUser(id, args.data)
    },

    delete: async (args: { where: { id: string } }): Promise<void> => {
      return supabaseDb.deleteUser(args.where.id)
    },
  },

  contact: {
    create: async (args: { data: CreateContactInput }): Promise<Contact> => {
      return supabaseDb.createContact(args.data)
    },

    findMany: async (): Promise<Contact[]> => {
      return supabaseDb.listContacts()
    },
  },

  newsletter: {
    findUnique: async (args: { where: { email: string } }): Promise<NewsletterType | null> => {
      if (!supabaseAdmin) return null
      try {
        const { data, error } = await supabaseAdmin
          .from('newsletters')
          .select('*')
          .eq('email', args.where.email)
          .maybeSingle()

        if (error) return null
        return data as NewsletterType | null
      } catch {
        return null
      }
    },

    create: async (args: { data: { email: string } }): Promise<NewsletterType> => {
      return supabaseDb.subscribeNewsletter(args.data.email)
    },
  },

  event: {
    findMany: async (args?: {
      orderBy?: Record<string, string>
    }): Promise<EventType[]> => {
      const orderField = args?.orderBy
        ? Object.keys(args.orderBy)[0]
        : 'date'
      const orderDir = args?.orderBy?.[orderField]

      if (orderField === 'date' && orderDir === 'desc') {
        return supabaseDb.listEventsDesc()
      }
      return supabaseDb.listEvents()
    },

    create: async (args: { data: CreateEventInput }): Promise<EventType> => {
      return supabaseDb.createEvent(args.data)
    },

    update: async (args: { where: { id: string }; data: UpdateEventInput }): Promise<EventType> => {
      return supabaseDb.updateEvent(args.where.id, args.data)
    },

    delete: async (args: { where: { id: string } }): Promise<void> => {
      return supabaseDb.deleteEvent(args.where.id)
    },
  },

  statusUpdate: {
    findMany: async (): Promise<StatusUpdate[]> => {
      return supabaseDb.listStatusUpdates()
    },

    create: async (args: { data: CreateStatusInput }): Promise<StatusUpdate> => {
      return supabaseDb.createStatusUpdate(args.data)
    },

    update: async (args: { where: { id: string }; data: UpdateStatusInput }): Promise<StatusUpdate> => {
      return supabaseDb.updateStatusUpdate(args.where.id, args.data)
    },
  },

  career: {
    findMany: async (args?: {
      where?: Record<string, unknown>
      orderBy?: Record<string, string>
    }): Promise<Career[]> => {
      const activeOnly = args?.where?.isActive === true
      if (activeOnly) {
        return supabaseDb.listActiveCareers()
      }
      return supabaseDb.listAllCareers()
    },

    create: async (args: { data: CreateCareerInput }): Promise<Career> => {
      return supabaseDb.createCareer(args.data)
    },

    update: async (args: { where: { id: string }; data: UpdateCareerInput }): Promise<Career> => {
      return supabaseDb.updateCareer(args.where.id, args.data)
    },

    delete: async (args: { where: { id: string } }): Promise<void> => {
      return supabaseDb.deleteCareer(args.where.id)
    },
  },
}

// Default export: the db object
export default db
