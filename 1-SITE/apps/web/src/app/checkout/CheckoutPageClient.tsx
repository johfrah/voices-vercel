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

import { ArrowLeft, Check, ChevronRight, Loader2, Star, Edit2, ShoppingCart } from 'lucide-react';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PricingSummary } from '@/components/checkout/PricingSummary';
import { OrderStepsInstrument } from '@/components/ui/OrderStepsInstrument';
import nextDynamic from "next/dynamic";

const LiquidBackground = nextDynamic(() => import('@/components/ui/LiquidBackgroundInstrument').then(mod => mod.LiquidBackground), { ssr: false });

//  NUCLEAR LOADING MANDATE
const ReviewsInstrument = nextDynamic(() => import("@/components/ui/ReviewsInstrument").then(mod => mod.ReviewsInstrument), { ssr: false });

/**
 *  CHECKOUT PAGE (NUCLEAR 2026)
 */
export default function CheckoutPageClient() {
  const { t } = useTranslation();
  const { state, setJourney, isHydrated } = useCheckout();
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [reviewStats, setReviewStats] = React.useState<{ averageRating: number, totalCount: number } | null>(null);
  const [isReviewsLoading, setIsReviewsLoading] = React.useState(true);
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

    // Fetch reviews for social proof
    const fetchReviews = async () => {
      try {
        setIsReviewsLoading(true);
        // We gebruiken de interne actors API die reviews en stats bevat
        const res = await fetch('/api/actors');
        const data = await res.json();
        
        if (data.reviews) {
          setReviews(data.reviews);
        }
        if (data.reviewStats) {
          setReviewStats(data.reviewStats);
        }
      } catch (e) {
        console.error('Failed to fetch reviews:', e);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [searchParams, setJourney]);

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
          <ButtonInstrument as={Link} href="/agency" className="relative z-[12]">
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
              href="/agency" 
              className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={1.5} className="opacity-40" /> 
              <VoiceglotText  translationKey="checkout.back_to_agency" defaultText="Verder casten" />
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
                <Link href="/cart" className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline">
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
                  <Link href="/cart" className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 hover:text-primary transition-colors flex items-center gap-1.5">
                    <Edit2 size={12} />
                    Aanpassen
                  </Link>
                </div>
                <PricingSummary strokeWidth={1.5} />

                {/* 🛡️ CHRIS-PROTOCOL: Social Proof minimized to prevent overlap (v2.15.014) */}
                <ContainerInstrument className="hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                  <div className="bg-va-black/[0.02] border border-va-black/5 rounded-[32px] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                          <Star size={20} fill="currentColor" strokeWidth={0} />
                        </div>
                        <div>
                          <HeadingInstrument level={3} className="text-lg font-light tracking-tight">
                            <VoiceglotText translationKey="checkout.trust.title" defaultText="Social Proof" />
                          </HeadingInstrument>
                          <TextInstrument className="text-[11px] text-va-black/40 font-bold uppercase tracking-widest">
                            {reviewStats?.averageRating || "4.9"}/5 sterren
                          </TextInstrument>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {[1,2,3].map(avatarIdx => (
                          <div key={avatarIdx} className="w-8 h-8 rounded-full border-2 border-white bg-va-off-white overflow-hidden relative shadow-sm">
                            <Image 
                              src={`/assets/common/placeholders/placeholder-voice.jpg`} 
                              fill 
                              sizes="32px"
                              alt="User" 
                              className="object-cover grayscale" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <ReviewsInstrument 
                      reviews={reviews} 
                      isLoading={isReviewsLoading} 
                      averageRating={reviewStats?.averageRating?.toString()}
                      totalReviews={reviewStats?.totalCount?.toString()}
                      variant="super-minimal" 
                      hideFilters={true}
                      limit={1}
                    />
                  </div>
                </ContainerInstrument>
              </div>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Form Area */}
          <ContainerInstrument className="lg:col-span-6 lg:order-1 px-4 md:px-0">
            <CheckoutForm strokeWidth={1.5} />
            
            {/* Mobile: Show totals and CTA at the very bottom, after the form */}
            <PricingSummary strokeWidth={1.5} onlyTotals={true} className="lg:hidden mt-12" />

            {/* Mobile Social Proof */}
            <ContainerInstrument className="lg:hidden mt-16 pb-12">
               <ReviewsInstrument 
                  reviews={reviews} 
                  isLoading={isReviewsLoading} 
                  averageRating={reviewStats?.averageRating?.toString()}
                  totalReviews={reviewStats?.totalCount?.toString()}
                  variant="super-minimal" 
                  hideFilters={true}
                  limit={5}
                />
            </ContainerInstrument>
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