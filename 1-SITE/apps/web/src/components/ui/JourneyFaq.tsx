"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface FAQ {
  id: number;
  questionNl: string;
  answerNl: string;
}

interface JourneyFaqProps {
  journey: string;
  limit?: number;
}

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  SectionInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

interface FAQ {
  id: number;
  questionNl: string;
  answerNl: string;
}

interface JourneyFaqProps {
  journey: string;
  limit?: number;
}

export const JourneyFaq: React.FC<JourneyFaqProps> = ({ journey, limit = 3 }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        // In a real app, this would be an API call to /api/faq?journey=...
        // For now, we simulate the fetch with the data we just inserted
        const response = await fetch(`/api/faq?journey=${journey}&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setFaqs(data);
        }
      } catch (e) {
        console.error("Failed to fetch FAQs", e);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [journey, limit]);

  if (loading || faqs.length === 0) return null;

  return (
    <SectionInstrument className="py-8 md:py-12 border-t border-black/5">
      <ContainerInstrument className="flex items-center gap-3 mb-6 md:mb-8">
        <ContainerInstrument className="w-8 h-8 rounded-full bg-va-black text-white flex items-center justify-center shrink-0">
          <HelpCircle strokeWidth={1.5} size={16} />
        </ContainerInstrument>
        <HeadingInstrument level={3} className="text-[15px] md:text-[15px] font-light tracking-widest text-va-black "><VoiceglotText  translationKey="auto.journeyfaq.veelgestelde_vragen.95b893" defaultText="Veelgestelde vragen" /></HeadingInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="space-y-2 md:space-y-3">
        {faqs.map((faq) => (
          <ContainerInstrument 
            key={faq.id} 
            className={cn(
              "rounded-[15px] md:rounded-[20px] border transition-all duration-300 overflow-hidden",
              openId === faq.id ? "bg-white border-primary/20 shadow-aura" : "bg-white/50 border-black/5 hover:border-black/10"
            )}
          >
            <ButtonInstrument
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="w-full p-4 md:p-5 flex items-center justify-between text-left outline-none bg-transparent"
            >
              <TextInstrument as="span" className="text-[15px] md:text-[15px] font-light text-va-black pr-6 md:pr-8">{faq.questionNl}</TextInstrument>
              {openId === faq.id ? <ChevronUp strokeWidth={1.5} size={16} className="text-primary shrink-0" /> : <ChevronDown strokeWidth={1.5} size={16} className="text-va-black/20 shrink-0" />}
            </ButtonInstrument>
            
            {openId === faq.id && (
              <ContainerInstrument className="px-4 md:px-5 pb-4 md:pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <TextInstrument className="text-[15px] md:text-[15px] text-va-black/40 font-light leading-relaxed whitespace-pre-wrap">
                  {faq.answerNl}
                </TextInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        ))}
      </ContainerInstrument>
    </SectionInstrument>
  );
};
