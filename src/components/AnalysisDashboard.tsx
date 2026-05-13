import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Terminal,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn, formatScore, getSeverityColor } from '@/src/lib/utils';

interface AnalysisResult {
  labels: string[];
  scores: Record<string, number>;
  severity: string;
  moderation_action: string;
  latency_ms: number;
  timestamp: string;
}

export default function AnalysisDashboard() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <div className="grid grid-cols-12 gap-8 flex-1">
        
        {/* Left: Input Panel */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 shadow-2xl flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Live Inference Input
              </h2>
              <span className="text-[10px] text-slate-500 bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#262626] font-mono">BERT-BASE-CASED-V2</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste comment content here for real-time toxicity scoring..."
              className="flex-1 bg-transparent border border-[#1F1F1F] rounded-lg p-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none font-sans leading-relaxed"
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="text-[10px] px-2 py-1 bg-[#1A1A1A] rounded text-slate-400 font-mono">{text.length} Characters</span>
                <span className="text-[10px] px-2 py-1 bg-[#1A1A1A] rounded text-slate-400 font-mono">{Math.ceil(text.length / 4.5)} Tokens</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className={cn(
                  "px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
                  isAnalyzing && "cursor-not-allowed"
                )}
              >
                {isAnalyzing ? "Processing..." : "Run Analysis"}
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-lg p-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Confidence</p>
              <p className="text-xl text-white font-mono">{result ? formatScore(Math.max(...Object.values(result.scores))) : '--'}</p>
            </div>
            <div className={cn(
              "bg-[#111111] border border-[#1F1F1F] rounded-lg p-4 border-l-4 transition-colors",
              result?.moderation_action === 'BLOCK' ? "border-l-red-500" : result?.moderation_action === 'FLAG' ? "border-l-amber-500" : "border-l-emerald-500"
            )}>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
              <p className={cn(
                "text-xl font-mono",
                result ? (result.moderation_action === 'BLOCK' ? 'text-red-500' : result.moderation_action === 'FLAG' ? 'text-amber-500' : 'text-emerald-500') : 'text-white'
              )}>
                {result?.moderation_action || 'IDLE'}
              </p>
            </div>
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-lg p-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Latency</p>
              <p className="text-xl text-cyan-400 font-mono">{result ? `${result.latency_ms}ms` : '--'}</p>
            </div>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 flex-1 flex flex-col">
            <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Multi-label Classification
            </h2>

            <div className="space-y-6 flex-1">
              {!result && (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm italic font-mono">
                  Awaiting inference input...
                </div>
              )}
              {result && Object.entries(result.scores).map(([label, score]) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 capitalize">{label.replace('_', ' ')}</span>
                    <span className="text-white font-mono">{score.toFixed(3)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden border border-[#262626]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score * 100}%` }}
                      className={cn(
                        "h-full transition-colors",
                        score > 0.7 ? "bg-red-500" : score > 0.3 ? "bg-amber-500" : "bg-blue-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-lg bg-[#0D0D0D] border border-[#1F1F1F]">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">Moderation Log</p>
              <div className="text-[11px] font-mono space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-500">[SYS]</span>
                  <span className="text-slate-400">Preprocessing text via NLP pipeline...</span>
                </div>
                {result && (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-cyan-500">[ML]</span>
                      <span className="text-slate-400">Forwarding tensors to BERT-V2 instance...</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-500">[DB]</span>
                      <span className="text-slate-400">Inference results persisted in Supabase</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className={cn(result.moderation_action === 'BLOCK' ? "text-red-500" : "text-emerald-500")}>[ACTION]</span>
                      <span className="text-white">Moderation Rule Applied: {result.moderation_action}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
