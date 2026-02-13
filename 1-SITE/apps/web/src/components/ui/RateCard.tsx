"use client";

import React from 'react';
import { BentoCard } from './BentoGrid';
import { Phone, Video, Megaphone, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface RateCardProps {
  journey: 'telephony' | 'video' | 'commercial';
  className?: string;
}

export const RateCard: React.FC<RateCardProps> = ({ journey, className }) => {
  const configs = {
    telephony: {
      title: 'Telefonie & Onthaal',
      titleKey: 'pricing.journey.telephony.title',
      icon: Phone,
      price: '€89',
      unit: 'voor de eerste 25 woorden',
      unitKey: 'pricing.journey.telephony.unit',
      features: [
        { label: 'Exacte prijs via woord-slider', key: 'pricing.feature.exact_price' },
        { label: '8kHz & 48kHz formaten', key: 'pricing.feature.formats' },
        { label: 'Inclusief nabewerking', key: 'pricing.feature.post_processing' },
        { label: 'Levering binnen 24u', key: 'pricing.feature.delivery_24h' }
      ],
      color: 'bg-blue-500/10 text-blue-600',
      badge: 'Meest gekozen',
      badgeKey: 'common.most_chosen'
    },
    video: {
      title: 'Video & E-learning',
      titleKey: 'pricing.journey.video.title',
      icon: Video,
      price: '€175',
      unit: 'basis tarief',
      unitKey: 'pricing.journey.video.unit',
      features: [
        { label: 'Bereken tot op de euro', key: 'pricing.feature.euro_precision' },
        { label: '± 1 minuut per 160 woorden', key: 'pricing.feature.timing_estimate' },
        { label: '48kHz Studiokwaliteit', key: 'pricing.feature.studio_quality' },
        { label: 'Retake garantie', key: 'pricing.feature.retake_guarantee' }
      ],
      color: 'bg-purple-500/10 text-purple-600',
      badge: 'High-end',
      badgeKey: 'common.high_end'
    },
    commercial: {
      title: 'Commercials',
      titleKey: 'pricing.journey.commercial.title',
      icon: Megaphone,
      price: '€250',
      unit: 'excl. buy-out',
      unitKey: 'pricing.journey.commercial.unit',
      features: [
        { label: 'Radio, TV of Social Ads', key: 'pricing.feature.ad_types' },
        { label: 'Inclusief Live Regie', key: 'pricing.feature.live_direction' },
        { label: 'Broadcast mastering', key: 'pricing.feature.broadcast_mastering' },
        { label: 'Flexibele buy-outs', key: 'pricing.feature.flexible_buyouts' }
      ],
      color: 'bg-primary/10 text-primary',
      badge: 'Impact',
      badgeKey: 'common.impact'
    }
  };

  const config = configs[journey];
  const Icon = config.icon;

  return (
    <ContainerInstrument className={cn("bg-white rounded-[32px] p-6 md:p-8 border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden", className)}>
      {config.badge && (
        <ContainerInstrument className="absolute top-4 right-4 px-3 py-1 rounded-full bg-va-black text-white text-[15px] md:text-[15px] font-black tracking-widest">
          <VoiceglotText translationKey={config.badgeKey} defaultText={config.badge} />
        </ContainerInstrument>
      )}
      
      <ContainerInstrument className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-transform group-hover:scale-110 duration-500", config.color)}>
        <Icon strokeWidth={1.5} size={24} />
      </ContainerInstrument>

      <HeadingInstrument level={3} className="text-base md:text-lg font-light tracking-tight mb-1">
        <VoiceglotText translationKey={config.titleKey} defaultText={config.title} />
      </HeadingInstrument>
      <ContainerInstrument className="flex items-baseline gap-1 mb-4 md:mb-6">
        <TextInstrument as="span" className="text-2xl md:text-3xl font-black text-va-black">{config.price}</TextInstrument>
        <TextInstrument as="span" className="text-[15px] md:text-[15px] font-bold text-va-black/30 tracking-widest">
          <VoiceglotText translationKey={config.unitKey} defaultText={config.unit} />
        </TextInstrument>
      </ContainerInstrument>

      <ContainerInstrument as="ul" className="space-y-2 md:space-y-3 mb-6 md:mb-8">
        {config.features.map((feature, i) => (
          <ContainerInstrument as="li" key={i} className="flex items-center gap-2 text-[15px] md:text-[15px] font-medium text-va-black/60">
            <CheckCircle2 strokeWidth={1.5} size={14} className="text-green-500 shrink-0" />
            <VoiceglotText translationKey={feature.key} defaultText={feature.label} />
          </ContainerInstrument>
        ))}
      </ContainerInstrument>

      <ContainerInstrument className="pt-4 md:pt-6 border-t border-black/5">
        <ContainerInstrument className="flex items-center gap-2 text-[15px] md:text-[15px] font-black tracking-[0.2em] text-primary group-hover:gap-3 transition-all">
          <VoiceglotText translationKey="pricing.cta.fill_words" defaultText="Vul je aantal woorden in voor de prijs" /> <Zap strokeWidth={1.5} size={10} fill="currentColor" />
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
