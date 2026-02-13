"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Info } from 'lucide-react';
import React from 'react';
import { TelephonySmartSuggestions } from './TelephonySmartSuggestions';

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
    <div className={`grid grid-cols-1 ${state.usage === 'telefonie' ? 'lg:grid-cols-3' : ''} gap-10`}>
      <div className={`${state.usage === 'telefonie' ? 'lg:col-span-2' : ''} space-y-10`}>
        <div className="space-y-6">
          <label className="block text-sm font-black tracking-widest text-va-black/30">
            1. Wat is het script?
          </label>
          <textarea
            value={state.briefing}
            onChange={(e) => updateBriefing(e.target.value)}
            placeholder="Plak hier je tekst..."
            className="w-full h-64 bg-va-off-white border-none rounded-[32px] p-8 text-lg font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
          <div className="flex items-center gap-2 text-[15px] font-bold tracking-widest text-va-black/20">
            <Info size={14} />
            {state.usage === 'telefonie' ? (
              <span>{state.briefing.trim().split(/\n+/).filter(Boolean).length} prompts gedetecteerd</span>
            ) : (
              <span>{state.briefing.trim().split(/\s+/).filter(Boolean).length} woorden gedetecteerd</span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <label className="block text-sm font-black tracking-widest text-va-black/30">
            2. Uitspraak instructies (optioneel)
          </label>
          <input
            type="text"
            value={state.pronunciation}
            onChange={(e) => updatePronunciation(e.target.value)}
            placeholder="Bijv. namen, technische termen, tone-of-voice..."
            className="w-full bg-va-off-white border-none rounded-[20px] py-5 px-8 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-6">
          <label className="block text-sm font-black tracking-widest text-va-black/30">
            3. Hoe wordt de opname gebruikt?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'telefonie', label: 'Telefoon / IVR' },
              { id: 'unpaid', label: 'Video (Non-Paid)' },
              { id: 'paid', label: 'Advertentie (Paid)' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => updateUsage(type.id as any)}
                className={`py-5 px-6 rounded-[24px] border-2 font-black uppercase tracking-widest text-[15px] transition-all ${
                  state.usage === type.id 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-black/5 hover:border-black/10 text-va-black/40'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleNext} className="va-btn-pro w-full py-6">
          Volgende: Stem Kiezen
        </button>
      </div>

      {state.usage === 'telefonie' && (
        <div className="lg:col-span-1">
          <TelephonySmartSuggestions />
        </div>
      )}
    </div>
  );
};
