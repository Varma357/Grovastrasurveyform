-- =============================================================
-- GROVASTRA SUPABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor
-- =============================================================

-- 1. SHOPS
CREATE TABLE IF NOT EXISTS public.shops (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_code        TEXT NOT NULL UNIQUE,
  shop_name        TEXT NOT NULL,
  client_name      TEXT NOT NULL DEFAULT 'Valued Client',
  location         TEXT NOT NULL DEFAULT 'Andhra Pradesh',
  contact_number   TEXT DEFAULT '',
  shop_type        TEXT DEFAULT 'Saree Retail',
  staff_count      INTEGER DEFAULT 3,
  years_in_business INTEGER DEFAULT 5,
  online_presence  TEXT[] DEFAULT ARRAY['WhatsApp'],
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INTERVIEWERS
CREATE TABLE IF NOT EXISTS public.interviewers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  mobile     TEXT DEFAULT '',
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INTERVIEWS
CREATE TABLE IF NOT EXISTS public.interviews (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_code           TEXT NOT NULL UNIQUE,
  shop_id                  UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  interviewer_id           TEXT NOT NULL DEFAULT 'emp-int-01',
  started_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at             TIMESTAMPTZ,
  duration_minutes         INTEGER DEFAULT 15,
  main_completed           BOOLEAN DEFAULT FALSE,
  optional_completed       BOOLEAN DEFAULT FALSE,
  optional_declined        BOOLEAN DEFAULT FALSE,
  further_questions_allowed BOOLEAN DEFAULT FALSE,
  quick_followup           BOOLEAN DEFAULT FALSE,
  status                   TEXT NOT NULL DEFAULT 'draft',
  overall_score            INTEGER DEFAULT 0,
  verdict                  TEXT DEFAULT 'Moderate Opportunity',
  is_walkin                BOOLEAN DEFAULT TRUE,
  photo_url                TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code  TEXT NOT NULL UNIQUE,
  category_name  TEXT NOT NULL,
  description    TEXT DEFAULT '',
  active         BOOLEAN DEFAULT TRUE,
  display_order  INTEGER DEFAULT 0
);

-- 5. FEATURES
CREATE TABLE IF NOT EXISTS public.features (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code  TEXT NOT NULL UNIQUE,
  feature_name  TEXT NOT NULL,
  category_id   TEXT NOT NULL,
  description   TEXT DEFAULT '',
  active        BOOLEAN DEFAULT TRUE
);

-- 6. QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_code  TEXT NOT NULL UNIQUE,
  category_id    TEXT NOT NULL,
  feature_id     TEXT,
  question_type  TEXT NOT NULL DEFAULT 'Main',
  question_text  TEXT NOT NULL,
  display_order  INTEGER DEFAULT 0,
  priority       TEXT DEFAULT 'High',
  active         BOOLEAN DEFAULT TRUE,
  trigger_rule   JSONB,
  category_code  TEXT,
  feature_code   TEXT
);

-- 7. QUESTION OPTIONS
CREATE TABLE IF NOT EXISTS public.question_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   TEXT NOT NULL,
  option_label  TEXT NOT NULL,
  score         INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0
);

-- 8. RESPONSES
CREATE TABLE IF NOT EXISTS public.responses (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id       UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_id        TEXT NOT NULL,
  selected_option_id TEXT,
  answer_text        TEXT,
  score              INTEGER,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CATEGORY SCORES
CREATE TABLE IF NOT EXISTS public.category_scores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id   UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  category_id    TEXT NOT NULL,
  total_score    INTEGER DEFAULT 0,
  maximum_score  INTEGER DEFAULT 6,
  percentage     INTEGER DEFAULT 0,
  status         TEXT DEFAULT 'Moderate Opportunity',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PURCHASE INTENT
CREATE TABLE IF NOT EXISTS public.purchase_intent (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id     UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  interest_level   TEXT DEFAULT 'Yes, definitely interested',
  readiness_level  TEXT DEFAULT 'Yes, ready to start',
  price_range      TEXT DEFAULT '₹2,000–₹5,000/month',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SHOP PHOTOS
CREATE TABLE IF NOT EXISTS public.shop_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  storage_path TEXT DEFAULT '',
  photo_url    TEXT DEFAULT '',
  captured_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- INDEXES for performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_interviews_shop_id       ON public.interviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at    ON public.interviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_status        ON public.interviews(status);
CREATE INDEX IF NOT EXISTS idx_responses_interview_id   ON public.responses(interview_id);
CREATE INDEX IF NOT EXISTS idx_cat_scores_interview_id  ON public.category_scores(interview_id);
CREATE INDEX IF NOT EXISTS idx_purchase_intent_inv_id   ON public.purchase_intent(interview_id);
CREATE INDEX IF NOT EXISTS idx_shop_photos_interview_id ON public.shop_photos(interview_id);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE public.shops           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviewers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_intent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_photos     ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before re-creating (safe to re-run)
DROP POLICY IF EXISTS "service_role_all_shops"            ON public.shops;
DROP POLICY IF EXISTS "service_role_all_interviewers"     ON public.interviewers;
DROP POLICY IF EXISTS "service_role_all_interviews"       ON public.interviews;
DROP POLICY IF EXISTS "service_role_all_categories"       ON public.categories;
DROP POLICY IF EXISTS "service_role_all_features"         ON public.features;
DROP POLICY IF EXISTS "service_role_all_questions"        ON public.questions;
DROP POLICY IF EXISTS "service_role_all_question_options" ON public.question_options;
DROP POLICY IF EXISTS "service_role_all_responses"        ON public.responses;
DROP POLICY IF EXISTS "service_role_all_category_scores"  ON public.category_scores;
DROP POLICY IF EXISTS "service_role_all_purchase_intent"  ON public.purchase_intent;
DROP POLICY IF EXISTS "service_role_all_shop_photos"      ON public.shop_photos;

-- Allow full access via service role key (used in API routes)
CREATE POLICY "service_role_all_shops"            ON public.shops            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_interviewers"     ON public.interviewers     FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_interviews"       ON public.interviews       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_categories"       ON public.categories       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_features"         ON public.features         FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_questions"        ON public.questions        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_question_options" ON public.question_options FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_responses"        ON public.responses        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_category_scores"  ON public.category_scores  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_purchase_intent"  ON public.purchase_intent  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_shop_photos"      ON public.shop_photos      FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================
-- SEED: Default Interviewer
-- =============================================================
INSERT INTO public.interviewers (id, name, email, mobile, active)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Navadeep', 'navadeep@groviews.com', '9704917189', true)
ON CONFLICT (email) DO NOTHING;
