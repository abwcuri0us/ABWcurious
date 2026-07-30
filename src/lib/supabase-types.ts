/**
 * TypeScript type definitions for Supabase database entities.
 * These types match the database schema in database/migration.sql.
 * All table and column names use snake_case to match PostgreSQL conventions.
 */

// ============================================================================
// Entity Types (Supabase Row Shapes)
// ============================================================================

/** profiles — User profiles (linked to Supabase auth.users) */
export interface Profile {
  id: string
  email: string
  name: string | null
  avatar: string | null
  phone: string | null
  city: string | null
  country: string | null
  pincode: string | null
  date_of_birth: string | null
  bio: string | null
  role: string // "admin" | "editor" | "author" | "user"
  provider: string
  password_hash: string | null
  created_at: string
  updated_at: string
}

/** @deprecated Use Profile instead. Kept for backward compatibility. */
export type User = Profile

/** contact_submissions — Contact form submissions */
export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  type: string // "general" | "feedback" | "complaint" | "problem" | "partnership"
  status: string // "new" | "read" | "replied" | "closed"
  user_id: string | null
  created_at: string
}

/** @deprecated Use ContactSubmission instead. Kept for backward compatibility. */
export type Contact = ContactSubmission

/** newsletters — Newsletter subscribers */
export interface Newsletter {
  id: string
  email: string
  is_active: boolean
  created_at: string
}

