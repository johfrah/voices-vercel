"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils/utils';

interface VoiceglotHtmlProps {
  translationKey: string;
  defaultHtml: string;
  className?: string;
}

/**
 *  VOICEGLOT HTML RENDERER
 * Voor grote blokken content (zoals lessen) die Markdown/HTML bevatten.
 */
export const VoiceglotHtml: React.FC<VoiceglotHtmlProps> = ({ 
  translationKey, 
  defaultHtml, 
  className 
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState(t(translationKey, defaultHtml));

  useEffect(() => {
    setContent(t(translationKey, defaultHtml));
  }, [translationKey, defaultHtml, t]);

  return (
    <div 
      className={cn("voiceglot-html", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
