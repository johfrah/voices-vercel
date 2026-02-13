"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Demo } from '@/types';

interface AudioContextType {
  activeDemo: Demo | null;
  playDemo: (demo: Demo) => void;
  stopDemo: () => void;
}

const GlobalAudioContext = createContext<AudioContextType | undefined>(undefined);

export function GlobalAudioProvider({ children }: { children: ReactNode }) {
  const [activeDemo, setActiveDemo] = useState<Demo | null>(null);

  const playDemo = (demo: Demo) => {
    setActiveDemo(demo);
  };

  const stopDemo = () => {
    setActiveDemo(null);
  };

  return (
    <GlobalAudioContext.Provider value={{ activeDemo, playDemo, stopDemo }}>
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
