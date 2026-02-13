"use client";

import React, { useState } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument, 
  InputInstrument,
  LabelInstrument
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useSonicDNA } from '@/lib/sonic-dna';

/**
 * 📞 CONTACT PAGE (NUCLEAR 2026)
 * 
 * Een hybride contactpagina: Directe formulieren + Voicy integratie.
 */
export default function ContactPage() {
  const { playClick } = useSonicDNA();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    playClick('pro');

    // Simuleer verzending naar de Mailbox API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      playClick('success');
    }, 1500);
  };

  const openVoicy = () => {
    playClick('deep');
    window.dispatchEvent(new CustomEvent('voicy:suggestion', {
      detail: {
        title: 'Direct Contact',
        content: 'Hallo! Ik ben Voicy. Hoe kan ik je vandaag helpen?',
        tab: 'chat'
      }
    }));
  };

  return (
    <PageWrapperInstrument className="pt-32 pb-40 bg-va-off-white min-h-screen">
      <ContainerInstrument>
        
        {/* Header */}
        <SectionInstrument className="mb-16 text-center">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/10 mb-8">
            <Sparkles strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="contact.badge" defaultText="Altijd Bereikbaar" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="contact.title_part1" defaultText="Laten we " />
            <span className="text-primary">
              <VoiceglotText translationKey="contact.title_part2" defaultText="praten." />
            </span>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl max-w-2xl mx-auto">
            <VoiceglotText 
              translationKey="contact.subtitle" 
              defaultText="Heb je een vraag over een stem, een project of wil je gewoon even sparren? We staan voor je klaar." 
            />
          </TextInstrument>
        </SectionInstrument>

        <BentoGrid columns={3}>
          {/* 📬 CONTACT FORM */}
          <BentoCard span="lg" className="bg-white shadow-aura p-12 relative overflow-hidden">
            {isSent ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 strokeWidth={1.5} size={40} />
                </div>
                <HeadingInstrument level={2} className="text-3xl font-black tracking-tight">
                  <VoiceglotText translationKey="contact.success.title" defaultText="Bericht Ontvangen!" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 font-medium max-w-sm">
                  <VoiceglotText 
                    translationKey="contact.success.text" 
                    defaultText="Bedankt voor je bericht. We hebben het direct doorgestuurd naar ons team en reageren zo snel mogelijk." 
                  />
                </TextInstrument>
                <ButtonInstrument onClick={() => setIsSent(false)} className="va-btn-secondary">
                  <VoiceglotText translationKey="contact.success.cta" defaultText="Nog een bericht sturen" />
                </ButtonInstrument>
              </div>
            ) : (
              <>
                <HeadingInstrument level={2} className="text-2xl font-black tracking-tight mb-8">
                  <VoiceglotText translationKey="contact.form.title" defaultText="Stuur ons een bericht" />
                </HeadingInstrument>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <LabelInstrument>
                        <VoiceglotText translationKey="contact.form.name" defaultText="Naam" />
                      </LabelInstrument>
                      <InputInstrument required placeholder="Jouw naam" className="w-full" />
                    </div>
                    <div className="space-y-1">
                      <LabelInstrument>
                        <VoiceglotText translationKey="contact.form.email" defaultText="E-mail" />
                      </LabelInstrument>
                      <InputInstrument required type="email" placeholder="naam@bedrijf.be" className="w-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <LabelInstrument>
                      <VoiceglotText translationKey="contact.form.subject" defaultText="Onderwerp" />
                    </LabelInstrument>
                    <InputInstrument placeholder="Waar gaat het over?" className="w-full" />
                  </div>
                  <div className="space-y-1">
                    <LabelInstrument>
                      <VoiceglotText translationKey="contact.form.message" defaultText="Bericht" />
                    </LabelInstrument>
                    <textarea required placeholder="Hoe kunnen we je helpen?" className="bg-va-off-white border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-va-black/20 w-full min-h-[150px] resize-none" />
                  </div>
                  <ButtonInstrument type="submit" disabled={isSubmitting} className="va-btn-pro w-full flex items-center justify-center gap-3">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send strokeWidth={1.5} size={18} />}
                    <VoiceglotText translationKey="contact.form.submit" defaultText="Bericht Verzenden" />
                  </ButtonInstrument>
                </form>
              </>
            )}
          </BentoCard>

          {/* 🤖 VOICY SIDEKICK */}
          <BentoCard span="sm" className="bg-va-black text-white p-10 flex flex-col justify-between relative overflow-hidden group">
            <ContainerInstrument className="relative z-10">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-va-black mb-8 shadow-lg shadow-primary/20">
                <MessageSquare strokeWidth={1.5} size={24} />
              </div>
              <HeadingInstrument level={2} className="text-3xl font-black tracking-tighter mb-4 leading-tight">
                <VoiceglotText translationKey="contact.voicy.title" defaultText="Direct antwoord nodig?" />
              </HeadingInstrument>
              <TextInstrument className="text-white/40 text-sm font-medium leading-relaxed mb-8">
                <VoiceglotText 
                  translationKey="contact.voicy.text" 
                  defaultText="Chat direct met Voicy, onze AI-assistent. Ze kan je helpen met tarieven, stemkeuze en technische vragen." 
                />
              </TextInstrument>
            </ContainerInstrument>
            <ButtonInstrument 
              onClick={openVoicy}
              className="relative z-10 va-btn-pro !bg-primary !text-va-black w-full"
            >
              <VoiceglotText translationKey="contact.voicy.cta" defaultText="Start Chat" /> <Sparkles strokeWidth={1.5} size={14} />
            </ButtonInstrument>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
          </BentoCard>

          {/* 📍 INFO CARDS */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white/50 backdrop-blur-md p-8 rounded-[32px] border border-black/5 flex items-center gap-6">
              <div className="w-12 h-12 bg-va-black rounded-2xl flex items-center justify-center text-white shrink-0">
                <Phone strokeWidth={1.5} size={20} />
              </div>
              <div>
                <TextInstrument className="va-text-[15px] text-va-black/30 mb-1 font-light">
                  <VoiceglotText translationKey="contact.info.phone_label" defaultText="Bel ons" />
                </TextInstrument>
                <TextInstrument className="text-lg font-black">+32 (0)2 793 19 91</TextInstrument>
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-md p-8 rounded-[32px] border border-black/5 flex items-center gap-6">
              <div className="w-12 h-12 bg-va-black rounded-2xl flex items-center justify-center text-white shrink-0">
                <Mail strokeWidth={1.5} size={20} />
              </div>
              <div>
                <TextInstrument className="va-text-[15px] text-va-black/30 mb-1 font-light">
                  <VoiceglotText translationKey="contact.info.email_label" defaultText="E-mail ons" />
                </TextInstrument>
                <TextInstrument className="text-lg font-black">hello@voices.be</TextInstrument>
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-md p-8 rounded-[32px] border border-black/5 flex items-center gap-6">
              <div className="w-12 h-12 bg-va-black rounded-2xl flex items-center justify-center text-white shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <TextInstrument className="va-text-[15px] text-va-black/30 mb-1 font-light">
                  <VoiceglotText translationKey="contact.info.address_label" defaultText="Bezoek ons" />
                </TextInstrument>
                <TextInstrument className="text-lg font-black">
                  <VoiceglotText translationKey="contact.info.address_value" defaultText="Gent, België" />
                </TextInstrument>
              </div>
            </div>
          </div>
        </BentoGrid>

        {/* 🧠 LLM CONTEXT (Compliance) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ContactPage",
              "name": "Contact Voices",
              "description": "Neem contact op met het team van Voices.be voor al je vragen over stemmen en audio-productie.",
              "_llm_context": {
                "persona": "Gids",
                "journey": "common",
                "intent": "contact_support",
                "capabilities": ["send_message", "start_chat", "view_info"],
                "lexicon": ["Contact", "Bericht", "Hulp"],
                "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
              }
            })
          }}
        />
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
