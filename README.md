# KAS INFORMATIKA

Sistem Manajemen Keuangan Kas Kelas & Program Studi Teknik Informatika (Full-Year Production Ready).

---

## 1. Arsitektur Aplikasi

KAS INFORMATIKA dibangun dengan arsitektur enterprise modern:
- **Frontend SPA**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend & Database**: PostgreSQL via Supabase dengan Row Level Security (RLS) dan Storage bucket terenkripsi.
- **Alur Pembayaran**:
  - **Online via Lynk.id**: Mahasiswa redirect ke URL Lynk.id (QRIS/E-Wallet), kembali ke aplikasi untuk upload bukti transfer, masuk antrean verifikasi admin/bendahara, dan status menjadi LUNAS setelah diverifikasi.
  - **Cash (Tunai)**: Bendahara mencatat pembayaran tunai langsung, sistem seketika memverifikasi LUNAS, mengupdate saldo, rekap bulanan, tunggakan, dan merekam audit log append-only.
- **Isolasi Tahun Akademik**: Data transaksi per tahun akademik diisolasi secara ketat sehingga pergantian tahun kepengurusan (misal 2026/2027 ke 2027/2028) tidak menghapus data historis masa lalu.

---

## 2. Struktur Database Relasional (PostgreSQL)

Tabel utama yang telah dirancang:
1. `academic_years`: Menampung tahun akademik, tanggal mulai/selesai, saldo awal, status aktif & arsip.
2. `classes`: Rombongan belajar/kelas mahasiswa (e.g. IF-2024-A, IF-2024-B).
3. `profiles`: Profil user dan otorisasi role (`admin`, `treasurer`, `student`).
4. `payment_links`: Konfigurasi payment links Lynk.id.
5. `bills`: Data master tagihan kas bulanan, iuran kegiatan, denda, dsb.
6. `bill_assignments`: Relasi pemberian tagihan ke semua mahasiswa, satu kelas, atau mahasiswa tertentu.
7. `payments`: Transaksi pembayaran cash & online dengan bukti, status (`pending`, `verified`, `rejected`), dan verifikator.
8. `expenses`: Pencatatan pengeluaran kas resmi berdasarkan kategori.
9. `income_transactions`: Pemasukan di luar tagihan (donasi alumni, sponsorship).
10. `audit_logs`: Log append-only permanen untuk kepatuhan & transparansi.
11. `notifications`: Notifikasi real-time tagihan dan verifikasi.
12. `app_settings`: Konfigurasi kontak, nominal default, dan identitas kelas.

---

## 3. Menjalankan Aplikasi Secara Lokal

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Langkah Instalasi
```bash
# 1. Install dependencies
npm install

# 2. Buat file .env (opsional jika menggunakan local persistent store)
cp .env.example .env

# 3. Jalankan development server
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

---

## 4. Konfigurasi Supabase (PostgreSQL & Storage)

Jika Anda ingin menghubungkan ke project cloud Supabase sendiri:

1. **Buat Project di [Supabase.com](https://supabase.com)**.
2. **Jalankan Schema SQL**:
   - Buka menu **SQL Editor** di Dashboard Supabase.
   - Buka file `/supabase/schema.sql` pada repository ini, salin seluruh isinya, lalu jalankan (**Run**).
   - Lanjutkan dengan menjalankan `/supabase/rls.sql` untuk mengaktifkan kebijakan Row Level Security.
   - Jalankan `/supabase/storage.sql` untuk membuat bucket `payment-proofs`, `expense-proofs`, dan `avatars`.
   - Jalankan `/supabase/seed.sql` untuk mengisi data awal 1 tahun akademik 2026/2027 dengan data simulasi.
3. **Konfigurasi Environment Variable**:
   Isi file `.env` atau buka menu **Sinkronisasi Cloud** pada navbar aplikasi:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
4. Klik tombol **Tes Koneksi** pada modal Cloud Sync di navbar.

---

## 5. Panduan Penggunaan Sistem

### A. Alur Pembayaran Online Lynk.id (Mahasiswa)
1. Mahasiswa login ke akun masing-masing.
2. Buka menu **Tagihan & Bayar**.
3. Klik tombol **BAYAR SEKARANG**.
4. Muncul modal konfirmasi rincian tagihan → Klik **Lanjutkan ke Lynk.id**.
5. Mahasiswa menyelesaikan pembayaran di Lynk.id (QRIS / E-Wallet).
6. Kembali ke website kas, klik **Saya Sudah Membayar**.
7. Unggah foto screenshot / file bukti bayar (JPG, PNG, WEBP, atau PDF maks 5MB).
8. Status berubah menjadi **MENUNGGU VERIFIKASI** (belum masuk saldo kas).
9. Bendahara / Admin membuka menu **Verifikasi Lynk.id**, memeriksa bukti, lalu mengklik **Verifikasi**.
10. Status seketika menjadi **LUNAS**, dana otomatis masuk ke saldo kas resmi, dan rekap mahasiswa diperbarui.

### B. Alur Pembayaran Tunai (Cash Langsung ke Bendahara)
1. Mahasiswa menyerahkan uang tunai kepada bendahara di kampus.
2. Bendahara membuka menu **Catat Pembayaran Cash**.
3. Pilih nama mahasiswa, tagihan, nominal yang diterima, tanggal, dan catatan penerima.
4. Klik **Konfirmasi Pembayaran Cash**.
5. Transaksi seketika berstatus **LUNAS (VERIFIED)** tanpa perlu unggah bukti.
6. Saldo kas bertambah, tunggakan berkurang, rekap bulanan & tahunan terupdate, serta tercatat di audit log.

### C. Pembuatan Tahun Akademik Baru
1. Buka menu **Tahun Akademik** di panel admin.
2. Klik **Buat Tahun Akademik Baru** (misal: 2027/2028).
3. Masukkan tanggal periode dan saldo awal (bisa dialihkan dari sisa kas tahun lalu).
4. Klik **Aktifkan Tahun Ini**.
5. Tahun lama (2026/2027) otomatis berstatus **Arsip**.
6. Histori data lama tetap dapat dibuka dan dicek kapan pun tanpa takut data hilang.

---

## 6. Audit Trail & Transparansi Publik

- Semua aksi finansial, perubahan saldo, pembuatan tagihan, penerimaan uang tunai, dan verifikasi mutasi dicatat secara permanen di menu **Audit Trail (Log)**.
- Mahasiswa dapat mengakses halaman **Transparansi Kas** untuk memantau pemasukan resmi, pengeluaran riil, dan saldo akhir secara akuntabel tanpa membuka privasi tagihan mahasiswa lain.
