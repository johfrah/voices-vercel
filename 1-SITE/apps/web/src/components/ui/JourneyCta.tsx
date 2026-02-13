"use client";

import { cn } from '@/lib/utils';
import { ArrowRight, Megaphone, Phone, Video, Zap } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface JourneyCtaProps {
  journey: 'telephony' | 'video' | 'commercial' | 'general';
}

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface JourneyCtaProps {
  journey: 'telephony' | 'video' | 'commercial' | 'general';
}

export const JourneyCta: React.FC<JourneyCtaProps> = ({ journey }) => {
  const configs = {
    telephony: {
      title: 'Klaar voor een warm onthaal?',
      key: 'journey.telephony.cta.title',
      text: 'Start direct met onze IVR-configurator of bereken je prijs voor een complete telefonieset.',
      textKey: 'journey.telephony.cta.text',
      cta: 'Start configuratie',
      ctaKey: 'journey.telephony.cta.button',
      href: '/configurator',
      icon: Phone,
      color: 'bg-blue-600'
    },
    video: {
      title: 'Breng je beelden tot leven',
      key: 'journey.video.cta.title',
      text: 'Ontdek onze narratieve stemmen en vraag direct een offerte aan voor je e-learning of bedrijfsfilm.',
      textKey: 'journey.video.cta.text',
      cta: 'Bekijk stemmen',
      ctaKey: 'journey.video.cta.button',
      href: '/agency?category=video',
      icon: Video,
      color: 'bg-purple-600'
    },
    commercial: {
      title: 'Maak impact met je campagne',
      key: 'journey.commercial.cta.title',
      text: 'Boek een top-stem voor je radiospot of tv-commercial inclusief live-regie en buy-out.',
      textKey: 'journey.commercial.cta.text',
      cta: 'Bereken campagne-prijs',
      ctaKey: 'journey.commercial.cta.button',
      href: '/price?journey=commercial',
      icon: Megaphone,
      color: 'bg-primary'
    },
    general: {
      title: 'De perfecte stem gevonden?',
      key: 'journey.general.cta.title',
      text: 'Bereken direct je tarief of neem contact op voor advies op maat van onze experts.',
      textKey: 'journey.general.cta.text',
      cta: 'Bereken tarief',
      ctaKey: 'journey.general.cta.button',
      href: '/price',
      icon: Zap,
      color: 'bg-va-black'
    }
  };

  const config = configs[journey] || configs.general;
  const Icon = config.icon;

  return (
    <ContainerInstrument className={cn("rounded-[20px] md:rounded-[32px] p-6 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 my-8 md:my-12 relative overflow-hidden shadow-aura-lg", config.color)}>
      <ContainerInstrument className="relative z-10 space-y-3 md:space-y-4 text-center md:text-left">
        <ContainerInstrument className="w-10 h-10 md:w-12 md:h-12 rounded-[10px] bg-white/10 flex items-center justify-center mx-auto md:mx-0">
          <Icon strokeWidth={1.5} size={20} />
        </ContainerInstrument>
        <HeadingInstrument level={3} className="text-2xl md:text-3xl font-light tracking-tighter leading-none ">
          <VoiceglotText translationKey={config.key} defaultText={config.title} />
        </HeadingInstrument>
        <TextInstrument className="text-white/70 text-[15px] md:text-[15px] font-light max-w-md">
          <VoiceglotText translationKey={config.textKey} defaultText={config.text} />
        </TextInstrument>
      </ContainerInstrument>
      
      <ButtonInstrument 
        as={Link}
        href={config.href}
        className="relative z-10 px-8 md:px-10 py-4 md:py-5 bg-white text-va-black rounded-[10px] font-light tracking-widest text-[15px] md:text-[15px] hover:scale-105 transition-all flex items-center justify-center gap-2 md:gap-3 shadow-xl "
      >
        <VoiceglotText translationKey={config.ctaKey} defaultText={config.cta} /> <ArrowRight strokeWidth={1.5} size={14} />
      </ButtonInstrument>

      {/* Decorative background elements */}
      <ContainerInstrument className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full blur-2xl md:blur-3xl -mr-24 md:-mr-32 -mt-24 md:-mt-32" />
      <ContainerInstrument className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-black/10 rounded-full blur-xl md:blur-2xl -ml-16 md:-ml-24 -mb-16 md:-mb-24" />
    </ContainerInstrument>
  );
};
