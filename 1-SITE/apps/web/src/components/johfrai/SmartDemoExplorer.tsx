'use client';

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useEditMode } from '@/contexts/EditModeContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, Copy, Heart, Pause, Play, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';

interface Demo {
  id: number;
  title: string;
  audio_url: string;
  category: string;
  labels: string[];
  script?: string;
}

const SECTORS = [
  { id: 'retail', label: 'Retail & Shopping', icon: Briefcase, color: 'bg-blue-500' },
  { id: 'it', label: 'IT & Tech', icon: Sparkles, color: 'bg-purple-500' },
  { id: 'horeca', label: 'Horeca & Toerisme', icon: Heart, color: 'bg-orange-500' },
  { id: 'medical', label: 'Zorg & Medisch', icon: Heart, color: 'bg-red-500' },
  { id: 'finance', label: 'Finance & Legal', icon: Briefcase, color: 'bg-slate-700' },
];

const VIBES = [
  { id: 'warm', label: 'Warm & Vriendelijk' },
  { id: 'zakelijk', label: 'Zakelijk & Helder' },
  { id: 'enthousiast', label: 'Enthousiast & Energiek' },
];

interface SmartDemoExplorerProps {
  onAdoptScript: (script: string) => void;
}

export const SmartDemoExplorer: React.FC<SmartDemoExplorerProps> = ({ onAdoptScript }) => {
  const { canEdit: isAdmin } = useEditMode();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchDemos = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedSector) params.append('sector', selectedSector);
        if (selectedVibe) params.append('vibe', selectedVibe);
        
        const res = await fetch(`/api/johfrai/demos?${params.toString()}`);
        const data = await res.json();
        setDemos(data);
      } catch (error) {
        console.error('Error fetching demos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemos();
  }, [selectedSector, selectedVibe]);

  const togglePlay = (demo: Demo) => {
    if (playingId === demo.id) {
      audio?.pause();
      setPlayingId(null);
    } else {
      audio?.pause();
      const newAudio = new Audio(demo.audio_url);
      newAudio.play();
      newAudio.onended = () => setPlayingId(null);
      setAudio(newAudio);
      setPlayingId(demo.id);
    }
  };

  return (
    <ContainerInstrument className="space-y-6 md:space-y-8">
      {/* 🏷️ SECTOR SELECTOR */}
      <ContainerInstrument className="space-y-3 md:space-y-4">
        <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest text-va-black/40 flex items-center gap-2">
          <Briefcase strokeWidth={1.5} size={14} /> 
          <VoiceglotText  translationKey="johfrai.explorer.sectors" defaultText="Kies je sector" />
        </HeadingInstrument>
        <ContainerInstrument className="flex flex-wrap gap-2 md:gap-3">
          {SECTORS.map((sector) => (
            <ButtonInstrument
              key={sector.id}
              onClick={() => setSelectedSector(selectedSector === sector.id ? null : sector.id)}
              className={cn(
                "px-3 py-2 md:px-4 md:py-3 rounded-2xl flex items-center gap-2 md:gap-3 transition-all border-2",
                selectedSector === sector.id 
                  ? "bg-va-black border-va-black text-white shadow-lg scale-105" 
                  : "bg-white border-va-black/5 text-va-black/60 hover:border-va-black/20"
              )}
            >
              <ContainerInstrument className={cn("p-1.5 md:p-2 rounded-lg", selectedSector === sector.id ? "bg-white/20" : sector.color + " text-white")}>
                <sector.icon size={16} />
              </ContainerInstrument>
              <TextInstrument as="span" className="font-bold text-[15px]">{sector.label}</TextInstrument>
            </ButtonInstrument>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>

      {/* 🎭 VIBE SELECTOR */}
      <ContainerInstrument className="space-y-3 md:space-y-4">
        <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest text-va-black/40 flex items-center gap-2">
          <Sparkles strokeWidth={1.5} size={14} /> 
          <VoiceglotText  translationKey="johfrai.explorer.vibes" defaultText="Kies de vibe" />
        </HeadingInstrument>
        <ContainerInstrument className="flex flex-wrap gap-2">
          {VIBES.map((vibe) => (
            <ButtonInstrument
              key={vibe.id}
              onClick={() => setSelectedVibe(selectedVibe === vibe.id ? null : vibe.id)}
              className={cn(
                "px-4 py-2 rounded-full text-[15px] font-bold transition-all",
                selectedVibe === vibe.id 
                  ? "bg-primary text-white shadow-md" 
                  : "bg-va-black/5 text-va-black/60 hover:bg-va-black/10"
              )}
            >
              {vibe.label}
            </ButtonInstrument>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>

      {/* 🎙️ DEMO LIST */}
      <ContainerInstrument className="space-y-3 md:space-y-4">
        <ContainerInstrument className="flex items-center justify-between">
          <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest text-va-black/40">
            <VoiceglotText  translationKey="johfrai.explorer.results" defaultText="Gevonden voorbeelden" />
          </HeadingInstrument>
          <TextInstrument as="span" className="text-[15px] font-bold text-va-black/20 bg-va-black/5 px-2 py-1 rounded-md">
            {demos.length} {demos.length === 1 
              ? <VoiceglotText  translationKey="johfrai.explorer.result" defaultText="resultaat" /> 
              : <VoiceglotText  translationKey="johfrai.explorer.results_count" defaultText="resultaten" />}
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <AnimatePresence  mode="popLayout">
            {isLoading ? (
              <ContainerInstrument className="col-span-full py-8 md:py-12 flex flex-col items-center justify-center text-va-black/20 space-y-3 md:space-y-4">
                <ContainerInstrument className="w-8 h-8 border-4 border-va-black/10 border-t-primary rounded-full animate-spin" />
                <TextInstrument className="text-[15px] font-bold tracking-widest">
                  <VoiceglotText  translationKey="johfrai.explorer.loading" defaultText="Demos laden..." />
                </TextInstrument>
              </ContainerInstrument>
            ) : demos.length > 0 ? (
              demos.map((demo) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={demo.id}
                  className="bg-white p-3 md:p-4 rounded-3xl border border-va-black/5 hover:border-primary/20 transition-all group shadow-sm hover:shadow-xl"
                >
                  <ContainerInstrument className="flex items-center gap-3 md:gap-4">
                    <ButtonInstrument
                      onClick={() => togglePlay(demo)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        playingId === demo.id ? "bg-primary text-white scale-110" : "bg-va-black text-white group-hover:scale-105"
                      )}
                    >
                      {playingId === demo.id ? <Pause strokeWidth={1.5} size={20} fill="currentColor" /> : <Play strokeWidth={1.5} size={20} fill="currentColor" className="ml-1" />}
                    </ButtonInstrument>
                    <ContainerInstrument className="flex-1 min-w-0">
                      <HeadingInstrument level={4} className="font-light text-[15px] truncate">{demo.title}</HeadingInstrument>
                      <TextInstrument className="text-[15px] text-va-black/40 font-bold tracking-wider">
                        {demo.category}
                      </TextInstrument>
                    </ContainerInstrument>
                    {demo.script && (
                      <ButtonInstrument
                        onClick={() => onAdoptScript(demo.script!)}
                        className="p-2 md:p-3 rounded-xl bg-va-black/5 text-va-black/40 hover:bg-primary hover:text-white transition-all group/btn"
                        title={isAdmin ? "Adopteer Script (Admin)" : "Gebruik dit script"}
                      >
                        <Copy strokeWidth={1.5} size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </ButtonInstrument>
                    )}
                  </ContainerInstrument>
                </motion.div>
              ))
            ) : (
              <ContainerInstrument className="col-span-full py-8 md:py-12 flex flex-col items-center justify-center text-va-black/20 space-y-3 md:space-y-4 bg-va-black/5 rounded-[32px] border-2 border-dashed border-va-black/10">
                <Sparkles strokeWidth={1.5} size={32} />
                <ContainerInstrument className="text-center">
                  <TextInstrument className="text-[15px] font-black tracking-widest">
                    <VoiceglotText  translationKey="johfrai.explorer.no_match" defaultText="Geen specifieke match gevonden" />
                  </TextInstrument>
                  <TextInstrument className="text-[15px] font-medium mt-1">
                    <VoiceglotText  translationKey="johfrai.explorer.try_other" defaultText="Probeer een andere sector of vibe." />
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            )}
          </AnimatePresence>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
