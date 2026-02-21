"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface TranslationContextType {
  t: (key: string, defaultText: string) => string;
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

  const t = (key: string, defaultText: string): string => {
    if (lang === 'nl' || key.startsWith('admin.') || key.startsWith('command.')) return defaultText;
    const translation = translations[key];
    
    //  STABILITEIT: Als de vertaling ontbreekt of leeg is, gebruik de defaultText (NL)
    if (!translation || translation.trim() === '' || 
        translation.includes('voldoende context') || 
        translation.includes('meer informatie') || 
        translation.includes('langere tekst') ||
        translation.includes('niet compleet') ||
        translation.includes('accuraat') ||
        translation.includes('zou je') ||
        translation.includes('het lijkt erop')) {
      //  SELF-HEALING TRIGGER (Silent)
      // We triggeren de healing alleen als we niet al aan het healen zijn voor deze specifieke key
      if (typeof window !== 'undefined' && !healingKeys.current.has(key)) {
        healingKeys.current.add(key);
        fetch('/api/translations/heal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, originalText: defaultText, currentLang: lang })
        }).catch(() => {
          // Bij error, verwijder uit set zodat we het later opnieuw kunnen proberen
          healingKeys.current.delete(key);
        }); 
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
