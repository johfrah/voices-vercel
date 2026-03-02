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
import { useTranslation } from '@/contexts/TranslationContext';
import Image from 'next/image';
import { VoicesLinkInstrument as Link } from '@/components/ui/VoicesLinkInstrument';
import { ShoppingCart, ArrowRight, Star, Trash2, Edit2, Eye, Info, ArrowLeft } from 'lucide-react';
import { PricingSummary } from '@/components/checkout/PricingSummary';
import { OrderStepsInstrument } from '@/components/ui/OrderStepsInstrument';
import nextDynamic from "next/dynamic";
import { cn } from '@/lib/utils';

const LiquidBackground = nextDynamic(() => import('@/components/ui/LiquidBackgroundInstrument').then(mod => mod.LiquidBackground), { ssr: false });

/**
 *  CART PAGE (NUCLEAR 2026)
 * 
 * Doel: Een dedicated plek om de bestelling te bekijken zonder de afleidende checkout velden.
 * Voorkomt z-index issues en visuele vermenging.
 */
export default function CartPageClient() {
  const { t } = useTranslation();
  const { state, subtotal, isHydrated } = useCheckout();
  const [reviewStats, setReviewStats] = React.useState<{ averageRating: number, totalCount: number } | null>(null);

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
          <ButtonInstrument as={Link} href="/agency" className="relative z-[12]">
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
              href="/agency" 
              className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={1.5} className="opacity-40" /> 
              <VoiceglotText translationKey="cart.back_to_agency" defaultText="Verder casten" />
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
                  <VoiceglotText translationKey="cart.info.title" defaultText="Productie & Levering" />
                </h4>
                <p className="text-[15px] text-va-black/40 font-light leading-relaxed">
                  <VoiceglotText translationKey="cart.info.desc" defaultText="Zodra je de bestelling afrondt, ontvangen de stemacteurs direct je briefing. De meeste opnames worden binnen 24 uur geleverd." />
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
                  href="/checkout"
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
                <Image src="/assets/common/branding/payment/mollie.svg" width={60} height={20} alt="Mollie" className="grayscale opacity-50" priority />
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
