"use client";

import React, { useRef, useState } from 'react';
import { ContainerInstrument } from "@/components/ui/LayoutInstruments";
import { WorkshopCard } from './WorkshopCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSonicDNA } from '@/lib/sonic-dna';

interface WorkshopCarouselProps {
  workshops: any[];
}

export const WorkshopCarousel: React.FC<WorkshopCarouselProps> = ({ workshops: initialWorkshops }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playClick } = useSonicDNA();
  const [workshops, setWorkshops] = useState(initialWorkshops);

  const handleUpdate = (updatedWorkshop: any) => {
    setWorkshops(prev => prev.map(w => w.id === updatedWorkshop.id ? updatedWorkshop : w));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      playClick('light');
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <ContainerInstrument className="relative group/carousel">
      {/* Navigation Buttons */}
      <ContainerInstrument className="absolute -top-20 right-4 flex gap-4 z-20">
        <button 
          onClick={() => scroll('left')}
          className="w-12 h-12 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center text-black/40 hover:text-primary hover:border-primary/20 transition-all active:scale-90"
        >
          <ChevronLeft strokeWidth={1.5} size={24} />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="w-12 h-12 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center text-black/40 hover:text-primary hover:border-primary/20 transition-all active:scale-90"
        >
          <ChevronRight strokeWidth={1.5} size={24} />
        </button>
      </ContainerInstrument>

      {/* Carousel Container */}
      <ContainerInstrument 
        ref={scrollRef}
        plain
        className="flex gap-[30px] overflow-x-auto snap-x snap-mandatory no-scrollbar pb-12 px-4 -mx-4"
      >
        {workshops.map((workshop) => (
          <ContainerInstrument 
            key={workshop.id} 
            plain
            className="min-w-[300px] md:min-w-[400px] snap-start self-stretch"
          >
            <WorkshopCard workshop={workshop} onUpdate={handleUpdate} />
          </ContainerInstrument>
        ))}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
