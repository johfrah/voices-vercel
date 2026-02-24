"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SlopFilter } from '@/lib/engines/slop-filter';
import { MarketConfig } from '@/lib/system/market-manager-server';

interface TranslationContextType {
  t: (key: string, defaultText: string, values?: Record<string, string | number>, skipPlaceholderReplacement?: boolean) => string;
  language: string;
  market: MarketConfig;
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ 
  children: ReactNode; 
  lang?: string;
  market: MarketConfig;
  initialTranslations?: Record<string, string>;
}> = ({ children, lang = 'nl', market, initialTranslations = {} }) => {
  const [translations, setTranslations] = useState<Record<string, string>>(initialTranslations);
  const [loading, setLoading] = useState(Object.keys(initialTranslations).length === 0 && lang !== 'nl');
  const healingKeys = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    // Als we al initialTranslations hebben, hoeven we niet direct opnieuw te laden
    // tenzij de taal verandert.
    const fetchTranslations = async () => {
      if (lang === 'nl') {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`/api/translations/?lang=${lang}`);
        const data = await res.json();
        setTranslations(prev => ({ ...prev, ...(data.translations || {}) }));
      } catch (e) {
        console.error("Failed to fetch translations", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [lang]);

  const t = (key: string, defaultText: string, values?: Record<string, string | number>, skipPlaceholderReplacement = false): string => {
    let text = defaultText;
    
    if (lang !== 'nl' && !key.startsWith('admin.') && !key.startsWith('command.')) {
      const translation = translations[key];
      
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
    <TranslationContext.Provider value={{ t, language: lang, market, loading }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
