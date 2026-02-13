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
import { useTranslation } from "@/contexts/TranslationContext";
import { 
  Loader2, 
  Mic,
  ArrowLeft,
  Play,
  X,
  Plus,
  ArrowRight,
  ChevronLeft,
  Clock,
  TrendingUp,
  Brain,
  MessageSquare,
  Sparkles,
  Search,
  LabelInstrument
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from 'react';

export function VoiceDetailClient({ actor }: { actor: any }) {
  const { t } = useTranslation();
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
  const hasCustomVideo = actor.first_name?.toLowerCase() === 'ilari';
  const hasCustomReels = actor.first_name?.toLowerCase() === 'johfrah';

  return (
    <ContainerInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      {/* 🕸️ SUZY'S SCHEMA INJECTION: VoiceActor Knowledge Graph & Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Person",
              "@id": `https://www.voices.be/voice/${actor.slug}#person`,
              "name": actor.display_name,
              "description": actor.bio || actor.description,
              "image": actor.photo_url || undefined,
              "jobTitle": "Voice-over Artist",
              "gender": actor.gender,
              "url": `https://www.voices.be/voice/${actor.slug}`,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://www.voices.be/voice/${actor.slug}`
              },
              "knowsAbout": actor.languages?.map((l: any) => l.name) || actor.native_lang ? [actor.native_lang] : ["Nederlands"],
              "memberOf": {
                "@type": "Organization",
                "name": "Voices",
                "url": "https://www.voices.be"
              },
              "worksFor": {
                "@type": "Organization",
                "name": "Voices",
                "url": "https://www.voices.be"
              },
              "sameAs": [
                actor.website,
                actor.website_url,
                actor.linkedin,
                actor.linkedin_url,
                actor.instagram_url
              ].filter(Boolean),
              "aggregateRating": actor.voice_score ? {
                "@type": "AggregateRating",
                "ratingValue": actor.voice_score,
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": String(actor.reviews?.length ?? 10)
              } : undefined,
              "offers": (() => {
                const hasOffers = actor.starting_price || actor.price_ivr || actor.price_online || actor.price_unpaid;
                if (!hasOffers) return undefined;
                const offers: any[] = [];
                const basePrice = parseFloat(String(actor.starting_price || actor.price_unpaid || 0));
                if (basePrice > 0) {
                  offers.push({
                    "@type": "Offer",
                    "priceCurrency": "EUR",
                    "price": basePrice,
                    "availability": "https://schema.org/InStock",
                    "seller": { "@type": "Organization", "name": "Voices", "url": "https://www.voices.be" }
                  });
                }
                const ivr = parseFloat(String(actor.price_ivr || 0));
                if (ivr > 0) {
                  offers.push({
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "IVR / Telefonie voice-over" },
                    "priceCurrency": "EUR",
                    "price": ivr,
                    "availability": "https://schema.org/InStock"
                  });
                }
                return offers.length > 0 ? offers : undefined;
              })(),
              "workExample": actor.demos?.length ? actor.demos.slice(0, 5).map((d: any) => ({
                "@type": "CreativeWork",
                "name": d.title || d.name
              })) : undefined
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.voices.be"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Agency",
                  "item": "https://www.voices.be/agency"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": actor.display_name,
                  "item": `https://www.voices.be/voice/${actor.slug}`
                }
              ]
            }
          ])
        }}
      />
      <SectionInstrument className="mb-12 flex items-center justify-between">
        <Link  
          href="/agency" 
          className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-all"
        >
          <ArrowLeft strokeWidth={1.5} size={14} /> 
          <VoiceglotText  translationKey="artist.back_to_artists" defaultText="Terug naar alle stemmen" />
        </Link>
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Image  src="/assets/common/branding/icons/FAVORITES.svg" width={18} height={18} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
          </ButtonInstrument>
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Image  src="/assets/common/branding/icons/FORWARD.svg" width={18} height={18} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid strokeWidth={1.5} className="mb-20">
        <BentoCard span="sm" className="!p-0 overflow-hidden bg-white shadow-aura">
          <ContainerInstrument className="aspect-[4/5] relative">
            <Image  
              src={actor.photo_url || '/assets/common/placeholders/placeholder-voice.jpg'} 
              alt={actor.display_name} 
              fill
              className="object-cover"
            />
            <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/80 via-transparent to-transparent" />
            <ContainerInstrument className="absolute bottom-8 left-8 right-8">
              <HeadingInstrument level={1} className="text-3xl font-light text-white tracking-tighter mb-2">
                <VoiceglotText  
                  translationKey={`actor.${actor.id}.name`} 
                  defaultText={actor.display_name} 
                  noTranslate={true} 
                />
              </HeadingInstrument>
              <ContainerInstrument className="flex items-center gap-2">
                <ContainerInstrument className="px-3 py-1 bg-primary rounded-full text-[15px] font-light text-white tracking-widest">
                  <VoiceglotText  translationKey="common.craftsman" defaultText="Vakman" />
                </ContainerInstrument>
                <ContainerInstrument className="flex items-center gap-1 text-white/60 text-[15px] font-light tracking-widest">
                  <Image  src="/assets/common/branding/icons/INFO.svg" width={10} height={10} alt="" className="brightness-0 invert" /> 
                  {actor.voice_score}
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        <BentoCard span="xl" className="bg-va-off-white/50 backdrop-blur-md border-white/20 shadow-aura p-12">
          <ContainerInstrument className="flex justify-between items-center mb-12">
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tight">
              <VoiceglotText  translationKey="common.portfolio" defaultText="Portfolio" /> & <TextInstrument as="span" className="text-primary font-light"><VoiceglotText  translationKey="common.demos" defaultText="Demos" /></TextInstrument>
            </HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actor.demos?.map((demo: any, i: number) => (
              <ContainerInstrument 
                key={i}
                className="group p-6 rounded-[20px] bg-white border border-black/5 hover:border-primary/20 transition-all flex items-center justify-between cursor-pointer"
              >
                <ContainerInstrument className="flex items-center gap-4">
                  <ContainerInstrument className="w-12 h-12 rounded-xl bg-va-off-white flex items-center justify-center text-va-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Image  src="/assets/common/branding/icons/PLAY.svg" width={20} height={20} alt="" className="group-hover:brightness-0 group-hover:invert ml-1" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={4} className="font-light tracking-tight text-[15px]">
                      <VoiceglotText  translationKey={`actor.${actor.id}.demo.${i}.title`} defaultText={demo.title} />
                    </HeadingInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[15px] font-light text-va-black/20 tracking-widest">
                  <VoiceglotText  translationKey={`common.category.${demo.category?.toLowerCase()}`} defaultText={demo.category} />
                </TextInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>

      {/* 🚀 DYNAMIC CONTENT FOR TOP VOICES */}
      {(hasCustomVideo || hasCustomReels) && (
        <SectionInstrument className="mb-20">
          <HeadingInstrument level={2} className="text-4xl font-light tracking-tight mb-12">
            {hasCustomVideo ? <VoiceglotText  translationKey="common.in_action" defaultText="In Actie" /> : <VoiceglotText  translationKey="common.brand_reels" defaultText="Brand Reels" />}
          </HeadingInstrument>
          <BentoGrid strokeWidth={1.5} columns={3}>
            {hasCustomVideo && (
              <BentoCard span="full" className="aspect-video bg-black rounded-[20px] overflow-hidden relative group">
                <ContainerInstrument className="absolute inset-0 flex items-center justify-center bg-va-black/40">
                  <Image  src="/assets/common/branding/icons/INFO.svg" width={48} height={48} alt="" className="opacity-20 brightness-0 invert" />
                </ContainerInstrument>
                <ContainerInstrument className="absolute bottom-8 left-8">
                  <p className="text-white font-light tracking-widest text-[15px]">
                    <VoiceglotText  translationKey={`actor.${actor.id}.custom_video_label`} defaultText={`${actor.first_name} voor Hornbach`} />
                  </p>
                </ContainerInstrument>
              </BentoCard>
            )}
            {hasCustomReels && (
              <>
                <BentoCard span="sm" className="bg-white p-8 border border-black/5 shadow-sm rounded-[20px]">
                  <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" className="mb-4" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
                  <p className="font-light tracking-tight text-[15px]"><VoiceglotText  translationKey="auto.voicedetailclient.tesla_navigation.b45eba" defaultText="Tesla Navigation" /></p>
                  <p className="text-[15px] text-va-black/40 mt-2 font-light">
                    <VoiceglotText  translationKey="common.tesla_desc" defaultText="De stem van autoriteit en rust." />
                  </p>
                </BentoCard>
                <BentoCard span="sm" className="bg-white p-8 border border-black/5 shadow-sm rounded-[20px]">
                  <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" className="mb-4" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
                  <p className="font-light tracking-tight text-[15px]"><VoiceglotText  translationKey="auto.voicedetailclient.samsung_global.8d9a4b" defaultText="Samsung Global" /></p>
                  <p className="text-[15px] text-va-black/40 mt-2 font-light">
                    <VoiceglotText  translationKey="common.samsung_desc" defaultText="Technologische perfectie." />
                  </p>
                </BentoCard>
              </>
            )}
          </BentoGrid>
        </SectionInstrument>
      )}

      {/* 💰 ORDER ENGINE: De Script Editor & Pricing Calculator */}
      <SectionInstrument className="mb-20">
        <ContainerInstrument className="bg-white rounded-[20px] shadow-aura border border-black/5 p-8 md:p-12">
          <ContainerInstrument className="mb-12">
            <HeadingInstrument level={2} className="text-4xl font-light tracking-tight">
              <VoiceglotText  translationKey="common.order_direct" defaultText="Direct Bestellen" />
            </HeadingInstrument>
            <p className="text-va-black/40 font-light mt-2">
              <VoiceglotText  
                translationKey="common.order_direct_desc" 
                defaultText={`Voer je script in of bereken je prijs voor ${actor.display_name}.`} 
              />
            </p>
          </ContainerInstrument>
          
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContainerInstrument className="space-y-8">
              <ContainerInstrument className="space-y-4">
                <label className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="common.your_script" defaultText="1. Jouw Script" /></label>
                <textarea 
                  value={localBriefing}
                  onChange={(e) => handleBriefingChange(e.target.value)}
                  placeholder={t('common.placeholder.script', 'Plak hier je tekst...')}
                  className="w-full h-64 bg-va-off-white border-none rounded-[20px] p-8 text-[15px] font-light focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"
                />
              </ContainerInstrument>
              <ContainerInstrument className="p-6 bg-primary/5 rounded-[20px] border border-primary/10">
                <TextInstrument className="text-[15px] font-light text-primary flex items-center gap-2">
                  <Mic strokeWidth={1.5} size={12} /> <VoiceglotText  translationKey="common.script_tip" defaultText="Tip: Gebruik (Titel) voor meerdere bestanden." />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument>
              <LabelInstrument className="text-[15px] font-light tracking-widest text-va-black/30 block mb-4"><VoiceglotText  translationKey="common.config_price" defaultText="2. Configuratie & Prijs" /></LabelInstrument>
              <PricingCalculator  mode="human" actor={actor} />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 🌟 REVIEWS */}
      {actor.reviews && actor.reviews.length > 0 && (
        <ReviewsInstrument 
          reviews={actor.reviews} 
          title={`${t('voice.reviews.title_prefix', 'Ervaringen met')} ${actor.display_name}`}
          subtitle={`${t('voice.reviews.subtitle_prefix', 'Lees waarom klanten kiezen voor het vakmanschap van')} ${actor.display_name}.`}
        />
      )}
    </ContainerInstrument>
  );
}
