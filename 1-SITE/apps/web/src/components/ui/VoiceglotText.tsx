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
  context?: string;
  instrument?: 'button' | 'tag' | 'label' | 'text' | 'hero' | 'pricing';
  maxChars?: number;
  components?: Record<string, (children: React.ReactNode) => React.ReactNode>;
  values?: Record<string, string | number>;
}

/**
 *  VOICEGLOT INLINE EDITOR & SELF-HEALING
 * 500% Intuitief: Klikken & Typen.
 * 
 *  SELF-HEALING: Als een vertaling ontbreekt, wordt deze live 
 * gegenereerd via AI en wordt Johfrah genotificeerd.
 * 
 *  TEMPLATE SUPPORT: Ondersteunt {placeholder} in defaultText
 * die gemapt worden op 'components' (styling) of 'values' (data).
 */
export const VoiceglotText: React.FC<VoiceglotTextProps> = ({ 
  translationKey, 
  defaultText, 
  className,
  as: Component = 'span',
  noTranslate = false,
  context = '',
  instrument = 'text',
  maxChars,
  components,
  values
}) => {
  const { isEditMode } = useEditMode();
  const { playClick, playSwell } = useSonicDNA();
  const { t, language } = useTranslation();
  
  const [content, setContent] = useState(noTranslate ? defaultText : t(translationKey, defaultText));
  const [isSaving, setIsSaving] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  //  CHRIS-PROTOCOL: Get granular context from DOM
  const getGranularContext = () => {
    if (!containerRef.current) return context;
    
    try {
      const parent = containerRef.current.parentElement;
      const siblings = Array.from(parent?.children || [])
        .filter(c => c !== containerRef.current)
        .map(c => (c as HTMLElement).innerText?.slice(0, 30))
        .filter(Boolean)
        .join(' | ');
      
      const path = [];
      let curr = containerRef.current as HTMLElement | null;
      while (curr && path.length < 3) {
        path.push(curr.tagName.toLowerCase() + (curr.className ? '.' + curr.className.split(' ')[0] : ''));
        curr = curr.parentElement;
      }

      return `
        CONTEXT: ${context || 'General UI Text'}
        INSTRUMENT: ${instrument}
        DOM PATH: ${path.reverse().join(' > ')}
        SIBLINGS: ${siblings}
      `.trim();
    } catch (e) {
      return context;
    }
  };

  //  CHRIS-PROTOCOL: Force content update when translation or edit mode changes
  useEffect(() => {
    if (noTranslate) {
      setContent(defaultText);
    } else {
      const currentT = t(translationKey, defaultText);
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
  }, [translationKey, defaultText, t, noTranslate, isEditMode]);

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

  //  SELF-HEALING & AUDIT LOGIC
  useEffect(() => {
    // CHRIS-PROTOCOL: Determine default language based on market
    // In Youssef market, 'en' is the source of truth, otherwise 'nl'
    const isYoussefMarket = typeof window !== 'undefined' && (window.location.pathname.includes('/artist/youssef') || window.location.host.includes('youssefzaki.eu'));
    const sourceLang = isYoussefMarket ? 'en' : 'nl';

    if (noTranslate || language === sourceLang) return;

    const currentTranslation = t(translationKey, defaultText);
    
    //  NUCLEAR AUDIT PROTOCOL:
    // 1. Als de vertaling gelijk is aan de default (Source), dan ontbreekt deze -> HEAL
    // 2. Als de vertaling bestaat, maar we willen native kwaliteit garanderen -> BACKGROUND AUDIT
    const needsHeal = currentTranslation === defaultText;
    const needsAudit = !needsHeal && !isHealing; // We auditen bestaande copy in de achtergrond

    if ((needsHeal || needsAudit) && !isHealing) {
      const processTranslation = async () => {
        setIsHealing(true);
        
        //  ANNA-PROTOCOL: Small random delay to prevent "request storms" 
        // when many translations are missing on a single page.
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000));

        try {
          const res = await fetch('/api/translations/heal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: translationKey,
              originalText: defaultText,
              currentLang: language,
              forceAudit: needsAudit, // Trigger GPT-4o native check
              context: getGranularContext(),
              maxChars: maxChars,
              values: values
            })
          });
          const data = await res.json();
          if (data.success && data.text && needsHeal) {
            setContent(data.text);
          }
        } catch (e) {
          console.error(' Voiceglot process failed:', e);
        } finally {
          setIsHealing(false);
        }
      };
      processTranslation();
    } else {
      setContent(currentTranslation);
    }
  }, [translationKey, defaultText, t, language, noTranslate, isHealing]);

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

  //  CHRIS-PROTOCOL: Render content with template support
  const renderContent = () => {
    const hasComponents = components && Object.keys(components).length > 0;
    const hasValues = values && Object.keys(values).length > 0;

    if (!hasComponents && !hasValues) {
      return content;
    }

    // Split content by {placeholder}
    const parts = content.split(/(\{.*?\})/g);
    
    return parts.map((part, index) => {
      const match = part.match(/^\{(.*)\}$/);
      if (match) {
        const key = match[1];
        
        // 1. Check for value injection (data)
        if (values && values[key] !== undefined) {
          return <React.Fragment key={index}>{values[key]}</React.Fragment>;
        }

        // 2. Check for component injection (styling)
        const component = components?.[key];
        if (component) {
          return <React.Fragment key={index}>{component(key)}</React.Fragment>;
        }
      }
      return part;
    });
  };

  return (
    <Component 
      ref={containerRef as any}
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

      {isHealing && isEditMode && (
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
