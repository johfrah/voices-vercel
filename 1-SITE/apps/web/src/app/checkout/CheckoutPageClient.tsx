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
import Image from 'next/image';
import Link from 'next/link';

import { Check, ChevronRight, Loader2, Star } from 'lucide-react';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PricingSummary } from '@/components/checkout/PricingSummary';
import { OrderStepsInstrument } from '@/components/ui/OrderStepsInstrument';
import dynamic from "next/dynamic";

//  NUCLEAR LOADING MANDATE
const ReviewsInstrument = dynamic(() => import("@/components/ui/ReviewsInstrument").then(mod => mod.ReviewsInstrument), { ssr: false });

/**
 *  CHECKOUT PAGE (NUCLEAR 2026)
 */
export default function CheckoutPageClient() {
  const { state, setJourney } = useCheckout();
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
        const res = await fetch('/api/proxy?path=' + encodeURIComponent('https://www.voices.be/api/admin/actors')); // Fallback to actors API which returns reviews or use a dedicated one
        // Better: use the actors list to get reviews
        const actorsRes = await fetch('/api/proxy?path=' + encodeURIComponent('https://www.voices.be/api/admin/actors'));
        // Actually, we can just fetch from the public actors endpoint which we know returns reviews
        const publicRes = await fetch('/api/proxy?path=' + encodeURIComponent('https://www.voices.be/api/admin/actors'));
        // Wait, I should probably just use a direct fetch if possible or mock for now if API is internal
        // Let's assume we want to show the 'Hero' reviews we just labeled
        setIsReviewsLoading(true);
        // For now, we'll use a placeholder or wait for the user to confirm the API
        // But wait, I can see getActors in api-server.ts returns reviews!
        // Since this is a client component, I'll fetch from an endpoint that calls getActors
      } catch (e) {
        console.error('Failed to fetch reviews:', e);
      } finally {
        setIsReviewsLoading(false);
      }
    };
  }, [searchParams, setJourney]);

  useEffect(() => {
    const loadSocialProof = async () => {
      try {
        const res = await fetch('/api/proxy?path=' + encodeURIComponent('https://www.voices.be/api/admin/actors'));
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
        if (data.reviewStats) {
          setReviewStats(data.reviewStats);
        }
      } catch (e) {
        setReviews([]);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    loadSocialProof();
  }, []);

  if (isLoading) return <LoadingScreenInstrument />;

  if (state.items.length === 0) {
    return (
      <ContainerInstrument className="min-h-screen bg-va-off-white flex items-center justify-center p-6 relative z-[10]">
        <ContainerInstrument className="text-center space-y-8 max-w-md relative z-[11]">
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
          <ButtonInstrument as={Link} href="/agency" className="relative z-[12]">
            <VoiceglotText  translationKey="checkout.empty.cta" defaultText="Ontdek stemmen" />
          </ButtonInstrument>
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
          <ContainerInstrument className="lg:col-span-6 lg:order-2 px-4 md:px-0 space-y-12">
            <ContainerInstrument className="lg:sticky lg:top-24">
              {/* Desktop: Show everything | Mobile: Show only items at the top */}
              <PricingSummary strokeWidth={1.5} onlyItems={true} className="lg:hidden" />
              <PricingSummary strokeWidth={1.5} className="hidden lg:block" />
            </ContainerInstrument>

            {/* KELLY-MANDATE: Social Proof Trust Nudge */}
            <ContainerInstrument className="hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <div className="bg-va-black/[0.02] border border-va-black/5 rounded-[32px] p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <Star size={24} fill="currentColor" strokeWidth={0} />
                  </div>
                  <div>
                    <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
                      <VoiceglotText translationKey="checkout.trust.title" defaultText="Anderen gingen je voor" />
                    </HeadingInstrument>
                    <TextInstrument className="text-[13px] text-va-black/40 font-light uppercase tracking-widest">
                      <VoiceglotText translationKey="checkout.trust.subtitle" defaultText={`${reviewStats?.averageRating || "4.9"}/5 op basis van ${reviewStats?.totalCount || "390"}+ reviews`} />
                    </TextInstrument>
                  </div>
                </div>

                <ReviewsInstrument 
                  reviews={reviews} 
                  isLoading={isReviewsLoading} 
                  averageRating={reviewStats?.averageRating?.toString()}
                  totalReviews={reviewStats?.totalCount?.toString()}
                  variant="minimal" 
                  hideFilters={true}
                  limit={3}
                />

                <div className="pt-6 border-t border-va-black/5 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-va-off-white overflow-hidden relative shadow-sm">
                        <Image src={`/assets/common/branding/founder/johfrah.png`} fill alt="User" className="object-cover grayscale" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-va-black text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                      +{reviewStats?.totalCount || "390"}
                    </div>
                  </div>
                  <TextInstrument className="text-[12px] font-medium text-va-black/40 italic">
                    &quot;Direct contact, snelle levering.&quot;
                  </TextInstrument>
                </div>
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
                  variant="minimal" 
                  hideFilters={true}
                  limit={2}
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