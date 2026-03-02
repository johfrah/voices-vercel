"use client";

import { useEditMode } from '@/contexts/EditModeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { VoicesMasterControlContext } from '@/contexts/VoicesMasterControlContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import { Lock, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState, useContext } from 'react';
import { SlopFilter } from '@/lib/engines/slop-filter';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

interface VoiceglotTextProps {
  translationKey: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  noTranslate?: boolean;
  components?: Record<string, (children: any) => React.ReactNode>;
  values?: Record<string, string | number>;
  context?: string; //  Added context prop for better AI translations
}

// 🛡️ CHRIS-PROTOCOL: Global registry cache to prevent request storms
const registeredKeys = new Set<string>();

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
  values,
  context //  New prop
}) => {
  const { isEditMode } = useEditMode();
  const { playClick, playSwell } = useSonicDNA();
  const { t, language } = useTranslation();
  const masterControl = useContext(VoicesMasterControlContext);
  const isMuted = masterControl?.state?.isMuted ?? false;
  
  // 🛡️ CHRIS-PROTOCOL: Nuclear Hydration Guard (v2.14.199)
  // We renderen ALTIJD de defaultText op de server om hydration mismatches te voorkomen.
  // De client zal in de useEffect de vertaling ophalen.
  const [content, setContent] = useState<string>(defaultText);
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const failedHeals = useRef<Set<string>>(new Set());
  const textRef = useRef<HTMLSpanElement>(null);

  //  CHRIS-PROTOCOL: Hydration Safety
  useEffect(() => {
    setMounted(true);
    // Na hydration halen we de echte vertaling op
    const translated = noTranslate ? defaultText : t(translationKey, defaultText, values, !!components);
    setContent(translated);
  }, [noTranslate, defaultText, t, translationKey, values, components]);

  //  CHRIS-PROTOCOL: Force content update when translation or edit mode changes
  useEffect(() => {
    if (!mounted) return;
    
    const market = mounted ? MarketManager.getCurrentMarket() : null;
    
    // 🛡️ BRAND PROTECTION: 'Ademing' is een brand die niet vertaald mag worden
    const isAdemingBrand = ((defaultText || '')).toLowerCase() === 'ademing' || ((defaultText || '')).toLowerCase() === 'ademing.be';
    
    // 🛡️ CHRIS-PROTOCOL: 'nl-be' (ID 1) is the Source of Truth. Default is Truth.
    // We forceer de defaultText voor nl-be tenzij er een handmatige wijziging is in Edit Mode.
    // We gebruiken ID-handshake en case-insensitive check om lekken te voorkomen.
    const isSourceOfTruth = language?.toLowerCase() === 'nl-be' || (typeof window !== 'undefined' && (window as any).handshakeLanguages?.find((l: any) => l.id === 1)?.code === language?.toLowerCase());

    if (noTranslate || isAdemingBrand) {
      setContent(defaultText);
    } else if (isSourceOfTruth && !isEditMode) {
      // In nl-BE mode, we negeren de database vertalingen tenzij we in Edit Mode zijn
      // Dit voorkomt dat AI-slop de site vervuilt.
      setContent(defaultText);
    } else {
      const currentT = t(translationKey, defaultText, values, !!components);
      //  STABILITEIT: Gebruik SlopFilter om AI-foutmeldingen te blokkeren
      if (SlopFilter.isSlop(currentT || '', language, defaultText || '')) {
        setContent(defaultText);
      } else {
        setContent(currentT);
      }
    }
  }, [translationKey, defaultText, t, noTranslate, isEditMode, values, language, components, mounted]);

  //  REGISTRATION LOGIC (Nuclear 2026)
  // Zorgt ervoor dat nieuwe strings direct in de registry komen en vertaald worden
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return;
    
    // 🛡️ CHRIS-PROTOCOL: Prevent request storm - only register once per session
    if (registeredKeys.has(translationKey)) return;
    registeredKeys.add(translationKey);
    
    const registerString = async () => {
      try {
        // 🛡️ ANNA-PROTOCOL: Small delay to batch registration requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000));
        
        const market = MarketManager.getCurrentMarket();
        if (!market) return;
        
        await fetch('/api/admin/voiceglot/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            key: translationKey, 
            sourceText: defaultText,
            context: context || 'auto-registered', //  Pass context to registry
            sourceLangId: market?.primary_language_id || 1 // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth
          })
        });
      } catch (e) {
        // Silent fail
        registeredKeys.delete(translationKey); // Allow retry on next mount if failed
      }
    };

    // Alleen registreren als we in de bron-taal (NL) zitten of in Edit Mode
    const market = MarketManager.getCurrentMarket();
    if (!market) return;
    
    const sourceLang = market.market_code === 'ARTIST' ? 'en' : 'nl';
    
    if (language === sourceLang || isEditMode) {
      registerString();
    }
  }, [translationKey, defaultText, language, isEditMode, mounted, context]);

  //  SELF-HEALING LOGIC
  useEffect(() => {
    // CHRIS-PROTOCOL: Determine default language based on market
    // In Youssef market, 'en' is the source of truth, otherwise 'nl'
    const market = mounted ? MarketManager.getCurrentMarket() : null;
    if (!market) return;
    
    const sourceLang = market.market_code === 'ARTIST' ? 'en' : 'nl';

    if (noTranslate || language === sourceLang) return;

    const currentTranslation = t(translationKey, defaultText);
    
    // Als de vertaling gelijk is aan de default (Source) maar we zitten in een andere taal,
    // dan is er een grote kans dat de vertaling ontbreekt.
    // 🛡️ CHRIS-PROTOCOL: Live self-healing is disabled. We only allow it in Edit Mode for testing.
    // 💀 TERMINATION: 'nl-be' is eliminated from self-healing to prevent slop.
    if (currentTranslation === defaultText && language !== sourceLang && !isHealing && !failedHeals.current.has(translationKey) && isEditMode && language?.toLowerCase() !== 'nl-be') {
      const healTranslation = async () => {
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
              currentLang: language
            })
          });
          
          if (!res.ok) throw new Error(`Server responded with ${res.status}`);
          
          const data = await res.json();
          if (data.success && data.text) {
            setContent(data.text);
          }
        } catch (e) {
          console.error(' Self-healing failed:', e);
          // STABILITEIT: Markeer als gefaald om loop te stoppen
          failedHeals.current.add(translationKey);
          // Na 1 minuut mag het eventueel opnieuw
          setTimeout(() => failedHeals.current.delete(translationKey), 60000);
        } finally {
          setIsHealing(false);
        }
      };
      healTranslation();
    } else {
      setContent(t(translationKey, defaultText, values));
    }
  }, [translationKey, defaultText, t, language, noTranslate, isHealing, values, isEditMode]);

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

  //  RENDER LOGIC (Semantic Templates & Styling Markers)
  const renderContent = () => {
    if (isEditMode) return content;

    // 1. Handle Styling Markers (e.g., *text*)
    // Dit zorgt ervoor dat we hele zinnen kunnen vertalen en toch delen kunnen stylen
    // zonder "verkapte" zinnen in de registry.
    const styledParts = content.split(/(\*[^*]+\*)/g);
    const hasMarkers = styledParts.length > 1;

    const processPart = (part: string, keyPrefix: string) => {
      // 2. Handle Placeholders {key} inside parts
      if (!components) return part;
      
      const parts = part.split(/({[a-zA-Z0-9_-]+})/g);
      return parts.map((p, i) => {
        const match = p.match(/{([a-zA-Z0-9_-]+)}/);
        if (match) {
          const key = match[1];
          const component = components[key];
          if (component) return <React.Fragment key={`${keyPrefix}-${i}`}>{component(key)}</React.Fragment>;
        }
        return p;
      });
    };

    if (hasMarkers) {
      return styledParts.map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          const cleanPart = part.slice(1, -1);
          // Gebruik de 'highlight' component indien aanwezig, anders standaard styling
          const HighlightComponent = components?.highlight;
          if (HighlightComponent) {
            return <React.Fragment key={i}>{HighlightComponent(processPart(cleanPart, `marker-${i}`))}</React.Fragment>;
          }
          return (
            <span key={i} className="text-primary italic font-light">
              {processPart(cleanPart, `marker-${i}`)}
            </span>
          );
        }
        return processPart(part, `text-${i}`);
      });
    }

    // 3. Fallback to standard placeholder logic
    if (!components) return content;
    const parts = content.split(/({[a-zA-Z0-9_-]+})/g);
    return parts.map((part, i) => {
      const match = part.match(/{([a-zA-Z0-9_-]+)}/);
      if (match) {
        const key = match[1];
        const component = components[key];
        if (component) return <React.Fragment key={i}>{component(key)}</React.Fragment>;
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
