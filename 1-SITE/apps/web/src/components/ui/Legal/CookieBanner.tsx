"use client";

import { useConsent } from '@/hooks/useConsent';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import React, { useEffect, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, TextInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';

const CONSENT_VERSION = '2026.2';

/**
 *  NUCLEAR COOKIE BANNER (2026)
 *
 * Voldoet aan de Zero Laws en het Master Voices Protocol.
 * LEX: Policy link, consent metadata (timestamp, version, visitor hash).
 * HITL: Gebruiker heeft de controle, machine onthoudt de voorkeur.
 * SONIC: DNA feedback bij interactie.
 */
export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { playClick } = useSonicDNA();
  const { consent, updateConsent, isLoaded } = useConsent();

  useEffect(() => {
    if (isLoaded && consent === 'none') {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, consent]);

  const handleAccept = async (type: 'all' | 'essential') => {
    playClick(type === 'all' ? 'success' : 'light');
    await updateConsent(type, CONSENT_VERSION);
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
              <ContainerInstrument plain className="space-y-1">
                <TextInstrument className="text-white text-[16px] font-medium tracking-tight">
                  <VoiceglotText 
                    translationKey="legal.cookie.title" 
                    defaultText="Mag Voicy je onthouden?" 
                  />
                </TextInstrument>
                <TextInstrument className="text-white/60 text-[14px] font-light leading-relaxed">
                  <VoiceglotText  
                    translationKey="legal.cookie.text_v2" 
                    defaultText="Accepteer cookies voor een gepersonaliseerde ervaring met Voicy en snellere toegang tot je projecten." 
                  />{' '}
                  <Link  
                    href="/cookies/" 
                    className="text-white/40 underline underline-offset-2 hover:text-white transition-colors"
                  >
                    <VoiceglotText  translationKey="legal.cookie.policy" defaultText="Details" />
                  </Link>
                </TextInstrument>
              </ContainerInstrument>

              <ContainerInstrument plain className="flex items-center gap-3">
                <ButtonInstrument 
                  onClick={() => handleAccept('all')}
                  className="bg-primary text-va-black px-6 py-2.5 rounded-[18px] text-[15px] font-bold tracking-tight hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  <VoiceglotText  translationKey="legal.cookie.accept_v2" defaultText="Ja, graag" />
                </ButtonInstrument>
                <ButtonInstrument 
                  onClick={() => handleAccept('essential')}
                  className="text-[14px] font-light tracking-tight text-white/40 hover:text-white transition-colors px-3 py-2"
                >
                  <VoiceglotText  translationKey="legal.cookie.essential_v2" defaultText="Liever niet" />
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
