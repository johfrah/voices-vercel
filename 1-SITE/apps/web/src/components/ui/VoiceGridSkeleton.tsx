"use client";

import { cn } from '@/lib/utils';
import React from 'react';
import { BentoCard } from './BentoGrid';

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
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Header Skeleton */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-[28px] bg-va-off-white animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-32 bg-va-off-white rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-va-off-white/60 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Player Skeleton */}
          <div className="bg-va-off-white/50 rounded-3xl p-4 flex items-center gap-4 mb-6 border border-black/5">
            <div className="w-12 h-12 rounded-2xl bg-va-off-white animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-2 w-16 bg-va-off-white rounded-full animate-pulse" />
              <div className="h-1 w-full bg-va-off-white rounded-full overflow-hidden" />
            </div>
          </div>

          {/* Bio Skeleton */}
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full bg-va-off-white rounded-lg animate-pulse" />
            <div className="h-4 w-2/3 bg-va-off-white rounded-lg animate-pulse" />
            <div className="flex gap-2 mt-4">
              <div className="h-6 w-16 bg-va-off-white rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-va-off-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="pt-6 border-t border-black/5 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-12 bg-va-off-white rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-va-off-white rounded-lg animate-pulse" />
          </div>
          <div className="h-12 w-32 bg-va-off-white rounded-2xl animate-pulse" />
        </div>
      </div>
    </BentoCard>
  );
};

/**
 * VOICE GRID SKELETON
 * Rendered een grid of swipe-lijst van skeletons.
 */
export const VoiceGridSkeleton = ({ count = 6, featured = false }: { count?: number, featured?: boolean }) => {
  return (
    <div className={cn(
      "w-full",
      featured && "md:block flex overflow-x-auto pb-12 -mx-6 px-6 no-scrollbar"
    )}>
      <div className={cn(
        featured ? "flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 min-w-max md:min-w-full" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      )}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={cn(featured && "w-[85vw] md:w-auto")}>
            <VoiceCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};
