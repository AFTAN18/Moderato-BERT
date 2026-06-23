/**
 * ═══════════════════════════════════════════════════════════════
 * MODERATO-BERT — VERCEL SERVERLESS API HANDLER
 * ═══════════════════════════════════════════════════════════════
 *
 * This file is the Vercel entry point for all /api/* routes.
 * It mirrors the routes in server.ts but without the Vite dev server,
 * so it works as a Vercel serverless function.
 */

import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import {
  getRealAnalytics,
  getRealExecutiveDashboard,
  getRealHistory,
  getRealModelMetrics,
  getRealSettings,
} from "./realData";

const app = express();

// ─── SUPABASE CLIENT ─────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── AI ENGINES ──────────────────────────────────────────────
const claude = process.env.CLAUDE_API_KEY
  ? new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
  : null;
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

app.use(express.json());

// ─── CORS for Vercel ──────────────────────────────────────────
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ─── NLP PREPROCESSING PIPELINE ──────────────────────────────
function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>?/gm, "")
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "")
    .replace(/[^\w\s.,!?'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSentiment(scores: Record<string, number>): string {
  let maxScore = -1;
  let bestSentiment = "neutral";
  for (const [sentiment, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestSentiment = sentiment;
    }
  }
  return bestSentiment;
}

function calculateAction(intent: string, _sentiment: string): string {
  if (intent === "churn_risk" || intent === "complaint") return "ESCALATE";
  if (intent === "inquiry" || intent === "support_request") return "ENGAGE";
  return "MONITOR";
}

// ═══════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════

// ─── POST /api/analyze-feedback ───────────────────────────────
app.post("/api/analyze-feedback", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Text is required" });
  }
  if (text.length > 5000) {
    return res.status(400).json({ error: "Text must be under 5000 characters" });
  }

  const cleanText = preprocessText(text);
  const start = Date.now();

  try {
    const prompt = `You are a customer intelligence engine. Analyze the following text.
Respond with ONLY valid JSON, no markdown, no explanation:
{
  "sentiment_scores": {"positive": 0.0, "negative": 0.0, "neutral": 0.0},
  "intent_scores": {"purchase_intent": 0.0, "complaint": 0.0, "inquiry": 0.0, "support_request": 0.0, "product_feedback": 0.0, "feature_request": 0.0, "churn_risk": 0.0, "recommendation": 0.0},
  "topics": ["topic1", "topic2"],
  "keywords": ["key phrase 1", "key phrase 2"],
  "discourse_summary": "Brief summary of customer concern"
}

Text: "${cleanText}"`;

    let responseText = "";

    if (claude) {
      try {
        const msg = await claude.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }],
        });
        responseText = msg.content[0].type === "text" ? msg.content[0].text : "";
      } catch (claudeErr: any) {
        console.log(`Claude failed: ${claudeErr.message?.substring(0, 80)}`);
      }
    }

    if (!responseText && genAI) {
      const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"];
      for (const modelName of models) {
        try {
          const result = await genAI.models.generateContent({
            model: modelName,
            contents: prompt,
          });
          responseText = result.text || "";
          if (responseText) break;
        } catch (gemErr: any) {
          console.log(`Gemini ${modelName} failed: ${gemErr.message?.substring(0, 80)}`);
        }
      }
    }

    // Heuristic fallback when all cloud APIs unavailable
    if (!responseText) {
      const posWords = ["good", "great", "excellent", "love", "awesome", "perfect", "recommend"];
      const negWords = ["bad", "terrible", "awful", "hate", "broken", "refund", "cancel", "worst", "issue"];
      const words = cleanText.toLowerCase().split(/\s+/);
      const posMatches = words.filter((w) => posWords.some((p) => w.includes(p))).length;
      const negMatches = words.filter((w) => negWords.some((p) => w.includes(p))).length;
      const posScore = Math.min(posMatches * 0.4 + 0.1, 0.95);
      const negScore = Math.min(negMatches * 0.4 + 0.1, 0.95);
      const neuScore = Math.max(0.1, 1.0 - posScore - negScore);
      const churnScore = words.some((w) => w.includes("cancel") || w.includes("refund")) ? 0.85 : 0.05;
      const complaintScore = negMatches > 0 ? Math.min(negScore + 0.2, 0.95) : 0.1;
      responseText = JSON.stringify({
        sentiment_scores: { positive: posScore, negative: negScore, neutral: neuScore },
        intent_scores: {
          purchase_intent: 0.1, complaint: complaintScore, inquiry: 0.1,
          support_request: 0.1, product_feedback: 0.2, feature_request: 0.1,
          churn_risk: churnScore, recommendation: posScore,
        },
        topics: ["Product Quality", "Customer Experience"],
        keywords: words.slice(0, 3),
        discourse_summary: "Customer provided feedback (heuristic fallback).",
      });
    }

    const jsonMatch = responseText.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("Failed to parse ML response");

    const parsed = JSON.parse(jsonMatch[0]);
    const sentiment_scores = parsed.sentiment_scores || { positive: 0, negative: 0, neutral: 1 };
    const intent_scores = parsed.intent_scores || {};
    const sentiment = calculateSentiment(sentiment_scores);

    let primary_intent = "product_feedback";
    let max_intent_score = -1;
    for (const [intent, score] of Object.entries(intent_scores)) {
      if ((score as number) > max_intent_score) {
        max_intent_score = score as number;
        primary_intent = intent;
      }
    }

    const action = calculateAction(primary_intent, sentiment);
    const latency = Date.now() - start;

    const response = {
      sentiment,
      sentiment_scores,
      intent_scores,
      primary_intent,
      insight_action: action,
      nlp: {
        topics: parsed.topics || [],
        keywords: parsed.keywords || [],
        discourse_summary: parsed.discourse_summary || "",
      },
      latency_ms: latency,
      timestamp: new Date().toISOString(),
      original_text: text,
    };

    if (supabase) {
      try {
        const { data: record } = await supabase
          .from("customer_feedback_analysis")
          .insert([{
            customer_text: text, cleaned_text: cleanText, sentiment,
            sentiment_score: sentiment_scores[sentiment], primary_intent,
            intent_confidence: max_intent_score, insight_action: action,
            extracted_topics: parsed.topics || [], keywords: parsed.keywords || [],
            discourse_summary: parsed.discourse_summary || "",
            processing_latency: latency,
          }])
          .select()
          .single();

        if (record) {
          const labelRows: any[] = [];
          for (const [l, s] of Object.entries(sentiment_scores))
            labelRows.push({ analysis_id: record.id, label_type: "sentiment", label_name: l, confidence_score: s });
          for (const [l, s] of Object.entries(intent_scores))
            labelRows.push({ analysis_id: record.id, label_type: "intent", label_name: l, confidence_score: s });
          if (labelRows.length > 0)
            await supabase.from("sentiment_intent_labels").insert(labelRows);
        }
      } catch (dbErr) {
        console.error("DB storage error:", dbErr);
      }
    }

    res.json(response);
  } catch (error: any) {
    const msg = error.message || "Failed to analyze feedback";
    const cleanMsg =
      msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")
        ? "API quota exceeded. Please wait a moment and try again."
        : msg.length > 120 ? msg.substring(0, 120) + "..." : msg;
    res.status(500).json({ error: cleanMsg });
  }
});

