import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck, BarChart3, History, Settings, LogOut,
  BrainCircuit, LayoutDashboard, Presentation
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { PageId } from '@/src/types';

const navItems: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Analyze', icon: LayoutDashboard },
  { id: 'executive', label: 'Executive', icon: Presentation },
  { id: 'analytics', label: 'Customer Analytics', icon: BarChart3 },
  { id: 'history', label: 'Feedback History', icon: History },
  { id: 'model', label: 'AI Insights', icon: BrainCircuit },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activeTab: PageId;
  setActiveTab: (id: PageId) => void;
  onSignOut: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onSignOut }: SidebarProps) {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('insightai_user') || '{}'); } catch { return {}; }
  })();

  return (
    <aside className="w-64 border-r border-brand-border bg-brand-surface flex flex-col h-screen fixed left-0 top-0 z-30 sidebar-desktop">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-brand-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <BrainCircuit className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white tracking-tight text-sm leading-tight">InsightAI</span>
          <span className="text-[10px] text-slate-600 font-mono">SENTIMENT v3.0</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Navigation</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group text-sm font-medium relative",
              activeTab === item.id
                ? "bg-brand-card text-white"
                : "text-slate-500 hover:text-white hover:bg-brand-card/50"
            )}
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full"
              />
            )}
            <item.icon className={cn(
              "w-4 h-4 transition-colors",
              activeTab === item.id ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"
            )} />
            {item.label}
          </button>
        ))}

        {/* Service Status */}
        <div className="px-3 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-6 mb-2">Services</div>
        <div className="space-y-2.5 px-3">
          {[
            { name: 'Sentiment Engine', status: 'Online' },
            { name: 'Supabase DB', status: 'Online' },
            { name: 'Intent Classifier', status: 'Online' },
          ].map(svc => (
            <div key={svc.name} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">{svc.name}</span>
              <span className="text-emerald-500 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {svc.status}
              </span>
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-3 mt-auto border-t border-brand-border">
        <div className="flex items-center gap-3 p-2.5 bg-brand-card rounded-lg border border-brand-border mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {(storedUser.name || storedUser.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium text-white truncate">
              {storedUser.name || storedUser.email?.split('@')[0] || 'Admin'}
            </span>
            <span className="text-[10px] text-slate-600 truncate">{storedUser.email || 'admin@insightai.com'}</span>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
