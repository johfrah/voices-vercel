"use client";

import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import React, { useEffect, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, TextInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';

const CONSENT_VERSION = '2026.1';

/**
 *  NUCLEAR COOKIE BANNER (2026)
 *
 * Voldoet aan de Zero Laws en het Master Voices Protocol.
 * LEX: Policy link, consent metadata (timestamp, version).
 * HITL: Gebruiker heeft de controle, machine onthoudt de voorkeur.
 */
export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { playClick } = useSonicDNA();

  useEffect(() => {
    const consent = typeof window !== 'undefined' ? localStorage.getItem('voices_cookie_consent') : null;
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    playClick('success');
    if (typeof window !== 'undefined') {
      const meta = {
        type,
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('voices_cookie_consent', type);
      localStorage.setItem('voices_cookie_consent_meta', JSON.stringify(meta));
      window.dispatchEvent(new CustomEvent('voices:consent', { detail: meta }));
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-8 left-8 md:right-auto md:w-[400px] z-[100]"
        >
          <ContainerInstrument plain className="bg-va-black text-white p-6 rounded-[24px] shadow-aura border border-white/5 relative overflow-hidden group">
            {/* Liquid Background Element */}
            <ContainerInstrument plain className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

            <ContainerInstrument plain className="relative z-10 space-y-4">
              <TextInstrument className="text-white/60 text-[15px] font-light"><VoiceglotText  
                  translationKey="legal.cookie.text" 
                  defaultText="Wij gebruiken cookies om jouw ervaring te personaliseren." 
                />{' '}
                <Link  
                  href="/cookies/" 
                  className="text-white/80 underline underline-offset-2 hover:text-white transition-colors"
                >
                  <VoiceglotText  translationKey="legal.cookie.policy" defaultText="Cookiebeleid" />
                </Link>
              </TextInstrument>

              <ContainerInstrument plain className="flex items-center gap-4">
                <ButtonInstrument 
                  onClick={() => handleAccept('all')}
                  className="bg-primary text-va-black px-5 py-2.5 rounded-[20px] text-[15px] font-bold tracking-tight hover:scale-105 transition-all"
                >
                  <VoiceglotText  translationKey="legal.cookie.accept" defaultText="Accepteer" />
                </ButtonInstrument>
                <ButtonInstrument 
                  onClick={() => handleAccept('essential')}
                  className="text-[15px] font-medium tracking-tight text-white/90 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-[15px] hover:bg-white/5"
                >
                  <VoiceglotText  translationKey="legal.cookie.essential" defaultText="Noodzakelijk" />
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
