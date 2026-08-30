-- ====================================================================
-- AWAHAAN ANNUAL SPORTS FESTIVAL - DEDICATED SUPABASE SCHEMA & BACKEND
-- ====================================================================
-- Target Database: Supabase PostgreSQL
-- Organization: Government College of Engineering, Kalahandi (GCEK)
-- ====================================================================

-- 1. CREATE DEDICATED AWAHAAN DATABASE SCHEMA / NAMESPACE
CREATE SCHEMA IF NOT EXISTS awahaan;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant API permissions to the awahaan schema
GRANT USAGE ON SCHEMA awahaan TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA awahaan TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA awahaan TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA awahaan GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA awahaan GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- --------------------------------------------------------------------
-- 2. SITE CONFIGURATION TABLE (Inside awahaan schema & public backup)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS awahaan.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_config',
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_config',
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. SPORTS LIST TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS awahaan.sports (
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
CREATE TABLE IF NOT EXISTS awahaan.dignitaries (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    designation TEXT,
    image TEXT,
    tier TEXT NOT NULL CHECK (tier IN ('leadership', 'patrons', 'coordinators')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
CREATE TABLE IF NOT EXISTS awahaan.schedule (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    day INT NOT NULL DEFAULT 1,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming',
    status_label TEXT DEFAULT 'Upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
CREATE TABLE IF NOT EXISTS awahaan.leaderboard (
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
CREATE TABLE IF NOT EXISTS awahaan.gallery (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT,
    category TEXT DEFAULT 'Highlights',
    image TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
CREATE TABLE IF NOT EXISTS awahaan.registrations (
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
-- ROW LEVEL SECURITY (RLS) & POLICIES FOR BOTH SCHEMAS
-- ====================================================================

ALTER TABLE awahaan.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE awahaan.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE awahaan.dignitaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE awahaan.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE awahaan.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE awahaan.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE awahaan.registrations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dignitaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Grant Full Read/Write Policies
CREATE POLICY "Public access awahaan site_settings" ON awahaan.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access awahaan sports" ON awahaan.sports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access awahaan dignitaries" ON awahaan.dignitaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access awahaan schedule" ON awahaan.schedule FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access awahaan leaderboard" ON awahaan.leaderboard FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access awahaan gallery" ON awahaan.gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access awahaan registrations" ON awahaan.registrations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access public site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access public sports" ON public.sports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access public dignitaries" ON public.dignitaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access public schedule" ON public.schedule FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access public leaderboard" ON public.leaderboard FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access public gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access public registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for site_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;

-- --------------------------------------------------------------------
-- 9. CREATE AWAHAAN STORAGE BUCKET FOR MEDIA UPLOADS
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('AWAHAAN', 'AWAHAAN', true)
ON CONFLICT (id) DO NOTHING;

-- Grant Storage Policies
CREATE POLICY "Public Read Access AWAHAAN Bucket" 
ON storage.objects FOR SELECT USING (bucket_id = 'AWAHAAN');

CREATE POLICY "Public Upload Access AWAHAAN Bucket" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'AWAHAAN');

-- ====================================================================
-- INITIAL SEED DATA
-- ====================================================================

INSERT INTO awahaan.site_settings (id, config) 
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

INSERT INTO awahaan.leaderboard (branch_code, branch_name, ath_gold, ath_silver, ath_bronze, team_gold, team_silver, team_bronze, total_points)
VALUES 
    ('CSE', 'Computer Science & Engg', 5, 2, 1, 2, 1, 0, 48),
    ('EE', 'Electrical Engineering', 3, 3, 2, 1, 1, 0, 34),
    ('ME', 'Mechanical Engineering', 2, 3, 1, 1, 1, 0, 29),
    ('CE', 'Civil Engineering', 1, 2, 3, 0, 1, 0, 16)
ON CONFLICT (branch_code) DO NOTHING;

INSERT INTO public.leaderboard (branch_code, branch_name, ath_gold, ath_silver, ath_bronze, team_gold, team_silver, team_bronze, total_points)
VALUES 
    ('CSE', 'Computer Science & Engg', 5, 2, 1, 2, 1, 0, 48),
    ('EE', 'Electrical Engineering', 3, 3, 2, 1, 1, 0, 34),
    ('ME', 'Mechanical Engineering', 2, 3, 1, 1, 1, 0, 29),
    ('CE', 'Civil Engineering', 1, 2, 3, 0, 1, 0, 16)
ON CONFLICT (branch_code) DO NOTHING;
