/**
 * SUPABASE DATABASE SCHEMA (PostgreSQL)
 * Execute this in your Supabase SQL Editor.
 */

/*
-- 1. User Profiles (Extends Supabase Auth)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  organization_name TEXT,
  api_key_last_four TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Comment Predictions (Main data storage)
CREATE TABLE comment_predictions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  text TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  action TEXT CHECK (action IN ('ALLOW', 'FLAG', 'BLOCK')),
  latency_ms INTEGER,
  raw_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Prediction Labels (Multi-label junction-style tagging)
CREATE TABLE prediction_labels (
  id BIGSERIAL PRIMARY KEY,
  prediction_id BIGINT REFERENCES comment_predictions(id) ON DELETE CASCADE,
  label_name TEXT NOT NULL, -- toxic, obscene, etc.
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- 4. Analytics Snapshot (Aggregated daily)
CREATE TABLE analytics_snapshots (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date DATE DEFAULT CURRENT_DATE UNIQUE,
  total_requests INTEGER DEFAULT 0,
  blocked_requests INTEGER DEFAULT 0,
  flagged_requests INTEGER DEFAULT 0,
  avg_latency FLOAT
);

-- 5. Moderation Logs (Audit trail for human overrides)
CREATE TABLE moderation_logs (
  id BIGSERIAL PRIMARY KEY,
  prediction_id BIGINT REFERENCES comment_predictions(id),
  moderator_id UUID REFERENCES auth.users(id),
  original_action TEXT,
  new_action TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Examples
ALTER TABLE comment_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own predictions"
  ON comment_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own predictions"
  ON comment_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_prediction_user_id ON comment_predictions(user_id);
CREATE INDEX idx_prediction_created_at ON comment_predictions(created_at);
CREATE INDEX idx_labels_prediction_id ON prediction_labels(prediction_id);
*/
