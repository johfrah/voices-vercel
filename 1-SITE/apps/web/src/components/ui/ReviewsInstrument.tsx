"use client";

import { Star, Check } from "lucide-react";
import React from 'react';
import { BentoCard } from "./BentoGrid";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";
import { VoiceglotImage } from "./VoiceglotImage";
import { VoiceglotText } from "./VoiceglotText";

/**
 * REVIEWS INSTRUMENT
 */
export const ReviewsInstrument: React.FC<{ 
  reviews: any[], 
  title?: string, 
  subtitle?: string,
  translationKeyPrefix?: string,
  hideHeader?: boolean,
  averageRating?: string,
  totalReviews?: string
}> = ({ reviews, title, subtitle, translationKeyPrefix = "home.reviews", hideHeader = false, averageRating = "4.9", totalReviews = "1250" }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "itemReviewed": {
      "@type": "Organization",
      "name": "Voices",
      "url": "https://voices.be"
    },
    "ratingValue": averageRating,
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": totalReviews,
    "review": reviews.slice(0, 6).map((review) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.name || review.authorName
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating
      },
      "reviewBody": review.text || review.textNl || review.textEn || review.textFr || review.textDe || "Geweldige ervaring met deze stem!"
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
    <ContainerInstrument plain className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ContainerInstrument className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <ContainerInstrument plain className="space-y-4">
          {!hideHeader && (
            <>
              <HeadingInstrument level={2} className="text-5xl md:text-6xl font-light tracking-tighter text-va-black">
                <VoiceglotText  translationKey={`${translationKeyPrefix}.title`} defaultText={title || "Ervaringen."} />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-va-black/60 font-medium leading-relaxed max-w-2xl">
                <VoiceglotText  translationKey={`${translationKeyPrefix}.subtitle`} defaultText={subtitle || "Waarom klanten kiezen voor de stemmen van Voices."} />
              </TextInstrument>
            </>
          )}
        </ContainerInstrument>
        
        <ContainerInstrument plain className="flex flex-col items-start md:items-end gap-3">
          <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-full border border-black/5 shadow-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-[#fabc05]" fill="currentColor" />
              ))}
            </div>
                  <TextInstrument className="text-[15px] font-bold text-va-black">
                    {averageRating} <span className="text-va-black/40 font-medium ml-1">/ 5</span>
                  </TextInstrument>
                </div>
                <div className="flex flex-col items-start md:items-end gap-1">
                  <a 
                    href="https://www.google.com/search?q=voices.be+reviews" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[13px] font-bold text-primary hover:underline tracking-widest uppercase flex items-center gap-2"
                  >
                    <VoiceglotText translationKey="home.reviews.google_link" defaultText="Bekijk alle reviews op Google" />
                    <span className="px-2 py-0.5 bg-primary/10 rounded text-[10px]">{totalReviews}+</span>
                  </a>
                  <p className="text-[11px] font-medium text-va-black/30 uppercase tracking-widest">
                    <VoiceglotText translationKey="home.reviews.verified_customer" defaultText="Geverifieerde klanten" />
                  </p>
                </div>
              </ContainerInstrument>
      </ContainerInstrument>

      <ContainerInstrument plain className="flex overflow-x-auto pb-12 -mx-6 px-6 snap-x snap-mandatory no-scrollbar gap-8">
        {reviews.map((review: any, i: number) => (
          <div key={i} className="min-w-[320px] md:min-w-[400px] snap-center">
            <BentoCard span="sm" className="bg-white border border-black/5 p-10 flex flex-col justify-between h-full shadow-sm hover:shadow-aura transition-all duration-500 rounded-[32px]">
              <ContainerInstrument plain className="space-y-8">
                <ContainerInstrument plain className="flex justify-between items-start">
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-[#fabc05]" fill="currentColor" />
                    ))}
                  </div>
                  <div className="w-10 h-10 bg-va-off-white rounded-full flex items-center justify-center border border-black/5">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#4285F4] fill-current">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                </ContainerInstrument>
                <TextInstrument className="text-[17px] font-medium leading-relaxed text-va-black italic">
                  &quot;
                  <VoiceglotText 
                    translationKey={`${translationKeyPrefix}.review.${i}.text`} 
                    defaultText={review.text || review.textNl || review.textEn || review.textFr || review.textDe || "Geweldige ervaring met deze stem!"} 
                  />
                  &quot;
                </TextInstrument>
              </ContainerInstrument>
              
              <ContainerInstrument plain className="mt-10 pt-8 border-t border-black/5 flex items-center gap-5">
                <div className="relative">
                  <ContainerInstrument plain className="w-14 h-14 rounded-full bg-va-off-white flex items-center justify-center font-bold text-va-black/40 text-lg border border-black/5 overflow-hidden relative">
                    {review.authorPhoto ? (
                      <VoiceglotImage 
                        src={review.authorPhoto} 
                        alt={review.name || review.authorName} 
                        fill
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      (review.name || review.authorName || "V").charAt(0)
                    )}
                  </ContainerInstrument>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-black/5">
                    <Check size={12} className="text-green-500" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <HeadingInstrument level={5} className="text-[16px] font-bold tracking-tight text-va-black">
                    {review.authorUrl ? (
                      <a href={review.authorUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        <VoiceglotText  translationKey={`${translationKeyPrefix}.reviewer.${i}`} defaultText={review.name || review.authorName} noTranslate={true} />
                      </a>
                    ) : (
                      <VoiceglotText  translationKey={`${translationKeyPrefix}.reviewer.${i}`} defaultText={review.name || review.authorName} noTranslate={true} />
                    )}
                  </HeadingInstrument>
                  <TextInstrument className="text-[13px] font-medium text-va-black/40 mt-0.5">
                    {review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString('nl-BE') : '')}
                  </TextInstrument>
                </div>
              </ContainerInstrument>
            </BentoCard>
          </div>
        ))}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
