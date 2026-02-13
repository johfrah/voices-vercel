"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import React from 'react';
import Image from 'next/image';

export const AcademyUpsellSection: React.FC = () => {
  const { state, toggleUpsell } = useCheckout();

  if (state.journey !== 'academy') return null;

  return (
    <div className="space-y-6 mt-12 pt-12 border-t border-black/5">
      <div className="flex items-center gap-2 mb-4">
        <Image  src="/assets/common/branding/icons/INFO.svg" width={18} height={18} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
        <h3 className="text-[15px] font-light tracking-widest text-va-black/40">
          <VoiceglotText strokeWidth={1.5} translationKey="checkout.upsell.title" defaultText="Maak je traject compleet" / />
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Home Workshop Upsell */}
        <button
          onClick={() => toggleUpsell('workshop_home')}
          className={`text-left p-6 rounded-[20px] border-2 transition-all duration-500 group relative overflow-hidden ${
            state.upsells.workshop_home ? 'border-primary bg-primary/5' : 'border-black/5 bg-white hover:border-black/10'
          }`}
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center transition-colors ${
                state.upsells.workshop_home ? 'bg-primary text-white' : 'bg-va-off-white text-va-black/40'
              }`}>
                <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" className={state.upsells.workshop_home ? 'brightness-0 invert' : ''} style={!state.upsells.workshop_home ? { filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 } : {}} / />
              </div>
              <div className="space-y-1">
                <h4 className="font-light tracking-tighter text-lg leading-none text-va-black">
                  <VoiceglotText strokeWidth={1.5} translationKey="checkout.upsell.workshop_home.title" defaultText="Live workshop bij Johfrah thuis" / />
                </h4>
                <p className="text-[15px] text-va-black/50 font-light max-w-[280px]">
                  <VoiceglotText strokeWidth={1.5} 
                    translationKey="checkout.upsell.workshop_home.text" 
                    defaultText="Een exclusieve 1-op-1 trainingsdag in mijn persoonlijke studio, inclusief jouw professionele demo-opname." 
                  / />
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[15px] font-light text-primary">+ €395</span>
                  <span className="text-[15px] font-light text-va-black/20 tracking-widest">
                    <VoiceglotText strokeWidth={1.5} translationKey="common.excl_vat" defaultText="excl. BTW" / />
                  </span>
                </div>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              state.upsells.workshop_home ? 'bg-primary border-primary text-white' : 'border-black/10'
            }`}>
              {state.upsells.workshop_home && <Image  src="/assets/common/branding/icons/INFO.svg" width={14} height={14} alt="" className="brightness-0 invert" / />}
            </div>
          </div>
          {/* Decorative background */}
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={120} height={120} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
          </div>
        </button>
      </div>
    </div>
  );
};
