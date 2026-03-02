"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import * as rrweb from 'rrweb';
import { useAuth } from '@/contexts/AuthContext';

/**
 *  VOICEJAR TRACKER - EXPERIENCE LAYER (2026)
 * 
 * Legt user interacties vast conform het Master Voices Protocol.
 * Gebruikt rrweb voor sessie-opnames zonder externe cookies.
 */

export const VoicejarTrackerInstrument: React.FC = () => {
  const pathname = usePathname();
  const { isAdmin, isLoading } = useAuth();
  const stopFnRef = useRef<(() => void) | null>(null);
  const eventsRef = useRef<any[]>([]);
  const visitorHashRef = useRef<string | null>(null);

  useEffect(() => {
    //  CHRIS-PROTOCOL: Wacht tot auth geladen is
    if (isLoading) return;

    //  CHRIS-PROTOCOL: Disable Voicejar voor admins
    if (isAdmin) {
      console.log(' Voicejar: Recording disabled for admin');
      return;
    }

    // 1. Genereer of haal visitor hash (simulatie van centrale state)
    let hash = localStorage.getItem('voices_visitor_hash');
    if (!hash) {
      hash = 'vj_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('voices_visitor_hash', hash);
    }
    visitorHashRef.current = hash;

    // 2. Start recording
    const startRecording = () => {
      //  CHRIS-PROTOCOL: Disable Voicejar in development to save Disk IO budget
      if (process.env.NODE_ENV === 'development') {
        console.log(' Voicejar: Recording disabled in development');
        return;
      }

      // 🛡️ CHRIS-PROTOCOL: Forensic Audit - Voicejar disabled (v2.15.086)
      // We disable rrweb recording to prevent any potential "Access to other apps" prompts
      // that might be triggered by its deep DOM observation or potential hardware hooks.
      console.log(' Voicejar: Recording disabled to prevent system prompts');
      return;

      if (stopFnRef.current) stopFnRef.current();
      
      eventsRef.current = [];
      
      stopFnRef.current = rrweb.record({
        emit(event) {
          eventsRef.current.push(event);
          
          // Batch verzenden elke 50 events (was 10) om Disk IO te sparen
          if (eventsRef.current.length >= 50) {
            flushEvents();
          }
        },
      }) || null;
    };

    const flushEvents = async () => {
      if (eventsRef.current.length === 0) return;

      const payload = {
        visitorHash: visitorHashRef.current,
        events: [...eventsRef.current],
        url: window.location.href,
        userAgent: navigator.userAgent,
        iapContext: {
          pathname: window.location.pathname,
          timestamp: new Date().toISOString()
        }
      };

      eventsRef.current = [];

      try {
        const body = JSON.stringify(payload);
        
        //  CHRIS-PROTOCOL: Gebruik sendBeacon voor betrouwbaarheid bij afsluiten pagina
        // als de payload niet te groot is. Anders fetch met keepalive.
        const canUseBeacon = body.length < 64000 && typeof navigator !== 'undefined' && navigator.sendBeacon;
        
        if (canUseBeacon) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon('/api/voicejar/record', blob);
        } else {
          const useKeepAlive = body.length < 60000; 
          const res = await fetch('/api/voicejar/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: useKeepAlive
          });
          
          if (!res.ok) {
            throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
          }
        }
      } catch (e: any) {
        //  CHRIS-PROTOCOL: SILENCE IN DEV
        if (process.env.NODE_ENV !== 'development') {
          console.error(' Voicejar Flush Error:', e.message || e);
        }
      }
    };

    startRecording();

    // Flush bij unmount of page change
    return () => {
      if (stopFnRef.current) stopFnRef.current();
      flushEvents();
    };
  }, [pathname, isAdmin, isLoading]);

  return null; // Onzichtbaar instrument
};
