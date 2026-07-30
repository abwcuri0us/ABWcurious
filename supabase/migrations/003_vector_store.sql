-- ============================================================
-- ABWcurious — Vector Store for RAG (Curious AI)
-- Migration: 003_vector_store.sql
-- Run this AFTER enabling the pgvector extension in Supabase
-- ============================================================

-- Enable pgvector (run once in Supabase SQL editor)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- Knowledge Base table for RAG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'general', -- 'services', 'products', 'company', 'faq', 'cybersecurity'
  source_url    TEXT,
  embedding     VECTOR(1024),                    -- Mistral embed model dimension
  metadata      JSONB DEFAULT '{}'::JSONB,
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast similarity search
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx
  ON public.knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS knowledge_base_category_idx ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS knowledge_base_active_idx ON public.knowledge_base(is_active);

-- updated_at trigger
CREATE TRIGGER knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS: Knowledge Base
-- ============================================================

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Anyone can read active entries (used during RAG search on server)
CREATE POLICY "knowledge_base_read" ON public.knowledge_base
  FOR SELECT USING (is_active = TRUE);

-- Only admins can write
CREATE POLICY "knowledge_base_admin_write" ON public.knowledge_base
  FOR ALL USING (public.is_admin());

-- ============================================================
-- Function: semantic_search
-- Used by /api/ai/chat to find relevant context
-- ============================================================

CREATE OR REPLACE FUNCTION public.semantic_search(
  query_embedding VECTOR(1024),
  match_count     INT DEFAULT 3,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id       UUID,
  title    TEXT,
  content  TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_base kb
  WHERE
    kb.is_active = TRUE
    AND (filter_category IS NULL OR kb.category = filter_category)
    AND kb.embedding IS NOT NULL
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- AI Conversations table (session-based chat memory)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    TEXT UNIQUE NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  messages      JSONB DEFAULT '[]'::JSONB,
  total_tokens  INT DEFAULT 0,
  metadata      JSONB DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_conversations_session_idx ON public.ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS ai_conversations_user_idx ON public.ai_conversations(user_id);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_conversations_own" ON public.ai_conversations
  FOR ALL USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "ai_conversations_anon_insert" ON public.ai_conversations
  FOR INSERT WITH CHECK (user_id IS NULL);

CREATE TRIGGER ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
