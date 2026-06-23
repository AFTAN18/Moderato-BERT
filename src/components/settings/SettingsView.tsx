import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Bell, Shield, Database, Sliders } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';

export default function SettingsView() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings({ theme: 'dark', email_notifications: true });
      setTimeout(() => setSaving(false), 800);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Workspace Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your analytics workspace and AI thresholds.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </header>

      <div className="space-y-6">
        {/* Alerts & Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
            <Bell className="w-4 h-4 text-indigo-400" /> Alerts & Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-brand-border">
              <div>
                <h4 className="text-sm font-medium text-slate-300">Negative Sentiment Alerts</h4>
                <p className="text-xs text-slate-500 mt-0.5">Receive alerts for negative sentiment spikes</p>
              </div>
              <div className="w-10 h-5 bg-indigo-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-slate-300">Daily Analytics Summary</h4>
                <p className="text-xs text-slate-500 mt-0.5">Receive a daily digest of customer intelligence</p>
              </div>
              <div className="w-10 h-5 bg-indigo-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Thresholds */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
            <Sliders className="w-4 h-4 text-blue-400" /> Alert Thresholds
          </h2>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-300">Negative Alert Threshold</h4>
                <span className="text-xs font-mono text-red-400">75%</span>
              </div>
              <div className="h-2 bg-brand-bg rounded-full relative border border-brand-border">
                <div className="absolute left-0 top-0 h-full bg-red-500 rounded-full w-[75%]" />
                <div className="absolute top-1/2 -translate-y-1/2 left-[75%] w-4 h-4 bg-white rounded-full shadow border-2 border-red-500 cursor-grab" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Trigger alerts when negative sentiment score exceeds this threshold.</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-300">Churn Risk Threshold</h4>
                <span className="text-xs font-mono text-amber-400">40%</span>
              </div>
              <div className="h-2 bg-brand-bg rounded-full relative border border-brand-border">
                <div className="absolute left-0 top-0 h-full bg-amber-500 rounded-full w-[40%]" />
                <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-4 h-4 bg-white rounded-full shadow border-2 border-amber-500 cursor-grab" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Tag tickets for escalation when churn risk intent exceeds this score.</p>
            </div>
            
            <div className="pt-4 border-t border-brand-border">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Analysis Depth</h4>
              <div className="flex gap-3">
                <button className="flex-1 py-2 rounded-lg border border-brand-border bg-brand-bg text-slate-400 text-xs font-semibold hover:border-brand-border-subtle transition-colors">Basic</button>
                <button className="flex-1 py-2 rounded-lg border border-indigo-500 bg-indigo-500/10 text-indigo-400 text-xs font-semibold">Standard</button>
                <button className="flex-1 py-2 rounded-lg border border-brand-border bg-brand-bg text-slate-400 text-xs font-semibold hover:border-brand-border-subtle transition-colors">Deep NLP</button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Retention */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
            <Database className="w-4 h-4 text-emerald-400" /> Data Retention & Storage
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-brand-border">
              <div>
                <h4 className="text-sm font-medium text-slate-300">Log All Analyses</h4>
                <p className="text-xs text-slate-500 mt-0.5">Keep a record of all feedback processed</p>
              </div>
              <div className="w-10 h-5 bg-indigo-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-slate-300">Store Positive Results</h4>
                <p className="text-xs text-slate-500 mt-0.5">Save benign/positive feedback to database to save space</p>
              </div>
              <div className="w-10 h-5 bg-indigo-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 border border-red-500/20">
          <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4" /> API & Webhooks
          </h2>
          <p className="text-xs text-slate-400 mb-4">Configure webhooks to receive payloads on negative sentiment or churn risk events.</p>
          <div className="flex gap-3">
            <input type="text" readOnly value="whsec_1234567890abcdef1234567890abcdef" className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-slate-500 font-mono" />
            <button className="px-4 py-2 bg-brand-bg border border-brand-border hover:bg-brand-border rounded-lg text-sm font-medium text-white transition-colors">Rotate Key</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
