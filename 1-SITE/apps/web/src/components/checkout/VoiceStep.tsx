"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Actor } from '@/types';
import { CheckCircle2, Loader2, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { VoiceCard } from '../ui/VoiceCard';

export const VoiceStep: React.FC = () => {
  const { state, selectActor, setStep } = useCheckout();
  const { playDemo } = useGlobalAudio();
  const { playClick } = useSonicDNA();
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadActors = async () => {
      try {
        // We halen de data op via de publieke API route in plaats van de directe bridge
        const res = await fetch('/api/agency/actors?language=vlaams');
        if (res.ok) {
          const { results } = await res.json();
          setActors(results);

          // 🎯 PRE-SELECT MANDATE: Als er een voice ID in de URL staat, selecteer deze direct.
          const urlParams = new URLSearchParams(window.location.search);
          const voiceId = urlParams.get('voice');
          if (voiceId) {
            const preSelected = results.find((a: Actor) => a.id.toString() === voiceId);
            if (preSelected) {
              selectActor(preSelected);
              // Als we al een stem hebben gekozen via de agency pagina, 
              // kunnen we eventueel direct door naar de volgende stap.
              // Maar we laten de gebruiker hier landen voor bevestiging.
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
  }, [selectActor]); // Added selectActor to dependencies

  const handleNext = () => {
    if (!state.selectedActor) {
      alert('Selecteer a.u.b. een stemacteur.');
      return;
    }
    playClick('deep');
    setStep('details');
  };

  const filteredActors = actors.filter(a => 
    a.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam..."
          className="w-full bg-va-off-white border-none rounded-[24px] py-5 pl-14 pr-8 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20" size={20} />
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredActors.map((actor) => (
            <div 
              key={actor.id}
              onClick={() => {
                playClick('light');
                selectActor(actor);
                if (actor.demos && actor.demos.length > 0) {
                  playDemo(actor.demos[0]);
                }
              }}
              className={`relative rounded-[44px] border-4 transition-all cursor-pointer ${
                state.selectedActor?.id === actor.id 
                  ? 'border-primary shadow-xl scale-[0.98]' 
                  : 'border-transparent hover:border-black/5'
              }`}
            >
               <VoiceCard voice={actor} />
              {state.selectedActor?.id === actor.id && (
                <div className="absolute top-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg z-20 animate-in zoom-in duration-300">
                  <CheckCircle2 strokeWidth={1.5} size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={() => setStep('briefing')} className="flex-1 py-6 rounded-[24px] bg-black/5 font-black tracking-widest text-[15px] hover:bg-black/10 transition-all">
          Terug
        </button>
        <button onClick={handleNext} className="flex-[2] va-btn-pro py-6">
          Volgende: Gegevens
        </button>
      </div>
    </div>
  );
};
