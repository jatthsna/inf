-- ==============================================================================
-- KAS INFORMATIKA - ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures data privacy, role-based protection, and multi-tenant security
-- ==============================================================================

-- Helper function to check if the current auth user is an Admin or Treasurer
CREATE OR REPLACE FUNCTION is_admin_or_treasurer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'treasurer')
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get the current profile id
CREATE OR REPLACE FUNCTION get_current_profile_id()
RETURNS UUID AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT id INTO v_profile_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
  RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES POLICIES
-- Students can read their own profile; Admins can read/write all profiles
CREATE POLICY "Profiles read policy"
ON profiles FOR SELECT
USING (
  auth.uid() = auth_user_id OR is_admin_or_treasurer()
);

CREATE POLICY "Profiles update policy"
ON profiles FOR UPDATE
USING (
  auth.uid() = auth_user_id OR is_admin_or_treasurer()
);

CREATE POLICY "Profiles insert policy"
ON profiles FOR INSERT
WITH CHECK (
  is_admin_or_treasurer() OR auth.uid() = auth_user_id
);

-- 3. ACADEMIC YEARS POLICIES
-- Everyone can read academic years; Only admins can insert/update
CREATE POLICY "Academic years read policy"
ON academic_years FOR SELECT
USING (true);

CREATE POLICY "Academic years admin write"
ON academic_years FOR ALL
USING (is_admin_or_treasurer());

-- 4. CLASSES POLICIES
CREATE POLICY "Classes read policy"
ON classes FOR SELECT
USING (true);

CREATE POLICY "Classes admin write"
ON classes FOR ALL
USING (is_admin_or_treasurer());

-- 5. PAYMENT LINKS POLICIES
CREATE POLICY "Payment links read policy"
ON payment_links FOR SELECT
USING (is_active = true OR is_admin_or_treasurer());

CREATE POLICY "Payment links admin write"
ON payment_links FOR ALL
USING (is_admin_or_treasurer());

-- 6. BILLS POLICIES
CREATE POLICY "Bills read policy"
ON bills FOR SELECT
USING (true);

CREATE POLICY "Bills admin write"
ON bills FOR ALL
USING (is_admin_or_treasurer());

-- 7. BILL ASSIGNMENTS POLICIES
-- Students can see their own bill assignments; Admins see all
CREATE POLICY "Bill assignments read policy"
ON bill_assignments FOR SELECT
USING (
  student_id = get_current_profile_id() OR is_admin_or_treasurer()
);

CREATE POLICY "Bill assignments admin write"
ON bill_assignments FOR ALL
USING (is_admin_or_treasurer());

-- 8. PAYMENTS POLICIES
-- Students can read and insert payments for their own profile
CREATE POLICY "Payments read policy"
ON payments FOR SELECT
USING (
  student_id = get_current_profile_id() OR is_admin_or_treasurer()
);

CREATE POLICY "Payments student insert"
ON payments FOR INSERT
WITH CHECK (
  student_id = get_current_profile_id() OR is_admin_or_treasurer()
);

CREATE POLICY "Payments admin update"
ON payments FOR UPDATE
USING (is_admin_or_treasurer());

-- 9. EXPENSES & INCOME POLICIES
-- Everyone can read expenses for Kas Transparansi; Only admins can modify
CREATE POLICY "Expenses read policy"
ON expenses FOR SELECT
USING (true);

CREATE POLICY "Expenses admin write"
ON expenses FOR ALL
USING (is_admin_or_treasurer());

CREATE POLICY "Income read policy"
ON income_transactions FOR SELECT
USING (true);

CREATE POLICY "Income admin write"
ON income_transactions FOR ALL
USING (is_admin_or_treasurer());

-- 10. AUDIT LOGS POLICIES
-- Append-only for all system actions; Admins can read
CREATE POLICY "Audit logs read policy"
ON audit_logs FOR SELECT
USING (is_admin_or_treasurer());

CREATE POLICY "Audit logs insert policy"
ON audit_logs FOR INSERT
WITH CHECK (true);

-- 11. NOTIFICATIONS POLICIES
CREATE POLICY "Notifications read policy"
ON notifications FOR SELECT
USING (
  user_id = get_current_profile_id() 
  OR (target_role = 'all')
  OR (target_role = 'admin' AND is_admin_or_treasurer())
);

CREATE POLICY "Notifications update read state"
ON notifications FOR UPDATE
USING (user_id = get_current_profile_id() OR is_admin_or_treasurer());
