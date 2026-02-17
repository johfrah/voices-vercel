"use client";

import { useAuth } from '@/contexts/AuthContext';
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
import { ArrowRight, Check, Mic, Pause, Play, Plus, Settings, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, FlagBE, FlagDE, FlagDK, FlagES, FlagFR, FlagIT, FlagNL, FlagPL, FlagPT, FlagUK, FlagUS, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { ActorEditModal } from './ActorEditModal';

interface VoiceCardProps {
  voice: Actor;
  onSelect?: (voice: Actor) => void;
  hideButton?: boolean;
  hidePrice?: boolean; // NEW: hide price when redundant
  isCornered?: boolean; // NEW: for SPA transition focus
  compact?: boolean; // NEW: for space-saving on mobile/configurator
}

/**
 *  CHRIS-PROTOCOL: Flag Orchestrator
 */
const VoiceFlag = ({ lang, size = 16 }: { lang?: string, size?: number }) => {
  if (!lang) return null;
  const lowLang = lang.toLowerCase();
  
  if (lowLang.includes('be') || lowLang === 'vlaams') return <FlagBE size={size} />;
  if (lowLang.includes('nl') || lowLang === 'nederlands') return <FlagNL size={size} />;
  if (lowLang.includes('fr') || lowLang === 'frans') return <FlagFR size={size} />;
  if (lowLang.includes('de') || lowLang === 'duits') return <FlagDE size={size} />;
  if (lowLang.includes('gb') || lowLang.includes('uk') || lowLang === 'engels') return <FlagUK size={size} />;
  if (lowLang.includes('us')) return <FlagUS size={size} />;
  if (lowLang.includes('es') || lowLang === 'spaans') return <FlagES size={size} />;
  if (lowLang.includes('it') || lowLang === 'italiaans') return <FlagIT size={size} />;
  if (lowLang.includes('pl') || lowLang === 'pools') return <FlagPL size={size} />;
  if (lowLang.includes('dk') || lowLang === 'deens') return <FlagDK size={size} />;
  if (lowLang.includes('pt') || lowLang === 'portugees') return <FlagPT size={size} />;
  
  return null;
};

/**
 * CATEGORY DEFINITIONS (The Big 8)
 * Gebruikt legacy SVG icons voor het echte Voices DNA.
 */
const CATEGORIES = [
  { id: 'telephony', src: '/assets/common/branding/icons/INFO.svg', label: 'Telefonie', key: 'category.telephony' },
  { id: 'video', src: '/assets/common/branding/icons/INFO.svg', label: 'Corporate', key: 'category.corporate' },
  { id: 'commercial', src: '/assets/common/branding/icons/INFO.svg', label: 'Commercial', key: 'category.commercial' },
  { id: 'podcast', src: '/assets/common/branding/icons/INFO.svg', label: 'Podcast', key: 'category.podcast' },
  { id: 'e-learning', src: '/assets/common/branding/icons/INFO.svg', label: 'E-learning', key: 'category.elearning' },
  { id: 'meditatie', src: '/assets/common/branding/icons/INFO.svg', label: 'Meditatie', key: 'category.meditation' },
];

export const VoiceCard: React.FC<VoiceCardProps> = ({ voice, onSelect, hideButton, hidePrice, isCornered, compact }) => {
  const { playClick, playSwell } = useSonicDNA();
  const { state, getPlaceholderValue, toggleActorSelection } = useVoicesState();
  const { state: masterControlState } = useMasterControl();
  const { state: checkoutState } = useCheckout();
  const { activeDemo, isPlaying: globalIsPlaying, playDemo, stopDemo, setIsPlaying: setGlobalIsPlaying } = useGlobalAudio();
  const { isEditMode, openEditModal } = useEditMode();
  const { isAdmin } = useAuth();
  const router = useRouter();

  const isSelected = state.selected_actors.some(a => a.id === voice.id);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEditModal(voice, (updatedVoice) => {
      // This callback is handled by the parent component (HomeContent)
      // but we keep it here for future-proofing other pages
      console.log(`VoiceCard [${voice.display_name}] updated immediately`);
    });
  };

  const handleStudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick(isSelected ? 'light' : 'pro');
    toggleActorSelection(voice);
  };

  const handleMouseEnter = () => {
    playSwell();
  };

  const nextEdition = null; // Voicecards don't have editions like workshops
  const videoPath = null; // Voicecards use photos, but we keep the naming consistent for the mandate
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);

  // ... (subtitle useEffect)

  //  CHRIS-PROTOCOL: Strip HTML and clean whitespace
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

  //  TOGGLE PLAY LOGIC (VOICES 2026)
  const isCurrentlyPlaying = useMemo(() => {
    if (voice.video_url) return isPlaying;
    // Check if any demo of THIS voice is playing in the global audio orchestrator
    return activeDemo?.actor_name === voice.display_name && globalIsPlaying;
  }, [voice.video_url, isPlaying, activeDemo, voice.display_name, globalIsPlaying]);

  //  CHRIS-PROTOCOL: Clean demo titles for display
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
      if (activeDemo?.actor_name === voice.display_name) {
        // If THIS voice is already the active demo, just toggle play/pause
        setGlobalIsPlaying(!globalIsPlaying);
        playClick(globalIsPlaying ? 'light' : 'pro');
      } else {
        //  CHRIS-PROTOCOL: Prioritize demo based on current journey
        const journeyDemo = categorizedDemos[masterControlState.journey];
        const firstDemo = journeyDemo || (voice.demos && voice.demos.length > 0 ? voice.demos[0] : null);
        
        if (firstDemo) {
          handleCategoryClick(e, firstDemo);
        }
      }
    }
  };

  const deliveryInfo = useMemo(() => {
    return calculateDeliveryDate({
      deliveryDaysMin: voice.delivery_days_min || 1,
      deliveryDaysMax: voice.delivery_days_max || 3,
      cutoffTime: voice.cutoff_time || '18:00',
      availability: voice.availability || [],
      holidayFrom: voice.holiday_from,
      holidayTill: voice.holiday_till
    });
  }, [voice]);

  // Map demo's naar categorien op basis van titel/type
  const categorizedDemos = useMemo(() => {
    const map: Record<string, Demo> = {};
    if (!voice.demos) return map;

    voice.demos.forEach(demo => {
      const title = demo.title.toLowerCase();
      const type = demo.category?.toLowerCase() || '';
      
      //  CHRIS-PROTOCOL: Robust Journey Mapping (Expanded for maximum coverage)
      if (type === 'telephony' || type === 'ivr' || title.includes('ivr') || title.includes('telefoon') || title.includes('telefonie') || title.includes('voicemail') || title.includes('on hold') || title.includes('wachtmuziek')) {
        map['telephony'] = demo;
      } else if (type === 'video' || type === 'corporate' || title.includes('corporate') || title.includes('bedrijf') || title.includes('video') || title.includes('uitleg') || title.includes('explainer') || title.includes('webvideo') || title.includes('narration')) {
        map['video'] = demo;
      } else if (type === 'commercial' || type === 'advertentie' || title.includes('tv') || title.includes('radio') || title.includes('advertentie') || title.includes('commercial') || title.includes('spot') || title.includes('reclame')) {
        map['commercial'] = demo;
      } else if (title.includes('podcast')) {
        map['podcast'] = demo;
      } else if (title.includes('learning') || title.includes('onderwijs')) {
        map['e-learning'] = demo;
      } else if (title.includes('meditatie') || title.includes('ademing') || title.includes('rust')) {
        map['meditatie'] = demo;
      }
    });

    // Fallback: als er geen matches zijn, zet de eerste demo in de meest logische categorie of 'online'
    if (Object.keys(map).length === 0 && voice.demos.length > 0) {
      map['online'] = voice.demos[0];
    }

    return map;
  }, [voice.demos]);

  const handleCategoryClick = (e: React.MouseEvent, demo: Demo) => {
    e.stopPropagation();
    
    // CHRIS-PROTOCOL: If we are in SPA mode (onSelect provided), clicking a category chip 
    // should ONLY play the demo, NOT trigger the selection.
    playClick('pro');
    
    // If this specific demo is already active, just toggle play/pause
    if (activeDemo?.id === demo.id) {
      setGlobalIsPlaying(!globalIsPlaying);
    } else {
      playDemo({
        ...demo,
        actor_name: voice.display_name,
        actor_photo: voice.photo_url,
        actor_lang: voice.native_lang
      });
    }
  };

  const displayPrice = useMemo(() => {
    //  CHRIS-PROTOCOL: Use PricingEngine for LIVE calculation based on current filters
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
      usage: masterControlState.journey === 'telephony' ? 'telefonie' : (masterControlState.journey === 'video' ? 'unpaid' : 'commercial'),
      plan: checkoutState.plan,
      words: wordCount,
      prompts: checkoutState.prompts,
      mediaTypes: masterControlState.journey === 'commercial' ? (masterControlState.filters.media as string[]) : undefined,
      countries: masterControlState.filters.countries || [masterControlState.filters.country || 'BE'],
      spots: spotsMap,
      years: yearsMap,
      liveSession: masterControlState.filters.liveSession,
      actorRates: voice.rates || voice.rates_raw || legacyRates, // Use specific rates or fallback
      music: checkoutState.music,
      isVatExempt: false // Always show incl/excl VAT based on B2C view (usually incl on cards for clarity, but engine returns ex VAT subtotal)
    });

    const status = PricingEngine.getAvailabilityStatus(
      voice, 
      masterControlState.journey === 'commercial' ? (masterControlState.filters.media as string[]) : [], 
      masterControlState.filters.countries?.[0] || masterControlState.filters.country || 'BE'
    );

    //  CHRIS-PROTOCOL: Log pricing status for debugging
    if (status === 'unavailable') {
      console.warn(`[VoiceCard] ${voice.display_name} is UNAVAILABLE for journey ${masterControlState.journey}`);
    }

    if (status === 'unavailable') return null;

    const subtotal = result.subtotal;
    const prompts = Math.max(1, Math.round(wordCount / 20));
    const pricePerPrompt = subtotal / prompts;

    return {
      price: PricingEngine.format(subtotal).replace('', '').trim(),
      pricePerPrompt: PricingEngine.format(pricePerPrompt).replace('', '').trim(),
      status
    };
  }, [voice, masterControlState.journey, masterControlState.filters, checkoutState.briefing, checkoutState.plan, checkoutState.prompts, checkoutState.music]);

  if (!displayPrice) {
    console.warn(`[VoiceCard] ${voice.display_name} hidden: displayPrice is null`);
    return null; //  HIDE VOICE IF UNAVAILABLE FOR SELECTION
  }

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
      onClick={(e) => {
        if (isEditMode) return;
        
        // CHRIS-PROTOCOL: In SPA mode (onSelect provided), we don't trigger selection on card click
        // to allow playing demos without accidentally selecting the voice.
        // Selection is EXCLUSIVELY via the "Kies stem" button.
        if (onSelect) {
          return;
        }
        
        playClick('soft');
      }}
      plain
      className={cn(
        "group relative bg-white rounded-[20px] overflow-hidden shadow-aura hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 border border-black/[0.02] flex flex-col cursor-pointer touch-manipulation",
        isSelected ? "ring-2 ring-primary" : "",
        isEditMode && "ring-2 ring-primary ring-inset",
        isCornered && "shadow-aura-lg"
      )}
      onMouseEnter={handleMouseEnter}
    >
      {/* LAYA'S AURA GLOW (SPA Mode) */}
      {isCornered && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary/5 blur-[40px] -z-10"
        />
      )}
      {/*  ADMIN EDIT BUTTON */}
      {/* Moved inside photo container for better alignment */}

      {/*  PHOTO PREVIEW (Mandate: Aspect Square) */}
      <ContainerInstrument plain className="relative bg-va-black overflow-hidden shrink-0 aspect-square w-full">
        {voice.video_url ? (
          <video 
            ref={videoRef}
            src={voice.video_url.startsWith('http') ? voice.video_url : `/api/proxy/?path=${encodeURIComponent(voice.video_url)}`}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
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
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" 
          />
        ) : (
          <ContainerInstrument className="w-full h-full bg-va-off-white flex items-center justify-center">
            <Mic strokeWidth={1.5} size={48} className="text-va-black/10" />
          </ContainerInstrument>
        )}

        {/*  COMPACT DEMO PLAYER OVERLAY (VOICES DNA 2026) */}
        <ContainerInstrument 
          plain 
          className={cn(
            "absolute inset-0 flex flex-col p-4 transition-opacity duration-500 z-10",
            isCurrentlyPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          {/* Top Row: Secondary Demos (Compact Glassy Chips) */}
          <div className="relative z-30 flex flex-wrap gap-2 max-w-full overflow-hidden">
            {CATEGORIES.map((cat) => {
              const demo = categorizedDemos[cat.id];
              if (!demo) return null;
              const isActive = activeDemo?.id === demo.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={(e) => handleCategoryClick(e, demo)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md border transition-all duration-300",
                    isActive 
                      ? (globalIsPlaying ? "bg-primary border-primary text-white shadow-lg scale-105" : "bg-primary/40 border-primary/40 text-white shadow-md scale-105")
                      : "bg-black/40 border-white/20 text-white/90 hover:bg-black/60 hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Center: Main Play Button */}
          <div 
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
          >
            <div 
              className={cn(
                "w-20 h-20 rounded-full bg-va-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-2xl group/play",
                isCurrentlyPlaying ? "opacity-100" : "opacity-40 group-hover:opacity-100"
              )}
            >
              {isCurrentlyPlaying ? (
                <Pause strokeWidth={1.5} size={32} className="text-white" />
              ) : (
                <Play strokeWidth={1.5} size={32} className="text-white fill-white ml-1" />
              )}
            </div>
          </div>

          {/* Bottom Row: Active Demo Title (VOICES DNA 2026) */}
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-30">
            {isCurrentlyPlaying && activeDemo && (
              <div className="bg-va-black/40 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <TextInstrument className="text-white text-[11px] font-black tracking-[0.2em] truncate max-w-[150px]">
                  {cleanDemoTitle(activeDemo.title)}
                </TextInstrument>
              </div>
            )}
          </div>
        </ContainerInstrument>

        {/*  CUSTOM SUBTITLES (VOICES MIX) */}
        {activeSubtitle && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] z-20 pointer-events-none text-center">
            <span className="inline-block px-4 py-2 bg-va-black/80 backdrop-blur-md rounded-[12px] text-white text-[14px] font-light leading-relaxed shadow-aura-lg border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeSubtitle}
            </span>
          </div>
        )}

        {/*  ADMIN EDIT BUTTON (Hover Trigger) */}
        {isAdmin && (
          <button
            onClick={handleAdminClick}
            className={cn(
              "absolute top-4 left-4 z-[60] w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
              isEditMode 
                ? "bg-primary text-white scale-110" 
                : "bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 hover:bg-primary hover:scale-110"
            )}
            title="Snel Bewerken (Admin)"
          >
            <Edit3 size={20} strokeWidth={2} />
          </button>
        )}

        {/* Studio Toggle Overlay */}
        <ButtonInstrument 
          onClick={handleStudioToggle}
          className={cn(
            "absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-[5] border border-white/20 shadow-lg",
            isSelected 
              ? "bg-primary text-white scale-105" 
              : "bg-black/40 text-white/90 hover:bg-black/60 opacity-0 group-hover:opacity-100"
          )}
        >
          {isSelected ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
        </ButtonInstrument>

        {/*  ADMIN EDIT BUTTON */}
        {isEditMode && !isAdmin && (
          <button
            onClick={handleAdminClick}
            className="absolute top-16 right-4 z-[60] w-10 h-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-in fade-in zoom-in duration-300"
            title="Bewerk Stem"
          >
            <Settings size={20} strokeWidth={2} />
          </button>
        )}

        <ContainerInstrument plain className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </ContainerInstrument>

      <ContainerInstrument plain className="p-0 flex flex-col flex-grow">
        <div className="flex flex-col gap-2 mb-2 px-8 pt-8 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-va-off-white/50 px-2 py-1 rounded-full border border-black/[0.03]">
              <VoiceFlag lang={voice.native_lang} size={16} />
              <TextInstrument className="text-[13px] font-bold text-va-black/60 tracking-tight">
                <VoiceglotText 
                  translationKey={`common.language.${voice.native_lang?.toLowerCase()}`} 
                  defaultText={
                    voice.native_lang?.toLowerCase() === 'nl-be' || voice.native_lang?.toLowerCase() === 'vlaams' ? 'Vlaams' : 
                    voice.native_lang?.toLowerCase() === 'nl-nl' || voice.native_lang?.toLowerCase() === 'nederlands' ? 'Nederlands' : 
                    voice.native_lang?.toLowerCase() === 'fr-fr' || voice.native_lang?.toLowerCase() === 'frans' ? 'Frans' : 
                    voice.native_lang?.toLowerCase() === 'fr-be' ? 'Frans (BE)' :
                    voice.native_lang || ''
                  } 
                />
              </TextInstrument>
            </div>
            <div className="flex flex-col items-end justify-center">
              <span className="text-[9px] font-bold tracking-[0.1em] text-primary/60 uppercase leading-none mb-0.5">Levering:</span>
              <TextInstrument className="text-[13px] font-semibold text-primary tracking-tight leading-none">
                {deliveryInfo.formattedShort}
              </TextInstrument>
            </div>
          </div>
          {masterControlState.journey === 'telephony' && voice.extra_langs && (
            <div className="px-2 animate-in fade-in slide-in-from-top-1 duration-500">
              <TextInstrument className="text-[11px] text-va-black/60 font-medium italic leading-tight">
                Ook beschikbaar in: {voice.extra_langs.split(',').map(l => l.trim()).join(', ')}
              </TextInstrument>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow px-8 pb-8">
          <div className="flex flex-col">
            {voice.tone_of_voice && (
              <div className="flex flex-wrap gap-1 mb-2 animate-in fade-in slide-in-from-left-2 duration-500">
                {voice.tone_of_voice.split(',').slice(0, 2).map((tone, i) => (
                  <span key={i} className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                    {tone.trim()}
                  </span>
                ))}
              </div>
            )}
            <HeadingInstrument level={3} className={cn("font-light tracking-tighter leading-tight group-hover:text-primary transition-colors truncate", compact ? "text-3xl mb-1" : "text-4xl mb-1")}>
              <VoiceglotText  
                translationKey={`actor.${voice.id}.name`} 
                defaultText={voice.display_name} 
                noTranslate={true} 
              />
            </HeadingInstrument>
            
            {voice.clients && (
              <div className="min-h-[1.2em]">
                <TextInstrument className="text-[10px] font-bold tracking-[0.15em] text-va-black/40 uppercase mb-3 truncate">
                  {voice.clients.split(',').slice(0, 3).join('  ')}
                </TextInstrument>
              </div>
            )}
            
            <div className="mb-3 h-[80px] overflow-y-auto no-scrollbar">
              <TextInstrument className="text-va-black/40 text-[13px] font-light leading-relaxed italic">
                {sectorDemo ? (
                  <>{sectorDemo}</>
                ) : (
                  <VoiceglotText 
                    translationKey={`actor.${voice.id}.bio`} 
                    defaultText={cleanDescription(voice.tagline || voice.bio || 'Professionele voice-over voor al uw projecten.')} 
                  />
                )}
              </TextInstrument>
            </div>
          </div>

          {!hidePrice && (
            <div className="flex justify-between items-center mt-auto pt-6 border-t border-black/[0.03]">
              <div className="flex flex-col items-start">
                <TextInstrument className="text-[10px] font-bold tracking-[0.2em] text-va-black/60 uppercase mb-1">
                  Vanaf
                </TextInstrument>
                <TextInstrument className={cn("font-medium tracking-tighter text-va-black leading-none", compact ? "text-2xl" : "text-3xl")}>
                  {displayPrice.price}
                </TextInstrument>
                {masterControlState.journey === 'telephony' && displayPrice.pricePerPrompt && (
                  <TextInstrument className="text-[10px] text-va-black/60 font-medium mt-1">
                     {displayPrice.pricePerPrompt} per prompt
                  </TextInstrument>
                )}
              </div>
              
              {/* Alleen tonen als we NIET op de detailpagina zijn en hideButton niet true is */}
              {typeof window !== 'undefined' && !window.location.pathname.includes(`/voice/${voice.slug}`) && !hideButton && (
                <ButtonInstrument 
                  onClick={(e) => {
                    e.stopPropagation();
                    
                    // CHRIS-PROTOCOL: If we have an onSelect handler (SPA mode), 
                    // we call it and prevent default browser navigation.
                    if (onSelect) {
                      e.preventDefault();
                      console.log(`[VoiceCard] Kies stem clicked (SPA) for: ${voice.display_name}`);
                      playClick('success');
                      onSelect(voice);
                      return;
                    }
                    
                    playClick('success');
                    window.location.href = `/voice/${voice.slug}/`;
                  }}
                  className="flex items-center justify-center gap-3 text-[12px] font-bold tracking-widest text-white group/btn h-[48px] px-5 bg-va-black hover:bg-primary rounded-[12px] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(233,30,99,0.3)]"
                >
                  <VoiceglotText translationKey="common.order_fast" defaultText="Kies stem" />
                  <ArrowRight size={16} strokeWidth={2.5} className="group-hover/btn:translate-x-1.5 transition-transform" />
                </ButtonInstrument>
              )}
            </div>
          )}
        </div>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
