"use client";

import { useEditMode } from '@/contexts/EditModeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { Lock, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface VoiceglotTextProps {
  translationKey: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  noTranslate?: boolean;
  components?: Record<string, (children: any) => React.ReactNode>;
  values?: Record<string, string | number>;
}

/**
 *  VOICEGLOT INLINE EDITOR & SELF-HEALING
 * 500% Intuitief: Klikken & Typen.
 * 
 *  SELF-HEALING: Als een vertaling ontbreekt, wordt deze live 
 * gegenereerd via AI en wordt Johfrah genotificeerd.
 */
export const VoiceglotText: React.FC<VoiceglotTextProps> = ({ 
  translationKey, 
  defaultText, 
  className,
  as: Component = 'span',
  noTranslate = false,
  components,
  values
}) => {
  const { isEditMode } = useEditMode();
  const { playClick, playSwell } = useSonicDNA();
  const { t, language } = useTranslation();
  
  const [content, setContent] = useState<string>(noTranslate ? defaultText : t(translationKey, defaultText, values));
  const [isSaving, setIsSaving] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  //  CHRIS-PROTOCOL: Force content update when translation or edit mode changes
  useEffect(() => {
    if (noTranslate) {
      setContent(defaultText);
    } else {
      const currentT = t(translationKey, defaultText, values);
      //  STABILITEIT: Als de vertaling een AI-foutmelding is, gebruik de defaultText
      if (currentT.includes('voldoende context') || 
          currentT.includes('meer informatie') || 
          currentT.includes('langere tekst') ||
          currentT.includes('niet compleet') ||
          currentT.includes('accuraat') ||
          currentT.includes('zou je') ||
          currentT.includes('het lijkt erop')) {
        setContent(defaultText);
      } else {
        setContent(currentT);
      }
    }
  }, [translationKey, defaultText, t, noTranslate, isEditMode, values]);

  //  REGISTRATION LOGIC (Nuclear 2026)
  // Zorgt ervoor dat nieuwe strings direct in de registry komen en vertaald worden
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const registerString = async () => {
      try {
        await fetch('/api/admin/voiceglot/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: translationKey, sourceText: defaultText })
        });
      } catch (e) {
        // Silent fail
      }
    };

    // Alleen registreren als we in de bron-taal (NL) zitten of in Edit Mode
    const isYoussefMarket = window.location.pathname.includes('/artist/youssef') || window.location.host.includes('youssefzaki.eu');
    const sourceLang = isYoussefMarket ? 'en' : 'nl';
    
    if (language === sourceLang || isEditMode) {
      registerString();
    }
  }, [translationKey, defaultText, language, isEditMode]);

  //  SELF-HEALING LOGIC
  useEffect(() => {
    // CHRIS-PROTOCOL: Determine default language based on market
    // In Youssef market, 'en' is the source of truth, otherwise 'nl'
    const isYoussefMarket = typeof window !== 'undefined' && (window.location.pathname.includes('/artist/youssef') || window.location.host.includes('youssefzaki.eu'));
    const sourceLang = isYoussefMarket ? 'en' : 'nl';

    if (noTranslate || language === sourceLang) return;

    const currentTranslation = t(translationKey, defaultText);
    
    // Als de vertaling gelijk is aan de default (Source) maar we zitten in een andere taal,
    // dan is er een grote kans dat de vertaling ontbreekt.
    if (currentTranslation === defaultText && language !== sourceLang && !isHealing) {
      const healTranslation = async () => {
        setIsHealing(true);
        
        //  ANNA-PROTOCOL: Small random delay to prevent "request storms" 
        // when many translations are missing on a single page.
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));

        try {
          const res = await fetch('/api/translations/heal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: translationKey,
              originalText: defaultText,
              currentLang: language
            })
          });
          const data = await res.json();
          if (data.success && data.text) {
            setContent(data.text);
          }
        } catch (e) {
          console.error(' Self-healing failed:', e);
        } finally {
          setIsHealing(false);
        }
      };
      healTranslation();
    } else {
      setContent(t(translationKey, defaultText, values));
    }
  }, [translationKey, defaultText, t, language, noTranslate, isHealing, values]);

  const handleBlur = async () => {
    if (noTranslate) return;
    const newText = textRef.current?.innerText || '';
    if (newText === content) return;

    setIsSaving(true);
    playClick('pro');

    try {
      const response = await fetch('/api/admin/voiceglot/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: translationKey,
          text: newText,
          lang: language,
          isManual: true
        }),
      });

      if (response.ok) {
        setContent(newText);
        playClick('success');
      }
    } catch (error) {
      console.error('Failed to save translation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textRef.current?.blur();
    }
  };

  //  RENDER LOGIC (Semantic Templates)
  const renderContent = () => {
    if (!components || isEditMode) return content;

    // Split content by placeholders {key}
    const parts = content.split(/({[a-zA-Z0-9_-]+})/g);
    
    return parts.map((part, i) => {
      const match = part.match(/{([a-zA-Z0-9_-]+)}/);
      if (match) {
        const key = match[1];
        const component = components[key];
        if (component) {
          // If the placeholder has a component, render it
          // We pass the key itself as children if no other content is available
          return <React.Fragment key={i}>{component(key)}</React.Fragment>;
        }
      }
      return part;
    });
  };

  return (
    <Component 
      className={cn(
        "relative group/edit inline-block transition-all duration-300",
        isEditMode && !noTranslate && "cursor-text hover:bg-primary/5 px-1 -mx-1 rounded-md min-w-[20px]",
        (isSaving || isHealing) && "opacity-50 pointer-events-none",
        className,
        noTranslate && "notranslate"
      )}
      translate={noTranslate ? "no" : undefined}
      data-no-translate={noTranslate}
    >
      <span
        ref={textRef}
        contentEditable={isEditMode && !noTranslate}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => isEditMode && !noTranslate && playSwell()}
        className={cn(
          "outline-none focus:ring-2 focus:ring-primary/30 rounded-sm transition-all block",
          isEditMode && !noTranslate && "border-b border-dashed border-primary/20",
          isHealing && "animate-pulse"
        )}
      >
        {renderContent()}
      </span>

      {isHealing && (
        <div className="absolute -right-6 top-1/2 -translate-y-1/2">
          <Sparkles strokeWidth={1.5} size={12} className="text-primary animate-spin" />
        </div>
      )}

      {isEditMode && !noTranslate && (
        <div className="absolute -top-6 left-0 opacity-0 group-hover/edit:opacity-100 transition-opacity flex items-center gap-1 bg-va-black text-white px-2 py-0.5 rounded text-[15px] font-black tracking-widest pointer-events-none z-50">
          <Lock strokeWidth={1.5} size={8} className="text-primary" />
          Voiceglot: {translationKey}
        </div>
      )}
    </Component>
  );
};
