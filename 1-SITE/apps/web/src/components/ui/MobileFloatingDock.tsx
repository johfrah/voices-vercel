"use client";

import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { MarketManager } from '@config/market-manager';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic2, LucideChevronRight, Home, Users, Search, Euro, User } from 'lucide-react';
import Image from 'next/image';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VoiceglotText } from './VoiceglotText';

/**
 * MOBILE FLOATING DOCK
 * Focus: Thumb-Zone Navigation & Haptic Feedback
 * Volgens Chris-Protocol: 100ms feedback, Deterministic
 */
export function MobileFloatingDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useVoicesState();
  const { playClick } = useSonicDNA();
  const market = MarketManager.getCurrentMarket();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSpecialJourney = ['PORTFOLIO', 'ARTIST', 'ADEMING', 'STUDIO', 'ACADEMY'].includes(market.market_code);

  if (!mounted || isSpecialJourney) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      playClick('pro');
      router.push(`/agency?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', href: '/', key: 'nav.home' },
    { icon: Users, label: 'Stemmen', href: '/agency', key: 'nav.my_voice' },
    { icon: Euro, label: 'Tarieven', href: '/tarieven', key: 'nav.pricing' },
    { icon: User, label: 'Account', href: '/account', key: 'nav.account' },
  ];

  const hasSelection = state.selected_actors.length > 0;

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[300] px-6 md:hidden pointer-events-none">
      <div className="relative mx-auto max-w-sm">
        {/*  CHRIS-PROTOCOL: Casting Action Trigger (Floating above dock when selection exists) */}
        <AnimatePresence>
          {hasSelection && (
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.8 }}
              animate={{ y: -12, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.8 }}
              className="absolute -top-16 left-0 right-0 flex justify-center pointer-events-auto z-[310]"
            >
              <button 
                onClick={() => {
                  playClick('pro');
                  window.location.href = '/casting/launchpad/';
                }}
                className="bg-primary text-white h-14 px-6 rounded-full flex items-center gap-3 shadow-[0_20px_50px_rgba(236,72,153,0.4)] hover:scale-105 active:scale-95 transition-all border border-white/20"
              >
                <div className="relative">
                  <Mic2 size={20} strokeWidth={2.5} />
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-va-black rounded-full flex items-center justify-center text-[10px] font-bold border border-white/20 shadow-sm">
                    {state.selected_actors.length}
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-bold tracking-widest uppercase leading-none">
                    <VoiceglotText translationKey="auto.castingdock.proefopname" defaultText="Gratis proefopname" />
                  </span>
                  <span className="text-[9px] font-medium opacity-70 leading-none mt-1 uppercase tracking-wider">
                    <VoiceglotText translationKey="auto.castingdock.start_selectie" defaultText="Bevestig selectie" />
                  </span>
                </div>
                <LucideChevronRight size={18} strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.nav 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="bg-va-black/90 backdrop-blur-2xl rounded-[32px] p-2 shadow-aura-lg border border-white/10 flex justify-between items-center pointer-events-auto relative z-[200]"
        >
          {navItems.map((item) => {
            const isActive = item.href ? (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) : isSearchOpen;
            const Icon = item.icon;

            const content = (
              <div className="relative flex flex-col items-center justify-center w-[80px] h-14 group">
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute inset-0 bg-primary rounded-2xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>
                
                <div className={`relative z-10 flex flex-col items-center gap-0.5 transition-all duration-300 ${isActive ? 'scale-105 text-white' : 'opacity-40 group-hover:opacity-70 text-white'}`}>
                  <div className="relative">
                    <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 1.5} />
                  </div>
                  <span className="text-[9px] font-medium tracking-tight leading-none">
                    <VoiceglotText translationKey={item.key} defaultText={item.label} />
                  </span>
                </div>
              </div>
            );

            if (item.href) {
              return (
                <Link  
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    playClick('soft');
                    setIsSearchOpen(false);
                  }}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.key} onClick={item.onClick}>
                {content}
              </button>
            );
          })}
        </motion.nav>
      </div>
    </div>
  );
}
