import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Lock, BarChart3, Users, BrainCircuit, ArrowRight, Github, Database } from 'lucide-react';

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">InsightAI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <button onClick={onEnter} className="px-5 py-2 text-sm font-semibold bg-white text-black rounded-full hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              AI-Powered Customer Intelligence — v3.0
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Customer Intelligence <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
                At The Speed of Thought
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Analyze customer feedback, detect sentiment & intent, and extract actionable business insights in real-time with enterprise-grade NLP.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button onClick={onEnter} className="px-8 py-4 text-sm font-bold bg-indigo-500 text-white rounded-full hover:bg-indigo-400 transition-all shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] flex items-center gap-2 group">
                Launch Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 text-sm font-bold bg-white/5 text-white border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                View Documentation
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-24 border-y border-white/5 py-8">
            {[
              { label: 'Latency', value: '<120ms' },
              { label: 'Sentiment Accuracy', value: '96.4%' },
              { label: 'Reviews Processed', value: '28.3K+' },
              { label: 'Uptime', value: '99.99%' },
            ].map(stat => (
              <div key={stat.label} className="text-center space-y-1">
                <p className="text-3xl font-bold text-white font-mono tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </main>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BrainCircuit, title: 'Sentiment & Intent AI', desc: 'Pre-trained NLP models to accurately classify positive, negative, and neutral sentiment alongside 8 intent categories.' },
              { icon: Zap, title: 'Real-Time Analysis', desc: 'Process incoming feedback, support tickets, and surveys in milliseconds for immediate operational action.' },
              { icon: BarChart3, title: 'Business Intelligence', desc: 'Comprehensive executive dashboards and analytics views to track satisfaction, churn risk, and trending pain points.' },
              { icon: Lock, title: 'Enterprise Security', desc: 'Built with Supabase Row Level Security (RLS). Your customer data remains fully isolated and encrypted.' },
              { icon: Database, title: 'Scalable Architecture', desc: 'Stateless backend easily scales to handle thousands of requests per second during major product launches or events.' },
              { icon: Users, title: 'Actionable Insights', desc: 'Automatically extract topics, keywords, and discourse summaries to guide product development and support teams.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            INSIGHTAI v3.0 // CUSTOMER SENTIMENT & INTENT ANALYSIS // ENTERPRISE
          </p>
        </footer>
      </div>
    </div>
  );
}
