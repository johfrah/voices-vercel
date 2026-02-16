"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ContainerInstrument } from './LayoutInstruments';

interface VoicesWordSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  min?: number;
  max?: number;
  livePrice?: string;
  rounding?: 'left' | 'right' | 'none'; // 🛡️ Fix for pill rounding
  isTelephony?: boolean; // 🛡️ New prop for telephony context
  isVideo?: boolean; // 🛡️ New prop for video context
}

export const VoicesWordSlider: React.FC<VoicesWordSliderProps> = ({
  value,
  onChange,
  label,
  className,
  min = 1,
  max = 5000,
  livePrice,
  rounding = 'none',
  isTelephony = false,
  isVideo = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🛡️ CHRIS-PROTOCOL: Suggestive Prompt Calculation (approx. 20 words per prompt)
  const promptSuggestion = useMemo(() => {
    if (!isTelephony) return null;
    const count = Math.max(1, Math.round(value / 20));
    return `± ${count} ${count === 1 ? 'prompt' : 'prompts'}`;
  }, [value, isTelephony]);

  // 🛡️ CHRIS-PROTOCOL: Suggestive Video Duration Calculation (approx. 155 words per minute)
  const videoSuggestion = useMemo(() => {
    if (!isVideo) return null;
    const minutes = value / 155;
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `± ${seconds} sec`;
    }
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (mins === 0) return `± ${secs} sec`;
    return `± ${mins}m ${secs.toString().padStart(2, '0')}s`;
  }, [value, isVideo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ContainerInstrument plain ref={containerRef} className={cn("relative z-20", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-full bg-transparent border-none py-3 px-8 text-left transition-all cursor-pointer hover:bg-va-off-white group/slider flex flex-col justify-center",
          isOpen && "bg-va-off-white",
          rounding === 'left' && "rounded-l-full",
          rounding === 'right' && "rounded-r-full"
        )}
      >
        {label && (
          <span className="text-[10px] font-bold tracking-[0.2em] text-va-black/60 uppercase mb-0.5 block">
            {label}
          </span>
        )}
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <span className={cn("text-[16px] font-bold truncate text-va-black")}>
              {value} woorden {(promptSuggestion || videoSuggestion) && (
                <span className="text-va-black/30 font-light text-[14px] ml-1">({promptSuggestion || videoSuggestion})</span>
              )}
            </span>
            {livePrice && (
              <span className="text-[14px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full animate-in fade-in zoom-in-95 duration-300">
                €{livePrice}
              </span>
            )}
          </div>
          <ChevronDown 
            size={14} 
            className={cn("opacity-40 transition-transform duration-300 shrink-0 group-hover/slider:text-primary group-hover/slider:opacity-100", isOpen && "rotate-180 opacity-100")} 
          />
        </div>
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-va-black/40 uppercase tracking-widest">Aantal woorden</span>
                <span className="text-[18px] font-bold text-primary">{value}</span>
              </div>
              
              <input
                type="range"
                min={min}
                max={max}
                step={value < 100 ? 5 : value < 500 ? 25 : 50}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-va-off-white rounded-lg appearance-none cursor-pointer accent-primary"
              />
              
              <div className="flex justify-between text-[11px] font-bold text-va-black/20 uppercase tracking-tighter">
                <span>{min}</span>
                <span>{max}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );
};
