"use client";

import React, { useEffect, useMemo, useRef } from 'react';
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
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { usePathname } from 'next/navigation';

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
  const { state, setJourney, isHydrated, addItem } = useCheckout();
  const { state: voicesState } = useVoicesState();
  const seededActorsRef = useRef<string>('');
  const pathname = usePathname();
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

  // Bridge selected actors from Agency casting to checkout cart when cart is still empty.
  useEffect(() => {
    if (!isHydrated) return;
    if ((state.items || []).length > 0) return;

    const selectedActors = Array.isArray(voicesState.selected_actors) ? voicesState.selected_actors : [];
    if (selectedActors.length === 0) return;

    const signature = selectedActors
      .map((actor: any) => `${actor?.id || 'unknown'}:${actor?.updated_at || ''}`)
      .sort()
      .join('|');

    if (!signature || seededActorsRef.current === signature) return;
    seededActorsRef.current = signature;

    const safeBriefing = (state.briefing || '').trim();
    const words = safeBriefing ? safeBriefing.split(/\s+/).filter(Boolean).length : 0;
    const prompts = safeBriefing ? safeBriefing.split(/\n+/).filter(Boolean).length : 1;
    const countries = Array.isArray(state.country) ? state.country : [state.country || 'BE'];
    const spotsByMedia = state.usage === 'commercial' && Array.isArray(state.media)
      ? state.media.reduce((acc: Record<string, number>, media) => {
          acc[media] = (state.spotsDetail && state.spotsDetail[media]) || state.spots || 1;
          return acc;
        }, {})
      : undefined;
    const yearsByMedia = state.usage === 'commercial' && Array.isArray(state.media)
      ? state.media.reduce((acc: Record<string, number>, media) => {
          acc[media] = (state.yearsDetail && state.yearsDetail[media]) || state.years || 1;
          return acc;
        }, {})
      : undefined;
    const vatExempt = !!state.customer.vat_number &&
      state.customer.vat_verified === true &&
      (state.customer.vat_number || '').length > 2 &&
      !state.customer.vat_number.startsWith('BE') &&
      state.customer.country !== 'BE';

    selectedActors.forEach((actor: any, index: number) => {
      const pricing = SlimmeKassa.calculate({
        usage: state.usage,
        usageId: state.usageId,
        plan: state.plan,
        words,
        prompts,
        mediaTypes: state.usage === 'commercial' ? (state.media as any) : [],
        mediaIds: state.mediaIds,
        countries,
        countryId: state.countryId,
        spots: spotsByMedia,
        years: yearsByMedia,
        liveSession: state.liveSession,
        actorRates: actor,
        music: state.music,
        secondaryLanguageIds: state.secondaryLanguageIds,
        isVatExempt: vatExempt
      }, state.pricingConfig || undefined);

      const subtotal = Number(pricing?.subtotal || 0);
      if (!Number.isFinite(subtotal) || subtotal <= 0) return;

      addItem({
        id: `seeded-${actor.id}-${Date.now()}-${index}`,
        type: 'voice_over',
        actor,
        briefing: safeBriefing,
        script: safeBriefing,
        pronunciation: state.pronunciation,
        usage: state.usage,
        media: state.media,
        country: state.country,
        secondaryLanguages: state.secondaryLanguages,
        spots: spotsByMedia || state.spots,
        years: yearsByMedia || state.years,
        liveSession: state.liveSession,
        music: state.music,
        pricing: {
          base: pricing.base,
          wordSurcharge: pricing.wordSurcharge,
          mediaSurcharge: pricing.mediaSurcharge,
          mediaBreakdown: pricing.mediaBreakdown,
          musicSurcharge: pricing.musicSurcharge,
          radioReadySurcharge: pricing.radioReadySurcharge || 0,
          subtotal,
          total: subtotal,
          vat: Number(pricing.vat || 0),
          tax: Number(pricing.vat || 0),
        }
      });
    });
  }, [
    addItem,
    isHydrated,
    state.items,
    state.usage,
    state.usageId,
    state.plan,
    state.media,
    state.mediaIds,
    state.country,
    state.countryId,
    state.spotsDetail,
    state.yearsDetail,
    state.spots,
    state.years,
    state.liveSession,
    state.music,
    state.secondaryLanguages,
    state.secondaryLanguageIds,
    state.briefing,
    state.pronunciation,
    state.customer.vat_number,
    state.customer.vat_verified,
    state.customer.country,
    state.pricingConfig,
    voicesState.selected_actors
  ]);

  useEffect(() => {
    if (!isHydrated || !pathname) return;
    const isCheckoutPath = pathname.includes('/checkout');
    const isStudioCheckoutPath = pathname.includes('/studio/checkout');
    if (isStudioJourney && isCheckoutPath && !isStudioCheckoutPath) {
      window.location.replace(studioCheckoutPath);
    }
  }, [isHydrated, isStudioJourney, pathname, studioCheckoutPath]);

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
      <SectionInstrument className="max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-20">
        <ContainerInstrument className="mb-10 sm:mb-14 flex flex-col items-center justify-center gap-6 sm:gap-8 text-center">
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

        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 xl:gap-8 items-start">
          {/* Summary Area - On mobile we only want to see the items first */}
          <ContainerInstrument className="lg:col-span-5 lg:order-2 space-y-6 sm:space-y-8">
            <ContainerInstrument className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6 px-4 sm:px-0 lg:hidden">
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
                  Jouw bestelling
                </HeadingInstrument>
                <Link href={cartPath} className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline">
                  Aanpassen
                </Link>
              </div>
              {/* Desktop: Show everything | Mobile: Show only items at the top */}
              <PricingSummary strokeWidth={1.5} onlyItems={true} className="lg:hidden !space-y-4" />
              <ContainerInstrument className="hidden lg:block bg-white p-10 rounded-[40px] shadow-aura-lg border border-va-black/5 space-y-8">
                <ContainerInstrument className="flex justify-between items-center border-b border-va-black/5 pb-6">
                  <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter">
                    Overzicht
                  </HeadingInstrument>
                  <Link href={cartPath} className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 hover:text-primary transition-colors flex items-center gap-1.5">
                    <Edit2 size={12} />
                    Aanpassen
                  </Link>
                </ContainerInstrument>
                <PricingSummary strokeWidth={1.5} className="!pt-0 !border-t-0" />
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Form Area */}
          <ContainerInstrument className="lg:col-span-7 lg:order-1">
            <CheckoutForm strokeWidth={1.5} />
            
            {/* Mobile: Show totals and CTA at the very bottom, after the form */}
            <PricingSummary
              strokeWidth={1.5}
              onlyTotals={true}
              showCtaWhenOnlyTotals={true}
              className="lg:hidden mt-8 !space-y-4"
            />
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