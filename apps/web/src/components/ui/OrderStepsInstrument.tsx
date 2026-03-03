"use client";

import { cn } from '@/lib/utils';
import React from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { Check } from 'lucide-react';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface OrderStepsInstrumentProps {
  currentStep?: 'voice' | 'script' | 'checkout' | 'participant' | 'payment';
  className?: string;
}

interface StepConfig {
  id: string;
  label: string;
  key: string;
}

const AGENCY_STEPS: StepConfig[] = [
  { id: 'voice', label: 'Kies Stem', key: 'order_steps.voice' },
  { id: 'script', label: 'Script', key: 'order_steps.script' },
  { id: 'cart', label: 'Overzicht', key: 'order_steps.cart' },
  { id: 'checkout', label: 'Afrekenen', key: 'order_steps.checkout' },
];

const STUDIO_STEPS: StepConfig[] = [
  { id: 'participant', label: 'Deelnemer', key: 'order_steps.participant' },
  { id: 'checkout', label: 'Gegevens', key: 'order_steps.details' },
  { id: 'payment', label: 'Betaling', key: 'order_steps.payment' },
];

/**
 * ORDER STEPS INSTRUMENT (2026)
 * 
 * World-aware: Agency toont Kies Stem → Script → Overzicht → Afrekenen
 * Studio toont Deelnemer → Gegevens → Betaling
 */
export const OrderStepsInstrument: React.FC<OrderStepsInstrumentProps> = ({ 
  currentStep = 'voice',
  className = ''
}) => {
  const { state: checkoutState } = useCheckout();
  
  const isStudioJourney = checkoutState.journey === 'studio';
  const steps = isStudioJourney ? STUDIO_STEPS : AGENCY_STEPS;

  const currentStepId = typeof window !== 'undefined' && window.location.pathname.includes('/cart') 
    ? 'cart' 
    : (isStudioJourney ? 'checkout' : currentStep);

  const totalActors = ((checkoutState.items || [])).length + (checkoutState.selectedActor ? 1 : 0);

  return (
    <ContainerInstrument plain className={cn("flex justify-center opacity-80 hover:opacity-100 transition-opacity duration-500", className)}>
      <ContainerInstrument plain className="flex items-center gap-4 md:gap-6">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isPast = steps.findIndex(s => s.id === currentStepId) > index;
          
          let stepLabel = <VoiceglotText translationKey={step.key} defaultText={step.label} />;
          
          if (!isStudioJourney && step.id === 'voice' && (isActive || isPast)) {
            if (totalActors > 1) {
              stepLabel = (
                <TextInstrument as="span" className="flex items-center gap-1.5">
                  {totalActors} <VoiceglotText translationKey="order_steps.voices_plural" defaultText="Stemmen" />
                </TextInstrument>
              );
            } else {
              const actorName = checkoutState.selectedActor?.display_name || (checkoutState.items || [])[0]?.actor?.display_name;
              if (actorName && ((checkoutState.items || []).length > 0 || (checkoutState.selectedActor && currentStep !== 'voice'))) {
                stepLabel = <TextInstrument as="span" className="truncate max-w-[100px]">{actorName}</TextInstrument>;
              }
            }
          }

          if (isStudioJourney && step.id === 'participant' && isPast) {
            const workshopName = (checkoutState.items || [])[0]?.name;
            if (workshopName) {
              stepLabel = <TextInstrument as="span" className="truncate max-w-[120px]">{workshopName}</TextInstrument>;
            }
          }

          return (
            <React.Fragment key={step.id}>
              <ContainerInstrument plain className="flex items-center gap-2">
                {isPast ? (
                  <ContainerInstrument plain className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-300">
                    <Check size={10} className="text-white" strokeWidth={4} />
                  </ContainerInstrument>
                ) : (
                  <ContainerInstrument plain className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                    isActive ? "bg-primary scale-150" : "bg-va-black/20"
                  )} />
                )}
                <TextInstrument as="span" className={cn(
                  "text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-500",
                  isActive ? "text-va-black" : isPast ? "text-green-600" : "text-va-black/30"
                )}>
                  {stepLabel}
                </TextInstrument>
              </ContainerInstrument>
              
              {index < steps.length - 1 && (
                <ContainerInstrument plain className={cn(
                  "w-4 h-[1px] transition-colors duration-500",
                  isPast ? "bg-green-500/30" : "bg-va-black/10"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
