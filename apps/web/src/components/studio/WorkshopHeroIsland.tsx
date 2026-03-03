"use client";

import React from "react";
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from "@/components/ui/LayoutInstruments";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { ArrowRight, ShoppingCart, Heart } from "lucide-react";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { useVoicesRouter } from "@/components/ui/VoicesLink";
import { useCheckout } from "@/contexts/CheckoutContext";

interface WorkshopHeroIslandProps {
  workshop: {
    id: number;
    title: string;
    price: number | string;
    expert_note?: string;
    featured_image?: { file_path: string; alt_text?: string } | null;
    taxonomy?: { type?: string; category?: string };
    upcoming_editions?: Array<{
      id: number;
      date: string;
      price?: number | null;
      location?: { city?: string } | null;
    }>;
  };
}

/**
 * WORKSHOP HERO ISLAND (2026)
 *
 * Twee modi:
 * - MET edition: "RESERVEER PLEK" → checkout met prijs
 * - ZONDER edition: "MELD JE AAN" → interest formulier
 */
export const WorkshopHeroIsland: React.FC<WorkshopHeroIslandProps> = ({ workshop }) => {
  const { playClick } = useSonicDNA();
  const router = useVoicesRouter();
  const { addItem, setJourney } = useCheckout();
  const videoPath = workshop.video?.file_path || workshop.featured_image?.file_path;
  const hasVideo = !!workshop.video?.file_path;
  const nextEdition = workshop.upcoming_editions?.[0];
  const hasEdition = !!nextEdition?.id;
  const price = nextEdition?.price || workshop.price || 0;
  const priceValue = typeof price === 'string' ? parseFloat(price) : price;

  const handleBookClick = () => {
    playClick('pro');
    
    if (hasEdition) {
      const workshopItem = {
        id: `workshop-${nextEdition!.id}-${Date.now()}`,
        type: 'workshop_edition' as const,
        name: workshop.title,
        price: priceValue,
        editionId: nextEdition!.id,
        date: nextEdition!.date,
        location: nextEdition!.location?.city || null,
        pricing: {
          total: priceValue,
          subtotal: priceValue
        }
      };
      addItem(workshopItem);
      setJourney('studio', nextEdition!.id);
      router.push(`/studio/checkout?journey=studio&editionId=${nextEdition!.id}`);
    } else {
      router.push(`/studio/doe-je-mee?workshopId=${workshop.id}`);
    }
  };

  return (
    <ContainerInstrument plain className="relative pt-32 pb-24 bg-va-black text-white overflow-hidden">
      <ContainerInstrument plain className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

      <ContainerInstrument className="max-w-7xl mx-auto px-6 relative z-10">
        <ContainerInstrument plain className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <ContainerInstrument plain className="lg:col-span-5 relative group flex justify-center">
            <ContainerInstrument plain className="absolute -inset-4 bg-primary/10 rounded-[30px] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            <ContainerInstrument plain className="relative z-10 w-full max-w-[360px] aspect-[9/16]">
              <VideoPlayer 
                src={`https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/${videoPath}`}
                className="w-full h-full object-cover rounded-[24px] shadow-2xl border border-white/10"
                autoPlay={true}
                muted={true}
              />
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument plain className="lg:col-span-7 flex flex-col items-start space-y-10">
            <ContainerInstrument plain className="space-y-4">
              <ContainerInstrument plain className="flex items-center gap-3">
                <TextInstrument as="span" className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase rounded-full border border-primary/20">
                  {workshop.taxonomy?.type || 'Workshop'}
                </TextInstrument>
                <TextInstrument as="span" className="text-white/30 text-[10px] font-bold tracking-widest uppercase">
                  {workshop.taxonomy?.category}
                </TextInstrument>
              </ContainerInstrument>
              <HeadingInstrument level={1} className="text-5xl md:text-7xl font-light tracking-tighter leading-tight text-white">
                {workshop.title}
              </HeadingInstrument>
            </ContainerInstrument>

            {workshop.expert_note && (
              <ContainerInstrument plain className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/40">
                <TextInstrument className="text-xl md:text-2xl text-white/60 font-light italic leading-relaxed">
                  &ldquo;{workshop.expert_note}&rdquo;
                </TextInstrument>
              </ContainerInstrument>
            )}

            <ContainerInstrument plain className="w-full pt-10 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              {hasEdition ? (
                <>
                  <ContainerInstrument plain>
                    <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/30 mb-1">
                      <VoiceglotText translationKey="studio.hero.investment" defaultText="Investering" />
                    </TextInstrument>
                    <ContainerInstrument plain className="flex items-baseline gap-2">
                      <TextInstrument as="span" className="text-4xl font-light tracking-tighter text-white">€{priceValue.toFixed(2)}</TextInstrument>
                      <TextInstrument as="span" className="text-[11px] text-white/20 font-bold uppercase tracking-widest">
                        <VoiceglotText translationKey="common.excl_btw" defaultText="Excl. BTW" />
                      </TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  <ButtonInstrument
                    onClick={handleBookClick}
                    className="inline-flex items-center gap-4 px-10 py-5 !bg-primary !text-va-black !rounded-[14px] font-bold tracking-[0.1em] hover:!bg-white transition-all duration-500 shadow-aura-lg group/cta"
                  >
                    <ShoppingCart size={20} strokeWidth={2.5} />
                    <VoiceglotText translationKey="studio.hero.cta_book" defaultText="Reserveer plek" />
                    <ArrowRight size={18} strokeWidth={2} className="group-hover/cta:translate-x-1 transition-transform" />
                  </ButtonInstrument>
                </>
              ) : (
                <>
                  <ContainerInstrument plain>
                    <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/30 mb-1">
                      <VoiceglotText translationKey="studio.hero.no_edition_label" defaultText="Binnenkort nieuwe data" />
                    </TextInstrument>
                    <ContainerInstrument plain className="flex items-baseline gap-2">
                      <TextInstrument as="span" className="text-4xl font-light tracking-tighter text-white">€{priceValue.toFixed(2)}</TextInstrument>
                      <TextInstrument as="span" className="text-[11px] text-white/20 font-bold uppercase tracking-widest">
                        <VoiceglotText translationKey="common.excl_btw" defaultText="Excl. BTW" />
                      </TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  <ButtonInstrument
                    onClick={handleBookClick}
                    className="inline-flex items-center gap-4 px-10 py-5 !bg-white !text-va-black !rounded-[14px] font-bold tracking-[0.1em] hover:!bg-primary transition-all duration-500 shadow-aura-lg group/cta"
                  >
                    <Heart size={20} strokeWidth={2.5} />
                    <VoiceglotText translationKey="studio.hero.cta_interest" defaultText="Meld je aan" />
                    <ArrowRight size={18} strokeWidth={2} className="group-hover/cta:translate-x-1 transition-transform" />
                  </ButtonInstrument>
                </>
              )}
            </ContainerInstrument>
          </ContainerInstrument>

        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
