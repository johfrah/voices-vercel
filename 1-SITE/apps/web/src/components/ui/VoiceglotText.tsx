"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';
import { Lock, Sparkles } from 'lucide-react';

interface VoiceglotTextProps {
  translationKey: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  noTranslate?: boolean;
}

/**
 * 🌐 VOICEGLOT INLINE EDITOR & SELF-HEALING
 * 500% Intuitief: Klikken & Typen.
 * 
 * 🩹 SELF-HEALING: Als een vertaling ontbreekt, wordt deze live 
 * gegenereerd via AI en wordt Johfrah genotificeerd.
 */
export const VoiceglotText: React.FC<VoiceglotTextProps> = ({ 
  translationKey, 
  defaultText, 
  className,
  as: Component = 'span',
  noTranslate = false
}) => {
  const { isEditMode } = useEditMode();
  const { playClick, playSwell } = useSonicDNA();
  const { t, language } = useTranslation();
  
  const [content, setContent] = useState(noTranslate ? defaultText : t(translationKey, defaultText));
  const [isSaving, setIsSaving] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  // 🩹 SELF-HEALING LOGIC
  useEffect(() => {
    if (noTranslate || language === 'nl') return;

    const currentTranslation = t(translationKey, defaultText);
    
    // Als de vertaling gelijk is aan de default (NL) maar we zitten in een andere taal,
    // dan is er een grote kans dat de vertaling ontbreekt.
    if (currentTranslation === defaultText && language !== 'nl' && !isHealing) {
      const healTranslation = async () => {
        setIsHealing(true);
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
          console.error('🩹 Self-healing failed:', e);
        } finally {
          setIsHealing(false);
        }
      };
      healTranslation();
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
        {content}
      </span>

      {isHealing && (
        <div className="absolute -right-6 top-1/2 -translate-y-1/2">
          <Sparkles size={12} className="text-primary animate-spin" />
        </div>
      )}

      {isEditMode && !noTranslate && (
        <div className="absolute -top-6 left-0 opacity-0 group-hover/edit:opacity-100 transition-opacity flex items-center gap-1 bg-va-black text-white px-2 py-0.5 rounded text-[15px] font-black tracking-widest pointer-events-none z-50">
          <Lock size={8} className="text-primary" />
          Voiceglot: {translationKey}
        </div>
      )}
    </Component>
  );
};
