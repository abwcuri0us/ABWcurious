-- ============================================================
-- ABWcurious Pvt. Ltd. — Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Check if current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin')
    AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if current user has editor or higher role
CREATE OR REPLACE FUNCTION public.is_editor_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'editor')
    AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if current user has HR or admin role
CREATE OR REPLACE FUNCTION public.is_hr_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'hr')
    AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Anyone can read public profiles
CREATE POLICY "Profiles are publicly readable" ON public.profiles
  FOR SELECT USING (is_active = TRUE);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Users cannot change their own role
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

-- Only super admins can delete profiles
CREATE POLICY "Super admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_super_admin());

-- ============================================================
-- BLOGS POLICIES
-- ============================================================

-- Published blogs are publicly readable
CREATE POLICY "Published blogs are publicly readable" ON public.blogs
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- Editors and above can read all blogs
CREATE POLICY "Editors can read all blogs" ON public.blogs
  FOR SELECT USING (public.is_editor_or_above());

-- Editors and above can insert blogs
CREATE POLICY "Editors can insert blogs" ON public.blogs
  FOR INSERT WITH CHECK (public.is_editor_or_above());

-- Authors can update their own blogs; admins can update any
CREATE POLICY "Authors and admins can update blogs" ON public.blogs
  FOR UPDATE USING (
    (author_id = auth.uid() AND public.is_editor_or_above())
    OR public.is_admin()
  );

-- Admins can delete blogs
CREATE POLICY "Admins can delete blogs" ON public.blogs
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- PRODUCTS POLICIES
-- ============================================================

-- Published products are publicly readable
CREATE POLICY "Published products are publicly readable" ON public.products
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- Admins and editors can read all products
CREATE POLICY "Editors can read all products" ON public.products
  FOR SELECT USING (public.is_editor_or_above());

-- Admins can manage products
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- Editors can insert/update products
CREATE POLICY "Editors can insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_editor_or_above());

CREATE POLICY "Editors can update products" ON public.products
  FOR UPDATE USING (public.is_editor_or_above());

-- ============================================================
-- SERVICES POLICIES
-- ============================================================

-- Published services are publicly readable
CREATE POLICY "Published services are publicly readable" ON public.services
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- Editors can read all services
CREATE POLICY "Editors can read all services" ON public.services
  FOR SELECT USING (public.is_editor_or_above());

-- Admins can manage services
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.is_admin());

CREATE POLICY "Editors can insert services" ON public.services
  FOR INSERT WITH CHECK (public.is_editor_or_above());

CREATE POLICY "Editors can update services" ON public.services
  FOR UPDATE USING (public.is_editor_or_above());

-- ============================================================
-- RESEARCH PAPERS POLICIES
-- ============================================================

-- Published research is publicly readable
CREATE POLICY "Published research is publicly readable" ON public.research_papers
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- Research team and above can read all
CREATE POLICY "Research team can read all" ON public.research_papers
  FOR SELECT USING (public.is_editor_or_above());

-- Research team can insert/update
CREATE POLICY "Research team can insert" ON public.research_papers
  FOR INSERT WITH CHECK (public.is_editor_or_above());

CREATE POLICY "Research team can update" ON public.research_papers
  FOR UPDATE USING (public.is_editor_or_above());

-- Admins can delete
CREATE POLICY "Admins can delete research" ON public.research_papers
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- EVENTS POLICIES
-- ============================================================

-- All events are publicly readable
CREATE POLICY "Events are publicly readable" ON public.events
  FOR SELECT USING (deleted_at IS NULL);

-- Editors and above can manage events
CREATE POLICY "Editors can insert events" ON public.events
  FOR INSERT WITH CHECK (public.is_editor_or_above());

CREATE POLICY "Editors can update events" ON public.events
  FOR UPDATE USING (public.is_editor_or_above());

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- JOBS POLICIES
-- ============================================================

-- Published jobs are publicly readable
CREATE POLICY "Published jobs are publicly readable" ON public.jobs
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- HR and above can read all jobs
CREATE POLICY "HR can read all jobs" ON public.jobs
  FOR SELECT USING (public.is_hr_or_above());

