"use client";

import React from 'react';
import { Mic, FileText, Music, ShoppingCart, ArrowRight } from 'lucide-react';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { cn } from '@/lib/utils';

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
    { id: 'voice', icon: Mic, titleKey: 'order_steps.voice', defaultTitle: 'Kies stem' },
    { id: 'text', icon: FileText, titleKey: 'order_steps.text', defaultTitle: 'Voeg tekst toe' },
    ...(isTelephony ? [{ id: 'music', icon: Music, titleKey: 'order_steps.music', defaultTitle: 'Muziek' }] : []),
    { id: 'cart', icon: ShoppingCart, titleKey: 'order_steps.cart', defaultTitle: 'Winkelmandje' },
  ];

  return (
    <ContainerInstrument className="va-order-steps-container py-12">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-3 group">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-aura",
                  isActive 
                    ? "bg-primary text-white scale-110" 
                    : "bg-va-off-white text-va-black/20 group-hover:bg-va-black/5 group-hover:text-va-black/40"
                )}>
                  <step.icon size={24} strokeWidth={1.5} />
                </div>
                <TextInstrument className={cn(
                  "text-[11px] font-medium tracking-wide text-center whitespace-nowrap",
                  isActive ? "text-va-black" : "text-va-black/40"
                )}>
                  <VoiceglotText translationKey={step.titleKey} defaultText={step.defaultTitle} />
                </TextInstrument>
              </div>

              {!isLast && (
                <div className="flex-1 flex justify-center items-center px-4 opacity-10">
                  <ArrowRight size={16} className="text-va-black" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </ContainerInstrument>
  );
};
