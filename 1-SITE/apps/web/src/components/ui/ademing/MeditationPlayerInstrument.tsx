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
  const [videoOpacity, setVideoOpacity] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  // Video setup: slow motion and smooth loop crossfade
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !track.video_background_url) return;

    video.playbackRate = 0.6;

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      const timeLeft = video.duration - video.currentTime;
      
      if (timeLeft <= 1.5 && timeLeft > 0) {
        setVideoOpacity(timeLeft / 1.5);
      } else if (video.currentTime < 1.5) {
        setVideoOpacity(video.currentTime / 1.5);
      } else {
        setVideoOpacity(1);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [track.video_background_url]);

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
      className="fixed inset-0 z-[300] bg-black text-white overflow-hidden"
    >
      {/* Background Layer (Video or Cover) */}
      <div className="absolute inset-0 z-0">
        {track.video_background_url ? (
          <>
            <video 
              ref={videoRef}
              src={track.video_background_url} 
              autoPlay 
              loop 
              muted 
              playsInline
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                !isPlaying && "blur-md scale-105"
              )}
              style={{ opacity: videoOpacity * 0.4 }}
            />
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)'
              }}
            />
          </>
        ) : (
          <div 
            className={cn(
              "w-full h-full bg-cover bg-center transition-all duration-500",
              !isPlaying && "blur-md scale-105"
            )}
            style={{ 
              backgroundImage: `url(${track.cover_image_url})`,
              opacity: 0.3
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />
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
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
                  {track.theme || 'Meditatie'}
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
                  {track.title}
                </h2>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all"
                >
                  <Minimize2 size={20} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right side controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4 z-30"
            >
              {[
                { icon: Heart, label: 'Favoriet' },
                { icon: Music, label: 'Achtergrond' },
                { icon: RotateCcw, label: 'Herbegin' },
                { icon: Clock, label: 'Slaaptimer' },
                { icon: MessageCircle, label: 'Reflecties' },
                { icon: FileText, label: 'Transcript' },
                { icon: User, label: 'Begeleider' },
              ].map((item, i) => (
                <button 
                  key={i}
                  className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 hover:scale-110 transition-all group relative"
                >
                  <item.icon size={20} strokeWidth={1.5} />
                  <span className="absolute right-full mr-4 px-2 py-1 rounded bg-black/80 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
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
            <p className="text-xl md:text-2xl font-serif italic text-white/80 leading-relaxed">
              "Laat je adem de weg wijzen naar binnen."
            </p>
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
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </button>

                <button className="text-white/40 hover:text-white transition-colors"><ChevronRight size={32} strokeWidth={1.5} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
