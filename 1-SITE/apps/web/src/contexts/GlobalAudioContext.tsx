"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Demo } from '@/types';

interface AudioContextType {
  activeDemo: Demo | null;
  isPlaying: boolean;
  playDemo: (demo: Demo) => void;
  stopDemo: () => void;
  setIsPlaying: (playing: boolean) => void;
}

const GlobalAudioContext = createContext<AudioContextType | undefined>(undefined);

export function GlobalAudioProvider({ children }: { children: ReactNode }) {
  const [activeDemo, setActiveDemo] = useState<Demo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playDemo = (demo: Demo) => {
    setActiveDemo(demo);
    setIsPlaying(true);
  };

  const stopDemo = () => {
    setActiveDemo(null);
    setIsPlaying(false);
  };

  return (
    <GlobalAudioContext.Provider value={{ activeDemo, isPlaying, playDemo, stopDemo, setIsPlaying }}>
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
