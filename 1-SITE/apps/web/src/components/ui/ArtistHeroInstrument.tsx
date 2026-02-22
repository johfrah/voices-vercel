"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VoiceglotText } from './VoiceglotText';
import { VoicesLink } from './VoicesLink';
import { ButtonInstrument } from './LayoutInstruments';

import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

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
    <header className="va-artist-hero">
      <nav className="va-artist-nav">
        <div className="va-container va-artist-nav-content">
          <div className="va-artist-nav-left">
            <Link  href="/agency" className="va-artist-back-link">
              <div className="va-artist-back-icon">
                <ArrowLeft strokeWidth={1.5} size={18} />
              </div>
              <span className="va-artist-back-text"><VoiceglotText  translationKey="auto.artistheroinstrument.agency.75ec3e" defaultText="Agency" /></span>
            </Link>
            
            <div className="va-artist-nav-links">
              {(market.nav_links || ['demos', 'tarieven', 'studio', 'contact']).map((item: any) => {
                const name = typeof item === 'string' ? item : item.name;
                const href = typeof item === 'string' ? `/${item}` : item.href;
                const key = typeof item === 'string' ? `nav.artist.${item}` : item.key;
                return (
                  <VoicesLink key={name} href={href} className="va-artist-nav-link">
                    {name}
                    <span className="va-artist-nav-link-indicator"></span>
                  </VoicesLink>
                );
              })}
            </div>
          </div>

          <div className="va-artist-nav-right">
            <ButtonInstrument as="button" className="va-btn-pro"><VoiceglotText  translationKey="artist.hero.cta_book" defaultText="Direct Boeken" /></ButtonInstrument>
          </div>
        </div>
      </nav>

      <section id="hero" className="va-artist-hero-section">
        <div className="va-container va-artist-hero-grid">
          <div className="va-artist-hero-content">
            <div className="va-artist-badge">
              <span className="va-artist-badge-dot"></span> 
              <VoiceglotText  translationKey="artist.hero.badge" defaultText="Official Voice Portfolio" />
            </div>
            <h1 className="va-artist-title font-light">
              {name.split(' ')[0]} <br />
              <span className="va-hmagic-text">{name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="va-artist-bio">
              {bio}
            </p>
            
            <div className="va-artist-hero-actions">
              <VoicesLink href="/demos" className="va-btn-pro">
                <VoiceglotText  translationKey="artist.hero.cta_demos" defaultText="Beluister Demo's" />
              </VoicesLink>
              <VoicesLink href="/tarieven" className="va-artist-btn-secondary">
                <VoiceglotText  translationKey="artist.hero.cta_rates" defaultText="Bekijk Tarieven" />
              </VoicesLink>
            </div>
          </div>
          
          <div className="va-artist-hero-visual">
            <div className="va-artist-image-wrapper">
              <Image  
                src={image} 
                alt={name} 
                fill
                className="va-artist-image"
              />
              <div className="va-artist-image-overlay"></div>
            </div>
            <div className="va-artist-aura-primary"></div>
            <div className="va-artist-aura-secondary"></div>
          </div>
        </div>
      </section>
    </header>
  );
};
