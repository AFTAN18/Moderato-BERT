import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { History, Search, Filter, ChevronDown, Clock, ExternalLink } from 'lucide-react';
import { api } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';
import type { HistoryEntry } from '@/src/types';

export default function HistoryView() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    api.getHistory().then(d => { setEntries(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = entries.filter(e => {
    const matchSearch = e.text.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'all' || e.action === filterAction;
    return matchSearch && matchAction;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Inference History</h1>
          <p className="text-slate-500 text-sm mt-1">Complete audit trail of all moderation predictions.</p>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-brand-card border border-brand-border px-3 py-1.5 rounded-lg">
          {entries.length} Records
        </span>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search comments..."
            className="input pl-10 py-2.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'ALLOW', 'FLAG', 'BLOCK'].map(action => (
            <button key={action} onClick={() => setFilterAction(action)}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-lg border transition-all",
                filterAction === action
                  ? "bg-blue-500/15 text-blue-400 border-blue-500/25"
                  : "bg-brand-card text-slate-500 border-brand-border hover:text-white hover:border-brand-border-subtle"
              )}>
              {action === 'all' ? 'All' : action}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-2">
        {filtered.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-brand-card-hover transition-colors"
            >
              <div className={cn(
                "w-2 h-2 rounded-full shrink-0",
                entry.action === 'BLOCK' ? 'bg-red-500' : entry.action === 'FLAG' ? 'bg-amber-500' : 'bg-emerald-500'
              )} />
              <p className="flex-1 text-sm text-slate-300 truncate">{entry.text}</p>
              <span className={cn(
                "badge text-[10px] shrink-0",
                entry.action === 'BLOCK' ? 'badge-block' : entry.action === 'FLAG' ? 'badge-flag' : 'badge-allow'
              )}>
                {entry.action}
              </span>
              <span className={cn(
                "badge text-[10px] shrink-0",
                entry.severity === 'high' ? 'badge-high' : entry.severity === 'medium' ? 'badge-medium' : 'badge-low'
              )}>
                {entry.severity}
              </span>
              <span className="text-[11px] text-slate-600 font-mono shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {entry.latency_ms}ms
              </span>
              <ChevronDown className={cn("w-4 h-4 text-slate-600 transition-transform", expanded === entry.id && "rotate-180")} />
            </button>

            {expanded === entry.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-brand-border p-4 bg-brand-bg"
              >
                <div className="grid grid-cols-6 gap-3">
                  {Object.entries(entry.scores).map(([label, score]) => (
                    <div key={label} className="space-y-1.5">
                      <p className="text-[10px] text-slate-500 capitalize">{label.replace(/_/g, ' ')}</p>
                      <div className="h-1 bg-brand-card rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", score > 0.7 ? "bg-red-500" : score > 0.4 ? "bg-amber-500" : "bg-blue-500")}
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white font-mono">{(score as number).toFixed(3)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
                  <span>Labels: {entry.labels.length > 0 ? entry.labels.join(', ') : 'none'}</span>
                  <span>•</span>
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <History className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No matching records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
