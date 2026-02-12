"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import React from 'react';
import { VoiceglotText } from "./VoiceglotText";

/**
 * HERO INSTRUMENT
 * 
 * De eerste indruk van de frontpage.
 */
export const HeroInstrument: React.FC = () => {
  return (
    <div className="va-hero-container">
      <div className="va-hero-badge">
        <Sparkles size={12} fill="currentColor" /> <VoiceglotText translationKey="home.hero.badge" defaultText="De beste stemmen van de Benelux" />
      </div>
      <h1 className="va-hero-title">
        <VoiceglotText translationKey="home.hero.title_part1" defaultText="Vind de " />
        <span className="hmagic-text">
          <VoiceglotText translationKey="home.hero.title_highlight" defaultText="stem" />
        </span>
        <VoiceglotText translationKey="home.hero.title_part2" defaultText=" voor jouw verhaal." />
      </h1>
      <div className="va-hero-meta">
        <p className="va-hero-subtitle">
          <VoiceglotText translationKey="home.hero.subtitle" defaultText="Van bedrijfsfilm tot commercial. Wij vinden de beste stem voor jouw boodschap." />
        </p>
        <div className="va-hero-actions">
          <Link href="/agency" className="va-btn-pro !px-10 !py-6 text-base">
            <VoiceglotText translationKey="home.hero.cta_primary" defaultText="Bekijk alle stemmen" />
          </Link>
          <Link href="#how-it-works" className="va-hero-btn-secondary inline-flex items-center justify-center">
            <VoiceglotText translationKey="home.hero.cta_secondary" defaultText="Hoe wij werken" />
          </Link>
        </div>
      </div>
    </div>
  );
};
