"use client";

import React, { Suspense } from 'react';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { VoicesMasterControl } from "@/components/ui/VoicesMasterControl";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { LoadingScreenInstrument, ContainerInstrument, SectionInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import ConfiguratorPageClient from '@/app/checkout/configurator/ConfiguratorPageClient';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PricingSummary } from '@/components/checkout/PricingSummary';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ChevronRight } from 'lucide-react';

export function AgencyContent({ mappedActors, filters }: { mappedActors: any[], filters: any }) {
  const { state, updateStep } = useMasterControl();
  const { selectActor, state: checkoutState } = useCheckout();
  const { playClick } = useSonicDNA();

  const handleActorSelect = (actor: any) => {
    playClick('success');
    selectActor(actor);
    updateStep('script');
    
    // Scroll naar boven van de sectie
    setTimeout(() => {
      const element = document.getElementById('master-control-anchor');
      if (element) {
        // Gebruik een offset om de filters mooi in beeld te houden
        const yOffset = -20; 
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <ContainerInstrument plain className="max-w-7xl mx-auto px-4 md:px-6" id="master-control-anchor">
      {/* Filters persistent bovenaan */}
      <div className="relative z-50">
        <VoicesMasterControl actors={mappedActors} filters={filters} />
      </div>
      
      <div className="mt-12 relative min-h-[600px]">
        <AnimatePresence mode="wait">
          {state.currentStep === 'voice' && (
            <motion.div
              key="voice-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <Suspense fallback={<LoadingScreenInstrument />}>
                <VoiceGrid 
                  actors={mappedActors} 
                  onSelect={handleActorSelect}
                />
              </Suspense>
            </motion.div>
          )}

          {state.currentStep === 'script' && (
            <motion.div
              key="configurator"
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -20 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
                {/* Script & Prijs (9 kolommen breed) - EERST op mobiel */}
                <div className="order-1 lg:order-2 lg:col-span-9 w-full">
                  <ConfiguratorPageClient 
                    isEmbedded={true} 
                    hideMediaSelector={true} 
                    minimalMode={true} 
                  />
                </div>

                {/* VoiceCard (3 kolommen breed) - LATER op mobiel, compact */}
                <div className="order-2 lg:order-1 lg:col-span-3 w-full">
                  <motion.div
                    layoutId={`actor-${checkoutState.selectedActor?.id}`}
                    className="lg:sticky lg:top-10"
                  >
                    <ConfigurableVoiceCard 
                      voice={checkoutState.selectedActor} 
                      onSelect={() => {}} 
                      hideButton
                      isCornered
                      compact={true} // Always compact in script step to save space
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {state.currentStep === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white rounded-[40px] shadow-aura p-8 md:p-16 border border-black/[0.03]"
            >
              <div className="max-w-5xl mx-auto">
                <div className="mb-12 space-y-4">
                  <HeadingInstrument level={2} className="text-5xl md:text-7xl font-light tracking-tighter text-va-black">
                    <VoiceglotText translationKey="checkout.title" defaultText="Checkout" />
                  </HeadingInstrument>
                  <TextInstrument className="text-xl text-va-black/40 font-light">
                    <VoiceglotText translationKey="checkout.subtitle" defaultText="Vul je gegevens in om de bestelling af te ronden." />
                  </TextInstrument>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  <div className="lg:col-span-7">
                    <CheckoutForm strokeWidth={1.5} />
                  </div>
                  <div className="lg:col-span-5 sticky top-10">
                    <PricingSummary strokeWidth={1.5} />
                  </div>
                </div>
                
                {/* Terug knop voor checkout */}
                <div className="mt-12 pt-8 border-t border-black/[0.03] flex justify-center">
                  <button 
                    onClick={() => updateStep('script')}
                    className="text-[11px] font-bold tracking-widest text-va-black/20 hover:text-primary uppercase transition-colors flex items-center gap-2"
                  >
                    <div className="rotate-180">
                      <ChevronRight size={14} />
                    </div>
                    Terug naar script aanpassen
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContainerInstrument>
  );
}

// Internal wrapper to override default VoiceCard behavior for Agency page
import { VoiceCard } from "@/components/ui/VoiceCard";
function ConfigurableVoiceCard({ voice, onSelect, hideButton, isCornered, compact }: { voice: any, onSelect: () => void, hideButton?: boolean, isCornered?: boolean, compact?: boolean }) {
  return (
    <VoiceCard 
      voice={voice} 
      onSelect={onSelect} 
      hideButton={hideButton}
      isCornered={isCornered}
      compact={compact}
    />
  );
}
