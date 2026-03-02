"use client";

import { ContainerInstrument, HeadingInstrument, SectionInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Star } from "lucide-react";

export interface ReviewItem {
  id: number;
  author_name: string;
  text: string | null;
  rating: number;
  provider: string | null;
  is_google: boolean;
  metadata?: string;
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
    <SectionInstrument className="py-24 bg-va-off-white">
      <ContainerInstrument className="max-w-6xl mx-auto">
        <HeadingInstrument level={2} className="text-4xl md:text-5xl font-light tracking-tighter text-center mb-16">
          <VoiceglotText translationKey="studio.reviews.title" defaultText={title} />
        </HeadingInstrument>
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.map((review) => (
            <ContainerInstrument
              key={review.id}
              plain
              className="bg-white rounded-[20px] p-8 shadow-aura border border-black/[0.02] flex flex-col"
            >
              <ContainerInstrument className="flex items-center gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    strokeWidth={1.5}
                    className={i < review.rating ? "text-primary fill-primary" : "text-va-black/20"}
                  />
                ))}
                {review.is_google ? (
                  <TextInstrument as="span" className="ml-2 text-[10px] font-bold tracking-widest uppercase text-va-black/30">
                    Google
                  </TextInstrument>
                ) : (
                  <TextInstrument as="span" className="ml-2 text-[10px] font-bold tracking-widest uppercase text-primary/40">
                    <VoiceglotText translationKey="common.verified" defaultText="Geverifieerd" />
                  </TextInstrument>
                )}
              </ContainerInstrument>
              {review.text && (
                <TextInstrument className="text-va-black/70 font-light leading-relaxed flex-grow text-[15px]">
                  &ldquo;{review.text}&rdquo;
                </TextInstrument>
              )}
              <ContainerInstrument className="mt-4">
                <TextInstrument className="text-[13px] font-medium text-va-black/60 tracking-widest">
                  {review.author_name}
                </TextInstrument>
                {review.metadata && (
                  <TextInstrument className="text-[11px] font-light text-va-black/30 tracking-wider mt-1">
                    {review.metadata}
                  </TextInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>
    </SectionInstrument>
  );
};
