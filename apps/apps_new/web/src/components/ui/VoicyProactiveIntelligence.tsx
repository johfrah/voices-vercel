"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Brain, TrendingUp, X, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';

/**
 *  VOICY PROACTIVE INTELLIGENCE (GOD MODE 2026)
 * 
 * Een intelligent instrument dat pro-actief tips en inzichten geeft
 * op basis van de huidige context (dashboard, mailbox, etc).
 * ENKEL zichtbaar voor admins - niet voor publieke bezoekers.
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/mailbox/insights');
        const data = await res.json();
        
        if (data && data.trends && data.trends.length > 0) {
          // Kies een willekeurige trend als inzicht
          const trend = data.trends[Math.floor(Math.random() * data.trends.length)];
          
          setTip({
            id: trend.label,
            type: trend.status === 'up' ? 'opportunity' : 'insight',
            title: trend.label,
            description: trend.explanation,
            icon: <TrendingUp strokeWidth={1.5} size={16} />,
            cta: {
              label: 'Bekijk Insights',
              onClick: () => window.location.href = '/admin/mailbox?tab=insights'
            }
          });
          
          // Toon na een korte vertraging voor een "natuurlijk" gevoel
          setTimeout(() => setIsVisible(true), 3000);
        }
      } catch (error) {
        console.error('Failed to fetch Voicy Intelligence:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [isAdmin]);

  if (!isAdmin || !tip) return null;

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
            <ContainerInstrument className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[40px] group-hover:bg-primary/30 transition-all duration-1000" />
            
            <ContainerInstrument className="relative z-10">
              <ContainerInstrument className="flex justify-between items-start mb-4">
                <ContainerInstrument className="flex items-center gap-2">
                  <ContainerInstrument className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Brain strokeWidth={1.5} size={18} className="text-va-black" />
                  </ContainerInstrument>
                  <TextInstrument as="span" className="text-[15px] font-black tracking-[0.2em] text-primary">
                    <VoiceglotText translationKey="auto.voicyproactiveintelligence.voicy_intelligence.7a49dd" defaultText="Voicy Intelligence" />
                  </TextInstrument>
                </ContainerInstrument>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <X strokeWidth={1.5} size={16} />
                </button>
              </ContainerInstrument>

              <HeadingInstrument level={4} className="text-[15px] font-light mb-2 leading-tight">
                {tip.title}
              </HeadingInstrument>
              
              <TextInstrument className="text-[15px] text-white/60 leading-relaxed mb-6 font-medium">
                {tip.description}
              </TextInstrument>

              <ContainerInstrument className="flex items-center gap-3">
                {tip.cta && (
                  <ButtonInstrument 
                    onClick={tip.cta.onClick}
                    className="bg-white text-va-black px-4 py-2 rounded-xl text-[15px] font-black tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-lg"
                  >
                    {tip.cta.label}
                    <ArrowRight strokeWidth={1.5} size={12} />
                  </ButtonInstrument>
                )}
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-[15px] font-black tracking-widest text-white/40 hover:text-white transition-colors px-2"
                >
                  <VoiceglotText translationKey="auto.voicyproactiveintelligence.later____.0d5296" defaultText="Later" />
                </button>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
