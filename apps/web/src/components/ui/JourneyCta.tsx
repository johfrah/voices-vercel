"use client";

import { cn } from '@/lib/utils';
import { ArrowRight, Megaphone, Mic2, Phone, Video, Zap, GraduationCap, type LucideIcon } from 'lucide-react';
import { VoicesLink } from './VoicesLink';
import React from 'react';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { resolveJourneyCtaConfig, type JourneyCtaJourney, type JourneyCtaKey } from '@/lib/system/constants/journey-cta';

import { VoiceglotText } from './VoiceglotText';

interface JourneyCtaProps {
  journey: JourneyCtaJourney;
}

export const JourneyCta: React.FC<JourneyCtaProps> = ({ journey }) => {
  const icons: Record<JourneyCtaKey, LucideIcon> = {
    telephony: Phone,
    video: Video,
    commercial: Megaphone,
    general: Zap,
    studio: Mic2,
    academy: GraduationCap,
  };

  const market = MarketManager.getCurrentMarket();
  const config = resolveJourneyCtaConfig(journey, market.market_code);
  const Icon = icons[config.key];

  return (
    <div className={cn("rounded-[20px] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 my-12 relative overflow-hidden shadow-aura-lg", config.color)}>
      <div className="relative z-10 space-y-4 text-center md:text-left">
        <div className="w-12 h-12 rounded-[10px] bg-white/10 flex items-center justify-center mx-auto md:mx-0">
          <Icon strokeWidth={1.5} size={24} />
        </div>
        <h3 className="text-3xl font-medium tracking-tighter leading-none">
          <VoiceglotText translationKey={`cta.${config.key}.title`} defaultText={config.title} />
        </h3>
        <p className="text-white/90 text-[15px] font-medium max-w-md">
          <VoiceglotText translationKey={`cta.${config.key}.text`} defaultText={config.text} />
        </p>
      </div>
      
      <VoicesLink  
        href={config.href}
        className="relative z-10 px-10 py-5 bg-white text-va-black rounded-[10px] font-medium tracking-widest text-[15px] hover:scale-105 transition-all flex items-center gap-3 shadow-xl "
      >
        <VoiceglotText translationKey={`cta.${config.key}.button`} defaultText={config.cta} /> <ArrowRight strokeWidth={1.5} size={16} />
      </VoicesLink>

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24" />
    </div>
  );
};
