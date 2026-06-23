/**
 * ═══════════════════════════════════════════════════════════════
 * INSIGHTAI — COMPLETE SUPABASE DATABASE SCHEMA
 * ═══════════════════════════════════════════════════════════════
 * 
 * Execute this in your Supabase SQL Editor.
 * 
 * DATABASE RELATIONSHIPS:
 * ─────────────────────────────────────────────
 * user_profiles (1) ──→ (N) customer_feedback_analysis
 * customer_feedback_analysis (1) ──→ (N) sentiment_intent_labels
 * customer_feedback_analysis (1) ──→ (0..1) insight_logs
 * user_profiles (1) ──→ (N) insight_logs (as analyst)
 * user_profiles (1) ──→ (1) user_settings
 * 
 * ROW LEVEL SECURITY:
 * - Users can only read their own analysis
 * - Users can only insert analysis for themselves
 * - Service role bypasses RLS for admin operations
 */

-- ═══════════════════════════════════════════════════════════
-- 1. USER PROFILES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  organization_name TEXT,
  department TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'analyst', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════
-- 2. CUSTOMER FEEDBACK ANALYSIS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS customer_feedback_analysis (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_text TEXT NOT NULL,
  cleaned_text TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_score FLOAT CHECK (sentiment_score >= 0 AND sentiment_score <= 1),
  primary_intent TEXT,
  intent_confidence FLOAT,
  extracted_topics JSONB DEFAULT '[]',
  keywords JSONB DEFAULT '[]',
  discourse_summary TEXT,
  insight_action TEXT CHECK (insight_action IN ('MONITOR', 'ESCALATE', 'ENGAGE')),
  processing_latency INTEGER,
  analysis_timestamp TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════
-- 3. SENTIMENT INTENT LABELS (Multi-label junction table)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sentiment_intent_labels (
  id BIGSERIAL PRIMARY KEY,
  analysis_id BIGINT REFERENCES customer_feedback_analysis(id) ON DELETE CASCADE,
  label_type TEXT CHECK (label_type IN ('sentiment', 'intent')),
  label_name TEXT NOT NULL,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1)
);


-- ═══════════════════════════════════════════════════════════
-- 4. ANALYTICS SNAPSHOTS (Daily aggregations)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date DATE DEFAULT CURRENT_DATE UNIQUE,
  total_requests INTEGER DEFAULT 0,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  intent_distribution JSONB DEFAULT '{}',
  avg_latency FLOAT,
  avg_satisfaction_score FLOAT
);


-- ═══════════════════════════════════════════════════════════
-- 5. INSIGHT LOGS (Human feedback correction trail)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS insight_logs (
  id BIGSERIAL PRIMARY KEY,
  analysis_id BIGINT REFERENCES customer_feedback_analysis(id),
  analyst_id UUID REFERENCES auth.users(id),
  original_sentiment TEXT,
  corrected_sentiment TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════
-- 6. MODEL METRICS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS model_metrics (
  id BIGSERIAL PRIMARY KEY,
  model_version TEXT NOT NULL,
  accuracy FLOAT,
  precision_score FLOAT,
  recall FLOAT,
  f1_score FLOAT,
  total_inferences INTEGER DEFAULT 0,
  avg_latency_ms FLOAT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════
-- 7. USER SETTINGS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  email_notifications BOOLEAN DEFAULT true,
  analysis_depth TEXT DEFAULT 'standard' CHECK (analysis_depth IN ('basic', 'standard', 'deep')),
  negative_alert_threshold INTEGER DEFAULT 75 CHECK (negative_alert_threshold >= 0 AND negative_alert_threshold <= 100),
  churn_risk_threshold INTEGER DEFAULT 40 CHECK (churn_risk_threshold >= 0 AND churn_risk_threshold <= 100),
  custom_rules JSONB DEFAULT '{}'
);


-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_intent_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users read their own profile
DROP POLICY IF EXISTS "Users read own profile" ON user_profiles;
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Analysis: Users see their own analysis
DROP POLICY IF EXISTS "Users read own analysis" ON customer_feedback_analysis;
CREATE POLICY "Users read own analysis" ON customer_feedback_analysis
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own analysis" ON customer_feedback_analysis;
CREATE POLICY "Users create own analysis" ON customer_feedback_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Labels: Readable if user owns parent analysis
DROP POLICY IF EXISTS "Users read own labels" ON sentiment_intent_labels;
CREATE POLICY "Users read own labels" ON sentiment_intent_labels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customer_feedback_analysis
      WHERE customer_feedback_analysis.id = sentiment_intent_labels.analysis_id
      AND customer_feedback_analysis.user_id = auth.uid()
    )
  );

-- Settings: Users manage own settings
DROP POLICY IF EXISTS "Users manage own settings" ON user_settings;
CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Insight logs: Analysts can view and create
DROP POLICY IF EXISTS "Analysts read logs" ON insight_logs;
CREATE POLICY "Analysts read logs" ON insight_logs
  FOR SELECT USING (auth.uid() = analyst_id);

DROP POLICY IF EXISTS "Analysts create logs" ON insight_logs;
CREATE POLICY "Analysts create logs" ON insight_logs
  FOR INSERT WITH CHECK (auth.uid() = analyst_id);


-- ═══════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON customer_feedback_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_timestamp ON customer_feedback_analysis(analysis_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_sentiment ON customer_feedback_analysis(sentiment);
CREATE INDEX IF NOT EXISTS idx_analysis_intent ON customer_feedback_analysis(primary_intent);
CREATE INDEX IF NOT EXISTS idx_labels_analysis_id ON sentiment_intent_labels(analysis_id);
CREATE INDEX IF NOT EXISTS idx_labels_name ON sentiment_intent_labels(label_name);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_insightlogs_analysis ON insight_logs(analysis_id);
CREATE INDEX IF NOT EXISTS idx_model_metrics_version ON model_metrics(model_version);
