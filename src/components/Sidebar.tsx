import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  BarChart3, 
  History, 
  Settings, 
  LogOut, 
  BrainCircuit,
  MessageSquareWarning,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { cn } from '@/src/lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Monitor', icon: LayoutDashboard, path: '/' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'history', label: 'Inference History', icon: History, path: '/history' },
  { id: 'model', label: 'BERT Performance', icon: BrainCircuit, path: '/model' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) {
  const { signOut, user } = useAuth();

  return (
    <aside className="w-64 border-r border-[#1F1F1F] bg-[#0D0D0D] flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-[#1F1F1F]">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-black font-bold text-xs">
          BT
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-white tracking-tight leading-tight">BERT Mod-SaaS</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Main</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium",
              activeTab === item.id 
                ? "bg-[#1A1A1A] text-white"
                : "text-slate-400 hover:text-white hover:bg-[#141414]"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4 transition-colors",
              activeTab === item.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
            )} />
            {item.label}
          </button>
        ))}

        <div className="px-3 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2">Services</div>
        <div className="space-y-3 px-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">BERT Inference</span>
            <span className="text-emerald-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Online</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Supabase DB</span>
            <span className="text-emerald-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Online</span>
          </div>
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-[#1F1F1F]">
        <div className="flex items-center gap-3 p-2 bg-[#141414] rounded-lg border border-[#1F1F1F] mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium text-white truncate">{user?.email?.split('@')[0] || 'arch_admin'}</span>
            <span className="text-[10px] text-slate-500 truncate">Principal Engineer</span>
          </div>
        </div>
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
