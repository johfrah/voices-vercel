"use client";

import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { InstrumentSkeleton } from './InstrumentSkeletonRegistry';

// 🛡️ NUCLEAR LOADING MANDATE: Dynamic imports for all instruments
const HeroInstrument = nextDynamic(() => import('./HeroInstrument').then(mod => mod.HeroInstrument), { ssr: false });
const PricingInstrument = nextDynamic(() => import('./PricingInstrument').then(mod => mod.PricingInstrument), { ssr: false });
const CTAInstrument = nextDynamic(() => import('./CTAInstrument').then(mod => mod.CTAInstrument), { ssr: false });
const ReviewsInstrument = nextDynamic(() => import('./ReviewsInstrument').then(mod => mod.ReviewsInstrument), { ssr: false });
const HowItWorksInstrument = nextDynamic(() => import('./HowItWorksInstrument').then(mod => mod.HowItWorksInstrument), { ssr: false });
const BentoShowcase = nextDynamic(() => import('./BentoShowcaseInstrument').then(mod => mod.BentoShowcaseInstrument), { ssr: false });
const AccordionInstrument = nextDynamic(() => import('./AccordionInstrument').then(mod => mod.AccordionInstrument), { ssr: false });

// Studio Specific Instruments
const WorkshopCarousel = nextDynamic(() => import('../studio/WorkshopCarousel').then(mod => mod.WorkshopCarousel), { ssr: false });
const WorkshopCalendar = nextDynamic(() => import('../studio/WorkshopCalendar').then(mod => mod.WorkshopCalendar), { ssr: false });
const WorkshopQuiz = nextDynamic(() => import('../studio/WorkshopQuiz').then(mod => mod.WorkshopQuiz), { ssr: false });
const WorkshopInterestForm = nextDynamic(() => import('../studio/WorkshopInterestForm').then(mod => mod.WorkshopInterestForm), { ssr: false });

// Fallback voor onbekende instrumenten
const UnknownInstrument = ({ type }: { type: string }) => (
  <ContainerInstrument className="py-20 bg-red-50 border border-red-100 rounded-2xl text-center">
    <TextInstrument className="text-red-500 font-medium">Onbekend instrument type: {type}</TextInstrument>
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

  const withSkeleton = (blockId: number | string, type: string, element: React.ReactNode) => (
    <Suspense key={blockId} fallback={<InstrumentSkeleton type={type} />}>
      {element}
    </Suspense>
  );

  return (
    <div className="space-y-0">
      {blocks.map((block) => {
        const settings = block.settings || {};
        const type = block.type;

        // 🛡️ CHRIS-PROTOCOL: Map database type to Component
        switch (type) {
          case 'hero':
          case 'HeroInstrument':
            return withSkeleton(block.id, "hero", <HeroInstrument {...settings.data} />);

          case 'pricing':
          case 'PricingInstrument':
            return withSkeleton(block.id, "pricing", <PricingInstrument {...settings.data} />);

          case 'cta':
          case 'CTAInstrument':
            return withSkeleton(block.id, "cta", <CTAInstrument {...settings.data} />);

          case 'reviews':
          case 'ReviewsInstrument':
            return withSkeleton(block.id, "reviews", <ReviewsInstrument {...settings.data} />);

          case 'how_it_works':
          case 'HowItWorksInstrument':
            return withSkeleton(block.id, "how_it_works", <HowItWorksInstrument {...settings.data} />);

          case 'bento':
          case 'BentoShowcase':
            return withSkeleton(block.id, "bento", <BentoShowcase {...settings.data} />);

          case 'faq':
          case 'AccordionInstrument':
            return withSkeleton(block.id, "faq", <AccordionInstrument {...settings.data} />);

          case 'workshop_carousel':
          case 'WorkshopCarousel':
            return withSkeleton(
              block.id,
              "workshop_carousel",
              <WorkshopCarousel workshops={extraData.workshops || []} {...settings.data} />
            );

          case 'workshop_calendar':
          case 'WorkshopCalendar':
            return withSkeleton(
              block.id,
              "workshop_calendar",
              <WorkshopCalendar workshops={extraData.workshops || []} {...settings.data} />
            );

          case 'workshop_quiz':
          case 'WorkshopQuiz':
            return withSkeleton(block.id, "workshop_quiz", <WorkshopQuiz {...settings.data} />);

          case 'interest_form':
          case 'WorkshopInterestForm':
            return withSkeleton(block.id, "interest_form", <WorkshopInterestForm {...settings.data} />);

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
