"use client";

import React from 'react';
import { BentoCard } from './BentoGrid';
import { Phone, Video, Megaphone, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';

interface RateCardProps {
  journey: 'telephony' | 'video' | 'commercial';
  className?: string;
}

export const RateCard: React.FC<RateCardProps> = ({ journey, className }) => {
  const defaultConfig = SlimmeKassa.getDefaultConfig();
  const telephonyBase = Math.round((defaultConfig.telephonyBasePrice || 8900) / 100);
  const videoBase = Math.round((defaultConfig.videoBasePrice || 24900) / 100);
  const commercialBase = Math.round((defaultConfig.basePrice || 19900) / 100);

  const configs = {
    telephony: {
      title: 'Telefonie & Onthaal',
      icon: Phone,
      price: `${telephonyBase}`,
      unit: 'voor de eerste 25 woorden',
      features: [
        'Exacte prijs via woord-slider',
        '8kHz & 48kHz formaten',
        'Inclusief nabewerking',
        'Levering binnen 24u'
      ],
      color: 'bg-blue-500/10 text-blue-600',
      badge: 'Meest gekozen'
    },
      video: {
      title: 'Video & E-learning',
      icon: Video,
      price: `${videoBase}`,
      unit: 'basis tarief',
      features: [
        'Bereken tot op de euro',
        ` 1 minuut per ${SlimmeKassa.getDefaultConfig().wordsPerMinute} woorden`,
        '48kHz Studiokwaliteit',
        'Retake garantie'
      ],
      color: 'bg-purple-500/10 text-purple-600',
      badge: 'High-end'
    },
    commercial: {
      title: 'Commercials',
      icon: Megaphone,
      price: `${commercialBase}`,
      unit: 'BSF excl. buy-out',
      features: [
        'Radio spot, TV commercial of social ad',
        'Inclusief Live Regie',
        'Broadcast mastering',
        'Buy-out per medium, spot en duurtijd'
      ],
      color: 'bg-primary/10 text-primary',
      badge: 'Impact'
    }
  };

  const config = configs[journey];
  const Icon = config.icon;

  return (
    <div className={cn("bg-white rounded-[32px] p-8 border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden", className)}>
      {config.badge && (
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-va-black text-white text-[15px] font-black tracking-widest">
          {config.badge}
        </div>
      )}
      
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500", config.color)}>
        <Icon strokeWidth={1.5} size={24} />
      </div>

      <h3 className="text-lg font-light tracking-tight mb-1">{config.title}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-black text-va-black">{config.price}</span>
        <span className="text-[15px] font-bold text-va-black/30 tracking-widest">{config.unit}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {config.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-[15px] font-medium text-va-black/60">
            <CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="pt-6 border-top border-black/5">
        <div className="flex items-center gap-2 text-[15px] font-black tracking-[0.2em] text-primary group-hover:gap-3 transition-all">
          Vul je aantal woorden in voor de prijs <Zap strokeWidth={1.5} size={10} fill="currentColor" />
        </div>
      </div>
    </div>
  );
};
