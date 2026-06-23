import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Activity, Cpu, Network, CheckCircle2 } from 'lucide-react';
import { api } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';
import type { ModelPerformanceData } from '@/src/types';
import { ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart, Tooltip } from 'recharts';

export default function ModelPerformance() {
  const [data, setData] = useState<ModelPerformanceData | null>(null);

  useEffect(() => {
    api.getModelMetrics().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton h-[400px] rounded-xl" />
          <div className="skeleton h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const radarData = Object.entries(data.roc_auc).map(([key, value]) => ({
    subject: key.replace(/_/g, ' '),
    A: value * 100,
    fullMark: 100,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Insight Metrics</h1>
          <p className="text-slate-500 text-sm mt-1">Sentiment & intent model performance metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-bg border border-brand-border px-3 py-1.5 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-400 font-mono">MODEL: {data.current.model_version.toUpperCase()}</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Accuracy', value: (data.current.accuracy * 100).toFixed(1) + '%', color: 'text-indigo-400' },
          { label: 'Precision', value: (data.current.precision_score * 100).toFixed(1) + '%', color: 'text-blue-400' },
          { label: 'Recall', value: (data.current.recall * 100).toFixed(1) + '%', color: 'text-cyan-400' },
          { label: 'F1 Score', value: (data.current.f1_score * 100).toFixed(1) + '%', color: 'text-emerald-400' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</h3>
            <p className={cn("text-2xl font-bold font-mono mt-1", kpi.color)}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC AUC Radar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 flex flex-col h-[400px]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Class-wise ROC-AUC Score
          </h3>
          <div className="flex-1 -mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1C1C1F" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, className: 'capitalize' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                <Radar name="ROC-AUC" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', border: '1px solid #1C1C1F', borderRadius: '8px', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Model Arch */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 flex flex-col h-[400px]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-400" /> Sentiment Engine Architecture
          </h3>
          <div className="flex-1 space-y-6">
            <div className="p-4 bg-brand-bg rounded-lg border border-brand-border flex items-start gap-4">
              <BrainCircuit className="w-6 h-6 text-indigo-400 mt-1" />
              <div>
                <h4 className="text-sm font-semibold text-white">Transformer Backbone</h4>
                <p className="text-xs text-slate-400 mt-1">nlptown/bert-base-multilingual-uncased-sentiment</p>
                <div className="flex gap-4 mt-3 text-[10px] font-mono text-slate-500">
                  <span>LAYERS: 12</span>
                  <span>HEADS: 12</span>
                  <span>PARAMS: 110M</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-brand-bg rounded-lg border border-brand-border flex items-start gap-4">
              <Cpu className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h4 className="text-sm font-semibold text-white">Classification Head</h4>
                <p className="text-xs text-slate-400 mt-1">Multi-label sequence classification with NLP enrichments</p>
                <div className="flex gap-4 mt-3 text-[10px] font-mono text-slate-500">
                  <span>OUT: 11 CATEGORIES (3 Sentiment + 8 Intent)</span>
                  <span>ACT: SOFTMAX + SIGMOID</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-1" />
              <div>
                <h4 className="text-sm font-semibold text-white">Production Ready</h4>
                <p className="text-xs text-slate-400 mt-1">Model is currently handling 100% of production traffic.</p>
                <p className="text-xs text-emerald-500 font-mono mt-2">AVG LATENCY: {data.current.avg_latency_ms}ms</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
