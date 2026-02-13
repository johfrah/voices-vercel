"use client";

import React, { useState } from 'react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument,
  FormInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { PricingTooltipInstrument } from '@/components/ui/PricingTooltipInstrument';
import { useSonicDNA } from '@/lib/sonic-dna';
import { User, Mail, Phone, Briefcase, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BentoCard } from '@/components/ui/BentoGrid';

/**
 * ⚡ ZERO-LOSS CHECKOUT INSTRUMENT
 * 
 * Een frictieloze, intelligente checkout flow.
 * ToV: Vriendelijke Autoriteit.
 */
export const ZeroLossCheckoutInstrument = ({ 
  item,
  onComplete 
}: { 
  item: { name: string; price: number; date?: string };
  onComplete: (data: any) => void;
}) => {
  const { playClick } = useSonicDNA();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    vatNumber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    playClick('pro');
    setStep(prev => prev + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick('success');
    onComplete(formData);
  };

  const vatAmount = item.price * 0.21;
  const totalAmount = item.price + vatAmount;

  return (
    <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
      {/* Left: Form Steps */}
      <ContainerInstrument className="lg:col-span-2 space-y-6 md:space-y-8">
        <BentoCard span="full" className="bg-white p-6 md:p-12 shadow-aura border-black/5 overflow-visible">
          <ContainerInstrument className="flex items-center gap-4 mb-8 md:mb-12">
            <ContainerInstrument className="w-10 h-10 rounded-full bg-va-black text-white flex items-center justify-center font-light shadow-lg">
              {step}
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light tracking-tight">
              {step === 1 ? (
                <VoiceglotText  translationKey="checkout.step1.title" defaultText="Wie ben je?" />
              ) : (
                <VoiceglotText  translationKey="checkout.step2.title" defaultText="Bedrijfsgegevens" />
              )}
            </HeadingInstrument>
          </ContainerInstrument>

          <FormInstrument onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {step === 1 && (
              <ContainerInstrument className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <ContainerInstrument className="space-y-2">
                    <TextInstrument as="label" className="text-[15px] font-medium tracking-widest text-va-black/30 ml-4"><VoiceglotText  translationKey="auto.zerolosscheckoutinstrument.voornaam.75a044" defaultText="Voornaam" /></TextInstrument>
                    <ContainerInstrument className="relative">
                      <User strokeWidth={1.5} className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
                      <InputInstrument 
                        value={formData.firstName}
                        onChange={(e) => { handleInputChange('firstName', e.target.value); }}
                        className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-va-off-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[15px]" 
                        placeholder="Julie" 
                      />
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="space-y-2">
                    <TextInstrument as="label" className="text-[15px] font-medium tracking-widest text-va-black/30 ml-4"><VoiceglotText  translationKey="auto.zerolosscheckoutinstrument.familienaam.b88d3a" defaultText="Familienaam" /></TextInstrument>
                    <InputInstrument 
                      value={formData.lastName}
                      onChange={(e) => { handleInputChange('lastName', e.target.value); }}
                      className="w-full px-6 py-5 rounded-[24px] bg-va-off-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[15px]" 
                      placeholder="Vandamme" 
                    />
                  </ContainerInstrument>
                </ContainerInstrument>

                <ContainerInstrument className="space-y-2">
                  <TextInstrument as="label" className="text-[15px] font-medium tracking-widest text-va-black/30 ml-4"><VoiceglotText  translationKey="auto.zerolosscheckoutinstrument.e_mailadres.e1486d" defaultText="E-mailadres" /></TextInstrument>
                  <ContainerInstrument className="relative">
                    <Mail strokeWidth={1.5} className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
                    <InputInstrument 
                      type="email"
                      value={formData.email}
                      onChange={(e) => { handleInputChange('email', e.target.value); }}
                      className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-va-off-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                      placeholder="julie@voorbeeld.com" 
                    />
                  </ContainerInstrument>
                </ContainerInstrument>

                <ButtonInstrument 
                  onClick={() => { nextStep(); }}
                  disabled={!formData.email || !formData.firstName}
                  className="w-full py-6 rounded-[24px] bg-va-black text-white text-[15px] font-light tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 group disabled:opacity-20"
                >
                  Volgende stap <ArrowRight strokeWidth={1.5} size={16} className="group-hover:translate-x-1 transition-transform" />
                </ButtonInstrument>
              </ContainerInstrument>
            )}

            {step === 2 && (
              <ContainerInstrument className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ContainerInstrument className="space-y-2">
                  <TextInstrument as="label" className="text-[15px] font-medium tracking-widest text-va-black/30 ml-4"><VoiceglotText  translationKey="auto.zerolosscheckoutinstrument.bedrijfsnaam__option.c7b4ee" defaultText="Bedrijfsnaam (Optioneel)" /></TextInstrument>
                  <ContainerInstrument className="relative">
                    <Briefcase strokeWidth={1.5} className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
                    <InputInstrument 
                      value={formData.company}
                      onChange={(e) => { handleInputChange('company', e.target.value); }}
                      className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-va-off-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                      placeholder="Mijn Bedrijf BV" 
                    />
                  </ContainerInstrument>
                </ContainerInstrument>

                <ContainerInstrument className="space-y-2">
                  <TextInstrument as="label" className="text-[15px] font-medium tracking-widest text-va-black/30 ml-4"><VoiceglotText  translationKey="auto.zerolosscheckoutinstrument.btw_nummer__optionee.249341" defaultText="BTW-Nummer (Optioneel)" /></TextInstrument>
                  <ContainerInstrument className="relative">
                    <ShieldCheck strokeWidth={1.5} className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
                    <InputInstrument 
                      value={formData.vatNumber}
                      onChange={(e) => { handleInputChange('vatNumber', e.target.value); }}
                      className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-va-off-white border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                      placeholder="BE 0123.456.789" 
                    />
                  </ContainerInstrument>
                  <TextInstrument className="text-[15px] font-medium text-va-black/20 ml-4 tracking-widest"><VoiceglotText  translationKey="auto.zerolosscheckoutinstrument.we_valideren_dit_dir.fd2fff" defaultText="We valideren dit direct voor een factuur zonder BTW (indien van toepassing)." /></TextInstrument>
                </ContainerInstrument>

                <ContainerInstrument className="flex gap-4">
                  <ButtonInstrument 
                    onClick={() => { setStep(1); }}
                    className="flex-1 py-6 rounded-[24px] bg-va-off-white text-va-black/40 text-[15px] font-light tracking-widest hover:bg-va-black hover:text-white transition-all"
                  >
                    <VoiceglotText  translationKey="auto.zerolosscheckoutinstrument.terug____.211082" defaultText="Terug" />
                  </ButtonInstrument>
                  <ButtonInstrument 
                    type="submit"
                    className="flex-[2] py-6 rounded-[24px] bg-primary text-white text-[15px] font-light tracking-widest hover:bg-va-black transition-all flex items-center justify-center gap-2 group"
                  >
                    Betaling afronden <ArrowRight strokeWidth={1.5} size={16} className="group-hover:translate-x-1 transition-transform" />
                  </ButtonInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            )}
          </FormInstrument>
        </BentoCard>
      </ContainerInstrument>

      {/* Right: Summary Card */}
      <ContainerInstrument className="space-y-6 md:space-y-8 sticky top-32">
        <BentoCard span="sm" className="bg-va-black text-white p-6 md:p-10 shadow-aura-lg">
          <HeadingInstrument level={4} className="text-[15px] font-medium tracking-widest text-white/20 mb-6 md:mb-8"><VoiceglotText  translationKey="auto.zerolosscheckoutinstrument.jouw_investering.810725" defaultText="Jouw Investering" /></HeadingInstrument>
          
          <ContainerInstrument className="space-y-6">
            <ContainerInstrument className="pb-6 border-b border-white/5">
              <TextInstrument className="text-xl font-light tracking-tight leading-tight mb-2">
                {item.name}
              </TextInstrument>
              {item.date && (
                <TextInstrument className="text-[15px] font-light text-primary tracking-widest">
                  {item.date}
                </TextInstrument>
              )}
            </ContainerInstrument>

            <ContainerInstrument className="space-y-3">
              <ContainerInstrument className="flex justify-between items-center text-[15px] font-light">
                <TextInstrument as="span" className="text-white/40 flex items-center font-light">
                  Basisbedrag
                  <PricingTooltipInstrument pricingKey="checkout_base" isUnpaid={true} />
                </TextInstrument>
                <TextInstrument as="span">€ {item.price.toFixed(2)}</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex justify-between items-center text-[15px] font-light">
                <TextInstrument as="span" className="text-white/40 font-light">BTW (21%)</TextInstrument>
                <TextInstrument as="span">€ {vatAmount.toFixed(2)}</TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="pt-6 border-t border-white/10 flex justify-between items-end">
              <TextInstrument as="span" className="text-[15px] font-light tracking-widest text-white/20"><VoiceglotText  translationKey="auto.zerolosscheckoutinstrument.totaal.e28895" defaultText="Totaal" /></TextInstrument>
              <TextInstrument as="span" className="text-4xl font-light tracking-tighter text-primary">
                € {totalAmount.toFixed(2)}
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        <ContainerInstrument className="px-4 space-y-4">
          {[
            "Directe bevestiging via e-mail",
            "Factuur Peppol-ready (Yuki)",
            "Beveiligde betaling via Mollie"
          ].map((usp, i) => (
            <ContainerInstrument key={i} className="flex items-center gap-3 text-[15px] font-light tracking-tight text-va-black/30">
              <CheckCircle2 strokeWidth={1.5} size={14} className="text-primary" />
              {usp}
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
