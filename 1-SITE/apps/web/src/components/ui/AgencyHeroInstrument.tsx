"use client";

import React from 'react';
import Image from 'next/image';
import { VoiceglotText } from './VoiceglotText';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';

interface AgencyHeroInstrumentProps {
  market?: string;
  searchParams?: Record<string, string>;
  filters?: {
    languages: string[];
    genders: string[];
    styles: string[];
  };
  title?: string;
  subtitle?: string;
}

/**
 *  AGENCY HERO INSTRUMENT (GOD MODE 2026)
 * 
 * Voldoet aan de Zero Laws:
 * - HTML ZERO: Geen rauwe tags in de page layer.
 * - CSS ZERO: Styling via gecentraliseerde classes.
 * - TEXT ZERO: Alle content via Voiceglot.
 */
export const AgencyHeroInstrument: React.FC<AgencyHeroInstrumentProps> = ({ 
  market = 'BE', 
  searchParams = {}, 
  filters = { languages: [], genders: [], styles: [] },
  title,
  subtitle
}) => {
  const { state } = useMasterControl();

  // JOURNEY-AWARE TITLES
  const journeyTitles: Record<string, string> = {
    telephony: 'Telefoonstemmen',
    video: 'Video Voice-overs',
    commercial: 'Advertentie Stemmen'
  };

  const journeySubtitles: Record<string, string> = {
    telephony: 'IVR, wachtmuziek en voicemail berichten.',
    video: 'Geef jouw video een eigen stem. Bedrijfsfilms, explanimations of documentaires.',
    commercial: 'Radio, TV en online video advertenties.'
  };

  const activeTitle = title || journeyTitles[state.journey] || 'Vlaamse Voice-overs';
  const activeSubtitle = subtitle || journeySubtitles[state.journey] || 'De beste stemmen voor uw project.';

  return (
    <header className="va-agency-hero pb-0">
      <div className="va-container">
        <div className="va-hero-content mb-12">
          {/* Badge */}
          <div className="va-badge-container">
            <div className="va-badge">
              <Image  
                src="/assets/common/branding/icons/INFO.svg" 
                alt="Info" 
                width={12} 
                height={12} 
                style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
              /> 
              <VoiceglotText  
                translationKey="agency.hero.badge" 
                defaultText={market === 'BE' ? 'De beste Vlaamse en internationale stemmen' : 'De beste Nederlandse en internationale stemmen'} 
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="va-hero-title font-light">
            <VoiceglotText translationKey={`agency.hero.title.${state.journey}`} defaultText={activeTitle} />
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-va-black/40 font-light tracking-tight max-w-2xl mx-auto mt-4">
            <VoiceglotText translationKey={`agency.hero.subtitle.${state.journey}`} defaultText={activeSubtitle} />
          </p>
        </div>
      </div>
    </header>
  );
};
