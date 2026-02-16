"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { Demo } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Volume2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
    ButtonInstrument,
    ContainerInstrument,
    TextInstrument
} from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';

interface MediaMasterProps {
  demo: Demo;
  onClose?: () => void;
}

export const MediaMaster: React.FC<MediaMasterProps> = ({ demo, onClose }) => {
  const { playClick } = useSonicDNA();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🛡️ CHRIS-PROTOCOL: Clean demo titles for display
  const cleanDemoTitle = (title: string) => {
    if (!title) return '';
    let clean = title.replace(/\.(mp3|wav|ogg|m4a)$/i, '');
    clean = clean.replace(/^[a-z]+-A-\d+-/i, '');
    clean = clean.replace(/-(flemish|dutch|french|english|german|voiceover|demo|voices)/gi, ' ');
    clean = clean.replace(/-/g, ' ');
    clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    return clean.trim();
  };

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      setIsPlaying(false);
      setProgress(0);
      
      const playAudio = () => {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Autoplay failed:", err);
            setIsPlaying(false);
          });
      };

      const timer = setTimeout(playAudio, 100);
      return () => clearTimeout(timer);
    }
  }, [demo.audio_url]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error("Playback failed:", err));
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (total > 0) {
        setProgress((current / total) * 100);
      }
      if (audioRef.current.paused !== !isPlaying) {
        setIsPlaying(!audioRef.current.paused);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-12 inset-x-0 z-[200] px-6 pointer-events-none"
    >
      <ContainerInstrument 
        plain 
        className="max-w-3xl mx-auto bg-va-black shadow-[0_32px_128px_rgba(0,0,0,0.8)] rounded-full p-2 border border-white/10 pointer-events-auto relative overflow-hidden flex items-center gap-4"
      >
        {/* 🌊 LIQUID PROGRESS BACKGROUND */}
        <motion.div 
          className="absolute inset-0 bg-primary/20 pointer-events-none origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ type: "spring", bounce: 0, duration: 0.1 }}
        />

        <audio 
          ref={audioRef} 
          src={demo.audio_url}
          onTimeUpdate={handleTimeUpdate} 
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* 📸 ACTOR PHOTO */}
        <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white/10 shadow-lg z-10 ml-1">
          {demo.actor_photo ? (
            <VoiceglotImage  
              src={demo.actor_photo} 
              alt={demo.actor_name} 
              fill
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
              <Volume2 size={24} />
            </div>
          )}
        </div>

        {/* 📝 INFO BLOCK */}
        <div className="flex-1 min-w-0 z-10 py-1">
          <TextInstrument className="text-white font-light text-[18px] tracking-tight truncate leading-tight block">
            {demo.actor_name || 'Stemacteur'}
          </TextInstrument>
          <TextInstrument className="text-white/40 text-[12px] font-bold tracking-[0.15em] uppercase truncate mt-0.5">
            {cleanDemoTitle(demo.title)}
          </TextInstrument>
        </div>

        {/* 🕹️ CONTROLS */}
        <div className="flex items-center gap-2 z-10 pr-2">
          {/* PLAY/PAUSE */}
          <button 
            onClick={() => {
              togglePlay();
              playClick(isPlaying ? 'soft' : 'pro');
            }}
            className="w-14 h-14 rounded-full bg-white text-va-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl group/play"
          >
            {isPlaying ? (
              <Pause size={24} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={24} fill="currentColor" strokeWidth={0} className="ml-1" />
            )}
          </button>

          {/* CLOSE */}
          <button 
            onClick={() => {
              playClick('soft');
              onClose?.();
            }}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all ml-1"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* 📏 INTERACTIVE PROGRESS OVERLAY */}
        <div 
          className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clickedProgress = x / rect.width;
            if (audioRef.current) {
              audioRef.current.currentTime = clickedProgress * audioRef.current.duration;
              playClick('soft');
            }
          }}
        />
      </ContainerInstrument>
    </motion.div>
  );
};
