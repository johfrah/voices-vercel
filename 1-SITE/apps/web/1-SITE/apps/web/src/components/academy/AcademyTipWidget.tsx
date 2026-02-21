"use client";

import { ContainerInstrument, HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowRight, Car, Coffee, Lightbulb, Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Tip {
  id: number;
  title: string;
  content: string;
  category: 'morning' | 'commute' | 'practice' | 'mindset';
}

export const AcademyTipWidget: React.FC<{ userId: number }> = ({ userId }) => {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In een echte omgeving halen we dit op via de AcademyTipsService
    const fetchTip = async () => {
      try {
        const res = await fetch(`/api/academy/tips?userId=${userId}`);
        const data = await res.json();
        setTip(data);
      } catch (e) {
        // Fallback voor demo
        setTip({
          id: 1,
          title: 'De Bedoeling',
          content: 'Vraag je bij elke tekst die je ziet (ook reclameborden) af: wat was de bedoeling van de schrijver?',
          category: 'mindset'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, [userId]);

  if (loading || !tip) return null;

  const getIcon = () => {
    switch (tip.category) {
      case 'morning': return <Coffee strokeWidth={1.5} size={20} />;
      case 'commute': return <Car strokeWidth={1.5} size={20} />;
      case 'practice': return <Target strokeWidth={1.5} size={20} />;
      default: return <Lightbulb strokeWidth={1.5} size={20} />;
    }
  };

  const getCategoryLabel = () => {
    switch (tip.category) {
      case 'morning': return 'Ochtendritueel';
      case 'commute': return 'Voor onderweg';
      case 'practice': return 'Oefening';
      default: return 'Mindset';
    }
  };

  return (
    <ContainerInstrument className="bg-white rounded-[40px] p-8 border border-black/5 shadow-aura group hover:border-primary/20 transition-all duration-500">
      <ContainerInstrument className="flex items-center justify-between mb-6">
        <ContainerInstrument className="flex items-center gap-3">
          <ContainerInstrument className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            {getIcon()}
          </ContainerInstrument>
          <ContainerInstrument>
            <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/30"><VoiceglotText  translationKey={`academy.tips.cat.${tip.category}`} defaultText={getCategoryLabel()} /></TextInstrument>
            <HeadingInstrument level={4} className="text-xl font-light tracking-tighter leading-none"><VoiceglotText  translationKey={`academy.tips.title.${tip.id}`} defaultText={tip.title} /></HeadingInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <TextInstrument className="text-[15px] text-va-black/60 font-medium leading-relaxed mb-6"><VoiceglotText  translationKey={`academy.tips.content.${tip.id}`} defaultText={tip.content} /></TextInstrument>

      <ContainerInstrument className="flex items-center gap-2 text-[15px] font-black tracking-widest text-primary group-hover:gap-4 transition-all">
        <VoiceglotText  translationKey="academy.tips.next" defaultText="Volgende tip" />
        <ArrowRight strokeWidth={1.5} size={12} />
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
