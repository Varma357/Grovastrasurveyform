-- =========================================================
-- GROVASTRA SAREE SHOP SURVEY ANALYTICS PLATFORM
-- SUPABASE POSTGRESQL MASTER DDL SCHEMA & SEED DATA
-- =========================================================

-- 1. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
  id TEXT PRIMARY KEY,
  shop_code TEXT UNIQUE NOT NULL,
  shop_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_number TEXT DEFAULT '',
  shop_type TEXT DEFAULT 'Saree Retail',
  staff_count INT DEFAULT 1,
  years_in_business INT DEFAULT 1,
  online_presence TEXT[] DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INTERVIEWERS TABLE
CREATE TABLE IF NOT EXISTS public.interviewers (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SURVEY VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.survey_versions (
  id TEXT PRIMARY KEY,
  version_name TEXT NOT NULL,
  version_number TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
  id TEXT PRIMARY KEY,
  interview_code TEXT UNIQUE NOT NULL,
  shop_id TEXT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  interviewer_id TEXT,
  survey_version_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INT DEFAULT 15,
  main_completed BOOLEAN DEFAULT FALSE,
  optional_completed BOOLEAN DEFAULT FALSE,
  optional_declined BOOLEAN DEFAULT FALSE,
  further_questions_allowed BOOLEAN DEFAULT FALSE,
  quick_followup BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft',
  overall_score NUMERIC DEFAULT 0,
  verdict TEXT,
  is_walkin BOOLEAN DEFAULT TRUE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  category_code TEXT UNIQUE NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  display_order INT NOT NULL
);

-- 6. FEATURES TABLE
CREATE TABLE IF NOT EXISTS public.features (
  id TEXT PRIMARY KEY,
  feature_code TEXT UNIQUE NOT NULL,
  feature_name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  category_code TEXT,
  description TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- 7. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  question_code TEXT UNIQUE NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('Main', 'Optional')),
  question_text TEXT NOT NULL,
  display_order INT NOT NULL,
  priority INT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  feature_id TEXT REFERENCES public.features(id) ON DELETE SET NULL,
  trigger_rule JSONB,
  category_code TEXT,
  feature_code TEXT
);

-- 8. QUESTION OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.question_options (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_label TEXT NOT NULL,
  score NUMERIC,
  display_order INT NOT NULL
);

-- 9. RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.responses (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_id TEXT,
  answer_text TEXT,
  score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FEATURE INTEREST TABLE
CREATE TABLE IF NOT EXISTS public.feature_interest (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  interest_level TEXT,
  priority_rank INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAIN POINTS TABLE
CREATE TABLE IF NOT EXISTS public.pain_points (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  pain_type TEXT,
  severity INT,
  frequency TEXT,
  impact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PURCHASE INTENT TABLE
CREATE TABLE IF NOT EXISTS public.purchase_intent (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  interest_level TEXT,
  readiness_level TEXT,
  price_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SHOP PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.shop_photos (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  interview_id TEXT NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  storage_path TEXT,
  photo_url TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CATEGORY SCORES TABLE
CREATE TABLE IF NOT EXISTS public.category_scores (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  total_score NUMERIC NOT NULL,
  maximum_score NUMERIC NOT NULL,
  percentage NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- CREATE INDEXES FOR FAST PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_shops_code ON public.shops(shop_code);
CREATE INDEX IF NOT EXISTS idx_interviews_code ON public.interviews(interview_code);
CREATE INDEX IF NOT EXISTS idx_interviews_shop_id ON public.interviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_responses_interview_id ON public.responses(interview_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.responses(question_id);
CREATE INDEX IF NOT EXISTS idx_category_scores_interview_id ON public.category_scores(interview_id);
CREATE INDEX IF NOT EXISTS idx_purchase_intent_interview_id ON public.purchase_intent(interview_id);
CREATE INDEX IF NOT EXISTS idx_shop_photos_interview_id ON public.shop_photos(interview_id);

-- =========================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- =========================================================
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_intent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- CREATE RLS POLICIES FOR ANONYMOUS & SERVICE ROLE ACCESS
-- =========================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'shops', 'interviewers', 'survey_versions', 'interviews',
    'categories', 'features', 'questions', 'question_options',
    'responses', 'feature_interest', 'pain_points', 'purchase_intent',
    'shop_photos', 'category_scores', 'audit_logs'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public select policy" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Public select policy" ON public.%I FOR SELECT USING (true)', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "Public insert policy" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Public insert policy" ON public.%I FOR INSERT WITH CHECK (true)', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "Public update policy" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Public update policy" ON public.%I FOR UPDATE USING (true)', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "Public delete policy" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Public delete policy" ON public.%I FOR DELETE USING (true)', t);
  END LOOP;
END $$;
