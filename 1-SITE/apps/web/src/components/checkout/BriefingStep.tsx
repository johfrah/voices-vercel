"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import React, { useState } from 'react';
import { TelephonySmartSuggestions } from './TelephonySmartSuggestions';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument,
  LabelInstrument,
  HeadingInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '../ui/VoiceglotText';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Zap, Play, Pause, Loader2 } from 'lucide-react';

export const BriefingStep: React.FC = () => {
  const { state, updateBriefing, updatePronunciation, updateUsage, setStep } = useCheckout();
  const { playClick } = useSonicDNA();
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [aiDraftUrl, setAiDraftUrl] = useState<string | null>(null);
  const [isPlayingDraft, setIsPlayingDraft] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleNext = () => {
    if (!state.briefing.trim()) {
      alert(t('checkout.briefing.alert_empty', 'Vul a.u.b. je tekst in.'));
      return;
    }
    playClick('deep');
    setStep('voice');
  };

  const generateAiDraft = async () => {
    if (!state.briefing.trim()) return;
    setIsGeneratingAiDraft(true);
    playClick('pro');

    try {
      //  JOHFRAI-MANDATE: Generate AI Draft for timing verification
      const res = await fetch('/api/tts/johfrai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: state.briefing,
          actorId: state.selectedActor?.id,
          mode: 'draft'
        })
      });
      const data = await res.json();
      if (data.url) setAiDraftUrl(data.url);
    } catch (err) {
      console.error('Failed to generate AI draft:', err);
    } finally {
      setIsGeneratingAiDraft(false);
    }
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
            <VoiceglotText  translationKey="checkout.briefing.step1" defaultText="1. Wat is de tekst?" />
          </LabelInstrument>
          <textarea
            value={state.briefing}
            onChange={(e) => updateBriefing(e.target.value)}
            placeholder={t('checkout.briefing.placeholder', "Plak hier je tekst...")}
            className="w-full h-64 bg-va-off-white border-none rounded-[20px] p-8 text-lg font-light focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
          
          {/*  JOHFRAI DRAFTING TOOL */}
          <ContainerInstrument className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-va-off-white/50 p-6 rounded-[20px] border border-black/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-va-black rounded-full flex items-center justify-center text-primary shadow-lg">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <HeadingInstrument level={4} className="text-[15px] font-bold tracking-tight">
                  <VoiceglotText translationKey="checkout.briefing.johfrai_preview" defaultText="Johfrai AI Preview" />
                </HeadingInstrument>
                <TextInstrument className="text-[11px] text-va-black/40 uppercase tracking-widest font-medium">
                  <VoiceglotText translationKey="checkout.briefing.johfrai_subtitle" defaultText="Check je timing & cadans" />
                </TextInstrument>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {aiDraftUrl ? (
                <ButtonInstrument 
                  onClick={() => {
                    if (isPlayingDraft) audioRef.current?.pause();
                    else audioRef.current?.play();
                    setIsPlayingDraft(!isPlayingDraft);
                  }}
                  className="flex items-center gap-2 bg-va-black text-white px-6 py-2.5 rounded-full text-[13px] font-bold tracking-tight hover:scale-105 transition-all"
                >
                  {isPlayingDraft ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  {isPlayingDraft ? t('checkout.briefing.pause_preview', 'Pauzeer Preview') : t('checkout.briefing.listen_preview', 'Beluister Preview')}
                  <audio 
                    ref={audioRef} 
                    src={aiDraftUrl} 
                    onEnded={() => setIsPlayingDraft(false)} 
                    className="hidden" 
                  />
                </ButtonInstrument>
              ) : (
                <ButtonInstrument 
                  onClick={generateAiDraft}
                  disabled={isGeneratingAiDraft || !state.briefing.trim()}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-[13px] font-bold tracking-tight hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isGeneratingAiDraft ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                  <VoiceglotText translationKey="checkout.briefing.generate_draft" defaultText="Genereer AI Preview" />
                </ButtonInstrument>
              )}
            </div>
          </ContainerInstrument>

          <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/20 ">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={14} height={14} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.2 }} />
            {state.usage === 'telefonie' ? (
              <TextInstrument>
                <VoiceglotText  
                  translationKey="checkout.briefing.prompts_detected" 
                  defaultText={`${state.briefing.trim().split(/\n+/).filter(Boolean).length} segmenten gedetecteerd`} 
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
            <VoiceglotText  translationKey="checkout.briefing.step2" defaultText="2. Uitspraak instructies (optioneel)" />
          </LabelInstrument>
          <input
            type="text"
            value={state.pronunciation}
            onChange={(e) => updatePronunciation(e.target.value)}
            placeholder={t('checkout.briefing.pronunciation_placeholder', "Bijv. namen, technische termen, tone-of-voice...")}
            className="w-full bg-va-off-white border-none rounded-[10px] py-5 px-8 text-[15px] font-light focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </ContainerInstrument>

        <ContainerInstrument className="space-y-6">
          <LabelInstrument className="block text-[15px] font-light tracking-widest text-va-black/30 ">
            <VoiceglotText  translationKey="checkout.briefing.step3" defaultText="3. Hoe wordt de opname gebruikt?" />
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
                <VoiceglotText  translationKey={type.key} defaultText={type.label} />
              </ButtonInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>

        <ButtonInstrument 
          onClick={handleNext} 
          className="va-btn-pro w-full py-6 !rounded-[10px]"
        >
          <VoiceglotText  translationKey="checkout.briefing.next" defaultText="Volgende: Stem Kiezen" />
        </ButtonInstrument>
      </ContainerInstrument>

      {state.usage === 'telefonie' && (
        <ContainerInstrument className="lg:col-span-1">
          <TelephonySmartSuggestions strokeWidth={1.5} />
        </ContainerInstrument>
      )}
    </ContainerInstrument>
  );
};
