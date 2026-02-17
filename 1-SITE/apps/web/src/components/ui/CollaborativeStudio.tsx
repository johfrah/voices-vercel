"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ContainerInstrument, 
  ButtonInstrument, 
  TextInstrument, 
  HeadingInstrument,
  InputInstrument,
  LabelInstrument,
  SectionInstrument
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
import { VoiceglotText } from './VoiceglotText';

interface StudioSessionProps {
  mode?: 'demo' | 'production' | 'archive';
}

export const CollaborativeStudio = ({ mode = 'demo' }: StudioSessionProps) => {
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [waveformCount] = useState(40);

  const tracks = [
    { id: 1, actorName: 'Thomas', duration: '0:30', status: 'ready', auditionUrl: '/demo1.mp3', note: 'Iets meer energie in de tweede zin.' },
    { id: 2, actorName: 'Sarah', duration: '0:45', status: 'pending', auditionUrl: null }
  ];

  const handleAuditionUpload = (trackId: number, file: File) => {
    console.log(`Uploading audition for track ${trackId}:`, file.name);
  };

  return (
    <ContainerInstrument className="min-h-screen bg-va-off-white pt-32 pb-20">
      <SectionInstrument className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 p-4 md:p-8">
        {/* Linker kolom: Regie-tafel */}
        <ContainerInstrument className="lg:col-span-8 space-y-6">
          <ContainerInstrument className="bg-white rounded-[20px] p-6 md:p-8 shadow-aura border border-va-off-white">
            <ContainerInstrument className="flex items-center justify-between mb-6 md:mb-8">
              <HeadingInstrument level={3} className="text-xl font-light">
                <VoiceglotText  translationKey="auto.collaborativestudio.de_booth.766115" defaultText="De Booth" />
              </HeadingInstrument>
              <ContainerInstrument className="hidden md:flex items-center gap-2 text-va-black/40 text-[15px]">
                <LucideInfo size={16} strokeWidth={1.5} />
                <TextInstrument>
                  <VoiceglotText  translationKey="auto.collaborativestudio.klik_op_de_waveform_.a895c2" defaultText="Klik op de waveform voor feedback" />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="space-y-4 md:space-y-8">
              {tracks.map((track) => (
                <ContainerInstrument 
                  key={track.id} 
                  className={cn(
                    "group relative p-4 md:p-6 rounded-[20px] transition-all border touch-manipulation",
                    activeTrack === track.id ? "bg-va-off-white border-primary/20 shadow-inner" : "bg-white border-va-off-white hover:border-va-black/5"
                  )}
                >
                  <ContainerInstrument className="flex items-center justify-between mb-4">
                    <ContainerInstrument className="flex items-center gap-3">
                      <ContainerInstrument className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center font-bold text-va-black/40">
                        <TextInstrument>{track.actorName[0]}</TextInstrument>
                      </ContainerInstrument>
                      <TextInstrument className="font-medium text-va-black text-[15px] md:text-base">
                        {track.actorName}
                      </TextInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument className="flex items-center gap-3 md:gap-4">
                      <TextInstrument className="text-[15px] text-va-black/20 font-mono">
                        {track.duration}
                      </TextInstrument>
                      
                      {!track.auditionUrl && track.status === 'pending' && (
                        <LabelInstrument className="cursor-pointer bg-primary/10 text-primary px-4 py-2 rounded-[10px] text-[15px] font-light tracking-widest hover:bg-primary/20 transition-all">
                          <VoiceglotText  translationKey="studio.upload_audition" defaultText="UPLOAD AUDITIE" />
                          <InputInstrument 
                            type="file" 
                            className="hidden" 
                            accept="audio/*" 
                            onChange={(e) => { if (e.target.files?.[0]) handleAuditionUpload(track.id, e.target.files[0]); }}
                          />
                        </LabelInstrument>
                      )}

                      {track.status === 'ready' ? (
                        <ButtonInstrument 
                          onClick={() => { setActiveTrack(activeTrack === track.id ? null : track.id); }}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-va-black text-white flex items-center justify-center hover:scale-105 active:scale-90 transition-transform"
                        >
                          {activeTrack === track.id ? <LucidePause size={18} strokeWidth={1.5} /> : <LucidePlay size={18} strokeWidth={1.5} className="ml-1" />}
                        </ButtonInstrument>
                      ) : (
                        <ContainerInstrument className="flex items-center gap-2 text-va-black/20 italic text-[15px]">
                          <ContainerInstrument className="w-2 h-2 bg-va-black/10 rounded-full animate-pulse" />
                          <VoiceglotText  translationKey="auto.collaborativestudio.bezig___.8e640b" defaultText="Bezig..." />
                        </ContainerInstrument>
                      )}
                    </ContainerInstrument>
                  </ContainerInstrument>

                  {/* Waveform Placeholder */}
                  <ContainerInstrument className="h-12 md:h-16 w-full bg-va-black/5 rounded-[10px] relative overflow-hidden mb-4">
                    {track.status === 'ready' && (
                      <ContainerInstrument className="absolute inset-0 flex items-center px-4 md:px-8 gap-0.5 md:gap-1">
                        {[...Array(waveformCount)].map((_, i) => (
                          <ContainerInstrument 
                            key={i} 
                            className={cn(
                              "w-0.5 md:w-1 bg-va-black/10 rounded-full transition-all",
                              activeTrack === track.id && i < (waveformCount * 0.4) ? "bg-primary h-6 md:h-8" : "h-3 md:h-4"
                            )}
                          />
                        ))}
                      </ContainerInstrument>
                    )}
                  </ContainerInstrument>

                  {/* Sherlock: Persoonlijke noot van de stemacteur */}
                  {track.note && (
                    <ContainerInstrument className="bg-primary/5 rounded-[15px] p-4 border border-primary/10">
                      <ContainerInstrument className="flex items-center gap-2 mb-2">
                        <LucideInfo size={14} className="text-primary" strokeWidth={1.5} />
                        <TextInstrument className="text-[15px] font-bold tracking-widest text-primary/60">
                          <VoiceglotText  translationKey="auto.collaborativestudio.toelichting_van_de_s.5ec02d" defaultText="Toelichting van de stem" />
                        </TextInstrument>
                      </ContainerInstrument>
                      <TextInstrument className="text-[15px] font-light leading-relaxed italic">
                        &quot;{track.note}&quot;
                      </TextInstrument>
                    </ContainerInstrument>
                  )}
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Script Viewer */}
          <ContainerInstrument className="bg-white rounded-[20px] p-6 md:p-8 shadow-aura border border-va-off-white">
            <ContainerInstrument className="flex items-center justify-between mb-4 md:mb-6">
              <HeadingInstrument level={3} className="text-lg md:text-xl font-light">
                <VoiceglotText  translationKey="auto.collaborativestudio.het_script.5ccfdb" defaultText="Het Script" />
              </HeadingInstrument>
              <ButtonInstrument className="text-va-black/40 hover:text-va-black transition-colors p-2">
                <LucideDownload size={18} strokeWidth={1.5} />
              </ButtonInstrument>
            </ContainerInstrument>
            <ContainerInstrument>
              <TextInstrument className="text-base md:text-lg font-light leading-relaxed text-va-black/80 italic">
                <VoiceglotText  
                  translationKey="auto.collaborativestudio._quot_welkom_bij_voi.667eb2" 
                  defaultText="&quot;Welkom bij Voices.be. Waar elke stem een verhaal vertelt. Onze passie is jouw boodschap tot leven brengen met de perfecte toon.&quot;" 
                />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Rechter kolom: Chat & Status */}
        <ContainerInstrument className="lg:col-span-4 space-y-6 md:space-y-8">
          <ContainerInstrument className="bg-white rounded-[20px] h-[500px] md:h-[600px] shadow-aura border border-va-off-white flex flex-col overflow-hidden">
            <ContainerInstrument className="p-4 md:p-6 border-b border-va-black/5 bg-va-off-white/30 flex items-center gap-3">
              <LucideMessageSquare size={18} className="text-va-black/40" strokeWidth={1.5} />
              <HeadingInstrument level={4} className="text-base md:text-lg font-light tracking-widest">
                <VoiceglotText  translationKey="studio.chat_title" defaultText="Voicy Chat" />
              </HeadingInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              <ContainerInstrument className="bg-va-off-white rounded-[20px] rounded-tl-none p-3 md:p-4 max-w-[90%] md:max-w-[85%]">
                <TextInstrument className="text-[15px] font-light leading-relaxed">
                  <VoiceglotText  translationKey="auto.collaborativestudio.hoi_thomas__ik_heb_j.05eb00" defaultText="Hoi Thomas! Ik heb je briefing ontvangen. Ik ga direct aan de slag met de demo." />
                </TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/20 mt-2 tracking-widest font-light">
                  <VoiceglotText  translationKey="studio.track_label" defaultText="Stem 1" />  10:45
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="p-4 md:p-6 border-t border-va-black/5">
              <ContainerInstrument className="relative">
                <InputInstrument 
                  placeholder="Stuur een bericht..." 
                  className="w-full bg-va-off-white border-none rounded-[10px] px-4 md:px-6 py-3 md:py-4 text-[15px] focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {mode === 'demo' && (
            <ContainerInstrument className="pb-20 md:pb-0">
              <ContainerInstrument className="bg-va-black text-white rounded-[20px] p-6 md:p-8 shadow-aura-lg text-center space-y-4 md:space-y-6">
                <ContainerInstrument className="space-y-2">
                  <HeadingInstrument level={3} className="text-xl md:text-2xl font-light text-white">
                    <VoiceglotText  translationKey="auto.collaborativestudio.de_juiste_match_.e578cd" defaultText="De juiste match?" />
                  </HeadingInstrument>
                  <TextInstrument className="text-white/60 text-[15px] leading-relaxed font-light">
                    <VoiceglotText  translationKey="auto.collaborativestudio.zodra_je_de_perfecte.7320f0" defaultText="Zodra je de perfecte stem hebt gevonden, kun je direct de volledige productie starten." />
                  </TextInstrument>
                </ContainerInstrument>
                <ButtonInstrument 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-[10px] font-medium flex items-center justify-center gap-2 active:scale-95"
                  onClick={() => { window.location.href = `/checkout?session=${activeTrack}`; }}
                >
                  <LucideCheckCircle size={18} strokeWidth={1.5} />
                  <TextInstrument>
                    <VoiceglotText  translationKey="studio.choose_voice" defaultText="Kies deze stem" />
                  </TextInstrument>
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </SectionInstrument>
    </ContainerInstrument>
  );
};
