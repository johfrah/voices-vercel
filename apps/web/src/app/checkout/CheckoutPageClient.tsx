"use client";

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
  const { state, setJourney, addItem, removeItem, selectActor, isHydrated } = useCheckout();
  const pathname = usePathname();
  type JourneyKey = Parameters<typeof setJourney>[0];
  const didMaterializeSelectedActorRef = useRef(false);
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

  const resolveJourneyAlias = useCallback((value: string | null): JourneyKey | null => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return null;

    const aliasMap: Record<string, JourneyKey> = {
      agency: 'agency',
      studio: 'studio',
      academy: 'academy',
      portfolio: 'portfolio',
      ademing: 'ademing',
      freelance: 'freelance',
      partner: 'partner',
      partners: 'partner',
      johfrai: 'johfrai',
      'johfrai-subscription': 'johfrai-subscription',
      johfrai_subscription: 'johfrai-subscription',
      artist: 'artist',
    };

    return aliasMap[normalized] || null;
  }, []);

  const journeyFromPath = useMemo<JourneyKey | null>(() => {
    const path = (pathname || '').toLowerCase();
    if (path.includes('/studio')) return 'studio';
    if (path.includes('/academy')) return 'academy';
    if (path.includes('/portfolio')) return 'portfolio';
    if (path.includes('/ademing')) return 'ademing';
    if (path.includes('/freelance')) return 'freelance';
    if (path.includes('/partners')) return 'partner';
    if (path.includes('/johfrai')) return 'johfrai';
    if (path.includes('/artist')) return 'artist';
    return null;
  }, [pathname]);

  useEffect(() => {
    const editionIdRaw = searchParams?.get('editionId') || '';
    const editionId = Number(editionIdRaw);
    const queryJourney = resolveJourneyAlias(searchParams?.get('journey'));

    if (queryJourney === 'studio' && Number.isFinite(editionId) && editionId > 0) {
      setJourney('studio', editionId);
      return;
    }

    if (queryJourney && state.journey !== queryJourney) {
      setJourney(queryJourney);
      return;
    }

    if (!queryJourney && journeyFromPath && state.journey !== journeyFromPath) {
      setJourney(journeyFromPath);
    }
  }, [searchParams, setJourney, state.journey, journeyFromPath, resolveJourneyAlias]);

  useEffect(() => {
    if (!isHydrated || !pathname) return;
    const isCheckoutPath = pathname.includes('/checkout');
    const isStudioCheckoutPath = pathname.includes('/studio/checkout');
    if (isStudioJourney && isCheckoutPath && !isStudioCheckoutPath) {
      window.location.replace(studioCheckoutPath);
    }
  }, [isHydrated, isStudioJourney, pathname, studioCheckoutPath]);

  useEffect(() => {
    if (!isHydrated) return;
    if (didMaterializeSelectedActorRef.current) return;
    if (isStudioJourney) return;
    const fallbackActor = (() => {
      if (typeof window === 'undefined') return null;
      try {
        const raw = localStorage.getItem('voices_state');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const selectedActors = Array.isArray(parsed?.selected_actors) ? parsed.selected_actors : [];
        if (selectedActors.length === 0) return null;
        return selectedActors[selectedActors.length - 1];
      } catch {
        return null;
      }
    })();

    const resolvedActor = state.selectedActor || fallbackActor;
    const voiceItems = (state.items || []).filter((item: any) => item?.type === 'voice_over');
    const mismatchedVoiceItems = resolvedActor
      ? voiceItems.filter((item: any) => item?.actor?.id != null && item.actor.id !== resolvedActor.id)
      : [];

    if (mismatchedVoiceItems.length > 0) {
      mismatchedVoiceItems.forEach((item: any) => {
        if (item?.id) removeItem(item.id);
      });
      return;
    }

    if (!state.selectedActor && resolvedActor) {
      selectActor(resolvedActor);
      return;
    }

    if (!resolvedActor) {
      didMaterializeSelectedActorRef.current = true;
      return;
    }

    const hasMatchingVoiceItem = voiceItems.some((item: any) => item?.actor?.id === resolvedActor.id);
    if (hasMatchingVoiceItem) {
      didMaterializeSelectedActorRef.current = true;
      return;
    }

    const configuredTotal = Number(state.pricing?.total ?? 0);
    const fallbackTotal = Number((resolvedActor as any)?.starting_price ?? (resolvedActor as any)?.price_unpaid ?? 0);
    const currentSelectionTotal = Number.isFinite(configuredTotal) && configuredTotal > 0 ? configuredTotal : fallbackTotal;
    if (!Number.isFinite(currentSelectionTotal) || currentSelectionTotal <= 0) {
      didMaterializeSelectedActorRef.current = true;
      return;
    }

    const itemId = `voice-${resolvedActor.id}-${Date.now()}`;
    didMaterializeSelectedActorRef.current = true;
    addItem({
      id: itemId,
      type: 'voice_over',
      actor: resolvedActor,
      briefing: state.briefing,
      script: state.briefing,
      pronunciation: state.pronunciation,
      usage: state.usage,
      usageId: state.usageId,
      journeyId: state.journeyId,
      media: state.media,
      mediaIds: state.mediaIds,
      country: state.country,
      countryId: state.countryId,
      secondaryLanguages: state.secondaryLanguages,
      secondaryLanguageIds: state.secondaryLanguageIds,
      spots: state.spotsDetail || state.spots,
      years: state.yearsDetail || state.years,
      liveSession: state.liveSession,
      music: state.music,
      pricing: {
        base: state.pricing.base,
        wordSurcharge: state.pricing.wordSurcharge,
        mediaSurcharge: state.pricing.mediaSurcharge,
        mediaBreakdown: state.pricing.mediaBreakdown,
        musicSurcharge: state.pricing.musicSurcharge,
        radioReadySurcharge: state.pricing.radioReadySurcharge || 0,
        subtotal: currentSelectionTotal,
        total: currentSelectionTotal
      }
    });
  }, [
    isHydrated,
    isStudioJourney,
    pathname,
    state.briefing,
    state.country,
    state.countryId,
    state.items,
    state.journeyId,
    state.liveSession,
    state.media,
    state.mediaIds,
    state.music,
    state.pricing,
    state.pronunciation,
    state.secondaryLanguageIds,
    state.secondaryLanguages,
    state.selectedActor,
    state.spots,
    state.spotsDetail,
    state.usage,
    state.usageId,
    state.years,
    state.yearsDetail,
    addItem,
    removeItem,
    selectActor
  ]);

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
              <PricingSummary strokeWidth={1.5} onlyItems={true} className="lg:hidden !space-y-4 px-0 sm:px-0" />
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
              className="lg:hidden mt-8 !space-y-4 px-0 sm:px-0"
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