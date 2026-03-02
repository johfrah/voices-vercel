"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface VoicesWordSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  min?: number;
  max?: number;
  livePrice?: string;
  disabled?: boolean; // NEW: for script state
  rounding?: 'left' | 'right' | 'none'; //  Fix for pill rounding
  isTelephony?: boolean; //  New prop for telephony context
  isVideo?: boolean; //  New prop for video context
  inline?: boolean; // NEW: for direct display without dropdown
}

export const VoicesWordSlider: React.FC<VoicesWordSliderProps> = ({
  value,
  onChange,
  label,
  className,
  min = 5,
  max = 5000,
  livePrice,
  disabled = false,
  rounding = 'none',
  isTelephony = false,
  isVideo = false,
  inline = false
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  //  CHRIS-PROTOCOL: Suggestion logic (Nuclear 2026)
  const promptSuggestion = useMemo(() => {
    if (isTelephony || isVideo) {
      const wpm = 155; // Vlaamse standaard uit SlimmeKassa
      const seconds = Math.round((value / wpm) * 60);
      
      if (seconds < 60) {
        return `± ${seconds} sec`;
      } else {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `± ${mins}:${secs.toString().padStart(2, '0')} min`;
      }
    }
    return null;
  }, [isTelephony, isVideo, value]);

  const videoSuggestion = null; // Deprecated in favor of unified promptSuggestion

  const sliderContent = (
    <ContainerInstrument plain className="space-y-4">
      <ContainerInstrument plain className="flex justify-between items-center">
        <TextInstrument as="span" className="text-[13px] font-bold text-va-black/40 uppercase tracking-widest">
          <VoiceglotText translationKey="filter.word_count" defaultText="Aantal woorden" />
        </TextInstrument>
        <TextInstrument as="span" className="text-[18px] font-bold text-primary">{value}</TextInstrument>
      </ContainerInstrument>
      
      <input
        type="range"
        min={min}
        max={max}
        step={value < 100 ? 5 : value < 500 ? 25 : 50}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-va-off-white rounded-lg appearance-none cursor-pointer accent-primary"
      />
      
      <ContainerInstrument plain className="flex justify-between text-[11px] font-bold text-va-black/20 uppercase tracking-tighter">
        <TextInstrument as="span">{min}</TextInstrument>
        <TextInstrument as="span">{max}</TextInstrument>
      </ContainerInstrument>
      {(promptSuggestion || videoSuggestion) && (
        <ContainerInstrument plain className="text-center">
          <TextInstrument as="span" className="text-va-black/30 font-light text-[12px]">({promptSuggestion || videoSuggestion})</TextInstrument>
        </ContainerInstrument>
      )}
    </ContainerInstrument>
  );

  if (inline) {
    return <ContainerInstrument plain className={cn("w-full", className)}>{sliderContent}</ContainerInstrument>;
  }

  return (
    <ContainerInstrument plain ref={containerRef} className={cn("relative z-20", className, disabled && "opacity-50 pointer-events-none")}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full h-full bg-transparent border-none py-3 px-8 text-left transition-all group/slider flex flex-col justify-center",
          !disabled && "cursor-pointer hover:bg-va-off-white",
          isOpen && "bg-va-off-white",
          rounding === 'left' && "rounded-l-full",
          rounding === 'right' && "rounded-r-full"
        )}
      >
        {label && (
          <TextInstrument as="span" className="text-[10px] font-bold tracking-[0.2em] text-va-black/60 uppercase mb-0.5 block">
            {label}
          </TextInstrument>
        )}
        <ContainerInstrument plain className="flex items-center justify-between gap-2 w-full">
          <ContainerInstrument plain className="flex items-center gap-3 min-w-0">
            <TextInstrument as="span" className={cn("text-[16px] font-bold truncate text-va-black")}>
              {value} {value === 1 ? t('common.word', 'woord') : t('common.words', 'woorden')} {(promptSuggestion || videoSuggestion) && (
                <TextInstrument as="span" className="text-va-black/30 font-light text-[14px] ml-1">({promptSuggestion || videoSuggestion})</TextInstrument>
              )}
            </TextInstrument>
            {livePrice && !disabled && (
              <TextInstrument as="span" className="text-[14px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full animate-in fade-in zoom-in-95 duration-300">
                {livePrice}
              </TextInstrument>
            )}
          </ContainerInstrument>
          {!disabled && (
            <ChevronDown 
              size={14} 
              className={cn("opacity-40 transition-transform duration-300 shrink-0 group-hover/slider:text-primary group-hover/slider:opacity-100", isOpen && "rotate-180 opacity-100")} 
            />
          )}
        </ContainerInstrument>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/10 rounded-[24px] shadow-2xl p-6 min-w-[280px] z-[100]"
          >
            {sliderContent}
          </motion.div>
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );
};
