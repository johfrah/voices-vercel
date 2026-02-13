"use client";

import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { calculateDeliveryDate } from '@/lib/delivery-logic';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Actor, Demo } from '@/types';
import { Calendar, ChevronRight, Mic, Play, Quote, Star, Monitor, Radio, Globe, Mic2, Phone, Building2, BookOpen, Wind, Plus, Check } from 'lucide-react';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { BentoCard } from './BentoGrid';
import { VoiceglotText } from './VoiceglotText';

interface VoiceCardProps {
  voice: Actor;
  onSelect?: (voice: Actor) => void;
}

/**
 * CATEGORY DEFINITIONS (The Big 8)
 * Gebruikt Lucide icons met strokeWidth 1.5 voor de Ademing-feel.
 */
const CATEGORIES = [
  { id: 'tv', icon: Monitor, label: 'TV', key: 'category.tv' },
  { id: 'radio', icon: Radio, label: 'Radio', key: 'category.radio' },
  { id: 'online', icon: Globe, label: 'Online', key: 'category.online' },
  { id: 'podcast', icon: Mic2, label: 'Podcast', key: 'category.podcast' },
  { id: 'telefonie', icon: Phone, label: 'Telefonie', key: 'category.telephony' },
  { id: 'corporate', icon: Building2, label: 'Corporate', key: 'category.corporate' },
  { id: 'e-learning', icon: BookOpen, label: 'E-learning', key: 'category.elearning' },
  { id: 'meditatie', icon: Wind, label: 'Meditatie', key: 'category.meditation' },
];

