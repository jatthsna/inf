-- ==============================================================================
-- KAS INFORMATIKA - CLOUD DATABASE FIX IZIN (RLS)
-- Jalankan ini di: https://supabase.com/dashboard/project/xolgtadrooyrbcgytneo/sql/new
-- ==============================================================================

-- 1. Buat tabel jika belum ada
CREATE TABLE IF NOT EXISTS app_cloud_store (
  id VARCHAR(50) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Aktifkan RLS dan berikan izin penuh untuk publik (anon & authenticated)
ALTER TABLE app_cloud_store ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to app_cloud_store" ON app_cloud_store;

CREATE POLICY "Public access to app_cloud_store" 
ON app_cloud_store 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Berikan hak akses tabel
GRANT ALL ON app_cloud_store TO anon, authenticated, service_role;

-- 4. Aktifkan Real-Time Sinkronisasi
ALTER PUBLICATION supabase_realtime ADD TABLE app_cloud_store;
