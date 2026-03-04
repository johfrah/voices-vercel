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
import Image from 'next/image';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { usePathname } from 'next/navigation';
import { ShoppingCart, ArrowRight, Star, Info, ArrowLeft } from 'lucide-react';
import { PricingSummary } from '@/components/checkout/PricingSummary';
import { OrderStepsInstrument } from '@/components/ui/OrderStepsInstrument';
import nextDynamic from "next/dynamic";

const LiquidBackground = nextDynamic(() => import('@/components/ui/LiquidBackground').then(mod => mod.LiquidBackground), { ssr: false });

/**
 *  CART PAGE (NUCLEAR 2026)
 * 
 * Doel: Een dedicated plek om de bestelling te bekijken zonder de afleidende checkout velden.
 * Voorkomt z-index issues en visuele vermenging.
 */
export default function CartPageClient() {
  const { state, isHydrated, addItem } = useCheckout();
  const { state: voicesState } = useVoicesState();
  const seededActorsRef = useRef<string>('');
  const pathname = usePathname();
  const [reviewStats, setReviewStats] = React.useState<{ averageRating: number, totalCount: number } | null>(null);
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
  const checkoutPath = isStudioJourney ? `${localePrefix}/studio/checkout` : `${localePrefix}/checkout`;
  const studioCartPath = `${localePrefix}/studio/cart`;

  useEffect(() => {
    if (!isHydrated) return;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/actors');
        const data = await res.json();
        if (data.reviewStats) setReviewStats(data.reviewStats);
      } catch (e) {}
    };
    fetchStats();
  }, [isHydrated]);

  // Bridge selected actors from Agency casting to cart when cart is still empty.
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

      const subtotalValue = Number(pricing?.subtotal || 0);
      if (!Number.isFinite(subtotalValue) || subtotalValue <= 0) return;

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
          subtotal: subtotalValue,
          total: subtotalValue,
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
    const isAnyCartPath = pathname.includes('/cart');
    const isStudioCartPath = pathname.includes('/studio/cart');
    if (isStudioJourney && isAnyCartPath && !isStudioCartPath) {
      window.location.replace(studioCartPath);
    }
  }, [isHydrated, isStudioJourney, pathname, studioCartPath]);

  if (!isHydrated) return <LoadingScreenInstrument />;

  if (state.items.length === 0) {
    return (
      <ContainerInstrument plain className="min-h-screen bg-va-off-white flex items-center justify-center p-6 relative z-[10]">
        <LiquidBackground />
        <ContainerInstrument plain className="text-center space-y-8 max-w-md relative z-[11]">
          <ContainerInstrument className="w-24 h-24 bg-va-off-white rounded-[20px] flex items-center justify-center mx-auto text-va-black/10">
            <ShoppingCart size={48} strokeWidth={1.5} className="opacity-20" />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-2">
            <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter">
              <VoiceglotText translationKey="cart.empty.title" defaultText="Projectoverzicht leeg" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light">
              <VoiceglotText translationKey="cart.empty.text" defaultText="Je hebt nog geen stemmen geselecteerd voor je project." />
            </TextInstrument>
          </ContainerInstrument>
          <ButtonInstrument as={Link} href={backPath} className="relative z-[12]">
            <VoiceglotText translationKey="cart.empty.cta" defaultText="Ontdek stemmen" />
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument plain className="min-h-screen bg-va-off-white pb-24 relative z-10">
      <LiquidBackground />
      <SectionInstrument className="max-w-6xl mx-auto px-6 pt-20">
        <ContainerInstrument className="mb-16 flex flex-col items-center justify-center gap-8 text-center">
          <ContainerInstrument className="space-y-4 w-full flex flex-col items-center">
            <OrderStepsInstrument currentStep="checkout" className="opacity-100 mb-4" />
            <Link  
              href={backPath} 
              className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={1.5} className="opacity-40" /> 
              <VoiceglotText
                translationKey={isStudioJourney ? "cart.back_to_studio" : "cart.back_to_agency"}
                defaultText={isStudioJourney ? "Terug naar studio" : "Verder casten"}
              />
            </Link>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items List */}
          <ContainerInstrument className="lg:col-span-7 space-y-8">
            <PricingSummary onlyItems={true} className="!space-y-6" />
            
            <div className="p-8 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-6">
              <div className="w-12 h-12 bg-white rounded-[10px] flex items-center justify-center text-primary shadow-sm">
                <Info size={24} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-bold tracking-tight mb-1 text-va-black uppercase">
                  <VoiceglotText
                    translationKey={isStudioJourney ? "cart.studio.info.title" : "cart.info.title"}
                    defaultText={isStudioJourney ? "Workshop & Inschrijving" : "Productie & Levering"}
                  />
                </h4>
                <p className="text-[15px] text-va-black/40 font-light leading-relaxed">
                  <VoiceglotText
                    translationKey={isStudioJourney ? "cart.studio.info.desc" : "cart.info.desc"}
                    defaultText={
                      isStudioJourney
                        ? "Per workshop-item zie je hier deelnemer, editie, datum en locatie voordat je afrekent."
                        : "Per stem-item zie je hier de exacte leverdatum, rechten en mediagebruik op basis van die specifieke stem."
                    }
                  />
                </p>
              </div>
            </div>
          </ContainerInstrument>

          {/* Totals & Checkout CTA */}
          <ContainerInstrument className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-8">
              <div className="bg-white p-10 rounded-[40px] shadow-aura-lg border border-va-black/5 space-y-8">
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter border-b border-va-black/5 pb-6">
                  Overzicht
                </HeadingInstrument>
                
                <PricingSummary onlyTotals={true} className="!pt-0 !border-t-0" />
                
                <ButtonInstrument 
                  as={Link}
                  href={checkoutPath}
                  className="w-full va-btn-pro !py-8 text-xl !rounded-[24px] !bg-va-black !text-white flex items-center justify-center gap-3 group transition-all duration-500 hover:shadow-aura-lg hover:scale-[1.02]"
                >
                  <VoiceglotText translationKey="cart.cta.checkout" defaultText="Naar afrekenen" />
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </ButtonInstrument>

                <div className="flex flex-col items-center gap-3 text-center pt-4">
                  <div className="flex items-center gap-2 text-green-600/60">
                    <div className="flex -space-x-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                    <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase">
                      {reviewStats?.averageRating || "4.9"}/5 sterren
                    </TextInstrument>
                  </div>
                </div>
              </div>

              {/* Security Nudge */}
              <div className="flex items-center justify-center gap-4 text-va-black/20">
                <Image src="/payment-methods/mollie/bancontact.png" width={36} height={20} alt="Bancontact" className="h-5 w-auto object-contain grayscale opacity-50" priority />
                <Image src="/payment-methods/mollie/ideal.png" width={36} height={20} alt="iDEAL" className="h-5 w-auto object-contain grayscale opacity-50" priority />
                <Image src="/payment-methods/mollie/creditcard.png" width={40} height={20} alt="Creditcard" className="h-5 w-auto object-contain grayscale opacity-50" priority />
                <div className="w-px h-4 bg-va-black/10" />
                <TextInstrument className="text-[10px] font-bold uppercase tracking-widest">
                  Veilig betalen via SSL
                </TextInstrument>
              </div>
            </div>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </ContainerInstrument>
  );
}
