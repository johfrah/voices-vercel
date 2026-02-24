"use client";

import { useCallback } from 'react';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';

/**
 *  SONIC DNA ENGINE - 2026 EDITION
 * 
 * Doel: Live gesynthetiseerde audio-feedback voor elke interactie.
 * Pijler: Tactile Digitalism & Sonic Identity.
 */

class SonicDNA {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  private init() {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    return this.ctx;
  }

  /**
   * De 'Signature Click' - Gebruikt voor knoppen en selecties.
   */
  async playClick(type: 'soft' | 'pro' | 'pop' | 'success' | 'lock' | 'unlock' = 'soft') {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    // Resume context if suspended (browser security)
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        return; // Silently fail if still not allowed
      }
    }
    
    if (ctx.state !== 'running') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';

    switch (type) {
      case 'pro':
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        break;
      case 'pop':
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        break;
      case 'success':
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        break;
      case 'lock':
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.05);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        break;
      case 'unlock':
        osc.frequency.setValueAtTime(60, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.05);
        osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        break;
      default: // soft
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        break;
    }

    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  /**
   * De 'Liquid Swell' - Gebruikt voor hover effecten.
   * CHRIS-PROTOCOL: Uitgeschakeld op verzoek van gebruiker (te veel geluidjes).
   */
  async playSwell() {
    return; // Hover sounds are now disabled globally
    /*
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        return;
      }
    }

    if (ctx.state !== 'running') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    */
  }
}

export const sonicDNA = new SonicDNA();

export const useSonicDNA = () => {
  const { state } = useMasterControl();
  
  const playClick = useCallback((type?: any) => {
    sonicDNA.setMuted(state.isMuted);
    return sonicDNA.playClick(type);
  }, [state.isMuted]);

  const playSwell = useCallback(() => {
    sonicDNA.setMuted(state.isMuted);
    return sonicDNA.playSwell();
  }, [state.isMuted]);
  
  return {
    playClick,
    playSwell
  };
};
