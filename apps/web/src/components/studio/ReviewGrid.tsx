"use client";

import React from "react";
import Image from "next/image";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { Star, User } from "lucide-react";

export interface ReviewItem {
  id: number;
  author_name: string;
  text: string | null;
  rating: number;
  provider: string | null;
  is_google: boolean;
  metadata?: string;
  author_photo_url?: string | null;
}

interface ReviewGridProps {
  reviews: ReviewItem[];
  title?: string;
  maxItems?: number;
}

/**
 * ReviewGrid: Mixes Google reviews and ge-anonimiseerde internal snippets.
 * LAYA: Esthetisch grid met sterren en gematigde afronding.
 */
export const ReviewGrid: React.FC<ReviewGridProps> = ({
  reviews,
  title = "Wat deelnemers zeggen",
  maxItems = 6,
}) => {
  const displayReviews = Array.isArray(reviews) ? reviews.slice(0, maxItems) : [];

  if (displayReviews.length === 0) return null;

  return (
    <section className="py-24 bg-va-off-white">
      <ContainerInstrument className="max-w-6xl mx-auto">
        <HeadingInstrument level={2} className="text-4xl md:text-5xl font-light tracking-tighter text-center mb-16">
          {title}
        </HeadingInstrument>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.map((review) => (
            <ContainerInstrument
              key={review.id}
              plain
              className="bg-white rounded-[20px] p-8 shadow-aura border border-black/[0.02] flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    strokeWidth={1.5}
                    className={i < review.rating ? "text-primary fill-primary" : "text-va-black/20"}
                  />
                ))}
                {review.is_google ? (
                  <span className="ml-2 text-[10px] font-bold tracking-widest uppercase text-va-black/30">
                    Google
                  </span>
                ) : (
                  <span className="ml-2 text-[10px] font-bold tracking-widest uppercase text-primary/40">
                    Geverifieerd
                  </span>
                )}
              </div>
              {review.text && (
                <TextInstrument className="text-va-black/70 font-light leading-relaxed flex-grow text-[15px]">
                  &ldquo;{review.text}&rdquo;
                </TextInstrument>
              )}
              <div className="mt-4 flex items-center gap-3">
                {review.author_photo_url ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-va-off-white shrink-0">
                    <Image
                      src={review.author_photo_url}
                      alt={review.author_name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center shrink-0">
                    <User size={18} strokeWidth={1.5} className="text-va-black/20" />
                  </div>
                )}
                <div>
                  <TextInstrument className="text-[13px] font-medium text-va-black/60 tracking-widest">
                    {review.author_name}
                  </TextInstrument>
                  {review.metadata && (
                    <TextInstrument className="text-[11px] font-light text-va-black/30 tracking-wider mt-0.5">
                      {review.metadata}
                    </TextInstrument>
                  )}
                </div>
              </div>
            </ContainerInstrument>
          ))}
        </div>
      </ContainerInstrument>
    </section>
  );
};
