"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    BarChart3,
    ChevronRight,
    Database,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';

/**
 *  SPOTLIGHT DASHBOARD - HET CONTROLEPANEEL (2026)
 * Beheer-modus: Real-time monitoring van het systeem.
 */
export const SpotlightDashboard: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { playClick, playSwell } = useSonicDNA();
  const [activeTab, setActiveTab] = useState<'overview' | 'sync' | 'intelligence'>('overview');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const stats = [
    { label: 'CVR (Klant-focus)', value: '4.2%', change: '+0.8%', icon: <TrendingUp strokeWidth={1.5} size={14} /> },
    { label: 'Sync Status', value: '100%', change: 'Stabiel', icon: <ShieldCheck strokeWidth={1.5} size={14} /> },
    { label: 'AI Nauwkeurigheid', value: '92%', change: '+5%', icon: <Zap strokeWidth={1.5} size={14} /> },
    { label: 'Actieve Sessies', value: '12', change: 'Live', icon: <Activity strokeWidth={1.5} size={14} /> },
  ];

  const handleOptimize = () => {
    setIsOptimizing(true);
    playClick('pro');
    setTimeout(() => {
      setIsOptimizing(false);
      playClick('success');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 w-[420px] h-full bg-va-black/95 backdrop-blur-3xl z-[150] border-l border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <BarChart3 strokeWidth={1.5} size={18} className="text-white" />
                </div>
                <h2 className="text-[15px] font-light tracking-[0.2em] text-white Raleway">Spotlight Cockpit</h2>
              </div>
              <button 
                onClick={() => { playClick('soft'); onClose(); }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <ChevronRight strokeWidth={1.5} size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
              {(['overview', 'sync', 'intelligence'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { playClick('soft'); setActiveTab(tab); }}
                  className={`flex-1 py-2 text-[15px] font-black uppercase tracking-widest rounded-[20px] transition-all ${
                    activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-white/30 mb-2">
                        {stat.icon}
                        <span className="text-[15px] font-black tracking-widest">{stat.label}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">{stat.value}</span>
                        <span className="text-[15px] font-bold text-primary">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-[15px] font-light tracking-widest text-white/40 Raleway">Systeem Status</h3>
                  <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-primary">
                        <Sparkles strokeWidth={1.5} size={16} />
                        <span className="text-[15px] font-black tracking-widest">Systeem Optimalisatie</span>
                      </div>
                      <div className="text-[15px] font-black text-white/40 tracking-widest">Gereed</div>
                    </div>
                    <p className="text-[15px] text-white/60 font-medium leading-relaxed">
                      Het systeem heeft 4 nieuwe optimalisaties gevonden voor de &quot;Agency&quot; journey op basis van recente data.
                    </p>
                    <button 
                      onClick={handleOptimize}
                      disabled={isOptimizing}
                      className="w-full bg-primary text-white py-4 rounded-xl text-[15px] font-black tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      {isOptimizing ? (
                        <>
                          <RefreshCcw strokeWidth={1.5} size={14} className="animate-spin" />
                          Bezig...
                        </>
                      ) : (
                        <>
                          <Zap strokeWidth={1.5} size={14} fill="currentColor" />
                          Optimalisaties toepassen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'sync' && (
              <div className="space-y-4">
                <h3 className="text-[15px] font-light tracking-widest text-white/40 Raleway">Atomic Sync Logs</h3>
                <div className="space-y-2">
                  {[
                    { msg: 'Voiceglot: agency.hero.title bijgewerkt', time: '2m ago', type: 'manual' },
                    { msg: 'PatternEngine: Affiniteit herberekend voor Acteur #42', time: '15m ago', type: 'auto' },
                    { msg: 'Yuki: Factuur #2026-492 gesynchroniseerd', time: '1h ago', type: 'auto' },
                    { msg: 'SystemLock: Handmatige aanpassing op Acteur #12', time: '3h ago', type: 'lock' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'manual' ? 'bg-primary' : log.type === 'lock' ? 'bg-red-500' : 'bg-white/20'}`} />
                        <span className="text-[15px] font-bold text-white/80">{log.msg}</span>
                      </div>
                      <span className="text-[15px] font-black text-white/20 ">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[15px] font-black tracking-widest text-white/40">
                <Database strokeWidth={1.5} size={12} />
                Master Registry
              </div>
              <div className="text-[15px] font-black text-primary">ENCRYPTED</div>
            </div>
            <p className="text-[15px] text-white/20 font-medium italic">
              Voices Core v2.4.0  Beheer-modus Actief
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
