"use client";

import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { calculateDeliveryDate } from '@/lib/delivery-logic';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { Actor, Demo } from '@/types';
import { Check, Mic, Plus, Star, Play, Volume2 } from 'lucide-react';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { BentoCard } from './BentoGrid';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';

interface VoiceCardProps {
  voice: Actor;
  onSelect?: (voice: Actor) => void;
}

/**
 * CATEGORY DEFINITIONS (The Big 8)
 * Gebruikt legacy SVG icons voor het echte Voices DNA.
 */
const CATEGORIES = [
  { id: 'tv', src: '/assets/common/branding/icons/INFO.svg', label: 'TV', key: 'category.tv' },
  { id: 'radio', src: '/assets/common/branding/icons/INFO.svg', label: 'Radio', key: 'category.radio' },
  { id: 'online', src: '/assets/common/branding/icons/INFO.svg', label: 'Online', key: 'category.online' },
  { id: 'podcast', src: '/assets/common/branding/icons/INFO.svg', label: 'Podcast', key: 'category.podcast' },
  { id: 'telefonie', src: '/assets/common/branding/icons/INFO.svg', label: 'Telefonie', key: 'category.telephony' },
  { id: 'corporate', src: '/assets/common/branding/icons/INFO.svg', label: 'Corporate', key: 'category.corporate' },
  { id: 'e-learning', src: '/assets/common/branding/icons/INFO.svg', label: 'E-learning', key: 'category.elearning' },
  { id: 'meditatie', src: '/assets/common/branding/icons/INFO.svg', label: 'Meditatie', key: 'category.meditation' },
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

  const handleMouseEnter = () => {
    playSwell();
    // Sherlock: Hover-to-Hear (Micro-Demo)
    if (voice.demos && voice.demos.length > 0 && !activeDemo) {
      const timer = setTimeout(() => {
        playDemo({
          ...voice.demos[0],
          actor_name: voice.display_name,
          actor_photo: voice.photo_url
        });
      }, 800); // Subtiele vertraging om onbedoeld afspelen te voorkomen
      return () => clearTimeout(timer);
    }
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
    playDemo({
      ...demo,
      actor_name: voice.display_name,
      actor_photo: voice.photo_url
    });
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
      onMouseEnter={handleMouseEnter}
    >
      {/* Liquid Aura (Tone of Voice - Sherlock: Liquid Haptics) */}
      <ContainerInstrument 
        className={cn(
          "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] transition-all duration-1000",
          activeDemo?.actor_name === voice.display_name ? "bg-primary/20 scale-125" : "bg-primary/5 group-hover:bg-primary/10"
        )}
      ></ContainerInstrument>

      <ContainerInstrument className="relative z-10 flex flex-col h-full justify-between">
        <ContainerInstrument>
          {/* Header: Photo & Identity */}
          <ContainerInstrument className="flex items-start gap-5 mb-8">
            <ContainerInstrument className="relative w-24 h-24 md:w-28 md:h-28 rounded-[32px] overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-700 shrink-0">
              {voice.photo_url ? (
                <VoiceglotImage 
                  src={voice.photo_url} 
                  alt={voice.display_name} 
                  fill
                  className="object-cover" 
                />
              ) : (
                <ContainerInstrument className="w-full h-full bg-va-off-white flex items-center justify-center">
                  <Mic size={32} className="text-va-black/20" />
                </ContainerInstrument>
              )}
              
              {/* Play Overlay (Sherlock: Speed-to-Sound) */}
              <ContainerInstrument 
                className={cn(
                  "absolute inset-0 bg-va-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  activeDemo?.actor_name === voice.display_name && "opacity-100 bg-primary/20"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (voice.demos && voice.demos.length > 0) {
                    handleCategoryClick(e, voice.demos[0]);
                  }
                }}
              >
                <ContainerInstrument className="w-12 h-12 rounded-full bg-white text-va-black flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-500">
                  {activeDemo?.actor_name === voice.display_name ? <Volume2 size={24} className="animate-pulse" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </ContainerInstrument>
              </ContainerInstrument>

              {/* Studio Toggle Overlay */}
              <ButtonInstrument 
                onClick={handleStudioToggle}
                className={cn(
                  "absolute top-2 right-2 p-2 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-20 border border-white/20",
                  isSelected 
                    ? "bg-primary text-white scale-105 shadow-lg" 
                    : "bg-black/40 text-white/90 hover:bg-black/60 opacity-0 group-hover:opacity-100"
                )}
              >
                {isSelected ? <Check size={14} strokeWidth={1.5} /> : <Plus size={14} strokeWidth={1.5} />}
              </ButtonInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="flex-1 min-w-0">
              <ContainerInstrument className="flex flex-col gap-1 mb-3">
                <HeadingInstrument level={3} className="text-2xl md:text-3xl font-light tracking-tighter text-va-black truncate">
                  <VoiceglotText 
                    translationKey={`actor.${voice.id}.name`} 
                    defaultText={voice.display_name} 
                    noTranslate={true} 
                  />
                </HeadingInstrument>
                
                <ContainerInstrument className="flex items-center gap-2">
                  <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-[0.2em] ">
                    <VoiceglotText translationKey={`common.language.${voice.native_lang?.toLowerCase()}`} defaultText={voice.native_lang || ''} />
                  </TextInstrument>
                  <ContainerInstrument className="w-1 h-1 rounded-full bg-va-black/10" />
                  <TextInstrument className="text-[15px] font-light text-primary tracking-widest ">
                    {deliveryInfo.formattedShort}
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="flex items-center gap-3">
                <TextInstrument className="text-2xl font-light tracking-tighter text-va-black">€{displayPrice}</TextInstrument>
                {voice.voice_score > 90 && (
                  <ContainerInstrument className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 text-yellow-600 rounded-full">
                    <Star strokeWidth={1.5} size={10} fill="currentColor" />
                    <TextInstrument className="text-[15px] font-bold tracking-widest ">Top</TextInstrument>
                  </ContainerInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Category Selector (The Big 8 - Sherlock: Smart Category Highlighting) */}
          <ContainerInstrument className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((cat) => {
              const demo = categorizedDemos[cat.id];
              if (!demo) return null;
              const isActive = activeDemo?.id === demo.id;
              
              // Sherlock: Highlight op basis van journey context
              const isContextMatch = 
                (state.current_journey === 'telephony' && cat.id === 'telefonie') ||
                (state.current_journey === 'commercial' && (cat.id === 'tv' || cat.id === 'radio' || cat.id === 'online')) ||
                (state.current_journey === 'video' && (cat.id === 'online' || cat.id === 'corporate'));

              return (
                <ButtonInstrument
                  key={cat.id}
                  onClick={(e) => handleCategoryClick(e, demo)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-300",
                    isActive 
                      ? "bg-primary border-primary text-va-black shadow-lg shadow-primary/20 scale-105" 
                      : isContextMatch
                        ? "bg-primary/5 border-primary/20 text-primary"
                        : "bg-va-off-white border-black/5 text-va-black/40 hover:border-primary/30 hover:text-primary"
                  )}
                >
                  <ContainerInstrument className="w-3 h-3 relative">
                    <VoiceglotImage 
                      src={cat.src} 
                      alt={cat.label} 
                      fill 
                      className={cn("transition-all duration-300", isActive ? "brightness-0" : "opacity-60")}
                      style={!isActive ? { filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' } : {}}
                    />
                  </ContainerInstrument>
                  <TextInstrument className="text-[15px] font-light tracking-widest">
                    <VoiceglotText translationKey={cat.key} defaultText={cat.label} />
                  </TextInstrument>
                </ButtonInstrument>
              );
            })}
          </ContainerInstrument>

          {/* Sector Demo (Beheer-modus) */}
          {sectorDemo ? (
            <ContainerInstrument className="mb-6 p-5 bg-primary/5 rounded-3xl border border-primary/10 animate-in fade-in zoom-in-95 duration-700">
              <ContainerInstrument className="flex items-center gap-2 mb-2 text-primary">
                <VoiceglotImage 
                  src="/assets/common/branding/icons/INFO.svg" 
                  alt="Info" 
                  width={12} 
                  height={12} 
                  style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                />
                <TextInstrument className="text-[15px] font-light tracking-[0.2em]">
                  <VoiceglotText translationKey="common.for_your_sector" defaultText="Voor uw sector" />
                </TextInstrument>
              </ContainerInstrument>
              <TextInstrument className="text-[15px] font-light text-va-black/60 italic leading-relaxed">
                &quot;{sectorDemo}&quot;
              </TextInstrument>
            </ContainerInstrument>
          ) : (
            <ContainerInstrument className="mb-8">
              {(voice as any).bio ? (
                <TextInstrument className="text-[15px] text-va-black/50 font-light leading-relaxed italic mb-4 line-clamp-2">
                  &quot;<VoiceglotText translationKey={`actor.${voice.id}.bio`} defaultText={(voice as any).bio} />&quot;
                </TextInstrument>
              ) : (
                <TextInstrument className="text-[15px] text-va-black/50 font-light leading-relaxed italic mb-4">
                  &quot;<VoiceglotText translationKey="common.fallback_bio" defaultText="Professionele voice-over for al uw projecten. Van commercials tot luisterboeken." />&quot;
                </TextInstrument>
              )}
              {voice.ai_tags && (
                <ContainerInstrument className="flex flex-wrap gap-2">
                  {(typeof voice.ai_tags === 'string' ? voice.ai_tags.split(',') : (Array.isArray(voice.ai_tags) ? voice.ai_tags : [])).map((tag: any, i: number) => {
                    const tagStr = String(tag).trim();
                    const isAi = tagStr.startsWith('ai:');
                    const label = isAi ? tagStr.replace('ai:', '') : tagStr;
                    return (
                      <TextInstrument as="span" key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-va-off-white rounded-full text-[15px] font-light tracking-widest text-va-black/40 border border-black/5">
                        <VoiceglotText translationKey={`common.tag.${label.toLowerCase()}`} defaultText={label} />
                        {isAi && <TextInstrument as="span" className="text-[15px] bg-primary/10 text-primary px-1 rounded-sm font-light">AI</TextInstrument>}
                      </TextInstrument>
                    );
                  })}
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          )}
        </ContainerInstrument>

        {/* Footer: Price & Action */}
        <ContainerInstrument className="pt-6 border-t border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-1.5 text-[15px] font-light text-va-black/30 tracking-widest mb-1">
              <VoiceglotImage 
                src="/assets/common/branding/icons/INFO.svg" 
                alt="Delivery" 
                width={10} 
                height={10} 
                style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
              />
              <ContainerInstrument as="span">
                <VoiceglotText translationKey="common.ready" defaultText="Klaar" />: {deliveryInfo.formattedShort}
              </ContainerInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-2xl font-light tracking-tighter text-va-black">€{displayPrice}</TextInstrument>
          </ContainerInstrument>
          <ButtonInstrument 
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
            <VoiceglotImage 
              src="/assets/common/branding/icons/FORWARD.svg" 
              alt="Order" 
              width={14} 
              height={14} 
              className="brightness-0 invert"
            />
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </BentoCard>
  );
};