/** events — Company events */
export interface Event {
  id: string
  title: string
  description: string | null
  date: string
  time: string | null
  end_date: string | null
  location: string | null
  type: string // "webinar" | "conference" | "workshop" | "meetup" | "training" | "hackathon"
  registration_url: string | null
  category: string
  section: string | null
  registration_enabled: boolean
  max_registrations: number | null
  registered_count: number
  cover_image: string | null
  video_url: string | null
  is_published: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

/** event_registrations — Event registrations */
export interface EventRegistration {
  id: string
  event_id: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  status: string // "registered" | "cancelled" | "attended"
  created_at: string
}

/** status_updates — Service status entries */
export interface StatusUpdate {
  id: string
  service: string
  status: string // "operational" | "degraded" | "outage" | "maintenance"
  message: string | null
  created_at: string
  updated_at: string
}

/** careers — Job listings */
export interface Career {
  id: string
  title: string
  department: string
  location: string
  type: string // "full-time" | "part-time" | "internship" | "contract"
  description: string
  requirements: string | null
  is_active: boolean
  slug: string
  created_at: string
  updated_at: string
}

/** job_applications — Job applications */
export interface JobApplication {
  id: string
  career_id: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  cover_letter: string | null
  resume_url: string | null
  status: string // "pending" | "reviewed" | "shortlisted" | "rejected" | "hired"
  created_at: string
  career?: Career | null
}

/** @deprecated Use JobApplication instead. Kept for backward compatibility. */
export type CareerApplication = JobApplication

/** solutions — Solution catalog (CMS-style) */
export interface Solution {
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

/** partnerships — Partnership requests */
export interface Partnership {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  organization: string | null
  partnership_type: string // "technology" | "education" | "business" | "other"
  message: string
  status: string // "pending" | "approved" | "rejected"
  created_at: string
}

/** sponsorships — Sponsorship requests */
export interface Sponsorship {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  organization: string | null
  sponsorship_type: string // "event" | "content" | "general"
  message: string
  budget: string | null
  status: string // "pending" | "approved" | "rejected"
  created_at: string
}

/** notifications — User notifications */
export interface Notification {
  id: string
  user_id: string | null
  title: string
  message: string
  type: string // "newsletter" | "event" | "system" | "message" | "success" | "warning" | "info"
  is_read: boolean
  link: string | null
  created_at: string
}

/** feedback — User feedback */
export interface Feedback {
  id: string
  user_id: string | null
  name: string
  email: string
  type: string // "feedback" | "problem" | "complaint" | "suggestion"
  subject: string
  message: string
  rating: number | null
  status: string // "open" | "in_progress" | "resolved" | "closed"
  admin_reply: string | null
  created_at: string
  updated_at: string
}

/** user_messages — Direct messages between users */
export interface UserMessage {
  id: string
  sender_id: string
  receiver_id: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
  sender?: Pick<Profile, 'id' | 'name' | 'email' | 'avatar'> | null
  receiver?: Pick<Profile, 'id' | 'name' | 'email' | 'avatar'> | null
}

/** activity_logs — Admin/user activity log */
export interface ActivityLog {
  id: string
  user_id: string | null
  user_email: string | null
  action: string
  details: string | null
  ip_address: string | null
  user_agent: string | null
  category: string // "auth" | "content" | "system" | "user" | "feedback" | "contact" | "newsletter" | "general"
  created_at: string
}


/** internship_applications — Internship applications */
export interface InternshipApplication {
  id: string
  name: string
  email: string
  phone: string | null
  college: string
  degree: string
  graduation_year: string
  role: string | null // "Cybersecurity Intern" | "AI/ML Intern" | "Full Stack Developer Intern" | "UI/UX Design Intern" | "Digital Marketing Intern"
  resume_url: string | null
  portfolio_url: string | null
  message: string
  status: string // "new" | "reviewing" | "shortlisted" | "accepted" | "rejected"
  notes: string | null
  created_at: string
  updated_at: string
}

/** maintenance_schedules — Scheduled maintenance windows */
export interface MaintenanceSchedule {
  id: string
  title: string
  description: string
  service: string
  scheduled_start: string
  scheduled_end: string
  status: string // "scheduled" | "in_progress" | "completed" | "cancelled"
  created_by: string | null
  created_at: string
  updated_at: string
}

/** chat_logs — AI chatbot conversation logs */
export interface ChatLog {
  id: string
  session_id: string
  user_message: string
  bot_response: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

/** orders — Service/product orders */
export interface Order {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  order_type: string // "Website" | "Software App" | "Security Solution" | "Consulting" | "Custom"
  description: string
  budget: string | null
  timeline: string | null
  status: string // "new" | "in_review" | "accepted" | "rejected" | "completed"
  notes: string | null
  created_at: string
  updated_at: string
}

/** research_inquiries — Research collaboration inquiries */
export interface ResearchInquiry {
  id: string
  name: string
  email: string
  organization: string | null
  research_topic: string
  description: string
  collaboration_type: string // "Joint Research" | "Consultancy" | "Whitepaper" | "Other"
  status: string // "new" | "in_review" | "accepted" | "rejected" | "completed"
  notes: string | null
  created_at: string
  updated_at: string
}

/** suggestions — Feature requests and suggestions */
export interface Suggestion {
  id: string
  name: string | null
  email: string | null
  category: string // "Feature Request" | "Improvement" | "Bug Report" | "Content" | "Other"
  title: string
  description: string
  priority: string // "Low" | "Medium" | "High" | "Critical"
  status: string // "new" | "in_review" | "accepted" | "rejected" | "completed"
  admin_reply: string | null
  created_at: string
  updated_at: string
}

/** news — News articles */
export interface News {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  category: string // "Company" | "Industry" | "Security Alert"
  author_id: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

/** newsletter_issues — Newsletter issues/editions */
export interface NewsletterIssue {
  id: string
  title: string
  slug: string
  content: string
  issue_number: number
  cover_image: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

/** status_incidents — Service incident reports */
export interface StatusIncident {
  id: string
  title: string
  description: string
  severity: string // "minor" | "major" | "critical"
  service: string
  status: string // "investigating" | "identified" | "monitoring" | "resolved"
  started_at: string
  resolved_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// Create Input Types
// ============================================================================

export interface CreateProfileInput {
  id?: string
  email: string
  name?: string | null
  avatar?: string | null
  bio?: string | null
  provider?: string
  role?: string
  password_hash?: string | null
  phone?: string | null
  city?: string | null
  country?: string | null
  pincode?: string | null
  date_of_birth?: string | null
}

/** @deprecated Use CreateProfileInput instead. Kept for backward compatibility. */
export type CreateUserInput = CreateProfileInput

export interface CreateContactInput {
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  type?: string
  user_id?: string | null
}

export interface CreateEventInput {
  title: string
  description?: string | null
  date: string
  time?: string | null
  end_date?: string | null
  location?: string | null
  type?: string
  registration_url?: string | null
  category?: string
  section?: string | null
  registration_enabled?: boolean
  max_registrations?: number | null
  registered_count?: number
  cover_image?: string | null
  video_url?: string | null
  is_published?: boolean
  created_by?: string | null
}

export interface CreateEventRegistrationInput {
  event_id: string
  user_id?: string | null
  name: string
  email: string
  phone?: string | null
}

export interface CreateStatusInput {
  service: string
  status: string
  message?: string | null
}

export interface CreateCareerInput {
  title: string
  department: string
  location: string
  type?: string
  description: string
  requirements?: string | null
  is_active?: boolean
  slug: string
}

export interface CreateCareerApplicationInput {
  career_id: string
  user_id?: string | null
  name: string
  email: string
  phone?: string | null
  cover_letter?: string | null
  resume_url?: string | null
}

/** @deprecated Use CreateCareerApplicationInput instead. Kept for backward compatibility. */
export type CreateJobApplicationInput = CreateCareerApplicationInput

export interface CreateSolutionInput {
  name: string
  slug: string
  tagline?: string | null
  description: string
  features?: string[] | null
  pricing?: string | null
  demo_url?: string | null
  is_active?: boolean
}

export interface CreatePartnershipInput {
  user_id?: string | null
  name: string
  email: string
  phone?: string | null
  organization?: string | null
  partnership_type: string
  message: string
}

export interface CreateSponsorshipInput {
  user_id?: string | null
  name: string
  email: string
  phone?: string | null
  organization?: string | null
  sponsorship_type: string
  message: string
  budget?: string | null
}

export interface CreateNotificationInput {
  user_id?: string | null
  title: string
  message: string
  type?: string
  link?: string | null
}

export interface CreateUserMessageInput {
  sender_id: string
  receiver_id: string
  subject?: string | null
  message: string
}

export interface CreateFeedbackInput {
  user_id?: string | null
  name: string
  email: string
  type: string
  subject: string
  message: string
  rating?: number | null
}


export interface CreateInternshipApplicationInput {
  name: string
  email: string
  phone?: string | null
  college: string
  degree: string
  graduation_year: string
  role?: string | null
  resume_url?: string | null
  portfolio_url?: string | null
  message: string
}

export interface CreateMaintenanceScheduleInput {
  title: string
  description: string
  service: string
  scheduled_start: string
  scheduled_end: string
  status?: string
  created_by?: string | null
}

export interface CreateOrderInput {
  name: string
  email: string
  phone?: string | null
  company?: string | null
  order_type: string
  description: string
  budget?: string | null
  timeline?: string | null
}

export interface CreateResearchInquiryInput {
  name: string
  email: string
  organization?: string | null
  research_topic: string
  description: string
  collaboration_type: string
}

export interface CreateSuggestionInput {
  name?: string | null
  email?: string | null
  category: string
  title: string
  description: string
  priority?: string
}

export interface CreateNewsInput {
  title: string
  slug: string
  content: string
  excerpt?: string | null
  cover_image?: string | null
  category?: string
  author_id?: string | null
  is_published?: boolean
  published_at?: string | null
}

export interface CreateNewsletterIssueInput {
  title: string
  slug: string
  content: string
  issue_number: number
  cover_image?: string | null
  is_published?: boolean
  published_at?: string | null
}

export interface CreateStatusIncidentInput {
  title: string
  description: string
  severity?: string
  service: string
  status?: string
  started_at: string
  resolved_at?: string | null
}

// ============================================================================
// Update Input Types (all fields optional)
// ============================================================================

export interface UpdateProfileInput {
  email?: string
  name?: string | null
  avatar?: string | null
  bio?: string | null
  provider?: string
  role?: string
  password_hash?: string | null
  phone?: string | null
  city?: string | null
  country?: string | null
  pincode?: string | null
  date_of_birth?: string | null
}

/** @deprecated Use UpdateProfileInput instead. Kept for backward compatibility. */
export type UpdateUserInput = UpdateProfileInput

export interface UpdateEventInput {
  title?: string
  description?: string | null
  date?: string
  time?: string | null
  end_date?: string | null
  location?: string | null
  type?: string
  registration_url?: string | null
  category?: string
  section?: string | null
  registration_enabled?: boolean
  max_registrations?: number | null
  registered_count?: number
  cover_image?: string | null
  video_url?: string | null
  is_published?: boolean
  is_active?: boolean
}

export interface UpdateStatusInput {
  service?: string
  status?: string
  message?: string | null
}

export interface UpdateCareerInput {
  title?: string
  department?: string
  location?: string
  type?: string
  description?: string
  requirements?: string | null
  is_active?: boolean
  slug?: string
}

export interface UpdateCareerApplicationInput {
  status?: string
}

export interface UpdateSolutionInput {
  name?: string
  slug?: string
  tagline?: string | null
  description?: string
  features?: string[] | null
  pricing?: string | null
  demo_url?: string | null
  is_active?: boolean
}

export interface UpdateSponsorshipInput {
  status?: string
}

export interface UpdatePartnershipInput {
  status?: string
}

export interface UpdateFeedbackInput {
  status?: string
  admin_reply?: string | null
}

export interface UpdateNotificationInput {
  is_read?: boolean
}


export interface UpdateInternshipApplicationInput {
  status?: string
  notes?: string | null
  name?: string
  email?: string
  phone?: string | null
  college?: string
  degree?: string
  graduation_year?: string
  role?: string | null
  resume_url?: string | null
  portfolio_url?: string | null
  message?: string
}

export interface UpdateMaintenanceScheduleInput {
  title?: string
  description?: string
  service?: string
  scheduled_start?: string
  scheduled_end?: string
  status?: string
}

export interface UpdateOrderInput {
  status?: string
  notes?: string | null
  name?: string
  email?: string
  phone?: string | null
  company?: string | null
  order_type?: string
  description?: string
  budget?: string | null
  timeline?: string | null
}

export interface UpdateResearchInquiryInput {
  status?: string
  notes?: string | null
  name?: string
  email?: string
  organization?: string | null
  research_topic?: string
  description?: string
  collaboration_type?: string
}

export interface UpdateSuggestionInput {
  status?: string
  admin_reply?: string | null
}

export interface UpdateNewsInput {
  title?: string
  slug?: string
  excerpt?: string | null
  content?: string
  cover_image?: string | null
  category?: string
  is_published?: boolean
  published_at?: string | null
}

export interface UpdateNewsletterIssueInput {
  title?: string
  slug?: string
  content?: string
  issue_number?: number
  cover_image?: string | null
  is_published?: boolean
  published_at?: string | null
}

export interface UpdateStatusIncidentInput {
  title?: string
  description?: string
  severity?: string
  service?: string
  status?: string
  started_at?: string
  resolved_at?: string | null
}

// ============================================================================
// NEW ENTITY TYPES (roles, legal_pages, solution_orders, private_messages, reminders)
// ============================================================================

/** roles — Role-Based Access Control */
export interface Role {
  id: string
  name: string
  description: string | null
  permissions: string
  is_system: boolean
  created_at: string
}

/** legal_pages — Legal page content */
export interface LegalPage {
  id: string
  slug: string
  type: string // "terms" | "privacy" | "cookies" | "disclaimer" | "refund"
  title: string
  content: string
  updated_at: string
  updated_by: string | null
  created_at: string
}

/** solution_orders — User solution orders */
export interface SolutionOrder {
  id: string
  solution_id: string
  user_id: string
  status: string // "pending" | "processing" | "completed" | "cancelled"
  notes: string | null
  created_at: string
  solution?: Pick<Solution, 'id' | 'name' | 'slug'> | null
  profile?: Pick<Profile, 'id' | 'name' | 'email'> | null
}

/** private_messages — Admin private messages */
export interface PrivateMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

/** reminders — Service inquiries */
export interface Reminder {
  id: string
  name: string
  email: string
  phone: string | null
  service: string
  company: string | null
  message: string
  budget: string | null
  timeline: string | null
  status: string // "new" | "in_review" | "contacted" | "closed"
  created_at: string
}

// ============================================================================
// Utility / Helper Types
// ============================================================================

/** Supabase REST API error shape */
export interface SupabaseDbError {
  message: string
  code?: string
  details?: string
  hint?: string
}

/** Generic Supabase query result */
export interface SupabaseDbResult<T> {
  data: T | null
  error: SupabaseDbError | null
}