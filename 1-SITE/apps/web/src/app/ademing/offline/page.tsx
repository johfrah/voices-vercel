"use client";

import React, { useState, useRef } from 'react';
import { Logo } from '@worlds/6-ademing/components/Logo';
import { ContainerInstrument, ButtonInstrument } from '@/components/ui/LayoutInstruments';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

import { useEditMode } from '@/contexts/EditModeContext';
import { Lock } from 'lucide-react';

import { VoiceglotText } from '@/components/ui/VoiceglotText';

export default function AdemingOfflinePage() {
  const { isEditMode } = useEditMode();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <ContainerInstrument 
      plain 
      className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative"
      onMouseMove={() => {
        setShowControls(true);
        // Auto-hide controls after 3 seconds of inactivity
        const timer = setTimeout(() => setShowControls(false), 3000);
        return () => clearTimeout(timer);
      }}
    >
      {isEditMode && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-va-black text-white px-6 py-2 rounded-full text-xs font-black tracking-[0.2em] flex items-center gap-3 shadow-aura border border-primary/20 animate-bounce">
          <Lock size={14} className="text-primary" />
          ADEMING EDIT MODE ACTIVE
        </div>
      )}
      {/* Background Video - Lente optimized */}
      <video
        ref={videoRef}
        src="/assets/ademing/meditations/lente-optimized.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
        loop
        playsInline
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Overlay for readability and atmosphere */}
      <div className="absolute inset-0 bg-black/10 z-[1]" />
      
      {/* Decorative background elements consistent with Ademing branding */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl animate-breathe-glow z-[2]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-breathe-glow z-[2]" style={{ animationDelay: '-2s' }} />
      
      {/* Central Logo - Floating above video */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center"
      >
        <Logo className="scale-150 md:scale-[2] mb-12" />
        
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <ButtonInstrument
                variant="plain"
                size="none"
                onClick={togglePlay}
                className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all group"
              >
                <Play size={40} fill="currentColor" className="ml-2 group-hover:scale-110 transition-transform" />
              </ButtonInstrument>
              <p className="mt-6 text-white/60 font-serif italic text-xl tracking-wide">
                <VoiceglotText 
                  translationKey="ademing.offline.featured.title" 
                  defaultText="Ademing 1 — Lente" 
                />
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Minimal Controls */}
      <AnimatePresence>
        {showControls && isPlaying && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-8 px-8 py-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-aura"
          >
            <button onClick={togglePlay} className="text-white/80 hover:text-white transition-colors">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/60 font-serif italic text-sm tracking-widest uppercase">
              <VoiceglotText 
                translationKey="ademing.offline.featured.label" 
                defaultText="Lente" 
              />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );
}
