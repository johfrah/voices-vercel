"use client";

import React from 'react';
import Image from 'next/image';
import { VoiceglotText } from './VoiceglotText';
import { FilterBar } from './FilterBar';

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
 * ⚡ AGENCY HERO INSTRUMENT (GOD MODE 2026)
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
  return (
    <header className="va-agency-hero">
      <div className="va-container">
        <div className="va-hero-content">
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
            {title ? (
              <VoiceglotText  translationKey="agency.hero.custom_title" defaultText={title} />
            ) : (
              <>
                <VoiceglotText  translationKey="agency.hero.title.line1" defaultText="Vind jouw" />
                <br />
                <span className="va-hmagic-text">
                  <VoiceglotText  translationKey="agency.hero.title.line2" defaultText="Stemacteur." />
                </span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="va-hero-description">
            {subtitle ? (
              <VoiceglotText  translationKey={`agency.hero.subtitle.${market.toLowerCase()}`} defaultText={subtitle} />
            ) : (
              <VoiceglotText  
                translationKey="agency.hero.description" 
                defaultText="Luister naar de beste stemmen voor jouw project. Van verteller tot commercial. Wij vinden de juiste toon voor elk merk." 
              />
            )}
          </p>
        </div>

        {/* Filter Bar Integration */}
        {filters.languages.length > 0 && <FilterBar strokeWidth={1.5} filters={filters} params={{ ...searchParams, market }} />}
      </div>
    </header>
  );
};
