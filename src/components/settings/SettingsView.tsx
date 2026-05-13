import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Bell, Shield, Palette, Save, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function SettingsView() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'dark',
    email_notifications: true,
    sensitivity_level: 'medium',
    auto_block_threshold: 75,
    auto_flag_threshold: 40,
    log_all_predictions: true,
    webhook_url: '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your moderation workspace.</p>
        </div>
        <button onClick={handleSave} className={cn("btn-primary flex items-center gap-2", saved && "bg-emerald-600 hover:bg-emerald-600")}>
          {saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </header>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-400">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Appearance</h3>
            <p className="text-xs text-slate-500">Customize your dashboard theme.</p>
          </div>
        </div>
        <div className="flex gap-3">
          {['dark', 'light', 'system'].map(theme => (
            <button key={theme} onClick={() => update('theme', theme)}
              className={cn(
                "px-4 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all",
                settings.theme === theme
                  ? "bg-blue-500/15 text-blue-400 border-blue-500/25"
                  : "bg-brand-bg text-slate-500 border-brand-border hover:text-white"
              )}>
              {theme}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/15 text-amber-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
            <p className="text-xs text-slate-500">Alert preferences for moderation events.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive alerts for BLOCK actions</p>
            </div>
            <button onClick={() => update('email_notifications', !settings.email_notifications)}
              className={cn("w-11 h-6 rounded-full transition-colors relative",
                settings.email_notifications ? "bg-blue-500" : "bg-slate-700")}>
              <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
                settings.email_notifications ? "translate-x-6" : "translate-x-1")} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Log All Predictions</p>
              <p className="text-xs text-slate-500">Store ALLOW results in history</p>
            </div>
            <button onClick={() => update('log_all_predictions', !settings.log_all_predictions)}
              className={cn("w-11 h-6 rounded-full transition-colors relative",
                settings.log_all_predictions ? "bg-blue-500" : "bg-slate-700")}>
              <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
                settings.log_all_predictions ? "translate-x-6" : "translate-x-1")} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Moderation Thresholds */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/15 text-red-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Moderation Thresholds</h3>
            <p className="text-xs text-slate-500">Configure automatic action triggers.</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white">Auto-Block Threshold</p>
              <span className="text-sm font-mono text-red-400">{settings.auto_block_threshold}%</span>
            </div>
            <input type="range" min="50" max="100" value={settings.auto_block_threshold}
              onChange={e => update('auto_block_threshold', +e.target.value)}
              className="w-full h-1.5 bg-brand-bg rounded-full appearance-none cursor-pointer accent-red-500" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white">Auto-Flag Threshold</p>
              <span className="text-sm font-mono text-amber-400">{settings.auto_flag_threshold}%</span>
            </div>
            <input type="range" min="20" max="80" value={settings.auto_flag_threshold}
              onChange={e => update('auto_flag_threshold', +e.target.value)}
              className="w-full h-1.5 bg-brand-bg rounded-full appearance-none cursor-pointer accent-amber-500" />
          </div>
          <div>
            <p className="text-sm text-white mb-2">Sensitivity Level</p>
            <div className="flex gap-3">
              {['low', 'medium', 'high'].map(level => (
                <button key={level} onClick={() => update('sensitivity_level', level)}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all flex-1",
                    settings.sensitivity_level === level
                      ? "bg-blue-500/15 text-blue-400 border-blue-500/25"
                      : "bg-brand-bg text-slate-500 border-brand-border hover:text-white"
                  )}>
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Webhook */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-cyan-400">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Integrations</h3>
            <p className="text-xs text-slate-500">Connect external services.</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Webhook URL</label>
          <input
            value={settings.webhook_url} onChange={e => update('webhook_url', e.target.value)}
            placeholder="https://your-service.com/webhook"
            className="input text-sm"
          />
          <p className="text-[11px] text-slate-600 mt-2">POST requests will be sent for each BLOCK or FLAG event.</p>
        </div>
      </motion.div>
    </div>
  );
}
