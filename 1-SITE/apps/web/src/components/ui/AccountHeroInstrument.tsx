"use client";

import React from 'react';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { VoiceglotText } from './VoiceglotText';

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from './LayoutInstruments';

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
    <ContainerInstrument className="va-account-hero p-6 md:p-12">
      <ContainerInstrument className="va-account-hero-content space-y-4 md:space-y-6">
        <ContainerInstrument className="va-account-badge flex items-center gap-2 p-2 rounded-full bg-va-black/5 w-fit">
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
        </ContainerInstrument>
        <HeadingInstrument level={1} className="va-account-title font-light text-4xl md:text-6xl">
          <VoiceglotText  translationKey="account.hero.title_part1" defaultText="Mijn " />
          <TextInstrument as="span" className="va-text-primary font-light">
            <VoiceglotText  translationKey="account.hero.title_part2" defaultText="Voices" />
          </TextInstrument>
        </HeadingInstrument>
        <TextInstrument className="va-account-subtitle text-lg md:text-xl text-va-black/40 font-light">
          <VoiceglotText  
            translationKey="account.hero.subtitle" 
            defaultText="Beheer je bestellingen, cursussen en instellingen." 
          />
        </TextInstrument>
      </ContainerInstrument>
      <ButtonInstrument onClick={onLogout} className="va-account-logout-btn mt-6 md:mt-8 flex items-center gap-2 px-6 py-3 rounded-xl bg-va-black text-white hover:bg-primary transition-all">
        <LogOut strokeWidth={1.5} size={16} /> 
        <VoiceglotText  translationKey="common.logout" defaultText="Uitloggen" />
      </ButtonInstrument>
    </ContainerInstrument>
  );
};
