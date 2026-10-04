-- ==============================================================================
-- KAS INFORMATIKA - SAFE INCREMENTAL MIGRATION
-- Run this if upgrading or syncing an existing schema
-- ==============================================================================

DO $$
BEGIN
    -- Ensure UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create tables if not exists
    -- (Identical to schema.sql with IF NOT EXISTS checks)
    CREATE TABLE IF NOT EXISTS academic_years (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(20) NOT NULL UNIQUE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (initial_balance >= 0),
        is_active BOOLEAN NOT NULL DEFAULT false,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        notes TEXT,
        created_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) NOT NULL UNIQUE,
        batch VARCHAR(10) NOT NULL,
        major VARCHAR(100) NOT NULL DEFAULT 'Teknik Informatika',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        auth_user_id UUID,
        full_name VARCHAR(150) NOT NULL,
        nim VARCHAR(25) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(25) NOT NULL,
        class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'treasurer')),
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_links (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bills (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        bill_type VARCHAR(20) NOT NULL CHECK (bill_type IN ('monthly', 'event', 'activity', 'fine', 'other')),
        amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
        period_month INT CHECK (period_month BETWEEN 1 AND 12),
        period_year INT,
        due_date DATE NOT NULL,
        payment_link_id UUID REFERENCES payment_links(id) ON DELETE SET NULL,
        target_type VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'class', 'specific')),
        target_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bill_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(bill_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE RESTRICT,
        student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
        amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('online', 'cash')),
        payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        proof_url TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
        student_note TEXT,
        admin_note TEXT,
        received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        verified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
        description VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
        expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
        proof_url TEXT,
        notes TEXT,
        created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS income_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
        source_name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
        received_date DATE NOT NULL DEFAULT CURRENT_DATE,
        notes TEXT,
        received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        old_data JSONB,
        new_data JSONB,
        description TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        target_role VARCHAR(20) DEFAULT 'all',
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'info',
        link_url TEXT,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS app_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        department_name VARCHAR(150) NOT NULL DEFAULT 'Program Studi Teknik Informatika',
        class_name VARCHAR(100) NOT NULL DEFAULT 'Informatika 2024',
        academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
        default_monthly_amount NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
        contact_person_name VARCHAR(100) DEFAULT 'Bendahara Kelas',
        contact_person_phone VARCHAR(50) DEFAULT '+62 812-3456-7890',
        lynk_default_url TEXT DEFAULT 'https://lynk.id/kas-informatika',
        enable_email_notifications BOOLEAN DEFAULT true,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
END $$;
