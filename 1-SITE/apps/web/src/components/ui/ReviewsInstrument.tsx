"use client";

import { Star, Check, ChevronLeft, ChevronRight, Quote, Search as SearchIcon, X, Eye, EyeOff, Anchor, Pin, Trash2, Tag } from "lucide-react";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BentoCard } from "./BentoGrid";
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from "./LayoutInstruments";
import { VoiceglotImage } from "./VoiceglotImage";
import { VoiceglotText } from "./VoiceglotText";
import { cn } from "@/lib/utils";
import { useEditMode } from "@/contexts/EditModeContext";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import toast from "react-hot-toast";

import { useTranslation } from "@/contexts/TranslationContext";
import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";

/**
 * REVIEWS SKELETON (MOBY-STANDARD 2026)
 * Voorkomt layout shifts tijdens het laden van social proof.
 */
const ReviewSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="min-w-[320px] md:min-w-[450px] animate-pulse">
      <div className="bg-va-off-white/50 border border-black/[0.03] p-12 flex flex-col justify-between h-[400px] rounded-[40px]">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 bg-va-black/5 rounded-full" />
              ))}
            </div>
            <div className="w-8 h-8 bg-va-black/5 rounded-lg" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-va-black/5 rounded w-full" />
            <div className="h-4 bg-va-black/5 rounded w-5/6" />
            <div className="h-4 bg-va-black/5 rounded w-4/6" />
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-black/5 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-va-black/5" />
          <div className="space-y-2">
            <div className="h-4 bg-va-black/5 rounded w-32" />
            <div className="h-3 bg-va-black/5 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * REVIEWS INSTRUMENT (MOBY-STANDARD 2026)
 * 
 * Een high-end Bento-Carousel voor social proof.
 * Nu met interactieve filtering en zoekfunctionaliteit.
 */
