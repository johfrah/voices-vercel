"use client";

import { ArrowLeft } from "lucide-react";
import {
    ContainerInstrument,
    HeadingInstrument,
    SectionInstrument,
    TextInstrument,
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMasterControl } from "@/contexts/VoicesMasterControlContext";
import { VoiceCard } from "@/components/ui/VoiceCard";
import { VoicesMasterControl } from "@/components/ui/VoicesMasterControl";
import Link from "next/link";
import { useEffect, Suspense, useState } from 'react';
import dynamic from "next/dynamic";

//  NUCLEAR LOADING MANDATE
const ReviewsInstrument = dynamic(() => import("@/components/ui/ReviewsInstrument").then(mod => mod.ReviewsInstrument), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-va-black/5 animate-pulse rounded-[40px]" />
});

import ConfiguratorPageClient from "@/app/checkout/configurator/ConfiguratorPageClient";

export function VoiceDetailClient({ 
  actor, 
  initialJourney, 
  initialMedium 
}: { 
  actor: any, 
  initialJourney?: string, 
  initialMedium?: string 
}) {
  const { t } = useTranslation();
  const [dynamicConfig, setDynamicConfig] = useState<{ languages: any[], genders: any[], journeys: any[], mediaTypes: any[], countries: any[] } | null>(null);

  useEffect(() => {
    // 🛡️ CHRIS-PROTOCOL: Handshake Truth Priming (v2.14.714)
    Promise.all([
      fetch('/api/admin/config?type=languages').then(res => res.json()),
      fetch('/api/admin/config?type=genders').then(res => res.json()),
      fetch('/api/admin/config?type=journeys').then(res => res.json()),
      fetch('/api/admin/config?type=media_types').then(res => res.json()),
      fetch('/api/admin/config?type=countries').then(res => res.json())
    ]).then(([langs, genders, journeys, mediaTypes, countries]) => {
      setDynamicConfig({
        languages: langs.results || [],
        genders: genders.results || [],
        journeys: journeys.results || [],
        mediaTypes: mediaTypes.results || [],
        countries: countries.results || []
      });
    });
  }, []);

  const { selectActor, updateUsage, updateMedia, updateBriefing } = useCheckout();
  const { updateJourney } = useMasterControl();

  // Sync with checkout context on mount and when actor changes
  useEffect(() => {
    selectActor(actor);
    
    //  BOB-METHODE: URL-gebaseerde configuratie sync
    const syncFromUrl = async () => {
      // 1. Check voor Token (Deep Persistence)
      if (typeof window === 'undefined') return;
      
      const params = new URLSearchParams(window.location.search);
      const token = params.get('t');
      
      if (token) {
        try {
          const res = await fetch(`/api/config/token?t=${token}`);
          if (res.ok) {
            const data = await res.json();
            if (data.briefing) updateBriefing(data.briefing);
            if (data.usage) {
              const usageToId: Record<string, number> = {
                'telephony': 26,
                'unpaid': 27,
                'commercial': 28,
                'paid': 28
              };
              updateUsage(data.usage, usageToId[data.usage]);
            }
            if (data.media) {
              const mediaRegistry = (typeof window !== 'undefined' ? (window as any).handshakeMediaTypes : []) || [];
              const mediaIds = data.media.map((m: string) => mediaRegistry.find((o: any) => o.code === m)?.id).filter(Boolean);
              updateMedia(data.media, mediaIds);
            }
            // Voeg hier meer sync toe indien nodig
            return; // Token heeft prioriteit over segmenten
          }
        } catch (e) {
          console.error("Token sync failed:", e);
        }
      }

    // Fallback naar Segmenten (Mooie URL's)
    // CHRIS-PROTOCOL: De slug (segment 1) is onvertaalbaar (ID/Naam).
    // Segment 2 (Journey) en Segment 3 (Medium) zijn WEL vertaalbaar via Voiceglot mapping.
    const journeyMap: Record<string, any> = {
      // Nederlands
      'telefoon': 'telephony',
      'telefooncentrale': 'telephony',
      'telephony': 'telephony',
      'video': 'video',
      'commercial': 'commercial',
      'reclame': 'commercial',
      // Engels (Voiceglot fallback)
      'phone': 'telephony',
      'ad': 'commercial',
      'advertisement': 'commercial'
    };

    const mappedJourney = initialJourney ? (journeyMap[initialJourney.toLowerCase()] || initialJourney) : 'video';
    const journeyIdMap: Record<string, number> = {
      'telephony': 26,
      'video': 27,
      'commercial': 28
    };
    
    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (ID-First)
    // We resolve the journey string to its official database ID if possible.
    const journeyRegistry = (typeof window !== 'undefined' ? (window as any).handshakeJourneys : []) || [];
    const journeyMatch = journeyRegistry.find((j: any) => j.code === mappedJourney || j.label.toLowerCase() === mappedJourney.toLowerCase());
    const finalJourney = journeyMatch ? journeyMatch.code : mappedJourney;
    const finalJourneyId = journeyMatch ? journeyMatch.id : journeyIdMap[finalJourney];

    // BOB-METHODE: Update zowel de MasterControl (voor filters/UI) als de Checkout (voor prijs)
    updateJourney(finalJourney as any);
    updateUsage(finalJourney === 'commercial' ? 'commercial' : (finalJourney === 'telephony' ? 'telefonie' : 'unpaid'), finalJourneyId);
    
    if (finalJourney === 'commercial' && initialMedium) {
      const mediumMap: Record<string, string> = {
        // Nederlands
        'online': 'online',
        'social': 'online',
        'radio': 'radio_national',
        'tv': 'tv_national',
        'televisie': 'tv_national',
        'podcast': 'podcast',
        // Engels
        'web': 'online',
        'television': 'tv_national'
      };
      const mediumCode = initialMedium.toLowerCase();
      const mediumType = mediumMap[mediumCode] || mediumCode;
      
      // 🛡️ CHRIS-PROTOCOL: Media Handshake
      const mediaRegistry = (typeof window !== 'undefined' ? (window as any).handshakeMediaTypes : []) || [];
      const mediaMatch = mediaRegistry.find((m: any) => m.code === mediumType || m.label.toLowerCase() === mediumType.toLowerCase());
      
      if (mediaMatch) {
        updateMedia([mediaMatch.code], [mediaMatch.id]);
      } else if (mediumType) {
        updateMedia([mediumType]);
      }
    } else if (finalJourney === 'commercial') {
      // Reset media for non-commercial journeys to ensure pricing works
      updateMedia(['online'], [5]);
    }

    };

    syncFromUrl();

    // 🛡️ CHRIS-PROTOCOL: No cleanup here to prevent race conditions during hydration
  }, [actor, initialJourney, initialMedium, selectActor, updateUsage, updateMedia, updateBriefing, updateJourney]);

  const actorPath = actor?.slug ? `/${actor.slug}` : '/agency';
  const primaryLanguage = actor?.native_lang_label || actor?.native_lang || 'Niet opgegeven';
  const extraLanguages = actor?.extra_langs
    ? actor.extra_langs.split(',').map((entry: string) => entry.trim()).filter(Boolean)
    : [];
  const deliveryWindow = actor?.delivery_days_min || actor?.delivery_days_max
    ? `${actor.delivery_days_min || 1}-${actor.delivery_days_max || actor.delivery_days_min || 1} dagen`
    : 'Niet opgegeven';
  const toneSummary = actor?.tone_of_voice
    ? actor.tone_of_voice.split(',').map((entry: string) => entry.trim()).filter(Boolean).slice(0, 4).join(', ')
    : 'Niet opgegeven';
  const startingPrice = actor?.starting_price || actor?.price_unpaid
    ? `€${Math.round(Number(actor.starting_price || actor.price_unpaid || 0))}`
    : 'Op aanvraag';
  const demoOverview = (actor?.demos || []).slice(0, 4);
  const useCaseLabels: Record<string, string> = {
    telephony: 'Telefonie',
    commercial: 'Commercial',
    video: 'Video',
    demo: 'Demo'
  };
  const knownAboutLanguages = actor?.languages?.map((entry: any) => entry?.name).filter(Boolean) || [];

  return (
    <ContainerInstrument className="max-w-[1440px] mx-auto px-4 md:px-6 pt-32 pb-20 relative z-10">
      <div className="mb-12">
        <Link  
          href="/agency" 
          className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-va-black/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowLeft size={14} strokeWidth={1.5} />
          </div>
          <VoiceglotText  translationKey="voice.detail.back_to_agency" defaultText="Terug naar alle stemmen" />
        </Link>
      </div>

      {/*  SUZY'S SCHEMA INJECTION: VoiceActor Knowledge Graph & Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Person",
              "@id": `${actorPath}#person`,
              "name": actor.display_name,
              "description": actor.bio || actor.description,
              "image": actor.photo_url || undefined,
              "jobTitle": t('common.job_title.voice_actor', "Voice-over Artist"),
              "gender": actor.gender,
              "url": actorPath,
              "knowsAbout": knownAboutLanguages.length > 0 ? knownAboutLanguages : (actor.native_lang ? [actor.native_lang] : [t('common.language.dutch', "Nederlands")]),
              "aggregateRating": actor.voice_score ? {
                "@type": "AggregateRating",
                "ratingValue": actor.voice_score,
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": String(actor.reviews?.length ?? 10)
              } : undefined,
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
                  "item": "/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Agency",
                  "item": "/agency"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": actor.display_name,
                  "item": actorPath
                }
              ]
            }
          ])
        }}
      />

      <SectionInstrument className="mb-10">
        <ContainerInstrument className="rounded-[28px] border border-va-black/10 bg-white/80 p-6 md:p-8">
          <HeadingInstrument level={1} className="text-3xl md:text-4xl font-extralight tracking-tight mb-3">
            <VoiceglotText translationKey={`actor.${actor?.id}.name`} defaultText={actor?.display_name || actor?.first_name || 'Voice-over stem'} noTranslate={true} />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/60 text-[15px] md:text-[16px] leading-relaxed mb-6">
            {actor?.tagline || actor?.bio || t('voice.detail.about.default_summary', 'Professionele stem met snelle levering en duidelijke briefing-flow.')}
          </TextInstrument>
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <ContainerInstrument className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4">
              <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/40 mb-1">Moedertaal</TextInstrument>
              <TextInstrument className="text-[14px] md:text-[15px] font-medium text-va-black">{primaryLanguage}</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4">
              <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/40 mb-1">Extra talen</TextInstrument>
              <TextInstrument className="text-[14px] md:text-[15px] font-medium text-va-black">{extraLanguages.length > 0 ? extraLanguages.join(', ') : 'Geen extra talen'}</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4">
              <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/40 mb-1">Levering</TextInstrument>
              <TextInstrument className="text-[14px] md:text-[15px] font-medium text-va-black">{deliveryWindow}</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4">
              <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/40 mb-1">Vanaf</TextInstrument>
              <TextInstrument className="text-[14px] md:text-[15px] font-medium text-va-black">{startingPrice}</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-va-black/55 text-[13px] md:text-[14px] leading-relaxed mt-4">
            <VoiceglotText translationKey="voice.detail.facts.tones" defaultText="Kern van de stem:" /> {toneSummary}
          </TextInstrument>
          <Link href="#order-engine" className="inline-flex mt-5 text-[12px] md:text-[13px] uppercase tracking-widest text-primary hover:opacity-70 transition-opacity">
            <VoiceglotText translationKey="voice.detail.jump_to_order" defaultText="Ga naar prijs en briefing" />
          </Link>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  HET MAAKPROCES: Direct naar de 3-koloms configurator */}
      <div id="order-engine" className="mb-20">
        {/*  BOB-METHODE: MasterControl integratie op stempagina */}
        <div className="mb-12">
          <VoicesMasterControl 
            actors={[actor]} 
            filters={{
              languages: actor.languages?.map((l: any) => l.name) || [],
              genders: [actor.gender],
              styles: actor.styles || []
            }} 
            languagesData={dynamicConfig?.languages}
            gendersData={dynamicConfig?.genders}
            journeysData={dynamicConfig?.journeys}
            mediaTypesData={dynamicConfig?.mediaTypes}
            countriesData={dynamicConfig?.countries}
          />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
          {/* Script & Prijs (9 kolommen breed) - EERST op mobiel */}
          <div className="order-1 lg:order-2 lg:col-span-9 w-full">
            <ConfiguratorPageClient 
              isEmbedded={true} 
              hideMediaSelector={false} 
              minimalMode={false} 
              hideVoiceCard={true}
              hideUsageSelector={true}
              hidePriceBlock={false}
            />
          </div>

          {/* VoiceCard (3 kolommen breed) - LATER op mobiel, compact */}
          <div className="order-2 lg:order-1 lg:col-span-3 w-full">
            <div className="lg:sticky lg:top-10">
              {actor && (
                <VoiceCard 
                  voice={actor} 
                  onSelect={() => {}} 
                  hideButton
                  hidePrice={true}
                  isCornered
                  compact={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <SectionInstrument className="mb-10">
        <ContainerInstrument className="rounded-[28px] border border-va-black/10 bg-white/80 p-6 md:p-8">
          <HeadingInstrument level={2} className="text-2xl md:text-3xl font-extralight tracking-tight mb-2">
            <VoiceglotText translationKey="voice.detail.use_cases.title" defaultText="Waar deze stem voor werkt" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/60 text-[14px] md:text-[15px] leading-relaxed mb-5">
            <VoiceglotText translationKey="voice.detail.use_cases.subtitle" defaultText="Kies een demo op basis van je kanaal. Zo hoor je sneller of de stem past." />
          </TextInstrument>
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {demoOverview.length > 0 ? demoOverview.map((demo: any) => (
              <ContainerInstrument key={demo.id} className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4">
                <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/40 mb-1">
                  {useCaseLabels[demo.category as keyof typeof useCaseLabels] || demo.category || 'Demo'}
                </TextInstrument>
                <TextInstrument className="text-[14px] md:text-[15px] font-medium text-va-black leading-snug">
                  {demo.title || demo.name}
                </TextInstrument>
              </ContainerInstrument>
            )) : (
              <ContainerInstrument className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4 md:col-span-2">
                <TextInstrument className="text-[14px] md:text-[15px] text-va-black/60">
                  <VoiceglotText translationKey="voice.detail.use_cases.no_demos" defaultText="Demo’s worden binnenkort aangevuld." />
                </TextInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="mb-12">
        <ContainerInstrument className="rounded-[28px] border border-va-black/10 bg-white/80 p-6 md:p-8">
          <HeadingInstrument level={2} className="text-2xl md:text-3xl font-extralight tracking-tight mb-2">
            <VoiceglotText translationKey="voice.detail.order_info.title" defaultText="Praktische afspraken" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/60 text-[14px] md:text-[15px] leading-relaxed mb-5">
            <VoiceglotText translationKey="voice.detail.order_info.subtitle" defaultText="Alles wat je nodig hebt om snel te beslissen en correct te bestellen." />
          </TextInstrument>
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ContainerInstrument className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4">
              <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/40 mb-1">Levertermijn</TextInstrument>
              <TextInstrument className="text-[14px] md:text-[15px] font-medium text-va-black">{deliveryWindow}</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4">
              <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/40 mb-1">Bestelflow</TextInstrument>
              <TextInstrument className="text-[14px] md:text-[15px] font-medium text-va-black">Kies stem → Script → Overzicht → Afrekenen</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4">
              <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/40 mb-1">Contact</TextInstrument>
              <Link href="/agency/contact" className="text-[14px] md:text-[15px] font-medium text-primary hover:opacity-70 transition-opacity">
                <VoiceglotText translationKey="voice.detail.order_info.contact_cta" defaultText="Vraag advies via de Agency foyer" />
              </Link>
            </ContainerInstrument>
            <ContainerInstrument className="rounded-[18px] border border-va-black/5 bg-va-off-white p-4">
              <TextInstrument className="text-[11px] uppercase tracking-widest text-va-black/40 mb-1">Gebruik</TextInstrument>
              <TextInstrument className="text-[14px] md:text-[15px] font-medium text-va-black">
                {(actor?.demos || []).length > 0 ? 'Telefonie, video en commercial mogelijk' : 'Gebruik wordt per project afgestemd'}
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  REVIEWS */}
      {actor.reviews && actor.reviews.length > 0 && (
        <Suspense fallback={null}>
          <ReviewsInstrument 
            reviews={actor.reviews} 
            title={`${t('voice.reviews.title_prefix', 'Ervaringen met')} ${actor.display_name}`}
            subtitle={`${t('voice.reviews.subtitle_prefix', 'Lees waarom klanten kiezen voor het vakmanschap van')} ${actor.display_name}.`}
          />
        </Suspense>
      )}
    </ContainerInstrument>
  );
}
