import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { BrainCircuit, TrendingUp, Activity, Clock, Target, Award } from 'lucide-react';
import { api } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';

export default function ModelPerformance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getModelMetrics().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="skeleton h-[400px] rounded-xl" />
      </div>
    );
  }

  const { current, history, roc_auc } = data;
  const metrics = [
    { label: 'Accuracy', value: (current.accuracy * 100).toFixed(1) + '%', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/15' },
    { label: 'Precision', value: (current.precision_score * 100).toFixed(1) + '%', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/15' },
    { label: 'Recall', value: (current.recall * 100).toFixed(1) + '%', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/15' },
    { label: 'F1 Score', value: (current.f1_score * 100).toFixed(1) + '%', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/15' },
  ];

  const radarData = Object.entries(roc_auc).map(([label, score]) => ({
    label: label.replace(/_/g, ' '),
    value: (score as number) * 100,
  }));

  const versionData = history.map((h: any) => ({
    version: h.model_version,
    accuracy: +(h.accuracy * 100).toFixed(1),
    f1: +(h.f1_score * 100).toFixed(1),
    latency: h.avg_latency_ms,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Model Performance</h1>
          <p className="text-slate-500 text-sm mt-1">BERT transformer metrics and ROC-AUC analysis.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 bg-brand-card border border-brand-border rounded-lg text-slate-400">
            {current.model_version}
          </span>
          <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            {current.total_inferences.toLocaleString()} inferences
          </span>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card p-5 flex items-start gap-4">
            <div className={`p-2.5 rounded-lg border ${m.bg} ${m.color}`}>
              <m.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</p>
              <p className="text-2xl font-bold text-white mt-0.5 tracking-tight">{m.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version History Line Chart */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card p-6 h-[400px] flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Version Performance Trend
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={versionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1F" />
                <XAxis dataKey="version" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[90, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', border: '1px solid #1C1C1F', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                <Line type="monotone" dataKey="f1" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3">
            <span className="flex items-center gap-2 text-[11px] text-slate-500"><div className="w-3 h-0.5 bg-blue-500 rounded" /> Accuracy</span>
            <span className="flex items-center gap-2 text-[11px] text-slate-500"><div className="w-3 h-0.5 bg-cyan-500 rounded" /> F1 Score</span>
          </div>
        </motion.div>

        {/* ROC-AUC Radar */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card p-6 h-[400px] flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Per-Label ROC-AUC
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1C1C1F" />
                <PolarAngleAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis domain={[95, 100]} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Model Info */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="card p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Model Architecture</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Architecture', value: 'BERT Base Uncased' },
            { label: 'Parameters', value: '110M' },
            { label: 'Hidden Layers', value: '12' },
            { label: 'Attention Heads', value: '12' },
            { label: 'Max Sequence', value: '512 tokens' },
            { label: 'Output Labels', value: '6 categories' },
            { label: 'Activation', value: 'Sigmoid' },
            { label: 'Avg Latency', value: `${current.avg_latency_ms}ms` },
          ].map(item => (
            <div key={item.label} className="bg-brand-bg border border-brand-border rounded-lg p-3">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm text-white font-medium mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
