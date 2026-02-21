"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SlopFilter } from '@/lib/slop-filter';

interface TranslationContextType {
  t: (key: string, defaultText: string, values?: Record<string, string | number>) => string;
  language: string;
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ 
  children: ReactNode; 
  lang?: string;
  initialTranslations?: Record<string, string>;
}> = ({ children, lang = 'nl', initialTranslations = {} }) => {
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

  const t = (key: string, defaultText: string, values?: Record<string, string | number>): string => {
    let text = defaultText;
    
    if (lang !== 'nl' && !key.startsWith('admin.') && !key.startsWith('command.')) {
      const translation = translations[key];
      
      //  STABILITEIT: Gebruik SlopFilter om AI-foutmeldingen te blokkeren
      if (!translation || translation.trim() === '' || SlopFilter.isSlop(translation, lang, defaultText)) {
        //  SELF-HEALING TRIGGER (Silent)
        if (typeof window !== 'undefined' && !healingKeys.current.has(key)) {
          healingKeys.current.add(key);
          fetch('/api/translations/heal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, originalText: defaultText, currentLang: lang })
          }).catch(() => {
            healingKeys.current.delete(key);
          }); 
        }
      } else {
        text = translation;
      }
    }
    
    //  PLACEHOLDER REPLACEMENT (Nuclear 2026)
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    
    return text;
  };

  return (
    <TranslationContext.Provider value={{ t, language: lang, loading }}>
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
