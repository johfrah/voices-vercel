"use client";

import React from 'react';
import { User, LogOut } from 'lucide-react';
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
          <User size={12} className="va-icon-primary" fill="currentColor" strokeWidth={1.5} /> 
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
        <LogOut size={16} strokeWidth={1.5} /> 
        <VoiceglotText translationKey="common.logout" defaultText="Uitloggen" />
      </button>
    </div>
  );
};
