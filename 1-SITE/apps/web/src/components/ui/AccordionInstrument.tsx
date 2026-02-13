"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export const AccordionInstrument: React.FC<{ items: AccordionItem[] }> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ContainerInstrument className="w-full space-y-4">
      {items.map((item) => (
        <ContainerInstrument 
          key={item.id} 
          className="border border-va-black/5 rounded-[32px] bg-white overflow-hidden transition-all duration-500 hover:shadow-lg"
        >
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full px-10 py-8 flex items-center justify-between text-left group"
          >
            <HeadingInstrument level={4} className="text-[17px] font-light tracking-wider text-va-black group-hover:text-primary transition-colors">
              {item.title}
            </HeadingInstrument>
            <ContainerInstrument className={`p-2 rounded-full bg-va-black/5 transition-all duration-500 flex items-center justify-center ${openId === item.id ? 'rotate-180 bg-primary text-va-black' : ''}`}>
              <Image  
                src="/assets/common/branding/icons/DOWN.svg" 
                alt="Toggle" 
                width={18} 
                height={18} 
                style={openId === item.id ? { filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' } : { filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
              />
            </ContainerInstrument>
          </button>
          <ContainerInstrument 
            className={`transition-all duration-500 ease-in-out ${
              openId === item.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <ContainerInstrument className="px-10 pb-10 prose prose-lg text-va-black/70 font-light leading-relaxed">
              <ContainerInstrument dangerouslySetInnerHTML={{ __html: item.content }} />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      ))}
    </ContainerInstrument>
  );
};
