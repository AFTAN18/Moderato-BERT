import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Activity, Sparkles, Terminal, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn, formatScore } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import type { AnalysisResult } from '@/src/types';

export default function AnalysisDashboard() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setResult(null);
    setError('');

    try {
      const data = await api.analyzeComment(text);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const actionColor = (action?: string) => {
    if (action === 'BLOCK') return 'text-red-400';
    if (action === 'FLAG') return 'text-amber-400';
    return 'text-emerald-400';
  };

  const actionBg = (action?: string) => {
    if (action === 'BLOCK') return 'bg-red-500/10 border-red-500/20';
    if (action === 'FLAG') return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Input Panel */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
          <div className="card p-6 flex flex-col min-h-[360px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-blue-400" />
                Live Inference Input
              </h2>
              <span className="text-[10px] text-slate-500 bg-brand-bg px-2.5 py-1 rounded-md border border-brand-border font-mono">
                BERT-BASE-UNCASED-V2.4
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleAnalyze(); }}
              placeholder="Type or paste comment content here for real-time toxicity scoring..."
              className="flex-1 bg-transparent border border-brand-border rounded-lg p-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 resize-none font-sans leading-relaxed text-sm"
              maxLength={5000}
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="text-[10px] px-2 py-1 bg-brand-bg rounded-md text-slate-500 font-mono border border-brand-border">
                  {text.length} / 5000
                </span>
                <span className="text-[10px] px-2 py-1 bg-brand-bg rounded-md text-slate-500 font-mono border border-brand-border">
                  ~{Math.ceil(text.length / 4)} Tokens
                </span>
              </div>
              <button onClick={handleAnalyze} disabled={!text.trim() || isAnalyzing} className="btn-primary flex items-center gap-2">
                {isAnalyzing ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><Send className="w-3.5 h-3.5" /> Analyze</>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Peak Score</p>
              <p className="text-xl text-white font-mono font-bold">
                {result ? formatScore(Math.max(...Object.values(result.scores))) : '--'}
              </p>
            </div>
            <div className={cn("card p-4 border-l-2", result ? actionBg(result.moderation_action) : '')}>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Action</p>
              <p className={cn("text-xl font-mono font-bold", result ? actionColor(result.moderation_action) : 'text-slate-600')}>
                {result?.moderation_action || 'IDLE'}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Latency</p>
              <p className="text-xl text-cyan-400 font-mono font-bold">
                {result ? `${result.latency_ms}ms` : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          <div className="card p-6 flex-1 flex flex-col">
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Multi-Label Classification
            </h2>

            <div className="space-y-5 flex-1">
              {!result && !error && (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm italic font-mono">
                  Awaiting inference input...
                </div>
              )}
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                </div>
              )}
              <AnimatePresence>
                {result && Object.entries(result.scores).map(([label, score], i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="space-y-1.5"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 capitalize font-medium">{label.replace(/_/g, ' ')}</span>
                      <span className="text-white font-mono font-semibold">{(score as number).toFixed(3)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(score as number) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.06 }}
                        className={cn(
                          "h-full rounded-full",
                          (score as number) > 0.7 ? "bg-red-500" : (score as number) > 0.4 ? "bg-amber-500" : "bg-blue-500"
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* System Log */}
            <div className="mt-6 p-4 rounded-lg bg-brand-bg border border-brand-border">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5">
                <Terminal className="w-3 h-3" /> System Log
              </p>
              <div className="text-[11px] font-mono space-y-1.5 max-h-28 overflow-y-auto">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-500 shrink-0">[NLP]</span>
                  <span className="text-slate-500">Preprocessing pipeline ready...</span>
                </div>
                {isAnalyzing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
                    <span className="text-yellow-500 shrink-0">[ML]</span>
                    <span className="text-slate-400">Running BERT inference...</span>
                  </motion.div>
                )}
                {result && (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 shrink-0">[ML]</span>
                      <span className="text-slate-400">Inference complete — {result.latency_ms}ms</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">[DB]</span>
                      <span className="text-slate-400">Results persisted to Supabase</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className={result.moderation_action === 'BLOCK' ? "text-red-500 shrink-0" : "text-emerald-500 shrink-0"}>
                        [ACT]
                      </span>
                      <span className="text-white">Action: {result.moderation_action} — Severity: {result.severity}</span>
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
