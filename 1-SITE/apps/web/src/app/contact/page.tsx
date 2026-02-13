"use client";

import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    InputInstrument,
    LabelInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { LiquidBackground } from '@/components/ui/LiquidBackground';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import { AlertCircle, CheckCircle2, Loader2, Mail, MapPin, MessageSquare, Phone, Send, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

/**
 * 📞 CONTACT PAGE (NUCLEAR 2026)
 *
 * Een hybride contactpagina: Directe formulieren + Voicy integratie.
 * Chatty mandate: Form integrity, Safe Harbor errors, VoiceglotText.
 */
export default function ContactPage() {
  const { playClick } = useSonicDNA();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    playClick('pro');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'De verzending is mislukt. Probeer het later opnieuw.');
      }
      setIsSent(true);
      playClick('success');
    } catch (err) {
      playClick('error');
      setSubmitError(err instanceof Error ? err.message : 'De verzending is mislukt. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
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
    <PageWrapperInstrument className="pt-32 pb-40 bg-va-off-white min-h-screen relative overflow-hidden">
      <LiquidBackground strokeWidth={1.5} />
      <ContainerInstrument className="relative z-10">
        
        {/* Header */}
        <SectionInstrument className="mb-16 text-center">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[15px] font-light tracking-widest border border-black/5 mb-8 ">
            <Sparkles strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText  translationKey="contact.badge" defaultText="Altijd Bereikbaar" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-none mb-6">
            <VoiceglotText  translationKey="contact.title_part1" defaultText="Laten we " />
            <TextInstrument as="span" className="text-primary font-light">
              <VoiceglotText  translationKey="contact.title_part2" defaultText="praten." />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light text-[15px] md:text-xl max-w-2xl mx-auto"><VoiceglotText  
              translationKey="contact.subtitle" 
              defaultText="Heb je een vraag over een stem, een project of wil je gewoon even sparren? We staan voor je klaar." 
            /></TextInstrument>
        </SectionInstrument>

        <BentoGrid strokeWidth={1.5} columns={3}>
          {/* 📬 CONTACT FORM */}
          <BentoCard span="lg" className="bg-white shadow-aura p-12 relative overflow-hidden">
            {isSent ? (
              <ContainerInstrument className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <ContainerInstrument className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 strokeWidth={1.5} size={40} />
                </ContainerInstrument>
                <HeadingInstrument level={2} className="text-3xl font-light tracking-tight">
                  <VoiceglotText  translationKey="contact.success.title" defaultText="Bericht ontvangen" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 font-light text-[15px] max-w-sm leading-relaxed">
                  <VoiceglotText 
                    translationKey="contact.success.text"
                    defaultText="Bedankt voor je bericht. We hebben het direct doorgestuurd naar ons team en reageren zo snel mogelijk."
                  />
                </TextInstrument>
                <ButtonInstrument onClick={() => setIsSent(false)} className="va-btn-secondary">
                  <VoiceglotText  translationKey="contact.success.cta" defaultText="Nog een bericht sturen" />
                </ButtonInstrument>
              </ContainerInstrument>
            ) : (
              <>
                <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-8">
                  <VoiceglotText  translationKey="contact.form.title" defaultText="Stuur ons een bericht" />
                </HeadingInstrument>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && (
                    <ContainerInstrument
                      className="flex items-start gap-3 p-4 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-600"
                      role="alert"
                    >
                      <AlertCircle strokeWidth={1.5} size={20} className="shrink-0 mt-0.5" />
                      <TextInstrument className="text-[15px] font-light leading-relaxed">
                        {submitError}
                      </TextInstrument>
                      <ButtonInstrument
                        type="button"
                        onClick={() => setSubmitError(null)}
                        className="ml-auto shrink-0 text-[15px] font-light underline hover:no-underline"
                      >
                        <VoiceglotText  translationKey="contact.error.dismiss" defaultText="Sluiten" />
                      </ButtonInstrument>
                    </ContainerInstrument>
                  )}
                  <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContainerInstrument className="space-y-1">
                      <LabelInstrument>
                        <VoiceglotText  translationKey="contact.form.name" defaultText="Naam" />
                      </LabelInstrument>
                      <InputInstrument
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Jouw naam"
                        className="w-full text-[15px] font-light"
                      />
                    </ContainerInstrument>
                    <ContainerInstrument className="space-y-1">
                      <LabelInstrument>
                        <VoiceglotText  translationKey="contact.form.email" defaultText="E-mail" />
                      </LabelInstrument>
                      <InputInstrument
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="naam@bedrijf.be"
                        className="w-full text-[15px] font-light"
                      />
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="space-y-1">
                    <LabelInstrument>
                      <VoiceglotText  translationKey="contact.form.subject" defaultText="Onderwerp" />
                    </LabelInstrument>
                    <InputInstrument
                      value={formData.subject}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Waar gaat het over?"
                      className="w-full text-[15px] font-light"
                    />
                  </ContainerInstrument>
                  <ContainerInstrument className="space-y-1">
                    <LabelInstrument>
                      <VoiceglotText  translationKey="contact.form.message" defaultText="Bericht" />
                    </LabelInstrument>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Hoe kunnen we je helpen?"
                      className="bg-va-off-white border-none rounded-[10px] px-6 py-4 text-[15px] font-light focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-va-black/20 w-full min-h-[150px] resize-none"
                    />
                  </ContainerInstrument>
                  <ButtonInstrument type="submit" disabled={isSubmitting} className="va-btn-pro w-full flex items-center justify-center gap-3">
                    {isSubmitting ? <Loader2 strokeWidth={1.5} className="animate-spin" size={18} /> : <Send strokeWidth={1.5} size={18} />}
                    <VoiceglotText  translationKey="contact.form.submit" defaultText="Bericht verzenden" />
                  </ButtonInstrument>
                </form>
              </>
            )}
          </BentoCard>

          {/* 🤖 VOICY SIDEKICK */}
          <BentoCard span="sm" className="bg-va-black text-white p-10 flex flex-col justify-between relative overflow-hidden group rounded-[20px]">
            <ContainerInstrument className="relative z-10">
              <ContainerInstrument className="w-12 h-12 bg-primary rounded-[10px] flex items-center justify-center text-va-black mb-8 shadow-lg shadow-primary/20">
                <MessageSquare strokeWidth={1.5} size={24} />
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter mb-4 leading-tight">
                <VoiceglotText  translationKey="contact.voicy.title" defaultText="Direct antwoord nodig?" />
              </HeadingInstrument>
              <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed mb-8 block">
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
              <VoiceglotText  translationKey="contact.voicy.cta" defaultText="Start Chat" />
            </ButtonInstrument>
            <ContainerInstrument className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" aria-hidden="true" />
          </BentoCard>

          {/* 📍 INFO CARDS */}
          <ContainerInstrument className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <ContainerInstrument className="bg-white/50 backdrop-blur-md p-8 rounded-[20px] border border-black/5 flex items-center gap-6">
              <ContainerInstrument className="w-12 h-12 bg-va-black rounded-[10px] flex items-center justify-center text-white shrink-0">
                <Phone strokeWidth={1.5} size={20} />
              </ContainerInstrument>
              <ContainerInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-va-black/30 mb-1 font-light "><VoiceglotText  translationKey="contact.info.phone_label" defaultText="Bel ons" /></TextInstrument>
                <TextInstrument className="text-lg font-light">+32 (0)2 793 19 91</TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="bg-white/50 backdrop-blur-md p-8 rounded-[20px] border border-black/5 flex items-center gap-6">
              <ContainerInstrument className="w-12 h-12 bg-va-black rounded-[10px] flex items-center justify-center text-white shrink-0">
                <Mail strokeWidth={1.5} size={20} />
              </ContainerInstrument>
              <ContainerInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-va-black/30 mb-1 font-light "><VoiceglotText  translationKey="contact.info.email_label" defaultText="E-mail ons" /></TextInstrument>
                <TextInstrument className="text-lg font-light"><VoiceglotText  translationKey="auto.page.hello_voices_be.b689c1" defaultText="hello@voices.be" /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="bg-white/50 backdrop-blur-md p-8 rounded-[20px] border border-black/5 flex items-center gap-6">
              <ContainerInstrument className="w-12 h-12 bg-va-black rounded-[10px] flex items-center justify-center text-white shrink-0">
                <MapPin strokeWidth={1.5} size={20} />
              </ContainerInstrument>
              <ContainerInstrument>
                <TextInstrument className="text-[15px] tracking-widest text-va-black/30 mb-1 font-light "><VoiceglotText  translationKey="contact.info.address_label" defaultText="Bezoek ons" /></TextInstrument>
                <TextInstrument className="text-lg font-light"><VoiceglotText  translationKey="contact.info.address_value" defaultText="Gent, België" /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
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
