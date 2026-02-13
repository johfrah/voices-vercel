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

export const StudioLaunchpad = () => {
  const { state, toggleActorSelection, clearSelectedActors } = useVoicesState();
  const selectedActors = state.selected_actors;
  const [script, setScript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeActor = (actor: any) => {
    toggleActorSelection(actor);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (selectedActors.length === 0) {
    return (
      <PageWrapperInstrument className="bg-va-off-white min-h-screen flex items-center justify-center">
        <ContainerInstrument className="max-w-md w-full p-8 text-center bg-white rounded-[40px] shadow-aura border border-va-black/5 mx-4">
          <div className="w-20 h-20 bg-va-off-white rounded-full flex items-center justify-center mx-auto mb-6">
            <LucideMic size={32} className="text-va-black/10" />
          </div>
          <HeadingInstrument level={2} className="text-2xl font-light mb-4">
            Geen stemmen geselecteerd
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 mb-8 font-light">
            Kies eerst de stemmen die je wilt horen voor jouw gratis proefopname.
          </TextInstrument>
          <ButtonInstrument 
            as="a"
            href="/search"
            className="bg-va-black text-white px-8 py-4 rounded-full font-medium inline-flex items-center gap-2"
          >
            <span>Bekijk alle stemmen</span>
            <LucideChevronRight size={18} />
          </ButtonInstrument>
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

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
                  className="inline-flex items-center gap-2 text-va-black/40 hover:text-primary transition-colors text-sm font-medium group"
                >
                  <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Meer stemmen toevoegen</span>
                </Link>
                <HeadingInstrument level={1} className="text-4xl md:text-5xl font-light tracking-tight">
                  Jouw Proefopname
                </HeadingInstrument>
              </div>
              <button 
                onClick={clearSelectedActors}
                className="text-va-black/20 hover:text-red-500 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <LucideTrash2 size={16} />
                <span>Selectie wissen</span>
              </button>
            </div>

            {/* Horizontal Selection Strip */}
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
                        <div className="w-full h-full flex items-center justify-center font-bold text-va-black/20 text-lg">
                          {actor.firstName[0]}
                        </div>
                      )}
                    </div>
                    <TextInstrument className="font-medium text-va-black whitespace-nowrap">
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
          </div>

          {/* Consolidatie: De Briefing Bridge is nu hier geïntegreerd */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Linker kolom: Script & Bestanden */}
            <div className="lg:col-span-8 space-y-8">
              <ContainerInstrument className="bg-white rounded-[30px] p-6 md:p-10 shadow-aura border border-va-off-white">
                <div className="flex items-center justify-between mb-6">
                  <LabelInstrument className="text-va-black font-medium text-lg ml-0">
                    Het Script
                  </LabelInstrument>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-primary text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    <LucideUpload size={16} />
                    <span className="hidden sm:inline">Zet om naar tekst</span>
                    <span className="sm:hidden">Upload</span>
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
                          <span className="text-sm font-medium text-va-black/70">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(i)} className="text-va-black/20 hover:text-red-500 transition-colors">
                          <LucideTrash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </ContainerInstrument>

              <ContainerInstrument className="bg-white rounded-[30px] p-6 md:p-10 shadow-aura border border-va-off-white">
                <LabelInstrument className="text-va-black font-medium text-lg ml-0 mb-8">
                  Referentie & Vibe
                </LabelInstrument>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <LabelInstrument className="text-[15px] font-bold tracking-widest ml-0 opacity-40">YouTube of Vimeo link (optioneel)</LabelInstrument>
                    <div className="relative">
                      <LucideLink className="absolute left-5 top-1/2 -translate-y-1/2 text-va-black/20" size={20} />
                      <InputInstrument 
                        placeholder="https://..." 
                        className="pl-14 w-full h-14 bg-va-off-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['Zakelijk', 'Warm', 'Energiek', 'Vertrouwd'].map((vibe) => (
                      <button 
                        key={vibe}
                        className="h-14 rounded-[18px] bg-va-off-white text-[15px] font-medium hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/20"
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
                  <HeadingInstrument level={3} className="text-xl font-light">
                    Uitspraak & Vibe
                  </HeadingInstrument>
                </div>
                
                <TextInstrument className="text-white/60 text-sm mb-8 leading-relaxed font-light">
                  Moeilijke namen of een specifieke toon? Spreek het even in voor de stemacteur.
                </TextInstrument>

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
                    <LucideMic size={32} />
                  </div>
                  <span className="text-sm font-bold tracking-widest ">
                    {isRecording ? "Stop opname" : "Spreek het in"}
                  </span>
                </button>

                <ButtonInstrument 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-[20px] text-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  onClick={() => window.location.href = '/studio/session/demo-preview'}
                >
                  <span>Vraag proefopname aan</span>
                  <LucideCheckCircle size={24} />
                </ButtonInstrument>

                <TextInstrument className="text-center text-white/20 text-[15px] mt-6 leading-relaxed tracking-widest font-light">
                  Je gegevens worden anoniem behandeld.
                </TextInstrument>
              </ContainerInstrument>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
};
