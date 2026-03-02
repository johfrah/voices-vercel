"use client";

import React from "react";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { useVoicesRouter } from "@/components/ui/VoicesLink";

interface WorkshopHeroIslandProps {
  workshop: any;
}

/**
 * WORKSHOP HERO ISLAND (2026)
 *
 * The "Theater" entrance for a specific workshop.
 * 1. Video Player (Left): Aftermovie or Invitation.
 * 2. Content (Right): Expert Note, Price, CTA.
 * 
 * LAYA: Aura shadows, Raleway font, generous spacing.
 */
export const WorkshopHeroIsland: React.FC<WorkshopHeroIslandProps> = ({ workshop }) => {
  const { playClick } = useSonicDNA();
  const router = useVoicesRouter();
  const videoPath = workshop.featured_image?.file_path;
  const nextEdition = workshop.upcoming_editions?.[0];
  const price = nextEdition?.price || workshop.price || "0";

  const handleBookClick = () => {
    playClick('pro');
    
    //  CHRIS-PROTOCOL: Slimme Kassa Handshake (v2.16.053)
    // We redirect to the checkout with the specific editionId.
    // The CheckoutContext will handle the product mapping and Mollie initialization.
    if (nextEdition?.id) {
      router.push(`/checkout?journey=studio&editionId=${nextEdition.id}`);
    } else {
      // Fallback to interest form if no edition is available
      router.push(`/studio/doe-je-mee?workshopId=${workshop.id}`);
    }
  };

  return (
    <section className="relative pt-32 pb-24 bg-va-black text-white overflow-hidden">
      {/* Background Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

      <ContainerInstrument className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Video Player Island */}
          <div className="lg:col-span-7 relative group">
            <div className="absolute -inset-4 bg-primary/10 rounded-[30px] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            <VideoPlayer 
              src={`https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/${videoPath}`}
              className="w-full aspect-video rounded-[24px] shadow-2xl border border-white/10 relative z-10"
              autoPlay={false}
            />
          </div>

          {/* Right: Content Island */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase rounded-full border border-primary/20">
                  {workshop.taxonomy?.type || 'Workshop'}
                </span>
                <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase">
                  {workshop.taxonomy?.category}
                </span>
              </div>
              <HeadingInstrument level={1} className="text-5xl md:text-7xl font-light tracking-tighter leading-tight text-white">
                {workshop.title}
              </HeadingInstrument>
            </div>

            {workshop.expert_note && (
              <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/40">
                <TextInstrument className="text-xl md:text-2xl text-white/60 font-light italic leading-relaxed">
                  &ldquo;{workshop.expert_note}&rdquo;
                </TextInstrument>
              </div>
            )}

            <div className="w-full pt-10 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/30 mb-1">
                  Investering
                </TextInstrument>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-light tracking-tighter text-white">€{parseFloat(price).toFixed(2)}</span>
                  <span className="text-[11px] text-white/20 font-bold uppercase tracking-widest">Excl. BTW</span>
                </div>
              </div>

              <button
                onClick={handleBookClick}
                className="inline-flex items-center gap-4 px-10 py-5 bg-primary text-va-black rounded-[14px] font-bold tracking-[0.1em] hover:bg-white transition-all duration-500 shadow-aura-lg group/cta"
              >
                <ShoppingCart size={20} strokeWidth={2.5} />
                <span>RESERVEER PLEK</span>
                <ArrowRight size={18} strokeWidth={2} className="group-hover/cta:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </ContainerInstrument>
    </section>
  );
};
