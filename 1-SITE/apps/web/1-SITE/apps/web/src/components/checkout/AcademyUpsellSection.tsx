"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import React from 'react';
import Image from 'next/image';
import { Star, CheckCircle2 } from 'lucide-react';

export const AcademyUpsellSection: React.FC = () => {
  const { state, toggleUpsell } = useCheckout();

  if (state.journey !== 'academy' || state.journey === 'agency') return null;

  return (
    <div className="space-y-6 mt-12 pt-12 border-t border-black/5">
      <div className="flex items-center gap-2 mb-4">
        <Star size={18} strokeWidth={1.5} className="text-va-black/20" />
        <h3 className="text-[15px] font-light tracking-widest text-va-black/40">
          <VoiceglotText  translationKey="checkout.upsell.title" defaultText="Maak je traject compleet" />
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Home Workshop Upsell */}
        <button
          onClick={() => toggleUpsell('workshop_home')}
          className={`text-left p-6 rounded-[20px] border-2 transition-all duration-500 group relative overflow-hidden ${
            state.upsells.workshop_home ? 'border-green-500 bg-green-500/5' : 'border-black/5 bg-white hover:border-black/10'
          }`}
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center transition-colors ${
                state.upsells.workshop_home ? 'bg-green-500 text-white' : 'bg-va-off-white text-va-black/40'
              }`}>
                <Star size={24} strokeWidth={1.5} className={state.upsells.workshop_home ? 'text-white' : 'text-va-black/20'} />
              </div>
              <div className="space-y-1">
                <h4 className="font-light tracking-tighter text-lg leading-none text-va-black">
                  <VoiceglotText  translationKey="checkout.upsell.workshop_home.title" defaultText="Live workshop bij Johfrah thuis" />
                </h4>
                <p className="text-[15px] text-va-black/50 font-light max-w-[280px]">
                  <VoiceglotText  
                    translationKey="checkout.upsell.workshop_home.text" 
                    defaultText="Een exclusieve 1-op-1 trainingsdag in mijn persoonlijke studio, inclusief jouw professionele demo-opname." 
                  />
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[15px] font-light text-green-600">+ 395</span>
                  <span className="text-[15px] font-light text-va-black/20 tracking-widest">
                    <VoiceglotText  translationKey="common.excl_vat" defaultText="excl. BTW" />
                  </span>
                </div>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              state.upsells.workshop_home ? 'bg-green-500 border-green-500 text-white' : 'border-black/10'
            }`}>
              {state.upsells.workshop_home && <CheckCircle2 size={14} strokeWidth={3} className="text-white" />}
            </div>
          </div>
          {/* Decorative background */}
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <Star size={120} strokeWidth={1.5} className="text-va-black" />
          </div>
        </button>
      </div>
    </div>
  );
};
