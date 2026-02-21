"use client";

import { Suspense } from 'react';
import { ContainerInstrument } from "@/components/ui/LayoutInstruments";
import { WorkshopCard } from './WorkshopCard';
import { WorkshopCardSkeleton } from './WorkshopCardSkeleton';

interface WorkshopGridProps {
  workshops: any[];
}

export const WorkshopGrid: React.FC<WorkshopGridProps> = ({ workshops }) => {
  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {workshops.map((workshop) => (
        <Suspense key={workshop.id} fallback={<WorkshopCardSkeleton />}>
          <WorkshopCard workshop={workshop} />
        </Suspense>
      ))}
    </ContainerInstrument>
  );
};
