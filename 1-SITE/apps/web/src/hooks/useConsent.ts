"use client";

import { useState, useEffect, useCallback } from 'react';

export type ConsentType = 'all' | 'essential' | 'none';

export interface ConsentMeta {
  type: ConsentType;
  version: string;
  timestamp: string;
  visitor_hash?: string;
}

/**
 * 🛡️ CHRIS-PROTOCOL: Centralized Consent Hook (v2.16.078)
 * 
 * Provides a single source of truth for privacy and tracking across the app.
 * Integrates with Mat's Visitor Intelligence and Lex's Audit requirements.
 */
export function useConsent() {
  const [consent, setConsent] = useState<ConsentType>('none');
  const [meta, setMeta] = useState<ConsentMeta | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadConsent = useCallback(() => {
    if (typeof window === 'undefined') return;

    const savedConsent = localStorage.getItem('voices_cookie_consent') as ConsentType;
    const savedMeta = localStorage.getItem('voices_cookie_consent_meta');
    
    if (savedConsent) {
      setConsent(savedConsent);
      if (savedMeta) {
        try {
          setMeta(JSON.parse(savedMeta));
        } catch (e) {
          console.error("[Consent] Failed to parse meta", e);
        }
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadConsent();

    const handleConsentEvent = (e: any) => {
      if (e.detail) {
        setConsent(e.detail.type);
        setMeta(e.detail);
      }
    };

    window.addEventListener('voices:consent', handleConsentEvent);
    return () => window.removeEventListener('voices:consent', handleConsentEvent);
  }, [loadConsent]);

  const updateConsent = async (type: ConsentType, version: string) => {
    if (typeof window === 'undefined') return;

    const visitorHash = localStorage.getItem('voices_visitor_hash') || undefined;
    const newMeta: ConsentMeta = {
      type,
      version,
      timestamp: new Date().toISOString(),
      visitor_hash: visitorHash
    };

    localStorage.setItem('voices_cookie_consent', type);
    localStorage.setItem('voices_cookie_consent_meta', JSON.stringify(newMeta));
    
    setConsent(type);
    setMeta(newMeta);

    // Dispatch for other components
    window.dispatchEvent(new CustomEvent('voices:consent', { detail: newMeta }));

    // ⚖️ LEX-MANDATE: Log to database for audit trail (Fire and forget)
    try {
      fetch('/api/admin/operational', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_consent',
          consent: newMeta
        })
      });
    } catch (e) {
      console.warn("[Consent] DB Logging failed", e);
    }
  };

  return {
    consent,
    meta,
    isLoaded,
    hasFullConsent: consent === 'all',
    hasEssentialConsent: consent === 'essential' || consent === 'all',
    updateConsent
  };
}
