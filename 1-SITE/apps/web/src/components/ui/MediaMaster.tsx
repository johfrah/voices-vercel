"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, X } from 'lucide-react';
import { Demo } from '@/types';

interface MediaMasterProps {
  demo: Demo;
  onClose?: () => void;
}

export const MediaMaster: React.FC<MediaMasterProps> = ({ demo, onClose }) => {
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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-3rem)] max-w-3xl animate-slide-in-up">
      <div className="bg-va-black/90 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10">
        <audio 
          ref={audioRef} 
          onTimeUpdate={handleTimeUpdate} 
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={handleAudioError}
        />
        
        <div className="flex items-center gap-6">
          {/* Demo Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
              <Volume2 size={24} />
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-black uppercase tracking-tight text-sm truncate">{demo.title}</h4>
              <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">Nu aan het spelen</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button className="text-white/20 hover:text-white transition-colors">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white text-va-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button className="text-white/20 hover:text-white transition-colors">
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>

          {/* Progress & Close */}
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <div className="text-white font-black text-xs tabular-nums">{formatTime(audioRef.current?.currentTime || 0)}</div>
              <div className="text-white/20 text-[10px] font-bold tabular-nums">{formatTime(duration)}</div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden cursor-pointer group relative">
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
