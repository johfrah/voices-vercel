"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from 'react';
import { VoiceglotText } from "./VoiceglotText";
import { MarketManager } from "@config/market-manager";

/**
 * HERO INSTRUMENT
 * 
 * De eerste indruk van de frontpage.
 * Volgt de Voices-Mix: Vivid Presence + 20px rond.
 */
export const HeroInstrument: React.FC = () => {
  const market = MarketManager.getCurrentMarket();
  const isPortfolio = market.market_code === 'JOHFRAH';
  const ctaHref = isPortfolio ? '/#demos' : '/agency';

  return (
    <div className="va-hero-container relative overflow-hidden py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative z-10">
          <div className="va-hero-badge inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/10 mb-8">
            <Sparkles strokeWidth={1.5} size={12} fill="currentColor" /> <VoiceglotText translationKey="home.hero.badge" defaultText="De beste stemmen van de Benelux" />
          </div>
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black mb-8">
            <VoiceglotText translationKey="home.hero.title_part1" defaultText="Vind de " />
            <span className="text-primary italic">
              <VoiceglotText translationKey="home.hero.title_highlight" defaultText="stem" />
            </span>
            <br />
            <VoiceglotText translationKey="home.hero.title_part2" defaultText="voor jouw verhaal." />
          </h1>
          <p className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight max-w-lg mb-12">
            <VoiceglotText translationKey="home.hero.subtitle" defaultText="Van bedrijfsfilm tot commercial. Wij vinden de beste stem voor jouw boodschap." />
          </p>
          <div className="flex items-center gap-4">
            <Link href={ctaHref} className="va-btn-pro !px-10 !py-6 text-base !rounded-[10px]"><VoiceglotText translationKey="home.hero.cta_primary" defaultText={isPortfolio ? "Bekijk mijn stemmen" : "Vind jouw stem"} /></Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg group">
          <Image 
            src="/assets/voices-photo.jpg" 
            alt="Voices Artist"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      </div>
    </div>
  );
};
