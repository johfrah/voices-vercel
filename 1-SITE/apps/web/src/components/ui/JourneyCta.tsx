"use client";

import React from 'react';
import { ArrowRight, Zap, Phone, Video, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
      color: 'bg-blue-600'
    },
    video: {
      title: 'Breng je beelden tot leven',
      text: 'Ontdek onze narratieve stemmen en vraag direct een offerte aan voor je e-learning of bedrijfsfilm.',
      cta: 'Bekijk stemmen',
      href: '/agency?category=video',
      icon: Video,
      color: 'bg-purple-600'
    },
    commercial: {
      title: 'Maak impact met je campagne',
      text: 'Boek een top-stem voor je radiospot of tv-commercial inclusief live-regie en buy-out.',
      cta: 'Bereken campagne-prijs',
      href: '/price?journey=commercial',
      icon: Megaphone,
      color: 'bg-primary'
    },
    general: {
      title: 'De perfecte stem gevonden?',
      text: 'Bereken direct je tarief of neem contact op voor advies op maat van onze experts.',
      cta: 'Bereken tarief',
      href: '/price',
      icon: Zap,
      color: 'bg-va-black'
    }
  };

  const config = configs[journey] || configs.general;
  const Icon = config.icon;

  return (
    <div className={cn("rounded-[40px] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 my-12 relative overflow-hidden shadow-2xl", config.color)}>
      <div className="relative z-10 space-y-4 text-center md:text-left">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto md:mx-0">
          <Icon size={24} />
        </div>
        <h3 className="text-3xl font-black tracking-tighter leading-none">{config.title}</h3>
        <p className="text-white/70 text-[15px] font-medium max-w-md">{config.text}</p>
      </div>
      
      <Link 
        href={config.href}
        className="relative z-10 px-10 py-5 bg-white text-va-black rounded-full font-black tracking-widest text-[15px] hover:scale-105 transition-all flex items-center gap-3 shadow-xl"
      >
        {config.cta} <ArrowRight strokeWidth={1.5} size={16} />
      </Link>

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24" />
    </div>
  );
};
