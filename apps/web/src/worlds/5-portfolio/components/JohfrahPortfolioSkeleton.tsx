"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ContainerInstrument, SectionInstrument } from '@/components/ui/LayoutInstruments';

/**
 * JOHFRAH PORTFOLIO SKELETON
 * Focus: Zero Layout Shift & 100ms Feedback
 * Matches de Johfrah Portfolio layout exact.
 */
export const JohfrahPortfolioSkeleton = () => {
  return (
    <ContainerInstrument plain className="min-h-screen bg-va-off-white">
      {/* Hero Skeleton */}
      <SectionInstrument className="relative pt-48 pb-64 overflow-hidden">
        <ContainerInstrument className="max-w-5xl mx-auto px-6">
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <ContainerInstrument className="lg:col-span-7 space-y-12">
              <ContainerInstrument className="space-y-4">
                <ContainerInstrument plain className="h-24 w-2/3 bg-va-black/5 rounded-[20px] animate-pulse" />
                <ContainerInstrument plain className="h-24 w-1/2 bg-va-black/5 rounded-[20px] animate-pulse" />
                <ContainerInstrument plain className="h-8 w-1/3 bg-va-black/5 rounded-[10px] animate-pulse mt-8" />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-3">
                <ContainerInstrument plain className="h-4 w-full bg-va-black/5 rounded-full animate-pulse" />
                <ContainerInstrument plain className="h-4 w-full bg-va-black/5 rounded-full animate-pulse" />
                <ContainerInstrument plain className="h-4 w-2/3 bg-va-black/5 rounded-full animate-pulse" />
              </ContainerInstrument>
              <ContainerInstrument className="flex gap-6 pt-6">
                <ContainerInstrument plain className="h-16 w-48 bg-va-black/5 rounded-[10px] animate-pulse" />
                <ContainerInstrument plain className="h-16 w-40 bg-va-black/5 rounded-[10px] animate-pulse" />
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="lg:col-span-5">
              <ContainerInstrument plain className="aspect-[4/5] rounded-[20px] bg-va-black/5 animate-pulse shadow-aura-lg" />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Bento Matrix Skeleton */}
      <SectionInstrument className="max-w-6xl mx-auto px-6 pb-64">
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ContainerInstrument plain className="md:col-span-2 h-[600px] bg-va-black/5 rounded-[20px] animate-pulse" />
          <ContainerInstrument className="md:col-span-1 space-y-10">
            <ContainerInstrument plain className="aspect-[9/16] bg-va-black/5 rounded-[20px] animate-pulse" />
            <ContainerInstrument plain className="aspect-[9/16] bg-va-black/5 rounded-[20px] animate-pulse" />
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </ContainerInstrument>
  );
};
