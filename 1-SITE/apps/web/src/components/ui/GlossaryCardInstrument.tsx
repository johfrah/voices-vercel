"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { VoicesLinkInstrument as Link } from '@/components/ui/VoicesLinkInstrument';

interface GlossaryCardProps {
  term: string;
}

export const GlossaryCard: React.FC<GlossaryCardProps> = ({ term }) => {
  const [definition, setDefinition] = useState<{ title: string; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlossary = async () => {
      try {
        const res = await fetch('/api/academy/glossary');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const found = data.find((item: any) => 
            item.term.toLowerCase() === term.toLowerCase() || 
            item.term.toLowerCase().includes(term.toLowerCase())
          );
          
          if (found) {
            setDefinition({ title: found.term, text: found.definition });
          } else {
            setDefinition({ title: term, text: 'Definitie wordt geladen uit de kennisbank...' });
          }
        }
      } catch (error) {
        console.error('Failed to fetch glossary term:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlossary();
  }, [term]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm my-6 flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={18} />
        <span className="text-[15px] font-light tracking-widest text-va-black/40">Kennisbank doorzoeken...</span>
      </div>
    );
  }

  const displayTitle = definition?.title || term;
  const displayText = definition?.text || 'Definitie volgt...';

  return (
    <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm my-6 flex items-start gap-4 group hover:border-primary/20 transition-all">
      <div className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center text-va-black/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
        <BookOpen strokeWidth={1.5} size={18} />
      </div>
      <div>
        <h4 className="text-[15px] font-light tracking-widest mb-1">{displayTitle}</h4>
        <p className="text-[15px] text-va-black/60 leading-relaxed mb-3">{displayText}</p>
        <Link  href={`/glossary/${term}`} className="inline-flex items-center gap-1.5 text-[15px] font-black tracking-widest text-primary hover:gap-2 transition-all">
          Lees meer in de kennisbank <ArrowRight strokeWidth={1.5} size={10} />
        </Link>
      </div>
    </div>
  );
};
