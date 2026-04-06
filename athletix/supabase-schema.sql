-- ═══════════════════════════════════════
--  AthletiX — Database Schema
--  Run this in Supabase SQL Editor
-- ═══════════════════════════════════════

-- 1. Trainers (one per account)
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Athletes (belong to a trainer)
CREATE TABLE athletes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'active',
  birth_date DATE,
  category TEXT,
  discipline TEXT,
  club TEXT,
  tags JSONB DEFAULT '[]',
  injury JSONB,
  wallet JSONB DEFAULT '{"balance":0,"entryRate":80,"powerPoints":0,"transactions":[],"eventLog":[]}',
  break_data JSONB,
  ended_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Notes (diary entries)
CREATE TABLE notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  athlete_name TEXT NOT NULL,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'strength',
  time TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Test Results
CREATE TABLE test_results (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  athlete_name TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  test_name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Interval Sessions
CREATE TABLE sessions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  athlete_name TEXT,
  date TIMESTAMPTZ,
  mode TEXT,
  label TEXT,
  params JSONB,
  intervals JSONB DEFAULT '[]',
  hr_drop JSONB,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Groups
CREATE TABLE groups (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  athletes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Custom Tests (trainer-defined)
CREATE TABLE custom_tests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  cat TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL
);

-- 8. Packages (wallet presets)
CREATE TABLE packages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  rate NUMERIC NOT NULL,
  description TEXT
);

-- ═══════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
--  Each trainer sees only their own data
-- ═══════════════════════════════════════

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Trainers: can read/update only own row
CREATE POLICY "Trainers own data" ON trainers
  FOR ALL USING (id = auth.uid());

-- All other tables: trainer_id must match logged-in user
CREATE POLICY "Trainer athletes" ON athletes
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainer notes" ON notes
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainer test_results" ON test_results
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainer sessions" ON sessions
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainer groups" ON groups
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainer custom_tests" ON custom_tests
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Trainer packages" ON packages
  FOR ALL USING (trainer_id = auth.uid());

-- ═══════════════════════════════════════
--  AUTO-CREATE TRAINER ON SIGNUP
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.trainers (id, email, name)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
