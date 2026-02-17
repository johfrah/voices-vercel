"use client";

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Globe, Minus, Plus, Search } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ContainerInstrument } from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';

interface VoicesDropdownProps {
  options: (string | { 
    label: string; 
    value: string; 
    isHeader?: boolean; 
    isSub?: boolean;
    subLabel?: string;
    icon?: React.ElementType | string;
    availableExtraLangs?: string[]; //  Support for nested polyglot chips
  })[];
  value: any; 
  onChange: (value: any) => void;
  onExtraLangToggle?: (lang: string) => void; //  Callback for polyglot chips
  selectedExtraLangs?: string[]; //  Currently selected extra languages
  placeholder: string;
  label?: string;
  icon?: string;
  className?: string;
  required?: boolean;
  multiSelect?: boolean;
  stepperMode?: boolean; 
  yearsValue?: Record<string, number>;
  onYearsChange?: (value: Record<string, number>) => void;
  searchable?: boolean; 
  rounding?: 'left' | 'right' | 'none'; 
  livePrice?: string;
}

export const VoicesDropdown: React.FC<VoicesDropdownProps> = ({
  options,
  value,
  onChange,
  onExtraLangToggle,
  selectedExtraLangs = [],
  placeholder,
  label,
  icon,
  className,
  required = false,
  multiSelect = false,
  stepperMode = false,
  yearsValue,
  onYearsChange,
  searchable = false,
  rounding = 'none',
  livePrice
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter(opt => {
      const optLabel = typeof opt === 'string' ? opt : opt.label;
      return optLabel.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [options, searchQuery, searchable]);

  const handleSelect = (itemValue: string) => {
    if (stepperMode) return; // Steppers handle their own logic

    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
      if (currentValues.some(v => v.toLowerCase() === itemValue.toLowerCase())) {
        onChange(currentValues.filter(v => v.toLowerCase() !== itemValue.toLowerCase()));
      } else {
        onChange([...currentValues, itemValue]);
      }
    } else {
      //  CHRIS-PROTOCOL: If already selected, don't close, but also don't allow "unselecting" the primary language.
      // The primary language is the hard reference.
      if (value?.toLowerCase() === itemValue.toLowerCase()) {
        // Already selected, just keep open
      } else {
        onChange(itemValue);
        //  CHRIS-PROTOCOL: Always keep open in telephony journey to allow switching and polyglot selection
        const isTelephony = typeof window !== 'undefined' && window.location.search.includes('journey=telephony');
        
        if (isTelephony) {
          // Keep open to allow immediate switching or polyglot selection
        } else {
          setIsOpen(false);
        }
      }
    }
  };

  const updateStepper = (itemValue: string, delta: number) => {
    const currentMap = (value && typeof value === 'object' && !Array.isArray(value)) ? value : {};
    const currentValue = currentMap[itemValue] || 0;
    const nextValue = Math.max(0, currentValue + delta);
    
    let nextMap = { ...currentMap, [itemValue]: nextValue };
    
    //  CHRIS-PROTOCOL: Exclusivity Logic (Radio & TV)
    if (nextValue > 0) {
      const radioOptions = ['radio_national', 'radio_regional', 'radio_local'];
      const tvOptions = ['tv_national', 'tv_regional', 'tv_local'];
      
      if (radioOptions.includes(itemValue)) {
        // If selecting a radio option, remove other radio options
        radioOptions.forEach(opt => {
          if (opt !== itemValue) delete nextMap[opt];
        });
      } else if (tvOptions.includes(itemValue)) {
        // If selecting a TV option, remove other TV options
        tvOptions.forEach(opt => {
          if (opt !== itemValue) delete nextMap[opt];
        });
      }
    }

    if (nextValue === 0) delete nextMap[itemValue];
    
    onChange(nextMap);
  };

  const displayValue = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) return placeholder;
    
    if (stepperMode) {
      const activeKeys = Object.keys(value);
      if (activeKeys.length === 0) return placeholder;
      if (activeKeys.length === 1) {
        const opt = options.find(o => (typeof o === 'string' ? o : o.value) === activeKeys[0]);
        const label = typeof opt === 'string' ? opt : opt?.label || activeKeys[0];
        return `${value[activeKeys[0]]}x ${label}`;
      }
      return `${activeKeys.length} types`;
    }

    if (Array.isArray(value)) {
      if (value.length === 1) {
        const opt = options.find(o => {
          const v = typeof o === 'string' ? o : o.value;
          return v.toLowerCase() === value[0].toLowerCase();
        });
        return typeof opt === 'string' ? opt : opt?.label || value[0];
      }
      return `${value.length} geselecteerd`;
    }
    
    const opt = options.find(o => {
      const v = typeof o === 'string' ? o : o.value;
      return v.toLowerCase() === value.toLowerCase();
    });
    const label = typeof opt === 'string' ? opt : opt?.label || value;
    if (!label) return placeholder;
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  return (
    <ContainerInstrument plain ref={containerRef} className={cn("relative z-20", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-full bg-transparent border-none py-3 px-8 text-left transition-all cursor-pointer hover:bg-va-off-white group/dropdown flex flex-col justify-center",
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
            {icon && (
              <div className="shrink-0 opacity-60">
                <VoiceglotImage  
                  src={icon} 
                  alt="" 
                  width={12} 
                  height={12} 
                  style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                />
              </div>
            )}
            <span className={cn("text-[16px] font-bold truncate", (!value || (Array.isArray(value) && value.length === 0) || (stepperMode && Object.keys(value).length === 0)) ? "text-va-black/40" : "text-va-black")}>
              {displayValue()}
            </span>
            {livePrice && (
              <span className="text-[14px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full animate-in fade-in zoom-in-95 duration-300">
                {livePrice}
              </span>
            )}
          </div>
          <ChevronDown 
            size={14} 
            className={cn("opacity-40 transition-transform duration-300 shrink-0 group-hover/dropdown:text-primary group-hover/dropdown:opacity-100", isOpen && "rotate-180 opacity-100")} 
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
            className="absolute top-full left-0 mt-2 min-w-[320px] bg-white border border-black/10 rounded-[24px] shadow-2xl overflow-hidden z-[100]"
          >
            {searchable && (
              <div className="p-4 border-b border-black/5">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-va-black/30" />
                  <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchSearchQuery(e.target.value)}
                    placeholder="Zoeken..."
                    className="w-full pl-10 pr-4 py-2 bg-va-off-white rounded-full text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="py-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {/*  CHRIS-PROTOCOL: Primary language is the hard reference and cannot be "unselected" */}
              {/* We only show the "None" option if NOT in telephony journey or if it's not the language dropdown */}
              {!required && !multiSelect && !stepperMode && !searchQuery && !(typeof window !== 'undefined' && window.location.search.includes('journey=telephony')) && (
                <button
                  onClick={() => { onChange(null); setIsOpen(false); }}
                  className={cn(
                    "w-full px-6 py-4 text-left text-[15px] font-bold transition-colors flex items-center justify-between group",
                    !value ? "bg-primary/10 text-primary" : "text-va-black hover:bg-va-off-white"
                  )}
                >
                  <span>{placeholder}</span>
                  {!value && <Check size={16} strokeWidth={3} className="text-primary" />}
                </button>
              )}
              
              {filteredOptions.map((opt, idx) => {
                const item = typeof opt === 'string' ? { label: opt, value: opt, isHeader: false, isSub: false, subLabel: undefined, icon: undefined } : opt;
                const Icon = item.icon;
                
                if (item.isHeader) {
                  return (
                    <div key={idx} className="px-6 py-2 mt-2 text-[11px] font-bold tracking-[0.2em] text-va-black/40 uppercase bg-va-off-white/50">
                      {item.label}
                    </div>
                  );
                }

                if (stepperMode) {
                  const count = value?.[item.value] || 0;
                  const StepperIcon = item.icon;
                  const isPodcast = item.value === 'podcast';
                  const years = yearsValue?.[item.value] || 1;

                  return (
                    <div key={idx} className="px-6 py-4 flex flex-col group hover:bg-va-off-white transition-colors border-b border-black/[0.03] last:border-0 gap-4">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          {StepperIcon && (
                            <div className={cn("shrink-0", count > 0 ? "text-primary" : "text-va-black/30")}>
                              {typeof StepperIcon === 'string' ? (
                                <VoiceglotImage src={StepperIcon} width={20} height={20} alt="" />
                              ) : (
                                <StepperIcon size={20} strokeWidth={1.5} />
                              )}
                            </div>
                          )}

                          <div className="flex flex-col min-w-0">
                            <span className={cn("text-[15px] font-bold truncate", count > 0 ? "text-va-black" : "text-va-black/60")}>
                              {item.label}
                            </span>
                            {item.subLabel && (
                              <span className="text-[12px] text-va-black/40 leading-tight">
                                {item.subLabel}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateStepper(item.value, -1)}
                            disabled={count === 0}
                            className={cn(
                              "w-8 h-8 rounded-full border flex items-center justify-center transition-all",
                              count > 0 ? "border-black/10 text-va-black hover:border-black/30" : "border-black/5 text-va-black/10 cursor-not-allowed"
                            )}
                          >
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          <span className={cn("text-[15px] font-bold w-4 text-center tabular-nums", count > 0 ? "text-va-black" : "text-va-black/20")}>
                            {count}
                          </span>
                          <button 
                            onClick={() => updateStepper(item.value, 1)}
                            className="w-8 h-8 rounded-full border border-black/10 text-va-black flex items-center justify-center hover:border-black/30 transition-all"
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      {/* KELLY'S DURATION SYNC */}
                      {count > 0 && onYearsChange && (
                        <div className="flex items-center justify-between pl-12 pr-2 animate-in fade-in slide-in-from-top-1 duration-300">
                          <span className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest">
                            {isPodcast ? 'Licentie' : 'Looptijd'}
                          </span>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => {
                                const next = Math.max(isPodcast ? 0.25 : 1, years - (isPodcast ? 0.25 : 1));
                                onYearsChange({ ...yearsValue, [item.value]: next });
                              }}
                              className="text-va-black/40 hover:text-primary transition-colors"
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <span className="text-[11px] font-bold text-primary min-w-[40px] text-center">
                              {isPodcast ? `${years * 4} units` : `${years}j`}
                            </span>
                            <button 
                              onClick={() => {
                                const next = Math.min(5, years + (isPodcast ? 0.25 : 1));
                                onYearsChange({ ...yearsValue, [item.value]: next });
                              }}
                              className="text-va-black/40 hover:text-primary transition-colors"
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                
                const isSelected = Array.isArray(value) ? value.some(v => v.toLowerCase() === item.value.toLowerCase()) : (typeof value === 'string' ? value.toLowerCase() === item.value.toLowerCase() : false);
                const IconComponent = item.icon;

                return (
                  <div key={idx} className="flex flex-col">
                    <button
                      onClick={() => handleSelect(item.value)}
                      className={cn(
                        "w-full px-6 py-3 text-left transition-colors flex items-center justify-between group min-h-[56px]",
                        isSelected ? "bg-primary/5 text-primary" : "text-va-black hover:bg-va-off-white",
                        item.isSub && "pl-10"
                      )}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {IconComponent && (
                          <div className={cn("shrink-0", isSelected ? "text-primary" : "text-va-black/30")}>
                            {typeof IconComponent === 'string' ? (
                              <VoiceglotImage src={IconComponent} width={18} height={18} alt="" />
                            ) : (
                              <IconComponent size={18} strokeWidth={1.5} />
                            )}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className={cn("text-[15px] font-bold truncate", isSelected ? "text-primary" : "text-va-black")}>
                            {item.label}
                          </span>
                          {item.subLabel && (
                            <span className="text-[11px] opacity-60 leading-tight">
                              {item.subLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-5 flex justify-end shrink-0 ml-4">
                        {isSelected && <Check size={16} strokeWidth={3} className="text-primary" />}
                      </div>
                    </button>

                    {/*  NESTED POLYGLOT CHIPS (Progressive Disclosure inside Dropdown) */}
                    <AnimatePresence initial={false}>
                      {isSelected && item.availableExtraLangs && item.availableExtraLangs.length > 0 && (
                        <motion.div 
                          key={`extra-${item.value}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                          className="overflow-hidden bg-primary/[0.02] border-y border-black/[0.03]"
                        >
                          <div className="px-6 py-4 flex flex-col gap-3">
                            <span className="text-[9px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                              Combineer met:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {item.availableExtraLangs.map((extraLang) => {
                                const isExtraSelected = selectedExtraLangs.includes(extraLang.toLowerCase());
                                return (
                                  <button
                                    key={extraLang}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onExtraLangToggle?.(extraLang);
                                    }}
                                    className={cn(
                                      "px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-300 flex items-center gap-1.5",
                                      isExtraSelected 
                                        ? "bg-primary text-white border-primary shadow-md scale-105" 
                                        : "bg-white border-black/5 text-va-black/60 hover:border-primary/30 hover:text-primary"
                                    )}
                                  >
                                    <Globe size={10} className={cn("opacity-40", isExtraSelected && "opacity-100")} />
                                    {extraLang.charAt(0).toUpperCase() + extraLang.slice(1)}
                                    {isExtraSelected && <Check size={10} strokeWidth={3} />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );

              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );
};

