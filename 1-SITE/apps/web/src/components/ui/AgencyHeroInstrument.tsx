"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
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
              <Sparkles size={12} className="va-icon-primary" fill="currentColor" /> 
              <VoiceglotText 
                translationKey="agency.hero.badge" 
                defaultText={market === 'BE' ? 'De beste Vlaamse en internationale stemmen' : 'De beste Nederlandse en internationale stemmen'} 
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="va-hero-title">
            {title ? (
              <VoiceglotText translationKey="agency.hero.custom_title" defaultText={title} />
            ) : (
              <>
                <VoiceglotText translationKey="agency.hero.title.line1" defaultText="Vind jouw" />
                <br />
                <span className="va-hmagic-text">
                  <VoiceglotText translationKey="agency.hero.title.line2" defaultText="Stemacteur." />
                </span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="va-hero-description">
            {subtitle ? (
              <VoiceglotText translationKey={`agency.hero.subtitle.${market.toLowerCase()}`} defaultText={subtitle} />
            ) : (
              <VoiceglotText 
                translationKey="agency.hero.description" 
                defaultText="Luister naar de beste stemmen voor jouw project. Van verteller tot commercial. Wij vinden de juiste toon voor elk merk." 
              />
            )}
          </p>
        </div>

        {/* Filter Bar Integration */}
        {filters.languages.length > 0 && <FilterBar filters={filters} params={searchParams} />}
      </div>
    </header>
  );
};
