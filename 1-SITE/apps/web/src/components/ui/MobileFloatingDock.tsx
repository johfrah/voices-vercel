"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { MarketManager } from '@config/market-manager';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
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
  const { playClick } = useSonicDNA();
  const market = MarketManager.getCurrentMarket();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
    { src: '/assets/common/branding/icons/MENU.svg', label: 'Home', href: '/', key: 'nav.home' },
    { src: '/assets/common/branding/icons/INFO.svg', label: 'Stemmen', href: '/agency', key: 'nav.my_voice' },
    { src: '/assets/common/branding/icons/SEARCH.svg', label: 'Zoeken', onClick: () => {
      playClick('soft');
      setIsSearchOpen(!isSearchOpen);
    }, key: 'nav.search' },
    { src: '/assets/common/branding/icons/CART.svg', label: 'Tarieven', href: '/tarieven', key: 'nav.pricing' },
    { src: '/assets/common/branding/icons/ACCOUNT.svg', label: 'Account', href: '/account', key: 'nav.account' },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 px-6 md:hidden pointer-events-none">
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="absolute bottom-24 left-6 right-6 pointer-events-auto"
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek een stem..."
                className="w-full bg-va-black/95 backdrop-blur-2xl text-white border border-white/10 rounded-[24px] py-4 pl-12 pr-4 shadow-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Image  
                  src="/assets/common/branding/icons/SEARCH.svg" 
                  alt="Search" 
                  width={18} 
                  height={18} 
                  className="opacity-40 brightness-0 invert"
                / />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="mx-auto max-w-sm bg-va-black/90 backdrop-blur-2xl rounded-[32px] p-2 shadow-aura-lg border border-white/10 flex justify-between items-center pointer-events-auto relative"
      >
        {navItems.map((item) => {
          const isActive = item.href ? (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) : isSearchOpen;

          const content = (
            <div className="relative flex flex-col items-center justify-center w-14 h-14 group">
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
              
              <div className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-110 text-white' : 'opacity-40 group-hover:opacity-70 text-white'}`}>
                <Image  
                  src={item.src} 
                  alt={item.label} 
                  width={24} 
                  height={24} 
                  className="brightness-0 invert"
                / />
              </div>
              
              <span className="sr-only">
                <VoiceglotText strokeWidth={1.5} translationKey={item.key} defaultText={item.label} / />
              </span>
            </div>
          );

          if (item.href) {
            return (
              <Link strokeWidth={1.5} 
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
  );
}
