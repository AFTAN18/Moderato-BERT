import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AnalysisDashboard from './components/AnalysisDashboard';
import AnalyticsView from './components/AnalyticsView';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { cn } from './lib/utils';
import { ShieldCheck, ArrowRight, Lock, Layout } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-slate-950">
         <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  // Simple pseudo-auth for demo if no Supabase keys exist
  // In a real app, this would be a proper Login screen
  if (!user && !localStorage.getItem('demo_bypass')) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-[overflow-hidden]">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/30 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-md w-full text-center space-y-8 relative z-10">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Enterprise NLP Moderation</h1>
            <p className="text-slate-400">Scale your safety operations with BERT-powered classification.</p>
          </div>
          
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <button 
              onClick={() => { localStorage.setItem('demo_bypass', 'true'); window.location.reload(); }}
              className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              Continue with Single Sign-On
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-mono uppercase tracking-widest">
              <Lock className="w-3 h-3" />
              AES-256 Encrypted Session
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-300 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#1F1F1F] flex items-center justify-between px-8 bg-[#0D0D0D] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Production</span>
            <span className="text-slate-700">/</span>
            <span className="text-white text-sm font-medium">Comment Analysis Lab</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">ML Inference Status</p>
              <p className="text-sm text-cyan-400 font-mono">STABLE</p>
            </div>
            <button className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded hover:bg-slate-200 transition-colors">Deploy Model</button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className={cn("transition-opacity duration-300 h-full", activeTab === 'dashboard' ? 'opacity-100' : 'opacity-0 hidden')}>
            <AnalysisDashboard />
          </div>
          <div className={cn("transition-opacity duration-300 h-full", activeTab === 'analytics' ? 'opacity-100' : 'opacity-0 hidden')}>
            <AnalyticsView />
          </div>
          <div className={cn("transition-opacity duration-300 h-full", activeTab === 'history' || activeTab === 'model' || activeTab === 'settings' ? 'opacity-100' : 'opacity-0 hidden')}>
            <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-[#111111] rounded-2xl mx-auto flex items-center justify-center border border-[#1F1F1F] text-slate-500">
                 <Layout className="w-8 h-8" />
               </div>
               <h2 className="text-2xl font-bold text-white capitalize">{activeTab} Page</h2>
               <p className="text-slate-500 max-w-sm mx-auto">This module is part of the Enterprise expansion. All core moderation logic is available in the <span className="text-blue-400 font-bold uppercase tracking-tighter">Monitor</span> tab.</p>
            </div>
          </div>
        </div>

        {/* Bottom System Health Bar */}
        <footer className="h-10 border-t border-[#1F1F1F] bg-[#0D0D0D] px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 flex-shrink-0">
          <div className="flex gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              API CLUSTER: 12 NODES HEALTHY
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              GPU UTILIZATION: 42%
            </div>
          </div>
          <div>BUILD v2.4.12-STABLE // REGION: ASIA-EAST-1</div>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

