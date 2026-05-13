/**
 * ═══════════════════════════════════════════════════════════════
 * MODERATO-BERT — COMPLETE SUPABASE DATABASE SCHEMA
 * ═══════════════════════════════════════════════════════════════
 * 
 * Execute this in your Supabase SQL Editor.
 * 
 * DATABASE RELATIONSHIPS:
 * ─────────────────────────────────────────────
 * user_profiles (1) ──→ (N) comment_predictions
 * comment_predictions (1) ──→ (N) prediction_labels
 * comment_predictions (1) ──→ (0..1) moderation_logs
 * user_profiles (1) ──→ (N) moderation_logs (as moderator)
 * user_profiles (1) ──→ (1) user_settings
 * 
 * INDEXING STRATEGY:
 * - user_id on predictions for user-scoped queries
 * - created_at on predictions for time-range analytics
 * - prediction_id on labels for JOIN performance
 * - snapshot_date on analytics for daily lookups
 * 
 * ROW LEVEL SECURITY:
 * - Users can only read their own predictions
 * - Users can only insert predictions for themselves
 * - Service role bypasses RLS for admin operations
 */

-- ═══════════════════════════════════════════════════════════
-- 1. USER PROFILES (Extends Supabase Auth)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  organization_name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'moderator', 'viewer')),
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════
-- 2. COMMENT PREDICTIONS (Main inference results)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS comment_predictions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  original_text TEXT NOT NULL,
  cleaned_text TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  action TEXT CHECK (action IN ('ALLOW', 'FLAG', 'BLOCK')),
  latency_ms INTEGER,
  scores JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════
-- 3. PREDICTION LABELS (Multi-label junction table)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS prediction_labels (
  id BIGSERIAL PRIMARY KEY,
  prediction_id BIGINT REFERENCES comment_predictions(id) ON DELETE CASCADE,
  label_name TEXT NOT NULL CHECK (label_name IN (
    'toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate'
  )),
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1)
);


-- ═══════════════════════════════════════════════════════════
-- 4. ANALYTICS SNAPSHOTS (Daily aggregations)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date DATE DEFAULT CURRENT_DATE UNIQUE,
  total_requests INTEGER DEFAULT 0,
  blocked_requests INTEGER DEFAULT 0,
  flagged_requests INTEGER DEFAULT 0,
  allowed_requests INTEGER DEFAULT 0,
  avg_latency FLOAT,
  label_distribution JSONB DEFAULT '{}'
);


-- ═══════════════════════════════════════════════════════════
-- 5. MODERATION LOGS (Human override audit trail)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS moderation_logs (
  id BIGSERIAL PRIMARY KEY,
  prediction_id BIGINT REFERENCES comment_predictions(id),
  moderator_id UUID REFERENCES auth.users(id),
  original_action TEXT,
  new_action TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════
-- 6. MODEL METRICS (BERT performance tracking)
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
-- 7. USER SETTINGS (Per-user configuration)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  email_notifications BOOLEAN DEFAULT true,
  sensitivity_level TEXT DEFAULT 'medium' CHECK (sensitivity_level IN ('low', 'medium', 'high')),
  auto_block_threshold INTEGER DEFAULT 75 CHECK (auto_block_threshold >= 0 AND auto_block_threshold <= 100),
  custom_rules JSONB DEFAULT '{}'
);


-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users read their own profile
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Predictions: Users see their own predictions
CREATE POLICY "Users read own predictions" ON comment_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own predictions" ON comment_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Labels: Readable if user owns parent prediction
CREATE POLICY "Users read own labels" ON prediction_labels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM comment_predictions
      WHERE comment_predictions.id = prediction_labels.prediction_id
      AND comment_predictions.user_id = auth.uid()
    )
  );

-- Settings: Users manage own settings
CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Moderation logs: Moderators can view and create
CREATE POLICY "Moderators read logs" ON moderation_logs
  FOR SELECT USING (auth.uid() = moderator_id);

CREATE POLICY "Moderators create logs" ON moderation_logs
  FOR INSERT WITH CHECK (auth.uid() = moderator_id);


-- ═══════════════════════════════════════════════════════════
-- INDEXES (Performance optimization)
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON comment_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON comment_predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_severity ON comment_predictions(severity);
CREATE INDEX IF NOT EXISTS idx_predictions_action ON comment_predictions(action);
CREATE INDEX IF NOT EXISTS idx_labels_prediction_id ON prediction_labels(prediction_id);
CREATE INDEX IF NOT EXISTS idx_labels_label_name ON prediction_labels(label_name);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_modlogs_prediction ON moderation_logs(prediction_id);
CREATE INDEX IF NOT EXISTS idx_model_metrics_version ON model_metrics(model_version);
