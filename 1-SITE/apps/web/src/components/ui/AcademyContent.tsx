"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils/utils';
import { GlossaryTooltip } from './GlossaryTooltip';

interface AcademyContentProps {
  translationKey: string;
  defaultHtml: string;
  className?: string;
  variables?: Record<string, string>;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

/**
 *  ACADEMY CONTENT RENDERER
 * 
 * Scant de tekst op begrippen uit de glossary en voegt automatisch tooltips toe.
 * Werkt samen met Voiceglot voor vertalingen en ondersteunt variabelen (zoals {{firstName}}).
 */
export const AcademyContent: React.FC<AcademyContentProps> = ({ 
  translationKey, 
  defaultHtml, 
  className,
  variables = {}
}) => {
  const { t } = useTranslation();
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  
  // 1. Haal de ruwe content op via Voiceglot
  let rawContent = t(translationKey, defaultHtml);

  // 2. Vervang variabelen (zoals {{firstName}})
  Object.entries(variables).forEach(([key, value]) => {
    rawContent = rawContent.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  });

  // Fetch glossary terms
  useEffect(() => {
    fetch('/api/academy/glossary')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Sorteer op lengte (langste eerst) om te voorkomen dat kortere termen 
          // binnen langere termen worden vervangen (bijv. 'Voice' in 'Voice-over')
          const sorted = [...data].sort((a, b) => b.term.length - a.term.length);
          setGlossary(sorted);
        }
      })
      .catch(err => console.error("Failed to fetch glossary for tooltips", err));
  }, []);

  // De magie: vervang termen door tooltips
  // Omdat we React componenten willen renderen, kunnen we niet simpelweg 
  // dangerouslySetInnerHTML gebruiken voor de hele blok.
  // We gebruiken een hybride aanpak: we markeren de termen in de HTML string
  // en parsen deze daarna.
  
  const processedContent = useMemo(() => {
    if (glossary.length === 0) return <div dangerouslySetInnerHTML={{ __html: rawContent }} />;

    // We splitsen de content op in stukken: HTML tags en tekst
    // We willen alleen termen vervangen in de tekststukken, niet in de tags zelf.
    const parts = rawContent.split(/(<[^>]*>)/g);
    
    return (
      <div className={cn("academy-content-inner", className)}>
        {parts.map((part, index) => {
          if (part.startsWith('<')) {
            // Het is een HTML tag, render direct
            return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
          } else {
            // Het is tekst, zoek naar glossary termen
            let textParts: (string | React.ReactNode)[] = [part];
            
            glossary.forEach(({ term, definition }) => {
              const newTextParts: (string | React.ReactNode)[] = [];
              
              textParts.forEach(textPart => {
                if (typeof textPart !== 'string') {
                  newTextParts.push(textPart);
                  return;
                }

                // Gebruik een regex met word boundaries om exact te matchen
                // We ondersteunen ook termen met streepjes (zoals Voice-over)
                const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(\\b${escapedTerm}\\b)`, 'gi');
                const subParts = textPart.split(regex);
                
                subParts.forEach((subPart, i) => {
                  if (subPart.toLowerCase() === term.toLowerCase()) {
                    newTextParts.push(
                      <GlossaryTooltip key={`${term}-${index}-${i}`} term={term} definition={definition}>
                        {subPart}
                      </GlossaryTooltip>
                    );
                  } else if (subPart) {
                    newTextParts.push(subPart);
                  }
                });
              });
              
              textParts = newTextParts;
            });
            
            return <React.Fragment key={index}>{textParts}</React.Fragment>;
          }
        })}
      </div>
    );
  }, [rawContent, glossary, className]);

  return processedContent;
};
