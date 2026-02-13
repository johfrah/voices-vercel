"use client";

import React, { useState, useEffect } from 'react';
import { useSonicDNA } from '@/lib/sonic-dna';
import { VoiceglotText } from '../VoiceglotText';
import { motion, AnimatePresence } from 'framer-motion';
import { ContainerInstrument, TextInstrument, ButtonInstrument } from '../LayoutInstruments';

/**
 * 🍪 NUCLEAR COOKIE BANNER (2026)
 * 
 * Voldoet aan de Zero Laws en het Master Voices Protocol.
 * HITL: Gebruiker heeft de controle, machine onthoudt de voorkeur.
 * Status: HTML ZERO COMPLIANT.
 */
export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { playClick } = useSonicDNA();

  useEffect(() => {
    // Check of er al een keuze is gemaakt
    const consent = typeof window !== 'undefined' ? localStorage.getItem('voices_cookie_consent') : null;
    if (!consent) {
      // Toon de banner na een korte vertraging voor de "Spatial Growth" beleving
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    playClick('success');
    if (typeof window !== 'undefined') {
      localStorage.setItem('voices_cookie_consent', type);
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
          className="fixed bottom-8 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100]"
        >
          <ContainerInstrument plain className="bg-va-black text-white p-6 rounded-[24px] shadow-aura border border-white/5 relative overflow-hidden group">
            {/* Liquid Background Element */}
            <ContainerInstrument plain className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

            <ContainerInstrument plain className="relative z-10 space-y-4">
              <TextInstrument className="text-white/60 text-[15px] font-bold tracking-widest">
                <VoiceglotText 
                  translationKey="legal.cookie.text" 
                  defaultText="Wij gebruiken cookies om jouw ervaring te personaliseren." 
                />
              </TextInstrument>

              <ContainerInstrument plain className="flex items-center gap-4">
                <ButtonInstrument 
                  onClick={() => handleAccept('all')}
                  className="bg-primary text-va-black px-5 py-2.5 rounded-lg text-[15px] font-black tracking-widest hover:scale-105 transition-all"
                >
                  <VoiceglotText translationKey="legal.cookie.accept" defaultText="Accepteer" />
                </ButtonInstrument>
                <ButtonInstrument 
                  onClick={() => handleAccept('essential')}
                  className="text-[15px] font-black tracking-widest text-white/20 hover:text-white transition-colors"
                >
                  <VoiceglotText translationKey="legal.cookie.essential" defaultText="Noodzakelijk" />
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
