"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { Demo } from '@/types';
import { Pause, Play, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    TextInstrument
} from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [demo]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
      
      if (current > 0 && Math.floor(current) % 10 === 0) {
        // trackPlayback(demo.id, Math.floor(current));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAudioError = () => {
    console.error("Audio playback error");
    setIsPlaying(false);
  };

  return (
    <ContainerInstrument className="fixed bottom-0 inset-x-0 z-[100] p-4 md:p-8 pointer-events-none">
      <ContainerInstrument className="max-w-6xl mx-auto bg-va-black/95 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] p-4 md:p-6 shadow-[0_32px_128px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-auto relative overflow-hidden group/master">
        {/* Liquid Progress Background */}
        <ContainerInstrument 
          className="absolute inset-0 bg-primary/5 transition-all duration-300 ease-out pointer-events-none" 
          style={{ width: `${progress}%` }}
        />

        <audio 
          ref={audioRef} 
          src={demo.audio_url}
          onTimeUpdate={handleTimeUpdate} 
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={handleAudioError}
        />
        
        <ContainerInstrument className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10">
          {/* Demo Info (Sherlock: Beautiful Titles & Actor Photo) */}
          <ContainerInstrument className="flex items-center gap-4 min-w-0 w-full md:w-auto flex-1">
            <ContainerInstrument className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10 group/photo">
              {demo.actor_photo ? (
                <VoiceglotImage  
                  src={demo.actor_photo} 
                  alt={demo.actor_name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110" 
                />
              ) : (
                <ContainerInstrument className="w-full h-full bg-primary flex items-center justify-center text-white animate-pulse">
                  <Volume2 strokeWidth={1.5} size={24} />
                </ContainerInstrument>
              )}
              {/* Live Indicator Overlay */}
              <ContainerInstrument className="absolute bottom-1 right-1 w-3 h-3 bg-primary rounded-full border-2 border-va-black animate-pulse" />
            </ContainerInstrument>
            
            <ContainerInstrument className="min-w-0 flex-1">
              <ContainerInstrument className="flex flex-col">
                <HeadingInstrument level={4} className="text-white font-light tracking-tighter text-lg md:text-xl truncate leading-tight">
                  {demo.actor_name || 'Stemacteur'}
                </HeadingInstrument>
                <ContainerInstrument className="flex items-center gap-2">
                  <TextInstrument className="text-white/40 text-[15px] font-light tracking-[0.2em] truncate">
                    {demo.title}
                  </TextInstrument>
                  <ContainerInstrument className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                  <TextInstrument className="text-primary text-[15px] font-light tracking-widest shrink-0">
                    <VoiceglotText  translationKey="media.live_preview" defaultText="Live" />
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            
            {/* Mobile Time Display */}
            <ContainerInstrument className="md:hidden text-right tabular-nums">
              <TextInstrument className="text-white font-light text-[15px]">{formatTime(audioRef.current?.currentTime || 0)}</TextInstrument>
              <TextInstrument className="text-white/20 text-[15px] font-light">{formatTime(duration)}</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Controls */}
          <ContainerInstrument className="flex items-center justify-center gap-6 w-full md:w-auto">
            <ButtonInstrument 
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime -= 5;
                playClick('soft');
              }}
              className="text-white/30 hover:text-white transition-all active:scale-90"
            >
              <SkipBack strokeWidth={1.5} size={24} fill="currentColor" />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => {
                togglePlay();
                playClick(isPlaying ? 'soft' : 'pro');
              }}
              className="w-16 h-16 rounded-full bg-white text-va-black flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {isPlaying ? <Pause strokeWidth={1.5} size={32} fill="currentColor" /> : <Play strokeWidth={1.5} size={32} fill="currentColor" className="ml-1" />}
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime += 5;
                playClick('soft');
              }}
              className="text-white/30 hover:text-white transition-all active:scale-90"
            >
              <SkipForward strokeWidth={1.5} size={24} fill="currentColor" />
            </ButtonInstrument>
          </ContainerInstrument>

          {/* Desktop Time & Close */}
          <ContainerInstrument className="hidden md:flex items-center gap-6">
            <ContainerInstrument className="text-right tabular-nums">
              <TextInstrument className="text-white font-light text-[15px]">{formatTime(audioRef.current?.currentTime || 0)}</TextInstrument>
              <TextInstrument className="text-white/20 text-[15px] font-light">{formatTime(duration)}</TextInstrument>
            </ContainerInstrument>
            <ButtonInstrument 
              onClick={() => {
                playClick('soft');
                onClose?.();
              }}
              className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              <X strokeWidth={1.5} size={20} />
            </ButtonInstrument>
          </ContainerInstrument>
          
          {/* Mobile Close */}
          <ButtonInstrument 
            onClick={onClose}
            className="md:hidden absolute -top-2 -right-2 w-8 h-8 rounded-full bg-va-black border border-white/10 flex items-center justify-center text-white/40 shadow-xl"
          >
            <X strokeWidth={1.5} size={14} />
          </ButtonInstrument>
        </ContainerInstrument>

        {/* Progress Bar */}
        <ContainerInstrument 
          className="mt-4 md:mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden cursor-pointer group relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clickedProgress = x / rect.width;
            if (audioRef.current) {
              audioRef.current.currentTime = clickedProgress * audioRef.current.duration;
              playClick('soft');
            }
          }}
        >
          <ContainerInstrument 
            className="absolute inset-0 bg-primary transition-all duration-100 ease-linear" 
            style={{ width: `${progress}%` }}
          />
          <ContainerInstrument className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
