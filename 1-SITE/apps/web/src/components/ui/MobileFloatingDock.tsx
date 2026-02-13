"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { MarketManager } from '@config/market-manager';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  FormInstrument, 
  InputInstrument, 
  TextInstrument 
} from './LayoutInstruments';
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
    <ContainerInstrument className="fixed bottom-6 md:bottom-8 left-0 right-0 z-50 px-4 md:px-6 md:hidden pointer-events-none">
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="absolute bottom-20 md:bottom-24 left-4 md:left-6 right-4 md:right-6 pointer-events-auto"
          >
            <FormInstrument onSubmit={handleSearch} className="relative">
              <InputInstrument
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                placeholder="Zoek een stem..."
                className="w-full bg-va-black/95 backdrop-blur-2xl text-white border border-white/10 rounded-[20px] md:rounded-[24px] py-3 md:py-4 pl-10 md:pl-12 pr-4 shadow-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-[15px] md:text-[15px]"
              />
              <ContainerInstrument className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                <Image  
                  src="/assets/common/branding/icons/SEARCH.svg" 
                  alt="Search" 
                  width={16} 
                  height={16} 
                  className="opacity-40 brightness-0 invert"
                />
              </ContainerInstrument>
            </FormInstrument>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="mx-auto max-w-sm bg-va-black/90 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] p-1.5 md:p-2 shadow-aura-lg border border-white/10 flex justify-between items-center pointer-events-auto relative"
      >
        {navItems.map((item) => {
          const isActive = item.href ? (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) : isSearchOpen;

          const content = (
            <ContainerInstrument plain className="relative flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 group">
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary rounded-xl md:rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
              
              <ContainerInstrument plain className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-110 text-white' : 'opacity-40 group-hover:opacity-70 text-white'}`}>
                <Image  
                  src={item.src} 
                  alt={item.label} 
                  width={20} 
                  height={20} 
                  className="brightness-0 invert"
                />
              </ContainerInstrument>
              
              <TextInstrument as="span" className="sr-only font-light">
                <VoiceglotText  translationKey={item.key} defaultText={item.label} />
              </TextInstrument>
            </ContainerInstrument>
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
            <ButtonInstrument key={item.key} onClick={item.onClick} className="p-0 bg-transparent">
              {content}
            </ButtonInstrument>
          );
        })}
      </motion.nav>
    </ContainerInstrument>
  );
}
