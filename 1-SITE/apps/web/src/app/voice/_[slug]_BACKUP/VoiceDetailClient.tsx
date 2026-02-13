"use client";

import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { PricingCalculator } from "@/components/ui/PricingCalculator";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useCheckout } from "@/contexts/CheckoutContext";
import { ArrowLeft, Heart, Mic, Music, Play, Share2, Star, Video as VideoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from 'react';

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
    <ContainerInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-12 flex items-center justify-between">
        <Link strokeWidth={1.5} 
          href="/agency" 
          className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-all"
        >
          <ArrowLeft strokeWidth={1.5} size={14} /> 
          <VoiceglotText strokeWidth={1.5} translationKey="artist.back_to_artists" defaultText="Terug naar alle stemmen" / />
        </Link>
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Heart strokeWidth={1.5} size={18} / />
          </ButtonInstrument>
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Share2 strokeWidth={1.5} size={18} / />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid strokeWidth={1.5} className="mb-20">
        <BentoCard span="sm" className="!p-0 overflow-hidden bg-white shadow-aura">
          <ContainerInstrument className="aspect-[4/5] relative">
            <Image  
              src={actor.photo_url || '/placeholder-artist.jpg'} 
              alt={actor.display_name} 
              fill
              className="object-cover"
            / />
            <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/80 via-transparent to-transparent" />
            <ContainerInstrument className="absolute bottom-8 left-8 right-8">
              <HeadingInstrument level={1} className="text-3xl font-black text-white tracking-tighter mb-2"><VoiceglotText strokeWidth={1.5} 
                  translationKey={`actor.${actor.id}.name`} 
                  defaultText={actor.display_name} 
                  noTranslate={true} 
                / /></HeadingInstrument>
              <ContainerInstrument className="flex items-center gap-2">
                <ContainerInstrument className="px-3 py-1 bg-primary rounded-full text-[15px] font-black text-white tracking-widest"><VoiceglotText strokeWidth={1.5} translationKey="common.craftsman" defaultText="Vakman" / /></ContainerInstrument>
                <ContainerInstrument className="flex items-center gap-1 text-white/60 text-[15px] font-bold tracking-widest">
                  <Star strokeWidth={1.5} size={10} className="text-primary" fill="currentColor" /> 
                  {actor.voice_score}
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        <BentoCard span="xl" className="bg-va-off-white/50 backdrop-blur-md border-white/20 shadow-aura p-12">
          <ContainerInstrument className="flex justify-between items-center mb-12">
            <HeadingInstrument level={2} className="text-3xl font-black tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="common.portfolio" defaultText="Portfolio" / /> & <TextInstrument as="span" className="text-primary font-light"><VoiceglotText strokeWidth={1.5} translationKey="common.demos" defaultText="Demos" / /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actor.demos?.map((demo: any, i: number) => (
              <ContainerInstrument 
                key={i}
                className="group p-6 rounded-[24px] bg-white border border-black/5 hover:border-primary/20 transition-all flex items-center justify-between cursor-pointer"
              >
                <ContainerInstrument className="flex items-center gap-4">
                  <ContainerInstrument className="w-12 h-12 rounded-xl bg-va-off-white flex items-center justify-center text-va-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Play strokeWidth={1.5} size={20} fill="currentColor" className="ml-1" / />
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={4} className="font-black tracking-tight text-[15px]"><VoiceglotText strokeWidth={1.5} translationKey={`actor.${actor.id}.demo.${i}.title`} defaultText={demo.title} / /></HeadingInstrument>
                    <TextInstrument className="text-[15px] font-black text-va-black/20 tracking-widest"><VoiceglotText strokeWidth={1.5} translationKey={`common.category.${demo.category?.toLowerCase()}`} defaultText={demo.category} / /></TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>

      {/* 🚀 DYNAMIC CONTENT FOR TOP VOICES */}
      {(hasCustomVideo || hasCustomReels) && (
        <SectionInstrument className="mb-20">
          <HeadingInstrument level={2} className="text-4xl font-black tracking-tight mb-12">
            {hasCustomVideo ? <VoiceglotText strokeWidth={1.5} translationKey="common.in_action" defaultText="In Actie" / /> : <VoiceglotText strokeWidth={1.5} translationKey="common.brand_reels" defaultText="Brand Reels" / />}
          </HeadingInstrument>
          <BentoGrid strokeWidth={1.5} columns={3}>
            {hasCustomVideo && (
              <BentoCard span="full" className="aspect-video bg-black rounded-[40px] overflow-hidden relative group">
                <ContainerInstrument className="absolute inset-0 flex items-center justify-center bg-va-black/40">
                  <VideoIcon strokeWidth={1.5} size={48} className="text-white/20" / />
                </ContainerInstrument>
                <ContainerInstrument className="absolute bottom-8 left-8">
                  <p className="text-white font-black tracking-widest text-[15px]">
                    <VoiceglotText strokeWidth={1.5} translationKey={`actor.${actor.id}.custom_video_label`} defaultText={`${actor.first_name} voor Hornbach`} / />
                  </p>
                </ContainerInstrument>
              </BentoCard>
            )}
            {hasCustomReels && (
              <>
                <BentoCard className="bg-white p-8 border border-black/5 shadow-sm">
                  <Music strokeWidth={1.5} className="text-primary mb-4" / />
                  <p className="font-black tracking-tight text-[15px]"><VoiceglotText strokeWidth={1.5} translationKey="auto.voicedetailclient.tesla_navigation.b45eba" defaultText="Tesla Navigation" / /></p>
                  <p className="text-[15px] text-va-black/40 mt-2">
                    <VoiceglotText strokeWidth={1.5} translationKey="common.tesla_desc" defaultText="De stem van autoriteit en rust." / />
                  </p>
                </BentoCard>
                <BentoCard className="bg-white p-8 border border-black/5 shadow-sm">
                  <Music strokeWidth={1.5} className="text-primary mb-4" / />
                  <p className="font-black tracking-tight text-[15px]"><VoiceglotText strokeWidth={1.5} translationKey="auto.voicedetailclient.samsung_global.8d9a4b" defaultText="Samsung Global" / /></p>
                  <p className="text-[15px] text-va-black/40 mt-2">
                    <VoiceglotText strokeWidth={1.5} translationKey="common.samsung_desc" defaultText="Technologische perfectie." / />
                  </p>
                </BentoCard>
              </>
            )}
          </BentoGrid>
        </SectionInstrument>
      )}

      {/* 💰 ORDER ENGINE: De Script Editor & Pricing Calculator */}
      <SectionInstrument className="mb-20">
        <ContainerInstrument className="bg-white rounded-[48px] shadow-aura border border-black/5 p-8 md:p-12">
          <ContainerInstrument className="mb-12">
            <h2 className="text-4xl font-black tracking-tight">
              <VoiceglotText strokeWidth={1.5} translationKey="common.order_direct" defaultText="Direct Bestellen" / />
            </h2>
            <p className="text-va-black/40 font-medium mt-2">
              <VoiceglotText strokeWidth={1.5} 
                translationKey="common.order_direct_desc" 
                defaultText={`Voer je script in of bereken je prijs voor ${actor.display_name}.`} 
              / />
            </p>
          </ContainerInstrument>
          
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContainerInstrument className="space-y-8">
              <ContainerInstrument className="space-y-4">
                <label className="text-[15px] font-black tracking-widest text-va-black/30"><VoiceglotText strokeWidth={1.5} translationKey="common.your_script" defaultText="1. Jouw Script" / /></label>
                <textarea 
                  value={localBriefing}
                  onChange={(e) => handleBriefingChange(e.target.value)}
                  placeholder="Plak hier je tekst..."
                  className="w-full h-64 bg-va-off-white border-none rounded-[32px] p-8 text-lg font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"
                />
              </ContainerInstrument>
              <ContainerInstrument className="p-6 bg-primary/5 rounded-[32px] border border-primary/10">
                <p className="text-[15px] font-bold text-primary flex items-center gap-2">
                  <Mic strokeWidth={1.5} size={12} / /> <VoiceglotText strokeWidth={1.5} translationKey="common.script_tip" defaultText="Tip: Gebruik (Titel) voor meerdere bestanden." / />
                </p>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <div>
              <label className="text-[15px] font-black tracking-widest text-va-black/30 block mb-4"><VoiceglotText strokeWidth={1.5} translationKey="common.config_price" defaultText="2. Configuratie & Prijs" / /></label>
              <PricingCalculator strokeWidth={1.5} mode="human" actor={actor} / />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 🌟 REVIEWS */}
      {actor.reviews && actor.reviews.length > 0 && (
        <ReviewsInstrument 
          reviews={actor.reviews} 
          title={`Ervaringen met ${actor.display_name}`}
          subtitle={`Lees waarom klanten kiezen voor het vakmanschap van ${actor.display_name}.`}
        />
      )}
    </ContainerInstrument>
  );
}
