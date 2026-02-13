'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronRight, Briefcase, Heart, Sparkles, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useEditMode } from '@/contexts/EditModeContext';

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
    <div className="space-y-8">
      {/* 🏷️ SECTOR SELECTOR */}
      <div className="space-y-4">
        <h3 className="text-[15px] font-black tracking-widest text-va-black/40 flex items-center gap-2">
          <Briefcase strokeWidth={1.5} size={14} /> 
          <VoiceglotText translationKey="johfrai.explorer.sectors" defaultText="Kies je sector" />
        </h3>
        <div className="flex flex-wrap gap-3">
          {SECTORS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => setSelectedSector(selectedSector === sector.id ? null : sector.id)}
              className={cn(
                "px-4 py-3 rounded-2xl flex items-center gap-3 transition-all border-2",
                selectedSector === sector.id 
                  ? "bg-va-black border-va-black text-white shadow-lg scale-105" 
                  : "bg-white border-va-black/5 text-va-black/60 hover:border-va-black/20"
              )}
            >
              <div className={cn("p-2 rounded-lg", selectedSector === sector.id ? "bg-white/20" : sector.color + " text-white")}>
                <sector.icon size={16} />
              </div>
              <span className="font-bold text-[15px]">{sector.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🎭 VIBE SELECTOR */}
      <div className="space-y-4">
        <h3 className="text-[15px] font-black tracking-widest text-va-black/40 flex items-center gap-2">
          <Sparkles strokeWidth={1.5} size={14} /> 
          <VoiceglotText translationKey="johfrai.explorer.vibes" defaultText="Kies de vibe" />
        </h3>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((vibe) => (
            <button
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
            </button>
          ))}
        </div>
      </div>

      {/* 🎙️ DEMO LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-black tracking-widest text-va-black/40">
            <VoiceglotText translationKey="johfrai.explorer.results" defaultText="Gevonden voorbeelden" />
          </h3>
          <span className="text-[15px] font-bold text-va-black/20 bg-va-black/5 px-2 py-1 rounded-md">
            {demos.length} {demos.length === 1 
              ? <VoiceglotText translationKey="johfrai.explorer.result" defaultText="resultaat" /> 
              : <VoiceglotText translationKey="johfrai.explorer.results_count" defaultText="resultaten" />}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-va-black/20 space-y-4">
                <div className="w-8 h-8 border-4 border-va-black/10 border-t-primary rounded-full animate-spin" />
                <p className="text-[15px] font-bold tracking-widest">
                  <VoiceglotText translationKey="johfrai.explorer.loading" defaultText="Demos laden..." />
                </p>
              </div>
            ) : demos.length > 0 ? (
              demos.map((demo) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={demo.id}
                  className="bg-white p-4 rounded-3xl border border-va-black/5 hover:border-primary/20 transition-all group shadow-sm hover:shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePlay(demo)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        playingId === demo.id ? "bg-primary text-white scale-110" : "bg-va-black text-white group-hover:scale-105"
                      )}
                    >
                      {playingId === demo.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-[15px] truncate">{demo.title}</h4>
                      <p className="text-[15px] text-va-black/40 font-bold tracking-wider">
                        {demo.category}
                      </p>
                    </div>
                    {demo.script && (
                      <button
                        onClick={() => onAdoptScript(demo.script!)}
                        className="p-3 rounded-xl bg-va-black/5 text-va-black/40 hover:bg-primary hover:text-white transition-all group/btn"
                        title={isAdmin ? "Adopteer Script (Admin)" : "Gebruik dit script"}
                      >
                        <Copy size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-va-black/20 space-y-4 bg-va-black/5 rounded-[32px] border-2 border-dashed border-va-black/10">
                <Sparkles strokeWidth={1.5} size={32} />
                <div className="text-center">
                  <p className="text-[15px] font-black tracking-widest">
                    <VoiceglotText translationKey="johfrai.explorer.no_match" defaultText="Geen specifieke match gevonden" />
                  </p>
                  <p className="text-[15px] font-medium mt-1">
                    <VoiceglotText translationKey="johfrai.explorer.try_other" defaultText="Probeer een andere sector of vibe." />
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
