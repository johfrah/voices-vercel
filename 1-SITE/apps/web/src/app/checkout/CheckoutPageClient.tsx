"use client";

import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PricingSummary } from '@/components/checkout/PricingSummary';
import {
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import { ArrowLeft, ShieldCheck, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

/**
 * 🛒 CHECKOUT PAGE (NUCLEAR 2026)
 */
export default function CheckoutPageClient() {
  const { state } = useCheckout();
  const isLoading = false; // Tijdelijk, aangezien isLoading niet in de context zit

  if (isLoading) return <LoadingScreenInstrument />;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-va-off-white flex items-center justify-center p-6">
        <ContainerInstrument className="text-center space-y-8 max-w-md">
          <ContainerInstrument className="w-24 h-24 bg-va-off-white rounded-full flex items-center justify-center mx-auto text-va-black/10">
            <ShoppingCart size={48} />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-2">
            <HeadingInstrument level={1} className="text-4xl font-black tracking-tighter">
              <VoiceglotText translationKey="checkout.empty.title" defaultText="Winkelmand Leeg" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-medium">
              <VoiceglotText translationKey="checkout.empty.text" defaultText="Je hebt nog geen stemmen geselecteerd voor je project." />
            </TextInstrument>
          </ContainerInstrument>
          <Link href="/agency" className="va-btn-pro inline-block">
            <VoiceglotText translationKey="checkout.empty.cta" defaultText="Ontdek Stemmen" />
          </Link>
        </ContainerInstrument>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-va-off-white pb-24 relative z-10">
      <SectionInstrument className="max-w-6xl mx-auto px-6 pt-20">
        <ContainerInstrument className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <ContainerInstrument className="space-y-4">
            <Link 
              href="/agency" 
              className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors"
            >
              <ArrowLeft strokeWidth={1.5} size={14} /> 
              <VoiceglotText translationKey="checkout.back_to_agency" defaultText="Verder Casten" />
            </Link>
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-none text-va-black">
              <VoiceglotText translationKey="checkout.title" defaultText="Checkout" />
            </HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="flex items-center gap-4">
            <ContainerInstrument className="px-4 py-2 bg-primary/5 text-primary rounded-full text-[15px] font-light tracking-widest border border-primary/10 flex items-center gap-2">
              <ShieldCheck strokeWidth={1.5} size={12} />
              <VoiceglotText translationKey="checkout.secure" defaultText="Secure Checkout" />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Area */}
          <ContainerInstrument className="lg:col-span-7">
            <CheckoutForm />
          </ContainerInstrument>

          {/* Summary Area */}
          <ContainerInstrument className="lg:col-span-5">
            <ContainerInstrument className="sticky top-24">
              <PricingSummary />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 🧠 LLM CONTEXT (Compliance) */}
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
    </div>
  );
}