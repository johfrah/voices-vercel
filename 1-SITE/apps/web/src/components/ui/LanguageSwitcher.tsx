"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Check } from 'lucide-react';

interface Language {
  code: string;
  label: string;
  native: string;
  flag: string;
}

const LANGUAGE_MAP: Record<string, Language> = {
  nl: { code: 'nl', label: 'Nederlands', native: 'Nederlands', flag: '🇧🇪' },
  fr: { code: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷' },
  en: { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  de: { code: 'de', label: 'Deutsch', native: 'Deutsch', flag: '🇩🇪' },
};

export const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>('nl');
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = Object.values(LANGUAGE_MAP);

  useEffect(() => {
    const langMatch = pathname.match(/^\/(nl|fr|en|de)(\/|$)/);
    if (langMatch) {
      setCurrentLang(langMatch[1]);
    } else {
      setCurrentLang('nl');
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const playClick = (type: 'soft' | 'pro' = 'soft') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      const now = audioCtx.currentTime;
      if (type === 'pro') {
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
      } else {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
      }
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.1);
    } catch (e) {}
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

  const currentLanguage = LANGUAGE_MAP[currentLang] || LANGUAGE_MAP.nl;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          playClick('soft');
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-va-black/5 border border-black/5 hover:bg-va-black/10 hover:border-black/10 transition-all duration-500 text-[10px] font-black uppercase tracking-widest text-va-black hover:text-va-black"
      >
        <span className="text-sm leading-none">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-64 bg-white rounded-[32px] shadow-2xl border border-black/5 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-3 bg-va-off-white/50">
            {languages.map((lang) => {
              const isActive = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    switchLanguage(lang.code);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-all duration-500 group mb-1 last:mb-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-va-black/60 hover:text-va-black hover:bg-white border border-transparent hover:border-black/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-va-black'}`}>{lang.native}</span>
                      <span className={`text-[10px] mt-0.5 font-bold uppercase tracking-tight ${isActive ? 'text-white/60' : 'text-va-black/40'}`}>{lang.label}</span>
                    </div>
                  </div>
                  {isActive && <Check size={14} className="text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
