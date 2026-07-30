-- ============================================================
-- ABWcurious — Utility Functions & Blog Enhancements
-- Migration: 004_utility_functions.sql
-- ============================================================

-- Blog view count increment (called by /api/blogs/[id])
CREATE OR REPLACE FUNCTION public.increment_blog_views(blog_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.blogs
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = blog_id AND deleted_at IS NULL;
END;
$$;

-- Ensure blogs table has the required columns for the Blog CMS
DO $$
BEGIN
  -- Add thumbnail_url if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='thumbnail_url') THEN
    ALTER TABLE public.blogs ADD COLUMN thumbnail_url TEXT;
  END IF;
  -- Add status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='status') THEN
    ALTER TABLE public.blogs ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'private', 'archived'));
  END IF;
  -- Add reading_time if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='reading_time') THEN
    ALTER TABLE public.blogs ADD COLUMN reading_time INT DEFAULT 5;
  END IF;
  -- Add view_count if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='view_count') THEN
    ALTER TABLE public.blogs ADD COLUMN view_count INT DEFAULT 0;
  END IF;
  -- Add published_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='published_at') THEN
    ALTER TABLE public.blogs ADD COLUMN published_at TIMESTAMPTZ;
  END IF;
  -- Add author_id if missing (FK to profiles)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='author_id') THEN
    ALTER TABLE public.blogs ADD COLUMN author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for published blog queries
CREATE INDEX IF NOT EXISTS blogs_status_published_at_idx ON public.blogs(status, published_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_author_id_idx ON public.blogs(author_id);

-- Blog RLS: public can read published; owners can CRUD their own; admins can do everything
DROP POLICY IF EXISTS "blogs_read_published" ON public.blogs;
CREATE POLICY "blogs_read_published" ON public.blogs
  FOR SELECT USING (
    (status = 'published' AND deleted_at IS NULL)
    OR author_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "blogs_insert_authenticated" ON public.blogs;
CREATE POLICY "blogs_insert_authenticated" ON public.blogs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

DROP POLICY IF EXISTS "blogs_update_own" ON public.blogs;
CREATE POLICY "blogs_update_own" ON public.blogs
  FOR UPDATE USING (author_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "blogs_delete_admin" ON public.blogs;
CREATE POLICY "blogs_delete_admin" ON public.blogs
  FOR DELETE USING (public.is_admin());
