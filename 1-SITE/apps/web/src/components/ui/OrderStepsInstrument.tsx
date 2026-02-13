"use client";

import { cn } from '@/lib/utils';
import React from 'react';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface OrderStep {
  id: string;
  icon: any;
  titleKey: string;
  defaultTitle: string;
}

/**
 * ORDER STEPS INSTRUMENT
 * 
 * Toont de visuele flow van een bestelling:
 * Kies stem -> Tekst toevoegen -> Muziek (optioneel) -> Winkelmandje
 */
export const OrderStepsInstrument: React.FC<{ currentStep?: string, isTelephony?: boolean }> = ({ 
  currentStep = 'voice',
  isTelephony = false 
}) => {
  const steps: OrderStep[] = [
    { id: 'voice', icon: null, titleKey: 'order_steps.voice', defaultTitle: '01 Kies stem' },
    { id: 'text', icon: null, titleKey: 'order_steps.text', defaultTitle: '02 Script' },
    ...(isTelephony ? [{ id: 'music', icon: null, titleKey: 'order_steps.music', defaultTitle: '03 Muziek' }] : []),
    { id: 'cart', icon: null, titleKey: 'order_steps.cart', defaultTitle: '04 Checkout' },
  ];

  return (
    <ContainerInstrument className="va-order-steps-container py-16">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-4 group">
                <div className={cn(
                  "w-16 h-16 rounded-[15px] flex items-center justify-center transition-all duration-700 shadow-aura border border-black/[0.03]",
                  isActive 
                    ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20 border-primary/20" 
                    : "bg-white text-va-black/20 group-hover:bg-va-black/5 group-hover:text-va-black/40"
                )}>
                  <span className="text-2xl font-extralight tracking-tighter">0{index + 1}</span>
                </div>
                <TextInstrument className={cn(
                  "text-[15px] font-light tracking-[0.2em] text-center whitespace-nowrap uppercase",
                  isActive ? "text-va-black" : "text-va-black/30"
                )}><VoiceglotText translationKey={step.titleKey} defaultText={step.defaultTitle.split(' ').slice(1).join(' ')} /></TextInstrument>
              </div>

              {!isLast && (
                <div className="flex-1 flex justify-center items-center px-6">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </ContainerInstrument>
  );
};
