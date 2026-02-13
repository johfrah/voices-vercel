"use client";

import { ArrowUpRight, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BentoCard } from '../ui/BentoGrid';

/**
 * ⚡ PROFIT ENGINE WIDGET (2026)
 * 
 * Deze component vervangt de PHP voices_render_profit_engine_widget.
 * Het toont de real-time financiële status van de systeem-kern.
 */

export const ProfitEngineWidget: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/backoffice/profit-engine');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (e) {
        console.error("Failed to fetch profit stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <BentoCard span="md" className="animate-pulse bg-va-off-white h-[300px]">
      <div className="w-full h-full" />
    </BentoCard>
  );

  if (!data) return null;

  const { stats } = data;

  return (
    <BentoCard span="md" className="bg-white border border-black/5 p-8 flex flex-col justify-between group overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-success/5 rounded-full blur-[100px] group-hover:bg-success/10 transition-colors duration-1000" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="w-12 h-12 bg-va-black rounded-xl flex items-center justify-center text-white shadow-lg">
            <Zap strokeWidth={1.5} size={20} />
          </div>
          <div className="text-right">
            <span className="text-[15px] font-black tracking-widest text-va-black/30">Status</span>
            <div className="flex items-center gap-2 text-success">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[15px] font-black tracking-widest">Winstgevend</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-[15px] font-black tracking-widest text-va-black/40 mb-1">Netto Winst (30d)</h3>
            <div className="text-5xl font-black tracking-tighter text-va-black">
              {stats.profit.formatted.split(',')[0]}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-va-off-white rounded-2xl border border-black/5">
              <p className="text-[15px] font-black tracking-widest text-va-black/30 mb-1">Omzet</p>
              <p className="text-lg font-black tracking-tight text-va-black">{stats.revenue.formatted}</p>
            </div>
            <div className="p-4 bg-va-off-white rounded-2xl border border-black/5">
              <p className="text-[15px] font-black tracking-widest text-va-black/30 mb-1">Marge</p>
              <p className="text-lg font-black tracking-tight text-success">{stats.margin.formatted}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 pt-6 border-t border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40">
          <TrendingUp size={14} className="text-success" />
          +12% vs vorige maand
        </div>
        <button className="p-2 bg-va-off-white hover:bg-primary hover:text-white rounded-lg transition-all">
          <ArrowUpRight size={16} />
        </button>
      </div>
    </BentoCard>
  );
};
