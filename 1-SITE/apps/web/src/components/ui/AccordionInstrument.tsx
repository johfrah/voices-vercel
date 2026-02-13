"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { HeadingInstrument, TextInstrument } from './LayoutInstruments';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export const AccordionInstrument: React.FC<{ items: AccordionItem[] }> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="w-full space-y-4">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="border border-va-black/5 rounded-[32px] bg-white overflow-hidden transition-all duration-500 hover:shadow-lg"
        >
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full px-10 py-8 flex items-center justify-between text-left group"
          >
            <HeadingInstrument level={4} className="text-sm font-medium tracking-widest text-va-black/60 group-hover:text-va-black transition-colors">
              {item.title}
            </HeadingInstrument>
            <div className={`p-2 rounded-full bg-va-black/5 transition-transform duration-500 ${openId === item.id ? 'rotate-180 bg-primary text-va-black' : ''}`}>
              <ChevronDown size={18} strokeWidth={1.5} />
            </div>
          </button>
          <div 
            className={`transition-all duration-500 ease-in-out ${
              openId === item.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-10 pb-10 prose prose-lg text-va-black/40 font-medium">
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
