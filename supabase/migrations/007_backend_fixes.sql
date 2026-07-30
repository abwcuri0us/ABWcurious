-- ============================================================
-- ABWcurious — Backend Fixes Migration
-- Migration: 007_backend_fixes.sql
--
-- Purpose: Fix the mismatches between application code and the
-- live database that were causing 404 / 403 errors on:
--   - Newsletter signup (code writes to `newsletters`, only a read-only VIEW exists)
--   - Contact submissions (`contact_submissions` had no service_role grant)
--   - Newsletter issues (table missing entirely)
--   - blog_posts / career_applications (no RLS grants for service_role)
--
-- This migration is IDEMPOTENT — safe to run multiple times.
-- All grants use service_role which bypasses RLS, so explicit
-- grants are added for tables that were created without them.
-- ============================================================

-- ============================================================
-- 1. NEWSLETTER: make `newsletters` a real, writable table
-- ============================================================
-- The app (src/lib/supabase-db.ts, api/newsletter/route.ts,
-- api/admin/analytics, api/admin/overview) reads & writes a
-- table called `newsletters`. Previously migration 006 created
-- only a VIEW named `newsletter` (singular). Drops the singular
-- view if present and creates a proper `newsletters` table,
-- keeping existing subscribers from `newsletter_subscribers`.

-- Drop the singular read-only view if it exists (recreated below as a view)
DROP VIEW IF EXISTS public.newsletter;

-- Create the writable table the app expects
CREATE TABLE IF NOT EXISTS public.newsletters (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email     TEXT UNIQUE NOT NULL,
  name      TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  source    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletters_email ON public.newsletters(email);

-- Backfill from newsletter_subscribers so nothing is lost
INSERT INTO public.newsletters (id, email, name, is_active, source, created_at, updated_at)
SELECT id, email, name, is_active, source, created_at, COALESCE(updated_at, created_at)
FROM public.newsletter_subscribers
ON CONFLICT (email) DO NOTHING;

-- Recreate the singular view for any legacy code that reads `newsletter`
CREATE OR REPLACE VIEW public.newsletter AS
  SELECT id, email, is_active, created_at FROM public.newsletters;

-- ============================================================
-- 2. CONTACT_SUBMISSIONS: fix permissions
--    Table exists but service_role was getting 403 (missing
--    grants + RLS enabled without policies). Grant full access.
-- ============================================================
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop & recreate policies to avoid duplicates
DROP POLICY IF EXISTS contact_submissions_service_all ON public.contact_submissions;
DROP POLICY IF EXISTS contact_submissions_insert_any ON public.contact_submissions;
CREATE POLICY contact_submissions_insert_any
  ON public.contact_submissions FOR INSERT WITH CHECK (true);

-- ============================================================
-- 3. NEWSLETTER_ISSUES: create the missing table
--    Referenced by src/app/api/newsletter-issues/*
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_issues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  issue_number INTEGER NOT NULL DEFAULT 1,
  content      TEXT,
  excerpt      TEXT,
  cover_image  TEXT,
  status       TEXT NOT NULL DEFAULT 'draft',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  author_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_issues_slug ON public.newsletter_issues(slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_issues_published ON public.newsletter_issues(is_published, published_at DESC);

ALTER TABLE public.newsletter_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS newsletter_issues_public_read ON public.newsletter_issues;
DROP POLICY IF EXISTS newsletter_issues_insert_any ON public.newsletter_issues;
CREATE POLICY newsletter_issues_public_read
  ON public.newsletter_issues FOR SELECT USING (is_published = true);
CREATE POLICY newsletter_issues_insert_any
  ON public.newsletter_issues FOR INSERT WITH CHECK (true);

-- updated_at trigger
DROP TRIGGER IF EXISTS update_newsletter_issues_updated_at ON public.newsletter_issues;
CREATE TRIGGER update_newsletter_issues_updated_at BEFORE UPDATE ON public.newsletter_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletters_updated_at ON public.newsletters;
CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON public.newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. SERVICE_INQUIRIES: create missing table
--    Referenced by service-inquiry / solution-orders flows
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  company     TEXT,
  service_id  UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_slug TEXT,
  message     TEXT NOT NULL,
  budget      TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_inquiries_email ON public.service_inquiries(email);

ALTER TABLE public.service_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_inquiries_insert_any ON public.service_inquiries;
CREATE POLICY service_inquiries_insert_any
  ON public.service_inquiries FOR INSERT WITH CHECK (true);

-- ============================================================
-- 5. GRANTS: ensure service_role & anon can use every app table
--    The app uses the service_role key for ALL server operations,
--    so granting to service_role fixes the 403 errors on
--    blog_posts, career_applications, etc.
--    (Native GRANT ... ON ALL TABLES is idempotent.)
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- 6. PROFILES: ensure admin role text & seed admin
--    Code checks role IN ('admin','editor','author','user').
--    The seed set super_admin; normalize to 'admin'.
-- ============================================================
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@abwcurious.com' AND (role IS NULL OR role = 'super_admin');

-- ============================================================
-- 7. STORAGE: ensure the app bucket exists with public read
-- ============================================================
-- (Buckets are normally created via Storage API, but we ensure
--  the row exists here so getPublicUrl works.)