export const VoiceCard: React.FC<VoiceCardProps> = ({ voice, onSelect }) => {
  const { playClick, playSwell } = useSonicDNA();
  const { state, getPlaceholderValue, toggleActorSelection } = useVoicesState();
  const { activeDemo, playDemo } = useGlobalAudio();

  const isSelected = state.selected_actors.some(a => a.id === voice.id);

  const handleStudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick(isSelected ? 'soft' : 'success');
    toggleActorSelection({
      id: voice.id,
      firstName: voice.firstName || voice.display_name?.split(' ')[0] || 'Stem',
      photoUrl: voice.photo_url
    });
  };

  const deliveryInfo = useMemo(() => {
    return calculateDeliveryDate({
      deliveryDaysMin: voice.delivery_days_min || 1,
      deliveryDaysMax: voice.delivery_days_max || 3,
      cutoffTime: voice.cutoff_time || '18:00',
      availability: voice.availability || []
    });
  }, [voice]);

  // Map demo's naar categorieën op basis van titel/type
  const categorizedDemos = useMemo(() => {
    const map: Record<string, Demo> = {};
    if (!voice.demos) return map;

    voice.demos.forEach(demo => {
      const title = demo.title.toLowerCase();
      if (title.includes('tv')) map['tv'] = demo;
      else if (title.includes('radio')) map['radio'] = demo;
      else if (title.includes('online') || title.includes('social')) map['online'] = demo;
      else if (title.includes('podcast')) map['podcast'] = demo;
      else if (title.includes('ivr') || title.includes('telefoon') || title.includes('telefonie')) map['telefonie'] = demo;
      else if (title.includes('corporate') || title.includes('bedrijf')) map['corporate'] = demo;
      else if (title.includes('learning') || title.includes('uitleg')) map['e-learning'] = demo;
      else if (title.includes('meditatie') || title.includes('ademing')) map['meditatie'] = demo;
    });

    // Fallback: als er geen matches zijn, zet de eerste demo in de meest logische categorie of 'online'
    if (Object.keys(map).length === 0 && voice.demos.length > 0) {
      map['online'] = voice.demos[0];
    }

    return map;
  }, [voice.demos]);

  const handleCategoryClick = (e: React.MouseEvent, demo: Demo) => {
    e.stopPropagation();
    playClick('pro');
    playDemo(demo);
  };

  const displayPrice = useMemo(() => {
    const base = parseFloat(voice.starting_price?.toString() || '0');
    const ivr = parseFloat(voice.price_ivr?.toString() || '0');
    const online = parseFloat(voice.price_online?.toString() || '0');

    switch (state.current_journey) {
      case 'telephony': return ivr || base;
      case 'commercial': return online || base;
      case 'video': return base;
      default: return base;
    }
  }, [voice, state.current_journey]);

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
      className={cn(
        "group cursor-pointer bg-white border rounded-[20px] p-8 transition-all duration-700 hover:shadow-aura hover:-translate-y-1 relative overflow-hidden va-interactive",
        isSelected ? "border-primary ring-1 ring-primary/20" : "border-gray-100"
      )}
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
              {/* Studio Toggle Overlay */}
              <button 
                onClick={handleStudioToggle}
                className={cn(
                  "absolute top-2 right-2 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 transition-all duration-300 z-20 border border-white/20",
                  isSelected 
                    ? "bg-primary text-white scale-105 shadow-lg" 
                    : "bg-black/40 text-white/90 hover:bg-black/60 opacity-0 group-hover:opacity-100"
                )}
              >
                {isSelected ? (
                  <>
                    <Check size={12} />
                    <span className="text-[15px] font-bold tracking-widest ">In Studio</span>
                  </>
                ) : (
                  <>
                    <Plus size={12} />
                    <span className="text-[15px] font-bold tracking-widest text-white/80">Gratis Demo</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-light tracking-tighter text-va-black">
                  <VoiceglotText 
                    translationKey={`actor.${voice.id}.name`} 
                    defaultText={voice.display_name} 
                    noTranslate={true} 
                  />
                </h3>
                {voice.voice_score > 90 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 text-yellow-600 rounded-full">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[15px] font-medium tracking-widest">
                      <VoiceglotText translationKey="common.selected" defaultText="Geselecteerd" />
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[15px] font-medium text-va-black/30 tracking-[0.2em]">
                <VoiceglotText translationKey={`common.language.${voice.native_lang?.toLowerCase()}`} defaultText={voice.native_lang || ''} /> | {voice.gender === 'Mannelijke stem' ? <VoiceglotText translationKey="common.gender.male" defaultText="Man" /> : <VoiceglotText translationKey="common.gender.female" defaultText="Vrouw" />}
              </p>
            </div>
          </div>

          {/* Category Selector (The Big 8) */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((cat) => {
              const demo = categorizedDemos[cat.id];
              if (!demo) return null;
              const isActive = activeDemo?.id === demo.id;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.id}
                  onClick={(e) => handleCategoryClick(e, demo)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary border-primary text-va-black shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-va-off-white border-black/5 text-va-black/40 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  <Icon size={12} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'opacity-100' : 'opacity-60'} />
                  <span className="text-[15px] font-medium tracking-widest">
                    <VoiceglotText translationKey={cat.key} defaultText={cat.label} />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sector Demo (Beheer-modus) */}
          {sectorDemo ? (
            <div className="mb-6 p-5 bg-primary/5 rounded-3xl border border-primary/10 animate-in fade-in zoom-in-95 duration-700">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Quote size={12} fill="currentColor" />
                <span className="text-[15px] font-medium tracking-[0.2em]">
                  <VoiceglotText translationKey="common.for_your_sector" defaultText="Voor uw sector" />
                </span>
              </div>
              <p className="text-[15px] font-medium text-va-black/60 italic leading-relaxed">
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
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-va-off-white rounded-full text-[15px] font-medium tracking-widest text-va-black/40 border border-black/5">
                        <VoiceglotText translationKey={`common.tag.${label.toLowerCase()}`} defaultText={label} />
                        {isAi && <span className="text-[15px] bg-primary/10 text-primary px-1 rounded-sm">AI</span>}
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
            <div className="flex items-center gap-1.5 text-[15px] font-medium text-va-black/30 tracking-widest mb-1">
              <Calendar size={10} className="text-primary" />
              <VoiceglotText translationKey="common.ready" defaultText="Klaar" />: {deliveryInfo.formattedShort}
            </div>
            <p className="text-2xl font-light tracking-tighter text-va-black">€{displayPrice}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              playClick('success');
              if (typeof window !== 'undefined') {
                window.location.href = `/voice/${voice.slug}`;
              }
            }}
            className="w-full sm:w-auto bg-va-dark text-white px-6 py-4 rounded-[10px] text-[15px] font-light tracking-widest hover:bg-primary transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-xl shadow-black/5 flex items-center justify-center gap-2 "
          >
            <VoiceglotText translationKey="common.order_fast" defaultText="Snel Bestellen" />
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </BentoCard>
  );
};