export const ReviewsInstrument: React.FC<{ 
  reviews: any[], 
  title?: string, 
  subtitle?: string,
  translationKeyPrefix?: string,
  hideHeader?: boolean,
  averageRating?: string,
  totalReviews?: string,
  distribution?: Record<number, number>,
  isPortfolio?: boolean,
  isLoading?: boolean,
  hideFilters?: boolean,
  limit?: number,
  variant?: "default" | "minimal" | "super-minimal" | "wall",
  journeyId?: string,
  worldId?: string
}> = ({ 
  reviews, 
  title, 
  subtitle, 
  translationKeyPrefix = "home.reviews", 
  hideHeader = false, 
  averageRating, 
  totalReviews, 
  distribution, 
  isPortfolio = false, 
  isLoading = false, 
  hideFilters = false, 
  limit, 
  variant = "default",
  journeyId,
  worldId
}) => {
  const { isEditMode } = useEditMode();
  const { playClick } = useSonicDNA();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [localReviews, setLocalReviews] = useState<any[]>(reviews);
  const [showDistribution, setShowDistribution] = useState(false);
  const [isHovered, setIsEditHovered] = useState(false);

  // 🛡️ CHRIS-PROTOCOL: Journey-Aware Data Fetching (v2.14.801)
  useEffect(() => {
    if (!journeyId && !worldId) return;

    const fetchJourneyReviews = async () => {
      try {
        const params = new URLSearchParams();
        if (journeyId) params.append('journeyId', journeyId);
        if (worldId) params.append('worldId', worldId);
        
        const res = await fetch(`/api/reviews?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setLocalReviews(data);
          }
        }
      } catch (e) {
        console.warn('[ReviewsInstrument] Failed to fetch journey reviews');
      }
    };

    fetchJourneyReviews();
  }, [journeyId, worldId]);

  // 🛡️ CHRIS-PROTOCOL: Neurological UX - Smooth Marquee Logic (v2.14.763)
  // We avoid setInterval for the main movement to prevent 'flipping' (fighting manual scroll).
  // Instead, we use a CSS-driven infinite loop for the marquee vibe.
  const [isPaused, setIsPaused] = useState(true);

  // 🛡️ CHRIS-PROTOCOL: Neurological UX - Marquee Animation (v2.14.764)
  const marqueeStyle = {
    animation: isPaused || isEditMode ? 'none' : 'marquee 80s linear infinite',
    display: 'flex',
    width: 'max-content',
    gap: '2rem',
    transform: isPaused ? 'none' : undefined
  };

  const cssKeyframes = `
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;

  //  SPOTLIGHT MANAGEMENT: Update review in DB and local state
  const updateReview = async (id: number, updates: any) => {
    playClick('pro');
    try {
      const res = await fetch('/api/admin/reviews/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      
      if (res.ok) {
        setLocalReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        toast.success('Review bijgewerkt');
      } else {
        toast.error('Update mislukt');
      }
    } catch (e) {
      toast.error('Netwerkfout');
    }
  };

  // Unieke sectoren extraheren voor filters
  const sectors = useMemo(() => {
    const s = new Set<string>();
    localReviews.forEach(r => {
      if (r.sector && r.sector !== 'general') s.add(r.sector);
    });
    return Array.from(s).sort();
  }, [localReviews]);

  // Gefilterde reviews berekenen
  const filteredReviews = useMemo(() => {
    const sentimentKeywords = ['snel', 'vakkundig', 'topkwaliteit', 'professioneel', 'vlot', 'aanrader'];
    
    let base = localReviews.filter(r => {
      const matchesSector = !selectedSector || r.sector === selectedSector;
      const isVisible = isEditMode || r.status !== 'hidden';
      return matchesSector && isVisible;
    });

    // 🛡️ MARK-PROTOCOL: Sentiment Velocity & Hero Prioritization (v2.14.783)
    // We sorteren op basis van: 1. isHero vlag, 2. Sentiment keywords, 3. Rating
    base.sort((a, b) => {
      // 1. Hero vlag
      if (a.isHero && !b.isHero) return -1;
      if (!a.isHero && b.isHero) return 1;

      // 2. Sentiment keywords
      const aText = (a.text || a.textNl || "").toLowerCase();
      const bText = (b.text || b.textNl || "").toLowerCase();
      const aHasSentiment = sentimentKeywords.some(k => aText.includes(k));
      const bHasSentiment = sentimentKeywords.some(k => bText.includes(k));
      if (aHasSentiment && !bHasSentiment) return -1;
      if (!aHasSentiment && bHasSentiment) return 1;

      // 3. Rating
      return (b.rating || 0) - (a.rating || 0);
    });

    if (limit) return base.slice(0, limit);
    
    // 🛡️ CHRIS-PROTOCOL: Infinite Loop Duplication
    // We duplicate the items to create a seamless loop without 'flipping'
    if (base.length > 0) {
      // Ensure we have enough items to fill the screen width twice
      return [...base, ...base, ...base, ...base];
    }
    return base;
  }, [localReviews, selectedSector, limit, isEditMode]);

  // Meest voorkomende woorden (Keyword Cloud)
  const keywords = useMemo(() => {
    const commonWords = ['de', 'het', 'een', 'en', 'is', 'dat', 'met', 'voor', 'van', 'in', 'op', 'te', 'om', 'als', 'die', 'ook', 'met', 'aan', 'bij', 'om', 'door', 'zeer', 'goed', 'fijn', 'vlot', 'top', 'super', 'erg', 'heel', 'echt', 'altijd', 'weer', 'nu', 'al', 'nog', 'dan', 'zo', 'wat', 'hoe', 'waar', 'waarom', 'wanneer', 'wie', 'wel', 'niet', 'geen', 'heb', 'heeft', 'hebben', 'had', 'hadden', 'ben', 'bent', 'is', 'zijn', 'was', 'waren', 'word', 'wordt', 'worden', 'werd', 'werden', 'kun', 'kunt', 'kan', 'kunnen', 'kon', 'konden', 'wil', 'wilt', 'willen', 'wou', 'wouden', 'moet', 'moeten', 'mag', 'mogen', 'zal', 'zullen', 'zou', 'zouden', 'tot', 'naar', 'uit', 'over', 'bij', 'voor', 'tegen', 'onder', 'boven', 'tussen', 'na', 'tijdens', 'sinds', 'door', 'langs', 'via', 'om', 'rond', 'omheen', 'doorheen', 'langs', 'naast', 'achter', 'voor', 'links', 'rechts', 'onder', 'boven', 'tussen', 'na', 'tijdens', 'sinds', 'door', 'langs', 'via', 'om', 'rond', 'omheen', 'doorheen', 'langs', 'naast', 'achter', 'voor', 'links', 'rechts'];
    const wordCounts: Record<string, number> = {};
    
    localReviews.forEach(r => {
      const text = (r.text || r.textNl || "").toLowerCase();
      const words = text.match(/\b\w{4,}\b/g); // Alleen woorden van 4+ letters
      if (words) {
        words.forEach((word: string) => {
          if (!commonWords.includes(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map((entry: [string, any]) => entry[0]);
  }, [localReviews]);

  // 🛡️ CHRIS-PROTOCOL: Sector Discovery (v2.14.764)
  const availableSectors = useMemo(() => {
    const s = new Set<string>();
    localReviews.forEach(r => {
      if (r.sector && r.sector !== 'general') s.add(r.sector);
    });
    return Array.from(s).sort();
  }, [localReviews]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [filteredReviews]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "itemReviewed": {
      "@type": isPortfolio ? "Person" : "Organization",
      "name": isPortfolio ? title?.replace("Ervaringen met ", "") : "Voices",
      "url": MarketManager.getMarketDomains()['BE']
    },
    "ratingValue": averageRating,
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": totalReviews,
    "review": reviews.slice(0, 20).map((reviewItem) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": reviewItem.name || reviewItem.authorName,
        "image": reviewItem.authorPhotoUrl || undefined
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": reviewItem.rating,
        "bestRating": "5"
      },
      "reviewBody": reviewItem.text || "Geweldige ervaring!",
      "publisher": {
        "@type": "Organization",
        "name": "Google",
        "logo": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
      },
      "datePublished": reviewItem.rawDate || reviewItem.date || new Date().toISOString(),
      "inLanguage": "nl",
      "about": reviewItem.sector && reviewItem.sector !== 'general' ? {
        "@type": "Service",
        "name": reviewItem.sector
      } : undefined
    }))
  };

  // #region agent log
  fetch('http://127.0.0.1:7691/ingest/0b1da146-0703-4910-bde4-4876f6bb4146',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'81e7e6'},body:JSON.stringify({sessionId:'81e7e6',location:'ReviewsInstrument.tsx:312',message:'ReviewsInstrument check',data:{hasReviews: !!reviews, reviewsType: typeof reviews, reviewsLength: reviews?.length},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (reviews.length === 0) return null;

  if (variant === "wall") {
    return (
      <ContainerInstrument plain className="w-full relative group/reviews">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <ContainerInstrument className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <ContainerInstrument plain className="space-y-4 w-full md:w-auto">
            {!hideHeader && (
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 mb-2">
                  <Star size={12} className="text-primary" fill="currentColor" />
                  <span className="text-[10px] font-light text-primary uppercase tracking-[0.2em]">
                    <VoiceglotText translationKey="common.social_proof" defaultText="Social Proof" />
                  </span>
                </div>
                <HeadingInstrument level={2} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.85] text-va-black">
                  <VoiceglotText translationKey={`${translationKeyPrefix}.title`} defaultText={title || "Echte verhalen van echte klanten."} />
                </HeadingInstrument>
                <TextInstrument className="text-xl md:text-2xl text-va-black/40 font-light leading-tight tracking-tight max-w-2xl">
                  <VoiceglotText translationKey={`${translationKeyPrefix}.subtitle`} defaultText={subtitle || "Waarom klanten kiezen voor de stemmen van Voices."} />
                </TextInstrument>
              </div>
            )}

            {!hideFilters && (
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <div className="flex flex-wrap gap-2">
                  {availableSectors.map(sectorName => (
                    <button
                      key={sectorName}
                      onClick={() => setSelectedSector(selectedSector === sectorName ? null : sectorName)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[13px] font-light transition-all border",
                        selectedSector === sectorName 
                          ? "bg-va-black text-white border-va-black shadow-lg" 
                          : "bg-white text-va-black/40 border-black/5 hover:border-primary/20 hover:text-va-black"
                      )}
                    >
                      {sectorName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ContainerInstrument>
          
          <ContainerInstrument plain className="flex flex-col items-start md:items-end gap-4">
            <div className="flex flex-col items-end gap-2 relative">
              <div 
                onClick={() => setShowDistribution(!showDistribution)}
                className="flex items-center gap-6 px-8 py-4 bg-white rounded-[24px] border border-black/5 shadow-aura-sm cursor-pointer hover:border-primary/20 transition-all group/stats"
              >
                <div className="flex flex-col">
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-[#fabc05]" fill="currentColor" />
                    ))}
                  </div>
                  <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-[0.2em] group-hover/stats:text-primary/40 transition-colors">
                    <VoiceglotText translationKey="footer.reviews.google_rating" defaultText="Google Rating" />
                  </TextInstrument>
                </div>
                <div className="w-px h-8 bg-black/5" />
                <div className="flex flex-col items-end">
                  <TextInstrument className="text-3xl font-extralight text-va-black leading-none">
                    {averageRating || "4.9"}
                  </TextInstrument>
                  <TextInstrument className="text-[10px] font-light text-va-black/30 uppercase tracking-tighter">
                    {totalReviews || "390"}+ <VoiceglotText translationKey="common.reviews" defaultText="reviews" />
                  </TextInstrument>
                </div>
              </div>
            </div>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* 🛡️ CHRIS-PROTOCOL: Nuclear Loading - content-visibility: auto (v2.14.783) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8" style={{ contentVisibility: 'auto' } as any}>
          {filteredReviews.slice(0, limit || 12).map((review: any, i: number) => (
            <div 
              key={`${review.id}-${i}`} 
              className={cn(
                "break-inside-avoid relative group/card-container",
                review.status === 'hidden' && "opacity-40 grayscale"
              )}
            >
              <BentoCard span="sm" className="bg-va-off-white/80 backdrop-blur-md border border-black/[0.03] p-10 flex flex-col justify-between shadow-aura hover:shadow-aura-lg transition-all duration-700 rounded-[40px] relative overflow-hidden group/card h-auto">
                {isEditMode && (
                  <div className="absolute top-6 right-6 z-50 flex gap-2 bg-va-black/80 backdrop-blur-md p-2 rounded-[12px] opacity-0 group-hover/card-container:opacity-100 transition-opacity">
                    <button 
                      onClick={() => updateReview(review.id, { isHero: !review.isHero })}
                      className={cn("p-2 rounded-lg hover:bg-white/20 transition-colors", review.isHero ? "text-yellow-400" : "text-white/40")}
                      title="Markeer als Hero"
                    >
                      <Star size={16} fill={review.isHero ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => updateReview(review.id, { status: review.status === 'hidden' ? 'published' : 'hidden' })}
                      className={cn("p-2 rounded-lg hover:bg-white/20 transition-colors", review.status === 'hidden' ? "text-red-400" : "text-white/40")}
                      title={review.status === 'hidden' ? "Show" : "Hide"}
                    >
                      {review.status === 'hidden' ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}

                <ContainerInstrument plain className="space-y-6 relative z-10 w-full">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, starIdxItem) => (
                        <Star 
                          key={starIdxItem} 
                          size={12} 
                          className={cn(
                            "transition-colors duration-500",
                            starIdxItem < (review.rating || 5) ? "text-[#fabc05]" : "text-va-black/5"
                          )} 
                          fill="currentColor" 
                        />
                      ))}
                    </div>
                    {review.provider === 'google_places' && (
                      <div className="flex items-center gap-2 px-2 py-1 bg-[#4285F4]/5 rounded-lg border border-[#4285F4]/10">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#4285F4] fill-current">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <TextInstrument className="text-[15px] font-light leading-relaxed text-va-black/70 tracking-tight w-full">
                    <VoiceglotText 
                      translationKey={`${translationKeyPrefix}.review.${i}.text`} 
                      defaultText={(review.text || review.textNl || review.textEn || "Geweldige ervaring!").replace(/\\n/g, ' ')} 
                    />
                  </TextInstrument>
                </ContainerInstrument>
                
                <ContainerInstrument plain className="mt-8 pt-6 border-t border-black/5 flex items-center gap-4 relative z-10">
                  <ContainerInstrument plain className="w-10 h-10 rounded-xl bg-va-off-white flex items-center justify-center font-bold text-va-black/20 text-xs border border-black/5 overflow-hidden relative shadow-sm">
                    {(review.authorPhoto || review.authorPhotoUrl || review.author_photo_url || review.authorUrl || review.mediaId) ? (
                      <VoiceglotImage 
                        src={review.authorPhoto || review.authorPhotoUrl || review.author_photo_url || review.authorUrl} 
                        mediaId={review.mediaId}
                        alt={review.name || review.authorName} 
                        fill
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      (review.name || review.authorName || "V").charAt(0)
                    )}
                  </ContainerInstrument>
                  <div className="flex flex-col">
                    <HeadingInstrument level={5} className="text-[14px] font-light tracking-tight text-va-black">
                      <VoiceglotText translationKey={`${translationKeyPrefix}.reviewer.${i}`} defaultText={review.name || review.authorName} noTranslate={true} />
                    </HeadingInstrument>
                    <TextInstrument className="text-[10px] font-light text-va-black/30 uppercase tracking-[0.1em]">
                      {review.date || t('common.verified', 'Geverifieerd')}
                    </TextInstrument>
                  </div>
                </ContainerInstrument>
              </BentoCard>
            </div>
          ))}
        </div>
      </ContainerInstrument>
    );
  }

  if (variant === "super-minimal") {
    return (
      <ContainerInstrument plain className="w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-green-600/60">
            <div className="flex -space-x-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase">
              {averageRating || "4.9"}/5 sterren ({totalReviews || "390"}+ reviews)
            </TextInstrument>
          </div>
          
          <div className="flex -space-x-3 overflow-hidden">
            {reviews.slice(0, 5).map((review, i) => (
              <div key={i} className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-va-off-white border border-black/5">
                {(review.authorPhoto || review.authorPhotoUrl || review.author_photo_url || review.authorUrl || review.mediaId) ? (
                  <VoiceglotImage 
                    src={review.authorPhoto || review.authorPhotoUrl || review.author_photo_url || review.authorUrl} 
                    mediaId={review.mediaId}
                    alt={review.name || review.authorName} 
                    fill
                    className="object-cover" 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-va-black/20">
                    {(review.name || review.authorName || "V").charAt(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument plain className="w-full relative group/reviews">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ContainerInstrument className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <ContainerInstrument plain className="space-y-4 w-full md:w-auto">
          {!hideHeader && (
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 mb-2">
                <Star size={12} className="text-primary" fill="currentColor" />
                <span className="text-[10px] font-light text-primary uppercase tracking-[0.2em]">
                  <VoiceglotText translationKey="common.social_proof" defaultText="Social Proof" />
                </span>
              </div>
              <HeadingInstrument level={2} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.85] text-va-black">
                <VoiceglotText translationKey={`${translationKeyPrefix}.title`} defaultText={title || "Echte verhalen van echte klanten."} />
              </HeadingInstrument>
              <TextInstrument className="text-xl md:text-2xl text-va-black/40 font-light leading-tight tracking-tight max-w-2xl">
                <VoiceglotText translationKey={`${translationKeyPrefix}.subtitle`} defaultText={subtitle || "Waarom klanten kiezen voor de stemmen van Voices."} />
              </TextInstrument>
            </div>
          )}

          {/* Interactive Filters (Moby-Standard 2026) */}
          {!hideFilters && (
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <div className="flex flex-wrap gap-2">
                {availableSectors.map(sectorName => (
                  <button
                    key={sectorName}
                    onClick={() => setSelectedSector(selectedSector === sectorName ? null : sectorName)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[13px] font-light transition-all border",
                      selectedSector === sectorName 
                        ? "bg-va-black text-white border-va-black shadow-lg" 
                        : "bg-white text-va-black/40 border-black/5 hover:border-primary/20 hover:text-va-black"
                    )}
                  >
                    {sectorName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </ContainerInstrument>
        
        <ContainerInstrument plain className="flex flex-col items-start md:items-end gap-4">
          <div className="flex flex-col items-end gap-2 relative">
            <div 
              onClick={() => setShowDistribution(!showDistribution)}
              className="flex items-center gap-6 px-8 py-4 bg-white rounded-[24px] border border-black/5 shadow-aura-sm cursor-pointer hover:border-primary/20 transition-all group/stats"
            >
              <div className="flex flex-col">
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-[#fabc05]" fill="currentColor" />
                  ))}
                </div>
                <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-[0.2em] group-hover/stats:text-primary/40 transition-colors">
                  <VoiceglotText translationKey="footer.reviews.google_rating" defaultText="Google Rating" />
                </TextInstrument>
              </div>
              <div className="w-px h-8 bg-black/5" />
              <div className="flex flex-col items-end">
                <TextInstrument className="text-3xl font-extralight text-va-black leading-none">
                  {averageRating || "4.9"}
                </TextInstrument>
                <TextInstrument className="text-[10px] font-light text-va-black/30 uppercase tracking-tighter">
                  {totalReviews || "390"}+ <VoiceglotText translationKey="common.reviews" defaultText="reviews" />
                </TextInstrument>
              </div>
            </div>

            {/*  REVIEW DISTRIBUTION POPUP (CHRIS-PROTOCOL) */}
            {showDistribution && distribution && (
              <div className="absolute top-full right-0 mt-4 z-[100] w-64 bg-white rounded-[24px] border border-black/5 shadow-aura-lg p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(starIdx => {
                    const count = (distribution as any)[starIdx] || 0;
                    const total = Number(totalReviews) || 1;
                    const percentage = Math.round((count / total) * 100);
                    return (
                      <div key={starIdx} className="flex items-center gap-3">
                        <span className="text-[11px] font-medium text-va-black/40 w-3">{starIdx}</span>
                        <Star size={10} className="text-[#fabc05]" fill="currentColor" />
                        <div className="flex-1 h-1.5 bg-va-black/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#fabc05] transition-all duration-1000" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-light text-va-black/20 w-8 text-right">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-black/5">
                  <TextInstrument className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest mb-3 block">
                    <VoiceglotText translationKey="reviews.popular_terms" defaultText="Populaire termen" />
                  </TextInstrument>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map(word => (
                      <span key={word} className="px-2 py-1 bg-va-black/5 rounded-md text-[10px] text-va-black/40 font-light lowercase">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-3 relative z-[100]">
            <ButtonInstrument 
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                "w-14 h-14 rounded-full border border-black/10 flex items-center justify-center transition-all bg-white shadow-aura-sm",
                canScrollLeft ? "text-va-black hover:border-primary/40 hover:text-primary hover:scale-110 active:scale-95" : "opacity-10 cursor-not-allowed"
              )}
            >
              <ChevronLeft size={28} strokeWidth={2.5} className="relative z-10" />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                "w-14 h-14 rounded-full border border-black/10 flex items-center justify-center transition-all bg-white shadow-aura-sm",
                canScrollRight ? "text-va-black hover:border-primary/40 hover:text-primary hover:scale-110 active:scale-95" : "opacity-10 cursor-not-allowed"
              )}
            >
              <ChevronRight size={28} strokeWidth={2.5} className="relative z-10" />
            </ButtonInstrument>
          </div>
        </ContainerInstrument>
      </ContainerInstrument>

      <ContainerInstrument 
        plain 
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex overflow-hidden pb-12 -mx-6 px-6 no-scrollbar"
      >
        <style dangerouslySetInnerHTML={{ __html: cssKeyframes }} />
        <div 
          style={marqueeStyle}
          className="flex gap-8"
        >
          {isLoading ? (
            [...Array(3)].map((_, i) => <ReviewSkeleton key={i} />)
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review: any, i: number) => (
              <div 
                key={`${review.id}-${i}`} 
                className={cn(
                  "min-w-[320px] md:min-w-[450px] relative group/card-container flex self-stretch cursor-grab active:cursor-grabbing",
                  review.status === 'hidden' && "opacity-40 grayscale"
                )}
              >
                <BentoCard span="sm" className="bg-va-off-white/80 backdrop-blur-md border border-black/[0.03] p-10 flex flex-col justify-between h-full min-h-[400px] max-h-[500px] shadow-aura hover:shadow-aura-lg transition-all duration-700 rounded-[40px] relative overflow-hidden group/card">
                  
                  {/*  SPOTLIGHT ADMIN OVERLAY (CHRIS-PROTOCOL) */}
                  {isEditMode && (
                    <div className="absolute top-6 right-6 z-50 flex gap-2 bg-va-black/80 backdrop-blur-md p-2 rounded-[12px] opacity-0 group-hover/card-container:opacity-100 transition-opacity">
                      <button 
                        onClick={() => updateReview(review.id, { isHero: !review.isHero })}
                        className={cn("p-2 rounded-lg hover:bg-white/20 transition-colors", review.isHero ? "text-yellow-400" : "text-white/40")}
                        title="Markeer als Hero"
                      >
                        <Star size={16} fill={review.isHero ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => updateReview(review.id, { businessSlug: review.businessSlug === 'voices-be' ? 'voices-studio' : 'voices-be' })}
                        className="p-2 rounded-lg hover:bg-white/20 text-white/40 hover:text-white transition-colors"
                        title={review.businessSlug === 'voices-be' ? "Verplaats naar Studio" : "Verplaats naar Agency"}
                      >
                        <Anchor size={16} />
                      </button>
                      <button 
                        onClick={() => updateReview(review.id, { status: review.status === 'hidden' ? 'published' : 'hidden' })}
                        className={cn("p-2 rounded-lg hover:bg-white/20 transition-colors", review.status === 'hidden' ? "text-red-400" : "text-white/40")}
                        title={review.status === 'hidden' ? "Show" : "Hide"}
                      >
                        {review.status === 'hidden' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  )}

                  <ContainerInstrument plain className="space-y-6 relative z-10 w-full flex-1">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, starIdxItem) => (
                          <Star 
                            key={starIdxItem} 
                            size={12} 
                            className={cn(
                              "transition-colors duration-500",
                              starIdxItem < (review.rating || 5) ? "text-[#fabc05]" : "text-va-black/5"
                            )} 
                            fill="currentColor" 
                          />
                        ))}
                      </div>
                      {review.provider === 'google_places' || review.provider === 'brb_richplugins' || (review.authorPhotoUrl && review.authorPhotoUrl.includes('googleusercontent')) ? (
                        <div className="flex items-center gap-2 px-2 py-1 bg-[#4285F4]/5 rounded-lg border border-[#4285F4]/10">
                          <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#4285F4] fill-current">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          <span className="text-[9px] font-bold text-[#4285F4] uppercase tracking-widest">
                            <VoiceglotText translationKey="common.google" defaultText="Google" />
                          </span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10">
                          <Quote size={14} className="text-primary" />
                        </div>
                      )}
                    </div>

                    <TextInstrument className="text-[15px] font-light leading-relaxed text-va-black/70 tracking-tight line-clamp-6 w-full select-none">
                      <VoiceglotText 
                        translationKey={`${translationKeyPrefix}.review.${i}.text`} 
                        defaultText={(review.text || review.textNl || review.textEn || "Geweldige ervaring!").replace(/\\n/g, ' ')} 
                      />
                    </TextInstrument>
                  </ContainerInstrument>
                  
                  <ContainerInstrument plain className="mt-8 pt-6 border-t border-black/5 flex items-center gap-4 relative z-10">
                    <div className="relative">
                      <ContainerInstrument plain className="w-12 h-12 rounded-xl bg-va-off-white flex items-center justify-center font-bold text-va-black/20 text-md border border-black/5 overflow-hidden relative shadow-sm group-hover/card:scale-105 transition-transform duration-700">
                        {(review.authorPhoto || review.authorPhotoUrl || review.author_photo_url || review.authorUrl || review.mediaId) ? (
                          <VoiceglotImage 
                            src={review.authorPhoto || review.authorPhotoUrl || review.author_photo_url || review.authorUrl} 
                            mediaId={review.mediaId}
                            alt={review.name || review.authorName} 
                            fill
                            priority={i < 3}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          (review.name || review.authorName || "V").charAt(0)
                        )}
                      </ContainerInstrument>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-black/5">
                        <Check size={10} className="text-green-500" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <HeadingInstrument level={5} className="text-[15px] font-light tracking-tight text-va-black">
                          <VoiceglotText  translationKey={`${translationKeyPrefix}.reviewer.${i}`} defaultText={review.name || review.authorName} noTranslate={true} />
                        </HeadingInstrument>
                        {review.isHero && (
                          <div className="px-1.5 py-0.5 bg-yellow-400/10 rounded text-[9px] font-bold text-yellow-600 uppercase tracking-widest">
                            Top Review
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <TextInstrument className="text-[11px] font-light text-va-black/30 uppercase tracking-[0.2em]">
                          {review.date || t('common.verified', 'Geverifieerd')}
                        </TextInstrument>
                        {review.sector && review.sector !== 'general' && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-va-black/10" />
                            <TextInstrument className="text-[10px] font-light text-primary/40 uppercase tracking-tighter">
                              {review.sector}
                            </TextInstrument>
                          </>
                        )}
                      </div>
                    </div>
                  </ContainerInstrument>
                </BentoCard>
              </div>
            ))
          ) : (
            <div className="w-full py-20 flex flex-col items-center justify-center text-va-black/20 space-y-4">
              <SearchIcon size={48} strokeWidth={1} />
              <TextInstrument className="text-lg font-light">
                <VoiceglotText translationKey="reviews.no_results" defaultText="Geen reviews gevonden voor deze selectie." />
              </TextInstrument>
              <button onClick={() => { playClick('pro'); setSelectedSector(null); }} className="text-primary text-sm underline">
                <VoiceglotText translationKey="reviews.clear_filters" defaultText="Wis filters" />
              </button>
            </div>
          )}
        </div>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};

