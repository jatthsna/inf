import {
  UserProfile,
  UserRole,
  UserStatus,
  AcademicYear,
  ClassItem,
  Bill,
  BillAssignment,
  Payment,
  PaymentStatus,
  PaymentLink,
  Expense,
  IncomeTransaction,
  AuditLog,
  AppNotification,
  AppSettings,
  FinancialSummary,
  BillAssignmentStatus
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Local storage persistent fallback key
const DB_STORAGE_KEY = 'kas_informatika_prod_v2';

interface AppDatabaseState {
  academic_years: AcademicYear[];
  classes: ClassItem[];
  profiles: UserProfile[];
  payment_links: PaymentLink[];
  bills: Bill[];
  bill_assignments: BillAssignment[];
  payments: Payment[];
  expenses: Expense[];
  income_transactions: IncomeTransaction[];
  audit_logs: AuditLog[];
  notifications: AppNotification[];
  app_settings: AppSettings;
}

// Clean production initial state with comprehensive student & academic data
function getInitialSeedData(): AppDatabaseState {
  const academicYears: AcademicYear[] = [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: '2026/2027',
      start_date: '2026-09-01',
      end_date: '2027-08-31',
      initial_balance: 500000,
      is_active: true,
      is_archived: false,
      notes: 'Tahun akademik berjalan untuk kepengurusan Informatika 2026/2027',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      name: '2025/2026',
      start_date: '2025-09-01',
      end_date: '2026-08-31',
      initial_balance: 250000,
      is_active: false,
      is_archived: true,
      notes: 'Arsip tahun akademik sebelumnya',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const classes: ClassItem[] = [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'IF-2024-A',
      batch: '2024',
      major: 'Teknik Informatika',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      name: 'IF-2024-B',
      batch: '2024',
      major: 'Teknik Informatika',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      name: 'IF-2023-A',
      batch: '2023',
      major: 'Teknik Informatika',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const profiles: UserProfile[] = [
    {
      id: 'p0000000-0000-0000-0000-000000000001',
      full_name: 'Arya Pratama, S.Kom',
      nim: '20240001',
      email: 'admin@informatika.ac.id',
      phone: '081234567890',
      password: 'admin123',
      class_id: 'c0000000-0000-0000-0000-000000000001',
      class_name: 'IF-2024-A',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000002',
      full_name: 'Nadhira Putri',
      nim: '20240002',
      email: 'bendahara@informatika.ac.id',
      phone: '081298765432',
      password: 'bendahara123',
      class_id: 'c0000000-0000-0000-0000-000000000001',
      class_name: 'IF-2024-A',
      role: 'treasurer',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000003',
      full_name: 'Bima Sakti',
      nim: '20241001',
      email: 'bima.sakti@student.id',
      phone: '082100000001',
      password: '20241001',
      class_id: 'c0000000-0000-0000-0000-000000000001',
      class_name: 'IF-2024-A',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000004',
      full_name: 'Clarissa Devina',
      nim: '20241002',
      email: 'clarissa@student.id',
      phone: '082100000002',
      password: '20241002',
      class_id: 'c0000000-0000-0000-0000-000000000001',
      class_name: 'IF-2024-A',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000005',
      full_name: 'Daffa Al-Farizi',
      nim: '20241003',
      email: 'daffa@student.id',
      phone: '082100000003',
      password: '20241003',
      class_id: 'c0000000-0000-0000-0000-000000000001',
      class_name: 'IF-2024-A',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000006',
      full_name: 'Elisa Rahmawati',
      nim: '20241004',
      email: 'elisa@student.id',
      phone: '082100000004',
      password: '20241004',
      class_id: 'c0000000-0000-0000-0000-000000000001',
      class_name: 'IF-2024-A',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000007',
      full_name: 'Fajar Nugroho',
      nim: '20241005',
      email: 'fajar@student.id',
      phone: '082100000005',
      password: '20241005',
      class_id: 'c0000000-0000-0000-0000-000000000001',
      class_name: 'IF-2024-A',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000008',
      full_name: 'Gita Permata',
      nim: '20241006',
      email: 'gita@student.id',
      phone: '082100000006',
      password: '20241006',
      class_id: 'c0000000-0000-0000-0000-000000000002',
      class_name: 'IF-2024-B',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000009',
      full_name: 'Haikal Hakim',
      nim: '20241007',
      email: 'haikal@student.id',
      phone: '082100000007',
      password: '20241007',
      class_id: 'c0000000-0000-0000-0000-000000000002',
      class_name: 'IF-2024-B',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000010',
      full_name: 'Indah Kusuma',
      nim: '20241008',
      email: 'indah@student.id',
      phone: '082100000008',
      password: '20241008',
      class_id: 'c0000000-0000-0000-0000-000000000002',
      class_name: 'IF-2024-B',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000011',
      full_name: 'Joko Triadi',
      nim: '20241009',
      email: 'joko@student.id',
      phone: '082100000009',
      password: '20241009',
      class_id: 'c0000000-0000-0000-0000-000000000002',
      class_name: 'IF-2024-B',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p0000000-0000-0000-0000-000000000012',
      full_name: 'Kezia Angeline',
      nim: '20241010',
      email: 'kezia@student.id',
      phone: '082100000010',
      password: '20241010',
      class_id: 'c0000000-0000-0000-0000-000000000002',
      class_name: 'IF-2024-B',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const paymentLinks: PaymentLink[] = [
    {
      id: 'l0000000-0000-0000-0000-000000000001',
      name: 'Kas Bulanan Informatika',
      description: 'Link pembayaran kas rutin bulanan mahasiswa Informatika via QRIS/e-wallet',
      url: 'https://lynk.id/kas-informatika',
      is_active: true,
      created_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'l0000000-0000-0000-0000-000000000002',
      name: 'Iuran Makrab Informatika 2026',
      description: 'Link pembayaran khusus malam keakraban & outdoor gathering',
      url: 'https://lynk.id/makrab-if-2026',
      is_active: true,
      created_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const bills: Bill[] = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Kas September 2026',
      description: 'Kas bulanan wajib periode September 2026',
      bill_type: 'monthly',
      amount: 10000,
      period_month: 9,
      period_year: 2026,
      due_date: '2026-09-30',
      payment_link_id: 'l0000000-0000-0000-0000-000000000001',
      target_type: 'all',
      is_active: true,
      created_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Kas Oktober 2026',
      description: 'Kas bulanan wajib periode Oktober 2026',
      bill_type: 'monthly',
      amount: 10000,
      period_month: 10,
      period_year: 2026,
      due_date: '2026-10-31',
      payment_link_id: 'l0000000-0000-0000-0000-000000000001',
      target_type: 'all',
      is_active: true,
      created_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Kas November 2026',
      description: 'Kas bulanan wajib periode November 2026',
      bill_type: 'monthly',
      amount: 10000,
      period_month: 11,
      period_year: 2026,
      due_date: '2026-11-30',
      payment_link_id: 'l0000000-0000-0000-0000-000000000001',
      target_type: 'all',
      is_active: true,
      created_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'b0000000-0000-0000-0000-000000000004',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Iuran Makrab Informatika',
      description: 'Iuran malam keakraban angkatan 2024',
      bill_type: 'event',
      amount: 50000,
      due_date: '2026-10-15',
      payment_link_id: 'l0000000-0000-0000-0000-000000000002',
      target_type: 'all',
      is_active: true,
      created_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Assign all bills to all 10 students
  const studentProfiles = profiles.filter(p => p.role === 'student');
  const billAssignments: BillAssignment[] = [];
  bills.forEach(bill => {
    studentProfiles.forEach(st => {
      billAssignments.push({
        id: `asg_${bill.id.slice(-4)}_${st.id.slice(-4)}`,
        bill_id: bill.id,
        student_id: st.id,
        created_at: new Date().toISOString()
      });
    });
  });

  const payments: Payment[] = [
    {
      id: 'm0000000-0000-0000-0000-000000000001',
      bill_id: 'b0000000-0000-0000-0000-000000000001',
      student_id: 'p0000000-0000-0000-0000-000000000003',
      amount: 10000,
      payment_method: 'cash',
      payment_date: '2026-09-10',
      status: 'verified',
      student_note: 'Bayar tunai di kampus',
      admin_note: 'Diterima tunai oleh bendahara',
      received_by: 'p0000000-0000-0000-0000-000000000002',
      verified_by: 'p0000000-0000-0000-0000-000000000002',
      verified_at: '2026-09-10T14:00:00Z',
      created_at: '2026-09-10T14:00:00Z',
      updated_at: '2026-09-10T14:00:00Z'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000002',
      bill_id: 'b0000000-0000-0000-0000-000000000002',
      student_id: 'p0000000-0000-0000-0000-000000000003',
      amount: 10000,
      payment_method: 'online',
      payment_date: '2026-10-02',
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      status: 'verified',
      student_note: 'Transfer via Lynk.id QRIS BCA',
      admin_note: 'Bukti valid sesuai mutasi QRIS',
      verified_by: 'p0000000-0000-0000-0000-000000000002',
      verified_at: '2026-10-02T16:30:00Z',
      created_at: '2026-10-02T16:30:00Z',
      updated_at: '2026-10-02T16:30:00Z'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000003',
      bill_id: 'b0000000-0000-0000-0000-000000000001',
      student_id: 'p0000000-0000-0000-0000-000000000004',
      amount: 10000,
      payment_method: 'cash',
      payment_date: '2026-09-12',
      status: 'verified',
      student_note: 'Cash saat matkul Alpro',
      admin_note: 'Uang pas diterima bendahara',
      received_by: 'p0000000-0000-0000-0000-000000000002',
      verified_by: 'p0000000-0000-0000-0000-000000000002',
      verified_at: '2026-09-12T11:15:00Z',
      created_at: '2026-09-12T11:15:00Z',
      updated_at: '2026-09-12T11:15:00Z'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000004',
      bill_id: 'b0000000-0000-0000-0000-000000000004',
      student_id: 'p0000000-0000-0000-0000-000000000004',
      amount: 50000,
      payment_method: 'online',
      payment_date: '2026-09-25',
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      status: 'verified',
      student_note: 'Pembayaran Lynk.id Makrab',
      admin_note: 'Sudah dicek di rekening panitia',
      verified_by: 'p0000000-0000-0000-0000-000000000002',
      verified_at: '2026-09-25T19:00:00Z',
      created_at: '2026-09-25T19:00:00Z',
      updated_at: '2026-09-25T19:00:00Z'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000005',
      bill_id: 'b0000000-0000-0000-0000-000000000001',
      student_id: 'p0000000-0000-0000-0000-000000000005',
      amount: 10000,
      payment_method: 'online',
      payment_date: '2026-09-28',
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      status: 'pending',
      student_note: 'Sudah transfer lewat Lynk.id barusan',
      created_at: '2026-09-28T10:00:00Z',
      updated_at: '2026-09-28T10:00:00Z'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000006',
      bill_id: 'b0000000-0000-0000-0000-000000000001',
      student_id: 'p0000000-0000-0000-0000-000000000006',
      amount: 10000,
      payment_method: 'online',
      payment_date: '2026-09-15',
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      status: 'rejected',
      student_note: 'Bukti Lynk.id',
      admin_note: 'Nominal tertera di bukti tidak sesuai tagihan (Rp5.000). Silakan unggah bukti yang benar.',
      verified_by: 'p0000000-0000-0000-0000-000000000002',
      verified_at: '2026-09-16T10:00:00Z',
      created_at: '2026-09-15T10:00:00Z',
      updated_at: '2026-09-16T10:00:00Z'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000007',
      bill_id: 'b0000000-0000-0000-0000-000000000001',
      student_id: 'p0000000-0000-0000-0000-000000000007',
      amount: 10000,
      payment_method: 'cash',
      payment_date: '2026-09-14',
      status: 'verified',
      student_note: 'Cash',
      admin_note: 'Lunas tunai',
      received_by: 'p0000000-0000-0000-0000-000000000002',
      verified_by: 'p0000000-0000-0000-0000-000000000002',
      verified_at: '2026-09-14T13:00:00Z',
      created_at: '2026-09-14T13:00:00Z',
      updated_at: '2026-09-14T13:00:00Z'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000008',
      bill_id: 'b0000000-0000-0000-0000-000000000001',
      student_id: 'p0000000-0000-0000-0000-000000000008',
      amount: 10000,
      payment_method: 'online',
      payment_date: '2026-09-20',
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      status: 'verified',
      student_note: 'Lynk.id QRIS',
      admin_note: 'Verified oleh bendahara',
      verified_by: 'p0000000-0000-0000-0000-000000000002',
      verified_at: '2026-09-20T18:00:00Z',
      created_at: '2026-09-20T18:00:00Z',
      updated_at: '2026-09-20T18:00:00Z'
    }
  ];

  const expenses: Expense[] = [
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      description: 'Pembelian Buku Kas & Spidol Board',
      category: 'Administrasi',
      amount: 35000,
      expense_date: '2026-09-05',
      notes: 'Keperluan pencatatan kas offline kelas',
      created_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: '2026-09-05T15:30:00Z',
      updated_at: '2026-09-05T15:30:00Z'
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      description: 'Snack Rapat Koordinasi Panitia Makrab',
      category: 'Konsumsi',
      amount: 65000,
      expense_date: '2026-09-18',
      notes: 'Konsumsi 8 orang panitia inti',
      created_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: '2026-09-18T16:00:00Z',
      updated_at: '2026-09-18T16:00:00Z'
    },
    {
      id: 'e0000000-0000-0000-0000-000000000003',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      description: 'Cetak Banner Selamat Datang Mahasiswa Baru',
      category: 'Dokumentasi',
      amount: 50000,
      expense_date: '2026-09-22',
      notes: 'Ukuran 3x1 meter outdoor',
      created_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: '2026-09-22T10:00:00Z',
      updated_at: '2026-09-22T10:00:00Z'
    }
  ];

  const incomeTransactions: IncomeTransaction[] = [
    {
      id: 'i0000000-0000-0000-0000-000000000001',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      source_name: 'Donasi Alumni Angkatan 2020',
      category: 'Donasi',
      amount: 200000,
      received_date: '2026-09-15',
      notes: 'Bantuan pengembangan kegiatan mahasiswa',
      received_by: 'p0000000-0000-0000-0000-000000000002',
      created_at: '2026-09-15T09:00:00Z'
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'u0000000-0000-0000-0000-000000000001',
      user_id: 'p0000000-0000-0000-0000-000000000001',
      user_name: 'Administrator',
      user_role: 'admin',
      action: 'SYSTEM_INIT',
      entity_type: 'system',
      entity_id: 's0000000-0000-0000-0000-000000000001',
      description: 'Sistem Kas Informatika UNUGHA Cilacap berhasil diinisialisasi',
      created_at: '2026-09-01T08:00:00Z'
    }
  ];

  const notifications: AppNotification[] = [
    {
      id: 'n0000000-0000-0000-0000-000000000001',
      title: 'Selamat Datang di Kas Informatika',
      message: 'Sistem Kas UNUGHA Cilacap aktif. Data mahasiswa dan tagihan siap dikelola.',
      type: 'info',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ];

  const appSettings: AppSettings = {
    id: 's0000000-0000-0000-0000-000000000001',
    department_name: 'Program Studi Informatika',
    faculty_name: 'FMIKOM (Fakultas Matematika dan Ilmu Komputer)',
    university_name: 'Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap',
    class_name: 'Informatika 2024',
    korlas_name: 'Adam Satrol',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    default_monthly_amount: 10000,
    contact_person_name: 'Nadhira Putri (Bendahara)',
    contact_person_phone: '081298765432',
    lynk_default_url: 'https://lynk.id/kas-informatika',
    app_logo_url: 'logo.png',
    enable_email_notifications: true,
    updated_at: new Date().toISOString()
  };

  return {
    academic_years: academicYears,
    classes,
    profiles,
    payment_links: paymentLinks,
    bills,
    bill_assignments: billAssignments,
    payments,
    expenses,
    income_transactions: incomeTransactions,
    audit_logs: auditLogs,
    notifications,
    app_settings: appSettings
  };
}

class DatabaseManager {
  private state: AppDatabaseState;
  private listeners: Set<() => void> = new Set();
  private isSyncingFromCloud = false;
  private syncTimeout: any = null;

  constructor() {
    this.state = this.loadFromStorage();
    this.initCloudSync();
  }

  private async initCloudSync() {
    if (typeof window === 'undefined') return;
    const client = supabase;
    if (!client) return;

    try {
      // 1. Fetch latest state from cloud store
      const { data, error } = await client
        .from('app_cloud_store')
        .select('data, updated_at')
        .eq('id', 'kas_info_prod_v2')
        .maybeSingle();

      if (!error && data && data.data) {
        const cloudState = data.data as AppDatabaseState;
        if (Array.isArray(cloudState.bills) && cloudState.app_settings) {
          this.isSyncingFromCloud = true;
          this.state = {
            ...getInitialSeedData(),
            ...cloudState
          };
          this.saveToStorage(this.state);
          this.isSyncingFromCloud = false;
          this.listeners.forEach(fn => fn());
        } else {
          this.pushStateToCloud();
        }
      } else if (!data) {
        // First-time sync push
        this.pushStateToCloud();
      }

      // 2. Realtime subscription: any device update automatically syncs to all other devices!
      client
        .channel('realtime:app_cloud_store')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'app_cloud_store' },
          (payload: any) => {
            if (payload?.new && payload.new.data && !this.isSyncingFromCloud) {
              const incoming = payload.new.data as AppDatabaseState;
              if (Array.isArray(incoming.bills)) {
                this.isSyncingFromCloud = true;
                this.state = incoming;
                this.saveToStorage(incoming);
                this.isSyncingFromCloud = false;
                this.listeners.forEach(fn => fn());
              }
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase cloud sync info:', err);
    }
  }

  // Push current state to Supabase cloud (debounced 400ms)
  private pushStateToCloud() {
    if (this.isSyncingFromCloud) return;
    if (this.syncTimeout) clearTimeout(this.syncTimeout);

    this.syncTimeout = setTimeout(async () => {
      const client = supabase;
      if (!client) return;
      try {
        await client.from('app_cloud_store').upsert({
          id: 'kas_info_prod_v2',
          data: this.state,
          updated_at: new Date().toISOString()
        });
      } catch {
        // Silently fallback if table not yet created
      }
    }, 400);
  }

  public async syncUpToCloud(): Promise<{ success: boolean; message: string }> {
    const client = supabase;
    if (!client) {
      return { success: false, message: 'Koneksi Supabase belum aktif.' };
    }
    try {
      const { error } = await client.from('app_cloud_store').upsert({
        id: 'kas_info_prod_v2',
        data: this.state,
        updated_at: new Date().toISOString()
      });
      if (error) {
        return { success: false, message: `Gagal upload ke cloud: ${error.message}` };
      }
      return { success: true, message: 'Semua data dari perangkat ini berhasil diunggah ke Cloud Supabase!' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Gagal sinkron ke cloud.' };
    }
  }

  public async syncDownFromCloud(): Promise<{ success: boolean; message: string }> {
    const client = supabase;
    if (!client) {
      return { success: false, message: 'Koneksi Supabase belum aktif.' };
    }
    try {
      const { data, error } = await client
        .from('app_cloud_store')
        .select('data, updated_at')
        .eq('id', 'kas_info_prod_v2')
        .maybeSingle();

      if (error) {
        return { success: false, message: `Gagal mengambil data dari cloud: ${error.message}` };
      }
      if (!data || !data.data) {
        return { success: false, message: 'Belum ada data tersimpan di Cloud Supabase.' };
      }
      const cloudState = data.data as AppDatabaseState;
      this.isSyncingFromCloud = true;
      this.state = {
        ...getInitialSeedData(),
        ...cloudState
      };
      this.saveToStorage(this.state);
      this.isSyncingFromCloud = false;
      this.listeners.forEach(fn => fn());
      return { success: true, message: 'Berhasil menyinkronkan data terbaru dari Cloud Supabase!' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Gagal sinkron dari cloud.' };
    }
  }

  private loadFromStorage(): AppDatabaseState {
    if (typeof window === 'undefined') {
      return getInitialSeedData();
    }
    try {
      const candidateKeys = [
        DB_STORAGE_KEY,
        'kas_informatika_prod_v1',
        'kas_informatika_v2',
        'kas_informatika_v1',
        'kas_informatika_state'
      ];
      let stored: string | null = null;
      for (const k of candidateKeys) {
        const val = localStorage.getItem(k);
        if (val) {
          stored = val;
          break;
        }
      }

      if (stored) {
        const parsed: AppDatabaseState = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.profiles)) {
          const studentCount = parsed.profiles.filter(p => p.role === 'student').length;
          // If stored state had NO students, automatically restore the full sample student list and bills
          if (studentCount === 0) {
            const seed = getInitialSeedData();
            parsed.profiles = [
              ...parsed.profiles.filter(p => p.role !== 'student'),
              ...seed.profiles.filter(p => p.role === 'student')
            ];
            if (!parsed.classes || parsed.classes.length <= 1) parsed.classes = seed.classes;
            if (!parsed.bills || parsed.bills.length === 0) parsed.bills = seed.bills;
            if (!parsed.bill_assignments || parsed.bill_assignments.length === 0) parsed.bill_assignments = seed.bill_assignments;
            if (!parsed.payments || parsed.payments.length === 0) parsed.payments = seed.payments;
            if (!parsed.expenses || parsed.expenses.length === 0) parsed.expenses = seed.expenses;
            if (!parsed.income_transactions || parsed.income_transactions.length === 0) parsed.income_transactions = seed.income_transactions;
          }

          parsed.profiles = parsed.profiles.map(p => {
            if (!p.password) {
              return {
                ...p,
                password: p.role === 'admin' ? 'admin123' : p.role === 'treasurer' ? 'bendahara123' : (p.nim || '123456')
              };
            }
            return p;
          });

          this.saveToStorage(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load local DB state:', e);
    }
    const seed = getInitialSeedData();
    this.saveToStorage(seed);
    return seed;
  }

  public restoreSampleStudents(): void {
    const seed = getInitialSeedData();
    const nonStudents = this.state.profiles.filter(p => p.role !== 'student');
    const seedStudents = seed.profiles.filter(p => p.role === 'student');
    this.state.profiles = [...nonStudents, ...seedStudents];
    if (this.state.classes.length <= 1) this.state.classes = seed.classes;
    if (this.state.bills.length === 0) this.state.bills = seed.bills;
    if (this.state.bill_assignments.length === 0) this.state.bill_assignments = seed.bill_assignments;
    if (this.state.payments.length === 0) this.state.payments = seed.payments;
    this.notify();
  }

  private saveToStorage(state: AppDatabaseState) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save local DB state:', e);
      }
    }
  }

  private notify() {
    this.saveToStorage(this.state);
    this.pushStateToCloud();
    this.listeners.forEach(fn => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // ----------------------------------------------------
  // ACADEMIC YEARS
  // ----------------------------------------------------
  public getAcademicYears(): AcademicYear[] {
    return [...this.state.academic_years].sort((a, b) => b.name.localeCompare(a.name));
  }

  public getActiveAcademicYear(): AcademicYear {
    const active = this.state.academic_years.find(y => y.is_active);
    return active || this.state.academic_years[0];
  }

  public setActiveAcademicYear(id: string, actorProfile?: UserProfile): void {
    const prevActive = this.state.academic_years.find(y => y.is_active);
    this.state.academic_years = this.state.academic_years.map(y => {
      if (y.id === id) {
        return { ...y, is_active: true, is_archived: false, updated_at: new Date().toISOString() };
      }
      return { ...y, is_active: false, is_archived: true, updated_at: new Date().toISOString() };
    });

    const targetYear = this.state.academic_years.find(y => y.id === id);
    if (targetYear) {
      this.state.app_settings.academic_year_id = id;
      this.recordAuditLog({
        user_id: actorProfile?.id,
        user_name: actorProfile?.full_name,
        user_role: actorProfile?.role,
        action: 'ACTIVATE_ACADEMIC_YEAR',
        entity_type: 'academic_years',
        entity_id: id,
        old_data: { activeYear: prevActive?.name },
        new_data: { activeYear: targetYear.name },
        description: `Mengaktifkan tahun akademik ${targetYear.name} dan mengarsipkan tahun sebelumnya`
      });
    }

    this.notify();
  }

  public createAcademicYear(year: Partial<AcademicYear>, actorProfile?: UserProfile): AcademicYear {
    const newYear: AcademicYear = {
      id: `a_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: year.name || '2027/2028',
      start_date: year.start_date || '2027-09-01',
      end_date: year.end_date || '2028-08-31',
      initial_balance: Number(year.initial_balance) || 0,
      is_active: Boolean(year.is_active),
      is_archived: false,
      notes: year.notes || '',
      created_by: actorProfile?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (newYear.is_active) {
      // Archive other years
      this.state.academic_years = this.state.academic_years.map(y => ({
        ...y,
        is_active: false,
        is_archived: true
      }));
      this.state.app_settings.academic_year_id = newYear.id;
    }

    this.state.academic_years.unshift(newYear);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'CREATE_ACADEMIC_YEAR',
      entity_type: 'academic_years',
      entity_id: newYear.id,
      new_data: newYear,
      description: `Membuat tahun akademik baru ${newYear.name} dengan saldo awal Rp${newYear.initial_balance.toLocaleString('id-ID')}`
    });

    this.notify();
    return newYear;
  }

  public updateInitialBalance(yearId: string, newBalance: number, actorProfile?: UserProfile): void {
    const year = this.state.academic_years.find(y => y.id === yearId);
    if (!year) return;

    const oldBalance = year.initial_balance;
    year.initial_balance = newBalance;
    year.updated_at = new Date().toISOString();

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'UPDATE_INITIAL_BALANCE',
      entity_type: 'academic_years',
      entity_id: yearId,
      old_data: { initial_balance: oldBalance },
      new_data: { initial_balance: newBalance },
      description: `Mengubah saldo awal tahun ${year.name} dari Rp${oldBalance.toLocaleString('id-ID')} menjadi Rp${newBalance.toLocaleString('id-ID')}`
    });

    this.notify();
  }

  // ----------------------------------------------------
  // PROFILES & STUDENTS
  // ----------------------------------------------------
  public getProfiles(): UserProfile[] {
    const classes = this.state.classes;
    return this.state.profiles.map(p => {
      const cls = classes.find(c => c.id === p.class_id);
      return {
        ...p,
        class_name: cls ? cls.name : p.class_name
      };
    });
  }

  public getStudents(): UserProfile[] {
    return this.getProfiles().filter(p => p.role === 'student');
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }

  public getProfileByNIM(nim: string): UserProfile | undefined {
    return this.getProfiles().find(p => p.nim === nim);
  }

  public createStudent(student: Partial<UserProfile>, actorProfile?: UserProfile): UserProfile {
    const newStudent: UserProfile = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      full_name: student.full_name || '',
      nim: student.nim || '',
      email: student.email || '',
      phone: student.phone || '',
      class_id: student.class_id,
      role: 'student',
      status: student.status || 'active',
      avatar_url: student.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.profiles.push(newStudent);

    // Auto assign all active bills in current academic year
    const activeYear = this.getActiveAcademicYear();
    const activeBills = this.state.bills.filter(b => b.academic_year_id === activeYear.id && b.is_active);
    activeBills.forEach(b => {
      if (b.target_type === 'all' || (b.target_type === 'class' && b.target_class_id === newStudent.class_id)) {
        this.state.bill_assignments.push({
          id: `asg_${b.id.slice(-4)}_${newStudent.id.slice(-4)}`,
          bill_id: b.id,
          student_id: newStudent.id,
          created_at: new Date().toISOString()
        });
      }
    });

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'CREATE_STUDENT',
      entity_type: 'profiles',
      entity_id: newStudent.id,
      new_data: newStudent,
      description: `Menambahkan mahasiswa baru: ${newStudent.full_name} (${newStudent.nim})`
    });

    this.notify();
    return newStudent;
  }

  public updateProfile(id: string, updates: Partial<UserProfile>, actorProfile?: UserProfile): void {
    const profile = this.state.profiles.find(p => p.id === id);
    if (!profile) return;

    const oldData = { ...profile };
    Object.assign(profile, updates, { updated_at: new Date().toISOString() });

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'UPDATE_PROFILE',
      entity_type: 'profiles',
      entity_id: id,
      old_data: oldData,
      new_data: updates,
      description: `Memperbarui data profil: ${profile.full_name}`
    });

    this.notify();
  }

  // User account status changer (all roles)
  public setUserStatus(id: string, status: UserStatus, actorProfile?: UserProfile): void {
    const profile = this.state.profiles.find(p => p.id === id);
    if (!profile) return;

    const oldStatus = profile.status;
    profile.status = status;
    profile.updated_at = new Date().toISOString();

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'CHANGE_USER_STATUS',
      entity_type: 'profiles',
      entity_id: id,
      old_data: { status: oldStatus },
      new_data: { status },
      description: `Mengubah status akun pengguna ${profile.full_name} (${profile.role}) menjadi ${status}`
    });

    this.notify();
  }

  // Soft delete / deactivate student
  public setStudentStatus(id: string, status: 'active' | 'inactive' | 'graduated', actorProfile?: UserProfile): void {
    this.setUserStatus(id, status, actorProfile);
  }

  // Delete student permanently
  public deleteStudent(id: string, actorProfile?: UserProfile): { success: boolean; message: string } {
    return this.deleteUserAccount(id, actorProfile);
  }

  // Student Self-Registration (Daftar Mandiri Mahasiswa dari Login)
  public registerStudent(data: {
    full_name: string;
    nim: string;
    password?: string;
    class_id?: string;
    phone?: string;
    email?: string;
  }): { success: boolean; message: string; user?: UserProfile } {
    const trimmedNim = data.nim.trim();
    const trimmedName = data.full_name.trim();

    if (!trimmedNim) {
      return { success: false, message: 'Nomor Induk Mahasiswa (NIM) wajib diisi.' };
    }
    if (!trimmedName) {
      return { success: false, message: 'Nama lengkap mahasiswa wajib diisi.' };
    }

    const existing = this.state.profiles.find(
      p => p.nim.toLowerCase() === trimmedNim.toLowerCase()
    );
    if (existing) {
      return {
        success: false,
        message: `Mahasiswa dengan NIM ${trimmedNim} (${existing.full_name}) sudah terdaftar di sistem. Silakan login.`
      };
    }

    const targetClass = this.state.classes.find(c => c.id === data.class_id) || this.state.classes[0];
    const password = data.password?.trim() || trimmedNim;

    const newStudent: UserProfile = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      full_name: trimmedName,
      nim: trimmedNim,
      email: data.email?.trim() || `${trimmedNim.toLowerCase()}@unugha.ac.id`,
      phone: data.phone?.trim() || '-',
      password: password,
      role: 'student',
      status: 'active',
      class_id: targetClass?.id,
      class_name: targetClass?.name || 'Informatika',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.profiles.push(newStudent);

    // Automatically link to active bills
    const activeYear = this.getActiveAcademicYear();
    const activeBills = this.state.bills.filter(b => b.academic_year_id === activeYear.id && b.is_active);
    activeBills.forEach(b => {
      if (b.target_type === 'all' || (b.target_type === 'class' && b.target_class_id === newStudent.class_id)) {
        this.state.bill_assignments.push({
          id: `asg_${b.id.slice(-4)}_${newStudent.id.slice(-4)}`,
          bill_id: b.id,
          student_id: newStudent.id,
          created_at: new Date().toISOString()
        });
      }
    });

    // Notify admins
    this.createNotification({
      target_role: 'admin',
      title: 'Pendaftaran Mahasiswa Baru',
      message: `${newStudent.full_name} (${newStudent.nim}) baru saja mendaftar mandiri ke kelas ${newStudent.class_name}.`,
      type: 'info'
    });

    this.recordAuditLog({
      user_id: newStudent.id,
      user_name: newStudent.full_name,
      user_role: 'student',
      action: 'STUDENT_SELF_REGISTER',
      entity_type: 'profiles',
      entity_id: newStudent.id,
      description: `Mahasiswa baru mendaftar mandiri: ${newStudent.full_name} (${newStudent.nim}) - ${newStudent.class_name}`
    });

    this.notify();
    return {
      success: true,
      message: `Pendaftaran berhasil! Akun mahasiswa ${newStudent.full_name} siap digunakan.`,
      user: newStudent
    };
  }

  // Batch import students (Tambah banyak mahasiswa sekaligus)
  public batchImportStudents(
    studentsList: Array<{ full_name: string; nim: string; class_id?: string; phone?: string; email?: string }>,
    actorProfile?: UserProfile
  ): { created: number; skipped: number; errors: string[] } {
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    studentsList.forEach((item, index) => {
      const nim = item.nim?.trim();
      const name = item.full_name?.trim();
      if (!nim || !name) {
        skipped++;
        errors.push(`Baris ${index + 1}: Nama atau NIM kosong.`);
        return;
      }

      const existing = this.state.profiles.find(p => p.nim.toLowerCase() === nim.toLowerCase());
      if (existing) {
        skipped++;
        errors.push(`NIM ${nim} (${name}) sudah terdaftar di sistem.`);
        return;
      }

      const targetClass = this.state.classes.find(c => c.id === item.class_id) || this.state.classes[0];
      const newStudent: UserProfile = {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${index}`,
        full_name: name,
        nim: nim,
        password: nim, // Default kata sandi = NIM
        email: item.email?.trim() || `${nim.toLowerCase()}@unugha.ac.id`,
        phone: item.phone?.trim() || '-',
        role: 'student',
        status: 'active',
        class_id: targetClass?.id,
        class_name: targetClass?.name || 'Informatika',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.state.profiles.push(newStudent);

      // Link to active bills
      const activeYear = this.getActiveAcademicYear();
      const activeBills = this.state.bills.filter(b => b.academic_year_id === activeYear.id && b.is_active);
      activeBills.forEach(b => {
        if (b.target_type === 'all' || (b.target_type === 'class' && b.target_class_id === newStudent.class_id)) {
          this.state.bill_assignments.push({
            id: `asg_${b.id.slice(-4)}_${newStudent.id.slice(-4)}`,
            bill_id: b.id,
            student_id: newStudent.id,
            created_at: new Date().toISOString()
          });
        }
      });

      created++;
    });

    if (created > 0) {
      this.recordAuditLog({
        user_id: actorProfile?.id,
        user_name: actorProfile?.full_name,
        user_role: actorProfile?.role,
        action: 'BATCH_IMPORT_STUDENTS',
        entity_type: 'profiles',
        entity_id: 'batch_import',
        description: `Import massal mahasiswa: ${created} data berhasil dibuat (${skipped} dilewati)`
      });
      this.notify();
    }

    return { created, skipped, errors };
  }

  // Create new user account (Admin, Treasurer, Student)
  public createUserAccount(
    user: Partial<UserProfile> & { password?: string },
    actorProfile?: UserProfile
  ): UserProfile {
    const role: UserRole = user.role || 'student';
    const defaultPassword =
      user.password?.trim() ||
      (role === 'admin' ? 'admin123' : role === 'treasurer' ? 'bendahara123' : (user.nim || '123456'));

    const newUser: UserProfile = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      full_name: user.full_name?.trim() || 'Pengguna Baru',
      nim: user.nim?.trim() || (role === 'admin' ? 'ADM' + Date.now().toString().slice(-4) : 'BND' + Date.now().toString().slice(-4)),
      email: user.email?.trim() || `${user.nim || 'user'}@informatika.ac.id`,
      phone: user.phone?.trim() || '-',
      password: defaultPassword,
      role: role,
      status: user.status || 'active',
      class_id: user.class_id,
      class_name: user.class_name,
      avatar_url: user.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.profiles.push(newUser);

    // If role is student, auto assign active bills
    if (role === 'student') {
      const activeYear = this.getActiveAcademicYear();
      const activeBills = this.state.bills.filter(b => b.academic_year_id === activeYear.id && b.is_active);
      activeBills.forEach(b => {
        if (b.target_type === 'all' || (b.target_type === 'class' && b.target_class_id === newUser.class_id)) {
          this.state.bill_assignments.push({
            id: `asg_${b.id.slice(-4)}_${newUser.id.slice(-4)}`,
            bill_id: b.id,
            student_id: newUser.id,
            created_at: new Date().toISOString()
          });
        }
      });
    }

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'CREATE_USER_ACCOUNT',
      entity_type: 'profiles',
      entity_id: newUser.id,
      new_data: { full_name: newUser.full_name, nim: newUser.nim, role: newUser.role, email: newUser.email },
      description: `Menambahkan akun pengguna baru: ${newUser.full_name} (${newUser.nim}) sebagai ${newUser.role.toUpperCase()}`
    });

    this.notify();
    return newUser;
  }

  // Admin directly reset password of any user
  public adminResetPassword(
    userId: string,
    newPassword: string,
    actorProfile?: UserProfile
  ): { success: boolean; message: string } {
    const profile = this.state.profiles.find(p => p.id === userId);
    if (!profile) {
      return { success: false, message: 'Akun pengguna tidak ditemukan.' };
    }

    const trimmed = newPassword.trim();
    if (!trimmed || trimmed.length < 4) {
      return { success: false, message: 'Kata sandi baru minimal harus 4 karakter.' };
    }

    profile.password = trimmed;
    profile.updated_at = new Date().toISOString();

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'ADMIN_RESET_PASSWORD',
      entity_type: 'profiles',
      entity_id: userId,
      description: `Administrator ${actorProfile?.full_name || 'Admin'} mereset kata sandi akun ${profile.full_name} (${profile.nim} - ${profile.role})`
    });

    this.notify();
    return { success: true, message: `Kata sandi akun ${profile.full_name} berhasil diatur ulang.` };
  }

  // Admin update user role
  public adminUpdateUserRole(
    userId: string,
    newRole: UserRole,
    actorProfile?: UserProfile
  ): { success: boolean; message: string } {
    const profile = this.state.profiles.find(p => p.id === userId);
    if (!profile) {
      return { success: false, message: 'Akun pengguna tidak ditemukan.' };
    }

    // Safety: prevent demoting oneself if the only admin
    if (profile.role === 'admin' && newRole !== 'admin') {
      const adminCount = this.state.profiles.filter(p => p.role === 'admin' && p.status === 'active').length;
      if (adminCount <= 1) {
        return { success: false, message: 'Tidak dapat mengubah role administrator terakhir di sistem.' };
      }
    }

    const oldRole = profile.role;
    profile.role = newRole;
    profile.updated_at = new Date().toISOString();

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'CHANGE_USER_ROLE',
      entity_type: 'profiles',
      entity_id: userId,
      old_data: { role: oldRole },
      new_data: { role: newRole },
      description: `Mengubah hak akses akun ${profile.full_name} dari ${oldRole} menjadi ${newRole}`
    });

    this.notify();
    return { success: true, message: `Hak akses akun ${profile.full_name} berhasil diubah ke ${newRole}.` };
  }

  // Delete user account
  public deleteUserAccount(
    userId: string,
    actorProfile?: UserProfile
  ): { success: boolean; message: string } {
    if (actorProfile && actorProfile.id === userId) {
      return { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.' };
    }

    const profile = this.state.profiles.find(p => p.id === userId);
    if (!profile) {
      return { success: false, message: 'Akun pengguna tidak ditemukan.' };
    }

    if (profile.role === 'admin') {
      const adminCount = this.state.profiles.filter(p => p.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, message: 'Tidak dapat menghapus akun Administrator utama sistem.' };
      }
    }

    const deletedName = profile.full_name;
    const deletedNim = profile.nim;
    const deletedRole = profile.role;

    // Remove from profiles
    this.state.profiles = this.state.profiles.filter(p => p.id !== userId);

    // Clean up bill assignments if any
    this.state.bill_assignments = this.state.bill_assignments.filter(a => a.student_id !== userId);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'DELETE_USER_ACCOUNT',
      entity_type: 'profiles',
      entity_id: userId,
      description: `Menghapus akun pengguna: ${deletedName} (${deletedNim} - ${deletedRole})`
    });

    this.notify();
    return { success: true, message: `Akun ${deletedName} berhasil dihapus dari sistem.` };
  }

  // Authenticate user credentials
  public authenticate(
    identifier: string,
    passwordAttempt: string
  ): { success: boolean; profile?: UserProfile; message?: string } {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (passwordAttempt || '').trim();

    if (!cleanId) {
      return { success: false, message: 'Silakan masukkan NIM atau Email akun Anda.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'Silakan masukkan kata sandi akun Anda.' };
    }

    // Find by NIM or Email
    const profile = this.state.profiles.find(
      p => (p.nim && p.nim.toLowerCase() === cleanId) || (p.email && p.email.toLowerCase() === cleanId)
    );

    if (!profile) {
      return {
        success: false,
        message: 'Akun dengan identitas NIM / Email tersebut tidak ditemukan dalam sistem.'
      };
    }

    if (profile.status === 'inactive') {
      return {
        success: false,
        message: 'Status akun Anda saat ini sedang dinonaktifkan. Hubungi pengurus kas atau admin prodi.'
      };
    }

    const defaultPass = profile.role === 'admin' ? 'admin123' : profile.role === 'treasurer' ? 'bendahara123' : profile.nim;
    const expectedPass = profile.password || defaultPass;

    // Check match (also allow student NIM as initial password)
    const isMatch = cleanPass === expectedPass || (profile.role === 'student' && cleanPass === profile.nim);

    if (!isMatch) {
      return {
        success: false,
        message: 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali.'
      };
    }

    // Record login audit log
    this.recordAuditLog({
      user_id: profile.id,
      user_name: profile.full_name,
      user_role: profile.role,
      action: 'LOGIN_SUCCESS',
      entity_type: 'profiles',
      entity_id: profile.id,
      description: `Pengguna ${profile.full_name} (${profile.nim} - ${profile.role}) berhasil login ke sistem`
    });

    const cls = this.state.classes.find(c => c.id === profile.class_id);
    return {
      success: true,
      profile: {
        ...profile,
        class_name: cls ? cls.name : profile.class_name
      }
    };
  }

  public changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
    actorProfile?: UserProfile
  ): { success: boolean; message: string } {
    const profile = this.state.profiles.find(p => p.id === userId);
    if (!profile) {
      return { success: false, message: 'Data akun tidak ditemukan.' };
    }

    const defaultPass = profile.role === 'admin' ? 'admin123' : profile.role === 'treasurer' ? 'bendahara123' : profile.nim;
    const currentPass = profile.password || defaultPass;

    if (oldPass.trim() !== currentPass && !(profile.role === 'student' && oldPass.trim() === profile.nim)) {
      return { success: false, message: 'Kata sandi lama yang Anda masukkan tidak sesuai.' };
    }

    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'Kata sandi baru minimal harus 4 karakter.' };
    }

    profile.password = newPass.trim();
    profile.updated_at = new Date().toISOString();

    this.recordAuditLog({
      user_id: actorProfile?.id || userId,
      user_name: actorProfile?.full_name || profile.full_name,
      user_role: actorProfile?.role || profile.role,
      action: 'CHANGE_PASSWORD',
      entity_type: 'profiles',
      entity_id: userId,
      description: `Pengguna ${profile.full_name} (${profile.nim}) memperbarui kata sandi akun`
    });

    this.notify();
    return { success: true, message: 'Kata sandi berhasil diperbarui.' };
  }

  // ----------------------------------------------------
  // CLASSES
  // ----------------------------------------------------
  public getClasses(): ClassItem[] {
    const students = this.state.profiles.filter(p => p.role === 'student');
    return this.state.classes.map(c => ({
      ...c,
      student_count: students.filter(s => s.class_id === c.id).length
    }));
  }

  public createClass(cls: Partial<ClassItem>, actorProfile?: UserProfile): ClassItem {
    const newClass: ClassItem = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cls.name || '',
      batch: cls.batch || new Date().getFullYear().toString(),
      major: cls.major || 'Informatika',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.classes.push(newClass);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'CREATE_CLASS',
      entity_type: 'classes',
      entity_id: newClass.id,
      new_data: newClass,
      description: `Menambahkan kelas baru: ${newClass.name}`
    });

    this.notify();
    return newClass;
  }

  public deleteClass(id: string, actorProfile?: UserProfile): { success: boolean; message: string } {
    const cls = this.state.classes.find(c => c.id === id);
    if (!cls) {
      return { success: false, message: 'Kelas tidak ditemukan.' };
    }

    const assignedStudents = this.state.profiles.filter(p => p.class_id === id);
    if (assignedStudents.length > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus kelas "${cls.name}" karena masih memiliki ${assignedStudents.length} mahasiswa terdaftar.`
      };
    }

    const className = cls.name;
    this.state.classes = this.state.classes.filter(c => c.id !== id);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'DELETE_CLASS',
      entity_type: 'classes',
      entity_id: id,
      description: `Menghapus rombel kelas: ${className}`
    });

    this.notify();
    return { success: true, message: `Kelas "${className}" berhasil dihapus.` };
  }

  // ----------------------------------------------------
  // PAYMENT LINKS (LYNK.ID)
  // ----------------------------------------------------
  public getPaymentLinks(): PaymentLink[] {
    return [...this.state.payment_links];
  }

  public getActivePaymentLinks(): PaymentLink[] {
    return this.state.payment_links.filter(l => l.is_active);
  }

  public createPaymentLink(link: Partial<PaymentLink>, actorProfile?: UserProfile): PaymentLink {
    const newLink: PaymentLink = {
      id: `l_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: link.name || 'Link Pembayaran',
      description: link.description || '',
      url: link.url || 'https://lynk.id/kas-informatika',
      is_active: link.is_active ?? true,
      created_by: actorProfile?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.payment_links.unshift(newLink);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'CREATE_PAYMENT_LINK',
      entity_type: 'payment_links',
      entity_id: newLink.id,
      new_data: newLink,
      description: `Menambahkan Lynk.id payment link: ${newLink.name} (${newLink.url})`
    });

    this.notify();
    return newLink;
  }

  public updatePaymentLink(id: string, updates: Partial<PaymentLink>, actorProfile?: UserProfile): void {
    const link = this.state.payment_links.find(l => l.id === id);
    if (!link) return;

    const oldData = { ...link };
    Object.assign(link, updates, { updated_at: new Date().toISOString() });

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'UPDATE_PAYMENT_LINK',
      entity_type: 'payment_links',
      entity_id: id,
      old_data: oldData,
      new_data: updates,
      description: `Mengubah payment link: ${link.name}`
    });

    this.notify();
  }

  public deletePaymentLink(id: string, actorProfile?: UserProfile): void {
    const link = this.state.payment_links.find(l => l.id === id);
    if (!link) return;

    this.state.payment_links = this.state.payment_links.filter(l => l.id !== id);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'DELETE_PAYMENT_LINK',
      entity_type: 'payment_links',
      entity_id: id,
      description: `Menghapus payment link: ${link.name}`
    });

    this.notify();
  }

  // ----------------------------------------------------
  // BILLS & BILL ASSIGNMENTS
  // ----------------------------------------------------
  public getBills(academicYearId?: string): Bill[] {
    const yearId = academicYearId || this.getActiveAcademicYear().id;
    return this.state.bills
      .filter(b => b.academic_year_id === yearId)
      .map(b => {
        const link = this.state.payment_links.find(l => l.id === b.payment_link_id);
        return {
          ...b,
          payment_link_url: link ? link.url : b.payment_link_url || this.state.app_settings.lynk_default_url
        };
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  public getBillById(id: string): Bill | undefined {
    const bill = this.state.bills.find(b => b.id === id);
    if (!bill) return undefined;
    const link = this.state.payment_links.find(l => l.id === bill.payment_link_id);
    return {
      ...bill,
      payment_link_url: link ? link.url : bill.payment_link_url || this.state.app_settings.lynk_default_url
    };
  }

  public createBill(
    billData: Partial<Bill>,
    assignedStudentIds: string[] = [],
    actorProfile?: UserProfile
  ): Bill {
    const activeYear = this.getActiveAcademicYear();
    const newBill: Bill = {
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      academic_year_id: billData.academic_year_id || activeYear.id,
      name: billData.name || 'Tagihan Baru',
      description: billData.description || '',
      bill_type: billData.bill_type || 'monthly',
      amount: Number(billData.amount) || 10000,
      period_month: billData.period_month,
      period_year: billData.period_year || 2026,
      due_date: billData.due_date || new Date().toISOString().split('T')[0],
      payment_link_id: billData.payment_link_id,
      target_type: billData.target_type || 'all',
      target_class_id: billData.target_class_id,
      is_active: true,
      created_by: actorProfile?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.bills.push(newBill);

    // Determine students to assign
    const students = this.getStudents().filter(s => s.status === 'active');
    let targetStudents: UserProfile[] = [];

    if (newBill.target_type === 'all') {
      targetStudents = students;
    } else if (newBill.target_type === 'class' && newBill.target_class_id) {
      targetStudents = students.filter(s => s.class_id === newBill.target_class_id);
    } else if (newBill.target_type === 'specific') {
      targetStudents = students.filter(s => assignedStudentIds.includes(s.id));
    }

    targetStudents.forEach(st => {
      this.state.bill_assignments.push({
        id: `asg_${newBill.id.slice(-4)}_${st.id.slice(-4)}_${Date.now()}`,
        bill_id: newBill.id,
        student_id: st.id,
        created_at: new Date().toISOString()
      });
    });

    // Create notification
    this.createNotification({
      target_role: 'student',
      title: 'Tagihan Baru Diterbitkan',
      message: `${newBill.name} sebesar Rp${newBill.amount.toLocaleString('id-ID')} telah diterbitkan. Batas waktu: ${newBill.due_date}.`,
      type: 'info'
    });

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'CREATE_BILL',
      entity_type: 'bills',
      entity_id: newBill.id,
      new_data: newBill,
      description: `Membuat tagihan "${newBill.name}" sebesar Rp${newBill.amount.toLocaleString('id-ID')} untuk ${targetStudents.length} mahasiswa`
    });

    this.notify();
    return newBill;
  }

  public deleteBill(id: string, actorProfile?: UserProfile): void {
    const bill = this.state.bills.find(b => b.id === id);
    if (!bill) return;

    // Remove bill
    this.state.bills = this.state.bills.filter(b => b.id !== id);

    // Remove associated assignments
    const removedAssignmentsCount = this.state.bill_assignments.filter(a => a.bill_id === id).length;
    this.state.bill_assignments = this.state.bill_assignments.filter(a => a.bill_id !== id);

    // Remove associated payments
    const removedPaymentsCount = this.state.payments.filter(p => p.bill_id === id).length;
    this.state.payments = this.state.payments.filter(p => p.bill_id !== id);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'DELETE_BILL',
      entity_type: 'bills',
      entity_id: id,
      old_data: bill,
      description: `Menghapus tagihan "${bill.name}" sebesar Rp${bill.amount.toLocaleString('id-ID')} (${removedAssignmentsCount} penugasan, ${removedPaymentsCount} mutasi terkait)`
    });

    this.notify();
  }

  // ----------------------------------------------------
  // STUDENT BILL ASSIGNMENTS & STATUS CALCULATION
  // ----------------------------------------------------
  public getStudentBillAssignments(studentId: string, academicYearId?: string): BillAssignment[] {
    const yearId = academicYearId || this.getActiveAcademicYear().id;
    const student = this.getProfileById(studentId);
    if (!student) return [];

    const assignments = this.state.bill_assignments.filter(a => a.student_id === studentId);
    const bills = this.getBills(yearId);
    const payments = this.state.payments.filter(p => p.student_id === studentId);

    const todayStr = new Date().toISOString().split('T')[0];

    const result: BillAssignment[] = [];
    assignments.forEach(asg => {
      const bill = bills.find(b => b.id === asg.bill_id);
      if (!bill) return;

      // Find payments for this bill
      const billPayments = payments
        .filter(p => p.bill_id === bill.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const verifiedPayment = billPayments.find(p => p.status === 'verified');
      const pendingPayment = billPayments.find(p => p.status === 'pending');
      const rejectedPayment = billPayments.find(p => p.status === 'rejected');

      let status: BillAssignmentStatus = 'unpaid';
      let latestPayment: Payment | undefined = billPayments[0];

      if (verifiedPayment) {
        status = 'verified';
        latestPayment = verifiedPayment;
      } else if (pendingPayment) {
        status = 'pending';
        latestPayment = pendingPayment;
      } else if (rejectedPayment) {
        status = 'rejected';
        latestPayment = rejectedPayment;
      } else {
        if (bill.due_date < todayStr) {
          status = 'overdue';
        } else {
          status = 'unpaid';
        }
      }

      result.push({
        ...asg,
        bill,
        student,
        latest_payment: latestPayment,
        status
      });
    });

    return result.sort((a, b) => {
      if (!a.bill || !b.bill) return 0;
      return new Date(a.bill.due_date).getTime() - new Date(b.bill.due_date).getTime();
    });
  }

  // ----------------------------------------------------
  // PAYMENTS (CASH & ONLINE)
  // ----------------------------------------------------
  public getPayments(academicYearId?: string): Payment[] {
    const yearId = academicYearId || this.getActiveAcademicYear().id;
    const bills = this.getBills(yearId);
    const billMap = new Map(bills.map(b => [b.id, b]));
    const profileMap = new Map(this.getProfiles().map(p => [p.id, p]));

    return this.state.payments
      .filter(p => billMap.has(p.bill_id))
      .map(p => ({
        ...p,
        bill: billMap.get(p.bill_id),
        student: profileMap.get(p.student_id)
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // A. Online payment submission by student
  public submitOnlinePayment(params: {
    billId: string;
    studentId: string;
    amount: number;
    proofUrl: string;
    studentNote?: string;
  }): Payment {
    const bill = this.getBillById(params.billId);
    const student = this.getProfileById(params.studentId);

    const newPayment: Payment = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bill_id: params.billId,
      student_id: params.studentId,
      amount: params.amount,
      payment_method: 'online',
      payment_date: new Date().toISOString().split('T')[0],
      proof_url: params.proofUrl,
      status: 'pending', // Menunggu verifikasi bendahara
      student_note: params.studentNote || 'Pembayaran via Lynk.id (Menunggu Verifikasi)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.payments.unshift(newPayment);

    // Notify Student
    this.createNotification({
      user_id: params.studentId,
      title: 'Laporan Pembayaran Diterima',
      message: `Konfirmasi pembayaran untuk "${bill?.name}" telah diterima dan berstatus MENUNGGU VERIFIKASI. Tagihan akan lunas setelah diverifikasi oleh Bendahara.`,
      type: 'info'
    });

    // Notify Admins & Treasurers for verification
    this.createNotification({
      target_role: 'admin',
      title: 'Pembayaran Online Menunggu Verifikasi',
      message: `${student?.full_name || 'Mahasiswa'} telah melaporkan pembayaran Lynk.id untuk "${bill?.name || 'Tagihan'}". Silakan periksa mutasi rekening / bukti bayar.`,
      type: 'warning'
    });

    this.recordAuditLog({
      user_id: params.studentId,
      user_name: student?.full_name,
      user_role: 'student',
      action: 'SUBMIT_ONLINE_PAYMENT',
      entity_type: 'payments',
      entity_id: newPayment.id,
      new_data: newPayment,
      description: `Mahasiswa ${student?.full_name} (${student?.nim}) melaporkan bayar online untuk "${bill?.name}" sebesar Rp${params.amount.toLocaleString('id-ID')} (Menunggu Verifikasi)`
    });

    this.notify();
    return newPayment;
  }

  // B. Direct Cash Payment recorded by Admin / Treasurer
  public recordCashPayment(params: {
    billId?: string;
    bill_id?: string;
    studentId?: string;
    student_id?: string;
    amount: number;
    paymentDate?: string;
    payment_date?: string;
    notes?: string;
    student_note?: string;
    actorProfile?: UserProfile | null;
  }): Payment {
    const effectiveBillId = (params.billId || params.bill_id || '').trim();
    const effectiveStudentId = (params.studentId || params.student_id || '').trim();
    const effectivePaymentDate = params.paymentDate || params.payment_date || new Date().toISOString().split('T')[0];
    const effectiveNotes = params.notes || params.student_note || '';

    const bill = this.getBillById(effectiveBillId);
    const student = this.getProfileById(effectiveStudentId);
    const actor = params.actorProfile || this.getProfiles().find(p => p.role === 'admin' || p.role === 'treasurer') || {
      id: 'p0000000-0000-0000-0000-000000000002',
      full_name: 'Bendahara Kas',
      role: 'treasurer' as const
    };

    // Ensure student assignment exists for this bill
    const existingAssignment = this.state.bill_assignments.find(
      a => a.bill_id === effectiveBillId && a.student_id === effectiveStudentId
    );
    if (!existingAssignment && effectiveBillId && effectiveStudentId) {
      this.state.bill_assignments.push({
        id: `asg_${effectiveBillId.slice(-4)}_${effectiveStudentId.slice(-4)}_${Date.now()}`,
        bill_id: effectiveBillId,
        student_id: effectiveStudentId,
        created_at: new Date().toISOString()
      });
    }

    const newPayment: Payment = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bill_id: effectiveBillId,
      student_id: effectiveStudentId,
      amount: Number(params.amount),
      payment_method: 'cash',
      payment_date: effectivePaymentDate,
      status: 'verified', // DIRECT VERIFIED
      student_note: 'Pembayaran tunai langsung ke bendahara',
      admin_note: effectiveNotes || 'Diterima tunai oleh bendahara',
      received_by: actor.id,
      verified_by: actor.id,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.payments.unshift(newPayment);

    // Notify the student
    if (effectiveStudentId) {
      this.createNotification({
        user_id: effectiveStudentId,
        title: 'Pembayaran Cash Diterima',
        message: `Pembayaran cash sebesar Rp${Number(params.amount).toLocaleString('id-ID')} untuk "${bill?.name || 'Tagihan Kas'}" telah diterima dan diverifikasi oleh bendahara.`,
        type: 'success'
      });
    }

    this.recordAuditLog({
      user_id: actor.id,
      user_name: actor.full_name,
      user_role: actor.role,
      action: 'RECORD_CASH_PAYMENT',
      entity_type: 'payments',
      entity_id: newPayment.id,
      new_data: newPayment,
      description: `Menerima pembayaran cash Rp${Number(params.amount).toLocaleString('id-ID')} untuk "${bill?.name || 'Tagihan Kas'}" dari ${student?.full_name || 'Mahasiswa'} (${student?.nim || '-'})`
    });

    this.notify();
    return newPayment;
  }

  // C. Cash payment reported directly by student (pending until treasurer verifies physical cash receipt)
  public submitCashPaymentReport(params: {
    billId: string;
    studentId: string;
    amount: number;
    studentNote?: string;
  }): Payment {
    const bill = this.getBillById(params.billId);
    const student = this.getProfileById(params.studentId);

    const newPayment: Payment = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bill_id: params.billId,
      student_id: params.studentId,
      amount: params.amount,
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      student_note: params.studentNote || 'Laporan pembayaran setor tunai langsung ke bendahara',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.payments.unshift(newPayment);

    // Notify Admins & Treasurers
    this.createNotification({
      target_role: 'admin',
      title: 'Konfirmasi Setor Kas Tunai',
      message: `${student?.full_name || 'Mahasiswa'} mengonfirmasi setor tunai Rp${params.amount.toLocaleString('id-ID')} untuk "${bill?.name || 'Tagihan'}". Silakan verifikasi fisik uang.`,
      type: 'info'
    });

    this.recordAuditLog({
      user_id: params.studentId,
      user_name: student?.full_name,
      user_role: 'student',
      action: 'REPORT_CASH_PAYMENT',
      entity_type: 'payments',
      entity_id: newPayment.id,
      new_data: newPayment,
      description: `Mahasiswa ${student?.full_name} (${student?.nim}) melaporkan pembayaran tunai "${bill?.name}" Rp${params.amount.toLocaleString('id-ID')}`
    });

    this.notify();
    return newPayment;
  }

  // D. Verify pending payment
  public verifyPayment(paymentId: string, adminNote: string, actorProfile: UserProfile): void {
    const payment = this.state.payments.find(p => p.id === paymentId);
    if (!payment) return;

    const oldStatus = payment.status;
    payment.status = 'verified';
    payment.admin_note = adminNote || 'Pembayaran diverifikasi valid';
    payment.verified_by = actorProfile.id;
    payment.verified_at = new Date().toISOString();
    payment.updated_at = new Date().toISOString();

    const student = this.getProfileById(payment.student_id);
    const bill = this.getBillById(payment.bill_id);

    // Notify student
    this.createNotification({
      user_id: payment.student_id,
      title: 'Pembayaran Diverifikasi LUNAS',
      message: `Pembayaran via Lynk.id untuk "${bill?.name}" sebesar Rp${payment.amount.toLocaleString('id-ID')} telah diverifikasi LUNAS oleh bendahara.`,
      type: 'success'
    });

    this.recordAuditLog({
      user_id: actorProfile.id,
      user_name: actorProfile.full_name,
      user_role: actorProfile.role,
      action: 'VERIFY_PAYMENT',
      entity_type: 'payments',
      entity_id: paymentId,
      old_data: { status: oldStatus },
      new_data: { status: 'verified', adminNote },
      description: `Memverifikasi LUNAS pembayaran Rp${payment.amount.toLocaleString('id-ID')} dari ${student?.full_name} (${student?.nim})`
    });

    this.notify();
  }

  // D. Reject pending payment
  public rejectPayment(paymentId: string, rejectReason: string, actorProfile: UserProfile): void {
    const payment = this.state.payments.find(p => p.id === paymentId);
    if (!payment) return;

    const oldStatus = payment.status;
    payment.status = 'rejected';
    payment.admin_note = rejectReason || 'Bukti transfer tidak valid atau nominal tidak sesuai';
    payment.verified_by = actorProfile.id;
    payment.verified_at = new Date().toISOString();
    payment.updated_at = new Date().toISOString();

    const student = this.getProfileById(payment.student_id);
    const bill = this.getBillById(payment.bill_id);

    // Notify student
    this.createNotification({
      user_id: payment.student_id,
      title: 'Pembayaran Ditolak',
      message: `Bukti pembayaran untuk "${bill?.name}" ditolak dengan catatan: "${rejectReason}". Silakan upload bukti yang benar.`,
      type: 'error'
    });

    this.recordAuditLog({
      user_id: actorProfile.id,
      user_name: actorProfile.full_name,
      user_role: actorProfile.role,
      action: 'REJECT_PAYMENT',
      entity_type: 'payments',
      entity_id: paymentId,
      old_data: { status: oldStatus },
      new_data: { status: 'rejected', rejectReason },
      description: `Menolak pembayaran dari ${student?.full_name} (${student?.nim}). Alasan: ${rejectReason}`
    });

    this.notify();
  }

  // Delete / cancel payment record (Batalkan salah catat)
  public deletePayment(paymentId: string, actorProfile?: UserProfile): { success: boolean; message: string } {
    const payment = this.state.payments.find(p => p.id === paymentId);
    if (!payment) {
      return { success: false, message: 'Transaksi pembayaran tidak ditemukan.' };
    }

    const student = this.getProfileById(payment.student_id);
    const bill = this.getBillById(payment.bill_id);
    const amount = payment.amount;

    this.state.payments = this.state.payments.filter(p => p.id !== paymentId);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'DELETE_PAYMENT',
      entity_type: 'payments',
      entity_id: paymentId,
      old_data: payment,
      description: `Membatalkan/menghapus transaksi pembayaran kas Rp${amount.toLocaleString('id-ID')} untuk ${student?.full_name || 'Mahasiswa'} (${bill?.name || 'Tagihan'})`
    });

    this.notify();
    return { success: true, message: `Transaksi pembayaran kas sebesar Rp${amount.toLocaleString('id-ID')} berhasil dibatalkan.` };
  }

  // Update payment record (Koreksi salah catat nominal / tanggal / catatan)
  public updatePayment(
    paymentId: string,
    updates: {
      amount?: number;
      payment_date?: string;
      admin_note?: string;
      payment_method?: 'cash' | 'online';
    },
    actorProfile?: UserProfile
  ): { success: boolean; message: string; payment?: Payment } {
    const payment = this.state.payments.find(p => p.id === paymentId);
    if (!payment) {
      return { success: false, message: 'Transaksi pembayaran tidak ditemukan.' };
    }

    const oldData = { ...payment };
    if (updates.amount !== undefined && updates.amount > 0) {
      payment.amount = Number(updates.amount);
    }
    if (updates.payment_date) {
      payment.payment_date = updates.payment_date;
    }
    if (updates.admin_note !== undefined) {
      payment.admin_note = updates.admin_note;
    }
    if (updates.payment_method) {
      payment.payment_method = updates.payment_method;
    }
    payment.updated_at = new Date().toISOString();

    const student = this.getProfileById(payment.student_id);
    const bill = this.getBillById(payment.bill_id);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'UPDATE_PAYMENT',
      entity_type: 'payments',
      entity_id: paymentId,
      old_data: oldData,
      new_data: payment,
      description: `Mengoreksi data pembayaran kas ${student?.full_name || 'Mahasiswa'} (${bill?.name || 'Tagihan'}) menjadi Rp${payment.amount.toLocaleString('id-ID')}`
    });

    this.notify();
    return { success: true, message: 'Data pembayaran kas berhasil diperbarui.', payment };
  }

  // ----------------------------------------------------
  // EXPENSES
  // ----------------------------------------------------
  public getExpenses(academicYearId?: string): Expense[] {
    const yearId = academicYearId || this.getActiveAcademicYear().id;
    return this.state.expenses
      .filter(e => e.academic_year_id === yearId)
      .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
  }

  public createExpense(expense: Partial<Expense>, actorProfile?: UserProfile): Expense {
    const activeYear = this.getActiveAcademicYear();
    const newExpense: Expense = {
      id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      academic_year_id: expense.academic_year_id || activeYear.id,
      description: expense.description || 'Pengeluaran',
      category: expense.category || 'Lainnya',
      amount: Number(expense.amount) || 0,
      expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
      proof_url: expense.proof_url,
      notes: expense.notes || '',
      created_by: actorProfile?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state.expenses.unshift(newExpense);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'CREATE_EXPENSE',
      entity_type: 'expenses',
      entity_id: newExpense.id,
      new_data: newExpense,
      description: `Mencatat pengeluaran: "${newExpense.description}" [${newExpense.category}] sebesar Rp${newExpense.amount.toLocaleString('id-ID')}`
    });

    this.notify();
    return newExpense;
  }

  public deleteExpense(id: string, actorProfile?: UserProfile): void {
    const exp = this.state.expenses.find(e => e.id === id);
    if (!exp) return;

    this.state.expenses = this.state.expenses.filter(e => e.id !== id);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'DELETE_EXPENSE',
      entity_type: 'expenses',
      entity_id: id,
      description: `Menghapus pengeluaran: "${exp.description}" sebesar Rp${exp.amount.toLocaleString('id-ID')}`
    });

    this.notify();
  }

  // ----------------------------------------------------
  // OTHER INCOME TRANSACTIONS
  // ----------------------------------------------------
  public getOtherIncome(academicYearId?: string): IncomeTransaction[] {
    const yearId = academicYearId || this.getActiveAcademicYear().id;
    return this.state.income_transactions
      .filter(i => i.academic_year_id === yearId)
      .sort((a, b) => new Date(b.received_date).getTime() - new Date(a.received_date).getTime());
  }

  public createOtherIncome(item: Partial<IncomeTransaction>, actorProfile?: UserProfile): IncomeTransaction {
    const activeYear = this.getActiveAcademicYear();
    const newIncome: IncomeTransaction = {
      id: `i_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      academic_year_id: item.academic_year_id || activeYear.id,
      source_name: item.source_name || 'Sumber Pemasukan',
      category: item.category || 'Donasi',
      amount: Number(item.amount) || 0,
      received_date: item.received_date || new Date().toISOString().split('T')[0],
      notes: item.notes || '',
      received_by: actorProfile?.id,
      created_at: new Date().toISOString()
    };

    this.state.income_transactions.unshift(newIncome);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'RECORD_OTHER_INCOME',
      entity_type: 'income_transactions',
      entity_id: newIncome.id,
      new_data: newIncome,
      description: `Mencatat pemasukan lain: "${newIncome.source_name}" [${newIncome.category}] sebesar Rp${newIncome.amount.toLocaleString('id-ID')}`
    });

    this.notify();
    return newIncome;
  }

  public deleteOtherIncome(id: string, actorProfile?: UserProfile): void {
    const item = this.state.income_transactions.find(i => i.id === id);
    if (!item) return;

    this.state.income_transactions = this.state.income_transactions.filter(i => i.id !== id);

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'DELETE_OTHER_INCOME',
      entity_type: 'income_transactions',
      entity_id: id,
      old_data: item,
      description: `Menghapus pemasukan non-tagihan: "${item.source_name}" sebesar Rp${item.amount.toLocaleString('id-ID')}`
    });

    this.notify();
  }

  public updateOtherIncome(id: string, updates: Partial<IncomeTransaction>, actorProfile?: UserProfile): IncomeTransaction | null {
    const idx = this.state.income_transactions.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const oldItem = this.state.income_transactions[idx];
    const updatedItem: IncomeTransaction = {
      ...oldItem,
      ...updates,
      id: oldItem.id,
      amount: updates.amount !== undefined ? Number(updates.amount) : oldItem.amount
    };

    this.state.income_transactions[idx] = updatedItem;

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'UPDATE_OTHER_INCOME',
      entity_type: 'income_transactions',
      entity_id: id,
      old_data: oldItem,
      new_data: updatedItem,
      description: `Memperbarui pemasukan non-tagihan: "${updatedItem.source_name}"`
    });

    this.notify();
    return updatedItem;
  }

  // ----------------------------------------------------
  // FINANCIAL SUMMARY & REKAP (PRECISION CALCULATIONS)
  // SALDO AKHIR = SALDO AWAL + PEMASUKAN VERIFIED - PENGELUARAN
  // ----------------------------------------------------
  public getFinancialSummary(academicYearId?: string): FinancialSummary {
    const yearId = academicYearId || this.getActiveAcademicYear().id;
    const year = this.state.academic_years.find(y => y.id === yearId) || this.getActiveAcademicYear();

    const initialBalance = year.initial_balance || 0;

    // Payments in this year
    const payments = this.getPayments(yearId);
    const verifiedPayments = payments.filter(p => p.status === 'verified');
    const cashVerified = verifiedPayments.filter(p => p.payment_method === 'cash');
    const onlineVerified = verifiedPayments.filter(p => p.payment_method === 'online');

    const totalCashIncome = cashVerified.reduce((sum, p) => sum + p.amount, 0);
    const totalOnlineIncome = onlineVerified.reduce((sum, p) => sum + p.amount, 0);

    // Other income
    const otherIncomes = this.getOtherIncome(yearId);
    const totalOtherIncome = otherIncomes.reduce((sum, i) => sum + i.amount, 0);

    const totalVerifiedIncome = totalCashIncome + totalOnlineIncome + totalOtherIncome;

    // Expenses
    const expenses = this.getExpenses(yearId);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Strict formula
    const currentBalance = initialBalance + totalVerifiedIncome - totalExpenses;

    // Bill obligations & arrears
    const bills = this.getBills(yearId);
    const billMap = new Map(bills.map(b => [b.id, b]));
    const assignments = this.state.bill_assignments.filter(a => billMap.has(a.bill_id));

    let totalBillsAmount = 0;
    assignments.forEach(asg => {
      const b = billMap.get(asg.bill_id);
      if (b) totalBillsAmount += b.amount;
    });

    const totalPaidBillsAmount = totalCashIncome + totalOnlineIncome;
    const totalArrearsAmount = Math.max(0, totalBillsAmount - totalPaidBillsAmount);

    return {
      academic_year_id: year.id,
      initial_balance: initialBalance,
      total_verified_income: totalVerifiedIncome,
      total_cash_income: totalCashIncome,
      total_online_income: totalOnlineIncome,
      total_other_income: totalOtherIncome,
      total_expenses: totalExpenses,
      current_balance: currentBalance,
      total_bills_amount: totalBillsAmount,
      total_paid_bills_amount: totalPaidBillsAmount,
      total_arrears_amount: totalArrearsAmount,
      pending_payments_count: payments.filter(p => p.status === 'pending').length,
      verified_payments_count: verifiedPayments.length,
      rejected_payments_count: payments.filter(p => p.status === 'rejected').length
    };
  }

  // ----------------------------------------------------
  // ARREARS (TUNGGAKAN) PER MAHASISWA
  // ----------------------------------------------------
  public getStudentArrearsList(academicYearId?: string) {
    const yearId = academicYearId || this.getActiveAcademicYear().id;
    const students = this.getStudents().filter(s => s.status === 'active');
    const classes = this.getClasses();
    const classMap = new Map(classes.map(c => [c.id, c.name]));

    const result = students.map(student => {
      const assignments = this.getStudentBillAssignments(student.id, yearId);
      const unpaidAssignments = assignments.filter(a => a.status === 'unpaid' || a.status === 'overdue' || a.status === 'rejected');
      const totalArrears = unpaidAssignments.reduce((sum, a) => sum + (a.bill?.amount || 0), 0);

      // Find oldest unpaid bill
      const sortedUnpaid = [...unpaidAssignments].sort((a, b) => {
        if (!a.bill || !b.bill) return 0;
        return new Date(a.bill.due_date).getTime() - new Date(b.bill.due_date).getTime();
      });

      const oldestBill = sortedUnpaid[0]?.bill;

      return {
        student,
        class_name: student.class_id ? classMap.get(student.class_id) || student.class_name : student.class_name,
        total_bills_count: assignments.length,
        unpaid_bills_count: unpaidAssignments.length,
        total_arrears: totalArrears,
        oldest_bill_name: oldestBill ? oldestBill.name : '-',
        oldest_due_date: oldestBill ? oldestBill.due_date : '-',
        unpaid_items: unpaidAssignments
      };
    });

    return result.sort((a, b) => b.total_arrears - a.total_arrears);
  }

  // ----------------------------------------------------
  // AUDIT LOG (APPEND-ONLY)
  // ----------------------------------------------------
  public getAuditLogs(): AuditLog[] {
    return [...this.state.audit_logs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public recordAuditLog(log: {
    user_id?: string;
    user_name?: string;
    user_role?: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_data?: Record<string, any>;
    new_data?: Record<string, any>;
    description: string;
  }) {
    const newLog: AuditLog = {
      id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: log.user_id,
      user_name: log.user_name || 'System Admin',
      user_role: log.user_role || 'admin',
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      old_data: log.old_data,
      new_data: log.new_data,
      description: log.description,
      created_at: new Date().toISOString()
    };

    this.state.audit_logs.unshift(newLog);
    // Persist immediately
    this.saveToStorage(this.state);
  }

  // ----------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------
  public getNotifications(userId?: string, role?: string): AppNotification[] {
    return this.state.notifications.filter(n => {
      if (n.user_id && n.user_id === userId) return true;
      if (n.target_role === 'all') return true;
      if (n.target_role === 'admin' && (role === 'admin' || role === 'treasurer')) return true;
      if (n.target_role === 'student' && role === 'student') return true;
      return false;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationAsRead(id: string): void {
    const n = this.state.notifications.find(item => item.id === id);
    if (n) {
      n.is_read = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId?: string, role?: string): void {
    const notifs = this.getNotifications(userId, role);
    notifs.forEach(n => {
      n.is_read = true;
    });
    this.notify();
  }

  public createNotification(notif: Partial<AppNotification>): AppNotification {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: notif.user_id,
      target_role: notif.target_role || 'all',
      title: notif.title || 'Pemberitahuan',
      message: notif.message || '',
      type: notif.type || 'info',
      link_url: notif.link_url,
      is_read: false,
      created_at: new Date().toISOString()
    };

    this.state.notifications.unshift(newNotif);
    this.notify();
    return newNotif;
  }

  // ----------------------------------------------------
  // APP SETTINGS
  // ----------------------------------------------------
  public getSettings(): AppSettings {
    return { 
      ...this.state.app_settings,
      korlas_name: this.state.app_settings.korlas_name || 'Adam Satrol'
    };
  }

  public updateSettings(updates: Partial<AppSettings>, actorProfile?: UserProfile): void {
    this.state.app_settings = {
      ...this.state.app_settings,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.recordAuditLog({
      user_id: actorProfile?.id,
      user_name: actorProfile?.full_name,
      user_role: actorProfile?.role,
      action: 'UPDATE_SETTINGS',
      entity_type: 'app_settings',
      entity_id: this.state.app_settings.id,
      new_data: updates,
      description: 'Memperbarui konfigurasi sistem kas'
    });

    this.notify();
  }

  // Export full database state as a JSON string for multi-device backup / transfer
  public exportDatabaseJSON(): string {
    return JSON.stringify({
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      state: this.state
    }, null, 2);
  }

  // Import full database state from JSON string
  public importDatabaseJSON(jsonStr: string, actorProfile?: UserProfile): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      const incomingState = parsed.state || parsed;

      if (!incomingState || !Array.isArray(incomingState.bills) || !incomingState.app_settings) {
        return { success: false, message: 'Format berkas cadangan data tidak valid.' };
      }

      this.state = {
        ...getInitialSeedData(),
        ...incomingState
      };

      this.recordAuditLog({
        user_id: actorProfile?.id,
        user_name: actorProfile?.full_name,
        user_role: actorProfile?.role,
        action: 'IMPORT_DATA',
        entity_type: 'database',
        entity_id: 'full_restore',
        description: 'Memulihkan data kas dari berkas cadangan (JSON)'
      });

      this.notify();
      return { success: true, message: 'Data kas berhasil dipulihkan sepenuhnya.' };
    } catch (e: any) {
      return { success: false, message: `Gagal membaca berkas: ${e?.message || 'Format tidak dikenali'}` };
    }
  }

  // Reset to initial seed data
  public resetToDefaultSeed(): void {
    this.state = getInitialSeedData();
    this.notify();
  }
}

export const db = new DatabaseManager();
