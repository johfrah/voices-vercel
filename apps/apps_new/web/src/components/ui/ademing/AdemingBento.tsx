"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdemingHero } from './AdemingHero';
import { AdemingNav } from './AdemingNav';
import { AdemingTrackCard } from './AdemingTrackCard';
import { BreathingInstrument } from './BreathingInstrument';
import { MeditationPlayerInstrument } from './MeditationPlayerInstrument';
import { VoiceglotText } from '../VoiceglotText';
import { Testimonials } from './Testimonials';
import { Moon, Zap, Clock, ArrowRight, Compass, Users, Instagram, Globe } from 'lucide-react';
import { VoicesDropdown } from '../VoicesDropdown';
import { ElementIcon } from './ElementIcon';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { ContainerInstrument, HeadingInstrument, TextInstrument, SectionInstrument } from '../LayoutInstruments';

interface AdemingBentoProps {
  tracks: any[];
  initialTrack?: any;
  mode?: 'home' | 'library' | 'favorites' | 'search' | 'profile';
}

export const AdemingBento = ({ tracks, initialTrack, mode = 'home' }: AdemingBentoProps) => {
  const [activeTrack, setActiveTrack] = useState<any | null>(initialTrack || null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Performance: Pre-fetch player components
  useEffect(() => {
    import('./MeditationPlayerInstrument');
    import('./AudioWaveform');
  }, []);

  const publishedTracks = tracks.filter(t => t.is_public);

  // Filter tracks based on mode and selections
  const filteredTracks = publishedTracks.filter(track => {
    if (selectedTheme && track.theme !== selectedTheme) return false;
    if (selectedElement && track.element !== selectedElement) return false;
    return true;
  });

  return (
    <ContainerInstrument plain className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <AdemingNav />
      
      <ContainerInstrument plain>
        {mode === 'home' && (
          <AdemingHero 
            featuredTrack={filteredTracks[0]} 
            onTrackClick={(track) => setActiveTrack(track)} 
          />
        )}

        {/* Main Container - Minimalist MVP View */}
        <ContainerInstrument className="max-w-6xl mx-auto px-6 space-y-40 py-32">
          
          {/* Softlaunch Message Section */}
          <SectionInstrument className="animate-fade-in text-center space-y-12" style={{ animationDelay: '0.1s' }}>
            <div className="max-w-3xl mx-auto space-y-8">
              <HeadingInstrument level={2} className="text-3xl md:text-5xl font-serif font-bold tracking-tight">
                <VoiceglotText translationKey="softlaunch.title" defaultText="Binnenkort openen we de volledige bibliotheek" />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-muted-foreground font-light leading-relaxed">
                <VoiceglotText 
                  translationKey="softlaunch.subtitle" 
                  defaultText="We leggen momenteel de laatste hand aan een collectie van meer dan 50 meditaties. Voor nu nodigen we je uit om te landen met onze eerste sessie." 
                />
              </TextInstrument>
            </div>
          </SectionInstrument>

          {/* Breathing Section - Softlaunch focus */}
          <SectionInstrument className="animate-fade-in py-16" style={{ animationDelay: '0.3s' }}>
            <div className="max-w-4xl mx-auto space-y-16">
              <div className="text-center space-y-6">
                <HeadingInstrument level={2} className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
                  <VoiceglotText translationKey="softlaunch.breathing.title" defaultText="Even ademen" />
                </HeadingInstrument>
                <TextInstrument className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
                  <VoiceglotText 
                    translationKey="softlaunch.breathing.subtitle" 
                    defaultText="Soms is één bewuste ademhaling genoeg om weer te landen. Probeer onze ademhalingstool." 
                  />
                </TextInstrument>
              </div>
              <BreathingInstrument />
            </div>
          </SectionInstrument>

        </ContainerInstrument>
      </ContainerInstrument>

      {/* Fullscreen Player Portal */}
      <AnimatePresence>
        {activeTrack && (
          <MeditationPlayerInstrument 
            track={activeTrack} 
            onClose={() => setActiveTrack(null)} 
          />
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );
};