// ─── GET /api/analytics ───────────────────────────────────────
app.get("/api/analytics", async (_req, res) => {
  try {
    res.json(await getRealAnalytics(supabase));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load analytics" });
  }
});

// ─── GET /api/history ─────────────────────────────────────────
app.get("/api/history", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    res.json(await getRealHistory(supabase, page, limit));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load history" });
  }
});

// ─── GET /api/model-metrics ───────────────────────────────────
app.get("/api/model-metrics", async (_req, res) => {
  try {
    res.json(await getRealModelMetrics(supabase));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load model metrics" });
  }
});

// ─── GET /api/executive-dashboard ─────────────────────────────
app.get("/api/executive-dashboard", async (_req, res) => {
  try {
    res.json(await getRealExecutiveDashboard(supabase));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load executive dashboard" });
  }
});

// ─── PATCH /api/settings ──────────────────────────────────────
app.patch("/api/settings", async (req, res) => {
  const settings = req.body;
  const current = await getRealSettings(supabase);
  res.json({ ...current, ...settings });
});

// ─── POST /api/feedback/correct ───────────────────────────────
app.post("/api/feedback/correct", async (req, res) => {
  const { analysis_id, corrected_sentiment, reason } = req.body;
  if (!analysis_id || !corrected_sentiment || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  res.json({ success: true, message: "Feedback insight corrected" });
});

// ─── Health check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    ai: claude ? "claude" : genAI ? "gemini" : "heuristic",
    db: supabase ? "connected" : "not configured",
    timestamp: new Date().toISOString(),
  });
});

export default app;
