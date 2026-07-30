-- Migration: Add tables for forms and case studies
-- Up

-- Case Studies
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  cover_image TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Research Inquiries
CREATE TABLE IF NOT EXISTS public.research_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sponsorship Requests
CREATE TABLE IF NOT EXISTS public.sponsorship_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  plan TEXT NOT NULL,
  sponsorship_type TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partnerships (reusing existing partners table or creating a new partnership_requests table)
CREATE TABLE IF NOT EXISTS public.partnership_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  partnership_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) policies

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for form submissions
CREATE POLICY "Allow public insert on research_inquiries" ON public.research_inquiries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert on sponsorship_requests" ON public.sponsorship_requests FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert on feedback" ON public.feedback FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert on partnership_requests" ON public.partnership_requests FOR INSERT TO public WITH CHECK (true);

-- Allow public read on published case studies
CREATE POLICY "Allow public read on published case studies" ON public.case_studies FOR SELECT TO public USING (is_published = true);

-- Note: The admin role/service_role bypasses RLS and can select/update/delete.
