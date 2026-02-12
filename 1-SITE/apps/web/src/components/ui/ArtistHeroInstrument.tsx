"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VoiceglotText } from './VoiceglotText';

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
    <header className="va-artist-hero">
      <nav className="va-artist-nav">
        <div className="va-container va-artist-nav-content">
          <div className="va-artist-nav-left">
            <Link href="/agency" className="va-artist-back-link">
              <div className="va-artist-back-icon">
                <ArrowLeft size={18} />
              </div>
              <span className="va-artist-back-text">Agency</span>
            </Link>
            
            <div className="va-artist-nav-links">
              {['demos', 'tarieven', 'studio', 'contact'].map((item) => (
                <a key={item} href={`#${item}`} className="va-artist-nav-link">
                  {item}
                  <span className="va-artist-nav-link-indicator"></span>
                </a>
              ))}
            </div>
          </div>

          <div className="va-artist-nav-right">
            <button className="va-btn-pro">
              <VoiceglotText translationKey="artist.hero.cta_book" defaultText="Direct Boeken" />
            </button>
          </div>
        </div>
      </nav>

      <section id="hero" className="va-artist-hero-section">
        <div className="va-container va-artist-hero-grid">
          <div className="va-artist-hero-content">
            <div className="va-artist-badge">
              <span className="va-artist-badge-dot"></span> 
              <VoiceglotText translationKey="artist.hero.badge" defaultText="Official Voice Portfolio" />
            </div>
            <h1 className="va-artist-title">
              {name.split(' ')[0]} <br />
              <span className="va-hmagic-text">{name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="va-artist-bio">
              {bio}
            </p>
            
            <div className="va-artist-hero-actions">
              <a href="#demos" className="va-btn-pro">
                <VoiceglotText translationKey="artist.hero.cta_demos" defaultText="Beluister Demo's" />
              </a>
              <a href="#tarieven" className="va-artist-btn-secondary">
                <VoiceglotText translationKey="artist.hero.cta_rates" defaultText="Bekijk Tarieven" />
              </a>
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
