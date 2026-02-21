"use client";

import { cn } from '@/lib/utils';
import React from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { Check } from 'lucide-react';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface OrderStepsInstrumentProps {
  currentStep?: 'voice' | 'script' | 'checkout';
  className?: string;
}

/**
 *  ORDER STEPS INSTRUMENT (2026 MASTERCLASS)
 * 
 * Een strak, gecentreerd instrument dat de voortgang van de klant toont.
 * Voldoet aan het Chris-Protocol: Minimalistisch, geen layout shifts, 100ms feedback.
 */
export const OrderStepsInstrument: React.FC<OrderStepsInstrumentProps> = ({ 
  currentStep = 'voice',
  className = ''
}) => {
  const { state: checkoutState } = useCheckout();
  
  const steps = [
    { id: 'voice', label: 'Kies Stem', key: 'order_steps.voice' },
    { id: 'script', label: 'Script', key: 'order_steps.script' },
    { id: 'checkout', label: 'Afrekenen', key: 'order_steps.checkout' },
  ] as const;

  const totalActors = checkoutState.items.length + (checkoutState.selectedActor ? 1 : 0);

  return (
    <div className={cn("flex justify-center opacity-80 hover:opacity-100 transition-opacity duration-500", className)}>
      <div className="flex items-center gap-4 md:gap-6">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isPast = steps.findIndex(s => s.id === currentStep) > index;
          const isVoiceStep = step.id === 'voice';
          
          // CHRIS-PROTOCOL: Dynamic step labels based on cart content
          let stepLabel = <VoiceglotText translationKey={step.key} defaultText={step.label} />;
          
          if (isVoiceStep && (isActive || isPast)) {
            if (totalActors > 1) {
              stepLabel = (
                <span className="flex items-center gap-1.5">
                  {totalActors} <VoiceglotText translationKey="order_steps.voices_plural" defaultText="Stemmen" />
                </span>
              );
            } else {
              const actorName = checkoutState.selectedActor?.display_name || checkoutState.items[0]?.actor?.display_name;
              // CHRIS-PROTOCOL: Alleen de naam tonen als er echt een stem geselecteerd is OF in het mandje zit
              // En we niet in de initiële 'voice' stap zitten zonder selectie
              if (actorName && (checkoutState.items.length > 0 || (checkoutState.selectedActor && currentStep !== 'voice'))) {
                stepLabel = <span className="truncate max-w-[100px]">{actorName}</span>;
              }
            }
          }

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                {isPast ? (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-300">
                    <Check size={10} className="text-white" strokeWidth={4} />
                  </div>
                ) : (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                    isActive ? "bg-primary scale-150" : "bg-va-black/20"
                  )} />
                )}
                <span className={cn(
                  "text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-500",
                  isActive ? "text-va-black" : isPast ? "text-green-600" : "text-va-black/30"
                )}>
                  {stepLabel}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-4 h-[1px] transition-colors duration-500",
                  isPast ? "bg-green-500/30" : "bg-va-black/10"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
