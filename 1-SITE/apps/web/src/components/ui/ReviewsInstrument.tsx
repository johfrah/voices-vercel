"use client";

import { Star } from "lucide-react";
import React from 'react';
import { BentoCard } from "./BentoGrid";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";
import { VoiceglotText } from "./VoiceglotText";

/**
 * REVIEWS INSTRUMENT
 */
export const ReviewsInstrument: React.FC<{ 
  reviews: any[], 
  title?: string, 
  subtitle?: string,
  translationKeyPrefix?: string
}> = ({ reviews, title, subtitle, translationKeyPrefix = "home.reviews" }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "itemReviewed": {
      "@type": "Organization",
      "name": "Voices",
      "url": "https://voices.be"
    },
    "ratingValue": "4.9",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": reviews.length > 0 ? reviews.length : "150",
    "review": reviews.slice(0, 3).map((review) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating
      },
      "reviewBody": review.text
    })),
    "_llm_context": {
      "intent": "social_proof",
      "persona": "Musical Confidant",
      "capabilities": ["read_reviews", "verify_quality"],
      "lexicon": {
        "review": "Ervaring",
        "rating": "Score",
        "customer": "Partner"
      }
    }
  };

  if (reviews.length === 0) return null;

  return (
    <ContainerInstrument className="mb-24 md:mb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContainerInstrument className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
        <ContainerInstrument className="space-y-3 md:space-y-4">
          <HeadingInstrument level={2} className="text-3xl md:text-5xl font-light tracking-tighter text-primary">
            <VoiceglotText  translationKey={`${translationKeyPrefix}.title`} defaultText={title || "Ervaringen"} />
            <TextInstrument className="text-lg md:text-xl text-black/40 font-medium leading-relaxed max-w-2xl block mt-2">
              <VoiceglotText  translationKey={`${translationKeyPrefix}.subtitle`} defaultText={subtitle || "Waarom klanten kiezen voor de stemmen van Voices."} />
            </TextInstrument>
          </HeadingInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="flex gap-2">
          <ContainerInstrument className="px-4 md:px-6 py-2 md:py-3 bg-va-off-white rounded-full text-[15px] md:text-[15px] font-medium tracking-widest border border-black/5">
            <VoiceglotText  translationKey={`${translationKeyPrefix}.score`} defaultText="4.9 / 5 Gemiddelde Score" />
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {reviews.slice(0, 3).map((review: any, i: number) => (
          <BentoCard key={i} span="sm" className="bg-white border border-black/5 p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-aura transition-all">
            <ContainerInstrument className="space-y-4 md:space-y-6">
              <ContainerInstrument className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star strokeWidth={1.5} key={i} size={14} className="text-primary" fill="currentColor" />
                ))}
              </ContainerInstrument>
              <TextInstrument className="text-[15px] md:text-[15px] font-medium leading-relaxed text-va-black/70 italic">
                &quot;<VoiceglotText  translationKey={`${translationKeyPrefix}.review.${i}.text`} defaultText={review.text} />&quot;
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-black/5 flex items-center gap-3 md:gap-4">
              <ContainerInstrument className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-va-off-white flex items-center justify-center font-medium text-va-black/20 text-[15px] md:text-[15px]">
                {review.name.charAt(0)}
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={5} className="text-[15px] md:text-[15px] font-medium tracking-widest"><VoiceglotText  translationKey={`${translationKeyPrefix}.reviewer.${i}`} defaultText={review.name} noTranslate={true} /></HeadingInstrument>
                <TextInstrument className="text-[15px] md:text-[15px] font-light text-va-black/30 tracking-[0.1em] mt-0.5">{review.date}</TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </BentoCard>
        ))}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
