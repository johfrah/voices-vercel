"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import React from 'react';
import { TelephonySmartSuggestions } from './TelephonySmartSuggestions';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument,
  LabelInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '../ui/VoiceglotText';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const BriefingStep: React.FC = () => {
  const { state, updateBriefing, updatePronunciation, updateUsage, setStep } = useCheckout();
  const { playClick } = useSonicDNA();

  const handleNext = () => {
    if (!state.briefing.trim()) {
      alert('Vul a.u.b. je script in.');
      return;
    }
    playClick('deep');
    setStep('voice');
  };

  return (
    <ContainerInstrument className={cn(
      "grid grid-cols-1 gap-10",
      state.usage === 'telefonie' ? 'lg:grid-cols-3' : ''
    )}>
      <ContainerInstrument className={cn(
        "space-y-10",
        state.usage === 'telefonie' ? 'lg:col-span-2' : ''
      )}>
        <ContainerInstrument className="space-y-6">
          <LabelInstrument className="block text-[15px] font-light tracking-widest text-va-black/30 ">
            <VoiceglotText translationKey="checkout.briefing.step1" defaultText="1. Wat is het script?" />
          </LabelInstrument>
          <textarea
            value={state.briefing}
            onChange={(e) => updateBriefing(e.target.value)}
            placeholder="Plak hier je tekst..."
            className="w-full h-64 bg-va-off-white border-none rounded-[20px] p-8 text-lg font-light focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
          <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/20 ">
            <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={14} height={14} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.2 }} / />
            {state.usage === 'telefonie' ? (
              <TextInstrument>
                <VoiceglotText 
                  translationKey="checkout.briefing.prompts_detected" 
                  defaultText={`${state.briefing.trim().split(/\n+/).filter(Boolean).length} prompts gedetecteerd`} 
                />
              </TextInstrument>
            ) : (
              <TextInstrument>
                <VoiceglotText 
                  translationKey="checkout.briefing.words_detected" 
                  defaultText={`${state.briefing.trim().split(/\s+/).filter(Boolean).length} woorden gedetecteerd`} 
                />
              </TextInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="space-y-6">
          <LabelInstrument className="block text-[15px] font-light tracking-widest text-va-black/30 ">
            <VoiceglotText translationKey="checkout.briefing.step2" defaultText="2. Uitspraak instructies (optioneel)" />
          </LabelInstrument>
          <input
            type="text"
            value={state.pronunciation}
            onChange={(e) => updatePronunciation(e.target.value)}
            placeholder="Bijv. namen, technische termen, tone-of-voice..."
            className="w-full bg-va-off-white border-none rounded-[10px] py-5 px-8 text-[15px] font-light focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </ContainerInstrument>

        <ContainerInstrument className="space-y-6">
          <LabelInstrument className="block text-[15px] font-light tracking-widest text-va-black/30 ">
            <VoiceglotText translationKey="checkout.briefing.step3" defaultText="3. Hoe wordt de opname gebruikt?" />
          </LabelInstrument>
          <ContainerInstrument className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'telefonie', label: 'Telefoon / IVR', key: 'usage.telephony' },
              { id: 'unpaid', label: 'Video (Non-Paid)', key: 'usage.unpaid' },
              { id: 'paid', label: 'Advertentie (Paid)', key: 'usage.paid' },
            ].map((type) => (
              <ButtonInstrument
                key={type.id}
                onClick={() => updateUsage(type.id as any)}
                className={cn(
                  "py-5 px-6 rounded-[10px] border-2 font-light tracking-widest text-[15px] transition-all",
                  state.usage === type.id 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-va-black/5 hover:border-va-black/10 text-va-black/40'
                )}
              >
                <VoiceglotText translationKey={type.key} defaultText={type.label} />
              </ButtonInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>

        <ButtonInstrument 
          onClick={handleNext} 
          className="va-btn-pro w-full py-6 !rounded-[10px]"
        >
          <VoiceglotText translationKey="checkout.briefing.next" defaultText="Volgende: Stem Kiezen" />
        </ButtonInstrument>
      </ContainerInstrument>

      {state.usage === 'telefonie' && (
        <ContainerInstrument className="lg:col-span-1">
          <TelephonySmartSuggestions />
        </ContainerInstrument>
      )}
    </ContainerInstrument>
  );
};
