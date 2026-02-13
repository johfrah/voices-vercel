"use client";

import React, { useEffect, useState } from 'react';
import { 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { ArrowLeft, Play, Star, Heart, Share2, Mic, ShieldCheck, Video as VideoIcon, Music } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { PricingCalculator } from "@/components/ui/PricingCalculator";
import { useCheckout } from "@/contexts/CheckoutContext";

export function VoiceDetailClient({ actor }: { actor: any }) {
  const { updateBriefing, selectActor, state } = useCheckout();
  const [localBriefing, setLocalBriefing] = useState(state.briefing);

  // Sync with checkout context on mount and when actor changes
  useEffect(() => {
    selectActor(actor);
    return () => selectActor(null); // Cleanup on unmount
  }, [actor, selectActor]);

  const handleBriefingChange = (val: string) => {
    setLocalBriefing(val);
    updateBriefing(val);

    // 🧠 INTENT LEARNING: Leer van wat de gebruiker typt (debounced)
    if (val.length > 20) {
      const timer = setTimeout(() => {
        fetch('/api/intelligence/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'briefing',
            content: val,
            path: window.location.pathname
          })
        }).catch(err => console.error('Learning failed:', err));
      }, 2000);
      return () => clearTimeout(timer);
    }
  };

  // Custom content mapping for top voices
  const hasCustomVideo = actor.first_name.toLowerCase() === 'ilari';
  const hasCustomReels = actor.first_name.toLowerCase() === 'johfrah';

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-12 flex items-center justify-between">
        <Link 
          href="/agency" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/40 hover:text-primary transition-all"
        >
          <ArrowLeft size={14} /> 
          <VoiceglotText translationKey="artist.back_to_artists" defaultText="Terug naar alle stemmen" />
        </Link>
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Heart size={18} />
          </ButtonInstrument>
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Share2 size={18} />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid className="mb-20">
        <BentoCard span="sm" className="!p-0 overflow-hidden bg-white shadow-aura">
          <ContainerInstrument className="aspect-[4/5] relative">
            <Image 
              src={actor.photo_url || '/placeholder-artist.jpg'} 
              alt={actor.display_name} 
              fill
              className="object-cover"
            />
            <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/80 via-transparent to-transparent" />
            <ContainerInstrument className="absolute bottom-8 left-8 right-8">
              <HeadingInstrument level={1} className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                <VoiceglotText 
                  translationKey={`actor.${actor.id}.name`} 
                  defaultText={actor.display_name} 
                  noTranslate={true} 
                />
              </HeadingInstrument>
              <ContainerInstrument className="flex items-center gap-2">
                <ContainerInstrument className="px-3 py-1 bg-primary rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                  <VoiceglotText translationKey="common.craftsman" defaultText="Vakman" />
                </ContainerInstrument>
                <ContainerInstrument className="flex items-center gap-1 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                  <Star size={10} className="text-primary" fill="currentColor" /> 
                  {actor.voice_score}
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        <BentoCard span="xl" className="bg-va-off-white/50 backdrop-blur-md border-white/20 shadow-aura p-12">
          <ContainerInstrument className="flex justify-between items-center mb-12">
            <HeadingInstrument level={2} className="text-3xl font-black uppercase tracking-tight">
              <VoiceglotText translationKey="common.portfolio" defaultText="Portfolio" /> & <TextInstrument as="span" className="text-primary"><VoiceglotText translationKey="common.demos" defaultText="Demos" /></TextInstrument>
            </HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actor.demos?.map((demo: any, i: number) => (
              <ContainerInstrument 
                key={i}
                className="group p-6 rounded-[24px] bg-white border border-black/5 hover:border-primary/20 transition-all flex items-center justify-between cursor-pointer"
              >
                <ContainerInstrument className="flex items-center gap-4">
                  <ContainerInstrument className="w-12 h-12 rounded-xl bg-va-off-white flex items-center justify-center text-va-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={4} className="font-black uppercase tracking-tight text-sm">
                      <VoiceglotText translationKey={`actor.${actor.id}.demo.${i}.title`} defaultText={demo.title} />
                    </HeadingInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[10px] font-black text-va-black/20 uppercase tracking-widest">
                  <VoiceglotText translationKey={`common.category.${demo.category?.toLowerCase()}`} defaultText={demo.category} />
                </TextInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>

      {/* 🚀 DYNAMIC CONTENT FOR TOP VOICES */}
      {(hasCustomVideo || hasCustomReels) && (
        <SectionInstrument className="mb-20">
          <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tight mb-12">
            {hasCustomVideo ? <VoiceglotText translationKey="common.in_action" defaultText="In Actie" /> : <VoiceglotText translationKey="common.brand_reels" defaultText="Brand Reels" />}
          </HeadingInstrument>
          <BentoGrid columns={3}>
            {hasCustomVideo && (
              <BentoCard span="full" className="aspect-video bg-black rounded-[40px] overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center bg-va-black/40">
                  <VideoIcon size={48} className="text-white/20" />
                </div>
                <div className="absolute bottom-8 left-8">
                  <p className="text-white font-black uppercase tracking-widest text-sm">
                    <VoiceglotText translationKey={`actor.${actor.id}.custom_video_label`} defaultText={`${actor.first_name} voor Hornbach`} />
                  </p>
                </div>
              </BentoCard>
            )}
            {hasCustomReels && (
              <>
                <BentoCard className="bg-white p-8 border border-black/5 shadow-sm">
                  <Music className="text-primary mb-4" />
                  <p className="font-black uppercase tracking-tight text-sm">Tesla Navigation</p>
                  <p className="text-xs text-va-black/40 mt-2">
                    <VoiceglotText translationKey="common.tesla_desc" defaultText="De stem van autoriteit en rust." />
                  </p>
                </BentoCard>
                <BentoCard className="bg-white p-8 border border-black/5 shadow-sm">
                  <Music className="text-primary mb-4" />
                  <p className="font-black uppercase tracking-tight text-sm">Samsung Global</p>
                  <p className="text-xs text-va-black/40 mt-2">
                    <VoiceglotText translationKey="common.samsung_desc" defaultText="Technologische perfectie." />
                  </p>
                </BentoCard>
              </>
            )}
          </BentoGrid>
        </SectionInstrument>
      )}

      {/* 💰 ORDER ENGINE: De Script Editor & Pricing Calculator */}
      <SectionInstrument className="mb-20">
        <div className="bg-white rounded-[48px] shadow-aura border border-black/5 p-8 md:p-12">
          <div className="mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tight">
              <VoiceglotText translationKey="common.order_direct" defaultText="Direct Bestellen" />
            </h2>
            <p className="text-va-black/40 font-medium mt-2">
              <VoiceglotText 
                translationKey="common.order_direct_desc" 
                defaultText={`Voer je script in of bereken je prijs voor ${actor.display_name}.`} 
              />
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-va-black/30">
                  <VoiceglotText translationKey="common.your_script" defaultText="1. Jouw Script" />
                </label>
                <textarea 
                  value={localBriefing}
                  onChange={(e) => handleBriefingChange(e.target.value)}
                  placeholder="Plak hier je tekst..."
                  className="w-full h-64 bg-va-off-white border-none rounded-[32px] p-8 text-lg font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"
                />
              </div>
              <div className="p-6 bg-primary/5 rounded-[32px] border border-primary/10">
                <p className="text-[10px] font-bold text-primary flex items-center gap-2">
                  <Mic size={12} /> <VoiceglotText translationKey="common.script_tip" defaultText="Tip: Gebruik (Titel) voor meerdere bestanden." />
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-va-black/30 block mb-4">
                <VoiceglotText translationKey="common.config_price" defaultText="2. Configuratie & Prijs" />
              </label>
              <PricingCalculator mode="human" actor={actor} />
            </div>
          </div>
        </div>
      </SectionInstrument>

      {/* 🌟 REVIEWS */}
      {actor.reviews && actor.reviews.length > 0 && (
        <ReviewsInstrument 
          reviews={actor.reviews} 
          title={`Ervaringen met ${actor.display_name}`}
          subtitle={`Lees waarom klanten kiezen voor het vakmanschap van ${actor.display_name}.`}
        />
      )}
    </div>
  );
}
