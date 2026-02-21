"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight, Globe } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { MarketManager } from '@config/market-manager';

import { ButtonInstrument, ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface Language {
  code: string;
  label: string;
  native: string;
  flag: string;
}

const LANGUAGE_MAP: Record<string, Language> = {
  nl: { code: 'nl', label: 'Dutch', native: 'Nederlands', flag: '' },
  fr: { code: 'fr', label: 'French', native: 'Français', flag: '' },
  en: { code: 'en', label: 'English', native: 'English', flag: '' },
  de: { code: 'de', label: 'German', native: 'Deutsch', flag: '' },
  es: { code: 'es', label: 'Spanish', native: 'Español', flag: '' },
  pt: { code: 'pt', label: 'Portuguese', native: 'Português', flag: '' },
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>('nl');
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);
  const { playClick, playSwell } = useSonicDNA();
  const market = MarketManager.getCurrentMarket();

  const languages = Object.values(LANGUAGE_MAP).sort((a, b) => {
    if (market.market_code === 'YOUSSEF') {
      if (a.code === 'en') return -1;
      if (b.code === 'en') return 1;
    }
    return 0;
  });

  useEffect(() => {
    const langMatch = pathname.match(/^\/(nl|fr|en|de|es|pt)(\/|$)/);
    if (langMatch) {
      setCurrentLang(langMatch[1]);
    } else {
      // CHRIS-PROTOCOL: Default to 'en' for Youssef market, otherwise 'nl'
      setCurrentLang(market.market_code === 'YOUSSEF' ? 'en' : 'nl');
    }
  }, [pathname, market.market_code]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
    playSwell();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  const switchLanguage = (langCode: string) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }
    playClick('soft');
    let newPath = pathname;
    newPath = newPath.replace(/^\/(nl|fr|en|de|es|pt)(\/|$)/, '/');
    if (!newPath.startsWith('/')) newPath = '/' + newPath;
    
    // CHRIS-PROTOCOL: Determine default language for routing
    const defaultLang = market.market_code === 'YOUSSEF' ? 'en' : 'nl';
    
    if (langCode !== defaultLang) {
      newPath = `/${langCode}${newPath === '/' ? '' : newPath}`;
    }
    document.cookie = `voices_lang=${langCode}; path=/; max-age=31536000; SameSite=Lax`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <ContainerInstrument 
      plain
      className="relative z-[210]" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ButtonInstrument
        variant="plain"
        size="none"
        onClick={(e) => {
          e.preventDefault();
          playClick('soft');
          setIsOpen(!isOpen);
        }}
        className={className || `relative p-1 rounded-[8px] transition-all duration-500 cursor-pointer group flex items-center justify-center min-w-[32px] h-[32px] ${
          isOpen 
            ? 'bg-primary/10 text-primary' 
            : market.market_code === 'YOUSSEF' 
              ? 'hover:bg-white/5 text-white' 
              : 'hover:bg-va-black/5 text-va-black'
        }`}
      >
        <Globe strokeWidth={1.5} size={20} className="transition-transform duration-500 group-hover:scale-110" />
        <TextInstrument 
          as={motion.span}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white leading-none z-10"
        >
          {currentLang}
        </TextInstrument>
      </ButtonInstrument>

      <AnimatePresence>
        {isOpen && (
          <ContainerInstrument
            as={motion.div}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            plain
            className="absolute top-full right-0 mt-1 w-64 bg-white rounded-[20px] shadow-aura border border-black/5 overflow-hidden z-[220]"
          >
            <div className="p-1">
              <ContainerInstrument plain className="px-4 py-3 border-b border-black/5 mb-1">
                <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-[0.2em] uppercase">
                  <VoiceglotText translationKey="nav.language_selection" defaultText="Language choice" />
                </TextInstrument>
              </ContainerInstrument>
              {languages.map((lang) => {
                const isActive = lang.code === currentLang;
                return (
                  <ButtonInstrument
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    variant="plain"
                    size="none"
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-500 group mb-1 last:mb-0 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-va-black/60 hover:text-va-black hover:bg-va-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TextInstrument as="span" className="text-base leading-none">{lang.flag}</TextInstrument>
                      <div className="flex flex-col">
                        <TextInstrument as="span" className={`text-[15px] font-medium tracking-tight ${isActive ? 'text-white' : 'text-va-black'}`}>
                          <VoiceglotText translationKey={`nav.lang_label.${lang.code}`} defaultText={lang.label} />
                        </TextInstrument>
                        <TextInstrument as="span" className={`text-[12px] mt-0.5 font-light ${isActive ? 'text-white/60' : 'text-va-black/40'}`}>{lang.native}</TextInstrument>
                      </div>
                    </div>
                    {isActive ? (
                      <Check strokeWidth={1.5} size={14} className="text-white" />
                    ) : (
                      <ChevronRight strokeWidth={1.5} size={10} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </ButtonInstrument>
                );
              })}
            </div>
          </ContainerInstrument>
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );
};
