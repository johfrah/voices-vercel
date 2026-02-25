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
import { Moon, Zap, Clock, ArrowRight, Compass, Users } from 'lucide-react';
import { VoicesDropdown } from '../VoicesDropdown';

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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <AdemingNav />
      
      <main>
        <AdemingHero />

        {/* Main Container - Literal max-width 6xl from kelder */}
        <div className="max-w-6xl mx-auto px-6 space-y-40 py-32">
          
          {/* Filters Section - Original spacing and depth */}
          <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-[48px] p-12 md:p-24 border border-primary/10 shadow-soft animate-fade-in">
            <div className="mb-16 text-center space-y-6">
              <h2 className="text-5xl md:text-6xl font-serif font-bold tracking-tight">
                <VoiceglotText translationKey="home.filters.title" defaultText="Vind jouw perfecte meditatie" />
              </h2>
              <p className="text-muted-foreground text-2xl font-light max-w-2xl mx-auto">
                <VoiceglotText translationKey="home.filters.subtitle" defaultText="Kies wat je zoekt en ontdek meditaties op maat" />
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <VoicesDropdown 
                placeholder="🎯 Kies een thema"
                options={[
                  { label: "Alle thema's", value: "all" },
                  { label: "Rust", value: "rust" },
                  { label: "Energie", value: "energie" },
                  { label: "Ritme", value: "ritme" }
                ]}
                value={selectedTheme || "all"}
                onChange={(v: string) => setSelectedTheme(v === "all" ? null : v)}
                className="bg-white/60 backdrop-blur-md rounded-3xl border-2 border-transparent hover:border-primary/30 transition-all h-16 text-lg"
              />

              <VoicesDropdown 
                placeholder="🌿 Kies een element"
                options={[
                  { label: "Alle elementen", value: "all" },
                  { label: "Aarde", value: "aarde" },
                  { label: "Water", value: "water" },
                  { label: "Lucht", value: "lucht" },
                  { label: "Vuur", value: "vuur" }
                ]}
                value={selectedElement || "all"}
                onChange={(v: string) => setSelectedElement(v === "all" ? null : v)}
                className="bg-white/60 backdrop-blur-md rounded-3xl border-2 border-transparent hover:border-primary/30 transition-all h-16 text-lg"
              />

              <VoicesDropdown 
                placeholder="⏱️ Kies duur"
                options={[
                  { label: "Alle duur", value: "all" },
                  { label: "Kort (< 10 min)", value: "kort" },
                  { label: "Middel (10-20 min)", value: "middel" },
                  { label: "Lang (> 20 min)", value: "lang" }
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
            </div>
          </section>

          {/* Featured Meditations Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="mb-16 space-y-4 text-center">
              <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">
                <VoiceglotText translationKey="home.featured.title" defaultText="Uitgelichte meditaties" />
              </h2>
              <p className="text-2xl text-muted-foreground font-light">
                <VoiceglotText translationKey="home.featured.subtitle" defaultText="Onze aanbevolen meditaties om mee te beginnen" />
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {publishedTracks.slice(0, 3).map((track) => (
                <AdemingTrackCard 
                  key={track.id} 
                  track={track} 
                  onClick={() => setActiveTrack(track)}
                />
              ))}
            </div>
          </section>

          {/* Meet Julie and Johfrah - Original CreatorBio style */}
          <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="mb-16 space-y-4 text-center">
              <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">
                <VoiceglotText translationKey="home.creators.title" defaultText="Maak kennis met Julie en Johfrah" />
              </h2>
              <p className="text-2xl text-muted-foreground font-light">
                <VoiceglotText translationKey="home.creators.subtitle" defaultText="Ontmoet de stemmen achter de meditaties" />
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                {
                  name: "Julie",
                  fullName: "Julie",
                  bio: "Julie brengt een zachte, liefdevolle energie in elke meditatie. Haar stem is een warme deken voor de ziel.",
                  avatar: "/assets/ademing/avatar-julie.jpg"
                },
                {
                  name: "Johfrah",
                  fullName: "Johfrah",
                  bio: "Johfrah's diepe, rustgevende stem helpt je om direct te landen in het hier en nu.",
                  avatar: "/assets/ademing/avatar-johfrah.jpg"
                }
              ].map((maker) => (
                <div key={maker.name} className="bg-white p-10 rounded-[48px] shadow-soft border border-primary/5 hover:shadow-medium hover:-translate-y-1 transition-all duration-500 group cursor-pointer">
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                    <div className="h-32 w-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-primary/10 shadow-medium group-hover:scale-105 transition-transform duration-500">
                      <img src={maker.avatar} alt={maker.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <h3 className="font-serif font-bold text-3xl group-hover:text-primary transition-colors">{maker.fullName}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">{maker.bio}</p>
                      <div className="pt-2 flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        Bekijk profiel <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Testimonials - Full width */}
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Testimonials />
        </div>

        {/* Breathing Exercise - Full width with original spacing */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-48 px-6 mt-32 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl animate-breathe-glow" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-breathe-glow" style={{ animationDelay: '-3s' }} />
          
          <div className="max-w-4xl mx-auto relative">
            <div className="text-center mb-20 space-y-6">
              <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
                <VoiceglotText translationKey="home.breathing.title" defaultText="Neem even een bewuste adem" />
              </h2>
              <p className="text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                <VoiceglotText translationKey="home.breathing.subtitle" defaultText="Probeer deze korte ademhalingsoefening en ervaar direct de kracht van bewust ademen" />
              </p>
            </div>
            <BreathingInstrument />
          </div>
        </section>

      </main>

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
      <footer className="bg-background border-t border-border py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-16">
          <div className="font-serif text-5xl font-semibold opacity-60 tracking-tighter animate-breathe-wave-subtle">ademing</div>
          <div className="flex flex-wrap justify-center gap-12 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
            <a href="#" className="hover:text-primary transition-colors">Over ons</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Mijn meditaties</a>
          </div>
          <div className="text-sm text-muted-foreground/40 font-medium tracking-widest">
            © 2026 ADEMING. EEN ZACHTE PLEK VOOR JEZELF.
          </div>
        </div>
      </footer>
    </div>
  );
};