-- HR and above can manage jobs
CREATE POLICY "HR can insert jobs" ON public.jobs
  FOR INSERT WITH CHECK (public.is_hr_or_above());

CREATE POLICY "HR can update jobs" ON public.jobs
  FOR UPDATE USING (public.is_hr_or_above());

CREATE POLICY "Admins can delete jobs" ON public.jobs
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- JOB APPLICATIONS POLICIES
-- ============================================================

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON public.job_applications
  FOR SELECT USING (
    applicant_id = auth.uid()
    OR public.is_hr_or_above()
  );

-- Anyone can submit an application
CREATE POLICY "Anyone can submit application" ON public.job_applications
  FOR INSERT WITH CHECK (TRUE);

-- HR and above can update application status
CREATE POLICY "HR can update applications" ON public.job_applications
  FOR UPDATE USING (public.is_hr_or_above());

-- Admins can delete applications
CREATE POLICY "Admins can delete applications" ON public.job_applications
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- CONTACTS POLICIES
-- ============================================================

-- Only admins and support can read contacts
CREATE POLICY "Admins can read contacts" ON public.contacts
  FOR SELECT USING (public.is_admin());

-- Anyone can submit a contact form
CREATE POLICY "Anyone can submit contact" ON public.contacts
  FOR INSERT WITH CHECK (TRUE);

-- Admins can update contacts
CREATE POLICY "Admins can update contacts" ON public.contacts
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- NEWSLETTER POLICIES
-- ============================================================

-- Admins can read subscribers
CREATE POLICY "Admins can read newsletter" ON public.newsletter_subscribers
  FOR SELECT USING (public.is_admin());

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (TRUE);

-- Users can manage their own subscription
CREATE POLICY "Users can update own subscription" ON public.newsletter_subscribers
  FOR UPDATE USING (TRUE);

-- ============================================================
-- PARTNERS POLICIES
-- ============================================================

-- Approved partners are publicly readable
CREATE POLICY "Approved partners are publicly readable" ON public.partners
  FOR SELECT USING (is_approved = TRUE AND deleted_at IS NULL);

-- Admins can read all partners
CREATE POLICY "Admins can read all partners" ON public.partners
  FOR SELECT USING (public.is_admin());

-- Anyone can apply to be a partner
CREATE POLICY "Anyone can apply to be a partner" ON public.partners
  FOR INSERT WITH CHECK (TRUE);

-- Admins can manage partners
CREATE POLICY "Admins can manage partners" ON public.partners
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete partners" ON public.partners
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- TESTIMONIALS POLICIES
-- ============================================================

-- Approved testimonials are publicly readable
CREATE POLICY "Approved testimonials are publicly readable" ON public.testimonials
  FOR SELECT USING (is_approved = TRUE AND deleted_at IS NULL);

-- Admins can read all testimonials
CREATE POLICY "Admins can read all testimonials" ON public.testimonials
  FOR SELECT USING (public.is_admin());

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL USING (public.is_admin());

-- ============================================================
-- MEDIA POLICIES
-- ============================================================

-- All media is publicly readable
CREATE POLICY "Media is publicly readable" ON public.media
  FOR SELECT USING (deleted_at IS NULL);

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media" ON public.media
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own uploads; admins can update all
CREATE POLICY "Users can update own media" ON public.media
  FOR UPDATE USING (
    uploader_id = auth.uid()
    OR public.is_admin()
  );

-- Admins can delete media
CREATE POLICY "Admins can delete media" ON public.media
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- AI CONVERSATIONS POLICIES
-- ============================================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

-- Anyone can create a conversation
CREATE POLICY "Anyone can create conversation" ON public.ai_conversations
  FOR INSERT WITH CHECK (TRUE);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations" ON public.ai_conversations
  FOR UPDATE USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================

-- Only super admins can read audit logs
CREATE POLICY "Super admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_super_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- No updates or deletes on audit logs
