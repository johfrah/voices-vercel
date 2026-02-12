"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import * as rrweb from 'rrweb';

/**
 * 🏺 VOICEJAR TRACKER - EXPERIENCE LAYER (2026)
 * 
 * Legt user interacties vast conform het Master Voices Protocol.
 * Gebruikt rrweb voor sessie-opnames zonder externe cookies.
 */

export const VoicejarTracker: React.FC = () => {
  const pathname = usePathname();
  const stopFnRef = useRef<(() => void) | null>(null);
  const eventsRef = useRef<any[]>([]);
  const visitorHashRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Genereer of haal visitor hash (simulatie van centrale state)
    let hash = localStorage.getItem('voices_visitor_hash');
    if (!hash) {
      hash = 'vj_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('voices_visitor_hash', hash);
    }
    visitorHashRef.current = hash;

    // 2. Start recording
    const startRecording = () => {
      if (stopFnRef.current) stopFnRef.current();
      
      eventsRef.current = [];
      
      stopFnRef.current = rrweb.record({
        emit(event) {
          eventsRef.current.push(event);
          
          // Batch verzenden elke 10 events of bij belangrijke acties
          if (eventsRef.current.length >= 10) {
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
        await fetch('/api/voicejar/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          // Gebruik keepalive voor data-integriteit bij navigeren
          keepalive: true 
        });
      } catch (e) {
        console.error('🏺 Voicejar Flush Error:', e);
      }
    };

    startRecording();

    // Flush bij unmount of page change
    return () => {
      if (stopFnRef.current) stopFnRef.current();
      flushEvents();
    };
  }, [pathname]);

  return null; // Onzichtbaar instrument
};
