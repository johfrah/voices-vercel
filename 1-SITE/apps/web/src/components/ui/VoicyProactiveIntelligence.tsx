"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, ArrowRight, TrendingUp } from 'lucide-react';
import { ContainerInstrument, TextInstrument, HeadingInstrument, ButtonInstrument } from './LayoutInstruments';
import { useAuth } from '@/contexts/AuthContext';

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
        icon: <TrendingUp size={16} />,
        cta: {
          label: 'Bekijk Trend',
          onClick: () => window.location.href = '/account/mailbox?tab=insights'
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
          className="fixed bottom-8 right-8 z-[10002] max-w-sm w-full"
        >
          <ContainerInstrument className="bg-va-black text-white p-6 rounded-[32px] shadow-2xl border border-white/10 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[40px] group-hover:bg-primary/30 transition-all duration-1000" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Brain size={18} className="text-va-black" />
                  </div>
                  <TextInstrument as="span" className="text-[15px] font-black tracking-[0.2em] text-primary">
                    Voicy Intelligence
                  </TextInstrument>
                </div>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <X strokeWidth={1.5} size={16} />
                </button>
              </div>

              <HeadingInstrument level={4} className="text-sm font-black mb-2 leading-tight">
                {tip.title}
              </HeadingInstrument>
              
              <TextInstrument className="text-[15px] text-white/60 leading-relaxed mb-6 font-medium">
                {tip.description}
              </TextInstrument>

              <div className="flex items-center gap-3">
                {tip.cta && (
                  <ButtonInstrument 
                    onClick={tip.cta.onClick}
                    className="bg-white text-va-black px-4 py-2 rounded-xl text-[15px] font-black tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-lg"
                  >
                    {tip.cta.label}
                    <ArrowRight strokeWidth={1.5} size={12} />
                  </ButtonInstrument>
                )}
                <ButtonInstrument 
                  onClick={() => setIsVisible(false)}
                  className="text-[15px] font-black tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  Later
                </ButtonInstrument>
              </div>
            </div>
          </ContainerInstrument>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
