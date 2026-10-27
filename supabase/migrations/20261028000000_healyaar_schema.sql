-- =============================================================================
-- HealYaar Healthcare Platform — Core Database Schema & RLS Policies
-- Migration: 20261028000000_healyaar_schema.sql
-- =============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. PROFILES TABLE (Linked directly to auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Automatic trigger to create profile when auth.users signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. USER PREFERENCES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light',
  text_size TEXT NOT NULL DEFAULT 'normal',
  language TEXT NOT NULL DEFAULT 'en',
  high_contrast BOOLEAN NOT NULL DEFAULT false,
  typical_cycle_length INT NOT NULL DEFAULT 28,
  typical_period_duration INT NOT NULL DEFAULT 5,
  last_period_start DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 3. PERIOD TRACKER CYCLES & LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.period_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length_days INT NOT NULL DEFAULT 28,
  period_duration_days INT NOT NULL DEFAULT 5,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  flow_intensity TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_period_cycles_user ON public.period_cycles(user_id, start_date DESC);

ALTER TABLE public.period_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own period cycles"
  ON public.period_cycles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own period cycles"
  ON public.period_cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own period cycles"
  ON public.period_cycles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own period cycles"
  ON public.period_cycles FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 4. MEDICAL REPORTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_formatted TEXT,
  file_url TEXT,
  file_path TEXT,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  summary TEXT NOT NULL,
  key_findings TEXT[] NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  things_to_discuss TEXT[] NOT NULL DEFAULT '{}',
  disclaimer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_reports_user ON public.medical_reports(user_id, upload_date DESC);

ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medical reports"
  ON public.medical_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical reports"
  ON public.medical_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical reports"
  ON public.medical_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical reports"
  ON public.medical_reports FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 5. PRESCRIPTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT,
  doctor_qualification TEXT,
  clinic_name TEXT,
  patient_name TEXT,
  date DATE DEFAULT CURRENT_DATE,
  diagnosis_summary TEXT,
  general_advice TEXT,
  image_url TEXT,
  image_path TEXT,
  medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON public.prescriptions(user_id, created_at DESC);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions"
  ON public.prescriptions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 6. MEDICATION REMINDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'medicine',
  time TEXT NOT NULL, -- e.g. "08:00"
  repeat_days TEXT[] NOT NULL DEFAULT '{"Mon","Tue","Wed","Thu","Fri","Sat","Sun"}',
  instructions TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON public.medication_reminders(user_id, active);

ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
  ON public.medication_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON public.medication_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON public.medication_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON public.medication_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 7. FOOD & NUTRITION ANALYSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.food_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  image_url TEXT,
  image_path TEXT,
  estimated_portion TEXT,
  nutrients JSONB NOT NULL,
  detected_ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  uncertainty_notes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_analyses_user ON public.food_analyses(user_id, created_at DESC);

ALTER TABLE public.food_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own food analyses"
  ON public.food_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food analyses"
  ON public.food_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food analyses"
  ON public.food_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 8. STORAGE BUCKETS CONFIGURATION (Private & Secure)
-- =============================================================================
-- Insert storage buckets if storage schema exists
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('medical-reports', 'medical-reports', false),
  ('prescriptions', 'prescriptions', false),
  ('food-images', 'food-images', false),
  ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can only upload and access files in their own user_id directory
CREATE POLICY "Users access own medical reports storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users access own prescriptions storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users access own food images storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'food-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'food-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users access own avatar storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =============================================================================
-- 9. HELPER TRIGGER FUNCTION FOR UPDATED_AT
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_period_cycles_updated_at BEFORE UPDATE ON public.period_cycles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_medical_reports_updated_at BEFORE UPDATE ON public.medical_reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_reminders_updated_at BEFORE UPDATE ON public.medication_reminders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_food_analyses_updated_at BEFORE UPDATE ON public.food_analyses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
