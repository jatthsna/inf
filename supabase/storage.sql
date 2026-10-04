-- ==============================================================================
-- KAS INFORMATIKA - SUPABASE STORAGE CONFIGURATION
-- Buckets: payment-proofs, expense-proofs, avatars
-- ==============================================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('payment-proofs', 'payment-proofs', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('expense-proofs', 'expense-proofs', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for payment-proofs
-- Authenticated students can upload their own proofs
CREATE POLICY "Students can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
);

-- Users can read proofs they uploaded or admins can read all
CREATE POLICY "Users can read own proofs or admins read all"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
);

-- 3. Storage Policies for expense-proofs
CREATE POLICY "Admins can upload expense proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'expense-proofs'
);

CREATE POLICY "Public read for expense proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'expense-proofs'
);

-- 4. Storage Policies for avatars
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
