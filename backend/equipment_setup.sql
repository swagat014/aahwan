-- ====================================================================
-- AWAHAAN 2026 - SPORTS FESTIVAL EQUIPMENT & ISSUE/RETURN SETUP SCRIPT
-- ====================================================================
-- Run this script in your Supabase SQL Editor:
-- 1. Go to https://app.supabase.com -> Select your project (ioyvfigbxyoexyqcaxsj)
-- 2. Click "SQL Editor" in the left menu
-- 3. Click "New Query", paste this entire script, and click "Run" (Ctrl+Enter)
-- ====================================================================

-- Ensure required UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. CREATE PUBLIC.EQUIPMENT TABLE (Stock Inventory)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.equipment (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    total_qty INT NOT NULL DEFAULT 1,
    condition TEXT DEFAULT 'Good Condition',
    location TEXT DEFAULT 'Main Sports Store',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure table columns exist if created previously with different schema
DO $$
BEGIN
    ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS total_qty INT NOT NULL DEFAULT 1;
    ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Good Condition';
    ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Main Sports Store';
    ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
END $$;

-- --------------------------------------------------------------------
-- 2. CREATE PUBLIC.EQUIPMENT_LOGS TABLE (Issue & Return Register)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.equipment_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    equipment_id TEXT NOT NULL,
    equipment_name TEXT NOT NULL,
    category TEXT,
    borrower_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    branch TEXT NOT NULL,
    borrower_phone TEXT,
    qty INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'issued',
    issue_date TEXT NOT NULL,
    issue_timestamp TIMESTAMPTZ DEFAULT NOW(),
    expected_return TEXT,
    expected_return_timestamp TIMESTAMPTZ,
    returned_count INT DEFAULT 0,
    return_date TEXT,
    return_timestamp TIMESTAMPTZ,
    return_condition TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure table columns exist if created previously
DO $$
BEGIN
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS equipment_id TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS equipment_name TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS category TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS borrower_name TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS roll_no TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS branch TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS borrower_phone TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS qty INT NOT NULL DEFAULT 1;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'issued';
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS issue_date TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS issue_timestamp TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS expected_return TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS expected_return_timestamp TIMESTAMPTZ;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS returned_count INT DEFAULT 0;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS return_date TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS return_timestamp TIMESTAMPTZ;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS return_condition TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE public.equipment_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
END $$;

-- --------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_logs ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if any to avoid duplicates
DROP POLICY IF EXISTS "Public access equipment" ON public.equipment;
DROP POLICY IF EXISTS "Public access equipment_logs" ON public.equipment_logs;
DROP POLICY IF EXISTS "Public access public equipment" ON public.equipment;
DROP POLICY IF EXISTS "Public access public equipment_logs" ON public.equipment_logs;

-- Allow full public read/write access for seamless frontend & admin panel sync
CREATE POLICY "Public access equipment" 
ON public.equipment 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Public access equipment_logs" 
ON public.equipment_logs 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- --------------------------------------------------------------------
-- 4. REALTIME PUBLICATION SUBSCRIPTION
-- --------------------------------------------------------------------
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment_logs;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- --------------------------------------------------------------------
-- 5. INITIAL SEED DATA (Populate default inventory if empty)
-- --------------------------------------------------------------------
INSERT INTO public.equipment (id, name, category, total_qty, condition, location, notes)
VALUES
    ('eq-1', 'Cricket Tournament Bats', 'Cricket', 12, 'Good Condition', 'Main Sports Store', 'SS English Willow'),
    ('eq-2', 'Cricket Leather Balls', 'Cricket', 30, 'New Pack', 'Store Box 2', 'SG Red Leather'),
    ('eq-3', 'Match Footballs (Nivia)', 'Football', 15, 'Good Condition', 'Main Sports Store', 'Size 5 Match Balls'),
    ('eq-4', 'Volleyballs (Mikasa)', 'Volleyball', 10, 'Good Condition', 'Store Box 1', 'Tournament Approved'),
    ('eq-5', 'Badminton Rackets', 'Badminton', 16, 'Good Condition', 'Indoor Store', 'Yonex Graphite'),
    ('eq-6', 'Mavis 350 Shuttlecocks', 'Badminton', 40, 'New Pack', 'Indoor Store', 'Nylon Shuttles'),
    ('eq-7', 'Chess Wooden Sets', 'Indoor Games', 8, 'Good Condition', 'Indoor Hall', 'Tournament Boards')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    total_qty = EXCLUDED.total_qty,
    condition = EXCLUDED.condition,
    location = EXCLUDED.location,
    notes = EXCLUDED.notes;

INSERT INTO public.equipment_logs (id, equipment_id, equipment_name, category, borrower_name, roll_no, branch, borrower_phone, qty, status, issue_date, expected_return, return_date, return_condition, notes)
VALUES
    ('iss-101', 'eq-1', 'Cricket Tournament Bats', 'Cricket', 'Swagat Parida', '2201105012', 'CSE', '9876543210', 2, 'issued', '30 Aug 2026, 09:30 AM', '30 Aug 2026, 05:30 PM', NULL, NULL, 'Inter-branch practice session'),
    ('iss-102', 'eq-3', 'Match Footballs (Nivia)', 'Football', 'Priyanka Sahoo', '2201105045', 'EE', '9876543211', 1, 'returned', '29 Aug 2026, 02:00 PM', '29 Aug 2026, 05:00 PM', '29 Aug 2026, 05:30 PM', 'Good Condition', 'Girls Football semi-finals')
ON CONFLICT (id) DO UPDATE SET
    equipment_id = EXCLUDED.equipment_id,
    equipment_name = EXCLUDED.equipment_name,
    status = EXCLUDED.status,
    qty = EXCLUDED.qty;

-- Confirm execution
SELECT 'Equipment and Equipment Logs tables created successfully with Realtime and RLS enabled!' AS status;
