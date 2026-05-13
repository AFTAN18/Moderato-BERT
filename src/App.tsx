/**
 * ═══════════════════════════════════════════════════════════════
 * MODERATO-BERT — ROOT APPLICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * APPLICATION FLOW:
 * 1. User lands on LandingPage → clicks "Get Started"
 * 2. User sees AuthPage (Login/Register) → authenticates
 * 3. Authenticated user enters Dashboard with Sidebar navigation
 * 4. Sidebar pages: Monitor | Analytics | History | Model | Settings
 *
 * STATE MANAGEMENT:
 * - App-level: currentPage state + auth state
 * - Per-page: Local state in each component
 * - Auth: localStorage demo bypass + Supabase real auth
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Sidebar from './components/Sidebar';
import AnalysisDashboard from './components/AnalysisDashboard';
import AnalyticsView from './components/AnalyticsView';
import HistoryView from './components/history/HistoryView';
import ModelPerformance from './components/model/ModelPerformance';
import SettingsView from './components/settings/SettingsView';
import LandingPage from './components/landing/LandingPage';
import AuthPage from './components/auth/AuthPage';
import { AuthProvider, useAuth } from './components/AuthProvider';
import type { PageId } from './types';

type AppView = 'landing' | 'auth' | 'app';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [view, setView] = useState<AppView>('landing');
  const [activeTab, setActiveTab] = useState<PageId>('dashboard');

  // Check auth state on mount
  useEffect(() => {
    if (user || localStorage.getItem('moderato_auth')) {
      setView('app');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">Initializing Moderato</p>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    localStorage.removeItem('moderato_auth');
    localStorage.removeItem('moderato_user');
    signOut();
    setView('landing');
  };

  // ─── Landing Page ──────────────────
  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('auth')} />;
  }

  // ─── Auth Page ─────────────────────
  if (view === 'auth') {
    return <AuthPage onAuthSuccess={() => setView('app')} />;
  }

  // ─── Main Dashboard ────────────────
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <AnalysisDashboard />;
      case 'analytics': return <AnalyticsView />;
      case 'history': return <HistoryView />;
      case 'model': return <ModelPerformance />;
      case 'settings': return <SettingsView />;
      default: return <AnalysisDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-slate-300 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} />

      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-brand-border flex items-center justify-between px-8 bg-brand-surface flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Production</span>
            <span className="text-slate-700">/</span>
            <span className="text-white font-medium capitalize">{activeTab === 'dashboard' ? 'Comment Analysis Lab' : activeTab === 'model' ? 'BERT Performance' : activeTab}</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">ML Status</p>
              <p className="text-xs text-emerald-400 font-mono font-semibold">OPERATIONAL</p>
            </div>
            <div className="w-px h-6 bg-brand-border" />
            <button className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-md hover:bg-slate-200 transition-colors">
              Deploy
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <footer className="h-9 border-t border-brand-border bg-brand-surface px-6 flex items-center justify-between text-[10px] font-mono text-slate-600 flex-shrink-0">
          <div className="flex gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API: 12 NODES HEALTHY
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              GPU: 42% UTILIZATION
            </div>
          </div>
          <div>BUILD v2.4.12-STABLE // MODERATO-BERT</div>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
