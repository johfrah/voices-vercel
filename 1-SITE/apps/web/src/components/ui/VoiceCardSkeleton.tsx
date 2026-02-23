"use client";

import React from 'react';
import { cn } from '@/lib/utils/utils';
import { ContainerInstrument } from './LayoutInstruments';

export const VoiceCardSkeleton = () => {
  return (
    <ContainerInstrument
      plain
      className="bg-white rounded-[20px] overflow-hidden shadow-aura border border-black/[0.02] flex flex-col w-full h-full animate-pulse"
    >
      {/* Image/Video Placeholder */}
      <div className="relative bg-va-black/5 shrink-0 aspect-square w-full" />

      <div className="p-0 flex flex-col flex-grow">
        {/* Flag & Language Placeholder */}
        <div className="flex items-start justify-between px-8 pt-8 pb-4 border-b border-black/[0.02]">
          <div className="flex flex-col gap-2.5">
            <div className="h-6 w-24 bg-va-black/5 rounded-full" />
            <div className="flex gap-2">
              <div className="h-3 w-12 bg-va-black/5 rounded-full" />
              <div className="h-3 w-12 bg-va-black/5 rounded-full" />
            </div>
          </div>
          {/* Delivery Placeholder */}
          <div className="h-10 w-20 bg-va-black/5 rounded-xl" />
        </div>

        <div className="flex flex-col flex-grow px-8 pt-6 pb-8">
          {/* Name Placeholder */}
          <div className="h-10 w-3/4 bg-va-black/5 rounded-lg mb-4" />
          
          {/* Tags Placeholder */}
          <div className="flex gap-1 mb-4">
            <div className="h-4 w-12 bg-va-black/5 rounded-full" />
            <div className="h-4 w-16 bg-va-black/5 rounded-full" />
            <div className="h-4 w-14 bg-va-black/5 rounded-full" />
          </div>

          {/* Bio Placeholder */}
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-va-black/5 rounded" />
            <div className="h-4 w-5/6 bg-va-black/5 rounded" />
          </div>

          {/* Footer Placeholder */}
          <div className="flex justify-between items-center mt-auto pt-6 border-t border-black/[0.03]">
            <div className="flex flex-col gap-1">
              <div className="h-3 w-8 bg-va-black/5 rounded" />
              <div className="h-6 w-16 bg-va-black/5 rounded" />
            </div>
            <div className="h-10 w-32 bg-va-black/5 rounded-xl" />
          </div>
        </div>
      </div>
    </ContainerInstrument>
  );
};
