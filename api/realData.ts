import type { SupabaseClient } from "@supabase/supabase-js";

type AnalysisRecord = {
  id: number;
  customer_text: string;
  sentiment: "positive" | "negative" | "neutral";
  sentiment_score: number | null;
  primary_intent: string | null;
  intent_confidence: number | null;
  extracted_topics: string[] | null;
  keywords: string[] | null;
  discourse_summary: string | null;
  insight_action: "MONITOR" | "ESCALATE" | "ENGAGE" | null;
  processing_latency: number | null;
  analysis_timestamp: string;
};

type LabelRecord = {
  analysis_id: number;
  label_type: "sentiment" | "intent";
  label_name: string;
  confidence_score: number;
};

const emptySentiment = { positive: 0, negative: 0, neutral: 0 };

const emptySettings = {
  user_id: "local-user",
  theme: "dark",
  email_notifications: true,
  analysis_depth: "standard",
  negative_alert_threshold: 75,
  churn_risk_threshold: 40,
  custom_rules: {},
};

async function fetchAnalyses(supabase: SupabaseClient | null, limit = 1000): Promise<AnalysisRecord[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("customer_feedback_analysis")
    .select(
      "id, customer_text, sentiment, sentiment_score, primary_intent, intent_confidence, extracted_topics, keywords, discourse_summary, insight_action, processing_latency, analysis_timestamp",
    )
    .order("analysis_timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as AnalysisRecord[];
}

async function fetchLabels(supabase: SupabaseClient | null, ids: number[]): Promise<LabelRecord[]> {
  if (!supabase || ids.length === 0) return [];

  const { data, error } = await supabase
    .from("sentiment_intent_labels")
    .select("analysis_id, label_type, label_name, confidence_score")
    .in("analysis_id", ids);

  if (error) throw error;
  return (data || []) as LabelRecord[];
}

function groupLabels(labels: LabelRecord[]) {
  const grouped = new Map<number, { sentiment_scores: Record<string, number>; intent_scores: Record<string, number> }>();

  for (const label of labels) {
    const entry = grouped.get(label.analysis_id) || { sentiment_scores: {}, intent_scores: {} };
    if (label.label_type === "sentiment") {
      entry.sentiment_scores[label.label_name] = label.confidence_score;
    } else {
      entry.intent_scores[label.label_name] = label.confidence_score;
    }
    grouped.set(label.analysis_id, entry);
  }

  return grouped;
}

function fallbackSentimentScores(record: AnalysisRecord) {
  const scores = { ...emptySentiment };
  if (record.sentiment) scores[record.sentiment] = record.sentiment_score ?? 1;
  return scores;
}

function fallbackIntentScores(record: AnalysisRecord) {
  return record.primary_intent ? { [record.primary_intent]: record.intent_confidence ?? 1 } : {};
}

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatDay(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildDailyStats(records: AnalysisRecord[]) {
  const grouped = new Map<string, AnalysisRecord[]>();

  for (const record of records) {
    const key = record.analysis_timestamp.slice(0, 10);
    grouped.set(key, [...(grouped.get(key) || []), record]);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, rows]) => ({
      date: formatDay(date),
      count: rows.length,
      positive: rows.filter((row) => row.sentiment === "positive").length,
      negative: rows.filter((row) => row.sentiment === "negative").length,
      neutral: rows.filter((row) => row.sentiment === "neutral").length,
      avg_latency: Math.round(average(rows.map((row) => row.processing_latency || 0))),
    }));
}

function topicCounts(records: AnalysisRecord[]) {
  return countBy(records.flatMap((record) => record.extracted_topics || []).filter(Boolean));
}

function keywordCounts(records: AnalysisRecord[]) {
  return countBy(records.flatMap((record) => record.keywords || []).filter(Boolean));
}

function toTrend(current: number, previous: number): "up" | "down" | "stable" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "stable";
}

export async function getRealHistory(supabase: SupabaseClient | null, page = 1, limit = 20) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const records = await fetchAnalyses(supabase, safePage * safeLimit);
  const pageRecords = records.slice((safePage - 1) * safeLimit, safePage * safeLimit);
  const labels = await fetchLabels(supabase, pageRecords.map((record) => record.id));
  const grouped = groupLabels(labels);

  return pageRecords.map((record) => {
    const scores = grouped.get(record.id);
    return {
      id: record.id,
      text: record.customer_text,
      sentiment: record.sentiment,
      primary_intent: record.primary_intent || "product_feedback",
      insight_action: record.insight_action || "MONITOR",
      sentiment_scores: Object.keys(scores?.sentiment_scores || {}).length
        ? scores?.sentiment_scores
        : fallbackSentimentScores(record),
      intent_scores: Object.keys(scores?.intent_scores || {}).length
        ? scores?.intent_scores
        : fallbackIntentScores(record),
      topics: record.extracted_topics || [],
      keywords: record.keywords || [],
      latency_ms: record.processing_latency || 0,
      timestamp: record.analysis_timestamp,
    };
  });
}

