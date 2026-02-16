"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useEditMode } from "@/contexts/EditModeContext";
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { calculateDeliveryDate } from '@/lib/delivery-logic';
import { PricingEngine } from '@/lib/pricing-engine';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { Actor, Demo } from '@/types';
import { ArrowRight, Check, Mic, Pause, Play, Plus, Settings } from 'lucide-react';
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const { state: masterControlState } = useMasterControl();
  const { state: checkoutState } = useCheckout();
  const { activeDemo, playDemo, stopDemo } = useGlobalAudio();
  const { isEditMode } = useEditMode();
  const router = useRouter();

  const isSelected = state.selected_actors.some(a => a.id === voice.id);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick('pro');
    router.push(`/admin/voices/${voice.id}`);
  };

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
    // 🛡️ CHRIS-PROTOCOL: No more autoplay on hover as per user mandate
  };

  const nextEdition = null; // Voicecards don't have editions like workshops
  const videoPath = null; // Voicecards use photos, but we keep the naming consistent for the mandate
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);

  // 📝 SUBTITLE LOGIC (VOICES 2026) - For Voicecards (e.g. if they have a video demo)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCueChange = (e: Event) => {
      const track = e.target as TextTrack;
      if (track.activeCues && track.activeCues.length > 0) {
        const cue = track.activeCues[0] as VTTCue;
        setActiveSubtitle(cue.text);
      } else {
        setActiveSubtitle(null);
      }
    };

    const setupTracks = () => {
      const tracks = video.textTracks;
      if (tracks.length === 0) {
        setTimeout(setupTracks, 500);
        return;
      }
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'hidden';
        tracks[i].removeEventListener('cuechange', handleCueChange);
        tracks[i].addEventListener('cuechange', handleCueChange);
      }
    };

    video.addEventListener('loadedmetadata', setupTracks);
    setupTracks();

    return () => {
      video.removeEventListener('loadedmetadata', setupTracks);
      const tracks = video.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].removeEventListener('cuechange', handleCueChange);
      }
    };
  }, [voice.id]);

  // 🛡️ CHRIS-PROTOCOL: Strip HTML and clean whitespace
  const cleanDescription = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags
      .replace(/\\r\\n/g, ' ')
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // 🔘 TOGGLE PLAY LOGIC (VOICES 2026)
  const isCurrentlyPlaying = useMemo(() => {
    if (voice.video_url) return isPlaying;
    // Check if any demo of THIS voice is playing in the global audio orchestrator
    return activeDemo?.actor_name === voice.display_name;
  }, [voice.video_url, isPlaying, activeDemo, voice.display_name]);

  // 🛡️ CHRIS-PROTOCOL: Clean demo titles for display
  const cleanDemoTitle = (title: string) => {
    if (!title) return '';
    
    // Remove file extensions
    let clean = title.replace(/\.(mp3|wav|ogg|m4a)$/i, '');
    
    // Remove common technical prefixes/suffixes (e.g., product IDs, language codes)
    clean = clean.replace(/^[a-z]+-A-\d+-/i, ''); // Remove "mona-A-258121-"
    clean = clean.replace(/-(flemish|dutch|french|english|german|voiceover|demo|voices)/gi, ' ');
    clean = clean.replace(/-/g, ' ');
    
    // Natural Capitalization
    clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    
    return clean.trim();
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (voice.video_url) {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
        videoRef.current.muted = true;
        setIsPlaying(false);
        playClick('light');
      } else {
        videoRef.current.play();
        videoRef.current.muted = false;
        setIsPlaying(true);
        playClick('pro');
      }
    } else {
      // Audio Demo Logic
      if (isCurrentlyPlaying) {
        // If THIS voice is playing, stop it
        stopDemo();
        playClick('light');
      } else {
        // If not playing, start the first demo
        if (voice.demos && voice.demos.length > 0) {
          handleCategoryClick(e, voice.demos[0]);
        }
      }
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
    // 🛡️ CHRIS-PROTOCOL: Use PricingEngine for LIVE calculation based on current filters
    const wordCount = checkoutState.briefing 
      ? checkoutState.briefing.trim().split(/\s+/).filter(Boolean).length 
      : (masterControlState.filters.words || 0);

    // Construct spots/years map for commercial usage
    const spotsMap = masterControlState.journey === 'commercial' && Array.isArray(masterControlState.filters.media)
      ? masterControlState.filters.media.reduce((acc, m) => ({ 
          ...acc, 
          [m]: (masterControlState.filters.spotsDetail && masterControlState.filters.spotsDetail[m]) || masterControlState.filters.spots || 1 
        }), {})
      : undefined;

    const yearsMap = masterControlState.journey === 'commercial' && Array.isArray(masterControlState.filters.media)
      ? masterControlState.filters.media.reduce((acc, m) => ({ 
          ...acc, 
          [m]: (masterControlState.filters.yearsDetail && masterControlState.filters.yearsDetail[m]) || masterControlState.filters.years || 1 
        }), {})
      : undefined;

    // Fallback for legacy actors without rates_raw
    const legacyRates = {
      price_ivr: voice.price_ivr || 89,
      price_online: voice.price_online || 239,
      price_tv_national: 500, // Default fallback
      price_radio_national: 400,
      price_tv_regional: 350,
      price_radio_regional: 300,
      price_tv_local: 300,
      price_radio_local: 250,
      price_podcast: 239,
      price_social_media: 239,
    };

    const result = PricingEngine.calculate({
      usage: masterControlState.usage,
      plan: checkoutState.plan,
      words: wordCount,
      prompts: checkoutState.prompts,
      mediaTypes: masterControlState.journey === 'commercial' ? (masterControlState.filters.media as any) : undefined,
      country: masterControlState.filters.country,
      spots: spotsMap,
      years: yearsMap,
      liveSession: masterControlState.filters.liveSession,
      actorRates: voice.rates_raw || legacyRates, // Use specific rates or fallback
      music: checkoutState.music,
      isVatExempt: false // Always show incl/excl VAT based on B2C view (usually incl on cards for clarity, but engine returns ex VAT subtotal)
    });

    const status = PricingEngine.getAvailabilityStatus(
      voice, 
      masterControlState.journey === 'commercial' ? (masterControlState.filters.media as any) : [], 
      masterControlState.filters.country
    );

    if (status === 'unavailable') return null;

    return {
      price: PricingEngine.format(result.subtotal).replace('€', '').trim(),
      status
    };
  }, [voice, masterControlState.journey, masterControlState.usage, masterControlState.filters, checkoutState.briefing, checkoutState.plan, checkoutState.prompts, checkoutState.music]);

  if (!displayPrice) return null; // 🛡️ HIDE VOICE IF UNAVAILABLE FOR SELECTION

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
    <ContainerInstrument 
      onClick={() => {
        if (isEditMode) return;
        playClick('soft');
        onSelect?.(voice);
      }}
      plain
      className={cn(
        "group relative bg-white rounded-[20px] overflow-hidden shadow-aura hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 border border-black/[0.02] flex flex-col cursor-pointer touch-manipulation h-full",
        isSelected ? "ring-2 ring-primary" : "",
        isEditMode && "ring-2 ring-primary ring-inset"
      )}
      onMouseEnter={handleMouseEnter}
    >
      {/* 🛠️ ADMIN EDIT BUTTON */}
      {isEditMode && (
        <button
          onClick={handleAdminClick}
          className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-in fade-in zoom-in duration-300"
          title="Bewerk Stem"
        >
          <Settings size={20} strokeWidth={2} />
        </button>
      )}

      {/* 📸 PHOTO PREVIEW (Mandate: Aspect Square) */}
      <ContainerInstrument plain className="relative aspect-square w-full bg-va-black overflow-hidden">
        {voice.video_url ? (
          <video 
            ref={videoRef}
            src={`/assets/${voice.video_url}`}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
            muted
            loop
            playsInline
            autoPlay
            crossOrigin="anonymous"
          >
            <track 
              label="Nederlands"
              kind="subtitles"
              srcLang="nl"
              src={`/assets/studio/workshops/subtitles/${voice.video_url.split('/').pop().replace(/\.[^/.]+$/, "")}-nl.vtt`}
              default
            />
          </video>
        ) : voice.photo_url ? (
          <VoiceglotImage  
            src={voice.photo_url} 
            alt={voice.display_name} 
            fill
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
          />
        ) : (
          <ContainerInstrument className="w-full h-full bg-va-off-white flex items-center justify-center">
            <Mic strokeWidth={1.5} size={48} className="text-va-black/10" />
          </ContainerInstrument>
        )}

        {/* 🔘 COMPACT DEMO PLAYER OVERLAY (VOICES DNA 2026) */}
        <ContainerInstrument 
          plain 
          className={cn(
            "absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-500 z-10",
            isCurrentlyPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          {/* Top Row: Secondary Demos (Compact Glassy Chips) */}
          <ContainerInstrument plain className="flex flex-wrap gap-2 max-w-full overflow-hidden">
            {CATEGORIES.map((cat) => {
              const demo = categorizedDemos[cat.id];
              if (!demo) return null;
              const isActive = activeDemo?.id === demo.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={(e) => handleCategoryClick(e, demo)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md border transition-all duration-300",
                    isActive 
                      ? "bg-primary border-primary text-white shadow-lg scale-105" 
                      : "bg-black/20 border-white/10 text-white/70 hover:bg-black/40 hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </ContainerInstrument>

          {/* Center: Main Play Button */}
          <ContainerInstrument 
            plain 
            onClick={togglePlay}
            className="flex items-center justify-center flex-grow"
          >
            <ContainerInstrument 
              plain 
              className={cn(
                "w-20 h-20 rounded-full bg-va-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-2xl group/play",
                isCurrentlyPlaying ? "opacity-100" : "opacity-100"
              )}
            >
              {isCurrentlyPlaying ? (
                <Pause strokeWidth={1.5} size={32} className="text-white" />
              ) : (
                <Play strokeWidth={1.5} size={32} className="text-white fill-white ml-1" />
              )}
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Bottom Row: Active Demo Title (VOICES DNA 2026) */}
          <div className="flex flex-col items-center gap-2 mb-4">
            {isCurrentlyPlaying && activeDemo && (
              <ContainerInstrument plain className="bg-va-black/40 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <TextInstrument className="text-white text-[11px] font-black tracking-[0.2em] truncate max-w-[150px]">
                  {cleanDemoTitle(activeDemo.title)}
                </TextInstrument>
              </ContainerInstrument>
            )}
          </div>
        </ContainerInstrument>

        {/* 📝 CUSTOM SUBTITLES (VOICES MIX) */}
        {activeSubtitle && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] z-20 pointer-events-none text-center">
            <span className="inline-block px-4 py-2 bg-va-black/80 backdrop-blur-md rounded-[12px] text-white text-[14px] font-light leading-relaxed shadow-aura-lg border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeSubtitle}
            </span>
          </div>
        )}

        {/* Studio Toggle Overlay */}
        <ButtonInstrument 
          onClick={handleStudioToggle}
          className={cn(
            "absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-20 border border-white/20 shadow-lg",
            isSelected 
              ? "bg-primary text-white scale-105" 
              : "bg-black/40 text-white/90 hover:bg-black/60 opacity-0 group-hover:opacity-100"
          )}
        >
          {isSelected ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
        </ButtonInstrument>

        <ContainerInstrument plain className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </ContainerInstrument>

      <ContainerInstrument plain className="p-0 flex flex-col h-full">
        <ContainerInstrument plain className="flex flex-col gap-4 mb-4 px-8 pt-8 shrink-0">
            <ContainerInstrument plain className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-va-off-white/50 px-2 py-1 rounded-full border border-black/[0.03]">
                {voice.native_lang?.includes('BE') && (
                  <div className="w-4 h-4 rounded-full overflow-hidden border border-black/5 shrink-0">
                    <div className="flex h-full w-full">
                      <div className="w-1/3 h-full bg-black" />
                      <div className="w-1/3 h-full bg-[#FAE042]" />
                      <div className="w-1/3 h-full bg-[#ED2939]" />
                    </div>
                  </div>
                )}
                {voice.native_lang?.includes('NL') && !voice.native_lang?.includes('BE') && (
                  <div className="w-4 h-4 rounded-full overflow-hidden border border-black/5 shrink-0">
                    <div className="flex flex-col h-full w-full">
                      <div className="h-1/3 w-full bg-[#AE1C28]" />
                      <div className="h-1/3 w-full bg-white" />
                      <div className="h-1/3 w-full bg-[#21468B]" />
                    </div>
                  </div>
                )}
                {voice.native_lang?.includes('FR') && !voice.native_lang?.includes('BE') && (
                  <div className="w-4 h-4 rounded-full overflow-hidden border border-black/5 shrink-0">
                    <div className="flex h-full w-full">
                      <div className="w-1/3 h-full bg-[#002395]" />
                      <div className="w-1/3 h-full bg-white" />
                      <div className="w-1/3 h-full bg-[#ED2939]" />
                    </div>
                  </div>
                )}
                <TextInstrument className="text-[13px] font-bold text-va-black/60 tracking-tight">
                  <VoiceglotText 
                    translationKey={`common.language.${voice.native_lang?.toLowerCase()}`} 
                    defaultText={
                      voice.native_lang === 'nl-BE' ? 'Vlaams' : 
                      voice.native_lang === 'nl-NL' ? 'Nederlands' : 
                      voice.native_lang === 'fr-FR' ? 'Frans' : 
                      voice.native_lang === 'fr-BE' ? 'Frans (BE)' :
                      voice.native_lang || ''
                    } 
                  />
                  {masterControlState.journey === 'telephony' && voice.extra_langs && (
                    <span className="text-va-black/20 font-light ml-1">
                      + {voice.extra_langs.split(',').length} talen
                    </span>
                  )}
                </TextInstrument>
              </div>
              <TextInstrument className="text-[14px] font-medium text-primary tracking-tight flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-[0.1em] text-primary/40 uppercase">Levering:</span>
                {deliveryInfo.formattedShort}
              </TextInstrument>
            </ContainerInstrument>
        </ContainerInstrument>

          <ContainerInstrument plain className="px-8 pb-8 flex flex-col flex-grow">
            {console.log(`VoiceCard [${voice.display_name}] tone:`, voice.tone_of_voice)}
            <div className="flex-grow">
              {voice.tone_of_voice && (
                <div className="flex flex-wrap gap-1.5 mb-3 animate-in fade-in slide-in-from-left-2 duration-500">
                  {voice.tone_of_voice.split(',').slice(0, 3).map((tone, i) => (
                    <span key={i} className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                      {tone.trim()}
                    </span>
                  ))}
                </div>
              )}
              <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter leading-tight mb-1 group-hover:text-primary transition-colors truncate">
                <VoiceglotText  
                  translationKey={`actor.${voice.id}.name`} 
                  defaultText={voice.display_name} 
                  noTranslate={true} 
                />
              </HeadingInstrument>
              
              {voice.clients && (
                <TextInstrument className="text-[11px] font-bold tracking-[0.1em] text-va-black/20 uppercase mb-6 truncate">
                  {voice.clients.split(',').slice(0, 3).join(' • ')}
                </TextInstrument>
              )}
              
              <ContainerInstrument plain className="max-h-[80px] overflow-hidden mb-8">
                <TextInstrument className="text-va-black/40 text-[16px] font-light leading-relaxed italic line-clamp-2">
                  {sectorDemo ? (
                    <>{sectorDemo}</>
                  ) : (
                    <VoiceglotText 
                      translationKey={`actor.${voice.id}.bio`} 
                      defaultText={cleanDescription(voice.tagline || (voice as any).tagline || voice.bio || (voice as any).description || 'Professionele voice-over voor al uw projecten.')} 
                    />
                  )}
                </TextInstrument>
              </ContainerInstrument>
            </div>

            <ContainerInstrument plain className="flex justify-between items-center pt-6 border-t border-black/[0.03] mt-auto">
            <div className="flex flex-col">
              <TextInstrument className="text-[10px] font-bold tracking-[0.2em] text-va-black/20 uppercase mb-1">
                Vanaf
              </TextInstrument>
              <TextInstrument className="text-3xl font-light tracking-tighter text-va-black leading-none">
                €{displayPrice.price}
              </TextInstrument>
            </div>
            <ButtonInstrument 
              onClick={(e) => {
                e.stopPropagation();
                playClick('success');
                if (typeof window !== 'undefined') {
                  window.location.href = `/voice/${voice.slug}`;
                }
              }}
              className="flex items-center justify-center gap-3 text-[14px] font-bold tracking-widest text-white group/btn h-[56px] px-6 bg-va-black hover:bg-primary rounded-[12px] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(233,30,99,0.3)]"
            >
              <VoiceglotText translationKey="common.order_fast" defaultText="Kies stem" />
              <ArrowRight size={18} strokeWidth={2.5} className="group-hover/btn:translate-x-1.5 transition-transform" />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
