/**
 * CORE TYPE DEFINITIONS
 * 
 * All shared TypeScript interfaces for the Moderato-BERT platform.
 * These types are used across frontend components, API hooks, and service layers.
 */

// ─── ML Inference Types ───────────────────────────────────────

export type ToxicityLabel = 'toxic' | 'severe_toxic' | 'obscene' | 'threat' | 'insult' | 'identity_hate';
export type Severity = 'low' | 'medium' | 'high';
export type ModerationAction = 'ALLOW' | 'FLAG' | 'BLOCK';

export interface AnalysisResult {
  labels: ToxicityLabel[];
  scores: Record<ToxicityLabel, number>;
  severity: Severity;
  moderation_action: ModerationAction;
  latency_ms: number;
  timestamp: string;
  original_text: string;
}

// ─── Database Record Types ────────────────────────────────────

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_name: string | null;
  role: 'admin' | 'moderator' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface CommentPrediction {
  id: number;
  user_id: string;
  original_text: string;
  cleaned_text: string;
  severity: Severity;
  action: ModerationAction;
  latency_ms: number;
  scores: Record<ToxicityLabel, number>;
  created_at: string;
}

export interface PredictionLabel {
  id: number;
  prediction_id: number;
  label_name: ToxicityLabel;
  confidence_score: number;
}

export interface AnalyticsSnapshot {
  id: number;
  snapshot_date: string;
  total_requests: number;
  blocked_requests: number;
  flagged_requests: number;
  allowed_requests: number;
  avg_latency: number;
  label_distribution: Record<ToxicityLabel, number>;
}

export interface ModerationLog {
  id: number;
  prediction_id: number;
  moderator_id: string;
  original_action: ModerationAction;
  new_action: ModerationAction;
  reason: string;
  created_at: string;
}

export interface ModelMetrics {
  id: number;
  model_version: string;
  accuracy: number;
  precision_score: number;
  recall: number;
  f1_score: number;
  total_inferences: number;
  avg_latency_ms: number;
  recorded_at: string;
}

export interface UserSettings {
  user_id: string;
  theme: 'dark' | 'light' | 'system';
  email_notifications: boolean;
  sensitivity_level: 'low' | 'medium' | 'high';
  auto_block_threshold: number;
  custom_rules: Record<string, unknown>;
}

// ─── API Response Types ───────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
    latency_ms?: number;
  };
}

export interface AnalyticsData {
  total_analyzed: number;
  toxic_ratio: number;
  severity_distribution: { low: number; medium: number; high: number };
  latency_avg_ms: number;
  action_distribution: { ALLOW: number; FLAG: number; BLOCK: number };
  daily_stats: DailyStat[];
  label_frequency: Record<ToxicityLabel, number>;
  recent_trend: 'up' | 'down' | 'stable';
}

export interface DailyStat {
  date: string;
  count: number;
  toxic: number;
  blocked: number;
  avg_latency: number;
}

export interface HistoryEntry {
  id: number;
  text: string;
  severity: Severity;
  action: ModerationAction;
  scores: Record<string, number>;
  labels: string[];
  latency_ms: number;
  timestamp: string;
}

export interface ModelPerformanceData {
  current: ModelMetrics;
  history: ModelMetrics[];
  confusion_matrix: number[][];
  roc_auc: Record<ToxicityLabel, number>;
}

// ─── Component Prop Types ─────────────────────────────────────

export type PageId = 'landing' | 'dashboard' | 'analytics' | 'history' | 'model' | 'settings';

export interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}
