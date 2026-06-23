from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from transformers import pipeline
import time
import os
import re
from collections import Counter
import math

app = FastAPI(
    title="InsightAI ML Service",
    description="Customer sentiment & intent analysis using BERT",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MODELS & PIPELINES ──────────────────────────────────────────

print("Loading NLP models...")
start_load = time.time()

try:
    # We use a multilingual sentiment model for core sentiment
    sentiment_pipe = pipeline(
        "text-classification", 
        model="nlptown/bert-base-multilingual-uncased-sentiment", 
        return_all_scores=True
    )
    print(f"Models loaded in {time.time() - start_load:.2f}s")
except Exception as e:
    print(f"Warning: Failed to load HuggingFace models. {e}")
    sentiment_pipe = None

# ─── SCHEMAS ─────────────────────────────────────────────────────

class InferenceRequest(BaseModel):
    text: str = Field(..., max_length=5000)

class NLPEnrichment(BaseModel):
    topics: List[str]
    keywords: List[str]
    discourse_summary: str

class InferenceResponse(BaseModel):
    sentiment: str
    sentiment_scores: Dict[str, float]
    intent_scores: Dict[str, float]
    primary_intent: str
    insight_action: str
    nlp: NLPEnrichment
    latency_ms: int
    model_version: str

# ─── HEURISTICS & NLP HELPERS ────────────────────────────────────

# Stop words for keyword extraction
STOP_WORDS = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "it", "this", "that", "i", "you", "he", "she", "we", "they", "my", "your", "of", "about"}

def _extract_keywords(text: str) -> List[str]:
    """Basic TF-based keyword extraction"""
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    words = [w for w in words if w not in STOP_WORDS]
    counts = Counter(words)
    return [word for word, _ in counts.most_common(5)]

def _extract_topics(text: str) -> List[str]:
    """Basic noun-phrase extraction simulation"""
    topics = []
    text_lower = text.lower()
    
    # Simple rule-based topic matching
    rules = {
        "Pricing & Billing": ["price", "cost", "billing", "invoice", "charge", "expensive"],
        "Customer Support": ["support", "help", "agent", "ticket", "response time", "representative"],
        "Product Usability": ["ui", "ux", "interface", "confusing", "hard to use", "easy", "intuitive"],
        "Bugs & Glitches": ["bug", "crash", "error", "broken", "freeze", "doesn't work"],
        "Feature Requests": ["wish", "add", "feature", "would be great", "missing"],
        "Account Management": ["login", "password", "account", "settings", "profile"]
    }
    
    for topic, keywords in rules.items():
        if any(kw in text_lower for kw in keywords):
            topics.append(topic)
            
    if not topics:
        topics.append("General Feedback")
        
    return topics[:3]

def _generate_discourse_summary(text: str) -> str:
    """Simple extractive summarization"""
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    if not sentences:
        return "Short generic feedback."
    # Just return the first substantial sentence
    return sentences[0] + "."

def _calculate_action(primary_intent: str, sentiment: str) -> str:
    if primary_intent in ["churn_risk", "complaint"]:
        return "ESCALATE"
    if primary_intent in ["inquiry", "support_request"]:
        return "ENGAGE"
    return "MONITOR"

