"use client";

import React, { useEffect, useMemo } from 'react';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { usePathname, useRouter } from 'next/navigation';

import { ArrowLeft, Edit2, ShoppingCart } from 'lucide-react';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PricingSummary } from '@/components/checkout/PricingSummary';
import { OrderStepsInstrument } from '@/components/ui/OrderStepsInstrument';
import nextDynamic from "next/dynamic";

const LiquidBackground = nextDynamic(() => import('@/components/ui/LiquidBackground').then(mod => mod.LiquidBackground), { ssr: false });

/**
 *  CHECKOUT PAGE (NUCLEAR 2026)
 */
export default function CheckoutPageClient() {
  const { state, setJourney, isHydrated } = useCheckout();
  const pathname = usePathname();
  const router = useRouter();
  const hasWorkshopItem = useMemo(
    () => (state.items || []).some((item: any) => item?.type === 'workshop_edition'),
    [state.items]
  );
  const isStudioJourney = state.journey === 'studio' || !!state.editionId || hasWorkshopItem;
  const localePrefix = useMemo(() => {
    const match = pathname?.match(/^\/(fr|en|nl|de|es|it|pt)(?=\/|$)/i);
    return match ? `/${match[1].toLowerCase()}` : '';
  }, [pathname]);
  const backPath = isStudioJourney ? `${localePrefix}/studio` : `${localePrefix}/agency`;
  const cartPath = isStudioJourney ? `${localePrefix}/studio/cart` : `${localePrefix}/cart`;
  const studioCheckoutPath = `${localePrefix}/studio/checkout`;
  
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

  useEffect(() => {
    if (!isHydrated || !pathname) return;
    const isCheckoutPath = pathname.includes('/checkout');
    const isStudioCheckoutPath = pathname.includes('/studio/checkout');
    if (isStudioJourney && isCheckoutPath && !isStudioCheckoutPath) {
      router.replace(studioCheckoutPath);
    }
  }, [isHydrated, isStudioJourney, pathname, router, studioCheckoutPath]);

  if (!isHydrated) return <LoadingScreenInstrument />;

  if (state.items.length === 0) {
    return (
      <ContainerInstrument plain className="min-h-screen bg-va-off-white flex items-center justify-center p-6 relative z-[10]">
        <LiquidBackground />
        <ContainerInstrument plain className="text-center space-y-8 max-w-md relative z-[11]">
          <ContainerInstrument className="w-24 h-24 bg-va-off-white rounded-[20px] flex items-center justify-center mx-auto text-va-black/10">
            <ShoppingCart size={48} strokeWidth={1} className="opacity-10" />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-2">
            <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter">
              <VoiceglotText  translationKey="checkout.empty.title" defaultText="Winkelmand leeg" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light">
              <VoiceglotText  translationKey="checkout.empty.text" defaultText="Je hebt nog geen stemmen geselecteerd voor je project." />
            </TextInstrument>
          </ContainerInstrument>
          <ButtonInstrument as={Link} href={backPath} className="relative z-[12]">
            <VoiceglotText  translationKey="checkout.empty.cta" defaultText="Ontdek stemmen" />
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument plain className="min-h-screen bg-va-off-white pb-24 relative z-10">
      <LiquidBackground />
      <SectionInstrument className="max-w-6xl mx-auto px-0 md:px-6 pt-20">
        <ContainerInstrument className="mb-16 flex flex-col items-center justify-center gap-8 text-center px-6 md:px-0">
          <ContainerInstrument className="space-y-4 w-full flex flex-col items-center">
            <OrderStepsInstrument currentStep="checkout" className="opacity-100 mb-4" />
            <Link  
              href={backPath} 
              className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={1.5} className="opacity-40" /> 
              <VoiceglotText
                translationKey={isStudioJourney ? "checkout.back_to_studio" : "checkout.back_to_agency"}
                defaultText={isStudioJourney ? "Terug naar studio" : "Verder casten"}
              />
            </Link>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Summary Area - On mobile we only want to see the items first */}
          <ContainerInstrument className="lg:col-span-6 lg:order-2 px-4 md:px-0 space-y-12">
            <ContainerInstrument className="lg:sticky lg:top-24">
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
                  Jouw bestelling
                </HeadingInstrument>
                <Link href={cartPath} className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline">
                  Aanpassen
                </Link>
              </div>
              {/* Desktop: Show everything | Mobile: Show only items at the top */}
              <PricingSummary strokeWidth={1.5} onlyItems={true} className="lg:hidden" />
              <div className="hidden lg:block space-y-6">
                <div className="flex justify-between items-center px-2">
                  <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
                    Overzicht
                  </HeadingInstrument>
                  <Link href={cartPath} className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 hover:text-primary transition-colors flex items-center gap-1.5">
                    <Edit2 size={12} />
                    Aanpassen
                  </Link>
                </div>
                <PricingSummary strokeWidth={1.5} />
              </div>
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