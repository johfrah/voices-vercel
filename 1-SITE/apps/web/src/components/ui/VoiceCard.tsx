"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useEditMode } from "@/contexts/EditModeContext";
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { calculateDeliveryDate, startOfDayNative } from '@/lib/utils/delivery-logic';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import { Actor, Demo } from '@/types';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Clock, Edit3, Mic, Pause, Play, Plus, Search as SearchIcon, Settings, ShieldCheck, Zap, X } from 'lucide-react';
import { useVoicesRouter } from '@/components/ui/VoicesLink';
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
  
  if (lowLang.includes('be') || lowLang === 'vlaams' || lowLang === 'frans (be)') return <FlagBE size={size} />;
  if (lowLang.includes('nl') || lowLang === 'nederlands') return <FlagNL size={size} />;
  if (lowLang.includes('fr') || lowLang === 'frans' || lowLang === 'frans (fr)') return <FlagFR size={size} />;
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

export const VoiceCard: React.FC<VoiceCardProps> = ({ voice: initialVoice, onSelect, hideButton, hidePrice, isCornered, compact }) => {
  const { t } = useTranslation();
  const { playClick, playSwell } = useSonicDNA();
  const { state, getPlaceholderValue, toggleActorSelection } = useVoicesState();
  const { state: masterControlState } = useMasterControl();
  const { state: checkoutState } = useCheckout();
  const { activeDemo, isPlaying: globalIsPlaying, playDemo, stopDemo, setIsPlaying: setGlobalIsPlaying } = useGlobalAudio();
  const { isEditMode, openEditModal } = useEditMode();
  const { isAdmin } = useAuth();
  const router = useVoicesRouter();

  //  CHRIS-PROTOCOL: Local state for immediate UI updates
  const [voice, setVoice] = useState<Actor>(initialVoice);

  // Sync with prop changes
  useEffect(() => {
    setVoice(initialVoice);
  }, [initialVoice]);

  //  CHRIS-PROTOCOL: Listen for global actor updates
  useEffect(() => {
    const handleGlobalUpdate = (e: CustomEvent<{ actor: Actor }>) => {
      const updatedActor = e.detail?.actor;
      if (updatedActor && (updatedActor.id === voice.id || updatedActor.wpProductId === voice.id)) {
        console.log(`[VoiceCard] Received global update for ${voice.display_name}`);
        
        // Ensure photo_url is correctly proxied if it's a raw path
        let finalPhotoUrl = updatedActor.photo_url || (updatedActor as any).dropboxUrl;
        if (finalPhotoUrl && !finalPhotoUrl.startsWith('http') && !finalPhotoUrl.startsWith('/api/proxy') && !finalPhotoUrl.startsWith('/assets')) {
          finalPhotoUrl = `/api/proxy/?path=${encodeURIComponent(finalPhotoUrl)}`;
        }

        setVoice(prev => ({
          ...prev,
          ...updatedActor,
          photo_url: finalPhotoUrl || prev.photo_url
        }));
      }
    };

    window.addEventListener('voices:actor-updated', handleGlobalUpdate as EventListener);
    return () => window.removeEventListener('voices:actor-updated', handleGlobalUpdate as EventListener);
  }, [voice.id, voice.display_name]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isSelected = useMemo(() => {
    if (!mounted || !voice || !state.selected_actors) return false;
    return state.selected_actors.some(a => a.id === voice.id);
  }, [voice, state.selected_actors, mounted]);

  const handleAdminClick = (e: React.MouseEvent) => {
    if (!voice) return;
    e.stopPropagation();
    openEditModal(voice);
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
    
    if (onSelect) {
      playClick(isSelected ? 'light' : 'pro');
      onSelect(voice);
    } else {
      //  CHRIS-PROTOCOL: In non-SPA context (like home carousel), 
      //  the plus button ALWAYS triggers the Casting Dock.
      playClick(isSelected ? 'soft' : 'pro');
      toggleActorSelection(voice);
    }
  };

  const handleVoiceDetails = (e: React.MouseEvent) => {
    if (!voice || onSelect) return;
    e.stopPropagation();
    playClick('soft');
    router.push(`/${voice.slug}`);
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
      if (time > 1 && time < 4) setActiveSubtitle(t('voice.video.subtitle1', "Professionele voice-overs..."));
      else if (time > 4 && time < 8) setActiveSubtitle(t('voice.video.subtitle2', "Voor al uw projecten."));
      else setActiveSubtitle(null);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [activeVideo, t]);

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

  const [pricingUpdateTick, setPricingUpdateTick] = useState(0);
  const [eventData, setEventData] = useState<any>(null);
  const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);
  const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const tagSelectorRef = useRef<HTMLDivElement>(null);
  const langSelectorRef = useRef<HTMLDivElement>(null);

  const market = MarketManager.getCurrentMarket();
  const supportedLangs = market.supported_languages;

  useEffect(() => {
    if (isTagSelectorOpen) {
      // Fetch unique tags from all actors
      fetch('/api/admin/actors/tags')
        .then(res => res.json())
        .then(data => {
          if (data.tags) setAvailableTags(data.tags);
        })
        .catch(err => console.error('Failed to fetch tags:', err));
    }
  }, [isTagSelectorOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagSelectorRef.current && !tagSelectorRef.current.contains(event.target as Node)) {
        setIsTagSelectorOpen(false);
      }
      if (langSelectorRef.current && !langSelectorRef.current.contains(event.target as Node)) {
        setIsLangSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTagToggle = async (tag: string) => {
    if (!voice) return;
    playClick('pro');
    
    const currentTags = voice.tone_of_voice?.split(',').map(tagItem => tagItem.trim()).filter(Boolean) || [];
    let newTags: string[];
    
    if (currentTags.includes(tag)) {
      newTags = currentTags.filter(existingTag => existingTag !== tag);
    } else {
      newTags = [...currentTags, tag];
    }
    
    const toneString = newTags.join(', ');
    
    try {
      const res = await fetch(`/api/admin/actors/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone_of_voice: toneString })
      });
      
      if (res.ok) {
        playClick('success');
      }
    } catch (err) {
      console.error('Failed to update tags:', err);
    }
  };

  const handleLangChange = async (langLabel: string) => {
    if (!voice) return;
    playClick('pro');
    
    const langCode = MarketManager.getLanguageCode(langLabel);
    
    try {
      const res = await fetch(`/api/admin/actors/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ native_lang: langCode })
      });
      
      if (res.ok) {
        playClick('success');
        setIsLangSelectorOpen(false);
      }
    } catch (err) {
      console.error('Failed to update language:', err);
    }
  };

  const filteredAvailableTags = useMemo(() => {
    return availableTags.filter(tag => 
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  }, [availableTags, tagSearchQuery]);

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
    
    // NUCLEAR GOD MODE: Gebruik direct de database datum voor de UI
    if (voice.delivery_date_min) {
      const date = new Date(voice.delivery_date_min);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();
      
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      
      return {
        deliveryDaysMin: voice.delivery_days_min || 1,
        deliveryDaysMax: voice.delivery_days_max || 1,
        formattedShort: isToday ? "VANDAAG" : `${d}/${m}/${y}`,
        isToday
      };
    }

    // Fallback naar live berekening indien DB veld leeg is (zou niet mogen gebeuren)
    return calculateDeliveryDate({
      deliveryDaysMin: voice.delivery_days_min || 1,
      deliveryDaysMax: voice.delivery_days_max || 1,
      cutoffTime: voice.cutoff_time || '18:00',
      availability: voice.availability,
      holidayFrom: voice.holiday_from,
      holidayTill: voice.holiday_till,
      delivery_config: voice.delivery_config
    });
  }, [voice]);

  const displayPrice = useMemo(() => {
    if (!voice) return null;
    //  CHRIS-PROTOCOL: Word count logic (Nuclear 2026)
    // In the Agency list (voice step), we ALWAYS use the filter word count for consistency.
    // In the Configurator (script step), we use the actual briefing word count.
    const isConfigurator = masterControlState.currentStep === 'script';
    const briefingWordCount = checkoutState.briefing.trim().split(/\s+/).filter(Boolean).length;
    
    const wordCount = isConfigurator && briefingWordCount > 0
      ? briefingWordCount 
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

    const result = SlimmeKassa.calculate({
      usage: masterControlState.journey === 'telephony' ? 'telefonie' : (masterControlState.journey === 'video' ? 'unpaid' : 'commercial'),
      plan: checkoutState.plan,
      words: wordCount,
      prompts: checkoutState.prompts,
      mediaTypes: masterControlState.journey === 'commercial' ? (currentMedia as any) : undefined,
      countries: masterControlState.filters.countries || [masterControlState.filters.country || 'BE'],
      spots: spotsMap,
      years: yearsMap,
      liveSession: masterControlState.filters.liveSession,
      actorRates: voice as any,
      music: checkoutState.music,
      isVatExempt: false
    }, checkoutState.pricingConfig || undefined);

    const status = SlimmeKassa.getAvailabilityStatus(
      voice as any, 
      masterControlState.journey === 'commercial' ? (currentMedia as any) : [], 
      masterControlState.filters.countries?.[0] || masterControlState.filters.country || 'BE'
    );

    if (status === 'unavailable') return null;

    const finalSubtotal = result.subtotal;
    
    return {
      price: SlimmeKassa.format(finalSubtotal).replace('', '').trim(),
      status,
      mediaBreakdown: result.mediaBreakdown
    };
  }, [voice, masterControlState.journey, masterControlState.filters, checkoutState.briefing, checkoutState.plan, checkoutState.prompts, checkoutState.music, eventData?.media, eventData?.spotsDetail, eventData?.yearsDetail, checkoutState.pricingConfig]);

  const sectorDemo = useMemo(() => {
    if (!voice) return null;
    const companyNameStr = getPlaceholderValue('company_name');
    switch (state.current_sector) {
      case 'gezondheidszorg': return t('sector.demo.healthcare', `Welkom bij ${companyNameStr}. Voor dringende medische hulp, bel 112. Voor een afspraak, blijf aan de lijn.`, { company: companyNameStr });
      case 'bouw': return t('sector.demo.construction', `Bedankt voor het bellen naar ${companyNameStr}. Wij realiseren uw droomproject van fundering tot dak.`, { company: companyNameStr });
      case 'it': return t('sector.demo.it', `U bent verbonden met de support desk van ${companyNameStr}. Al onze consultants zijn momenteel in gesprek.`, { company: companyNameStr });
      case 'juridisch': return t('sector.demo.legal', `Welkom bij ${companyNameStr}. Onze advocaten staan u graag bij met deskundig juridisch advies.`, { company: companyNameStr });
      default: return null;
    }
  }, [voice, state.current_sector, getPlaceholderValue, t]);

  if (!voice || !displayPrice) {
    return null;
  }

  //  CHRIS-PROTOCOL: Safe access to video filename for subtitles
  const videoFilename = voice.video_url?.split('/').pop()?.replace(/\.[^/.]+$/, "");

  return (
    <ContainerInstrument
      onClick={handleVoiceDetails}
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
        {/* Quality Stamps removed to avoid overlap and focus on audio demos */}

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
              className="absolute top-2 md:top-4 right-2 md:right-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all"
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
                label={t('common.language.dutch', "Nederlands")}
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
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            journey="agency"
            category="voicecards"
            onUpdate={async (newSrc) => {
              //  CHRIS-PROTOCOL: Direct DB update for actor photo
              try {
                const res = await fetch(`/api/admin/actors/${voice.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: voice.id,
                    photo_url: newSrc
                  })
                });
                
                if (!res.ok) throw new Error('Failed to update actor photo in database');
                
                // Trigger a global event to refresh all cards
                window.dispatchEvent(new CustomEvent('voices:actor-updated', { 
                  detail: { actor: { ...voice, photo_url: newSrc } } 
                }));
              } catch (err) {
                console.error('[VoiceCard] Photo update failed:', err);
              }
            }}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" 
          />
        ) : (
          <ContainerInstrument className="w-full h-full bg-va-off-white flex flex-col items-center justify-center gap-2 md:gap-4">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-va-black/5 flex items-center justify-center border-2 border-dashed border-va-black/10">
              <TextInstrument className="text-2xl md:text-3xl font-light text-va-black/20 tracking-tighter">
                {voice?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </TextInstrument>
            </div>
            <Mic strokeWidth={1.5} size={24} className="text-va-black/10 md:hidden" />
            <Mic strokeWidth={1.5} size={32} className="text-va-black/10 hidden md:block" />
          </ContainerInstrument>
        )}

        <ContainerInstrument 
          plain 
          className={cn(
            "absolute inset-0 flex flex-col p-2 md:p-4 transition-opacity duration-500 z-10",
            isCurrentlyPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 z-30 flex flex-wrap gap-1 md:gap-2 max-w-full overflow-hidden">
            {/*  CHRIS-PROTOCOL: Demos moved to MediaMaster for cleaner UI */}
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
                
                //  CHRIS-PROTOCOL: Monkeyproof Audio Switching
                // Check of deze specifieke acteur al aan het spelen is
                const isThisActorActive = activeDemo?.actor_name === voice.display_name;

                if (isThisActorActive) {
                  // Zelfde acteur: toggle play/pause
                  setGlobalIsPlaying(!globalIsPlaying);
                } else if (voice?.demos?.[0]) {
                  // Andere acteur: switch direct naar de eerste demo van deze persoon
                  const actorPlaylist = (voice.demos || []).map(d => ({
                    ...d,
                    actor_name: voice.display_name,
                    actor_photo: voice.photo_url,
                    actor_lang: voice.native_lang
                  }));

                  playDemo({
                    ...voice.demos[0],
                    actor_name: voice.display_name,
                    actor_photo: voice.photo_url,
                    actor_lang: voice.native_lang
                  }, actorPlaylist);
                }
              }}
              className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:scale-110 hover:bg-white/30 transition-all duration-500 shadow-2xl group/play"
            >
              {isCurrentlyPlaying ? (
                <Pause size={24} className="md:w-8 md:h-8" fill="currentColor" />
              ) : (
                <Play size={24} className="md:w-8 md:h-8 ml-1 group-hover/play:scale-110 transition-transform" />
              )}
            </button>
          </div>

          {activeSubtitle && (
            <div className="mt-auto pb-2 md:pb-4 text-center animate-in fade-in slide-in-from-bottom-2">
              <span className="px-2 md:px-4 py-1 md:py-2 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] md:text-xs font-medium border border-white/10">
                {activeSubtitle}
              </span>
            </div>
          )}
        </ContainerInstrument>

        {!activeVideo && voice.allow_free_trial !== false && (
          <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 z-40">
            <button 
              onClick={handleStudioToggle}
              className={cn(
                "h-8 md:h-10 rounded-full backdrop-blur-md flex items-center transition-all duration-500 shadow-lg border border-white/10 group/studio overflow-hidden",
                isSelected 
                  ? "bg-primary text-white border-primary px-2 md:px-3 gap-1 md:gap-2" 
                  : "bg-va-black/40 hover:bg-va-black/60 text-white px-2 md:px-3 gap-0 group-hover:gap-1 md:group-hover:gap-2 backdrop-blur-md"
              )}
            >
              {isSelected ? (
                <>
                  <Check size={14} className="md:w-4.5 md:h-4.5" strokeWidth={3} />
                </>
              ) : (
                <>
                  <Plus size={14} className="md:w-4.5 md:h-4.5 shrink-0 transition-transform group-hover/studio:rotate-90 duration-500" />
                  <span className="max-w-0 group-hover:max-w-[180px] opacity-0 group-hover:opacity-100 transition-all duration-500 text-[8px] md:text-[10px] font-black tracking-widest uppercase whitespace-nowrap">
                    <VoiceglotText 
                      translationKey="common.free_demo_cta" 
                      defaultText="Gratis proefopname" 
                      instrument="button"
                      maxChars={18}
                    />
                  </span>
                </>
              )}
            </button>
          </div>
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
        <div className="flex items-start justify-between px-4 md:px-6 pt-4 md:pt-6 pb-2 md:pb-3 border-b border-black/[0.02]">
          <div className="flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center gap-1 bg-va-off-white/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full border border-black/[0.05] w-fit relative">
              <VoiceFlag lang={voice?.native_lang} size={14} className="md:w-4.5 md:h-4.5" />
              <TextInstrument className="text-[11px] md:text-[13px] font-light text-va-black tracking-tight">
                <VoiceglotText 
                  translationKey={`common.language.${voice?.native_lang?.toLowerCase()}`} 
                  defaultText={voice?.native_lang_label || MarketManager.getLanguageLabel(voice?.native_lang || '')} 
                />
              </TextInstrument>
              
              {isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLangSelectorOpen(!isLangSelectorOpen);
                    playClick('pro');
                  }}
                  className="ml-1 text-primary hover:scale-110 transition-transform"
                >
                  <ChevronDown size={14} strokeWidth={3} />
                </button>
              )}

              <AnimatePresence>
                {isLangSelectorOpen && (
                  <motion.div
                    ref={langSelectorRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-black/10 py-2 z-[110]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                      {supportedLangs.map(langItem => {
                        const isSelectedLang = MarketManager.getLanguageCode(langItem) === voice.native_lang;
                        return (
                          <button
                            key={langItem}
                            onClick={() => handleLangChange(langItem)}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors flex items-center justify-between group",
                              isSelectedLang ? "bg-primary/10 text-primary" : "text-va-black hover:bg-va-off-white"
                            )}
                          >
                            <span>{langItem}</span>
                            {isSelectedLang && <Check size={14} strokeWidth={3} className="text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {voice?.extra_langs && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-1 animate-in fade-in slide-in-from-left-1 duration-500">
                {voice.extra_langs.split(',').filter(Boolean).map((lItem, idx) => {
                  const trimmed = lItem.trim().toLowerCase();
                  const label = MarketManager.getLanguageLabel(trimmed);

                  return (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full border border-black/5 bg-va-off-white flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                        <VoiceFlag lang={trimmed} size={10} />
                      </div>
                      <TextInstrument className="text-[10px] text-va-black/40 font-bold uppercase tracking-widest whitespace-nowrap">
                        <VoiceglotText 
                          translationKey={`common.language.${trimmed}`} 
                          defaultText={label} 
                        />
                      </TextInstrument>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!compact && (
            <div className={cn(
              "flex flex-col items-end justify-center px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg md:rounded-xl border transition-colors duration-500",
              (deliveryInfo as any).isToday || deliveryInfo.deliveryDaysMax <= 1 
                ? "bg-green-500/5 border-green-500/10 text-green-600" 
                : "bg-blue-500/5 border-blue-500/10 text-blue-600"
            )}>
              <span className="text-[7px] md:text-[8px] font-black tracking-[0.1em] uppercase leading-none mb-0.5 md:mb-1 flex items-center gap-1 opacity-40">
                <Clock size={8} className="md:w-2.5 md:h-2.5" strokeWidth={3} />
                <VoiceglotText translationKey="common.delivery" defaultText="Levering" />
              </span>
              <TextInstrument className="text-[10px] md:text-[12px] font-bold tracking-tight leading-none">
                <VoiceglotText 
                  translationKey={`actor.${voice.id}.delivery_info`} 
                  defaultText={deliveryInfo.formattedShort} 
                />
              </TextInstrument>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-6">
          <div className="flex flex-col mb-2 md:mb-3">
            <HeadingInstrument level={3} className={cn("font-extralight tracking-tighter leading-none group-hover:text-primary transition-colors truncate", compact ? "text-xl md:text-2xl mb-1 md:mb-1.5" : "text-2xl md:text-3xl mb-1 md:mb-1.5")}>
              <VoiceglotText  
                translationKey={`actor.${voice?.id}.name`} 
                defaultText={voice?.display_name} 
                noTranslate={true} 
              />
            </HeadingInstrument>

            {voice?.tone_of_voice && (
              <div className="flex flex-wrap gap-1 animate-in fade-in slide-in-from-bottom-1 duration-500 relative">
                {voice.tone_of_voice.split(',').filter(Boolean).slice(0, 2).map((toneItem, i) => (
              <span key={i} className="text-[7px] md:text-[8px] font-light tracking-[0.2em] uppercase px-1.5 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                <VoiceglotText 
                  translationKey={`actor.${voice.id}.tone.${i}`} 
                  context="Voice characteristic / Tone of voice (e.g. warm, deep, professional, energetic)" 
                  instrument="tag"
                  defaultText={toneItem.trim()} 
                />
              </span>
                ))}
                
                {isEditMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTagSelectorOpen(!isTagSelectorOpen);
                      playClick('pro');
                    }}
                    className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-all shadow-sm ml-1"
                  >
                    <Plus size={10} strokeWidth={3} />
                  </button>
                )}

                <AnimatePresence>
                  {isTagSelectorOpen && (
                    <motion.div
                      ref={tagSelectorRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-black/10 p-4 z-[100]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 mb-4 bg-va-off-white px-3 py-2 rounded-full border border-black/5">
                        <SearchIcon size={14} className="text-va-black/30" />
                        <input
                          autoFocus
                          type="text"
                          value={tagSearchQuery}
                          onChange={(e) => setTagSearchQuery(e.target.value)}
                          placeholder={t('action.search_or_add_tag', "Zoek of voeg tag toe...")}
                          className="bg-transparent border-none outline-none text-[13px] font-medium w-full"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && tagSearchQuery.trim()) {
                              handleTagToggle(tagSearchQuery.trim());
                              setTagSearchQuery('');
                            }
                          }}
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto no-scrollbar flex flex-wrap gap-2">
                        {filteredAvailableTags.map(tagItem => {
                          const isSelectedTag = voice.tone_of_voice?.split(',').map(tagToCompare => tagToCompare.trim()).includes(tagItem);
                          return (
                            <button
                              key={tagItem}
                              onClick={() => handleTagToggle(tagItem)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all",
                                isSelectedTag 
                                  ? "bg-primary text-white" 
                                  : "bg-va-off-white text-va-black/40 hover:bg-va-black/5"
                              )}
                            >
                              {tagItem}
                            </button>
                          );
                        })}
                        {tagSearchQuery && !availableTags.includes(tagSearchQuery) && (
                          <button
                            onClick={() => {
                              handleTagToggle(tagSearchQuery);
                              setTagSearchQuery('');
                            }}
                            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase flex items-center gap-1"
                          >
                            <Plus size={10} strokeWidth={3} />
                            Voeg &quot;{tagSearchQuery}&quot; toe
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          <div className="mb-2 md:mb-4 h-[40px] md:h-[60px] overflow-y-auto no-scrollbar">
            <TextInstrument className="text-va-black/60 text-[11px] md:text-[13px] font-medium leading-relaxed italic">
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

          <div className="flex justify-between items-center mt-auto pt-2 md:pt-4 border-t border-black/[0.03]">
            <div className="flex flex-col items-start">
              {!hidePrice && displayPrice && (
                <>
                  <TextInstrument className="text-[7px] md:text-[9px] font-light tracking-[0.2em] text-va-black/30 uppercase leading-none mb-0.5 md:mb-1">
                    <VoiceglotText translationKey="common.starting_from" defaultText="Vanaf" instrument="pricing" />
                  </TextInstrument>
                  <div className="flex items-baseline gap-0.5 md:gap-1">
                    <TextInstrument className="text-base md:text-xl font-extralight tracking-tighter text-va-black">
                      {displayPrice.price}
                    </TextInstrument>
                  </div>
                </>
              )}
            </div>

            {!hideButton && (
              <ButtonInstrument 
                onClick={handleMainAction}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-lg md:rounded-xl font-light tracking-[0.1em] uppercase text-[9px] md:text-[12px] transition-all duration-500",
                  isSelected 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105 px-2 md:px-4 py-2 md:py-4" 
                    : "px-3 md:px-5 py-2 md:py-4 hover:bg-va-black hover:text-white hover:border-va-black",
                  voice.allow_free_trial === false && !onSelect && "opacity-0 pointer-events-none"
                )}
              >
                {isSelected ? (
                  <Check size={14} strokeWidth={3} className="md:w-4.5 md:h-4.5 animate-in zoom-in duration-300" />
                ) : (
                  <div className="flex flex-col items-center leading-none gap-0.5 md:gap-1">
                    <VoiceglotText 
                      translationKey={onSelect ? "common.choose_voice" : "common.add_to_casting"} 
                      instrument="button"
                      defaultText={onSelect ? "Kies stem" : "Proefopname +"} 
                    />
                    {!onSelect && (
                      <span className="text-[7px] md:text-[8px] font-black tracking-[0.2em] opacity-50">
                        <VoiceglotText translationKey="common.free" defaultText="GRATIS" />
                      </span>
                    )}
                  </div>
                )}
              </ButtonInstrument>
            )}
          </div>
        </div>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
