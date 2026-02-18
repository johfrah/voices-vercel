"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useEditMode } from "@/contexts/EditModeContext";
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { calculateDeliveryDate } from '@/lib/delivery-logic';
import { PricingEngine } from '@/lib/pricing-engine';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { Actor, Demo } from '@/types';
import { MarketManager } from '@config/market-manager';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Edit3, Mic, Pause, Play, Plus, Settings } from 'lucide-react';
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, FlagBE, FlagDE, FlagDK, FlagES, FlagFR, FlagIT, FlagNL, FlagPL, FlagPT, FlagUK, FlagUS, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';

interface VoiceCardProps {
  voice: Actor;
  onSelect?: (voice: Actor) => void;
  hideButton?: boolean;
  hidePrice?: boolean;
  isCornered?: boolean;
  compact?: boolean;
}

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

export const VoiceCard: React.FC<VoiceCardProps> = ({ voice, onSelect, hideButton, hidePrice, isCornered, compact }) => {
  const { t } = useTranslation();
  const { playClick, playSwell } = useSonicDNA();
  const { state, getPlaceholderValue, toggleActorSelection } = useVoicesState();
  const { state: masterControlState } = useMasterControl();
  const { state: checkoutState } = useCheckout();
  const { activeDemo, isPlaying: globalIsPlaying, playDemo, stopDemo, setIsPlaying: setGlobalIsPlaying } = useGlobalAudio();
  const { isEditMode, openEditModal } = useEditMode();
  const { isAdmin } = useAuth();
  const router = useRouter();

  const isSelected = useMemo(() => {
    if (!voice || !state.selected_actors) return false;
    return state.selected_actors.some(a => a.id === voice.id);
  }, [voice, state.selected_actors]);

  const handleAdminClick = (e: React.MouseEvent) => {
    if (!voice) return;
    e.stopPropagation();
    openEditModal(voice, (updatedVoice: Actor) => {
      console.log(`VoiceCard [${voice.display_name}] updated immediately`);
    });
  };

  const handleStudioToggle = (e: React.MouseEvent) => {
    if (!voice) return;
    e.stopPropagation();
    playClick(isSelected ? 'light' : 'pro');
    toggleActorSelection(voice);
  };

  const handleMainAction = (e: React.MouseEvent) => {
    if (!voice) return;
    e.stopPropagation();
    playClick(isSelected ? 'light' : 'pro');
    
    if (onSelect) {
      onSelect(voice);
    } else {
      toggleActorSelection(voice);
    }
  };

  const handleMouseEnter = () => {
    playSwell();
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string, name: string } | null>(null);

  const handleVideoClick = (e: React.MouseEvent, video: { url: string, name: string }) => {
    e.stopPropagation();
    playClick('pro');
    
    if (globalIsPlaying) {
      stopDemo();
    }

    if (activeVideo?.url === video.url) {
      if (isPlaying) {
        videoRef.current?.pause();
        setIsPlaying(false);
      } else {
        videoRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setActiveVideo(video);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!activeVideo || !videoRef.current) return;

    const video = videoRef.current;
    const handleTimeUpdate = () => {
      const time = video.currentTime;
      if (time > 1 && time < 4) setActiveSubtitle("Professionele voice-overs...");
      else if (time > 4 && time < 8) setActiveSubtitle("Voor al uw projecten.");
      else setActiveSubtitle(null);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [activeVideo]);

  const cleanDescription = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<[^>]*>?/gm, '')
      .replace(/\\r\\n/g, ' ')
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const isCurrentlyPlaying = useMemo(() => {
    if (!voice) return false;
    if (activeVideo || voice?.video_url) return isPlaying;
    // Check if any demo of THIS voice is playing in the global audio orchestrator
    return activeDemo?.actor_name === voice?.display_name && globalIsPlaying;
  }, [activeVideo, voice, isPlaying, activeDemo, globalIsPlaying]);

  const cleanDemoTitle = (title: string, category?: string) => {
    if (category) {
      const cat = category.toLowerCase();
      if (cat.includes('telephony') || cat.includes('iv')) return 'Telefonie';
      if (cat.includes('corporate') || cat.includes('video')) return 'Corporate';
      if (cat.includes('commercial') || cat.includes('advertentie')) return 'Commercial';
    }

    if (!title) return '';
    let clean = title.replace(/\.(mp3|wav|ogg|m4a)$/i, '');
    clean = clean.replace(/^[a-z]+-A-\d+-/i, '');
    clean = clean.replace(/-(flemish|dutch|french|english|german|voiceover|demo|voices)/gi, ' ');
    clean = clean.replace(/-/g, ' ');
    clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    return clean.trim();
  };

  const handleCategoryClick = (e: React.MouseEvent, demo: Demo) => {
    if (!voice) return;
    e.stopPropagation();
    playClick('pro');
    
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

  const [pricingUpdateTick, setPricingUpdateTick] = useState(0);
  const [eventData, setEventData] = useState<any>(null);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setPricingUpdateTick(prev => prev + 1);
      if (e.detail) setEventData(e.detail);
    };
    window.addEventListener('voices_pricing_update', handleUpdate);
    return () => window.removeEventListener('voices_pricing_update', handleUpdate);
  }, []);

  const deliveryInfo = useMemo(() => {
    if (!voice) return { deliveryDaysMin: 1, deliveryDaysMax: 1, formattedShort: '' };
    return calculateDeliveryDate({
      deliveryDaysMin: voice.delivery_days_min || 1,
      deliveryDaysMax: voice.delivery_days_max || 1,
      cutoffTime: voice.cutoff_time || '18:00',
      availability: voice.availability,
      holidayFrom: voice.holiday_from,
      holidayTill: voice.holiday_till
    });
  }, [voice]);

  const displayPrice = useMemo(() => {
    if (!voice) return null;
    const wordCount = checkoutState.briefing 
      ? checkoutState.briefing.trim().split(/\s+/).filter(Boolean).length 
      : (masterControlState.filters.words || 0);

    const currentSpotsDetail = eventData?.spotsDetail || masterControlState.filters.spotsDetail;
    const currentYearsDetail = eventData?.yearsDetail || masterControlState.filters.yearsDetail;
    const currentMedia = eventData?.media || masterControlState.filters.media || ['online'];

    const spotsMap = masterControlState.journey === 'commercial' && Array.isArray(currentMedia)
      ? currentMedia.reduce((acc, m) => ({ 
          ...acc, 
          [m]: (currentSpotsDetail && currentSpotsDetail[m]) || masterControlState.filters.spots || 1 
        }), {})
      : undefined;

    const yearsMap = masterControlState.journey === 'commercial' && Array.isArray(currentMedia)
      ? currentMedia.reduce((acc, m) => ({ 
          ...acc, 
          [m]: (currentYearsDetail && currentYearsDetail[m]) || masterControlState.filters.years || 1 
        }), {})
      : undefined;

    const result = PricingEngine.calculate({
      usage: masterControlState.journey === 'telephony' ? 'telefonie' : (masterControlState.journey === 'video' ? 'unpaid' : 'commercial'),
      plan: checkoutState.plan,
      words: wordCount,
      prompts: checkoutState.prompts,
      mediaTypes: masterControlState.journey === 'commercial' ? (currentMedia as string[]) : undefined,
      countries: masterControlState.filters.countries || [masterControlState.filters.country || 'BE'],
      spots: spotsMap,
      years: yearsMap,
      liveSession: masterControlState.filters.liveSession,
      actorRates: voice,
      music: checkoutState.music,
      isVatExempt: false
    });

    const status = PricingEngine.getAvailabilityStatus(
      voice, 
      masterControlState.journey === 'commercial' ? (currentMedia as string[]) : [], 
      masterControlState.filters.countries?.[0] || masterControlState.filters.country || 'BE'
    );

    if (status === 'unavailable') return null;

    return {
      price: PricingEngine.format(result.subtotal).replace('', '').trim(),
      status,
      mediaBreakdown: result.mediaBreakdown
    };
  }, [voice, masterControlState.journey, masterControlState.filters, checkoutState.briefing, checkoutState.plan, checkoutState.prompts, checkoutState.music, eventData?.media, eventData?.spotsDetail, eventData?.yearsDetail]);

  const sectorDemo = useMemo(() => {
    if (!voice) return null;
    const company = getPlaceholderValue('company_name');
    switch (state.current_sector) {
      case 'gezondheidszorg': return `Welkom bij ${company}. Voor dringende medische hulp, bel 112. Voor een afspraak, blijf aan de lijn.`;
      case 'bouw': return `Bedankt voor het bellen naar ${company}. Wij realiseren uw droomproject van fundering tot dak.`;
      case 'it': return `U bent verbonden met de support desk van ${company}. Al onze consultants zijn momenteel in gesprek.`;
      case 'juridisch': return `Welkom bij ${company}. Onze advocaten staan u graag bij met deskundig juridisch advies.`;
      default: return null;
    }
  }, [voice, state.current_sector, getPlaceholderValue]);

  if (!voice || !displayPrice) {
    return null;
  }

  //  CHRIS-PROTOCOL: Safe access to video filename for subtitles
  const videoFilename = voice.video_url?.split('/').pop()?.replace(/\.[^/.]+$/, "");

  return (
    <ContainerInstrument
      onClick={(e) => {
        if (isEditMode || onSelect) return;
        playClick('soft');
      }}
      plain
      className={cn(
        "group relative bg-white rounded-[20px] overflow-hidden shadow-aura transition-all duration-500 border border-black/[0.02] flex flex-col touch-manipulation w-full h-full",
        (!onSelect || isEditMode) && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        isSelected ? "ring-2 ring-primary" : "",
        isEditMode && "ring-2 ring-primary ring-inset",
        isCornered && "shadow-aura-lg"
      )}
      onMouseEnter={handleMouseEnter}
    >
      {isCornered && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary/5 blur-[40px] -z-10"
        />
      )}

      <ContainerInstrument plain className="relative bg-va-black overflow-hidden shrink-0 aspect-square w-full">
        {activeVideo ? (
          <div className="absolute inset-0 z-10 bg-black">
            <video 
              ref={videoRef}
              src={activeVideo.url.startsWith('http') ? activeVideo.url : `/api/proxy/?path=${encodeURIComponent(activeVideo.url)}`}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              crossOrigin="anonymous"
              onEnded={() => setIsPlaying(false)}
            />
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveVideo(null); setIsPlaying(false); }}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all"
            >
              <Plus className="rotate-45" size={16} />
            </button>
          </div>
        ) : voice?.video_url ? (
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
            {videoFilename && (
              <track 
                label="Nederlands"
                kind="subtitles"
                srcLang="nl"
                src={`/assets/studio/workshops/subtitles/${videoFilename}-nl.vtt`}
                default
              />
            )}
          </video>
        ) : voice?.photo_url ? (
          <VoiceglotImage  
            src={voice.photo_url} 
            alt={voice.display_name} 
            fill
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" 
          />
        ) : (
          <ContainerInstrument className="w-full h-full bg-va-off-white flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 rounded-full bg-va-black/5 flex items-center justify-center border-2 border-dashed border-va-black/10">
              <TextInstrument className="text-3xl font-light text-va-black/20 tracking-tighter">
                {voice?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </TextInstrument>
            </div>
            <Mic strokeWidth={1.5} size={32} className="text-va-black/10" />
          </ContainerInstrument>
        )}

        <ContainerInstrument 
          plain 
          className={cn(
            "absolute inset-0 flex flex-col p-4 transition-opacity duration-500 z-10",
            isCurrentlyPlaying ? "opacity-100" : "opacity-30 group-hover:opacity-100"
          )}
        >
          <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap gap-2 max-w-full overflow-hidden">
            {voice.actor_videos?.filter(Boolean).slice(0, 2).map((video, idx) => (
              <button
                key={`video-${idx}`}
                onClick={(e) => handleVideoClick(e, video)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md border transition-all duration-300 flex items-center gap-1.5",
                  activeVideo?.url === video.url
                    ? "bg-primary text-white border-primary shadow-lg scale-105"
                    : "bg-white/20 text-white border-white/20 hover:bg-white/40"
                )}
              >
                {activeVideo?.url === video.url && isPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
                {video.name || `Video ${idx + 1}`}
              </button>
            ))}

            {voice?.demos?.filter(Boolean).slice(0, 3).map((demo, idx) => (
              <button
                key={demo.id}
                onClick={(e) => handleCategoryClick(e, demo)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md border transition-all duration-300 flex items-center gap-1.5",
                  activeDemo?.id === demo.id
                    ? "bg-primary text-white border-primary shadow-lg scale-105"
                    : "bg-white/20 text-white border-white/20 hover:bg-white/40",
                  ((masterControlState.journey === 'telephony' && (demo.category?.toLowerCase().includes('telephony') || demo.category?.toLowerCase().includes('iv'))) ||
                   (masterControlState.journey === 'video' && (demo.category?.toLowerCase().includes('corporate') || demo.category?.toLowerCase().includes('video'))) ||
                   (masterControlState.journey === 'commercial' && (demo.category?.toLowerCase().includes('commercial') || demo.category?.toLowerCase().includes('advertentie')))) && 
                   activeDemo?.id !== demo.id && "border-white/60 bg-white/30"
                )}
              >
                {activeDemo?.id === demo.id && globalIsPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
                {cleanDemoTitle(demo.title, demo.category)}
              </button>
            ))}
          </div>

          <div className="flex-grow flex items-center justify-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (activeVideo) {
                  if (isPlaying) {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                  } else {
                    videoRef.current?.play();
                    setIsPlaying(true);
                  }
                  return;
                }
                
                if (!activeDemo && voice?.demos?.[0]) {
                  playDemo({
                    ...voice.demos[0],
                    actor_name: voice.display_name,
                    actor_photo: voice.photo_url,
                    actor_lang: voice.native_lang
                  });
                } else {
                  setGlobalIsPlaying(!globalIsPlaying);
                }
              }}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:scale-110 hover:bg-white/30 transition-all duration-500 shadow-2xl group/play"
            >
              {isCurrentlyPlaying ? (
                <Pause size={32} fill="currentColor" />
              ) : (
                <Play size={32} fill="currentColor" className="ml-1 group-hover/play:scale-110 transition-transform" />
              )}
            </button>
          </div>

          {activeSubtitle && (
            <div className="mt-auto pb-4 text-center animate-in fade-in slide-in-from-bottom-2">
              <span className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                {activeSubtitle}
              </span>
            </div>
          )}
        </ContainerInstrument>

        {!activeVideo && (
          <button 
            onClick={handleStudioToggle}
            className={cn(
              "absolute top-4 right-4 z-40 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-lg border border-white/10 group/studio",
              isSelected 
                ? "bg-primary text-white border-primary" 
                : "bg-va-black/40 text-white hover:bg-va-black/60"
            )}
          >
            {isSelected ? <Check size={18} strokeWidth={3} /> : <Plus size={18} />}
          </button>
        )}

        {isAdmin && (
          <button 
            onClick={handleAdminClick}
            className="absolute top-4 left-4 z-40 w-10 h-10 rounded-full bg-va-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-all duration-300 shadow-lg border border-white/10 group/admin"
          >
            <Edit3 size={18} className="group-hover/admin:rotate-12 transition-transform" />
          </button>
        )}
      </ContainerInstrument>

      <ContainerInstrument plain className="p-0 flex flex-col flex-grow">
        <div className="flex items-start justify-between px-8 pt-8 pb-4 border-b border-black/[0.02]">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 bg-va-off-white/50 px-2.5 py-1.5 rounded-full border border-black/[0.05] w-fit">
              <VoiceFlag lang={voice?.native_lang} size={18} />
              <TextInstrument className="text-[13px] font-bold text-va-black tracking-tight">
                <VoiceglotText 
                  translationKey={`common.language.${voice?.native_lang?.toLowerCase()}`} 
                  defaultText={
                    voice?.native_lang?.toLowerCase() === 'nl-be' || voice?.native_lang?.toLowerCase() === 'vlaams' ? 'Vlaams' : 
                    voice?.native_lang?.toLowerCase() === 'nl-nl' || voice?.native_lang?.toLowerCase() === 'nederlands' ? 'Nederlands' : 
                    voice?.native_lang?.toLowerCase() === 'fr-fr' || voice?.native_lang?.toLowerCase() === 'frans' ? 'Frans' : 
                    voice?.native_lang?.toLowerCase() === 'fr-be' ? 'Frans (BE)' :
                    voice?.native_lang || ''
                  } 
                />
              </TextInstrument>
            </div>

            {(masterControlState.journey === 'telephony' || compact) && voice?.extra_langs && (
              <div className="flex items-center gap-1.5 px-1 animate-in fade-in slide-in-from-left-1 duration-500">
                <div className="flex -space-x-1">
                  {voice.extra_langs.split(',').filter(Boolean).map((l, idx) => (
                    <div key={idx} className="w-5 h-5 rounded-full border-2 border-white bg-va-off-white flex items-center justify-center overflow-hidden shadow-sm">
                      <VoiceFlag lang={l.trim()} size={12} />
                    </div>
                  ))}
                </div>
                <TextInstrument className="text-[10px] text-va-black/30 font-bold uppercase tracking-widest">
                  Polyglot
                </TextInstrument>
              </div>
            )}
          </div>

          {!compact && (
            <div className={cn(
              "flex flex-col items-end justify-center px-3 py-1.5 rounded-xl border transition-colors duration-500",
              deliveryInfo.deliveryDaysMax <= 1 
                ? "bg-green-500/5 border-green-500/10 text-green-600" 
                : "bg-blue-500/5 border-blue-500/10 text-blue-600"
            )}>
              <span className="text-[9px] font-black tracking-[0.1em] uppercase leading-none mb-1 flex items-center gap-1 opacity-40">
                <Clock size={10} strokeWidth={3} />
                <VoiceglotText translationKey="common.delivery" defaultText="Levering" />
              </span>
              <TextInstrument className="text-[13px] font-bold tracking-tight leading-none">
                {deliveryInfo.formattedShort}
              </TextInstrument>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow px-8 pt-6 pb-8">
          <div className="flex flex-col mb-4">
            <HeadingInstrument level={3} className={cn("font-light tracking-tighter leading-none group-hover:text-primary transition-colors truncate", compact ? "text-3xl mb-2" : "text-4xl mb-2")}>
              <VoiceglotText  
                translationKey={`actor.${voice?.id}.name`} 
                defaultText={voice?.display_name} 
                noTranslate={true} 
              />
            </HeadingInstrument>

            {voice?.tone_of_voice && (
              <div className="flex flex-wrap gap-1 animate-in fade-in slide-in-from-bottom-1 duration-500">
                {voice.tone_of_voice.split(',').filter(Boolean).slice(0, 2).map((tone, i) => (
                  <span key={i} className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                    {tone.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-6 h-[70px] overflow-y-auto no-scrollbar">
            <TextInstrument className="text-va-black/60 text-[14px] font-medium leading-relaxed italic">
              {sectorDemo ? (
                <>{sectorDemo}</>
              ) : (
                <VoiceglotText 
                  translationKey={`actor.${voice?.id}.bio`} 
                  defaultText={cleanDescription(voice?.tagline || voice?.bio || 'Professionele voice-over voor al uw projecten.')} 
                />
              )}
            </TextInstrument>
          </div>

          <div className="flex justify-between items-center mt-auto pt-6 border-t border-black/[0.03]">
            <div className="flex flex-col items-start">
              {!hidePrice && displayPrice && (
                <>
                  <TextInstrument className="text-[10px] font-black tracking-[0.1em] text-va-black/30 uppercase leading-none mb-1">
                    <VoiceglotText translationKey="common.starting_from" defaultText="Vanaf" />
                  </TextInstrument>
                  <div className="flex items-baseline gap-1">
                    <TextInstrument className="text-2xl font-light tracking-tighter text-va-black">
                      {displayPrice.price}
                    </TextInstrument>
                  </div>
                </>
              )}
            </div>

            {!hideButton && (
              <ButtonInstrument 
                onClick={handleMainAction}
                variant={isSelected ? "primary" : "outline"}
                size="sm"
                className={cn(
                  "rounded-xl px-6 py-5 font-bold tracking-tight text-[13px] transition-all duration-500",
                  isSelected 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                    : "hover:bg-va-black hover:text-white hover:border-va-black"
                )}
              >
                {isSelected ? (
                  <span className="flex items-center gap-2">
                    <Check size={14} strokeWidth={3} />
                    <VoiceglotText translationKey="common.selected" defaultText="Geselecteerd" />
                  </span>
                ) : (
                  <VoiceglotText translationKey="common.choose_voice" defaultText="Kies stem" />
                )}
              </ButtonInstrument>
            )}
          </div>
        </div>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
