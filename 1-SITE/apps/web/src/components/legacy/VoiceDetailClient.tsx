"use client";

import { ArrowLeft } from "lucide-react";
import {
    ButtonInstrument,
    ContainerInstrument,
    SectionInstrument,
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMasterControl } from "@/contexts/VoicesMasterControlContext";
import { VoiceCard } from "@/components/ui/VoiceCard";
import { VoicesMasterControl } from "@/components/ui/VoicesMasterControl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";

//  NUCLEAR LOADING MANDATE
const ReviewsInstrument = dynamic(() => import("@/components/ui/ReviewsInstrument").then(mod => mod.ReviewsInstrument), { ssr: false });

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
  const { selectActor, updateUsage, updateMedia, updateBriefing } = useCheckout();
  const { updateJourney } = useMasterControl();
  const router = useRouter();

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
            if (data.usage) updateUsage(data.usage);
            if (data.media) updateMedia(data.media);
            // Voeg hier meer sync toe indien nodig
            return; // Token heeft prioriteit over segmenten
          }
        } catch (e) {
          console.error("Token sync failed:", e);
        }
      }

      // 2. Fallback naar Segmenten (Mooie URL's)
      // CHRIS-PROTOCOL: De slug (segment 1) is onvertaalbaar (ID/Naam).
      // Segment 2 (Journey) en Segment 3 (Medium) zijn WEL vertaalbaar via Voiceglot mapping.
      if (initialJourney) {
        const journeyMap: Record<string, any> = {
          // Nederlands
          'telefoon': 'telephony',
          'telefooncentrale': 'telephony',
          'telephony': 'telephony',
          'video': 'video',
          'commercial': 'commercial',
          'reclame': 'commercial',
          // Engels (Voiceglot fallback)
          'telephony': 'telephony',
          'phone': 'telephony',
          'ad': 'commercial',
          'advertisement': 'commercial'
        };
        const mappedJourney = journeyMap[initialJourney.toLowerCase()] || initialJourney;
        
        if (mappedJourney) {
          // BOB-METHODE: Update zowel de MasterControl (voor filters/UI) als de Checkout (voor prijs)
          updateJourney(mappedJourney as any);
          
          if (mappedJourney === 'commercial' && initialMedium) {
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
            const mediaType = mediumMap[initialMedium.toLowerCase()];
            if (mediaType) {
              updateMedia([mediaType]);
            }
          }
        }
      }
    };

    syncFromUrl();

    return () => selectActor(null); // Cleanup on unmount
  }, [actor, initialJourney, initialMedium, selectActor, updateUsage, updateMedia, updateBriefing, updateJourney]);

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
          __html: (() => {
            const { MarketManagerServer: MarketManager } = require('@/lib/system/market-manager-server');
            const market = MarketManager.getCurrentMarket();
            const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://www.voices.be`;
            
            return JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                "@id": `${siteUrl}/voice/${actor.slug}#person`,
                "name": actor.display_name,
                "description": actor.bio || actor.description,
                "image": actor.photo_url || undefined,
                "jobTitle": t('common.job_title.voice_actor', "Voice-over Artist"),
                "gender": actor.gender,
                "url": `${siteUrl}/voice/${actor.slug}`,
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `${siteUrl}/voice/${actor.slug}`
                },
                "knowsAbout": actor.languages?.map((l: any) => l.name) || actor.native_lang ? [actor.native_lang] : [t('common.language.dutch', "Nederlands")],
                "memberOf": {
                  "@type": "Organization",
                  "name": market.company_name,
                  "url": siteUrl
                },
                "worksFor": {
                  "@type": "Organization",
                  "name": market.company_name,
                  "url": siteUrl
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
                      "seller": { "@type": "Organization", "name": market.company_name, "url": siteUrl }
                    });
                  }
                  const ivr = parseFloat(String(actor.price_ivr || 0));
                  if (ivr > 0) {
                    offers.push({
                      "@type": "Offer",
                      "itemOffered": { "@type": "Service", "name": "IVR / Telefonie voice-over" },
                      "priceCurrency": "EUR",
                      "price": ivr,
                      "availability": "https://schema.org/InStock",
                      "seller": { "@type": "Organization", "name": market.company_name, "url": siteUrl }
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
                    "item": siteUrl
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Agency",
                    "item": `${siteUrl}/agency`
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": actor.display_name,
                    "item": `${siteUrl}/voice/${actor.slug}`
                  }
                ]
              }
            ]);
          })()
        }}
      />
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