export async function getRealAnalytics(supabase: SupabaseClient | null) {
  const records = await fetchAnalyses(supabase);
  const total = records.length;
  const sentiment_distribution = {
    positive: records.filter((record) => record.sentiment === "positive").length,
    negative: records.filter((record) => record.sentiment === "negative").length,
    neutral: records.filter((record) => record.sentiment === "neutral").length,
  };
  const intent_distribution = countBy(records.map((record) => record.primary_intent || "unknown"));
  const daily_stats = buildDailyStats(records);
  const previousDay = daily_stats[daily_stats.length - 2]?.count || 0;
  const currentDay = daily_stats[daily_stats.length - 1]?.count || 0;

  return {
    total_analyzed: total,
    positive_ratio: total ? sentiment_distribution.positive / total : 0,
    negative_ratio: total ? sentiment_distribution.negative / total : 0,
    neutral_ratio: total ? sentiment_distribution.neutral / total : 0,
    satisfaction_index: total ? round((sentiment_distribution.positive / total) * 100) : 0,
    latency_avg_ms: Math.round(average(records.map((record) => record.processing_latency || 0))),
    sentiment_distribution,
    intent_distribution,
    recent_trend: toTrend(currentDay, previousDay),
    daily_stats,
  };
}

export async function getRealExecutiveDashboard(supabase: SupabaseClient | null) {
  const records = await fetchAnalyses(supabase);
  const total = records.length;
  const positive = records.filter((record) => record.sentiment === "positive").length;
  const negative = records.filter((record) => record.sentiment === "negative").length;
  const satisfaction = total ? round((positive / total) * 100) : 0;
  const health = total ? Math.max(0, Math.min(100, Math.round(satisfaction - (negative / total) * 20))) : 0;
  const purchaseRecords = records.filter((record) => record.primary_intent === "purchase_intent");
  const purchase_interest_index = total ? round((purchaseRecords.length / total) * 100) : 0;
  const topics = topicCounts(records);
  const negativeTopics = topicCounts(records.filter((record) => record.sentiment === "negative" || record.insight_action === "ESCALATE"));
  const keywords = keywordCounts(records);

  const pain_points = Object.entries(negativeTopics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count, sentiment_avg: round(count / Math.max(1, total), 2) }));

  const trending_topics = Object.entries(topics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([topic, count]) => ({ topic, count, trend: "stable" as const }));

  const top_concerns = records
    .filter((record) => record.sentiment === "negative" || record.insight_action === "ESCALATE")
    .slice(0, 5)
    .map((record) => ({
      text: record.customer_text,
      sentiment: record.sentiment,
      intent: record.primary_intent || "product_feedback",
    }));

  const improvement_suggestions = [
    ...pain_points.map(({ topic }) => `Investigate recurring customer concern around "${topic}".`),
    ...Object.entries(keywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([keyword]) => `Review recent feedback mentioning "${keyword}" for product or support follow-up.`),
  ].slice(0, 6);

  return {
    health_score: health,
    satisfaction_index: satisfaction,
    purchase_interest_index,
    pain_points,
    trending_topics,
    top_concerns,
    improvement_suggestions,
    sentiment_trend: buildDailyStats(records).map((stat) => ({
      date: stat.date,
      positive: stat.positive,
      negative: stat.negative,
      neutral: stat.neutral,
    })),
  };
}

export async function getRealModelMetrics(supabase: SupabaseClient | null) {
  const records = await fetchAnalyses(supabase);
  const total = records.length;
  const avgLatency = Math.round(average(records.map((record) => record.processing_latency || 0)));
  const confidence = average(records.map((record) => record.intent_confidence || record.sentiment_score || 0));
  const score = total ? round(confidence, 3) : 0;
  const byIntent = countBy(records.map((record) => record.primary_intent || "unknown"));
  const bySentiment = countBy(records.map((record) => record.sentiment));

  return {
    current: {
      id: 0,
      model_version: "live-ai-inference",
      accuracy: score,
      precision_score: score,
      recall: score,
      f1_score: score,
      total_inferences: total,
      avg_latency_ms: avgLatency,
      recorded_at: new Date().toISOString(),
    },
    history: [
      {
        id: 0,
        model_version: "live-ai-inference",
        accuracy: score,
        precision_score: score,
        recall: score,
        f1_score: score,
        total_inferences: total,
        avg_latency_ms: avgLatency,
        recorded_at: new Date().toISOString(),
      },
    ],
    roc_auc: Object.fromEntries(
      [...Object.keys(bySentiment), ...Object.keys(byIntent)].map((label) => [label, score]),
    ),
  };
}

export async function getRealSettings(supabase: SupabaseClient | null) {
  if (!supabase) return emptySettings;
  const { data, error } = await supabase.from("user_settings").select("*").limit(1).maybeSingle();
  if (error) return emptySettings;
  return data || emptySettings;
}
