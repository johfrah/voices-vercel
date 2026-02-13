"use client";

import React, { useState } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument, 
  InputInstrument 
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { HelpCircle, Search, MessageSquare, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useSonicDNA } from '@/lib/sonic-dna';

/**
 * ❓ FAQ PAGE (NUCLEAR 2026)
 */
export default function FaqPage() {
  const { playClick } = useSonicDNA();
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Wat zijn de tarieven voor een voice-over?",
      a: "Onze tarieven variëren op basis van het gebruik (bijv. online, radio, TV) en het aantal woorden. Een standaard 'Unpaid' opname begint vaak rond de €150. Gebruik onze prijscalculator voor een exacte berekening.",
      key: "faq.q1"
    },
    {
      q: "Hoe snel wordt mijn bestelling geleverd?",
      a: "De meeste stemacteurs leveren binnen 24 tot 48 uur. De exacte levertijd staat altijd vermeld op de profielpagina van de acteur en in je winkelmandje.",
      key: "faq.q2"
    },
    {
      q: "Kan ik een gratis proefopname krijgen?",
      a: "Ja, voor veel projecten bieden we een 'Gratis Proevertje' aan. Dit is een korte opname van je script zodat je de stem kunt beoordelen voordat je definitief boekt.",
      key: "faq.q3"
    },
    {
      q: "In welke formaten wordt de audio opgeleverd?",
      a: "Standaard leveren we hoogwaardige WAV-bestanden (48kHz, 24-bit). Indien gewenst kunnen we ook andere formaten zoals MP3 of specifieke telefonie-formaten (8kHz) aanleveren.",
      key: "faq.q4"
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(search.toLowerCase()) || 
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    playClick('soft');
    setOpenIndex(openIndex === index ? null : index);
  };

  const openVoicy = () => {
    playClick('deep');
    window.dispatchEvent(new CustomEvent('voicy:suggestion', {
      detail: {
        title: 'Hulp nodig?',
        content: 'Ik kan je helpen met al je vragen over stemmen en techniek.',
        tab: 'chat'
      }
    }));
  };

  return (
    <PageWrapperInstrument className="pt-32 pb-40 px-6 md:px-12 bg-va-off-white min-h-screen">
      <ContainerInstrument className="max-w-5xl mx-auto">
        
        {/* Header */}
        <SectionInstrument className="mb-16 text-center">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/10 mb-8">
            <HelpCircle size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="faq.badge" defaultText="Kennisbank" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="faq.title" defaultText="Hoe kunnen we helpen?" />
          </HeadingInstrument>
          
          <ContainerInstrument className="relative max-w-xl mx-auto mt-12">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20" size={20} />
          <InputInstrument 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek in de veelgestelde vragen..." 
            className="w-full !rounded-full !py-6 !pl-16 !pr-8 !text-lg shadow-aura"
          />
        </ContainerInstrument>
      </SectionInstrument>

        <div className="space-y-4">
          {filteredFaqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-[32px] overflow-hidden border border-black/5 shadow-sm transition-all hover:shadow-md">
              <button 
                onClick={() => toggleFaq(i)}
                className="w-full px-10 py-8 flex items-center justify-between text-left group"
              >
                <HeadingInstrument level={3} className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">
                  <VoiceglotText translationKey={faq.key} defaultText={faq.q} />
                </HeadingInstrument>
                {openIndex === i ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-va-black/20" />}
              </button>
              {openIndex === i && (
                <div className="px-10 pb-10 animate-in slide-in-from-top-4 duration-300">
                  <TextInstrument className="text-va-black/60 text-lg leading-relaxed font-medium">
                    <VoiceglotText translationKey={`${faq.key}.a`} defaultText={faq.a} />
                  </TextInstrument>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Voicy CTA */}
        <ContainerInstrument className="mt-20 bg-va-black text-white rounded-[40px] p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 group">
          <div className="relative z-10 space-y-4 max-w-xl">
            <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter leading-tight">
              <VoiceglotText translationKey="faq.voicy.title" defaultText="Niet gevonden wat je zocht?" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 text-lg font-medium">
              <VoiceglotText 
                translationKey="faq.voicy.text" 
                defaultText="Voicy, onze AI-assistent, kent alle details van ons platform en kan je direct antwoord geven." 
              />
            </TextInstrument>
          </div>
          <ButtonInstrument 
            onClick={openVoicy}
            className="relative z-10 va-btn-pro !bg-primary !text-va-black !px-12 !py-6 !text-lg"
          >
            <VoiceglotText translationKey="faq.voicy.cta" defaultText="Vraag het aan Voicy" /> <Sparkles size={20} />
          </ButtonInstrument>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        </ContainerInstrument>

        {/* 🧠 LLM CONTEXT (Compliance) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": f.a
                }
              })),
              "_llm_context": {
                "persona": "Gids",
                "journey": "common",
                "intent": "find_information",
                "capabilities": ["search_faq", "start_chat"],
                "lexicon": ["Vraag", "Antwoord", "Kennisbank"],
                "visual_dna": ["Accordion", "Bento Grid", "Liquid DNA"]
              }
            })
          }}
        />
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
