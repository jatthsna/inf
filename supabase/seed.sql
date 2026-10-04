-- ==============================================================================
-- KAS INFORMATIKA - COMPREHENSIVE SEED DATA
-- Pre-populates 2026/2027 academic year, classes, students, bills,
-- payments (cash & online), expenses, other income, and audit logs.
-- ==============================================================================

-- 1. Insert Academic Years
INSERT INTO academic_years (id, name, start_date, end_date, initial_balance, is_active, is_archived, notes)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '2026/2027', '2026-09-01', '2027-08-31', 500000.00, true, false, 'Tahun akademik berjalan untuk kepengurusan Himpunan/Kelas Informatika 2026/2027'),
  ('a0000000-0000-0000-0000-000000000002', '2025/2026', '2025-09-01', '2026-08-31', 250000.00, false, true, 'Arsip tahun akademik sebelumnya')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Classes
INSERT INTO classes (id, name, batch, major, is_active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'IF-2024-A', '2024', 'Teknik Informatika', true),
  ('c0000000-0000-0000-0000-000000000002', 'IF-2024-B', '2024', 'Teknik Informatika', true),
  ('c0000000-0000-0000-0000-000000000003', 'IF-2023-A', '2023', 'Teknik Informatika', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Profiles (Admin, Treasurer, & 10+ Students)
INSERT INTO profiles (id, full_name, nim, email, phone, class_id, role, status)
VALUES
  ('p0000000-0000-0000-0000-000000000001', 'Arya Pratama, S.Kom', '20240001', 'admin@informatika.ac.id', '081234567890', 'c0000000-0000-0000-0000-000000000001', 'admin', 'active'),
  ('p0000000-0000-0000-0000-000000000002', 'Nadhira Putri', '20240002', 'bendahara@informatika.ac.id', '081298765432', 'c0000000-0000-0000-0000-000000000001', 'treasurer', 'active'),
  ('p0000000-0000-0000-0000-000000000003', 'Bima Sakti', '20241001', 'bima.sakti@student.id', '082100000001', 'c0000000-0000-0000-0000-000000000001', 'student', 'active'),
  ('p0000000-0000-0000-0000-000000000004', 'Clarissa Devina', '20241002', 'clarissa@student.id', '082100000002', 'c0000000-0000-0000-0000-000000000001', 'student', 'active'),
  ('p0000000-0000-0000-0000-000000000005', 'Daffa Al-Farizi', '20241003', 'daffa@student.id', '082100000003', 'c0000000-0000-0000-0000-000000000001', 'student', 'active'),
  ('p0000000-0000-0000-0000-000000000006', 'Elisa Rahmawati', '20241004', 'elisa@student.id', '082100000004', 'c0000000-0000-0000-0000-000000000001', 'student', 'active'),
  ('p0000000-0000-0000-0000-000000000007', 'Fajar Nugroho', '20241005', 'fajar@student.id', '082100000005', 'c0000000-0000-0000-0000-000000000001', 'student', 'active'),
  ('p0000000-0000-0000-0000-000000000008', 'Gita Permata', '20241006', 'gita@student.id', '082100000006', 'c0000000-0000-0000-0000-000000000002', 'student', 'active'),
  ('p0000000-0000-0000-0000-000000000009', 'Haikal Hakim', '20241007', 'haikal@student.id', '082100000007', 'c0000000-0000-0000-0000-000000000002', 'student', 'active'),
  ('p0000000-0000-0000-0000-000000000010', 'Indah Kusuma', '20241008', 'indah@student.id', '082100000008', 'c0000000-0000-0000-0000-000000000002', 'student', 'active'),
  ('p0000000-0000-0000-0000-000000000011', 'Joko Triadi', '20241009', 'joko@student.id', '082100000009', 'c0000000-0000-0000-0000-000000000002', 'student', 'active'),
  ('p0000000-0000-0000-0000-000000000012', 'Kezia Angeline', '20241010', 'kezia@student.id', '082100000010', 'c0000000-0000-0000-0000-000000000002', 'student', 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Payment Links (Lynk.id)
INSERT INTO payment_links (id, name, description, url, is_active, created_by)
VALUES
  ('l0000000-0000-0000-0000-000000000001', 'Kas Bulanan Informatika', 'Link pembayaran kas rutin bulanan mahasiswa Informatika via QRIS/e-wallet', 'https://lynk.id/kas-informatika', true, 'p0000000-0000-0000-0000-000000000002'),
  ('l0000000-0000-0000-0000-000000000002', 'Iuran Makrab Informatika 2026', 'Link pembayaran khusus malam keakraban & outdoor gathering', 'https://lynk.id/makrab-if-2026', true, 'p0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Bills
INSERT INTO bills (id, academic_year_id, name, description, bill_type, amount, period_month, period_year, due_date, payment_link_id, target_type, is_active, created_by)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Kas September 2026', 'Kas bulanan wajib periode September 2026', 'monthly', 10000.00, 9, 2026, '2026-09-30', 'l0000000-0000-0000-0000-000000000001', 'all', true, 'p0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Kas Oktober 2026', 'Kas bulanan wajib periode Oktober 2026', 'monthly', 10000.00, 10, 2026, '2026-10-31', 'l0000000-0000-0000-0000-000000000001', 'all', true, 'p0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Kas November 2026', 'Kas bulanan wajib periode November 2026', 'monthly', 10000.00, 11, 2026, '2026-11-30', 'l0000000-0000-0000-0000-000000000001', 'all', true, 'p0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Iuran Makrab Informatika', 'Iuran malam keakraban angkatan 2024', 'event', 50000.00, NULL, NULL, '2026-10-15', 'l0000000-0000-0000-0000-000000000002', 'all', true, 'p0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Bill Assignments (Assign bills to students p3 to p12)
INSERT INTO bill_assignments (bill_id, student_id)
SELECT b.id, p.id
FROM bills b
CROSS JOIN profiles p
WHERE p.role = 'student'
ON CONFLICT DO NOTHING;

-- 7. Insert Payments (Mix of Cash Verified, Online Verified, Online Pending, and Rejected)
INSERT INTO payments (id, bill_id, student_id, amount, payment_method, payment_date, proof_url, status, student_note, admin_note, received_by, verified_by, verified_at)
VALUES
  -- Student Bima (p3): September paid cash verified, October paid online verified
  ('m0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 10000.00, 'cash', '2026-09-10', NULL, 'verified', 'Bayar tunai di kampus', 'Diterima tunai oleh bendahara', 'p0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', '2026-09-10 14:00:00+07'),
  ('m0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000003', 10000.00, 'online', '2026-10-02', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'verified', 'Transfer via Lynk.id QRIS BCA', 'Bukti valid sesuai mutasi QRIS', NULL, 'p0000000-0000-0000-0000-000000000002', '2026-10-02 16:30:00+07'),
  
  -- Student Clarissa (p4): September cash verified, Makrab online verified
  ('m0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000004', 10000.00, 'cash', '2026-09-12', NULL, 'verified', 'Cash saat matkul Alpro', 'Uang pas diterima bendahara', 'p0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', '2026-09-12 11:15:00+07'),
  ('m0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000004', 50000.00, 'online', '2026-09-25', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'verified', 'Pembayaran Lynk.id Makrab', 'Sudah dicek di rekening panitia', NULL, 'p0000000-0000-0000-0000-000000000002', '2026-09-25 19:00:00+07'),
  
  -- Student Daffa (p5): September online pending (waiting admin verification)
  ('m0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000005', 10000.00, 'online', '2026-09-28', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'pending', 'Sudah transfer lewat Lynk.id barusan', NULL, NULL, NULL, NULL),
  
  -- Student Elisa (p6): September online rejected (burry proof or wrong amount)
  ('m0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000006', 10000.00, 'online', '2026-09-15', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'rejected', 'Bukti Lynk.id', 'Nominal tertera di bukti tidak sesuai tagihan (Rp5.000). Silakan unggah bukti yang benar.', NULL, 'p0000000-0000-0000-0000-000000000002', '2026-09-16 10:00:00+07'),
  
  -- Student Fajar (p7): September cash verified
  ('m0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000007', 10000.00, 'cash', '2026-09-14', NULL, 'verified', 'Cash', 'Lunas tunai', 'p0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', '2026-09-14 13:00:00+07'),

  -- Student Gita (p8): September online verified
  ('m0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'p0000000-0000-0000-0000-000000000008', 10000.00, 'online', '2026-09-20', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'verified', 'Lynk.id QRIS', 'Verified oleh bendahara', NULL, 'p0000000-0000-0000-0000-000000000002', '2026-09-20 18:00:00+07')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Expenses
INSERT INTO expenses (id, academic_year_id, description, category, amount, expense_date, notes, created_by)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Pembelian Buku Kas & Spidol Board', 'Administrasi', 35000.00, '2026-09-05', 'Keperluan pencatatan kas offline kelas', 'p0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Snack Rapat Koordinasi Panitia Makrab', 'Konsumsi', 65000.00, '2026-09-18', 'Konsumsi 8 orang panitia inti', 'p0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Cetak Banner Selamat Datang Mahasiswa Baru', 'Dokumentasi', 50000.00, '2026-09-22', 'Ukuran 3x1 meter outdoor', 'p0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 9. Insert Other Income
INSERT INTO income_transactions (id, academic_year_id, source_name, category, amount, received_date, notes, received_by)
VALUES
  ('i0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Donasi Alumni Angkatan 2020', 'Donasi', 200000.00, '2026-09-15', 'Bantuan pengembangan kegiatan mahasiswa', 'p0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Audit Logs
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, description, created_at)
VALUES
  ('u0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'CREATE_ACADEMIC_YEAR', 'academic_years', 'a0000000-0000-0000-0000-000000000001', 'Membuat tahun akademik 2026/2027 dengan saldo awal Rp500.000', '2026-09-01 08:00:00+07'),
  ('u0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', 'CREATE_BILL', 'bills', 'b0000000-0000-0000-0000-000000000001', 'Membuat tagihan Kas September 2026 sebesar Rp10.000', '2026-09-01 09:00:00+07'),
  ('u0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000002', 'RECEIVE_CASH', 'payments', 'm0000000-0000-0000-0000-000000000001', 'Menerima pembayaran cash Kas September Rp10.000 dari Bima Sakti (NIM 20241001)', '2026-09-10 14:00:00+07'),
  ('u0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000002', 'VERIFY_PAYMENT', 'payments', 'm0000000-0000-0000-0000-000000000002', 'Memverifikasi pembayaran online Lynk.id Kas Oktober Rp10.000 dari Bima Sakti', '2026-10-02 16:30:00+07'),
  ('u0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000002', 'RECORD_EXPENSE', 'expenses', 'e0000000-0000-0000-0000-000000000001', 'Mencatat pengeluaran administrasi Rp35.000 untuk buku kas', '2026-09-05 15:30:00+07')
ON CONFLICT (id) DO NOTHING;

-- 11. Insert Default App Settings
INSERT INTO app_settings (id, department_name, class_name, academic_year_id, default_monthly_amount, contact_person_name, contact_person_phone, lynk_default_url)
VALUES
  ('s0000000-0000-0000-0000-000000000001', 'Program Studi Teknik Informatika', 'Teknik Informatika 2024', 'a0000000-0000-0000-0000-000000000001', 10000.00, 'Nadhira Putri (Bendahara)', '081298765432', 'https://lynk.id/kas-informatika')
ON CONFLICT (id) DO NOTHING;
