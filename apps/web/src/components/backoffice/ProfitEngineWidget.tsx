"use client";

import { ArrowUpRight, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BentoCard } from '../ui/BentoGrid';
import { 
  ContainerInstrument, 
  TextInstrument,
  HeadingInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '../ui/VoiceglotText';
import { cn } from '@/lib/utils';

/**
 *  PROFIT ENGINE WIDGET (2026)
 * 
 * Deze component vervangt de PHP voices_render_profit_engine_widget.
 * Het toont de real-time financile status van de systeem-kern van Voices.
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
      <ContainerInstrument className="w-full h-full" />
    </BentoCard>
  );

  if (!data) {
    return (
      <BentoCard span="md" className="bg-white border border-va-black/5 p-8 rounded-[20px]">
        <ContainerInstrument className="space-y-2">
          <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
            Profit Engine
          </HeadingInstrument>
          <TextInstrument className="text-va-black/50">
            Geen data beschikbaar op dit moment.
          </TextInstrument>
        </ContainerInstrument>
      </BentoCard>
    );
  }

  const summary = data.summary || {};
  const stats = data.stats || {};
  const profitValue = Number(summary.profit ?? stats.profit?.value ?? 0);
  const revenueValue = Number(summary.revenue ?? stats.revenue?.value ?? 0);
  const marginValue = typeof summary.margin === 'string'
    ? summary.margin
    : (stats.margin?.formatted || `${Number(stats.margin?.value || 0).toFixed(2)}%`);

  const formatEuro = (amount: number) => new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number.isFinite(amount) ? amount : 0);

  return (
    <BentoCard span="md" className="bg-white border border-va-black/5 p-8 flex flex-col justify-between group overflow-hidden relative">
      {/* Background Glow */}
      <ContainerInstrument className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-colors duration-1000" />

      <ContainerInstrument className="relative z-10">
        <ContainerInstrument className="flex items-center justify-between mb-8">
          <ContainerInstrument className="w-12 h-12 bg-va-black rounded-[10px] flex items-center justify-center text-white shadow-lg">
            <Zap strokeWidth={1.5} size={20} />
          </ContainerInstrument>
          <ContainerInstrument className="text-right">
            <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 ">
              <VoiceglotText  translationKey="common.status" defaultText="Status" />
            </TextInstrument>
            <ContainerInstrument className="flex items-center gap-2 text-emerald-500">
              <ContainerInstrument className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <TextInstrument className="text-[15px] font-light tracking-widest ">
                <VoiceglotText  translationKey="order.financial.profitable" defaultText="Winstgevend" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="space-y-6">
          <ContainerInstrument>
            <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest text-va-black/40 mb-1 ">
              <VoiceglotText  translationKey="order.financial.net_profit_30d" defaultText="Netto Winst (30d)" />
            </HeadingInstrument>
            <TextInstrument className="text-5xl font-light tracking-tighter text-va-black">
              {formatEuro(profitValue)}
            </TextInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-2 gap-4">
            <ContainerInstrument className="p-4 bg-va-off-white rounded-[20px] border border-va-black/5">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 mb-1 ">
                <VoiceglotText  translationKey="order.financial.revenue" defaultText="Omzet" />
              </TextInstrument>
              <TextInstrument className="text-lg font-light tracking-tight text-va-black">{formatEuro(revenueValue)}</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="p-4 bg-va-off-white rounded-[20px] border border-va-black/5">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 mb-1 ">
                <VoiceglotText  translationKey="order.financial.margin" defaultText="Marge" />
              </TextInstrument>
              <TextInstrument className="text-lg font-light tracking-tight text-emerald-500">{marginValue}</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="relative z-10 mt-8 pt-6 border-t border-va-black/5 flex items-center justify-between">
        <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 ">
          <TrendingUp size={14} className="text-emerald-500" strokeWidth={1.5} />
          <TextInstrument>+12% vs vorige maand</TextInstrument>
        </ContainerInstrument>
        <ButtonInstrument className="p-2 bg-va-off-white hover:bg-va-black hover:text-white rounded-[10px] transition-all">
          <ArrowUpRight size={16} strokeWidth={1.5} />
        </ButtonInstrument>
      </ContainerInstrument>
    </BentoCard>
  );
};
