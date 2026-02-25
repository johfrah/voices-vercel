"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdemingHero } from './AdemingHero';
import { AdemingNav } from './AdemingNav';
import { AdemingTrackCard } from './AdemingTrackCard';
import { BreathingInstrument } from './BreathingInstrument';
import { MeditationPlayerInstrument } from './MeditationPlayerInstrument';
import { VoiceglotText } from '../VoiceglotText';

interface AdemingBentoProps {
  tracks: any[];
  initialTrack?: any;
}

export const AdemingBento = ({ tracks, initialTrack }: AdemingBentoProps) => {
  const [activeTrack, setActiveTrack] = useState<any | null>(initialTrack || null);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <AdemingNav />
      
      <main className="pt-20">
        <AdemingHero />

        {/* Featured Meditations Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold">
              <VoiceglotText contentKey="home.featured.title" defaultValue="Uitgelichte meditaties" />
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <VoiceglotText contentKey="home.featured.subtitle" defaultValue="Onze aanbevolen meditaties om mee te beginnen" />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tracks.slice(0, 6).map((track) => (
              <AdemingTrackCard 
                key={track.id} 
                track={track} 
                onClick={() => setActiveTrack(track)}
              />
            ))}
          </div>
        </section>

        {/* Breathing Exercise Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-32 px-6">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
          
          <div className="max-w-4xl mx-auto relative">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">
                <VoiceglotText contentKey="home.breathing.title" defaultValue="Neem even een bewuste adem" />
              </h2>
              <p className="text-lg text-muted-foreground">
                <VoiceglotText contentKey="home.breathing.subtitle" defaultValue="Probeer deze korte ademhalingsoefening en ervaar direct de kracht van bewust ademen" />
              </p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-12 shadow-soft border border-white/20">
              <BreathingInstrument />
            </div>
          </div>
        </section>

        {/* Community Section (Simplified) */}
        <section className="max-w-7xl mx-auto px-6 py-32 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-2">
              <p className="text-5xl font-serif font-light text-primary">12.4k</p>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Bewuste Ademhalingen</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-serif font-light text-primary">482</p>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Mensen nu online</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-serif font-light text-primary">98%</p>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Voelt zich rustiger</p>
            </div>
          </div>
        </section>

        {/* Meet Julie and Johfrah */}
        <section className="max-w-7xl mx-auto px-6 py-24 bg-white/30 backdrop-blur-sm rounded-[48px] mb-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold">Maak kennis met Julie en Johfrah</h2>
            <p className="text-xl text-muted-foreground">Ontmoet de stemmen achter de meditaties</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-48 h-48 rounded-full overflow-hidden shadow-large border-4 border-white">
                <img src="/assets/ademing/avatar-julie.jpg" alt="Julie" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-serif font-bold">Julie</h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                Julie brengt een zachte, liefdevolle energie in elke meditatie. Haar stem is een warme deken voor de ziel.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-48 h-48 rounded-full overflow-hidden shadow-large border-4 border-white">
                <img src="/assets/ademing/avatar-johfrah.jpg" alt="Johfrah" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-serif font-bold">Johfrah</h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                Johfrah's diepe, rustgevende stem helpt je om direct te landen in het hier en nu.
              </p>
            </div>
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
      <footer className="bg-background border-t border-border py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-serif text-2xl font-semibold opacity-40">ademing</div>
          <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Over ons</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
          <div className="text-sm text-muted-foreground opacity-60">
            © 2026 Ademing. Alle rechten voorbehouden.
          </div>
        </div>
      </footer>
    </div>
  );
};
