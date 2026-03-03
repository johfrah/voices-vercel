"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SlopFilter } from '@/lib/engines/slop-filter';
import { MarketConfig, MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { normalizeLocale } from '@/lib/system/locale-utils';

interface TranslationContextType {
  t: (key: string, defaultText: string, values?: Record<string, string | number>, skipPlaceholderReplacement?: boolean) => string;
  language: string;
  languageId: number; // 🛡️ Handshake ID Truth
  market: MarketConfig;
  loading: boolean;
}

const StudioTranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ 
  children: ReactNode; 
  lang?: string;
  market: MarketConfig;
  initialTranslations?: Record<string, string>;
}> = ({ children, lang = 'nl-BE', market, initialTranslations = {} }) => {
  const [studioTranslations, setStudioTranslations] = useState<Record<string, string>>(initialTranslations);
  const normalizedLang = React.useMemo(() => normalizeLocale(lang), [lang]);
  const sourceLanguageId = React.useMemo(() => market?.primary_language_id || 1, [market?.primary_language_id]);
  
  // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth (v2.19.5)
  // We resolve the language ID once and use it as the primary anchor.
  const languageId = React.useMemo(
    () => MarketManager.getLanguageId(normalizedLang) || market?.primary_language_id || 1,
    [normalizedLang, market?.primary_language_id]
  );
  const isSourceOfTruth = normalizedLang === 'nl-be'; // nl-be is the canonical source text

  const [loading, setLoading] = useState(Object.keys(initialTranslations).length === 0 && !isSourceOfTruth);
  const healingKeys = React.useRef<Set<string>>(new Set());
  const registrationQueue = React.useRef<Map<string, string>>(new Map());
  const registeredMissingKeys = React.useRef<Set<string>>(new Set());
  const registrationTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushRegistrationQueue = React.useCallback(async () => {
    if (registrationQueue.current.size === 0) return;
    const batch = Array.from(registrationQueue.current.entries()).slice(0, 8);
    batch.forEach(([key]) => registrationQueue.current.delete(key));

    await Promise.allSettled(
      batch.map(async ([key, sourceText]) => {
        try {
          await fetch('/api/admin/voiceglot/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key,
              sourceText,
              context: 'translation-context-missing-key',
              sourceLangId: sourceLanguageId
            })
          });
        } catch {
          // silent fail: key stays in registeredMissingKeys to avoid storms
        }
      })
    );

    if (registrationQueue.current.size > 0) {
      registrationTimer.current = setTimeout(() => {
        flushRegistrationQueue();
      }, 1200);
    } else {
      registrationTimer.current = null;
    }
  }, [sourceLanguageId]);

  const queueRegistration = React.useCallback((key: string, defaultText: string) => {
    if (!key || !defaultText || key.startsWith('admin.') || key.startsWith('command.')) return;
    if (registeredMissingKeys.current.has(key)) return;
    registeredMissingKeys.current.add(key);
    registrationQueue.current.set(key, defaultText);
    if (!registrationTimer.current) {
      registrationTimer.current = setTimeout(() => {
        flushRegistrationQueue();
      }, 600);
    }
  }, [flushRegistrationQueue]);

  useEffect(() => {
    // 🛡️ CHRIS-PROTOCOL: Guard against missing market during hydration
    if (!market) return;

    const fetchTranslations = async () => {
      if (isSourceOfTruth) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(
          `/api/translations/?lang=${encodeURIComponent(normalizedLang)}&_v=2.28.5`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        setStudioTranslations(prev => ({ ...prev, ...(data.translations || {}) }));
      } catch (e) {
        console.error("Failed to fetch translations", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [normalizedLang, isSourceOfTruth, market?.market_code]);

  useEffect(() => {
    return () => {
      if (registrationTimer.current) clearTimeout(registrationTimer.current);
    };
  }, []);

  const t = (key: string, defaultText: string, values?: Record<string, string | number>, skipPlaceholderReplacement = false): string => {
    let text = defaultText;
    
    // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth (v2.19.5)
    // We skip database lookups for the Source of Truth (ID 1)
    if (!isSourceOfTruth && !key.startsWith('admin.') && !key.startsWith('command.')) {
      const translation = studioTranslations[key];
      
      //  STABILITEIT: Gebruik SlopFilter om AI-foutmeldingen te blokkeren
      if (!translation || translation.trim() === '' || SlopFilter.isSlop(translation, normalizedLang, defaultText)) {
        queueRegistration(key, defaultText);
      } else {
        text = translation;
      }
    } else if (isSourceOfTruth && !key.startsWith('admin.') && !key.startsWith('command.')) {
      queueRegistration(key, defaultText);
    }
    
    //  PLACEHOLDER REPLACEMENT (Nuclear 2026)
    if (values && !skipPlaceholderReplacement) {
      Object.entries(values).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    
    return text;
  };

  return (
    <StudioTranslationContext.Provider value={{ t, language: normalizedLang, languageId, market, loading }}>
      {children}
    </StudioTranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(StudioTranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
