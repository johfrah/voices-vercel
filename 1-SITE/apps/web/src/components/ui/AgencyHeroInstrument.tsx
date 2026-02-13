"use client";

import React from 'react';
import Image from 'next/image';
import { VoiceglotText } from './VoiceglotText';
import { FilterBar } from './FilterBar';

import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  SectionInstrument
} from './LayoutInstruments';

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
    <SectionInstrument as="header" className="va-agency-hero py-12 md:py-24">
      <ContainerInstrument className="va-container">
        <ContainerInstrument className="va-hero-content space-y-6 md:space-y-8">
          {/* Badge */}
          <ContainerInstrument className="va-badge-container">
            <ContainerInstrument className="va-badge inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-black/5">
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
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Title */}
          <HeadingInstrument level={1} className="va-hero-title font-light text-4xl md:text-7xl tracking-tighter leading-tight">
            {title ? (
              <VoiceglotText  translationKey="agency.hero.custom_title" defaultText={title} />
            ) : (
              <>
                <VoiceglotText  translationKey="agency.hero.title.line1" defaultText="Vind jouw" />
                <br />
                <TextInstrument as="span" className="va-hmagic-text font-light">
                  <VoiceglotText  translationKey="agency.hero.title.line2" defaultText="Stemacteur." />
                </TextInstrument>
              </>
            )}
          </HeadingInstrument>

          {/* Description */}
          <TextInstrument className="va-hero-description text-lg md:text-xl text-va-black/60 max-w-2xl leading-relaxed font-light">
            {subtitle ? (
              <VoiceglotText  translationKey={`agency.hero.subtitle.${market.toLowerCase()}`} defaultText={subtitle} />
            ) : (
              <VoiceglotText  
                translationKey="agency.hero.description" 
                defaultText="Luister naar de beste stemmen voor jouw project. Van verteller tot commercial. Wij vinden de juiste toon voor elk merk." 
              />
            )}
          </TextInstrument>
        </ContainerInstrument>

        {/* Filter Bar Integration */}
        {filters.languages.length > 0 && (
          <ContainerInstrument className="mt-8 md:mt-12">
            <FilterBar strokeWidth={1.5} filters={filters} params={{ ...searchParams, market }} />
          </ContainerInstrument>
        )}
      </ContainerInstrument>
    </SectionInstrument>
  );
};
