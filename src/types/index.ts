/**
 * CORE TYPE DEFINITIONS
 * 
 * All shared TypeScript interfaces for the InsightAI Customer Intelligence platform.
 * These types are used across frontend components, API hooks, and service layers.
 */

// ─── ML Inference Types ───────────────────────────────────────

export type SentimentLabel = 'positive' | 'negative' | 'neutral';
export type IntentLabel = 'purchase_intent' | 'complaint' | 'inquiry' | 'support_request' | 'product_feedback' | 'feature_request' | 'churn_risk' | 'recommendation';
export type InsightAction = 'MONITOR' | 'ESCALATE' | 'ENGAGE';

export interface NLPEnrichment {
  topics: string[];
  keywords: string[];
  discourse_summary: string;
}

export interface AnalysisResult {
  sentiment: SentimentLabel;
  sentiment_scores: Record<SentimentLabel, number>;
  intent_scores: Record<IntentLabel, number>;
  primary_intent: IntentLabel;
  insight_action: InsightAction;
  nlp: NLPEnrichment;
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
  department: string | null;
  role: 'admin' | 'analyst' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface CustomerFeedbackAnalysis {
  id: number;
  user_id: string;
  customer_text: string;
  cleaned_text: string;
  sentiment: SentimentLabel;
  sentiment_score: number;
  primary_intent: IntentLabel;
  intent_confidence: number;
  extracted_topics: string[];
  keywords: string[];
  discourse_summary: string;
  insight_action: InsightAction;
  processing_latency: number;
  analysis_timestamp: string;
}

export interface SentimentIntentLabel {
  id: number;
  analysis_id: number;
  label_type: 'sentiment' | 'intent';
  label_name: string;
  confidence_score: number;
}

export interface AnalyticsSnapshot {
  id: number;
  snapshot_date: string;
  total_requests: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  intent_distribution: Record<IntentLabel, number>;
  avg_latency: number;
  avg_satisfaction_score: number;
}

export interface InsightLog {
  id: number;
  analysis_id: number;
  analyst_id: string;
  original_sentiment: SentimentLabel;
  corrected_sentiment: SentimentLabel;
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
  analysis_depth: 'basic' | 'standard' | 'deep';
  negative_alert_threshold: number;
  churn_risk_threshold: number;
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
  positive_ratio: number;
  negative_ratio: number;
  neutral_ratio: number;
  satisfaction_index: number;
  latency_avg_ms: number;
  sentiment_distribution: { positive: number; negative: number; neutral: number };
  intent_distribution: Record<string, number>;
  daily_stats: DailyStat[];
  recent_trend: 'up' | 'down' | 'stable';
}

export interface DailyStat {
  date: string;
  count: number;
  positive: number;
  negative: number;
  neutral: number;
  avg_latency: number;
}

export interface HistoryEntry {
  id: number;
  text: string;
  sentiment: SentimentLabel;
  primary_intent: IntentLabel;
  insight_action: InsightAction;
  sentiment_scores: Record<string, number>;
  intent_scores: Record<string, number>;
  topics: string[];
  keywords: string[];
  latency_ms: number;
  timestamp: string;
}

export interface ModelPerformanceData {
  current: ModelMetrics;
  history: ModelMetrics[];
  roc_auc: Record<string, number>;
}

export interface ExecutiveDashboard {
  health_score: number;
  satisfaction_index: number;
  purchase_interest_index: number;
  pain_points: { topic: string; count: number; sentiment_avg: number }[];
  trending_topics: { topic: string; count: number; trend: 'up' | 'down' | 'stable' }[];
  top_concerns: { text: string; sentiment: SentimentLabel; intent: IntentLabel }[];
  improvement_suggestions: string[];
  sentiment_trend: { date: string; positive: number; negative: number; neutral: number }[];
}

// ─── Component Prop Types ─────────────────────────────────────

export type PageId = 'landing' | 'dashboard' | 'analytics' | 'history' | 'model' | 'executive' | 'settings';

export interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}
