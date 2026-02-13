"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

interface Language {
  code: string;
  label: string;
  native: string;
  flag: string;
}

const LANGUAGE_MAP: Record<string, Language> = {
  nl: { code: 'nl', label: 'Nederlands', native: 'Nederlands', flag: '🇧🇪' },
  fr: { code: 'fr', label: 'Frans', native: 'Français', flag: '🇫🇷' },
  en: { code: 'en', label: 'Engels', native: 'English', flag: '🇬🇧' },
  de: { code: 'de', label: 'Duits', native: 'Deutsch', flag: '🇩🇪' },
};

export const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>('nl');
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);
  const { playClick, playSwell } = useSonicDNA();

  const languages = Object.values(LANGUAGE_MAP);

  useEffect(() => {
    const langMatch = pathname.match(/^\/(nl|fr|en|de)(\/|$)/);
    if (langMatch) {
      setCurrentLang(langMatch[1]);
    } else {
      setCurrentLang('nl');
    }
  }, [pathname]);

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
    newPath = newPath.replace(/^\/(nl|fr|en|de)(\/|$)/, '/');
    if (!newPath.startsWith('/')) newPath = '/' + newPath;
    if (langCode !== 'nl') {
      newPath = `/${langCode}${newPath === '/' ? '' : newPath}`;
    }
    document.cookie = `voices_lang=${langCode}; path=/; max-age=31536000; SameSite=Lax`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          playClick('soft');
          setIsOpen(!isOpen);
        }}
        className="relative p-2 rounded-xl transition-all duration-500 cursor-pointer group flex items-center justify-center min-w-[40px] h-[40px] hover:bg-va-black/5"
      >
        <Image strokeWidth={1.5} 
          src="/assets/common/branding/icons/LANGUAGEa.svg" 
          alt="Language" 
          width={22}
          height={22}
          className="w-5.5 h-5.5 transition-transform duration-500 group-hover:scale-110" 
          style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
        / />
        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-primary text-white text-[15px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white leading-none z-10 ">
          {currentLang}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-[24px] shadow-aura border border-black/5 overflow-hidden z-50"
          >
            <div className="p-2">
              {languages.map((lang) => {
                const isActive = lang.code === currentLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-all duration-500 group mb-1 last:mb-0 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-va-black/60 hover:text-va-black hover:bg-white border border-transparent hover:border-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl leading-none">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className={`text-[15px] font-medium tracking-widest ${isActive ? 'text-white' : 'text-va-black'}`}>{lang.label}</span>
                        <span className={`text-[15px] mt-0.5 font-medium ${isActive ? 'text-white/60' : 'text-va-black/40'}`}>{lang.native}</span>
                      </div>
                    </div>
                    {isActive ? (
                      <Image strokeWidth={1.5} 
                        src="/assets/common/branding/icons/INFO.svg" 
                        alt="Active" 
                        width={14} 
                        height={14} 
                        className="brightness-0 invert"
                      / />
                    ) : (
                      <Image strokeWidth={1.5} 
                        src="/assets/common/branding/icons/FORWARD.svg" 
                        alt="Forward" 
                        width={12} 
                        height={12} 
                        className="opacity-0 group-hover:opacity-40 transition-opacity"
                        style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                      / />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
