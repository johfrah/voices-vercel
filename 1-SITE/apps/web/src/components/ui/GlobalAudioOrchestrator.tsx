"use client";

import React from 'react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { MediaMaster } from './MediaMaster';

/**
 * GLOBAL AUDIO ORCHESTRATOR
 * Focus: Persistence & Seamless Listening
 * Zorgt dat de MediaMaster blijft spelen over pagina-navigaties heen.
 */
export function GlobalAudioOrchestrator() {
  const { activeDemo, stopDemo } = useGlobalAudio();

  if (!activeDemo) return null;

  return (
    <MediaMaster 
      demo={activeDemo} 
      onClose={stopDemo} 
    />
  );
}
