"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VoiceglotText } from './VoiceglotText';

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  SectionInstrument, 
  TextInstrument 
} from './LayoutInstruments';

interface ArtistHeroInstrumentProps {
  name: string;
  bio: string;
  image: string;
}

/**
 * ⚡ ARTIST HERO INSTRUMENT (GOD MODE 2026)
 * 
 * Voldoet aan de Zero Laws:
 * - HTML ZERO: Geen rauwe tags in de page layer.
 * - CSS ZERO: Styling via gecentraliseerde classes.
 * - TEXT ZERO: Alle content via Voiceglot.
 */
export const ArtistHeroInstrument: React.FC<ArtistHeroInstrumentProps> = ({ 
  name, 
  bio, 
  image 
}) => {
  return (
    <SectionInstrument as="header" className="va-artist-hero">
      <ContainerInstrument as="nav" className="va-artist-nav py-4 md:py-6 border-b border-white/5">
        <ContainerInstrument className="va-container va-artist-nav-content flex items-center justify-between">
          <ContainerInstrument className="va-artist-nav-left flex items-center gap-6 md:gap-8">
            <Link  href="/agency" className="va-artist-back-link flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ContainerInstrument className="va-artist-back-icon w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <ArrowLeft strokeWidth={1.5} size={18} />
              </ContainerInstrument>
              <TextInstrument as="span" className="va-artist-back-text font-light tracking-widest text-[15px]"><VoiceglotText  translationKey="auto.artistheroinstrument.agency.75ec3e" defaultText="Agency" /></TextInstrument>
            </Link>
            
            <ContainerInstrument className="va-artist-nav-links hidden md:flex items-center gap-6">
              {['demos', 'tarieven', 'studio', 'contact'].map((item) => (
                <a key={item} href={`#${item}`} className="va-artist-nav-link text-[15px] font-light tracking-widest text-white/40 hover:text-white transition-all relative group">
                  {item}
                  <TextInstrument as="span" className="va-artist-nav-link-indicator absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full font-light"></TextInstrument>
                </a>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="va-artist-nav-right">
            <ButtonInstrument className="va-btn-pro py-3 px-6 !rounded-full"><VoiceglotText  translationKey="artist.hero.cta_book" defaultText="Direct Boeken" /></ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <SectionInstrument id="hero" className="va-artist-hero-section py-16 md:py-32">
        <ContainerInstrument className="va-container va-artist-hero-grid grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
          <ContainerInstrument className="va-artist-hero-content space-y-6 md:space-y-8">
            <ContainerInstrument className="va-artist-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 w-fit">
              <TextInstrument as="span" className="va-artist-badge-dot w-2 h-2 rounded-full bg-primary animate-pulse font-light"></TextInstrument> 
              <TextInstrument className="text-[15px] font-light tracking-widest text-white/60">
                <VoiceglotText  translationKey="artist.hero.badge" defaultText="Official Voice Portfolio" />
              </TextInstrument>
            </ContainerInstrument>
            <HeadingInstrument level={1} className="va-artist-title font-light text-5xl md:text-8xl tracking-tighter leading-tight text-white">
              {name.split(' ')[0]} <br />
              <TextInstrument as="span" className="va-hmagic-text text-primary font-light">
                {name.split(' ').slice(1).join(' ')}
              </TextInstrument>
            </HeadingInstrument>
            <TextInstrument className="va-artist-bio text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-xl">
              {bio}
            </TextInstrument>
            
            <ContainerInstrument className="va-artist-hero-actions flex flex-wrap items-center gap-4 md:gap-6">
              <a href="#demos">
                <ButtonInstrument className="va-btn-pro py-4 px-8 !rounded-full">
                  <VoiceglotText  translationKey="artist.hero.cta_demos" defaultText="Beluister Demo's" />
                </ButtonInstrument>
              </a>
              <a href="#tarieven" className="va-artist-btn-secondary text-white/40 hover:text-white transition-colors font-light tracking-widest text-[15px]">
                <VoiceglotText  translationKey="artist.hero.cta_rates" defaultText="Bekijk Tarieven" />
              </a>
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="va-artist-hero-visual relative">
            <ContainerInstrument className="va-artist-image-wrapper aspect-[4/5] rounded-[40px] overflow-hidden relative shadow-2xl border border-white/10">
              <Image  
                src={image} 
                alt={name} 
                fill
                className="va-artist-image object-cover"
              />
              <ContainerInstrument className="va-artist-image-overlay absolute inset-0 bg-gradient-to-t from-va-black via-transparent to-transparent opacity-40"></ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="va-artist-aura-primary absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></ContainerInstrument>
            <ContainerInstrument className="va-artist-aura-secondary absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-[100px]"></ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </SectionInstrument>
  );
};
