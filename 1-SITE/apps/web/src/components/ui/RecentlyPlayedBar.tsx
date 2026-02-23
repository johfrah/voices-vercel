"use client";

import { useTranslation } from "@/contexts/TranslationContext";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { ContainerInstrument, TextInstrument, ButtonInstrument } from "@/components/ui/LayoutInstruments";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { Play, Pause, X, Clock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import { VoiceglotText } from "./VoiceglotText";

export function RecentlyPlayedBar() {
  const { t } = useTranslation();
  const { recentlyPlayed, activeDemo, isPlaying, playDemo, setIsPlaying, clearHistory } = useGlobalAudio();
  const { playClick, playSwell } = useSonicDNA();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || recentlyPlayed.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-12"
    >
      <ContainerInstrument plain className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 text-va-black/40">
          <Clock size={14} strokeWidth={2} />
          <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase">
            <VoiceglotText translationKey="agency.recently_played" defaultText="Onlangs beluisterd" />
          </TextInstrument>
        </div>
        <button 
          onClick={() => {
            playClick('soft');
            clearHistory();
          }}
          className="text-[10px] font-bold text-va-black/20 hover:text-primary transition-colors uppercase tracking-widest"
        >
          <VoiceglotText translationKey="action.clear_history" defaultText="Wissen" />
        </button>
      </ContainerInstrument>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 px-1">
        <AnimatePresence mode="popLayout">
          {recentlyPlayed.map((demo) => {
            const isActive = activeDemo?.id === demo.id;
            return (
              <motion.div
                key={demo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="shrink-0"
              >
                <button
                  onMouseEnter={() => playSwell()}
                  onClick={() => {
                    if (isActive) {
                      setIsPlaying(!isPlaying);
                      playClick(isPlaying ? 'light' : 'pro');
                    } else {
                      playDemo(demo);
                      playClick('pro');
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 p-2 pr-4 rounded-full border transition-all duration-500 group",
                    isActive 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                      : "bg-white border-black/[0.03] text-va-black hover:border-black/10 hover:shadow-md"
                  )}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-va-off-white shrink-0">
                    {demo.actor_photo ? (
                      <Image src={demo.actor_photo} alt={demo.actor_name || ""} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-va-black/5">
                        <User size={14} className="text-va-black/20" />
                      </div>
                    )}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      {isActive && isPlaying ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" className="ml-0.5" />}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start min-w-[80px]">
                    <TextInstrument className={cn(
                      "text-[13px] font-bold leading-none mb-0.5",
                      isActive ? "text-white" : "text-va-black"
                    )}>
                      {demo.actor_name}
                    </TextInstrument>
                    <TextInstrument className={cn(
                      "text-[10px] font-light leading-none tracking-tight",
                      isActive ? "text-white/70" : "text-va-black/40"
                    )}>
                      {t(`category.${demo.category?.toLowerCase()}`, demo.category || "Demo")}
                    </TextInstrument>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
