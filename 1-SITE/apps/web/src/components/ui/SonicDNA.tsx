"use client";

import { useEffect, useRef } from 'react';

/**
 * SONIC DNA ENGINE (GOD MODE 2026)
 * 
 * Verantwoordelijk voor:
 * 1. Live synthese van interactie-geluidjes (Web Audio API)
 * 2. Raycast-style mechanical feel voor 'pro' journeys.
 */

export function useSonicDNA() {
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playClick = (type: 'pro' | 'soft' | 'analog' | 'success' | 'error' | 'swell' = 'soft') => {
    if (!audioCtx.current) return;

    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.current.destination);

    const now = audioCtx.current.currentTime;

    if (type === 'pro') {
      // Raycast-style mechanical feel (Original Design)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'soft') {
      // Subtle, airy click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'analog') {
      // Warm, vintage sound for Artist
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      //  NUCLEAR SUCCESS: Rising perfect fifth
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'error') {
      //  NUCLEAR ERROR: Low dissonant drop
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(55, now + 0.3);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'swell') {
      //  NUCLEAR SWELL: Airy hover effect
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'startup') {
      //  STARTUP CHIME: Bright, welcoming rising sequence
      const osc2 = audioCtx.current.createOscillator();
      const gain2 = audioCtx.current.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.current.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.5); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(554.37, now + 0.1); // C#5
      osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.6); // C#6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      gain2.gain.setValueAtTime(0, now + 0.1);
      gain2.gain.linearRampToValueAtTime(0.02, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.start(now);
      osc.stop(now + 0.8);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.9);
    }
  };

  const playSwell = () => playClick('swell');

  return { playClick, playSwell };
}

export function SonicDNAHandler() {
  const { playClick } = useSonicDNA();

  useEffect(() => {
    //  STARTUP CHIME: Play when the engine is ready
    const handleFirstInteraction = () => {
      playClick('startup');
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const sonicType = target.closest('[data-voices-sonic-dna]')?.getAttribute('data-voices-sonic-dna');
      
      if (sonicType) {
        playClick(sonicType as any);
      } else if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A') {
        playClick('soft'); // Default click
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [playClick]);

  return null;
}
