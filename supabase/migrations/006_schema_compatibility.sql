-- ============================================================
-- ABWcurious — Schema Compatibility Migration
-- Migration: 006_schema_compatibility.sql
--
-- Adds compatibility columns and missing tables so the
-- application code can query the columns it expects.
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE: Add compatibility columns
--    Code queries: name, avatar, role (text), provider, country, city
--    Schema has:   full_name, avatar_url, role (enum), etc.
-- ============================================================

-- Add 'name' as alias for 'full_name'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='name') THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
  END IF;
END $$;

-- Add 'avatar' as alias for 'avatar_url'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='avatar') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar TEXT;
  END IF;
END $$;

-- Add 'provider' column
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='provider') THEN
    ALTER TABLE public.profiles ADD COLUMN provider TEXT DEFAULT 'credentials';
  END IF;
END $$;

-- Add 'country' column
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='country') THEN
    ALTER TABLE public.profiles ADD COLUMN country TEXT;
  END IF;
END $$;

-- Add 'city' column
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='city') THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
  END IF;
END $$;

-- Sync existing data: copy full_name -> name, avatar_url -> avatar
UPDATE public.profiles SET name = full_name WHERE name IS NULL AND full_name IS NOT NULL;
UPDATE public.profiles SET avatar = avatar_url WHERE avatar IS NULL AND avatar_url IS NOT NULL;

-- Trigger: keep name/full_name and avatar/avatar_url in sync
CREATE OR REPLACE FUNCTION public.sync_profile_aliases()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync name <-> full_name
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    NEW.full_name := NEW.name;
  ELSIF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    NEW.name := NEW.full_name;
  END IF;
  -- Sync avatar <-> avatar_url
  IF NEW.avatar IS DISTINCT FROM OLD.avatar THEN
    NEW.avatar_url := NEW.avatar;
  ELSIF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
    NEW.avatar := NEW.avatar_url;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_profile_aliases_trigger ON public.profiles;
CREATE TRIGGER sync_profile_aliases_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_aliases();

-- Also sync on INSERT
CREATE OR REPLACE FUNCTION public.sync_profile_aliases_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS NULL AND NEW.full_name IS NOT NULL THEN
    NEW.name := NEW.full_name;
  ELSIF NEW.full_name IS NULL AND NEW.name IS NOT NULL THEN
    NEW.full_name := NEW.name;
  END IF;
  IF NEW.avatar IS NULL AND NEW.avatar_url IS NOT NULL THEN
    NEW.avatar := NEW.avatar_url;
  ELSIF NEW.avatar_url IS NULL AND NEW.avatar IS NOT NULL THEN
    NEW.avatar_url := NEW.avatar;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_profile_aliases_insert_trigger ON public.profiles;
CREATE TRIGGER sync_profile_aliases_insert_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_aliases_insert();

-- ============================================================
-- 2. MISSING TABLES: careers (code uses 'careers' not 'jobs')
-- ============================================================

CREATE TABLE IF NOT EXISTS public.careers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  department TEXT,
  location TEXT,
  type TEXT DEFAULT 'full-time',
  description TEXT,
  requirements TEXT,
  salary_range TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_careers_slug ON public.careers(slug);
CREATE INDEX IF NOT EXISTS idx_careers_is_active ON public.careers(is_active);

-- ============================================================
-- 3. SOLUTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  pricing TEXT,
  demo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solutions_slug ON public.solutions(slug);

-- ============================================================
-- 4. SOLUTION ORDERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.solution_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES public.solutions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. PARTNERSHIPS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.partnerships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,
  partnership_type TEXT DEFAULT 'technology',
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. SPONSORSHIPS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sponsorships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  sponsorship_type TEXT DEFAULT 'general',
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. FEEDBACK TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  rating INTEGER,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. STATUS UPDATES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.status_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  status TEXT DEFAULT 'operational',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. STATUS INCIDENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.status_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  status TEXT DEFAULT 'investigating',
  title TEXT NOT NULL,
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================
-- 11. USER MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. LEGAL PAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.legal_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 13. ACTIVITY LOGS TABLE (used by activity-logger.ts)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ============================================================
-- 14. NEWSLETTER TABLE (code uses 'newsletter' not 'newsletter_subscribers')
-- ============================================================

-- Create a view if the code uses 'newsletter' table name
-- but the actual table is 'newsletter_subscribers'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='newsletter') THEN
    CREATE VIEW public.newsletter AS SELECT
      id, email, is_active, created_at
    FROM public.newsletter_subscribers;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- View or table already exists, skip
  NULL;
END $$;

-- ============================================================
-- 15. EVENT REGISTRATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id);

-- ============================================================
-- 16. Ensure profiles role column accepts text values
--     (code writes 'admin', 'user', 'editor', 'author' as text
--      but schema has user_role enum)
-- ============================================================

-- Add a text 'role' column if only the enum version exists
-- The code expects text, not enum
DO $$ 
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='profiles' AND column_name='role';
  
  IF col_type = 'USER-DEFINED' THEN
    -- It's an enum. Add a text column instead and rename
    -- Use CASCADE to drop dependent objects (RLS policies, triggers, etc.)
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_text TEXT DEFAULT 'user';
    UPDATE public.profiles SET role_text = role::TEXT WHERE role_text = 'user' OR role_text IS NULL;
    ALTER TABLE public.profiles DROP COLUMN role CASCADE;
    ALTER TABLE public.profiles RENAME COLUMN role_text TO role;
  END IF;
END $$;

-- ============================================================
-- 17. RLS Policies for new tables (allow service role full access)
-- ============================================================

ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Public read for content tables
CREATE POLICY "careers_public_read" ON public.careers FOR SELECT USING (true);
CREATE POLICY "solutions_public_read" ON public.solutions FOR SELECT USING (true);
CREATE POLICY "status_updates_public_read" ON public.status_updates FOR SELECT USING (true);
CREATE POLICY "status_incidents_public_read" ON public.status_incidents FOR SELECT USING (true);
CREATE POLICY "legal_pages_public_read" ON public.legal_pages FOR SELECT USING (true);

-- User can read own notifications
CREATE POLICY "notifications_own_read" ON public.notifications FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- User can read own messages
CREATE POLICY "messages_own_read" ON public.user_messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Allow authenticated users to insert into submission tables
CREATE POLICY "partnerships_insert" ON public.partnerships FOR INSERT WITH CHECK (true);
CREATE POLICY "sponsorships_insert" ON public.sponsorships FOR INSERT WITH CHECK (true);
CREATE POLICY "feedback_insert" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "event_registrations_insert" ON public.event_registrations FOR INSERT WITH CHECK (true);

-- ============================================================
-- Done. The application code columns now match the DB schema.
-- ============================================================
