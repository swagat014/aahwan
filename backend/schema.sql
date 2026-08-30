-- ====================================================================
-- AWAHAAN ANNUAL SPORTS FESTIVAL - COMPLETE SUPABASE DATABASE SCHEMA
-- ====================================================================
-- Target Database: Supabase PostgreSQL
-- Organization: Government College of Engineering, Kalahandi (GCEK)
-- ====================================================================

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. SITE CONFIGURATION TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_config',
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. SPORTS LIST TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('athletics', 'team', 'indoor')),
    icon TEXT,
    time TEXT,
    location TEXT,
    rules TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 4. DIGNITARIES & PATRONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dignitaries (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    designation TEXT,
    image TEXT,
    tier TEXT NOT NULL CHECK (tier IN ('leadership', 'patrons', 'coordinators')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. SCHEDULE & FIXTURES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedule (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    day INT NOT NULL DEFAULT 1,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming',
    status_label TEXT DEFAULT 'Upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. LEADERBOARD & BRANCH STANDINGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leaderboard (
    branch_code TEXT PRIMARY KEY,
    branch_name TEXT NOT NULL,
    ath_gold INT DEFAULT 0,
    ath_silver INT DEFAULT 0,
    ath_bronze INT DEFAULT 0,
    team_gold INT DEFAULT 0,
    team_silver INT DEFAULT 0,
    team_bronze INT DEFAULT 0,
    total_points INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 7. PHOTO GALLERY TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT,
    category TEXT DEFAULT 'Highlights',
    image TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 8. STUDENT REGISTRATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    roll_no TEXT NOT NULL,
    name TEXT NOT NULL,
    branch TEXT NOT NULL,
    year TEXT NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    events JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
-- ====================================================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dignitaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public access to sports" ON public.sports;
DROP POLICY IF EXISTS "Public access to dignitaries" ON public.dignitaries;
DROP POLICY IF EXISTS "Public access to schedule" ON public.schedule;
DROP POLICY IF EXISTS "Public access to leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Public access to gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public access to registrations" ON public.registrations;

-- Grant Full Public Read/Write Access
CREATE POLICY "Public access to site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to sports" ON public.sports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to dignitaries" ON public.dignitaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to schedule" ON public.schedule FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to leaderboard" ON public.leaderboard FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for site_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;

-- ====================================================================
-- INITIAL SEED DATA
-- ====================================================================

INSERT INTO public.site_settings (id, config) 
VALUES (
    'global_config',
    '{
      "year": "2026",
      "festivalName": "AAHWAN",
      "collegeName": "GOVERNMENT COLLEGE OF ENGINEERING",
      "collegeLocation": "KALAHANDI",
      "helplinePhone": "+91 6765 220011",
      "helplineEmail": "sports@gcekbpatna.ac.in",
      "statSportsCount": "20+",
      "statAthletesCount": "800+",
      "statStreamsCount": "4",
      "statDaysCount": "3"
    }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config, updated_at = NOW();

INSERT INTO public.leaderboard (branch_code, branch_name, ath_gold, ath_silver, ath_bronze, team_gold, team_silver, team_bronze, total_points)
VALUES 
    ('CSE', 'Computer Science & Engg', 5, 2, 1, 2, 1, 0, 48),
    ('EE', 'Electrical Engineering', 3, 3, 2, 1, 1, 0, 34),
    ('ME', 'Mechanical Engineering', 2, 3, 1, 1, 1, 0, 29),
    ('CE', 'Civil Engineering', 1, 2, 3, 0, 1, 0, 16)
ON CONFLICT (branch_code) DO NOTHING;
