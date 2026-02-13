"use client";

import React from 'react';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { VoiceglotText } from './VoiceglotText';

interface AccountHeroInstrumentProps {
  userEmail?: string;
  onLogout: () => void;
}

/**
 * ⚡ ACCOUNT HERO INSTRUMENT (GOD MODE 2026)
 * 
 * Voldoet aan de Zero Laws:
 * - HTML ZERO: Geen rauwe tags in de page layer.
 * - CSS ZERO: Styling via gecentraliseerde classes.
 * - TEXT ZERO: Alle content via Voiceglot.
 */
export const AccountHeroInstrument: React.FC<AccountHeroInstrumentProps> = ({ 
  userEmail, 
  onLogout 
}) => {
  const userName = userEmail?.split('@')[0] || 'User';

  return (
    <div className="va-account-hero">
      <div className="va-account-hero-content">
        <div className="va-account-badge">
          <Image 
            src="/assets/common/branding/icons/ACCOUNT.svg" 
            alt="User" 
            width={12} 
            height={12} 
            className="w-3 h-3"
            style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
          /> 
          <VoiceglotText 
            translationKey="account.hero.welcome" 
            defaultText={`Welkom terug, ${userName}`} 
          />
        </div>
        <h1 className="va-account-title font-light">
          <VoiceglotText translationKey="account.hero.title_part1" defaultText="Mijn " />
          <span className="va-text-primary">
            <VoiceglotText translationKey="account.hero.title_part2" defaultText="Voices" />
          </span>
        </h1>
        <p className="va-account-subtitle">
          <VoiceglotText 
            translationKey="account.hero.subtitle" 
            defaultText="Beheer je bestellingen, cursussen en instellingen." 
          />
        </p>
      </div>
      <button onClick={onLogout} className="va-account-logout-btn">
        <LogOut strokeWidth={1.5} size={16} /> 
        <VoiceglotText translationKey="common.logout" defaultText="Uitloggen" />
      </button>
    </div>
  );
};
