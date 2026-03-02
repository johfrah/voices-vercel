"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SlopFilter } from '@/lib/engines/slop-filter';
import { MarketConfig } from '@/lib/system/market-manager-server';

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
  
  // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth (v2.19.5)
  // We resolve the language ID once and use it as the primary anchor.
  const languageId = market.primary_language_id || 1;
  const isSourceOfTruth = languageId === 1; // nl-be is ID 1

  const [loading, setLoading] = useState(Object.keys(initialTranslations).length === 0 && !isSourceOfTruth);
  const healingKeys = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchTranslations = async () => {
      // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth (v2.26.2)
      // We map the incoming lang code to the official ISO codes used in the DB.
      let dataLang = lang;
      if (lang === 'en') dataLang = 'en-gb';
      if (lang === 'fr') dataLang = 'fr-be';
      if (lang === 'de') dataLang = 'de-de';
      if (lang === 'es') dataLang = 'es-es';
      if (lang === 'pt') dataLang = 'pt-pt';
      if (lang === 'it') dataLang = 'it-it';
      if (lang === 'nl') dataLang = 'nl-be';

      if (isSourceOfTruth) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`/api/translations/?lang=${dataLang}`);
        const data = await res.json();
        setStudioTranslations(prev => ({ ...prev, ...(data.translations || {}) }));
      } catch (e) {
        console.error("Failed to fetch translations", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [lang, isSourceOfTruth]);

  const t = (key: string, defaultText: string, values?: Record<string, string | number>, skipPlaceholderReplacement = false): string => {
    let text = defaultText;
    
    // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth (v2.19.5)
    // We skip database lookups for the Source of Truth (ID 1)
    if (!isSourceOfTruth && !key.startsWith('admin.') && !key.startsWith('command.')) {
      const translation = studioTranslations[key];
      
      //  STABILITEIT: Gebruik SlopFilter om AI-foutmeldingen te blokkeren
      if (!translation || translation.trim() === '' || SlopFilter.isSlop(translation, lang, defaultText)) {
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
    <StudioTranslationContext.Provider value={{ t, language: lang, languageId, market, loading }}>
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
