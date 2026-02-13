"use client";

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  ContainerInstrument, 
  ButtonInstrument, 
  TextInstrument, 
  HeadingInstrument,
  PageWrapperInstrument,
  SectionInstrument,
  InputInstrument,
  LabelInstrument
} from '@/components/ui/LayoutInstruments';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { 
  LucideTrash2, 
  LucideMic, 
  LucideChevronRight, 
  LucideArrowLeft, 
  LucideUpload,
  LucideFileText,
  LucideLink,
  LucideCheckCircle,
  LucideX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

import { VoiceCard } from '@/components/ui/VoiceCard';

interface StudioLaunchpadProps {
  initialActors?: any[];
}

export const StudioLaunchpad = ({ initialActors = [] }: StudioLaunchpadProps) => {
  const { state, toggleActorSelection, clearSelectedActors } = useVoicesState();
  const selectedActors = state.selected_actors;
  const [script, setScript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeActor = (actor: any) => {
    toggleActorSelection(actor);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);

      // Sherlock: Check voor video bestanden om direct een preview te tonen
      const videoFile = newFiles.find(file => file.type.startsWith('video/'));
      if (videoFile) {
        const url = URL.createObjectURL(videoFile);
        setVideoPreviewUrl(url);
      }
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    if (videoPreviewUrl && fileToRemove.type.startsWith('video/')) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleYoutubeExtract = async (url: string) => {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return;
    
    setIsExtracting(true);
    try {
      const response = await fetch(`/api/video/extract?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.streamUrl) {
        setVideoPreviewUrl(data.streamUrl);
      }
    } catch (error) {
      console.error('[Sherlock] YouTube extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen pb-32">
      <SectionInstrument className="py-8 md:py-12">
        <ContainerInstrument className="max-w-6xl mx-auto px-4">
          {/* Header & Selection Strip */}
          <div className="mb-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <Link 
                  href="/search" 
                  className="inline-flex items-center gap-2 text-va-black/40 hover:text-primary transition-colors text-[15px] font-light group"
                >
                  <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span><VoiceglotText translationKey="auto.studiolaunchpad.meer_stemmen_toevoeg.27de65" defaultText="Meer stemmen toevoegen" /></span>
                </Link>
                <HeadingInstrument level={1} className="text-4xl md:text-5xl font-light tracking-tight">
                  <VoiceglotText translationKey="auto.studiolaunchpad.jouw_proefopname.e1fa5b" defaultText="Jouw proefopname" />
                </HeadingInstrument>
                <div className="flex items-center gap-2 text-va-black/40 bg-va-black/5 px-4 py-2 rounded-full w-fit">
                  <Image 
                    src="/assets/common/branding/icons/INFO.svg" 
                    alt="Info" 
                    width={14} 
                    height={14} 
                    style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                  />
                  <span className="text-[15px] font-light tracking-tight"><VoiceglotText translationKey="auto.studiolaunchpad.commercials___video.38a0aa" defaultText="Commercials & video" /></span>
                </div>
              </div>
              {selectedActors.length > 0 && (
                <button 
                  onClick={clearSelectedActors}
                  className="text-va-black/20 hover:text-red-500 transition-colors text-[15px] font-light flex items-center gap-2"
                >
                  <LucideTrash2 size={16} />
                  <span><VoiceglotText translationKey="auto.studiolaunchpad.selectie_wissen.8a5df3" defaultText="Selectie wissen" /></span>
                </button>
              )}
            </div>

            {/* Horizontal Selection Strip OR Quick Selection Grid */}
            {selectedActors.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                <AnimatePresence mode="popLayout">
                  {selectedActors.map((actor) => (
                    <motion.div
                      key={actor.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex-shrink-0 bg-white rounded-[25px] p-3 pr-5 shadow-aura border border-va-off-white flex items-center gap-4 group relative"
                    >
                      <div className="relative w-12 h-12 rounded-[15px] overflow-hidden bg-va-off-white">
                        {actor.photoUrl ? (
                          <Image src={actor.photoUrl} alt={actor.firstName} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-light text-va-black/20 text-lg">
                            {actor.firstName[0]}
                          </div>
                        )}
                      </div>
                      <TextInstrument className="font-light text-va-black whitespace-nowrap">
                        {actor.firstName}
                      </TextInstrument>
                      <button 
                        onClick={() => removeActor(actor)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-va-off-white text-va-black/20 hover:bg-red-50 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm border border-va-black/5 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <LucideX size={12} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-8 bg-white/50 backdrop-blur-sm rounded-[30px] border border-va-black/5">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Image 
                        src="/assets/common/branding/icons/MIC.svg" 
                        alt="Mic" 
                        width={20} 
                        height={20} 
                        style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                      />
                    </div>
                    <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40 "><VoiceglotText translationKey="auto.studiolaunchpad.selecteer_stemmen_vo.7278c6" defaultText="Selecteer stemmen voor jouw briefing" /></TextInstrument>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initialActors.slice(0, 6).map((actor) => (
                      <VoiceCard key={actor.id} voice={actor} />
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <Link 
                      href="/search" 
                      className="text-[15px] font-light text-primary hover:underline tracking-widest "
                    ><VoiceglotText translationKey="auto.studiolaunchpad.bekijk_alle_stemmen.517883" defaultText="Bekijk alle stemmen" /></Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consolidatie: De Briefing Bridge is nu hier geïntegreerd */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Linker kolom: Script & Bestanden */}
            <div className="lg:col-span-8 space-y-8">
              <ContainerInstrument className="bg-white rounded-[30px] p-6 md:p-10 shadow-aura border border-va-off-white">
                <div className="flex items-center justify-between mb-6">
                  <LabelInstrument className="text-va-black font-light text-lg ml-0"><VoiceglotText translationKey="auto.studiolaunchpad.het_script.5ccfdb" defaultText="Het Script" /></LabelInstrument>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-primary text-[15px] font-light hover:opacity-80 transition-opacity tracking-widest"
                  >
                    <LucideUpload size={16} strokeWidth={1.5} />
                    <span className="hidden sm:inline"><VoiceglotText translationKey="auto.studiolaunchpad.zet_om_naar_tekst.11d18c" defaultText="Zet om naar tekst" /></span>
                    <span className="sm:hidden"><VoiceglotText translationKey="auto.studiolaunchpad.upload.914124" defaultText="Upload" /></span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div>

                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Plak hier je tekst of sleep een bestand..."
                  className="w-full h-80 bg-va-off-white rounded-[20px] p-6 md:p-8 text-[16px] md:text-lg font-light leading-relaxed border-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                  spellCheck={false}
                />

                {files.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-va-off-white/50 rounded-[12px] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <LucideFileText size={18} className="text-va-black/40" />
                          <span className="text-[15px] font-medium text-va-black/70">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(i)} className="text-va-black/20 hover:text-red-500 transition-colors">
                          <Image 
                            src="/assets/common/branding/icons/TRASH.svg" 
                            alt="Verwijder" 
                            width={18} 
                            height={18} 
                            style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </ContainerInstrument>

              <ContainerInstrument className="bg-white rounded-[30px] p-6 md:p-10 shadow-aura border border-va-off-white">
                <LabelInstrument className="text-va-black font-light text-lg ml-0 mb-8"><VoiceglotText translationKey="auto.studiolaunchpad.referentie___vibe.067244" defaultText="Referentie & Vibe" /></LabelInstrument>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <LabelInstrument className="text-[15px] font-light tracking-widest ml-0 opacity-40"><VoiceglotText translationKey="auto.studiolaunchpad.youtube_of_vimeo_lin.1c2443" defaultText="YouTube of Vimeo link (optioneel)" /></LabelInstrument>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2">
                        <Image 
                          src="/assets/common/branding/icons/FORWARD.svg" 
                          alt="Link" 
                          width={20} 
                          height={20} 
                          className="opacity-20"
                          style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                        />
                      </div>
                      <InputInstrument 
                        placeholder="https://..." 
                        className="pl-14 w-full h-14 bg-va-off-white font-light"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['Zakelijk', 'Warm', 'Energiek', 'Vertrouwd'].map((vibe) => (
                      <button 
                        key={vibe}
                        className="h-14 rounded-[18px] bg-va-off-white text-[15px] font-light hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                      >
                        {vibe}
                      </button>
                    ))}
                  </div>
                </div>
              </ContainerInstrument>
            </div>

            {/* Rechter kolom: Uitspraak & Launch */}
            <div className="lg:col-span-4 space-y-8">
              <ContainerInstrument className="bg-va-black text-white rounded-[30px] p-8 shadow-aura-lg sticky top-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <LucideMic size={20} className="text-primary" />
                  </div>
                  <HeadingInstrument level={3} className="text-xl font-light"><VoiceglotText translationKey="auto.studiolaunchpad.uitspraak___vibe.4b4fd6" defaultText="Uitspraak & Vibe" /></HeadingInstrument>
                </div>
                
                <TextInstrument className="text-white/60 text-[15px] mb-8 leading-relaxed font-light"><VoiceglotText translationKey="auto.studiolaunchpad.moeilijke_namen_of_e.d0f63b" defaultText="Moeilijke namen of een specifieke toon? Spreek het even in voor de stemacteur." /></TextInstrument>

                <button 
                  onClick={toggleRecording}
                  className={cn(
                    "w-full py-10 rounded-[25px] flex flex-col items-center justify-center gap-4 transition-all border-2 border-dashed touch-manipulation active:scale-95 mb-10",
                    isRecording 
                      ? "bg-primary/20 border-primary animate-pulse" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "p-6 rounded-full",
                    isRecording ? "bg-primary" : "bg-white/10"
                  )}>
                    <LucideMic size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[15px] font-light tracking-widest ">
                    {isRecording ? "Stop opname" : "Spreek het in"}
                  </span>
                </button>

                <ButtonInstrument 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-[20px] text-lg font-light flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all tracking-widest"
                  onClick={() => window.location.href = '/casting/session/'}
                >
                  <span><VoiceglotText translationKey="auto.studiolaunchpad.vraag_proefopname_aa.8c2d12" defaultText="Vraag proefopname aan" /></span>
                  <LucideCheckCircle size={24} strokeWidth={1.5} />
                </ButtonInstrument>

                <TextInstrument className="text-center text-white/20 text-[15px] mt-6 leading-relaxed tracking-widest font-light"><VoiceglotText translationKey="auto.studiolaunchpad.je_gegevens_worden_a.e7a216" defaultText="Je gegevens worden anoniem behandeld." /></TextInstrument>
              </ContainerInstrument>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
};
