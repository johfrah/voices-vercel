"use client";

import React, { useState } from 'react';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument } from './LayoutInstruments';

interface TabItem {
  id: string;
  title: string;
  content: string;
}

export const TabsInstrument: React.FC<{ items: TabItem[] }> = ({ items }) => {
  const [activeId, setActiveId] = useState(items[0]?.id);

  return (
    <ContainerInstrument className="w-full bg-va-black text-white p-8 md:p-12 rounded-[32px] md:rounded-[60px] shadow-2xl relative overflow-hidden">
      <ContainerInstrument className="relative z-10">
        <ContainerInstrument className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-16">
          {items.map((item) => (
            <ButtonInstrument
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[15px] md:text-[15px] tracking-[0.2em] transition-all duration-500 ${
                activeId === item.id 
                  ? 'bg-primary text-va-black scale-105 shadow-lg shadow-primary/20' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {item.title}
            </ButtonInstrument>
          ))}
        </ContainerInstrument>
        
        <ContainerInstrument className="min-h-[250px] md:min-h-[300px]">
          {items.map((item) => (
            <ContainerInstrument 
              key={item.id}
              className={`transition-all duration-700 ${
                activeId === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'
              }`}
            >
              <ContainerInstrument className="prose prose-lg md:prose-2xl prose-invert max-w-4xl font-medium leading-tight opacity-80">
                <ContainerInstrument dangerouslySetInnerHTML={{ __html: item.content }} />
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>
      <ContainerInstrument className="absolute -top-40 -right-40 w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full blur-[100px] md:blur-[120px]" />
    </ContainerInstrument>
  );
};
