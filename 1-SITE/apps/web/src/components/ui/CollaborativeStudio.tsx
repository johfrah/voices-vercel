"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ContainerInstrument, 
  ButtonInstrument, 
  TextInstrument, 
  HeadingInstrument 
} from '@/components/ui/LayoutInstruments';
import { 
  LucidePlay, 
  LucidePause, 
  LucideMessageSquare, 
  LucideHistory, 
  LucideCheckCircle,
  LucideInfo,
  LucideDownload
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StudioSessionProps {
  mode: 'demo' | 'production' | 'archive';
}

export const CollaborativeStudio = ({ mode = 'demo' }: StudioSessionProps) => {
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sherlock: Mock data voor de demo fase met audities
  const [tracks, setTracks] = useState([
    { id: 1, actorName: 'Thomas', status: 'ready', duration: '0:45', auditionUrl: null },
    { id: 2, actorName: 'Sarah', status: 'ready', duration: '0:38', auditionUrl: null },
    { id: 3, actorName: 'Emma', status: 'pending', duration: '--:--', auditionUrl: null },
  ]);

  const handleAuditionUpload = (trackId: number, file: File) => {
    // Sherlock: In een echte scenario uploaden we naar Supabase Storage
    const url = URL.createObjectURL(file);
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, status: 'ready', auditionUrl: url, duration: '0:30' } : t));
  };

  const waveformCount = isMobile ? 30 : 60;

  return (
    <ContainerInstrument className="min-h-screen bg-va-off-white">
      {/* Header */}
      <ContainerInstrument className="bg-white border-b border-va-black/5 py-4 md:py-6 px-4 md:px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="bg-va-black text-white px-2 md:px-3 py-1 rounded-full text-[15px] md:text-[15px] font-bold tracking-widest shrink-0">
              {mode === 'demo' ? (isMobile ? 'Demo' : 'Discovery Mode') : 'Production'}
            </div>
            <HeadingInstrument level={2} className="text-lg md:text-2xl font-light truncate">
              Studio: <span className="text-va-black/40">Thomas</span>
            </HeadingInstrument>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <ButtonInstrument className="bg-va-off-white text-va-black p-2 md:px-4 md:py-2 flex items-center gap-2">
              <LucideHistory size={18} />
              <span className="hidden md:inline">Versiebeheer</span>
            </ButtonInstrument>
            {mode === 'production' && (
              <ButtonInstrument className="bg-primary text-white px-4 md:px-6 py-2 rounded-full font-medium text-sm md:text-base">
                Opleveren
              </ButtonInstrument>
            )}
          </div>
        </div>
      </ContainerInstrument>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 p-4 md:p-8">
        {/* Linker kolom: Regie-tafel */}
        <div className="lg:col-span-8 space-y-6">
          <ContainerInstrument className="bg-white rounded-[25px] md:rounded-[30px] p-6 md:p-8 shadow-aura border border-va-off-white">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <HeadingInstrument level={3} className="text-xl font-light">
                De Booth
              </HeadingInstrument>
              <div className="hidden md:flex items-center gap-2 text-va-black/40 text-sm">
                <LucideInfo size={16} />
                <span>Klik op de waveform voor feedback</span>
              </div>
            </div>

            <div className="space-y-4 md:space-y-8">
              {tracks.map((track) => (
                <div key={track.id} className={cn(
                  "group relative p-4 md:p-6 rounded-[20px] md:rounded-[25px] transition-all border touch-manipulation",
                  activeTrack === track.id ? "bg-va-off-white border-primary/20 shadow-inner" : "bg-white border-va-off-white hover:border-va-black/5"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center font-bold text-va-black/40">
                        {track.actorName[0]}
                      </div>
                      <TextInstrument className="font-medium text-va-black text-sm md:text-base">
                        {track.actorName}
                      </TextInstrument>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                      <TextInstrument className="text-[15px] md:text-[15px] text-va-black/20 font-mono">
                        {track.duration}
                      </TextInstrument>
                      
                      {/* Sherlock: Upload knop voor de stemacteur (zichtbaar als er nog geen auditie is) */}
                      {!track.auditionUrl && track.status === 'pending' && (
                        <label className="cursor-pointer bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold tracking-widest hover:bg-primary/20 transition-all">
                          UPLOAD AUDITIE
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="audio/*" 
                            onChange={(e) => e.target.files?.[0] && handleAuditionUpload(track.id, e.target.files[0])}
                          />
                        </label>
                      )}

                      {track.status === 'ready' ? (
                        <button 
                          onClick={() => setActiveTrack(activeTrack === track.id ? null : track.id)}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-va-black text-white flex items-center justify-center hover:scale-105 active:scale-90 transition-transform"
                        >
                          {activeTrack === track.id ? <LucidePause size={18} className="md:w-5 md:h-5" /> : <LucidePlay size={18} className="md:w-5 md:h-5 ml-1" />}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-va-black/20 italic text-[15px] md:text-sm">
                          <div className="w-2 h-2 bg-va-black/10 rounded-full animate-pulse" />
                          Bezig...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Waveform Placeholder */}
                  <div className="h-12 md:h-16 w-full bg-va-black/5 rounded-full relative overflow-hidden">
                    {track.status === 'ready' && (
                      <div className="absolute inset-0 flex items-center px-4 md:px-8 gap-0.5 md:gap-1">
                        {[...Array(waveformCount)].map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-0.5 md:w-1 bg-va-black/10 rounded-full transition-all",
                              activeTrack === track.id && i < (waveformCount * 0.4) ? "bg-primary h-6 md:h-8" : "h-3 md:h-4"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ContainerInstrument>

          {/* Script Viewer */}
          <ContainerInstrument className="bg-white rounded-[25px] md:rounded-[30px] p-6 md:p-8 shadow-aura border border-va-off-white">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <HeadingInstrument level={3} className="text-lg md:text-xl font-light">
                Het Script
              </HeadingInstrument>
              <ButtonInstrument className="text-va-black/40 hover:text-va-black transition-colors p-2">
                <LucideDownload size={18} className="md:w-5 md:h-5" />
              </ButtonInstrument>
            </div>
            <div className="prose prose-va max-w-none">
              <p className="text-base md:text-lg font-light leading-relaxed text-va-black/80">
                &quot;Welkom bij Voices.be. Waar elke stem een verhaal vertelt. Onze passie is jouw boodschap tot leven brengen met de perfecte toon.&quot;
              </p>
            </div>
          </ContainerInstrument>
        </div>

        {/* Rechter kolom: Chat & Status */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <ContainerInstrument className="bg-white rounded-[25px] md:rounded-[30px] h-[500px] md:h-[600px] shadow-aura border border-va-off-white flex flex-col overflow-hidden">
            <div className="p-4 md:p-6 border-b border-va-black/5 bg-va-off-white/30 flex items-center gap-3">
              <LucideMessageSquare size={18} className="text-va-black/40 md:w-5 md:h-5" />
              <HeadingInstrument level={4} className="text-base md:text-lg font-medium">
                Voicy Chat
              </HeadingInstrument>
            </div>
            
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              <div className="bg-va-off-white rounded-[18px] md:rounded-[20px] rounded-tl-none p-3 md:p-4 max-w-[90%] md:max-w-[85%]">
                <TextInstrument className="text-[15px] md:text-sm font-light leading-relaxed">
                  Hoi Thomas! Ik heb je briefing ontvangen. Ik ga direct aan de slag met de demo.
                </TextInstrument>
                <TextInstrument className="text-[15px] md:text-[15px] text-va-black/20 mt-2 tracking-widest font-light">
                  Stem 1 • 10:45
                </TextInstrument>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-va-black/5">
              <div className="relative">
                <input 
                  placeholder="Stuur een bericht..." 
                  className="w-full bg-va-off-white border-none rounded-[15px] md:rounded-[20px] px-4 md:px-6 py-3 md:py-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          </ContainerInstrument>

          {mode === 'demo' && (
            <div className="pb-20 md:pb-0">
              <ContainerInstrument className="bg-va-black text-white rounded-[25px] md:rounded-[30px] p-6 md:p-8 shadow-aura-lg text-center space-y-4 md:space-y-6">
                <HeadingInstrument level={3} className="text-xl md:text-2xl font-light">
                  De juiste match?
                </HeadingInstrument>
                <TextInstrument className="text-white/60 text-[15px] md:text-sm leading-relaxed font-light">
                  Zodra je de perfecte stem hebt gevonden, kun je direct de volledige productie starten.
                </TextInstrument>
                <ButtonInstrument 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-[15px] md:rounded-[20px] font-medium flex items-center justify-center gap-2 active:scale-95"
                  onClick={() => window.location.href = `/checkout?session=${activeTrack}`}
                >
                  <LucideCheckCircle size={18} className="md:w-5 md:h-5" />
                  <span>Omzetten naar bestelling</span>
                </ButtonInstrument>
              </ContainerInstrument>
            </div>
          )}
        </div>
      </div>
    </ContainerInstrument>
  );
};
