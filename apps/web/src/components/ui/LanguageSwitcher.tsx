"use client";

import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight, Globe } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

import { useAuth } from '@/contexts/AuthContext';

interface Language {
  id: number;
  code: string;
  label: string;
  native: string;
  flag: string;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const host = typeof window !== 'undefined' ? window.location.host : (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE'].replace('https://', ''));
  const market = MarketManager.getCurrentMarket(host);
  const [currentLangId, setCurrentLangId] = useState<number>(market?.primary_language_id || 1);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<any>(null);
  const { playClick, playSwell } = useSonicDNA();

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = React.useMemo(() => {
    // 🛡️ CHRIS-PROTOCOL: Handshake Registry is leading (v2.24.0)
    // We fetch ALL languages and world-specific links from the database registry.
    const registry = MarketManager.languages;
    const worldLangs = MarketManager.worldLanguages;
    const currentWorldId = MarketManager.getWorldId(market.market_code);
    
    // 🌍 DNA-ROUTING: Filter languages via the world_languages link table
    const supportedLangsForWorld = worldLangs.filter(wl => wl.world_id === currentWorldId);
    const supportedIds = supportedLangsForWorld.map(wl => wl.language_id);

    // Map registry objects to the internal Language interface
    const allLangs: Language[] = registry.map(l => {
      const worldLink = supportedLangsForWorld.find(wl => wl.language_id === l.id);
      return {
        id: l.id,
        code: l.code,
        label: l.label,
        native: MarketManager.getLanguageLabel(l.id),
        flag: MarketManager.getLanguageIcon(l.id) || '🌐',
        isPrimary: worldLink?.is_primary || false,
        isPopular: worldLink?.is_popular || false
      };
    });

    let filtered = allLangs.filter(l => supportedIds.includes(l.id));

    // Fallback if no links found (safety pulse)
    if (filtered.length === 0) {
      const fallbackIds = market.supported_languages?.map(l => {
        const match = registry.find(r => r.code.toLowerCase() === l.toLowerCase() || r.label.toLowerCase() === l.toLowerCase());
        return match?.id;
      }).filter(Boolean) as number[] || [1, 2, 4, 5];
      filtered = allLangs.filter(l => fallbackIds.includes(l.id));
    }

    return filtered.sort((a, b) => {
      // 1. Huidige markt-taal (Primary) bovenaan
      if ((a as any).isPrimary) return -1;
      if ((b as any).isPrimary) return 1;
      
      // 2. Populaire talen voor deze world
      if ((a as any).isPopular && !(b as any).isPopular) return -1;
      if (!(a as any).isPopular && (b as any).isPopular) return 1;
      
      return 0;
    });
  }, [market]);

  useEffect(() => {
    const langMatch = pathname.match(/^\/(nl|fr|en|de|es|pt)(\/|$)/);
    const registry = MarketManager.languages;
    
    if (langMatch) {
      const slug = langMatch[1];
      // Map slug back to ID via registry
      const match = registry.find(r => r.code.startsWith(slug));
      if (match) setCurrentLangId(match.id);
    } else {
      setCurrentLangId(market.primary_language_id || 1);
    }
  }, [pathname, market]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
    playSwell();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  const switchLanguage = (lang: Language) => {
    if (lang.id === currentLangId) {
      setIsOpen(false);
      return;
    }
    playClick('soft');
    let newPath = pathname;
    newPath = newPath.replace(/^\/(nl|fr|en|de|es|pt)(\/|$)/, '/');
    if (!newPath.startsWith('/')) newPath = '/' + newPath;
    
    // CHRIS-PROTOCOL: De default taal van de markt heeft geen prefix in de URL
    const defaultLangId = market.primary_language_id || 1;
    const langSlug = lang.code.split('-')[0];
    
    if (lang.id !== defaultLangId) {
      newPath = `/${langSlug}${newPath === '/' ? '' : newPath}`;
    }
    document.cookie = `voices_lang=${langSlug}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Intelligent Stickiness: Sync preference to DB if logged in
    if (isAuthenticated) {
      fetch('/api/account/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: { preferred_language_id: lang.id, preferred_language: langSlug } })
      }).catch(err => console.error('Failed to sync language preference:', err));
    }

    router.push(newPath);
    setIsOpen(false);
  };

  // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth (v2.19.5)
  const currentLang = languages.find(l => l.id === currentLangId) || languages[0] || { id: 1, code: 'nl-be', native: 'Vlaams', flag: '🇧🇪' };

  if (!mounted) {
    return (
      <ButtonInstrument
        variant="plain"
        size="none"
        className={className || `relative p-1 rounded-full transition-all duration-500 group flex items-center justify-center min-w-[32px] h-[32px] ${
          market.market_code === 'ARTIST' ? 'text-white' : 'text-va-black'
        }`}
      >
        <Globe strokeWidth={1.5} size={20} />
        <TextInstrument 
          as="span"
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white leading-none z-10"
        >
          {currentLang.code.split('-')[0]}
        </TextInstrument>
      </ButtonInstrument>
    );
  }

  return (
    <ContainerInstrument 
      plain
      as="div"
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
        className={className || `relative p-1 rounded-full transition-all duration-500 cursor-pointer group flex items-center justify-center min-w-[32px] h-[32px] ${
          isOpen 
            ? 'bg-primary/10 text-primary' 
            : market.market_code === 'ARTIST' 
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
          {currentLang.code.split('-')[0]}
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
                const isActive = lang.id === currentLangId;
                return (
                  <ButtonInstrument
                    key={lang.id}
                    onClick={() => switchLanguage(lang)}
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
                          <VoiceglotText translationKey={`nav.lang_label.${lang.code.split('-')[0]}`} defaultText={lang.native} />
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
}
