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
      
      <main className="pt-20">
        <AdemingHero />

        {/* Main Container */}
        <div className="max-w-6xl mx-auto px-4 space-y-24 py-16">
          
          {/* Filters Section */}
          <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-[32px] p-8 md:p-12 border border-primary/10 shadow-soft">
            <div className="mb-10 text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">
                <VoiceglotText translationKey="home.filters.title" defaultText="Vind jouw perfecte meditatie" />
              </h2>
              <p className="text-muted-foreground text-lg">
                <VoiceglotText translationKey="home.filters.subtitle" defaultText="Kies wat je zoekt en ontdek meditaties op maat" />
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-transparent hover:border-primary/50 transition-all"
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
                className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-transparent hover:border-primary/50 transition-all"
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
                className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-transparent hover:border-primary/50 transition-all"
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
                className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-transparent hover:border-primary/50 transition-all"
              />
            </div>
          </section>

          {/* Featured Meditations Section */}
          <section>
            <div className="mb-12 space-y-3 text-center">
              <h2 className="text-4xl md:text-5xl font-serif font-bold">
                <VoiceglotText translationKey="home.featured.title" defaultText="Uitgelichte meditaties" />
              </h2>
              <p className="text-xl text-muted-foreground">
                <VoiceglotText translationKey="home.featured.subtitle" defaultText="Onze aanbevolen meditaties om mee te beginnen" />
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {publishedTracks.slice(0, 3).map((track) => (
                <AdemingTrackCard 
                  key={track.id} 
                  track={track} 
                  onClick={() => setActiveTrack(track)}
                />
              ))}
            </div>
          </section>

          {/* Meet Julie and Johfrah */}
          <section>
            <div className="mb-12 space-y-3 text-center">
              <h2 className="text-4xl md:text-5xl font-serif font-bold">
                <VoiceglotText translationKey="home.creators.title" defaultText="Maak kennis met Julie en Johfrah" />
              </h2>
              <p className="text-xl text-muted-foreground">
                <VoiceglotText translationKey="home.creators.subtitle" defaultText="Ontmoet de stemmen achter de meditaties" />
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div key={maker.name} className="bg-white p-6 rounded-[32px] shadow-soft border border-primary/5 hover:shadow-medium transition-all group cursor-pointer">
                  <div className="flex gap-6">
                    <div className="h-20 w-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/10">
                      <img src={maker.avatar} alt={maker.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-2xl mb-2 group-hover:text-primary transition-colors">{maker.fullName}</h3>
                      <p className="text-muted-foreground leading-relaxed line-clamp-2">{maker.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Testimonials - Full width */}
        <Testimonials />

        {/* Breathing Exercise - Full width */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-32 px-6">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
          
          <div className="max-w-4xl mx-auto relative">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif font-bold">
                <VoiceglotText translationKey="home.breathing.title" defaultText="Neem even een bewuste adem" />
              </h2>
              <p className="text-xl text-muted-foreground">
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

      {/* Simple Footer */}
      <footer className="bg-background border-t border-border py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="font-serif text-3xl font-semibold opacity-40">ademing</div>
          <div className="flex flex-wrap justify-center gap-10 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Over ons</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Mijn meditaties</a>
          </div>
          <div className="text-sm text-muted-foreground opacity-60 font-medium">
            © 2026 Ademing. Alle rechten voorbehouden.
          </div>
        </div>
      </footer>
    </div>
  );
};
