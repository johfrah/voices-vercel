"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Clock, Target, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Blueprint {
  title: string;
  slug: string;
  genre: string;
  goal: string;
  timing: string;
  body: string;
}

export const BlueprintExplorer: React.FC<{ journey: string }> = ({ journey }) => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlueprints = async () => {
      try {
        const response = await fetch(`/api/blueprints?journey=${journey}`);
        if (response.ok) {
          const data = await response.json();
          setBlueprints(data);
          if (data.length > 0) setSelectedSlug(data[0].slug);
        }
      } catch (e) {
        console.error("Failed to fetch blueprints", e);
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprints();
  }, [journey]);

  if (loading || blueprints.length === 0) return null;

  const selected = blueprints.find(b => b.slug === selectedSlug) || blueprints[0];

  return (
    <div className="my-12 space-y-8">
      <div className="flex flex-wrap gap-2">
        {blueprints.map((b) => (
          <button
            key={b.slug}
            onClick={() => setSelectedSlug(b.slug)}
            className={cn(
              "px-4 py-2 rounded-full text-[15px] font-black uppercase tracking-widest transition-all border",
              selectedSlug === b.slug 
                ? "bg-va-black text-white border-va-black shadow-lg" 
                : "bg-white text-va-black/40 border-black/5 hover:border-black/10"
            )}
          >
            {b.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white rounded-[40px] p-8 md:p-12 border border-black/5 shadow-aura overflow-hidden relative">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">{selected.title}</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-[15px] font-black tracking-widest text-va-black/30">
                <Target size={12} className="text-primary" /> {selected.goal}
              </div>
              <div className="flex items-center gap-1.5 text-[15px] font-black tracking-widest text-va-black/30">
                <Clock size={12} className="text-primary" /> {selected.timing}
              </div>
            </div>
          </div>

          <div className="prose prose-va max-w-none text-va-black/70 font-medium leading-relaxed whitespace-pre-wrap bg-va-off-white/50 p-8 rounded-[32px] border border-black/5">
            {selected.body}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb size={18} />
              <h4 className="text-[15px] font-black tracking-widest text-primary">Schrijftip</h4>
            </div>
            <p className="text-[15px] font-medium text-va-black/60 leading-relaxed italic">
              &quot;Voor dit genre is het essentieel om de emotie te doseren. Een echte stemacteur begrijpt de nuance tussen informeren en overtuigen.&quot;
            </p>
          </div>

          <div className="p-6 bg-va-black rounded-[32px] text-white space-y-4">
            <p className="text-[15px] font-black tracking-[0.2em] text-white/40">Klaar om te laten inspreken?</p>
            <h4 className="text-lg font-black tracking-tight leading-none">Kies je stem</h4>
            <p className="text-[15px] text-white/60 leading-relaxed">Onze top-selectie van stemacteurs staat klaar om jouw unieke script tot leven te brengen.</p>
            <button className="w-full py-4 bg-primary text-white rounded-2xl text-[15px] font-black tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2">
              Bekijk alle stemmen <ArrowRight strokeWidth={1.5} size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
