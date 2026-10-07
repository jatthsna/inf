export type UserRole = 'student' | 'admin' | 'treasurer';

export type UserStatus = 'active' | 'inactive' | 'graduated';

export interface UserProfile {
  id: string;
  auth_user_id?: string;
  full_name: string;
  nim: string;
  email: string;
  phone: string;
  password?: string;
  class_id?: string;
  class_name?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026/2027"
  start_date: string;
  end_date: string;
  initial_balance: number;
  is_active: boolean;
  is_archived: boolean;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "IF-2024-A"
  batch: string; // e.g. "2024"
  major: string; // "Informatika"
  is_active: boolean;
  student_count?: number;
  created_at: string;
  updated_at: string;
}

export type BillType = 'monthly' | 'event' | 'activity' | 'fine' | 'other';

export interface PaymentLink {
  id: string;
  name: string;
  description: string;
  url: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  academic_year_id: string;
  name: string;
  description?: string;
  bill_type: BillType;
  amount: number;
  period_month?: number; // 1-12 (e.g. 9 for September)
  period_year?: number;  // e.g. 2026
  due_date: string;
  payment_link_id?: string;
  payment_link_url?: string;
  is_active: boolean;
  target_type: 'all' | 'class' | 'specific';
  target_class_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type BillAssignmentStatus = 'unpaid' | 'pending' | 'verified' | 'rejected' | 'overdue';

export interface BillAssignment {
  id: string;
  bill_id: string;
  student_id: string;
  created_at: string;
  // Computed properties
  bill?: Bill;
  student?: UserProfile;
  latest_payment?: Payment;
  status?: BillAssignmentStatus;
}

export type PaymentMethod = 'online' | 'cash';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface Payment {
  id: string;
  bill_id: string;
  student_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  proof_url?: string;
  status: PaymentStatus;
  student_note?: string;
  admin_note?: string;
  received_by?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  // Joins
  student?: UserProfile;
  bill?: Bill;
}

export type ExpenseCategory = 
  | 'Kegiatan' 
  | 'Konsumsi' 
  | 'Perlengkapan' 
  | 'Transportasi' 
  | 'Administrasi' 
  | 'Dokumentasi' 
  | 'Lainnya';

export interface Expense {
  id: string;
  academic_year_id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  proof_url?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeTransaction {
  id: string;
  academic_year_id: string;
  source_name: string; // e.g. "Donasi Alumni", "Sponsor Hackathon"
  category: 'Donasi' | 'Sponsorship' | 'Dana Usaha' | 'Pengembalian' | 'Lainnya';
  amount: number;
  received_date: string;
  notes?: string;
  received_by?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  description: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id?: string; // null for broadcast or specific student ID
  target_role?: 'all' | 'admin' | 'student';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface AppSettings {
  id: string;
  department_name: string;
  faculty_name?: string;
  university_name?: string;
  class_name: string;
  korlas_name?: string; // Koordinator Kelas (default: Adam Satrol)
  academic_year_id: string;
  default_monthly_amount: number;
  contact_person_name: string;
  contact_person_phone: string;
  lynk_default_url: string;
  enable_email_notifications: boolean;
  app_logo_url?: string;
  updated_at: string;
}

export interface FinancialSummary {
  academic_year_id: string;
  initial_balance: number;
  total_verified_income: number;
  total_cash_income: number;
  total_online_income: number;
  total_other_income: number;
  total_expenses: number;
  current_balance: number;
  total_bills_amount: number;
  total_paid_bills_amount: number;
  total_arrears_amount: number;
  pending_payments_count: number;
  verified_payments_count: number;
  rejected_payments_count: number;
}
