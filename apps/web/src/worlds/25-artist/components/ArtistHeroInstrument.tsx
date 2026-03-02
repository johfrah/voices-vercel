"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { VoicesLinkInstrument } from '@/components/ui/VoicesLinkInstrument';
import { ButtonInstrument, ContainerInstrument, SectionInstrument, HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';

import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

interface ArtistHeroInstrumentProps {
  name: string;
  bio: string;
  image: string;
}

/**
 *  ARTIST HERO INSTRUMENT (GOD MODE 2026)
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
  const market = MarketManager.getCurrentMarket();
  return (
    <ContainerInstrument as="header" plain className="va-artist-hero">
      <ContainerInstrument as="nav" plain className="va-artist-nav">
        <ContainerInstrument className="va-container va-artist-nav-content">
          <ContainerInstrument className="va-artist-nav-left">
            <Link  href="/agency" className="va-artist-back-link">
              <ContainerInstrument plain className="va-artist-back-icon">
                <ArrowLeft strokeWidth={1.5} size={18} />
              </ContainerInstrument>
              <TextInstrument as="span" className="va-artist-back-text"><VoiceglotText  translationKey="auto.artistheroinstrument.agency.75ec3e" defaultText="Agency" /></TextInstrument>
            </Link>
            
            <ContainerInstrument className="va-artist-nav-links">
              {(market.nav_links || ['demos', 'tarieven', 'studio', 'contact']).map((item: any) => {
                const name = typeof item === 'string' ? item : item.name;
                const href = typeof item === 'string' ? `/${item}` : item.href;
                const key = typeof item === 'string' ? `nav.artist.${item}` : item.key;
                return (
                  <VoicesLinkInstrument key={name} href={href} className="va-artist-nav-link">
                    {name}
                    <TextInstrument as="span" className="va-artist-nav-link-indicator"></TextInstrument>
                  </VoicesLinkInstrument>
                );
              })}
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="va-artist-nav-right">
            <ButtonInstrument as="button" className="va-btn-pro"><VoiceglotText  translationKey="artist.hero.cta_book" defaultText="Direct Boeken" /></ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <SectionInstrument id="hero" className="va-artist-hero-section">
        <ContainerInstrument className="va-container va-artist-hero-grid">
          <ContainerInstrument className="va-artist-hero-content">
            <ContainerInstrument className="va-artist-badge">
              <TextInstrument as="span" className="va-artist-badge-dot"></TextInstrument> 
              <VoiceglotText  translationKey="artist.hero.badge" defaultText="Official Voice Portfolio" />
            </ContainerInstrument>
            <HeadingInstrument level={1} className="va-artist-title font-light">
              {name.split(' ')[0]} <br />
              <TextInstrument as="span" className="va-hmagic-text">{name.split(' ').slice(1).join(' ')}</TextInstrument>
            </HeadingInstrument>
            <TextInstrument className="va-artist-bio">
              {bio}
            </TextInstrument>
            
            <ContainerInstrument className="va-artist-hero-actions">
              <VoicesLinkInstrument href="/demos" className="va-btn-pro">
                <VoiceglotText  translationKey="artist.hero.cta_demos" defaultText="Beluister Demo's" />
              </VoicesLinkInstrument>
              <VoicesLinkInstrument href="/tarieven" className="va-artist-btn-secondary">
                <VoiceglotText  translationKey="artist.hero.cta_rates" defaultText="Bekijk Tarieven" />
              </VoicesLinkInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="va-artist-hero-visual">
            <ContainerInstrument className="va-artist-image-wrapper">
              <Image  
                src={image} 
                alt={name} 
                fill
                className="va-artist-image"
              />
              <ContainerInstrument plain className="va-artist-image-overlay"></ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument plain className="va-artist-aura-primary"></ContainerInstrument>
            <ContainerInstrument plain className="va-artist-aura-secondary"></ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </ContainerInstrument>
  );
};
