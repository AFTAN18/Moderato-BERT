import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Users, AlertCircle, Zap, ShieldCheck, Activity } from 'lucide-react';
import { api } from '@/src/lib/api';
import type { AnalyticsData } from '@/src/types';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}{suffix}</>;
}

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.getAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-[380px] rounded-xl" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Analyzed', value: data.total_analyzed, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/15' },
    { label: 'Toxic Ratio', value: `${(data.toxic_ratio * 100).toFixed(1)}%`, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/15', raw: true },
    { label: 'Avg Latency', value: `${data.latency_avg_ms}ms`, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/15', raw: true },
    { label: 'System Health', value: '99.9%', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/15', raw: true },
  ];

  const actionPieData = [
    { name: 'Allow', value: data.action_distribution.ALLOW },
    { name: 'Flag', value: data.action_distribution.FLAG },
    { name: 'Block', value: data.action_distribution.BLOCK },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics Intelligence</h1>
        <p className="text-slate-500 text-sm">Aggregate metrics from all BERT inference pipelines.</p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5 flex items-start gap-4"
          >
            <div className={`p-2.5 rounded-lg border ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-0.5 tracking-tight">
                {stat.raw ? stat.value : <AnimatedNumber value={stat.value as number} />}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Trend */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card p-6 h-[380px] flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Inference Volume
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_stats}>
                <defs>
                  <linearGradient id="gCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1F" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', border: '1px solid #1C1C1F', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card p-6 h-[380px] flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Severity Distribution
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Low', value: data.severity_distribution.low, fill: '#3b82f6' },
                { name: 'Medium', value: data.severity_distribution.medium, fill: '#f59e0b' },
                { name: 'High', value: data.severity_distribution.high, fill: '#ef4444' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1F" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', border: '1px solid #1C1C1F', borderRadius: '8px', fontSize: '11px' }} cursor={{ fill: '#1A1A1A', opacity: 0.3 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {[{ fill: '#3b82f6' }, { fill: '#f59e0b' }, { fill: '#ef4444' }].map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Action Distribution Pie + Label Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card p-6 h-[320px] flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Action Distribution</h3>
          <div className="flex-1 min-h-0 flex items-center gap-8">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={actionPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {actionPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111113', border: '1px solid #1C1C1F', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {actionPieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <div>
                    <p className="text-xs text-white font-medium">{d.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{d.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="card p-6 h-[320px] flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Label Frequency</h3>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {Object.entries(data.label_frequency).sort(([,a],[,b]) => b - a).map(([label, count]) => {
              const max = Math.max(...Object.values(data.label_frequency));
              const pct = (count / max) * 100;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 capitalize">{label.replace(/_/g, ' ')}</span>
                    <span className="text-white font-mono">{count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                      className="h-full bg-blue-500 rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
