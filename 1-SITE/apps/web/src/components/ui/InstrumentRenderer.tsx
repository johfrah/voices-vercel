"use client";

import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { ContainerInstrument } from './LayoutInstruments';

// 🛡️ NUCLEAR LOADING MANDATE: Dynamic imports for all instruments
const HeroInstrument = nextDynamic(() => import('./HeroInstrument').then(mod => mod.HeroInstrument), { ssr: false });
const PricingInstrument = nextDynamic(() => import('./PricingInstrument').then(mod => mod.PricingInstrument), { ssr: false });
const CTAInstrument = nextDynamic(() => import('./CTAInstrument').then(mod => mod.CTAInstrument), { ssr: false });
const ReviewsInstrument = nextDynamic(() => import('./ReviewsInstrument').then(mod => mod.ReviewsInstrument), { ssr: false });
const HowItWorksInstrument = nextDynamic(() => import('./HowItWorksInstrument').then(mod => mod.HowItWorksInstrument), { ssr: false });
const BentoShowcase = nextDynamic(() => import('./BentoShowcaseInstrument').then(mod => mod.BentoShowcaseInstrument), { ssr: false });
const AccordionInstrument = nextDynamic(() => import('./AccordionInstrument').then(mod => mod.AccordionInstrument), { ssr: false });

// Fallback voor onbekende instrumenten
const UnknownInstrument = ({ type }: { type: string }) => (
  <ContainerInstrument className="py-20 bg-red-50 border border-red-100 rounded-2xl text-center">
    <p className="text-red-500 font-medium">Onbekend instrument type: {type}</p>
  </ContainerInstrument>
);

interface InstrumentRendererProps {
  blocks: any[];
  extraData?: any;
}

/**
 * 🧠 INSTRUMENT RENDERER (DNA-COMPLIANT)
 * Vertaalt database blocks naar visuele instrumenten.
 */
export const InstrumentRenderer = ({ blocks, extraData = {} }: InstrumentRendererProps) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-0">
      {blocks.map((block, index) => {
        const settings = block.settings || {};
        const type = block.type;

        // 🛡️ CHRIS-PROTOCOL: Map database type to Component
        switch (type) {
          case 'hero':
          case 'HeroInstrument':
            return (
              <Suspense key={block.id} fallback={<div className="h-[600px] bg-va-black/5 animate-pulse" />}>
                <HeroInstrument {...settings.data} />
              </Suspense>
            );

          case 'pricing':
          case 'PricingInstrument':
            return (
              <Suspense key={block.id} fallback={<div className="h-96 bg-va-black/5 animate-pulse" />}>
                <PricingInstrument {...settings.data} />
              </Suspense>
            );

          case 'cta':
          case 'CTAInstrument':
            return (
              <Suspense key={block.id} fallback={<div className="h-48 bg-va-black/5 animate-pulse" />}>
                <CTAInstrument {...settings.data} />
              </Suspense>
            );

          case 'reviews':
          case 'ReviewsInstrument':
            return (
              <Suspense key={block.id} fallback={<div className="h-96 bg-va-black/5 animate-pulse" />}>
                <ReviewsInstrument {...settings.data} />
              </Suspense>
            );

          case 'how_it_works':
          case 'HowItWorksInstrument':
            return (
              <Suspense key={block.id} fallback={<div className="h-96 bg-va-black/5 animate-pulse" />}>
                <HowItWorksInstrument {...settings.data} />
              </Suspense>
            );

          case 'bento':
          case 'BentoShowcase':
            return (
              <Suspense key={block.id} fallback={<div className="h-[600px] bg-va-black/5 animate-pulse" />}>
                <BentoShowcase {...settings.data} />
              </Suspense>
            );

          case 'faq':
          case 'AccordionInstrument':
            return (
              <Suspense key={block.id} fallback={<div className="h-64 bg-va-black/5 animate-pulse" />}>
                <AccordionInstrument {...settings.data} />
              </Suspense>
            );

          default:
            // Als het een legacy block is (zonder settings), kunnen we een fallback renderer gebruiken
            // of het negeren als we volledig over zijn op de nieuwe builder.
            console.warn(`[InstrumentRenderer] Legacy or unknown block type: ${type}`);
            return <UnknownInstrument key={block.id} type={type} />;
        }
      })}
    </div>
  );
};
