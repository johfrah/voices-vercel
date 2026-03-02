"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { useTranslation } from '@/contexts/TranslationContext';
import { Actor } from '@/types';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { VoiceCard } from '../ui/VoiceCard';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument,
  InputInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '../ui/VoiceglotText';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const VoiceStep: React.FC = () => {
  const { state, selectActor, setStep } = useCheckout();
  const { playDemo } = useGlobalAudio();
  const { playClick } = useSonicDNA();
  const { t } = useTranslation();
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadActors = async () => {
      try {
        const res = await fetch('/api/agency/actors?language=vlaams');
        if (res.ok) {
          const { results } = await res.json();
          setActors(results);

          const urlParams = new URLSearchParams(window.location.search);
          const voiceId = urlParams.get('voice');
          if (voiceId) {
            const preSelected = results.find((a: Actor) => a.id.toString() === voiceId);
            if (preSelected) {
              selectActor(preSelected);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadActors();
  }, [selectActor]);

  const handleNext = () => {
    if (!state.selectedActor) {
      alert(t('checkout.voice.error_select', 'Selecteer a.u.b. een stemacteur.'));
      return;
    }
    playClick('deep');
    setStep('details');
  };

  const filteredActors = actors.filter(a => 
    a.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ContainerInstrument className="space-y-10">
      <ContainerInstrument className="relative">
        <InputInstrument
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('action.search_by_name', "Zoek op naam...")}
          className="w-full bg-va-off-white border-none rounded-[20px] py-5 pl-14 pr-8 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <Image  src="/assets/common/branding/icons/SEARCH.svg" width={20} height={20} alt="" className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
      </ContainerInstrument>

      {loading ? (
        <ContainerInstrument className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} strokeWidth={1.5} />
        </ContainerInstrument>
      ) : (
        <ContainerInstrument className="grid grid-cols-1 gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredActors.map((actor) => (
            <ContainerInstrument 
              key={actor.id}
              onClick={() => {
                playClick('light');
                selectActor(actor);
                if (actor.demos && actor.demos.length > 0) {
                  playDemo(actor.demos[0]);
                }
              }}
              className={cn(
                "relative rounded-[20px] border-2 transition-all cursor-pointer",
                state.selectedActor?.id === actor.id 
                  ? 'border-primary shadow-aura scale-[0.98]' 
                  : 'border-transparent hover:border-va-black/5'
              )}
            >
               <VoiceCard voice={actor} />
              {state.selectedActor?.id === actor.id && (
                <ContainerInstrument className="absolute top-6 right-6 bg-primary text-white p-3 rounded-[20px] shadow-lg z-20 animate-in zoom-in duration-300">
                  <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" className="brightness-0 invert" />
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      )}

      <ContainerInstrument className="flex gap-4">
        <ButtonInstrument 
          onClick={() => setStep('briefing')} 
          className="flex-1 py-6 rounded-[10px] bg-va-black/5 text-va-black font-medium tracking-widest text-[15px] hover:bg-va-black/10 transition-all"
        >
          <VoiceglotText  translationKey="common.back" defaultText="Terug" />
        </ButtonInstrument>
        <ButtonInstrument 
          onClick={handleNext} 
          className="flex-[2] va-btn-pro py-6 !rounded-[10px]"
        >
          <VoiceglotText  translationKey="checkout.voice.next" defaultText="Volgende: Gegevens" />
        </ButtonInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