def _fallback_predict(text: str):
    """Heuristic logic if HF pipeline fails or is not available"""
    text_lower = text.lower()
    
    pos_words = ["good", "great", "excellent", "love", "awesome", "perfect", "recommend", "best"]
    neg_words = ["bad", "terrible", "awful", "hate", "broken", "refund", "cancel", "worst", "issue", "bug", "crash", "horrible"]
    
    pos_count = sum(1 for w in pos_words if w in text_lower)
    neg_count = sum(1 for w in neg_words if w in text_lower)
    
    # Calculate sentiment scores
    total_affect = max(1, pos_count + neg_count)
    if pos_count == 0 and neg_count == 0:
        pos_score = 0.1
        neg_score = 0.1
        neu_score = 0.8
    else:
        base_pos = pos_count / total_affect
        base_neg = neg_count / total_affect
        pos_score = min(0.95, max(0.05, base_pos * 0.8 + 0.1))
        neg_score = min(0.95, max(0.05, base_neg * 0.8 + 0.1))
        neu_score = max(0.05, 1.0 - pos_score - neg_score)
        
    sentiment_scores = {"positive": pos_score, "negative": neg_score, "neutral": neu_score}
    sentiment = max(sentiment_scores.items(), key=lambda x: x[1])[0]
    
    # Calculate intent scores heuristics
    intent_scores = {
        "purchase_intent": 0.8 if any(w in text_lower for w in ["buy", "price", "cost", "upgrade"]) else 0.1,
        "complaint": 0.85 if neg_count > 0 else 0.1,
        "inquiry": 0.7 if "?" in text or "how" in text_lower or "what" in text_lower else 0.2,
        "support_request": 0.9 if "help" in text_lower or "support" in text_lower or "ticket" in text_lower else 0.1,
        "product_feedback": 0.5, # Baseline
        "feature_request": 0.8 if any(w in text_lower for w in ["add", "wish", "feature", "would be great"]) else 0.1,
        "churn_risk": 0.95 if any(w in text_lower for w in ["cancel", "refund", "unsubscribe", "close account"]) else 0.05,
        "recommendation": 0.9 if pos_count > 0 and any(w in text_lower for w in ["recommend", "tell friends", "10/10"]) else 0.1
    }
    
    primary_intent = max(intent_scores.items(), key=lambda x: x[1])[0]
    
    return sentiment_scores, sentiment, intent_scores, primary_intent

# ─── ROUTES ──────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "operational",
        "model_loaded": sentiment_pipe is not None,
        "engine": "nlptown/bert-base-multilingual-uncased-sentiment"
    }

@app.post("/predict", response_model=InferenceResponse)
def predict(req: InferenceRequest):
    start = time.time()
    
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    # 1. Base NLP Extraction
    topics = _extract_topics(req.text)
    keywords = _extract_keywords(req.text)
    summary = _generate_discourse_summary(req.text)
    
    if sentiment_pipe is None:
        # Fallback heuristic mode
        s_scores, sentiment, i_scores, intent = _fallback_predict(req.text)
    else:
        try:
            # Model inference (nlptown model outputs 1 star to 5 stars)
            # Map: 1,2 = negative; 3 = neutral; 4,5 = positive
            hf_res = sentiment_pipe(req.text)[0]
            
            raw_scores = {item['label']: item['score'] for item in hf_res}
            neg = raw_scores.get('1 star', 0) + raw_scores.get('2 stars', 0)
            neu = raw_scores.get('3 stars', 0)
            pos = raw_scores.get('4 stars', 0) + raw_scores.get('5 stars', 0)
            
            s_scores = {"positive": pos, "negative": neg, "neutral": neu}
            sentiment = max(s_scores.items(), key=lambda x: x[1])[0]
            
            # Since we don't have a dedicated intent model loaded in memory, use heuristic for intent
            _, _, i_scores, intent = _fallback_predict(req.text)
            
        except Exception as e:
            print(f"Inference error: {e}")
            s_scores, sentiment, i_scores, intent = _fallback_predict(req.text)

    action = _calculate_action(intent, sentiment)
    latency = int((time.time() - start) * 1000)
    
    return InferenceResponse(
        sentiment=sentiment,
        sentiment_scores=s_scores,
        intent_scores=i_scores,
        primary_intent=intent,
        insight_action=action,
        nlp=NLPEnrichment(
            topics=topics,
            keywords=keywords,
            discourse_summary=summary
        ),
        latency_ms=latency,
        model_version="sentiment-bert-v3.0"
    )

@app.get("/model-info")
def model_info():
    return {
        "version": "sentiment-bert-v3.0",
        "architecture": "Transformer (BERT)",
        "parameters": "110M",
        "labels": {
            "sentiment": ["positive", "negative", "neutral"],
            "intent": ["purchase_intent", "complaint", "inquiry", "support_request", "product_feedback", "feature_request", "churn_risk", "recommendation"]
        },
        "description": "Multilingual BERT fine-tuned for sentiment analysis with intent heuristic classification layer."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
