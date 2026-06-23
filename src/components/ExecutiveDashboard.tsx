import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Presentation, TrendingUp, Users, HeartPulse, Sparkles, MessageCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';
import type { ExecutiveDashboard as ExecutiveDashboardType } from '@/src/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ExecutiveDashboard() {
  const [data, setData] = useState<ExecutiveDashboardType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExecutiveDashboard().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton h-[400px] rounded-xl" />
          <div className="skeleton h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Executive Summary</h1>
          <p className="text-slate-500 text-sm mt-1">High-level customer intelligence KPIs and health metrics.</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-6 flex flex-col justify-between h-36 border-t-4 border-t-indigo-500">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-indigo-400" /> Overall Health
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">+2.4%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-white">{data.health_score}</span>
            <span className="text-sm text-slate-500 font-medium">/ 100</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 flex flex-col justify-between h-36 border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Satisfaction
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">+1.2%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-white">{data.satisfaction_index}</span>
            <span className="text-sm text-slate-500 font-medium">CSAT Index</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 flex flex-col justify-between h-36 border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Purchase Intent
            </h3>
            <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded">-0.8%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-white">{data.purchase_interest_index}</span>
            <span className="text-sm text-slate-500 font-medium">Index</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 flex flex-col h-[400px]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Presentation className="w-4 h-4 text-slate-400" /> Sentiment Trend (7 Days)
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sentiment_trend}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1F" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', border: '1px solid #1C1C1F', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="positive" stroke="#10b981" fill="url(#colorPos)" strokeWidth={2} />
                <Area type="monotone" dataKey="negative" stroke="#ef4444" fill="url(#colorNeg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Concerns & Pain Points */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6 flex flex-col h-[400px]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Top Customer Concerns
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {data.top_concerns.map((concern, i) => (
              <div key={i} className="bg-brand-bg border border-brand-border p-4 rounded-lg">
                <p className="text-sm text-slate-300 italic mb-3">"{concern.text}"</p>
                <div className="flex gap-2">
                  <span className={cn("badge text-[10px]", concern.sentiment === 'negative' ? 'badge-negative' : 'badge-neutral')}>
                    {concern.sentiment}
                  </span>
                  <span className="badge badge-intent text-[10px]">
                    {concern.intent.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Topics */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-400" /> Trending Topics
          </h3>
          <div className="space-y-3">
            {data.trending_topics.map((topic, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-sm font-medium text-white">{topic.topic}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">{topic.count.toLocaleString()} mentions</span>
                  {topic.trend === 'up' && <span className="text-emerald-400 text-xs">▲</span>}
                  {topic.trend === 'down' && <span className="text-red-400 text-xs">▼</span>}
                  {topic.trend === 'stable' && <span className="text-slate-400 text-xs">—</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card p-6 border border-indigo-500/20 bg-gradient-to-b from-indigo-500/5 to-transparent">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Product Improvement Suggestions
          </h3>
          <ul className="space-y-3">
            {data.improvement_suggestions.map((sugg, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <span className="text-sm text-slate-300 leading-relaxed">{sugg}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
