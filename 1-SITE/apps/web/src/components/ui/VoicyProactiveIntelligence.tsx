"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Brain, TrendingUp, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';

/**
 * 🧠 VOICY PROACTIVE INTELLIGENCE (GOD MODE 2026)
 * 
 * Een intelligent instrument dat pro-actief tips en inzichten geeft
 * op basis van de huidige context (dashboard, mailbox, etc).
 * ENKEL zichtbaar voor admins – niet voor publieke bezoekers.
 */

interface IntelligenceTip {
  id: string;
  type: 'opportunity' | 'warning' | 'insight' | 'action';
  title: string;
  description: string;
  icon: React.ReactNode;
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export const VoicyProactiveIntelligence = () => {
  const { isAdmin } = useAuth();
  const [tip, setTip] = useState<IntelligenceTip | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Mock data voor demo - in productie zou dit van een real-time stream of API komen
  // Alleen uitvoeren voor admins
  useEffect(() => {
    if (!isAdmin) return;
    const timer = setTimeout(() => {
      setTip({
        id: '1',
        type: 'opportunity',
        title: 'Nieuwe Markt-kans gedetecteerd',
        description: 'Ik zie een piek in aanvragen voor "AI-stemmen met emotie". Misschien moeten we de Studio-pagina hierop aanpassen?',
        icon: <TrendingUp strokeWidth={1.5} size={16} />,
        cta: {
          label: 'Bekijk Trend',
          onClick: () => window.location.href = '/admin/mailbox?tab=insights'
        }
      });
      setIsVisible(true);
    }, 5000); // Toon na 5 seconden

    return () => clearTimeout(timer);
  }, [isAdmin]);

  // ENKEL voor admins – verberg volledig voor publieke bezoekers (incl. incognito)
  if (!isAdmin) return null;
  if (!tip) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.9, x: 20 }}
          className="fixed bottom-6 md:bottom-8 right-6 md:right-8 z-[10002] max-w-sm w-full"
        >
          <ContainerInstrument className="bg-va-black text-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-2xl border border-white/10 relative overflow-hidden group">
            {/* Background Glow */}
            <ContainerInstrument className="absolute -top-20 -right-20 w-32 md:w-40 h-32 md:h-40 bg-primary/20 rounded-full blur-[30px] md:blur-[40px] group-hover:bg-primary/30 transition-all duration-1000" />
            
            <ContainerInstrument className="relative z-10">
              <ContainerInstrument className="flex justify-between items-start mb-4">
                <ContainerInstrument className="flex items-center gap-2">
                  <ContainerInstrument className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Brain strokeWidth={1.5} size={16} md:size={18} className="text-va-black" />
                  </ContainerInstrument>
                  <TextInstrument as="span" className="text-[15px] md:text-[15px] font-black tracking-[0.2em] text-primary ">
                    <VoiceglotText  translationKey="auto.voicyproactiveintelligence.voicy_intelligence.7a49dd" defaultText="Voicy Intelligence" />
                  </TextInstrument>
                </ContainerInstrument>
                <ButtonInstrument 
                  onClick={() => setIsVisible(false)}
                  className="text-white/20 hover:text-white transition-colors p-0 bg-transparent"
                >
                  <X strokeWidth={1.5} size={16} />
                </ButtonInstrument>
              </ContainerInstrument>

              <HeadingInstrument level={4} className="text-[15px] md:text-[15px] font-light mb-2 leading-tight ">
                {tip.title}
              </HeadingInstrument>
              
              <TextInstrument className="text-[15px] md:text-[15px] text-white/60 leading-relaxed mb-6 font-medium">
                {tip.description}
              </TextInstrument>

              <ContainerInstrument className="flex items-center gap-3">
                {tip.cta && (
                  <ButtonInstrument 
                    onClick={tip.cta.onClick}
                    className="bg-white text-va-black px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[15px] md:text-[15px] font-black tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-lg "
                  >
                    {tip.cta.label}
                    <ArrowRight strokeWidth={1.5} size={12} />
                  </ButtonInstrument>
                )}
                <ButtonInstrument 
                  onClick={() => setIsVisible(false)}
                  className="text-[15px] md:text-[15px] font-black tracking-widest text-white/40 hover:text-white transition-colors p-0 bg-transparent "
                >
                  <VoiceglotText  translationKey="auto.voicyproactiveintelligence.later____.0d5296" defaultText="Later" />
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
