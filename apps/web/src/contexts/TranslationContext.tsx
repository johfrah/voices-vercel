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
  
  // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth (v2.19.5)
  // We resolve the language ID once and use it as the primary anchor.
  const languageId = React.useMemo(
    () => MarketManager.getLanguageId(normalizedLang) || market?.primary_language_id || 1,
    [normalizedLang, market?.primary_language_id]
  );
  const isSourceOfTruth = normalizedLang === 'nl-be'; // nl-be is the canonical source text

  const [loading, setLoading] = useState(Object.keys(initialTranslations).length === 0 && !isSourceOfTruth);
  const healingKeys = React.useRef<Set<string>>(new Set());

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
        const res = await fetch(`/api/translations/?lang=${encodeURIComponent(normalizedLang)}`);
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

  const t = (key: string, defaultText: string, values?: Record<string, string | number>, skipPlaceholderReplacement = false): string => {
    let text = defaultText;
    
    // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth (v2.19.5)
    // We skip database lookups for the Source of Truth (ID 1)
    if (!isSourceOfTruth && !key.startsWith('admin.') && !key.startsWith('command.')) {
      const translation = studioTranslations[key];
      
      //  STABILITEIT: Gebruik SlopFilter om AI-foutmeldingen te blokkeren
      if (!translation || translation.trim() === '' || SlopFilter.isSlop(translation, normalizedLang, defaultText)) {
        //  SELF-HEALING TRIGGER (Disabled temporarily for stability)
      } else {
        text = translation;
      }
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
