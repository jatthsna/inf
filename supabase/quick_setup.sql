-- ==============================================================================
-- KAS INFORMATIKA - CLOUD DATABASE QUICK SETUP
-- Jalankan script ini di: https://supabase.com/dashboard/project/xolgtadrooyrbcgytneo/sql/new
-- ==============================================================================

CREATE TABLE IF NOT EXISTS app_cloud_store (
  id VARCHAR(50) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Izinkan akses baca dan tulis dari aplikasi web
ALTER TABLE app_cloud_store DISABLE ROW LEVEL SECURITY;

-- Aktifkan Real-Time Sinkronisasi agar antar-perangkat langsung update otomatis
ALTER PUBLICATION supabase_realtime ADD TABLE app_cloud_store;
