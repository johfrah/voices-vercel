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

export const VoicejarTracker: React.FC = () => {
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
        //  CHRIS-PROTOCOL: Voorkom 'Failed to fetch' door payload grootte te checken voor keepalive
        const useKeepAlive = body.length < 60000; 

        await fetch('/api/voicejar/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: useKeepAlive
        });
      } catch (e) {
        //  CHRIS-PROTOCOL: SILENCE IN DEV
        if (process.env.NODE_ENV !== 'development') {
          console.error(' Voicejar Flush Error:', e);
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
