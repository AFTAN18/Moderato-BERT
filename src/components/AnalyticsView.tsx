import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Users, AlertCircle, Zap } from 'lucide-react';

export default function AnalyticsView() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8 text-slate-500 animate-pulse">Computing aggregate metrics...</div>;

  const stats = [
    { label: 'Total Analyzed', value: data.total_analyzed.toLocaleString(), icon: Users, color: 'text-indigo-400' },
    { label: 'Toxic Ratio', value: (data.toxic_ratio * 100).toFixed(1) + '%', icon: AlertCircle, color: 'text-red-400' },
    { label: 'Avg Latency', value: data.latency_avg_ms + 'ms', icon: Zap, color: 'text-amber-400' },
    { label: 'System Health', value: '99.9%', icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">System Analytics Intelligence</h1>
        <p className="text-slate-500 text-sm">Aggregate data across all BERT inference clusters and moderation pipelines.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl flex flex-col items-start gap-4"
          >
            <div className={`p-2 rounded-md bg-[#1A1A1A] border border-[#262626] ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl h-[400px] flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            Inference Volume Trends
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_stats}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #1F1F1F', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl h-[400px] flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            Severity Distribution
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Low', value: data.severity_distribution.low },
                { name: 'Medium', value: data.severity_distribution.medium },
                { name: 'High', value: data.severity_distribution.high }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #1F1F1F', borderRadius: '8px' }}
                  cursor={{ fill: '#1A1A1A', opacity: 0.4 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#3b82f6" barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
