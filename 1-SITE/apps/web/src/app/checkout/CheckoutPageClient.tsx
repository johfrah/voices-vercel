"use client";

import React, { useEffect, useMemo } from 'react';
import {
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import Image from 'next/image';
import Link from 'next/link';

import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PricingSummary } from '@/components/checkout/PricingSummary';
import { OrderStepsInstrument } from '@/components/ui/OrderStepsInstrument';

/**
 *  CHECKOUT PAGE (NUCLEAR 2026)
 */
export default function CheckoutPageClient() {
  const { state, setJourney } = useCheckout();
  const isLoading = false; // Tijdelijk, aangezien isLoading niet in de context zit
  
  const searchParams = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search);
  }, []);

  useEffect(() => {
    const editionId = searchParams?.get('editionId');
    const journey = searchParams?.get('journey');
    
    if (editionId && journey === 'studio') {
      setJourney('studio', parseInt(editionId));
    }
  }, [searchParams, setJourney]);

  if (isLoading) return <LoadingScreenInstrument />;

  if (state.items.length === 0) {
    return (
      <ContainerInstrument className="min-h-screen bg-va-off-white flex items-center justify-center p-6">
        <ContainerInstrument className="text-center space-y-8 max-w-md">
          <ContainerInstrument className="w-24 h-24 bg-va-off-white rounded-[20px] flex items-center justify-center mx-auto text-va-black/10">
            <Image  src="/assets/common/branding/icons/CART.svg" width={48} height={48} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.1 }} />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-2">
            <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter">
              <VoiceglotText  translationKey="checkout.empty.title" defaultText="Winkelmand leeg" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light">
              <VoiceglotText  translationKey="checkout.empty.text" defaultText="Je hebt nog geen stemmen geselecteerd voor je project." />
            </TextInstrument>
          </ContainerInstrument>
          <Link  href="/agency" className="va-btn-pro inline-block"><VoiceglotText  translationKey="checkout.empty.cta" defaultText="Ontdek stemmen" /></Link>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument className="min-h-screen bg-va-off-white pb-24 relative z-10">
      <SectionInstrument className="max-w-6xl mx-auto px-0 md:px-6 pt-20">
        <ContainerInstrument className="mb-16 flex flex-col items-center justify-center gap-8 text-center px-6 md:px-0">
          <ContainerInstrument className="space-y-4 w-full flex flex-col items-center">
            <OrderStepsInstrument currentStep="checkout" className="opacity-100 mb-4" />
            <Link  
              href="/agency" 
              className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors"
            >
              <Image  src="/assets/common/branding/icons/BACK.svg" width={14} height={14} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} /> 
              <VoiceglotText  translationKey="checkout.back_to_agency" defaultText="Verder casten" />
            </Link>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Summary Area - On mobile we only want to see the items first */}
          <ContainerInstrument className="lg:col-span-6 lg:order-2 px-4 md:px-0">
            <ContainerInstrument className="lg:sticky lg:top-24">
              {/* Desktop: Show everything | Mobile: Show only items at the top */}
              <PricingSummary strokeWidth={1.5} onlyItems={true} className="lg:hidden" />
              <PricingSummary strokeWidth={1.5} className="hidden lg:block" />
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Form Area */}
          <ContainerInstrument className="lg:col-span-6 lg:order-1 px-4 md:px-0">
            <CheckoutForm strokeWidth={1.5} />
            
            {/* Mobile: Show totals and CTA at the very bottom, after the form */}
            <PricingSummary strokeWidth={1.5} onlyTotals={true} className="lg:hidden mt-12" />
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CheckoutPage",
            "name": "Voices Checkout",
            "description": "Veilig afrekenen van stemacteur diensten.",
            "_llm_context": {
              "persona": "Gids",
              "journey": "common",
              "intent": "checkout",
              "capabilities": ["process_payment", "validate_vat", "request_quote"],
              "lexicon": ["Checkout", "Betaling", "Offerte", "BTW-verificatie"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </ContainerInstrument>
  );
}