"use client";

import { useVoicesState } from '@/contexts/VoicesStateContext';
import { calculateDeliveryDate } from '@/lib/delivery-logic';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Actor } from '@/types';
import { Calendar, ChevronRight, Mic, Play, Quote, Star } from 'lucide-react';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { BentoCard } from './BentoGrid';
import { VoiceglotText } from './VoiceglotText';

interface VoiceCardProps {
  voice: Actor;
  onSelect?: (voice: Actor) => void;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({ voice, onSelect }) => {
  const { playClick, playSwell } = useSonicDNA();
  const { state, getPlaceholderValue } = useVoicesState();

  const deliveryInfo = useMemo(() => {
    return calculateDeliveryDate({
      deliveryDaysMin: voice.delivery_days_min || 1,
      deliveryDaysMax: voice.delivery_days_max || 3,
      cutoffTime: voice.cutoff_time || '18:00',
      availability: voice.availability || []
    });
  }, [voice]);

  const handlePlayDemo = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick('pro');
    onSelect?.(voice);
  };

  const displayPrice = voice.starting_price || 0;

  // Sector-specific demo text logic (Beheer-modus)
  const getSectorDemoText = () => {
    const company = getPlaceholderValue('company_name');
    switch (state.current_sector) {
      case 'gezondheidszorg':
        return `Welkom bij ${company}. Voor dringende medische hulp, bel 112. Voor een afspraak, blijf aan de lijn.`;
      case 'bouw':
        return `Bedankt voor het bellen naar ${company}. Wij realiseren uw droomproject van fundering tot dak.`;
      case 'it':
        return `U bent verbonden met de support desk van ${company}. Al onze consultants zijn momenteel in gesprek.`;
      case 'juridisch':
        return `Welkom bij ${company}. Onze advocaten staan u graag bij met deskundig juridisch advies.`;
      default:
        return null;
    }
  };

  const sectorDemo = getSectorDemoText();

  return (
    <BentoCard 
      span="md" 
      className="group cursor-pointer bg-white border border-gray-100 rounded-[40px] p-8 transition-all duration-700 hover:shadow-[0_40px_80px_-16px_rgba(0,0,0,0.12)] hover:-translate-y-1 relative overflow-hidden golden-curve" 
      onClick={() => {
        playClick('soft');
        onSelect?.(voice);
      }}
      onMouseEnter={() => playSwell()}
    >
      {/* Liquid Aura (Tone of Voice) */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors duration-1000"></div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Header: Photo & Identity */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative w-20 h-20 rounded-[28px] overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-700">
              {voice.photo_url ? (
                <Image 
                  src={voice.photo_url} 
                  alt={voice.display_name} 
                  fill
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-va-off-white flex items-center justify-center">
                  <Mic size={24} className="text-va-black/20" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-black tracking-tighter uppercase text-va-black">
                  <VoiceglotText 
                    translationKey={`actor.${voice.id}.name`} 
                    defaultText={voice.display_name} 
                    noTranslate={true} 
                  />
                </h3>
                {voice.voice_score > 90 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 text-yellow-600 rounded-full">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      <VoiceglotText translationKey="common.selected" defaultText="Geselecteerd" />
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-black text-va-black/30 uppercase tracking-[0.2em]">
                <VoiceglotText translationKey={`common.language.${voice.native_lang?.toLowerCase()}`} defaultText={voice.native_lang || ''} /> | {voice.gender === 'Mannelijke stem' ? <VoiceglotText translationKey="common.gender.male" defaultText="Man" /> : <VoiceglotText translationKey="common.gender.female" defaultText="Vrouw" />}
              </p>
            </div>
          </div>

          {/* Audio Player (MediaMaster Lite) */}
          <div 
            className="bg-va-off-white/50 rounded-3xl p-4 flex items-center gap-4 group/player cursor-pointer mb-6 border border-black/5 hover:bg-white transition-colors duration-500" 
            onClick={handlePlayDemo}
          >
            <div className="w-12 h-12 rounded-2xl bg-white text-va-black shadow-sm flex items-center justify-center group-hover/player:bg-primary group-hover/player:text-white transition-all duration-500 group-hover/player:scale-110">
              <Play size={20} fill="currentColor" className="ml-1" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                <VoiceglotText translationKey="common.listen_demo" defaultText="Beluister demo" />
              </p>
              <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-0 group-hover/player:w-1/3 transition-all duration-[2000ms]"></div>
              </div>
            </div>
          </div>

          {/* Sector Demo (Beheer-modus) */}
          {sectorDemo ? (
            <div className="mb-6 p-5 bg-primary/5 rounded-3xl border border-primary/10 animate-in fade-in zoom-in-95 duration-700">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Quote size={12} fill="currentColor" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                  <VoiceglotText translationKey="common.for_your_sector" defaultText="Voor uw sector" />
                </span>
              </div>
              <p className="text-[11px] font-medium text-va-black/60 italic leading-relaxed">
                &quot;{sectorDemo}&quot;
              </p>
            </div>
          ) : (
            <div className="mb-8">
              {(voice as any).bio ? (
                <p className="text-sm text-va-black/50 font-medium leading-relaxed italic mb-4 line-clamp-2">
                  &quot;<VoiceglotText translationKey={`actor.${voice.id}.bio`} defaultText={(voice as any).bio} />&quot;
                </p>
              ) : (
                <p className="text-sm text-va-black/50 font-medium leading-relaxed italic mb-4">
                  &quot;<VoiceglotText translationKey="common.fallback_bio" defaultText="Professionele voice-over voor al uw projecten. Van commercials tot luisterboeken." />&quot;
                </p>
              )}
              {voice.ai_tags && (
                <div className="flex flex-wrap gap-2">
                  {(typeof voice.ai_tags === 'string' ? voice.ai_tags.split(',') : (Array.isArray(voice.ai_tags) ? voice.ai_tags : [])).map((tag: any, i: number) => {
                    const tagStr = String(tag).trim();
                    const isAi = tagStr.startsWith('ai:');
                    const label = isAi ? tagStr.replace('ai:', '') : tagStr;
                    return (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-va-off-white rounded-full text-[8px] font-black uppercase tracking-widest text-va-black/40 border border-black/5">
                        <VoiceglotText translationKey={`common.tag.${label.toLowerCase()}`} defaultText={label} />
                        {isAi && <span className="text-[6px] bg-primary/10 text-primary px-1 rounded-sm">AI</span>}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: Price & Action */}
        <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-va-black/30 uppercase tracking-widest mb-1">
              <Calendar size={10} className="text-primary" />
              <VoiceglotText translationKey="common.ready" defaultText="Klaar" />: {deliveryInfo.formattedShort}
            </div>
            <p className="text-2xl font-black tracking-tighter text-va-black">€{displayPrice}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              playClick('success');
              if (typeof window !== 'undefined') {
                window.location.href = `/voice/${voice.slug}`;
              }
            }}
            className="w-full sm:w-auto bg-va-dark text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-xl shadow-black/5 flex items-center justify-center gap-2"
          >
            <VoiceglotText translationKey="common.order_fast" defaultText="Snel Bestellen" />
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </BentoCard>
  );
};
