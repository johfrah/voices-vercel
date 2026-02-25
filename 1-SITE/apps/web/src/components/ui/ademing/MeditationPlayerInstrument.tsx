"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Play, Pause, X, User, Heart, Minimize2, 
  Flame, Droplet, Wind, Leaf, Music, RotateCcw, 
  Volume2, Clock, ChevronLeft, ChevronRight, 
  MessageCircle, ArrowLeft, FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  TextInstrument, 
  HeadingInstrument 
} from "../LayoutInstruments";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import nextDynamic from "next/dynamic";

// Nuclear Loading for heavy visual components
const AudioWaveform = nextDynamic(() => import("./AudioWaveform").then(mod => mod.AudioWaveform), { ssr: false });
const FloatingParticles = nextDynamic(() => import("./FloatingParticles").then(mod => mod.FloatingParticles), { ssr: false });

interface MeditationPlayerInstrumentProps {
  track: any;
  onClose: () => void;
  isPlaylist?: boolean;
}

export const MeditationPlayerInstrument = ({ 
  track, 
  onClose, 
  isPlaylist = false 
}: MeditationPlayerInstrumentProps) => {
  const { playClick } = useSonicDNA();
  const { isPlaying, setIsPlaying } = useGlobalAudio();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [bgElement, setBgElement] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls
  useEffect(() => {
    const handleActivity = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        playClick('soft');
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        playClick('pro');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-va-black text-white overflow-hidden"
    >
      {/* Background Layer (Video or Cover) */}
      <div className="absolute inset-0 z-0">
        {track.video_background_url ? (
          <video 
            src={track.video_background_url} 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-40 scale-105 blur-sm"
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center opacity-30 blur-xl scale-110"
            style={{ backgroundImage: `url(${track.cover_image_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-va-black/60 via-transparent to-va-black" />
      </div>

      {/* Visual Effects Layer */}
      <FloatingParticles element={track.element} isPlaying={isPlaying} />
      
      {/* Audio Element (Hidden) */}
      <audio 
        ref={audioRef}
        src={track.url}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
        autoPlay
      />

      {/* UI Layer */}
      <div className="relative z-10 h-full flex flex-col p-8 md:p-12">
        {/* Header */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex justify-between items-start"
            >
              <div className="space-y-1">
                <TextInstrument className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
                  {track.theme || 'Meditatie'}
                </TextInstrument>
                <HeadingInstrument level={2} className="text-3xl md:text-5xl font-light tracking-tighter text-white">
                  {track.title}
                </HeadingInstrument>
              </div>
              <ButtonInstrument 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <X size={24} strokeWidth={1.5} />
              </ButtonInstrument>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Waveform & Avatar */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-lg h-64 flex items-center justify-center">
             <div className="absolute inset-0 z-0">
               <AudioWaveform isPlaying={isPlaying} />
             </div>
             <div className={cn(
               "relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl transition-all duration-1000",
               isPlaying ? "scale-110 border-primary/40" : "scale-100"
             )}>
               <img src={track.cover_image_url} alt="" className="w-full h-full object-cover" />
             </div>
          </div>
          
          {/* Subtitles / Intentions */}
          <div className="mt-12 max-w-2xl text-center">
            <TextInstrument className="text-xl md:text-2xl font-light text-white/80 leading-relaxed italic">
              "Laat je adem de weg wijzen naar binnen."
            </TextInstrument>
          </div>
        </div>

        {/* Footer Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="space-y-8"
            >
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative group cursor-pointer">
                  <div 
                    className="h-full bg-primary transition-all duration-100" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-8 md:gap-12">
                <button className="text-white/40 hover:text-white transition-colors"><ChevronLeft size={32} strokeWidth={1.5} /></button>
                
                <button 
                  onClick={togglePlay}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-va-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </button>

                <button className="text-white/40 hover:text-white transition-colors"><ChevronRight size={32} strokeWidth={1.5} /></button>
              </div>

              {/* Secondary Options */}
              <div className="flex justify-center gap-4">
                <ButtonInstrument className="bg-white/5 border border-white/5 rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
                  <Music size={14} /> Achtergrond
                </ButtonInstrument>
                <ButtonInstrument className="bg-white/5 border border-white/5 rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
                  <Clock size={14} /> Slaaptimer
                </ButtonInstrument>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
