"use client";

import React, { useState } from 'react';
import { HeadingInstrument } from './LayoutInstruments';

interface TabItem {
  id: string;
  title: string;
  content: string;
}

export const TabsInstrument: React.FC<{ items: TabItem[] }> = ({ items }) => {
  const [activeId, setActiveId] = useState(items[0]?.id);

  return (
    <ContainerInstrument className="w-full bg-va-black text-white p-12 rounded-[60px] shadow-2xl relative overflow-hidden">
      <ContainerInstrument className="relative z-10">
        <ContainerInstrument className="flex flex-wrap gap-3 mb-16">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`px-8 py-4 rounded-2xl font-black uppercase text-[15px] tracking-[0.2em] transition-all duration-500 ${
                activeId === item.id 
                  ? 'bg-primary text-va-black scale-105 shadow-lg shadow-primary/20' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {item.title}
            </button>
          ))}
        </ContainerInstrument>
        
        <ContainerInstrument className="min-h-[300px]">
          {items.map((item) => (
            <ContainerInstrument 
              key={item.id}
              className={`transition-all duration-700 ${
                activeId === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'
              }`}
            >
              <ContainerInstrument className="prose prose-2xl prose-invert max-w-4xl font-medium leading-tight opacity-80">
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>
      <ContainerInstrument className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
    </ContainerInstrument>
  );
};
