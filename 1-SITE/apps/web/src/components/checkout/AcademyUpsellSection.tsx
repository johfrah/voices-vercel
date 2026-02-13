"use client";

import React from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { Sparkles, Home, Check } from 'lucide-react';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

export const AcademyUpsellSection: React.FC = () => {
  const { state, toggleUpsell } = useCheckout();

  if (state.journey !== 'academy') return null;

  return (
    <div className="space-y-6 mt-12 pt-12 border-t border-black/5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-primary" size={18} />
        <h3 className="text-sm font-black tracking-widest text-va-black/40">
          <VoiceglotText translationKey="checkout.upsell.title" defaultText="Maak je traject compleet" />
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Home Workshop Upsell */}
        <button
          onClick={() => toggleUpsell('workshop_home')}
          className={`text-left p-6 rounded-[32px] border-2 transition-all duration-500 group relative overflow-hidden ${
            state.upsells.workshop_home ? 'border-primary bg-primary/5' : 'border-black/5 bg-white hover:border-black/10'
          }`}
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                state.upsells.workshop_home ? 'bg-primary text-white' : 'bg-va-off-white text-va-black/40'
              }`}>
                <Home size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black tracking-tighter text-lg leading-none">
                  <VoiceglotText translationKey="checkout.upsell.workshop_home.title" defaultText="Live Workshop bij Johfrah thuis" />
                </h4>
                <p className="text-[15px] text-va-black/50 font-medium max-w-[280px]">
                  <VoiceglotText 
                    translationKey="checkout.upsell.workshop_home.text" 
                    defaultText="Een exclusieve 1-op-1 trainingsdag in mijn persoonlijke studio, inclusief jouw professionele demo-opname." 
                  />
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-sm font-black text-primary">+ €395</span>
                  <span className="text-[15px] font-bold text-va-black/20 tracking-widest">
                    <VoiceglotText translationKey="common.excl_vat" defaultText="Excl. BTW" />
                  </span>
                </div>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              state.upsells.workshop_home ? 'bg-primary border-primary text-white' : 'border-black/10'
            }`}>
              {state.upsells.workshop_home && <Check size={14} strokeWidth={4} />}
            </div>
          </div>
          {/* Decorative background */}
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <Home size={120} />
          </div>
        </button>
      </div>
    </div>
  );
};
