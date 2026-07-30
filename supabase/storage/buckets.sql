-- ============================================================
-- ABWcurious Pvt. Ltd. — Supabase Storage Bucket Setup
-- ============================================================

-- Create storage buckets for all asset types
-- Run via Supabase Dashboard > Storage or via service role client

-- Note: Supabase storage buckets are created via the Management API
-- or Dashboard. This file documents the required configuration.

-- Equivalent JavaScript (to run server-side with service role key):
/*
const buckets = [
  { name: 'avatars', public: true, fileSizeLimit: 5242880 },          // 5MB
  { name: 'products', public: true, fileSizeLimit: 52428800 },         // 50MB
  { name: 'research', public: true, fileSizeLimit: 104857600 },        // 100MB
  { name: 'blogs', public: true, fileSizeLimit: 52428800 },            // 50MB
  { name: 'documents', public: false, fileSizeLimit: 104857600 },      // 100MB
  { name: 'careers', public: false, fileSizeLimit: 10485760 },         // 10MB
  { name: 'events', public: true, fileSizeLimit: 52428800 },           // 50MB
  { name: 'gallery', public: true, fileSizeLimit: 52428800 },          // 50MB
  { name: 'media', public: true, fileSizeLimit: 104857600 },           // 100MB
];
*/

-- Storage RLS Policies (run in SQL editor):
-- Note: Storage policies use CREATE POLICY on the storage.objects table,
-- NOT INSERT INTO storage.policies (which is a system table).

-- avatars bucket: users can upload their own avatar
CREATE POLICY "Avatar upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Avatar update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Avatar delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Avatars public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- careers bucket: only admins/HR can manage; anyone can upload resumes
CREATE POLICY "Resume upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'careers' AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

CREATE POLICY "Careers admin read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'careers' AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr'))
    )
  );