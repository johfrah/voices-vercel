"use client";

import { ArrowLeft } from "lucide-react";
import {
    ButtonInstrument,
    ContainerInstrument,
    SectionInstrument,
} from "@/components/ui/LayoutInstruments";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslation } from "@/contexts/TranslationContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ConfiguratorPageClient from "../../checkout/configurator/ConfiguratorPageClient";

export function VoiceDetailClient({ actor }: { actor: any }) {
  const { t } = useTranslation();
  const { selectActor } = useCheckout();
  const router = useRouter();

  // Sync with checkout context on mount and when actor changes
  useEffect(() => {
    selectActor(actor);
    return () => selectActor(null); // Cleanup on unmount
  }, [actor, selectActor]);

  return (
    <ContainerInstrument className="max-w-7xl mx-auto px-6 pt-10 pb-20 relative z-10">
      {/*  SUZY'S SCHEMA INJECTION: VoiceActor Knowledge Graph & Breadcrumbs */}
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
      {/*  HET MAAKPROCES: Direct naar de 3-koloms configurator */}
      <SectionInstrument id="order-engine" className="mb-20">
        <ConfiguratorPageClient isEmbedded={true} />
      </SectionInstrument>

      {/*  REVIEWS */}
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
