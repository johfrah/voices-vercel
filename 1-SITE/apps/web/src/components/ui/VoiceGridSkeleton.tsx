"use client";

import { cn } from '@/lib/utils';
import React from 'react';
import { BentoCard } from './BentoGrid';
import { ContainerInstrument } from './LayoutInstruments';

/**
 * VOICE CARD SKELETON
 * Focus: Zero Layout Shift & Deterministic Loading
 * Matches de exacte afmetingen van de VoiceCard voor een naadloze transitie.
 */
export const VoiceCardSkeleton = () => {
  return (
    <BentoCard 
      span="md" 
      className="bg-white border border-gray-100 rounded-[40px] p-8 relative overflow-hidden pointer-events-none"
    >
      <ContainerInstrument className="relative z-10 flex flex-col h-full justify-between">
        <ContainerInstrument>
          {/* Header Skeleton */}
          <ContainerInstrument className="flex items-center gap-5 mb-8">
            <ContainerInstrument className="w-20 h-20 rounded-[28px] bg-va-off-white animate-pulse" />
            <ContainerInstrument className="flex-1 space-y-3">
              <ContainerInstrument className="h-6 w-32 bg-va-off-white rounded-[20px] animate-pulse" />
              <ContainerInstrument className="h-3 w-24 bg-va-off-white/60 rounded-[20px] animate-pulse" />
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Player Skeleton */}
          <ContainerInstrument className="bg-va-off-white/50 rounded-3xl p-4 flex items-center gap-4 mb-6 border border-black/5">
            <ContainerInstrument className="w-12 h-12 rounded-2xl bg-va-off-white animate-pulse" />
            <ContainerInstrument className="flex-1 space-y-2">
              <ContainerInstrument className="h-2 w-16 bg-va-off-white rounded-full animate-pulse" />
              <ContainerInstrument className="h-1 w-full bg-va-off-white rounded-full overflow-hidden" />
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Bio Skeleton */}
          <ContainerInstrument className="space-y-3 mb-8">
            <ContainerInstrument className="h-4 w-full bg-va-off-white rounded-[20px] animate-pulse" />
            <ContainerInstrument className="h-4 w-2/3 bg-va-off-white rounded-[20px] animate-pulse" />
            <ContainerInstrument className="flex gap-2 mt-4">
              <ContainerInstrument className="h-6 w-16 bg-va-off-white rounded-full animate-pulse" />
              <ContainerInstrument className="h-6 w-20 bg-va-off-white rounded-full animate-pulse" />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Footer Skeleton */}
        <ContainerInstrument className="pt-6 border-t border-black/5 flex items-center justify-between">
          <ContainerInstrument className="space-y-2">
            <ContainerInstrument className="h-3 w-12 bg-va-off-white rounded-full animate-pulse" />
            <ContainerInstrument className="h-8 w-20 bg-va-off-white rounded-[20px] animate-pulse" />
          </ContainerInstrument>
          <ContainerInstrument className="h-12 w-32 bg-va-off-white rounded-2xl animate-pulse" />
        </ContainerInstrument>
      </ContainerInstrument>
    </BentoCard>
  );
};

/**
 * VOICE GRID SKELETON
 * Rendered een grid of swipe-lijst van skeletons.
 */
export const VoiceGrid: React.FC<VoiceGridSkeletonProps> = ({ count = 6, featured = false }) => {
  return (
    <ContainerInstrument className={cn(
      "w-full",
      featured && "md:block flex overflow-x-auto pb-8 md:pb-12 -mx-4 md:-mx-6 px-4 md:px-6 no-scrollbar"
    )}>
      <ContainerInstrument className={cn(
        featured ? "flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-w-max md:min-w-full" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      )}>
        {Array.from({ length: count }).map((_, i) => (
          <ContainerInstrument key={i} className={cn(featured && "w-[80vw] md:w-auto")}>
            <VoiceCardSkeleton strokeWidth={1.5} />
          </ContainerInstrument>
        ))}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
