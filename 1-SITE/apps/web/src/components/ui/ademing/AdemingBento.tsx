"use client";

import React, { useState } from 'react';
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
import { ContainerInstrument, HeadingInstrument, TextInstrument } from '../LayoutInstrumentsServer';

interface AdemingBentoProps {
  tracks: any[];
  initialTrack?: any;
}

export const AdemingBento = ({ tracks, initialTrack }: AdemingBentoProps) => {
  const [activeTrack, setActiveTrack] = useState<any | null>(initialTrack || null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const publishedTracks = tracks.filter(t => t.is_public);

  return (
    <ContainerInstrument plain className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <AdemingNav />
      
      <ContainerInstrument plain>
        <AdemingHero />

        {/* Main Container - Literal max-width 6xl from kelder */}
        <ContainerInstrument className="max-w-6xl mx-auto px-6 space-y-40 py-32">
          
          {/* Filters Section - Original spacing and depth */}
          <SectionInstrument className="bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-[48px] p-12 md:p-24 border border-primary/10 shadow-soft animate-fade-in hover:shadow-medium transition-all duration-1000">
            <ContainerInstrument plain className="mb-16 text-center space-y-6">
              <HeadingInstrument level={2} className="text-5xl md:text-7xl font-serif font-bold tracking-tight animate-gentle-float">
                <VoiceglotText translationKey="home.filters.title" defaultText="Vind jouw perfecte meditatie" />
              </HeadingInstrument>
              <TextInstrument className="text-muted-foreground text-2xl font-light max-w-2xl mx-auto leading-relaxed">
                <VoiceglotText translationKey="home.filters.subtitle" defaultText="Kies wat je zoekt en ontdek meditaties op maat" />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <VoicesDropdown 
                placeholder="🎯 Kies een thema"
                options={[
                  { label: "Alle thema's", value: "all" },
                  { label: "Rust", value: "rust", icon: Moon },
                  { label: "Energie", value: "energie", icon: Zap },
                  { label: "Ritme", value: "ritme", icon: Clock }
                ]}
                value={selectedTheme || "all"}
                onChange={(v: string) => setSelectedTheme(v === "all" ? null : v)}
                className="bg-white/60 backdrop-blur-md rounded-3xl border-2 border-transparent hover:border-primary/30 transition-all h-16 text-lg"
              />

              <VoicesDropdown 
                placeholder="🌿 Kies een element"
                options={[
                  { label: "Alle elementen", value: "all" },
                  { label: "Aarde", value: "aarde", icon: () => <ElementIcon element="aarde" /> },
                  { label: "Water", value: "water", icon: () => <ElementIcon element="water" /> },
                  { label: "Lucht", value: "lucht", icon: () => <ElementIcon element="lucht" /> },
                  { label: "Vuur", value: "vuur", icon: () => <ElementIcon element="vuur" /> }
                ]}
                value={selectedElement || "all"}
                onChange={(v: string) => setSelectedElement(v === "all" ? null : v)}
                className="bg-white/60 backdrop-blur-md rounded-3xl border-2 border-transparent hover:border-primary/30 transition-all h-16 text-lg"
              />

              <VoicesDropdown 
                placeholder="⏱️ Kies duur"
                options={[
                  { label: "Alle duur", value: "all" },
                  { label: "Kort (< 10 min)", value: "kort", icon: Clock },
                  { label: "Middel (10-20 min)", value: "middel", icon: Clock },
                  { label: "Lang (> 20 min)", value: "lang", icon: Clock }
                ]}
                value="all"
                onChange={() => {}}
                className="bg-white/60 backdrop-blur-md rounded-3xl border-2 border-transparent hover:border-primary/30 transition-all h-16 text-lg"
              />

              <VoicesDropdown 
                placeholder="👤 Kies begeleider"
                options={[
                  { label: "Alle begeleiders", value: "all" },
                  { label: "Julie", value: "julie" },
                  { label: "Johfrah", value: "johfrah" }
                ]}
                value="all"
                onChange={() => {}}
                className="bg-white/60 backdrop-blur-md rounded-3xl border-2 border-transparent hover:border-primary/30 transition-all h-16 text-lg"
              />
            </ContainerInstrument>
          </SectionInstrument>

          {/* Featured Meditations Section */}
          <SectionInstrument className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ContainerInstrument plain className="mb-24 space-y-6 text-center">
              <HeadingInstrument level={2} className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
                <VoiceglotText translationKey="home.featured.title" defaultText="Uitgelichte meditaties" />
              </HeadingInstrument>
              <TextInstrument className="text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                <VoiceglotText translationKey="home.featured.subtitle" defaultText="Onze aanbevolen meditaties om mee te beginnen" />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {publishedTracks.length > 0 ? publishedTracks.slice(0, 3).map((track) => (
                <AdemingTrackCard 
                  key={track.id} 
                  track={track} 
                  onClick={() => setActiveTrack(track)}
                />
              )) : (
                <ContainerInstrument plain className="col-span-full py-20 text-center bg-white/40 backdrop-blur-md rounded-[48px] border border-primary/5">
                  <TextInstrument className="text-muted-foreground italic">Geen meditaties gevonden.</TextInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          </SectionInstrument>

          {/* Meet Julie and Johfrah - Original CreatorBio style */}
          <SectionInstrument className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <ContainerInstrument plain className="mb-16 space-y-4 text-center">
              <HeadingInstrument level={2} className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
                <VoiceglotText translationKey="home.creators.title" defaultText="Maak kennis met Julie en Johfrah" />
              </HeadingInstrument>
              <TextInstrument className="text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
                <VoiceglotText translationKey="home.creators.subtitle" defaultText="Ontmoet de stemmen achter de meditaties" />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {[
                {
                  name: "Julie",
                  fullName: "Julie",
                  bio: "Julie brengt een zachte, liefdevolle energie in elke meditatie. Haar stem is een warme deken voor de ziel.",
                  avatar: "/assets/ademing/avatar-julie.jpg",
                  instagram: "@julie_ademing",
                  website: MarketManager.getMarketDomains()['ADEMING']
                },
                {
                  name: "Johfrah",
                  fullName: "Johfrah",
                  bio: "Johfrah's diepe, rustgevende stem helpt je om direct te landen in het hier en nu.",
                  avatar: "/assets/ademing/avatar-johfrah.jpg",
                  instagram: "@johfrah",
                  website: MarketManager.getMarketDomains()['BE']
                }
              ].map((maker) => (
                <ContainerInstrument key={maker.name} className="bg-white p-12 rounded-[64px] shadow-soft border border-primary/5 hover:shadow-medium hover:-translate-y-2 transition-all duration-700 group cursor-pointer">
                  <ContainerInstrument plain className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
                    <ContainerInstrument plain className="h-40 w-40 rounded-full overflow-hidden flex-shrink-0 border-8 border-primary/5 shadow-medium group-hover:scale-105 transition-transform duration-700">
                      <img src={maker.avatar} alt={maker.name} className="h-full w-full object-cover" />
                    </ContainerInstrument>
                    <ContainerInstrument plain className="flex-1 space-y-6">
                      <HeadingInstrument level={3} className="font-serif font-bold text-4xl group-hover:text-primary transition-colors">{maker.fullName}</HeadingInstrument>
                      <TextInstrument className="text-muted-foreground text-xl leading-relaxed font-light">
                        <VoiceglotText translationKey={`creator.${maker.name}.bio`} defaultText={maker.bio} />
                      </TextInstrument>
                      <ContainerInstrument plain className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold uppercase tracking-[0.2em] text-primary/60">
                        {maker.instagram && (
                          <TextInstrument className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Instagram size={16} />
                            {maker.instagram}
                          </TextInstrument>
                        )}
                        {maker.website && (
                          <TextInstrument className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Globe size={16} />
                            Website
                          </TextInstrument>
                        )}
                      </ContainerInstrument>
                      <ContainerInstrument plain className="pt-4 flex items-center justify-center md:justify-start gap-3 text-primary font-bold text-sm uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        Bekijk profiel <ArrowRight size={20} />
                      </ContainerInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </SectionInstrument>

        </ContainerInstrument>

        {/* Testimonials - Full width */}
        <ContainerInstrument plain className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Testimonials />
        </ContainerInstrument>

        {/* Breathing Exercise - Full width with original spacing */}
        <SectionInstrument className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-48 px-6 mt-32 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <ContainerInstrument plain className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl animate-breathe-glow" />
          <ContainerInstrument plain className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-breathe-glow" style={{ animationDelay: '-3s' }} />
          
          <ContainerInstrument className="max-w-4xl mx-auto relative">
            <ContainerInstrument plain className="text-center mb-20 space-y-6">
              <HeadingInstrument level={2} className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
                <VoiceglotText translationKey="home.breathing.title" defaultText="Neem even een bewuste adem" />
              </HeadingInstrument>
              <TextInstrument className="text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                <VoiceglotText translationKey="home.breathing.subtitle" defaultText="Probeer deze korte ademhalingsoefening en ervaar direct de kracht van bewust ademen" />
              </TextInstrument>
            </ContainerInstrument>
            <BreathingInstrument />
          </ContainerInstrument>
        </SectionInstrument>

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
          <ContainerInstrument plain className="font-serif text-5xl font-semibold opacity-60 tracking-tighter animate-breathe-wave-subtle">ademing</ContainerInstrument>
          <ContainerInstrument plain className="flex flex-wrap justify-center gap-12 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
            <a href="#" className="hover:text-primary transition-colors">Over ons</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Mijn meditaties</a>
          </ContainerInstrument>
          <TextInstrument className="text-sm text-muted-foreground/40 font-medium tracking-widest">
            © 2026 ADEMING. EEN ZACHTE PLEK VOOR JEZELF.
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
