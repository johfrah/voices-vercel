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
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { ContainerInstrument, HeadingInstrument, TextInstrument, SectionInstrument } from '../LayoutInstrumentsServer';

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
        {mode === 'home' && <AdemingHero />}

        {/* Main Container - Minimalist MVP View */}
        <ContainerInstrument className="max-w-6xl mx-auto px-6 space-y-40 py-32">
          
          {/* Tracks Grid Section - Show only the first (Lente) track */}
          <SectionInstrument className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {mode === 'home' && (
              <ContainerInstrument plain className="mb-16 space-y-4 text-center">
                <HeadingInstrument level={2} className="text-4xl md:text-6xl font-serif font-bold tracking-tight">
                  <VoiceglotText translationKey="home.featured.title" defaultText="Jouw eerste meditatie" />
                </HeadingInstrument>
                <TextInstrument className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                  <VoiceglotText translationKey="home.featured.subtitle" defaultText="Begin je reis met onze eerste aflevering: Lente." />
                </TextInstrument>
              </ContainerInstrument>
            )}
            
            <ContainerInstrument plain className="flex justify-center" id="meditatie">
              {filteredTracks.length > 0 ? (
                <div className="max-w-md w-full">
                  <AdemingTrackCard 
                    key={filteredTracks[0].id} 
                    track={filteredTracks[0]} 
                    onClick={() => setActiveTrack(filteredTracks[0])}
                  />
                </div>
              ) : (
                <ContainerInstrument plain className="w-full py-20 text-center bg-white/40 backdrop-blur-md rounded-[48px] border border-primary/5">
                  <TextInstrument className="text-muted-foreground italic">Geen meditaties gevonden.</TextInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
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

      {/* Simple Footer - Original Ademing branding */}
      <ContainerInstrument plain className="bg-background border-t border-border py-32 px-6">
        <ContainerInstrument className="max-w-7xl mx-auto flex flex-col items-center gap-16">
          <ContainerInstrument plain className="font-serif text-5xl font-semibold opacity-60 tracking-tighter animate-breathe-wave-subtle">
            <VoiceglotText translationKey="ademing.footer.logo" defaultText="ademing" />
          </ContainerInstrument>
          <ContainerInstrument plain className="flex flex-wrap justify-center gap-12 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
            <a href="mailto:hallo@ademing.be" className="hover:text-primary transition-colors">
              <VoiceglotText translationKey="ademing.footer.contact" defaultText="Contact" />
            </a>
          </ContainerInstrument>
          <TextInstrument className="text-sm text-muted-foreground/40 font-medium tracking-widest">
            <VoiceglotText translationKey="ademing.footer.copyright" defaultText="© 2026 ADEMING. EEN ZACHTE PLEK VOOR JEZELF." />
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
