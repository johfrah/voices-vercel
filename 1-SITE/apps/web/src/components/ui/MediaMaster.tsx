"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, X } from 'lucide-react';
import { Demo } from '@/types';
import { useSonicDNA } from '@/lib/sonic-dna';

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
      audioRef.current.src = demo.audio_url;
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
      
      // Tracking logic: Send event to backend every 5 seconds or at specific milestones
      if (Math.floor(current) % 5 === 0 && Math.floor(current) !== 0) {
        // trackPlayback(demo.id, Math.floor(current));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    
    // 🤖 VOICY INTERVENTION: Als audio niet afspeelt, bied hulp aan
    const event = new CustomEvent('voicy:suggestion', {
      detail: {
        title: 'Audio niet gevonden',
        content: `Oei, ik kan deze audio-demo (${demo.title}) even niet terugvinden in onze kluis. Geen zorgen, Johfrah kan hem je zeker persoonlijk mailen als je hier even je gegevens achterlaat!`,
        tab: 'mail'
      }
    });
    window.dispatchEvent(event);

    // 🩹 SELF-HEALING: Rapporteer de kapotte audio asset
    fetch('/api/watchdog/broken-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        path: demo.audio_url, 
        context: `MediaMaster: ${demo.title}`,
        host: window.location.host
      })
    }).catch(err => console.error('Watchdog reporting failed:', err));
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-3xl animate-slide-in-up">
      <div className="bg-va-black/95 backdrop-blur-3xl rounded-[40px] p-4 md:p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden">
        {/* Liquid Progress Background */}
        <div 
          className="absolute inset-0 bg-primary/5 transition-all duration-300 ease-out pointer-events-none" 
          style={{ width: `${progress}%` }}
        />

        <audio 
          ref={audioRef} 
          onTimeUpdate={handleTimeUpdate} 
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={handleAudioError}
        />
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10">
          {/* Demo Info */}
          <div className="flex items-center gap-4 min-w-0 w-full md:w-auto flex-1">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20 animate-pulse">
              <Volume2 size={20} className="md:size-24" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-black tracking-tight text-sm truncate">{demo.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                <p className="text-primary text-[15px] font-black tracking-widest">Live Preview</p>
              </div>
            </div>
            {/* Mobile Time Display */}
            <div className="md:hidden text-right tabular-nums">
              <div className="text-white font-black text-[15px]">{formatTime(audioRef.current?.currentTime || 0)}</div>
              <div className="text-white/20 text-[15px] font-bold">{formatTime(duration)}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 w-full md:w-auto">
            <button 
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime -= 5;
                playClick('soft');
              }}
              className="text-white/30 hover:text-white transition-all active:scale-90"
            >
              <SkipBack size={24} fill="currentColor" />
            </button>
            <button 
              onClick={() => {
                togglePlay();
                playClick(isPlaying ? 'soft' : 'pro');
              }}
              className="w-16 h-16 rounded-full bg-white text-va-black flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime += 5;
                playClick('soft');
              }}
              className="text-white/30 hover:text-white transition-all active:scale-90"
            >
              <SkipForward size={24} fill="currentColor" />
            </button>
          </div>

          {/* Desktop Time & Close */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right tabular-nums">
              <div className="text-white font-black text-[15px]">{formatTime(audioRef.current?.currentTime || 0)}</div>
              <div className="text-white/20 text-[15px] font-bold">{formatTime(duration)}</div>
            </div>
            <button 
              onClick={() => {
                playClick('soft');
                onClose?.();
              }}
              className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Mobile Close */}
          <button 
            onClick={onClose}
            className="md:hidden absolute -top-2 -right-2 w-8 h-8 rounded-full bg-va-black border border-white/10 flex items-center justify-center text-white/40 shadow-xl"
          >
            <X size={14} />
          </button>
        </div>

        {/* Progress Bar */}
        <div 
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
          <div 
            className="absolute inset-0 bg-primary transition-all duration-100 ease-linear" 
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
