"use client";

import { cn } from '@/lib/utils';
import { ArrowRight, Megaphone, Mic2, Phone, Video, Zap, GraduationCap } from 'lucide-react';
import { VoicesLink } from './VoicesLink';
import React from 'react';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

import { VoiceglotText } from './VoiceglotText';

interface JourneyCtaProps {
  journey: 'telephony' | 'video' | 'commercial' | 'general';
}

export const JourneyCta: React.FC<JourneyCtaProps> = ({ journey }) => {
  const configs = {
    telephony: {
      title: 'Klaar voor een warm onthaal?',
      text: 'Start direct met onze IVR-configurator of bereken je prijs voor een complete telefonieset.',
      cta: 'Start configuratie',
      href: '/configurator',
      icon: Phone,
      color: 'bg-blue-600',
      key: 'telephony'
    },
    video: {
      title: 'Breng je beelden tot leven',
      text: 'Ontdek onze narratieve stemmen en vraag direct een offerte aan voor je e-learning of bedrijfsfilm.',
      cta: 'Bekijk stemmen',
      href: '/agency?category=video',
      icon: Video,
      color: 'bg-purple-600',
      key: 'video'
    },
    commercial: {
      title: 'Maak impact met je campagne',
      text: 'Boek een top-stem voor je radiospot of tv-commercial inclusief live-regie en buy-out.',
      cta: 'Bereken campagne-prijs',
      href: '/tarieven?journey=commercial',
      icon: Megaphone,
      color: 'bg-primary',
      key: 'commercial'
    },
    general: {
      title: 'De perfecte stem gevonden?',
      text: 'Bereken direct je tarief of neem contact op voor advies op maat van onze experts.',
      cta: 'Bereken tarief',
      href: '/tarieven',
      icon: Zap,
      color: 'bg-primary',
      key: 'general'
    },
    studio: {
      title: 'Klaar om je stem te laten horen?',
      text: 'Ontdek onze workshops of start direct met de online Academy en ontwikkel je ambacht.',
      cta: 'Bekijk aanbod',
      href: '/studio',
      icon: Mic2,
      color: 'bg-primary',
      key: 'studio'
    },
    academy: {
      title: 'Klaar om het ambacht te leren?',
      text: 'Ontdek de online Academy en leer stap voor stap hoe je een luisteraar echt bereikt.',
      cta: 'Bekijk het traject',
      href: '/academy',
      icon: GraduationCap,
      color: 'bg-[#6366f1]',
      key: 'academy'
    }
  };

  const market = MarketManager.getCurrentMarket();
  const isStudio = market.market_code === 'STUDIO';
  const isAcademy = market.market_code === 'ACADEMY';
  const config = isStudio ? configs.studio : isAcademy ? configs.academy : (configs[journey] || configs.general);
  const Icon = config.icon;

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
