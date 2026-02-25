"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, X, Heart, Minimize2,
  Flame, Droplet, Wind, Leaf, Music, RotateCcw,
  Volume2, Clock, ChevronLeft, ChevronRight, UserCircle,
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
  const [videoOpacity, setVideoOpacity] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [avatarCenter, setAvatarCenter] = useState<{x: number, y: number} | null>(null);
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

  // Track avatar position for waveform centering
  useEffect(() => {
    const updateAvatarPosition = () => {
      if (avatarRef.current) {
        const rect = avatarRef.current.getBoundingClientRect();
        setAvatarCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    };
    updateAvatarPosition();
    window.addEventListener('resize', updateAvatarPosition);
    return () => window.removeEventListener('resize', updateAvatarPosition);
  }, [isPlaying]);

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
      {/* Audio waveform fullscreen behind everything */}
      <AudioWaveform 
        isPlaying={isPlaying} 
        centerX={avatarCenter?.x}
        centerY={avatarCenter?.y}
      />

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
                "w-full h-full object-cover transition-all duration-1000",
                !isPlaying && "blur-xl scale-110"
              )}
              style={{ opacity: videoOpacity * 0.5 }}
            />
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)'
              }}
            />
          </>
        ) : (
          <div 
            className={cn(
              "w-full h-full bg-cover bg-center transition-all duration-1000",
              !isPlaying && "blur-xl scale-110"
            )}
            style={{ 
              backgroundImage: `url(${track.cover_image_url})`,
              opacity: 0.4
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/70" />
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
      <div className="relative z-10 h-full flex flex-col p-8 md:p-16">
        {/* Header */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex justify-between items-start"
            >
              <div className="space-y-2">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.4em] animate-pulse">
                  {track.theme || 'Meditatie'}
                </span>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tighter">
                  {track.title}
                </h2>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
                >
                  <Minimize2 size={24} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={onClose}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
                >
                  <X size={28} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right side controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              className="absolute top-1/2 right-12 -translate-y-1/2 flex flex-col gap-6 z-30"
            >
              {[
                { icon: Heart, label: 'Favoriet' },
                { icon: Music, label: 'Achtergrond' },
                { icon: RotateCcw, label: 'Herbegin' },
                { icon: Clock, label: 'Slaaptimer' },
                { icon: MessageCircle, label: 'Reflecties' },
                { icon: FileText, label: 'Transcript' },
                { icon: UserCircle, label: 'Begeleider' },
              ].map((item, i) => (
                <button 
                  key={i}
                  className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:scale-110 transition-all group relative active:scale-90"
                >
                  <item.icon size={24} strokeWidth={1.5} />
                  <span className="absolute right-full mr-6 px-3 py-1.5 rounded-xl bg-black/80 text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap translate-x-4 group-hover:translate-x-0">
                    {item.label}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Avatar & Waveform */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div ref={avatarRef} className={cn(
            "relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] transition-all duration-1000",
            isPlaying ? "scale-110 border-primary/20" : "scale-100"
          )}>
            <img src={track.cover_image_url} alt="" className="w-full h-full object-cover" />
          </div>
          
          {/* Subtitles / Intentions */}
          <div className="mt-20 max-w-3xl text-center px-6">
            <p className="text-2xl md:text-4xl font-serif italic text-white/90 leading-relaxed drop-shadow-2xl animate-gentle-pulse">
              "Laat je adem de weg wijzen naar binnen."
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="space-y-12"
            >
              {/* Progress Bar */}
              <div className="space-y-4">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative group cursor-pointer">
                  <div 
                    className="h-full bg-primary transition-all duration-100 shadow-[0_0_20px_rgba(var(--primary),0.5)]" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-white/40 uppercase tracking-[0.3em]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-12 md:gap-20">
                <button className="text-white/40 hover:text-white transition-all hover:scale-110 active:scale-90"><ChevronLeft size={48} strokeWidth={1} /></button>
                
                <button 
                  onClick={togglePlay}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] group"
                >
                  {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2 group-hover:scale-110 transition-transform" />}
                </button>

                <button className="text-white/40 hover:text-white transition-all hover:scale-110 active:scale-90"><ChevronRight size={48} strokeWidth={1} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
