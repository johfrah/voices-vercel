import React from "react";
import { ContainerInstrument } from "./LayoutInstruments";

function SkeletonBar({ className }: { className: string }) {
  return <ContainerInstrument plain className={`bg-va-black/8 rounded-full animate-pulse ${className}`} />;
}

function SkeletonCard({ className }: { className: string }) {
  return <ContainerInstrument plain className={`bg-va-black/6 rounded-[22px] animate-pulse ${className}`} />;
}

function HeroSkeleton() {
  return (
    <ContainerInstrument className="py-24 md:py-32">
      <ContainerInstrument className="max-w-6xl mx-auto px-6">
        <SkeletonBar className="h-10 w-40" />
        <SkeletonBar className="h-14 w-[70%] mt-6" />
        <SkeletonBar className="h-6 w-[52%] mt-4" />
        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10">
          <SkeletonCard className="h-44 lg:col-span-2" />
          <SkeletonCard className="h-44" />
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}

function MediumSectionSkeleton() {
  return (
    <ContainerInstrument className="py-20">
      <ContainerInstrument className="max-w-6xl mx-auto px-6">
        <SkeletonBar className="h-8 w-56" />
        <SkeletonBar className="h-5 w-[44%] mt-4" />
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          <SkeletonCard className="h-36" />
          <SkeletonCard className="h-36" />
          <SkeletonCard className="h-36" />
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}

function CompactSectionSkeleton() {
  return (
    <ContainerInstrument className="py-14">
      <ContainerInstrument className="max-w-5xl mx-auto px-6">
        <SkeletonCard className="h-28" />
      </ContainerInstrument>
    </ContainerInstrument>
  );
}

function normalizeType(type: string) {
  const rawType = (type || "").trim().toLowerCase();
  return rawType.endsWith("instrument") ? rawType.replace("instrument", "") : rawType;
}

export function InstrumentSkeleton({ type }: { type: string }) {
  const normalizedType = normalizeType(type);

  if (normalizedType === "hero" || normalizedType === "bento" || normalizedType === "bentoshowcase") {
    return <HeroSkeleton />;
  }

  if (
    normalizedType === "pricing" ||
    normalizedType === "reviews" ||
    normalizedType === "how_it_works" ||
    normalizedType === "workshop_carousel" ||
    normalizedType === "workshop_calendar" ||
    normalizedType === "workshop_quiz" ||
    normalizedType === "interest_form"
  ) {
    return <MediumSectionSkeleton />;
  }

  if (normalizedType === "cta" || normalizedType === "faq" || normalizedType === "accordion") {
    return <CompactSectionSkeleton />;
  }

  return <MediumSectionSkeleton />;
}
