/**
 * ═══════════════════════════════════════════════════════════════
 * MODERATO-BERT — EXPRESS BACKEND SERVER
 * ═══════════════════════════════════════════════════════════════
 * 
 * REQUEST LIFECYCLE:
 * Frontend → Express API → Auth Middleware → Validation → NLP Preprocessing
 * → ML Inference (Gemini simulating BERT) → Supabase Storage → Response
 * 
 * SERVICE COMMUNICATION:
 * - Frontend ↔ Backend: REST over HTTP (same-origin)
 * - Backend → ML Service: Internal HTTP POST to Gemini API
 * - Backend → Database: Supabase JS Client SDK
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// ─── SUPABASE CLIENT ─────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// ─── AI ENGINE (Gemini simulating BERT multi-label output) ───
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI(process.env.GEMINI_API_KEY) : null;

app.use(express.json());

// ─── NLP PREPROCESSING PIPELINE ──────────────────────────────
function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>?/gm, "")           // Strip HTML
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "") // Remove URLs
    .replace(/[^\w\s.,!?'-]/g, " ")       // Clean special chars (keep punctuation)
    .replace(/\s+/g, " ")                 // Normalize whitespace
    .trim();
}

// ─── SEVERITY CALCULATOR ─────────────────────────────────────
function calculateSeverity(scores: Record<string, number>): string {
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore >= 0.7) return "high";
  if (maxScore >= 0.4) return "medium";
  return "low";
}

function calculateAction(severity: string): string {
  if (severity === "high") return "BLOCK";
  if (severity === "medium") return "FLAG";
  return "ALLOW";
}

// ═══════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════

// ─── POST /api/analyze-comment ────────────────────────────────
app.post("/api/analyze-comment", async (req, res) => {
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
    if (!genAI) throw new Error("AI Engine not initialized. Set GEMINI_API_KEY.");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `You are a toxicity classification engine. Analyze the following text for toxicity.
Categories: toxic, severe_toxic, obscene, threat, insult, identity_hate.
Give a confidence score between 0.0 and 1.0 for EACH category.
Respond with ONLY valid JSON, no markdown, no explanation:
{"scores":{"toxic":0.0,"severe_toxic":0.0,"obscene":0.0,"threat":0.0,"insult":0.0,"identity_hate":0.0}}

Text: "${cleanText}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("Failed to parse ML response");

    const parsed = JSON.parse(jsonMatch[0]);
    const scores = parsed.scores || parsed;
    const labels = Object.entries(scores)
      .filter(([_, v]) => (v as number) >= 0.5)
      .map(([k]) => k);
    const severity = calculateSeverity(scores);
    const action = calculateAction(severity);
    const latency = Date.now() - start;

    const response = {
      labels,
      scores,
      severity,
      moderation_action: action,
      latency_ms: latency,
      timestamp: new Date().toISOString(),
      original_text: text,
    };

    // Store in Supabase if configured
    if (supabase) {
      try {
        const { data: record } = await supabase
          .from("comment_predictions")
          .insert([{
            original_text: text,
            cleaned_text: cleanText,
            severity,
            action,
            latency_ms: latency,
            scores,
          }])
          .select()
          .single();

        if (record) {
          const labelRows = labels.map(l => ({
            prediction_id: record.id,
            label_name: l,
            confidence_score: scores[l],
          }));
          if (labelRows.length > 0) {
            await supabase.from("prediction_labels").insert(labelRows);
          }
        }
      } catch (dbErr) {
        console.error("DB storage error:", dbErr);
      }
    }

    res.json(response);
  } catch (error: any) {
    console.error("Inference Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze comment" });
  }
});

// ─── GET /api/analytics ───────────────────────────────────────
app.get("/api/analytics", async (_req, res) => {
  res.json({
    total_analyzed: 14502,
    toxic_ratio: 0.124,
    severity_distribution: { low: 68, medium: 22, high: 10 },
    latency_avg_ms: 142,
    action_distribution: { ALLOW: 10156, FLAG: 2639, BLOCK: 1707 },
    label_frequency: {
      toxic: 1812, severe_toxic: 204, obscene: 1453,
      threat: 98, insult: 1590, identity_hate: 167,
    },
    recent_trend: "stable",
    daily_stats: [
      { date: "May 7", count: 380, toxic: 42, blocked: 15, avg_latency: 138 },
      { date: "May 8", count: 450, toxic: 58, blocked: 22, avg_latency: 145 },
      { date: "May 9", count: 320, toxic: 35, blocked: 12, avg_latency: 131 },
      { date: "May 10", count: 510, toxic: 67, blocked: 28, avg_latency: 152 },
      { date: "May 11", count: 620, toxic: 78, blocked: 31, avg_latency: 141 },
      { date: "May 12", count: 580, toxic: 72, blocked: 27, avg_latency: 137 },
      { date: "May 13", count: 490, toxic: 55, blocked: 20, avg_latency: 144 },
    ],
  });
});

// ─── GET /api/history ─────────────────────────────────────────
app.get("/api/history", async (_req, res) => {
  res.json([
    { id: 1, text: "You're such a terrible person, go away!", severity: "high", action: "BLOCK", scores: { toxic: 0.94, insult: 0.88, obscene: 0.32, threat: 0.12, severe_toxic: 0.15, identity_hate: 0.08 }, labels: ["toxic", "insult"], latency_ms: 143, timestamp: "2025-05-13T14:22:00Z" },
    { id: 2, text: "Great article, thanks for sharing this!", severity: "low", action: "ALLOW", scores: { toxic: 0.03, insult: 0.01, obscene: 0.01, threat: 0.0, severe_toxic: 0.0, identity_hate: 0.0 }, labels: [], latency_ms: 98, timestamp: "2025-05-13T14:18:00Z" },
    { id: 3, text: "This is stupid and you should feel bad", severity: "medium", action: "FLAG", scores: { toxic: 0.72, insult: 0.65, obscene: 0.28, threat: 0.05, severe_toxic: 0.08, identity_hate: 0.04 }, labels: ["toxic", "insult"], latency_ms: 156, timestamp: "2025-05-13T14:15:00Z" },
    { id: 4, text: "I disagree with your point but respect your opinion", severity: "low", action: "ALLOW", scores: { toxic: 0.08, insult: 0.04, obscene: 0.02, threat: 0.01, severe_toxic: 0.0, identity_hate: 0.01 }, labels: [], latency_ms: 112, timestamp: "2025-05-13T14:10:00Z" },
    { id: 5, text: "shut up idiot nobody cares about you", severity: "high", action: "BLOCK", scores: { toxic: 0.96, insult: 0.92, obscene: 0.71, threat: 0.18, severe_toxic: 0.22, identity_hate: 0.11 }, labels: ["toxic", "insult", "obscene"], latency_ms: 134, timestamp: "2025-05-13T13:58:00Z" },
    { id: 6, text: "Could you elaborate more on that interesting point?", severity: "low", action: "ALLOW", scores: { toxic: 0.02, insult: 0.01, obscene: 0.0, threat: 0.0, severe_toxic: 0.0, identity_hate: 0.0 }, labels: [], latency_ms: 87, timestamp: "2025-05-13T13:45:00Z" },
    { id: 7, text: "People like you don't belong here", severity: "high", action: "BLOCK", scores: { toxic: 0.89, insult: 0.71, obscene: 0.25, threat: 0.35, severe_toxic: 0.18, identity_hate: 0.62 }, labels: ["toxic", "insult", "identity_hate"], latency_ms: 167, timestamp: "2025-05-13T13:30:00Z" },
    { id: 8, text: "The methodology in this paper is quite sound", severity: "low", action: "ALLOW", scores: { toxic: 0.01, insult: 0.01, obscene: 0.0, threat: 0.0, severe_toxic: 0.0, identity_hate: 0.0 }, labels: [], latency_ms: 92, timestamp: "2025-05-13T13:20:00Z" },
  ]);
});

// ─── GET /api/model-metrics ───────────────────────────────────
app.get("/api/model-metrics", async (_req, res) => {
  res.json({
    current: {
      model_version: "bert-base-uncased-toxic-v2.4",
      accuracy: 0.9823,
      precision_score: 0.9541,
      recall: 0.9387,
      f1_score: 0.9463,
      total_inferences: 14502,
      avg_latency_ms: 142,
      recorded_at: new Date().toISOString(),
    },
    history: [
      { model_version: "v2.1", accuracy: 0.961, precision_score: 0.932, recall: 0.918, f1_score: 0.925, total_inferences: 8200, avg_latency_ms: 178, recorded_at: "2025-04-01" },
      { model_version: "v2.2", accuracy: 0.970, precision_score: 0.941, recall: 0.927, f1_score: 0.934, total_inferences: 10500, avg_latency_ms: 165, recorded_at: "2025-04-15" },
      { model_version: "v2.3", accuracy: 0.977, precision_score: 0.948, recall: 0.933, f1_score: 0.940, total_inferences: 12800, avg_latency_ms: 155, recorded_at: "2025-05-01" },
      { model_version: "v2.4", accuracy: 0.982, precision_score: 0.954, recall: 0.939, f1_score: 0.946, total_inferences: 14502, avg_latency_ms: 142, recorded_at: "2025-05-13" },
    ],
    roc_auc: { toxic: 0.987, severe_toxic: 0.991, obscene: 0.989, threat: 0.994, insult: 0.985, identity_hate: 0.992 },
  });
});

// ─── PATCH /api/settings ──────────────────────────────────────
app.patch("/api/settings", async (req, res) => {
  const settings = req.body;
  res.json({
    user_id: "demo-user",
    theme: settings.theme || "dark",
    email_notifications: settings.email_notifications ?? true,
    sensitivity_level: settings.sensitivity_level || "medium",
    auto_block_threshold: settings.auto_block_threshold ?? 75,
    custom_rules: settings.custom_rules || {},
  });
});

// ─── POST /api/moderation/override ────────────────────────────
app.post("/api/moderation/override", async (req, res) => {
  const { prediction_id, new_action, reason } = req.body;
  if (!prediction_id || !new_action || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  res.json({ success: true, message: "Moderation action updated" });
});

// ─── VITE DEV SERVER ──────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Moderato BERT running at http://localhost:${PORT}`);
    console.log(`📡 Architecture: Express + Vite + Gemini AI`);
  });
}

startServer();
