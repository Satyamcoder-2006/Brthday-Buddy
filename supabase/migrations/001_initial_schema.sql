-- ============================================
-- Birthday Buddy Database Schema v1.0
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. BIRTHDAYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.birthdays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 50),
  birthday_date DATE NOT NULL,
  relationship TEXT CHECK (relationship IN ('Friend', 'Family', 'Colleague', 'Other')),
  avatar_url TEXT,
  notes TEXT CHECK (char_length(notes) <= 200),
  notification_ids JSONB DEFAULT '[]'::jsonb, -- Store local notification IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_birthday UNIQUE (user_id, name, birthday_date)
);

CREATE TRIGGER birthdays_updated_at
BEFORE UPDATE ON public.birthdays
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_birthdays_user_id ON public.birthdays(user_id);
CREATE INDEX IF NOT EXISTS idx_birthdays_date ON public.birthdays(birthday_date);
-- Partial index for upcoming seems complex to support in all generic postgres versions without immutable functions depending on current_date, 
-- but we can index user_id and birthday_date together.
CREATE INDEX IF NOT EXISTS idx_birthdays_user_date ON public.birthdays(user_id, birthday_date);

-- ============================================
-- 3. ROW LEVEL SECURITY POLICIES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Birthdays policies
CREATE POLICY "Users can view own birthdays"
ON public.birthdays FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own birthdays"
ON public.birthdays FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own birthdays"
ON public.birthdays FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own birthdays"
ON public.birthdays FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid error on rerun
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Get upcoming birthdays with countdown API makes it easier than client side calc sometimes
-- But often client calculation is better for timezone handling. 
-- We'll keep the function as requested in the spec.

CREATE OR REPLACE FUNCTION get_upcoming_birthdays(user_uuid UUID, days_ahead INT DEFAULT 30)
RETURNS TABLE (
  id UUID,
  name TEXT,
  birthday_date DATE,
  days_until INT,
  age INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.birthday_date,
    (DATE_PART('year', AGE(
      DATE(DATE_PART('year', CURRENT_DATE) || '-' || 
           DATE_PART('month', b.birthday_date) || '-' || 
           DATE_PART('day', b.birthday_date)),
      CURRENT_DATE
    )))::INT AS days_until,
    (DATE_PART('year', CURRENT_DATE) - DATE_PART('year', b.birthday_date))::INT AS age
  FROM public.birthdays b
  WHERE b.user_id = user_uuid
  -- logic is complex here for cross-year, but kept simple as per spec 
  -- Assuming simple "dates within X days regardless of year" logic requires more complex date math
  -- The spec's logic uses constructing a date for this year and comparing.
    AND (DATE_PART('year', AGE(
      DATE(DATE_PART('year', CURRENT_DATE) || '-' || 
           DATE_PART('month', b.birthday_date) || '-' || 
           DATE_PART('day', b.birthday_date)),
      CURRENT_DATE
    )))::INT <= days_ahead
  ORDER BY days_until ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
