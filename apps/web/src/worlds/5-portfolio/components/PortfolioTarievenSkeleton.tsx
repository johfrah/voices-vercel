"use client";

import React from 'react';
import { ContainerInstrument, SectionInstrument } from '@/components/ui/LayoutInstruments';

/**
 * PORTFOLIO TARIEVEN SKELETON
 * Focus: Zero Layout Shift & 100ms Feedback
 * Matches de Tarieven pagina layout exact.
 */
export const PortfolioTarievenSkeleton = () => {
  return (
    <ContainerInstrument plain className="min-h-screen bg-va-off-white">
      {/* Header Skeleton */}
      <SectionInstrument className="pt-48 pb-24">
        <ContainerInstrument className="max-w-5xl mx-auto px-6 text-center">
          <ContainerInstrument className="space-y-6 flex flex-col items-center">
            <ContainerInstrument plain className="h-8 w-48 bg-va-black/5 rounded-full animate-pulse" />
            <ContainerInstrument plain className="h-24 w-3/4 bg-va-black/5 rounded-[20px] animate-pulse" />
            <ContainerInstrument plain className="h-12 w-1/2 bg-va-black/5 rounded-[10px] animate-pulse" />
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Calculator & Info Skeleton */}
      <SectionInstrument className="pb-32">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <ContainerInstrument plain className="lg:col-span-5 h-[500px] bg-va-black/5 rounded-[40px] animate-pulse" />
            <ContainerInstrument plain className="lg:col-span-7 h-[500px] bg-va-black/5 rounded-[40px] animate-pulse" />
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Rates Grid Skeleton */}
      <SectionInstrument className="pb-48">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <ContainerInstrument key={i} plain className="h-[600px] bg-va-black/5 rounded-[32px] animate-pulse" />
            ))}
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </ContainerInstrument>
  );
};
