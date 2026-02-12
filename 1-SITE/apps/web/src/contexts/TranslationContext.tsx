"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface TranslationContextType {
  t: (key: string, defaultText: string) => string;
  language: string;
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode; lang?: string }> = ({ children, lang = 'nl' }) => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/translations/?lang=${lang}`);
        const data = await res.json();
        setTranslations(data.translations || {});
      } catch (e) {
        console.error("Failed to fetch translations", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [lang]);

  const t = (key: string, defaultText: string): string => {
    if (lang === 'nl') return defaultText;
    const translation = translations[key];
    
    // 🛡️ STABILITEIT: Als de vertaling ontbreekt of leeg is, gebruik de defaultText (NL)
    if (!translation || translation.trim() === '') {
      // 🏥 SELF-HEALING TRIGGER (Silent)
      // We triggeren de healing alleen als we niet al aan het healen zijn
      if (typeof window !== 'undefined' && !isHealing) {
        fetch('/api/translations/heal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, originalText: defaultText, currentLang: lang })
        }).catch(() => {}); // Silent failure
      }
      return defaultText;
    }
    
    return translation;
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
