import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck, ArrowRight, Zap, BarChart3, Lock,
  Globe, BrainCircuit, CheckCircle2, ChevronRight,
} from 'lucide-react';

const features = [
  { icon: BrainCircuit, title: 'BERT Multi-Label AI', desc: 'Six-category toxicity detection with confidence scoring powered by transformer architecture.' },
  { icon: Zap, title: 'Real-Time Inference', desc: 'Sub-200ms latency with optimized preprocessing pipeline and batched tensor operations.' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Enterprise dashboards with severity distributions, trend analysis, and model performance tracking.' },
  { icon: Lock, title: 'Enterprise Security', desc: 'Row-level security, encrypted sessions, and SOC-2 compliant audit trails for every moderation action.' },
  { icon: Globe, title: 'Scalable Architecture', desc: 'Microservice design with independent scaling for API, ML inference, and database layers.' },
  { icon: ShieldCheck, title: 'Human-in-the-Loop', desc: 'Override AI decisions with full audit logging. Configurable sensitivity thresholds per workspace.' },
];

const stats = [
  { value: '14.5K+', label: 'Comments Analyzed' },
  { value: '<142ms', label: 'Avg Latency' },
  { value: '98.2%', label: 'Model Accuracy' },
  { value: '99.9%', label: 'Uptime SLA' },
];

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-brand-bg text-white overflow-y-auto">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-blue-500/4 rounded-full blur-[80px]" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-black font-bold text-xs">
            M
          </div>
          <span className="font-bold text-lg tracking-tight">Moderato</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onEnter} className="btn-ghost text-slate-400">
            Sign In
          </button>
          <button onClick={onEnter} className="btn-primary flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-20 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            BERT Transformer Architecture — v2.4 Stable
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
            AI-Powered Content
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient">
              Moderation
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Detect toxic comments in real-time with multi-label BERT classification.
            Six toxicity categories, confidence scoring, and enterprise-grade moderation workflows.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button onClick={onEnter} className="btn-primary text-base px-8 py-3 flex items-center gap-2 shadow-2xl shadow-blue-600/20">
              Launch Dashboard <ChevronRight className="w-5 h-5" />
            </button>
            <button className="btn-secondary text-base px-8 py-3">
              View Documentation
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="card p-6 text-center"
            >
              <p className="text-3xl font-black tracking-tight text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-28">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight">Enterprise-Grade Moderation</h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto">
            Built for scale. Every component designed for production workloads.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-6 space-y-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/15 transition-colors">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-white font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architecture Preview */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-8 space-y-6"
        >
          <h3 className="text-lg font-bold text-white">System Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Frontend', tech: 'React + Vite', status: 'Active' },
              { label: 'API Layer', tech: 'Express.js', status: 'Active' },
              { label: 'ML Service', tech: 'BERT Inference', status: 'Active' },
              { label: 'Database', tech: 'Supabase PG', status: 'Active' },
            ].map((node) => (
              <div key={node.label} className="bg-brand-bg border border-brand-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{node.label}</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {node.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">{node.tech}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            All services operational — Last checked 2s ago
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-brand-border py-8 px-8 text-center">
        <p className="text-xs text-slate-600 font-mono">
          MODERATO-BERT v2.4.12 // REAL-TIME TOXIC COMMENT DETECTION // PRODUCTION BUILD
        </p>
      </footer>
    </div>
  );
}
