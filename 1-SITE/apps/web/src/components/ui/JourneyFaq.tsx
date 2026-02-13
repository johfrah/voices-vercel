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
    <section className="py-12 border-t border-black/5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full bg-va-black text-white flex items-center justify-center">
          <HelpCircle strokeWidth={1.5} size={16} />
        </div>
        <h3 className="text-[15px] font-light tracking-widest text-va-black "><VoiceglotText translationKey="auto.journeyfaq.veelgestelde_vragen.95b893" defaultText="Veelgestelde vragen" /></h3>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div 
            key={faq.id} 
            className={cn(
              "rounded-[20px] border transition-all duration-300 overflow-hidden",
              openId === faq.id ? "bg-white border-primary/20 shadow-aura" : "bg-white/50 border-black/5 hover:border-black/10"
            )}
          >
            <button
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="w-full p-5 flex items-center justify-between text-left outline-none"
            >
              <span className="text-[15px] font-light text-va-black pr-8">{faq.questionNl}</span>
              {openId === faq.id ? <ChevronUp size={16} className="text-primary shrink-0" /> : <ChevronDown strokeWidth={1.5} size={16} className="text-va-black/20 shrink-0" />}
            </button>
            
            {openId === faq.id && (
              <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[15px] text-va-black/40 font-light leading-relaxed whitespace-pre-wrap">
                  {faq.answerNl}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
