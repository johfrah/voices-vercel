"use client";

import React from 'react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { MediaMaster } from './MediaMasterInstrument';

/**
 * GLOBAL AUDIO ORCHESTRATOR
 * Focus: Persistence & Seamless Listening
 * Zorgt dat de MediaMaster blijft spelen over pagina-navigaties heen.
 */
export function GlobalAudioOrchestratorInstrument() {
  const { activeDemo, stopDemo } = useGlobalAudio();

  if (!activeDemo) return null;

  return (
    <MediaMaster strokeWidth={1.5} 
      demo={activeDemo} 
      onClose={stopDemo} 
    />
  );
}
