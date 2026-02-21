"use client";

import React from 'react';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { VoiceglotText } from './VoiceglotText';

import { useTranslation } from '@/contexts/TranslationContext';

interface AccountHeroInstrumentProps {
  userEmail?: string;
  onLogout: () => void;
  isAdmin?: boolean;
}

/**
 *  ACCOUNT HERO INSTRUMENT (GOD MODE 2026)
 * 
 * Voldoet aan de Zero Laws:
 * - HTML ZERO: Geen rauwe tags in de page layer.
 * - CSS ZERO: Styling via gecentraliseerde classes.
 * - TEXT ZERO: Alle content via Voiceglot.
 */
export const AccountHeroInstrument: React.FC<AccountHeroInstrumentProps> = ({ 
  userEmail, 
  onLogout,
  isAdmin = false
}) => {
  const { t } = useTranslation();
  const userName = userEmail?.split('@')[0] || 'User';
  const isPartner = userEmail?.includes('voices.be') || isAdmin;

  //  BOB-METHODE: Toon het dashboard pas als de sessie echt geland is
  if (!userEmail) return null;

  return (
    <div className="va-account-hero">
      <div className="va-account-hero-content">
        <div className="va-account-badge">
          <Image  
            src="/assets/common/branding/icons/ACCOUNT.svg" 
            alt={t('common.user', "User")} 
            width={12} 
            height={12} 
            className="w-3 h-3"
            style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
          /> 
          <VoiceglotText  
            translationKey="account.hero.welcome" 
            defaultText={`${t('common.welcome_back', "Welkom terug")}, ${userName}`} 
          />
        </div>
        <h1 className="va-account-title font-light">
          <VoiceglotText  translationKey="account.hero.title_part1" defaultText="Mijn " />
          <span className="va-text-primary">
            <VoiceglotText  translationKey="account.hero.title_part2" defaultText="Voices" />
          </span>
        </h1>
        <p className="va-account-subtitle">
          <VoiceglotText  
            translationKey="account.hero.subtitle" 
            defaultText="Beheer je bestellingen, cursussen en instellingen." 
          />
        </p>

        {/* Toegang Badges in Hero */}
        <div className="flex gap-2 mt-6">
          <div className="px-3 py-1 bg-va-black/5 border border-black/5 rounded-full text-[10px] font-bold tracking-widest uppercase text-va-black/40">
            <VoiceglotText translationKey="nav.access.customer" defaultText="Klant Account" />
          </div>
          {isAdmin && (
            <div className="px-3 py-1 bg-primary/10 border border-primary/10 rounded-full text-[10px] font-bold tracking-widest uppercase text-primary">
              <VoiceglotText translationKey="nav.access.admin" defaultText="Administrator" />
            </div>
          )}
          {isPartner && (
            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/10 rounded-full text-[10px] font-bold tracking-widest uppercase text-blue-500">
              <VoiceglotText translationKey="nav.access.partner" defaultText="Partner Toegang" />
            </div>
          )}
        </div>
      </div>
      <button onClick={onLogout} className="va-account-logout-btn">
        <LogOut strokeWidth={1.5} size={16} /> 
        <VoiceglotText  translationKey="common.logout" defaultText="Uitloggen" />
      </button>
    </div>
  );
};
