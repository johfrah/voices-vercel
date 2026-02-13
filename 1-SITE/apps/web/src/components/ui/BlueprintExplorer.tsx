"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Clock, Target, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from './LayoutInstruments';

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
    <ContainerInstrument className="my-8 md:my-12 space-y-6 md:space-y-8">
      <ContainerInstrument className="flex flex-wrap gap-2">
        {blueprints.map((b) => (
          <ButtonInstrument
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
          </ButtonInstrument>
        ))}
      </ContainerInstrument>

      <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 bg-white rounded-[40px] p-6 md:p-12 border border-black/5 shadow-aura overflow-hidden relative">
        <ContainerInstrument className="lg:col-span-2 space-y-6 md:space-y-8">
          <ContainerInstrument className="space-y-2">
            <HeadingInstrument level={3} className="text-xl md:text-2xl font-light tracking-tight">{selected.title}</HeadingInstrument>
            <ContainerInstrument className="flex flex-wrap gap-3 md:gap-4">
              <ContainerInstrument className="flex items-center gap-1.5 text-[15px] font-black tracking-widest text-va-black/30">
                <Target strokeWidth={1.5} size={12} className="text-primary" /> {selected.goal}
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-1.5 text-[15px] font-black tracking-widest text-va-black/30">
                <Clock strokeWidth={1.5} size={12} className="text-primary" /> {selected.timing}
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="prose prose-va max-w-none text-va-black/70 font-medium leading-relaxed whitespace-pre-wrap bg-va-off-white/50 p-6 md:p-8 rounded-[32px] border border-black/5">
            {selected.body}
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="space-y-4 md:space-y-6">
          <ContainerInstrument className="bg-primary/5 p-4 md:p-6 rounded-[32px] border border-primary/10 space-y-3 md:space-y-4">
            <ContainerInstrument className="flex items-center gap-2 text-primary">
              <Lightbulb strokeWidth={1.5} size={18} />
              <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-primary"><VoiceglotText  translationKey="auto.blueprintexplorer.schrijftip.22d502" defaultText="Schrijftip" /></HeadingInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-[15px] font-medium text-va-black/60 leading-relaxed italic"><VoiceglotText  translationKey="auto.blueprintexplorer._quot_voor_dit_genre.27e7d0" defaultText="&quot;Voor dit genre is het essentieel om de emotie te doseren. Een echte stemacteur begrijpt de nuance tussen informeren en overtuigen.&quot;" /></TextInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="p-4 md:p-6 bg-va-black rounded-[32px] text-white space-y-3 md:space-y-4">
            <TextInstrument className="text-[15px] font-black tracking-[0.2em] text-white/40"><VoiceglotText  translationKey="auto.blueprintexplorer.klaar_om_te_laten_in.d9c374" defaultText="Klaar om te laten inspreken?" /></TextInstrument>
            <HeadingInstrument level={4} className="text-lg font-light tracking-tight leading-none">
              <VoiceglotText  translationKey="common.choose_voice" defaultText="Kies je stem" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] text-white/60 leading-relaxed font-light"><VoiceglotText  translationKey="auto.blueprintexplorer.onze_top_selectie_va.5b06ac" defaultText="Onze top-selectie van stemacteurs staat klaar om jouw unieke script tot leven te brengen." /></TextInstrument>
            <ButtonInstrument className="w-full py-3 md:py-4 bg-primary text-white rounded-2xl text-[15px] font-black tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2">
              <VoiceglotText  translationKey="common.view_all_voices" defaultText="Bekijk alle stemmen" /> <ArrowRight strokeWidth={1.5} size={14} />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
