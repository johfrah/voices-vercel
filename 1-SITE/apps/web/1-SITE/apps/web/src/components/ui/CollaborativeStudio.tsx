"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  ContainerInstrument, 
  ButtonInstrument, 
  TextInstrument, 
  HeadingInstrument,
  InputInstrument,
  LabelInstrument,
  SectionInstrument,
  PageWrapperInstrument
} from '@/components/ui/LayoutInstruments';
import { 
  LucidePlay, 
  LucidePause, 
  LucideMessageSquare, 
  LucideHistory, 
  LucideCheckCircle,
  LucideInfo,
  LucideDownload,
  LucideFolderOpen
} from 'lucide-react';
import { VoiceglotText } from './VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';

interface StudioSessionProps {
  mode?: 'demo' | 'production' | 'archive';
  auditions?: any[];
  script?: string;
  projectName?: string;
  dropboxUrl?: string;
  onUpload?: (actorId: number, file: File) => void;
  onSelect?: (auditionId: number) => void;
}

export const CollaborativeStudio = ({ 
  mode = 'demo', 
  auditions = [], 
  script, 
  projectName,
  dropboxUrl,
  onUpload, 
  onSelect 
}: StudioSessionProps) => {
  const { t } = useTranslation();
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [waveformCount] = useState(40);

  // Fallback data voor demo mode
  const displayAuditions = auditions.length > 0 ? auditions : (mode === 'demo' ? [
    { id: 1, actor: { firstName: 'Thomas' }, duration: '0:30', status: 'ready', auditionFileUrl: '/demo1.mp3', actorNote: 'Iets meer energie in de tweede zin.' },
    { id: 2, actor: { firstName: 'Sarah' }, duration: '0:45', status: 'pending', auditionFileUrl: null }
  ] : []);

  const handleAuditionUpload = async (actorId: number, file: File) => {
    // 100ms Optimistic UI (Chris-Protocol)
    const tempId = Date.now();
    const optimisticAudition = {
      id: tempId,
      actorId: actorId,
      actor: displayAuditions.find(a => a.actorId === actorId)?.actor || { firstName: '...' },
      status: 'pending',
      auditionFileUrl: null,
      isOptimistic: true
    };
    
    // Hier zouden we normaal de state updaten, voor nu loggen we de intentie
    console.log('[Studio] Optimistic Upload Triggered', optimisticAudition);

    if (onUpload) onUpload(actorId, file);
    console.log(`Uploading audition for actor ${actorId}:`, file.name);
  };

  return (
    <ContainerInstrument className="min-h-screen bg-va-off-white pt-32 pb-20">
      <SectionInstrument className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header: Project Info */}
        <ContainerInstrument className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-va-black/5 pb-8">
          <div className="space-y-2">
            <TextInstrument className="text-[13px] font-bold tracking-[0.2em] text-primary uppercase">
              <VoiceglotText translationKey="studio.session_label" defaultText="Casting Sessie" />
            </TextInstrument>
            <HeadingInstrument level={1} className="text-4xl md:text-5xl font-light tracking-tighter">
              {projectName || <VoiceglotText translationKey="studio.untitled_project" defaultText="Naamloos Project" />}
            </HeadingInstrument>
          </div>
          
          {dropboxUrl && (
            <ButtonInstrument 
              className="bg-white hover:bg-va-off-white text-va-black border border-va-black/5 px-6 py-3 rounded-[10px] flex items-center gap-2 transition-all shadow-sm active:scale-95"
              onClick={() => window.open(dropboxUrl, '_blank')}
            >
              <LucideFolderOpen size={18} strokeWidth={1.5} className="text-primary" />
              <span className="text-[15px] font-light">
                <VoiceglotText translationKey="studio.project_folder" defaultText="Projectmap" />
              </span>
            </ButtonInstrument>
          )}
        </ContainerInstrument>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
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
                {displayAuditions.map((audition) => (
                  <ContainerInstrument 
                    key={audition.id} 
                    className={cn(
                      "group relative p-4 md:p-6 rounded-[20px] transition-all border touch-manipulation",
                      activeTrack === audition.id ? "bg-va-off-white border-primary/20 shadow-inner" : "bg-white border-va-off-white hover:border-va-black/5"
                    )}
                  >
                    <ContainerInstrument className="flex items-center justify-between mb-4">
                      <ContainerInstrument className="flex items-center gap-3">
                        <ContainerInstrument className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center font-bold text-va-black/40 overflow-hidden relative">
                          {audition.actor?.photoUrl ? (
                            <Image 
                              src={audition.actor.photoUrl} 
                              alt={audition.actor.firstName} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <TextInstrument>{audition.actor?.firstName?.[0] || '?'}</TextInstrument>
                          )}
                        </ContainerInstrument>
                        <TextInstrument className="font-medium text-va-black text-[15px] md:text-base">
                          {audition.actor?.firstName}
                        </TextInstrument>
                      </ContainerInstrument>
                      <ContainerInstrument className="flex items-center gap-3 md:gap-4">
                        <TextInstrument className="text-[15px] text-va-black/20 font-mono">
                          {audition.duration || '--:--'}
                        </TextInstrument>
                        
                        {!audition.auditionFileUrl && audition.status === 'pending' && (
                          <LabelInstrument className="cursor-pointer bg-primary/10 text-primary px-4 py-2 rounded-[10px] text-[15px] font-light tracking-widest hover:bg-primary/20 transition-all">
                            <VoiceglotText  translationKey="studio.upload_audition" defaultText="UPLOAD AUDITIE" />
                            <InputInstrument 
                              type="file" 
                              className="hidden" 
                              accept="audio/*" 
                              onChange={(e) => { if (e.target.files?.[0]) handleAuditionUpload(audition.actorId, e.target.files[0]); }}
                            />
                          </LabelInstrument>
                        )}

                        {audition.status === 'ready' || audition.auditionFileUrl ? (
                          <ButtonInstrument 
                            onClick={() => { setActiveTrack(activeTrack === audition.id ? null : audition.id); }}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-va-black text-white flex items-center justify-center hover:scale-105 active:scale-90 transition-transform"
                          >
                            {activeTrack === audition.id ? <LucidePause size={18} strokeWidth={1.5} /> : <LucidePlay size={18} strokeWidth={1.5} className="ml-1" />}
                          </ButtonInstrument>
                        ) : (
                          <ContainerInstrument className="flex items-center gap-2 text-va-black/20 italic text-[15px]">
                            <ContainerInstrument className={cn(
                              "w-2 h-2 rounded-full animate-pulse",
                              audition.isOptimistic ? "bg-primary" : "bg-va-black/10"
                            )} />
                            <VoiceglotText  
                              translationKey={audition.isOptimistic ? "studio.uploading" : "auto.collaborativestudio.bezig___.8e640b"} 
                              defaultText={audition.isOptimistic ? "Uploading..." : "Bezig..."} 
                            />
                          </ContainerInstrument>
                        )}
                      </ContainerInstrument>
                    </ContainerInstrument>

                    {/* Waveform Placeholder */}
                    <ContainerInstrument className="h-12 md:h-16 w-full bg-va-black/5 rounded-[10px] relative overflow-hidden mb-4">
                      {(audition.status === 'ready' || audition.auditionFileUrl) && (
                        <ContainerInstrument className="absolute inset-0 flex items-center px-4 md:px-8 gap-0.5 md:gap-1">
                          {[...Array(waveformCount)].map((_, i) => (
                            <ContainerInstrument 
                              key={i} 
                              className={cn(
                                "w-0.5 md:w-1 bg-va-black/10 rounded-full transition-all",
                                activeTrack === audition.id && i < (waveformCount * 0.4) ? "bg-primary h-6 md:h-8" : "h-3 md:h-4"
                              )}
                            />
                          ))}
                        </ContainerInstrument>
                      )}
                    </ContainerInstrument>

                    {/* Sherlock: Persoonlijke noot van de stemacteur */}
                    {audition.actorNote && (
                      <ContainerInstrument className="bg-primary/5 rounded-[15px] p-4 border border-primary/10">
                        <ContainerInstrument className="flex items-center gap-2 mb-2">
                          <LucideInfo size={14} className="text-primary" strokeWidth={1.5} />
                          <TextInstrument className="text-[15px] font-bold tracking-widest text-primary/60">
                            <VoiceglotText  translationKey="auto.collaborativestudio.toelichting_van_de_s.5ec02d" defaultText="Toelichting van de stem" />
                          </TextInstrument>
                        </ContainerInstrument>
                        <TextInstrument className="text-[15px] font-light leading-relaxed italic">
                          &quot;{audition.actorNote}&quot;
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
                  {script || (
                    <VoiceglotText  
                      translationKey="auto.collaborativestudio._quot_welkom_bij_voi.667eb2" 
                      defaultText="&quot;Welkom bij Voices.be. Waar elke stem een verhaal vertelt. Onze passie is jouw boodschap tot leven brengen met de perfecte toon.&quot;" 
                    />
                  )}
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
                    placeholder={t('studio.chat.placeholder', "Stuur een bericht...")} 
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
        </div>
      </SectionInstrument>
    </ContainerInstrument>
  );
};
