"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Demo } from '@/types';

interface AudioContextType {
  activeDemo: Demo | null;
  isPlaying: boolean;
  recentlyPlayed: Demo[];
  playDemo: (demo: Demo) => void;
  stopDemo: () => void;
  setIsPlaying: (playing: boolean) => void;
  clearHistory: () => void;
}

const GlobalAudioContext = createContext<AudioContextType | undefined>(undefined);

export function GlobalAudioProvider({ children }: { children: ReactNode }) {
  const [activeDemo, setActiveDemo] = useState<Demo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Demo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voices_recently_played');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const playDemo = (demo: Demo) => {
    setActiveDemo(demo);
    setIsPlaying(true);

    // Update recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(d => d.id !== demo.id);
      const updated = [demo, ...filtered].slice(0, 10); // Keep last 10
      if (typeof window !== 'undefined') {
        localStorage.setItem('voices_recently_played', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentlyPlayed([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('voices_recently_played');
    }
  };

  const stopDemo = () => {
    setIsPlaying(false);
    // CHRIS-PROTOCOL: Delay clearing activeDemo to allow for exit animations
    setTimeout(() => {
      setActiveDemo(null);
    }, 500);
  };

  return (
    <GlobalAudioContext.Provider value={{ activeDemo, isPlaying, recentlyPlayed, playDemo, stopDemo, setIsPlaying, clearHistory }}>
      {children}
    </GlobalAudioContext.Provider>
  );
}

export function useGlobalAudio() {
  const context = useContext(GlobalAudioContext);
  if (context === undefined) {
    throw new Error('useGlobalAudio must be used within a GlobalAudioProvider');
  }
  return context;
}
