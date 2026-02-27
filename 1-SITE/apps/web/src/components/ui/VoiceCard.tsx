"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useEditMode } from "@/contexts/EditModeContext";
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { calculateDeliveryDate } from '@/lib/utils/delivery-logic';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import { Actor } from '@/types';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Clock, Edit3, Globe, MapPin, Mic, Pause, Play, Plus, Search as SearchIcon, Settings, ShieldCheck, Zap, X, Star } from 'lucide-react';
import { useVoicesRouter } from '@/components/ui/VoicesLink';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, FlagAR, FlagBE, FlagBR, FlagCN, FlagDE, FlagDK, FlagES, FlagFI, FlagFR, FlagGR, FlagIT, FlagJP, FlagKR, FlagNL, FlagNO, FlagPL, FlagPT, FlagRU, FlagSE, FlagTR, FlagUK, FlagUS, HeadingInstrument, TextInstrument } from './LayoutInstruments';
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
  if (!lang) return <Globe size={size} className="opacity-20" />;
  const lowLang = lang.toLowerCase();
  
  const Flag = lowLang.includes('be') || lowLang === 'vlaams' || lowLang === 'frans (be)' ? FlagBE :
               lowLang.includes('nl') || lowLang === 'nederlands' || lowLang === 'dutch' ? FlagNL :
               lowLang.includes('fr') || lowLang === 'frans' || lowLang === 'frans (fr)' || lowLang === 'french' ? FlagFR :
               lowLang.includes('de') || lowLang === 'duits' || lowLang === 'german' ? FlagDE :
               lowLang.includes('gb') || lowLang.includes('uk') || lowLang === 'engels' || lowLang === 'english' ? FlagUK :
               lowLang.includes('us') ? FlagUS :
               lowLang.includes('es') || lowLang === 'spaans' || lowLang === 'spanish' ? FlagES :
               lowLang.includes('it') || lowLang === 'italiaans' || lowLang === 'italian' ? FlagIT :
               lowLang.includes('pl') || lowLang === 'pools' || lowLang === 'polish' ? FlagPL :
               lowLang.includes('dk') || lowLang === 'deens' || lowLang === 'danish' ? FlagDK :
               lowLang.includes('pt') || lowLang === 'portugees' || lowLang === 'portuguese' ? FlagPT :
               lowLang.includes('se') || lowLang === 'zweeds' || lowLang === 'swedish' ? FlagSE :
               lowLang.includes('no') || lowLang === 'noors' || lowLang === 'norwegian' ? FlagNO :
               lowLang.includes('fi') || lowLang === 'fins' || lowLang === 'finnish' ? FlagFI :
               lowLang.includes('gr') || lowLang === 'grieks' || lowLang === 'greek' ? FlagGR :
               lowLang.includes('tr') || lowLang === 'turks' || lowLang === 'turkish' ? FlagTR :
               lowLang.includes('ru') || lowLang === 'russisch' || lowLang === 'russian' ? FlagRU :
               lowLang.includes('cn') || lowLang.includes('zh') || lowLang === 'chinees' || lowLang === 'chinese' ? FlagCN :
               lowLang.includes('jp') || lowLang === 'japans' || lowLang === 'japanese' ? FlagJP :
               lowLang.includes('kr') || lowLang === 'koreaans' || lowLang === 'korean' ? FlagKR :
               lowLang.includes('ar') || lowLang === 'arabisch' || lowLang === 'arabic' ? FlagAR :
               lowLang.includes('br') || lowLang === 'braziliaans' || lowLang === 'brazilian' ? FlagBR : null;

  if (!Flag) return <Globe size={size} className="opacity-20" />;
  return <Flag size={size} />;
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

  const [voice, setVoice] = useState<Actor>(initialVoice);
  const topReview = (voice as any).top_review;

  useEffect(() => {
    setVoice(initialVoice);
  }, [initialVoice]);

  useEffect(() => {
    const handleGlobalUpdate = (e: CustomEvent<{ actor: Actor }>) => {
      const updatedActor = e.detail?.actor;
      if (updatedActor && (updatedActor.id === voice.id || (updatedActor as any).wp_product_id === voice.id)) {
        let finalPhotoUrl = updatedActor.photo_url || (updatedActor as any).dropbox_url;
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
    playClick(isSelected ? 'soft' : 'pro');
    toggleActorSelection(voice);
  };

  const handleMainAction = (e: React.MouseEvent) => {
    if (!voice) return;
    e.stopPropagation();
    
    if (onSelect) {
      playClick(isSelected ? 'soft' : 'pro');
      onSelect(voice);
    } else {
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
    if (!masterControlState.isMuted) {
      playSwell();
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string, name: string } | null>(null);

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
    // 🛡️ CHRIS-PROTOCOL: ID-First Handshake (v2.15.073)
    // We checken nu primair op actor_id ipv display_name om dubbelingen te voorkomen.
    return (activeDemo?.actor_id === voice?.id || activeDemo?.actor_name === voice?.display_name) && globalIsPlaying;
  }, [activeVideo, voice, isPlaying, activeDemo, globalIsPlaying]);

  const [eventData, setEventData] = useState<any>(null);
  const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);
  const [isToneSelectorOpen, setIsToneSelectorOpen] = useState(false);
  const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [isGenderSelectorOpen, setIsGenderSelectorOpen] = useState(false);
  const [isExperienceSelectorOpen, setIsExperienceSelectorOpen] = useState(false);
  const [isStatusSelectorOpen, setIsStatusSelectorOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableVoiceTones, setAvailableVoiceTones] = useState<any[]>([]);
  const [availableLangs, setAvailableLangs] = useState<any[]>([]);
  const [availableCountries, setAvailableCountries] = useState<any[]>([]);
  const [availableGenders, setAvailableGenders] = useState<any[]>([]);
  const [availableExperienceLevels, setAvailableExperienceLevels] = useState<any[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<any[]>([]);
  const tagSelectorRef = useRef<HTMLDivElement>(null);
  const toneSelectorRef = useRef<HTMLDivElement>(null);
  const langSelectorRef = useRef<HTMLDivElement>(null);
  const countrySelectorRef = useRef<HTMLDivElement>(null);
  const genderSelectorRef = useRef<HTMLDivElement>(null);
  const experienceSelectorRef = useRef<HTMLDivElement>(null);
  const statusSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTagSelectorOpen) {
      fetch('/api/admin/actors/tags')
        .then(res => res.json())
        .then(data => {
          if (data.tags) setAvailableTags(data.tags);
        })
        .catch(err => console.error('Failed to fetch tags:', err));
    }
  }, [isTagSelectorOpen]);

  useEffect(() => {
    if (isLangSelectorOpen) {
      fetch('/api/admin/config?type=languages')
        .then(res => res.json())
        .then(data => {
          if (data.results) setAvailableLangs(data.results);
        })
        .catch(err => console.error('Failed to fetch languages:', err));
    }
  }, [isLangSelectorOpen]);

  useEffect(() => {
    if (isGenderSelectorOpen) {
      fetch('/api/admin/config?type=genders')
        .then(res => res.json())
        .then(data => {
          if (data.results) setAvailableGenders(data.results);
        })
        .catch(err => console.error('Failed to fetch genders:', err));
    }
  }, [isGenderSelectorOpen]);

  useEffect(() => {
    if (isExperienceSelectorOpen) {
      fetch('/api/admin/config?type=experience-levels')
        .then(res => res.json())
        .then(data => {
          if (data.results) setAvailableExperienceLevels(data.results);
        })
        .catch(err => console.error('Failed to fetch experience levels:', err));
    }
  }, [isExperienceSelectorOpen]);

  useEffect(() => {
    if (isStatusSelectorOpen) {
      fetch('/api/admin/config?type=actor-statuses')
        .then(res => res.json())
        .then(data => {
          if (data.results) setAvailableStatuses(data.results);
        })
        .catch(err => console.error('Failed to fetch statuses:', err));
    }
  }, [isStatusSelectorOpen]);

  useEffect(() => {
    if (isToneSelectorOpen) {
      fetch('/api/admin/config?type=voice-tones')
        .then(res => res.json())
        .then(data => {
          if (data.results) setAvailableVoiceTones(data.results);
        })
        .catch(err => console.error('Failed to fetch voice tones:', err));
    }
  }, [isToneSelectorOpen]);

  useEffect(() => {
    if (isCountrySelectorOpen) {
      fetch('/api/admin/config?type=countries')
        .then(res => res.json())
        .then(data => {
          if (data.results) setAvailableCountries(data.results);
        })
        .catch(err => console.error('Failed to fetch countries:', err));
    }
  }, [isCountrySelectorOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagSelectorRef.current && !tagSelectorRef.current.contains(event.target as Node)) setIsTagSelectorOpen(false);
      if (toneSelectorRef.current && !toneSelectorRef.current.contains(event.target as Node)) setIsToneSelectorOpen(false);
      if (langSelectorRef.current && !langSelectorRef.current.contains(event.target as Node)) setIsLangSelectorOpen(false);
      if (countrySelectorRef.current && !countrySelectorRef.current.contains(event.target as Node)) setIsCountrySelectorOpen(false);
      if (genderSelectorRef.current && !genderSelectorRef.current.contains(event.target as Node)) setIsGenderSelectorOpen(false);
      if (experienceSelectorRef.current && !experienceSelectorRef.current.contains(event.target as Node)) setIsExperienceSelectorOpen(false);
      if (statusSelectorRef.current && !statusSelectorRef.current.contains(event.target as Node)) setIsStatusSelectorOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryChange = async (countryId: number) => {
    if (!voice) return;
    playClick('pro');
    try {
      const res = await fetch(`/api/admin/actors/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country_id: countryId })
      });
      if (res.ok) {
        playClick('success');
        setIsCountrySelectorOpen(false);
        const selected = availableCountries.find(c => c.id === countryId);
        if (selected) setVoice(prev => ({ ...prev, country_id: countryId, country: selected.code }));
      }
    } catch (err) { console.error('Failed to update country:', err); }
  };

  const handleToneToggle = async (toneId: number) => {
    if (!voice) return;
    playClick('pro');
    const currentTones = voice.tone_ids || [];
    const newTones = currentTones.includes(toneId) ? currentTones.filter(id => id !== toneId) : [...currentTones, toneId];
    try {
      const res = await fetch(`/api/admin/actors/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone_ids: newTones })
      });
      if (res.ok) {
        playClick('success');
        setVoice(prev => ({ ...prev, tone_ids: newTones }));
      }
    } catch (err) { console.error('Failed to update tones:', err); }
  };

  const handleTagToggle = async (tag: string) => {
    if (!voice) return;
    playClick('pro');
    const currentTags = voice.tone_of_voice?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag];
    const toneString = newTags.join(', ');
    try {
      const res = await fetch(`/api/admin/actors/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone_of_voice: toneString })
      });
      if (res.ok) {
        playClick('success');
        setVoice(prev => ({ ...prev, tone_of_voice: toneString }));
      }
    } catch (err) { console.error('Failed to update tags:', err); }
  };

  const handleLangChange = async (langId: number) => {
    if (!voice) return;
    playClick('pro');
    try {
      const res = await fetch(`/api/admin/actors/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ native_lang_id: langId })
      });
      if (res.ok) {
        playClick('success');
        setIsLangSelectorOpen(false);
        const selectedLang = availableLangs.find(l => l.id === langId);
        if (selectedLang) setVoice(prev => ({ ...prev, native_lang_id: langId, native_lang: selectedLang.code, native_lang_label: selectedLang.label }));
      }
    } catch (err) { console.error('Failed to update language:', err); }
  };

  const handleGenderChange = async (genderId: number) => {
    if (!voice) return;
    playClick('pro');
    try {
      const res = await fetch(`/api/admin/actors/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender_id: genderId })
      });
      if (res.ok) {
        playClick('success');
        setIsGenderSelectorOpen(false);
        const selected = availableGenders.find(g => g.id === genderId);
        if (selected) setVoice(prev => ({ ...prev, gender_id: genderId, gender: selected.code }));
      }
    } catch (err) { console.error('Failed to update gender:', err); }
  };

  const handleExperienceChange = async (levelId: number) => {
    if (!voice) return;
    playClick('pro');
    try {
      const res = await fetch(`/api/admin/actors/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience_level_id: levelId })
      });
      if (res.ok) {
        playClick('success');
        setIsExperienceSelectorOpen(false);
        const selected = availableExperienceLevels.find(e => e.id === levelId);
        if (selected) setVoice(prev => ({ ...prev, experience_level_id: levelId, experience_level: selected.code }));
      }
    } catch (err) { console.error('Failed to update experience level:', err); }
  };

  const handleStatusChange = async (statusId: number) => {
    if (!voice) return;
    playClick('pro');
    try {
      const res = await fetch(`/api/admin/actors/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: statusId })
      });
      if (res.ok) {
        playClick('success');
        setIsStatusSelectorOpen(false);
        const selected = availableStatuses.find(s => s.id === statusId);
        if (selected) setVoice(prev => ({ ...prev, status_id: statusId, status: selected.code }));
      }
    } catch (err) { console.error('Failed to update status:', err); }
  };

  const filteredAvailableTags = useMemo(() => availableTags.filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase())), [availableTags, tagSearchQuery]);

  useEffect(() => {
    const handleUpdate = (e: any) => { if (e.detail) setEventData(e.detail); };
    window.addEventListener('voices_pricing_update', handleUpdate);
    return () => window.removeEventListener('voices_pricing_update', handleUpdate);
  }, []);

  const deliveryInfo = useMemo(() => {
    if (!voice) return { delivery_days_min: 1, delivery_days_max: 1, formattedShort: '' };
    const deliveryDateMin = (voice as any).delivery_date_min;
    if (deliveryDateMin) {
      const date = new Date(deliveryDateMin);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return { delivery_days_min: voice.delivery_days_min || 1, delivery_days_max: voice.delivery_days_max || 1, formattedShort: isToday ? "VANDAAG" : `${d}/${m}/${y}`, isToday };
    }
    return calculateDeliveryDate({ delivery_days_min: voice.delivery_days_min || 1, delivery_days_max: voice.delivery_days_max || 1, cutoff_time: voice.cutoff_time || '18:00', availability: voice.availability, holidayFrom: (voice as any).holiday_from, holidayTill: (voice as any).holiday_till, delivery_config: (voice as any).delivery_config });
  }, [voice]);

  const displayPrice = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7691/ingest/0b1da146-0703-4910-bde4-4876f6bb4146',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'81e7e6'},body:JSON.stringify({sessionId:'81e7e6',runId:'run1',hypothesisId:'H1',location:'VoiceCard.tsx:456',message:'displayPrice useMemo',data:{hasVoice: !!voice, hasCheckoutBriefing: typeof checkoutState?.briefing !== 'undefined', briefingType: typeof checkoutState?.briefing},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!voice || !masterControlState || !checkoutState) return null;
    const isConfigurator = masterControlState.currentStep === 'script';
    const briefingWordCount = (checkoutState.briefing || '').trim().split(/\s+/).filter(Boolean).length;
    const promptCount = (checkoutState.briefing || '').trim().split(/\n+/).filter(Boolean).length;
    const wordCount = isConfigurator && briefingWordCount > 0 ? briefingWordCount : (masterControlState.filters?.words || 0);
    const currentSpotsDetail = eventData?.spotsDetail || masterControlState.filters?.spotsDetail;
    const currentYearsDetail = eventData?.yearsDetail || masterControlState.filters?.yearsDetail;
    const currentMedia = eventData?.media || masterControlState.filters?.media || ['online'];
    const spotsMap = masterControlState.journey === 'commercial' && Array.isArray(currentMedia) ? currentMedia.reduce((acc, m) => ({ ...acc, [m]: (currentSpotsDetail && currentSpotsDetail[m]) || masterControlState.filters?.spots || 1 }), {}) : undefined;
    const yearsMap = masterControlState.journey === 'commercial' && Array.isArray(currentMedia) ? currentMedia.reduce((acc, m) => ({ ...acc, [m]: (currentYearsDetail && currentYearsDetail[m]) || masterControlState.filters?.years || 1 }), {}) : undefined;
    const result = SlimmeKassa.calculate({ usage: masterControlState.journey === 'telephony' ? 'telefonie' : (masterControlState.journey === 'video' ? 'unpaid' : 'commercial'), plan: checkoutState.plan, words: wordCount, prompts: isConfigurator ? promptCount : (checkoutState.prompts || 1), mediaTypes: masterControlState.journey === 'commercial' ? (currentMedia as any) : undefined, countries: masterControlState.filters?.countries || [masterControlState.filters?.country || 'BE'], spots: spotsMap, years: yearsMap, liveSession: masterControlState.filters?.liveSession, actorRates: voice as any, music: checkoutState.music, isVatExempt: false }, checkoutState.pricingConfig || undefined);
    
    if (!result) return null;

    const status = SlimmeKassa.getAvailabilityStatus(voice as any, masterControlState.journey === 'commercial' ? (currentMedia as any) : [], masterControlState.filters?.countries?.[0] || masterControlState.filters?.country || 'BE');
    
    if (status === 'unavailable') {
      console.log(`[VoiceCard] Actor ${voice.id} (${voice.display_name}) is unavailable for current filters.`, {
        journey: masterControlState.journey,
        media: currentMedia,
        country: masterControlState.filters?.countries?.[0] || masterControlState.filters?.country || 'BE'
      });
      return null;
    }

    return { price: SlimmeKassa.format(result.subtotal || 0).replace('', '').trim(), status, mediaBreakdown: result.mediaBreakdown };
  }, [voice, masterControlState?.journey, masterControlState?.currentStep, masterControlState?.filters, checkoutState?.briefing, checkoutState?.plan, checkoutState?.prompts, checkoutState?.music, eventData?.media, eventData?.spotsDetail, eventData?.yearsDetail, checkoutState?.pricingConfig]);

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

  if (!voice || !displayPrice) return null;
  const videoFilename = voice.video_url?.split('/').pop()?.replace(/\.[^/.]+$/, "") || "";

  return (
    <div
      onClick={handleVoiceDetails}
      data-actor-card
      data-actor-id={voice.id}
      data-actor-name={voice.display_name}
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

      <div className="relative bg-va-black overflow-hidden shrink-0 aspect-square w-full">
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
              <track label={t('common.language.dutch', "Nederlands")} kind="subtitles" srcLang="nl" src={`/assets/studio/workshops/subtitles/${videoFilename}-nl.vtt`} default />
            )}
          </video>
        ) : voice?.photo_url ? (
          <VoiceglotImage src={voice.photo_url} alt={voice.display_name} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" journey="agency" category="voicecards" onUpdate={async (newSrc, mediaId) => { try { const res = await fetch(`/api/admin/actors/${voice.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: voice.id, photo_id: mediaId }) }); if (!res.ok) throw new Error('Failed to update actor photo in database'); window.dispatchEvent(new CustomEvent('voices:actor-updated', { detail: { actor: { ...voice, photo_url: newSrc } } })); } catch (err) { console.error('[VoiceCard] Photo update failed:', err); } }} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
        ) : (
          <div className="w-full h-full bg-va-off-white flex flex-col items-center justify-center gap-2 md:gap-4">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-va-black/5 flex items-center justify-center border-2 border-dashed border-va-black/10">
              <span className="text-2xl md:text-3xl font-light text-va-black/20 tracking-tighter">{(voice?.display_name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
            </div>
            <Mic strokeWidth={1.5} size={24} className="text-va-black/10 md:hidden" />
            <Mic strokeWidth={1.5} size={32} className="text-va-black/10 hidden md:block" />
          </div>
        )}

        <div className={cn("absolute inset-0 flex flex-col p-2 md:p-4 transition-opacity duration-500 z-10", isCurrentlyPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
          <div className="flex-grow flex items-center justify-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (activeVideo) {
                  if (isPlaying) { videoRef.current?.pause(); setIsPlaying(false); } else { videoRef.current?.play(); setIsPlaying(true); }
                  return;
                }
                const isThisActorActive = activeDemo?.actor_id === voice.id || activeDemo?.actor_name === voice.display_name;
                if (isThisActorActive) { 
                  setGlobalIsPlaying(!globalIsPlaying); 
                } else if (voice?.demos?.length) { 
                  // 🛡️ CHRIS-PROTOCOL: Journey-Aware Playback (v2.14.766)
                  // We prioriteren demo's die matchen met de huidige journey.
                  const currentJourney = masterControlState.journey;
                  const sortedDemos = [...voice.demos].sort((a, b) => {
                    const aMatch = a.category === currentJourney;
                    const bMatch = b.category === currentJourney;
                    if (aMatch && !bMatch) return -1;
                    if (!aMatch && bMatch) return 1;
                    return 0;
                  });

                  const actorPlaylist = sortedDemos.map(d => ({ 
                    ...d, 
                    actor_id: voice.id, // 🛡️ CHRIS-PROTOCOL: ID-First Handshake
                    actor_name: voice.display_name, 
                    actor_photo: voice.photo_url, 
                    actor_lang: voice.native_lang 
                  })); 
                  
                  playDemo({ 
                    ...sortedDemos[0], 
                    actor_id: voice.id, // 🛡️ CHRIS-PROTOCOL: ID-First Handshake
                    actor_name: voice.display_name, 
                    actor_photo: voice.photo_url, 
                    actor_lang: voice.native_lang 
                  }, actorPlaylist); 
                }
              }}
              className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:scale-110 hover:bg-white/30 transition-all duration-500 shadow-2xl group/play"
            >
              {isCurrentlyPlaying ? <Pause size={24} className="md:w-8 md:h-8" fill="currentColor" /> : <Play size={24} className="md:w-8 md:h-8 ml-1 group-hover/play:scale-110 transition-transform" />}
            </button>
          </div>
          {activeSubtitle && (
            <div className="mt-auto pb-2 md:pb-4 text-center animate-in fade-in slide-in-from-bottom-2">
              <span className="px-2 md:px-4 py-1 md:py-2 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] md:text-xs font-medium border border-white/10">{activeSubtitle}</span>
            </div>
          )}
        </div>

        {!activeVideo && (voice as any).allow_free_trial !== false && masterControlState.journey !== 'telephony' && (
          <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 z-40">
            <button onClick={handleStudioToggle} className={cn("h-8 md:h-10 rounded-full backdrop-blur-md flex items-center transition-all duration-500 shadow-lg border border-white/10 group/studio overflow-hidden", isSelected ? "bg-primary text-white border-primary px-2 md:px-3 gap-1 md:gap-2" : "bg-va-black/40 hover:bg-va-black/60 text-white px-2 md:px-3 gap-0 group-hover:gap-1 md:group-hover:gap-2 backdrop-blur-md")}>
              {isSelected ? <Check size={14} className="md:w-4.5 md:h-4.5" strokeWidth={3} /> : <><Plus size={14} className="md:w-4.5 md:h-4.5 shrink-0 transition-transform group-hover/studio:rotate-90 duration-500" /><span className="max-w-0 group-hover:max-w-[180px] opacity-0 group-hover:opacity-100 transition-all duration-500 text-[8px] md:text-[10px] font-black tracking-widest uppercase whitespace-nowrap"><VoiceglotText translationKey="common.free_demo_cta" defaultText="Gratis proefopname" /></span></>}
            </button>
          </div>
        )}

        {isAdmin && (
          <button onClick={handleAdminClick} className="absolute top-4 left-4 z-40 w-10 h-10 rounded-full bg-va-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-all duration-300 shadow-lg border border-white/10 group/admin">
            <Edit3 size={18} className="group-hover/admin:rotate-12 transition-transform" />
          </button>
        )}
      </div>

      <div className="p-0 flex flex-col flex-grow">
        <div className="flex items-start justify-between px-4 md:px-6 pt-4 md:pt-6 pb-2 md:pb-3 border-b border-black/[0.02]">
          <div className="flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center gap-1 bg-va-off-white/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full border border-black/[0.05] w-fit relative">
              <VoiceFlag lang={voice?.native_lang} size={14} />
              {/* 🛡️ CHRIS-PROTOCOL: Use alias to prevent ReferenceError: MarketManager is not defined */}
              <span className="text-[11px] md:text-[13px] font-light text-va-black tracking-tight"><VoiceglotText translationKey={voice?.native_lang_id ? `language.${voice.native_lang_id}` : `common.language.${voice?.native_lang?.toLowerCase()}`} defaultText={voice?.native_lang_label || MarketManager.getLanguageLabel(voice?.native_lang || '') || t('common.unknown_language', 'Onbekende taal')} /></span>
              {isEditMode && (
                <div className="flex items-center gap-1 ml-1">
                  <button onClick={(e) => { e.stopPropagation(); setIsLangSelectorOpen(!isLangSelectorOpen); playClick('pro'); }} className="text-primary hover:scale-110 transition-transform" title="Taal wijzigen"><ChevronDown size={14} strokeWidth={3} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setIsCountrySelectorOpen(!isCountrySelectorOpen); playClick('pro'); }} className="text-primary hover:scale-110 transition-transform" title="Land wijzigen"><MapPin size={14} strokeWidth={1.5} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setIsGenderSelectorOpen(!isGenderSelectorOpen); playClick('pro'); }} className="text-primary hover:scale-110 transition-transform" title="Geslacht wijzigen"><Mic size={14} strokeWidth={1.5} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setIsExperienceSelectorOpen(!isExperienceSelectorOpen); playClick('pro'); }} className="text-primary hover:scale-110 transition-transform" title="Ervaring wijzigen"><Zap size={14} strokeWidth={1.5} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setIsStatusSelectorOpen(!isStatusSelectorOpen); playClick('pro'); }} className="text-primary hover:scale-110 transition-transform" title="Status wijzigen"><Settings size={14} strokeWidth={1.5} /></button>
                </div>
              )}
              <AnimatePresence>
                {isLangSelectorOpen && (
                  <motion.div ref={langSelectorRef} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-black/10 py-2 z-[110]" onClick={(e) => e.stopPropagation()}>
                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                      {availableLangs.map(langItem => { const isSelectedLang = langItem.id === voice.native_lang_id; return ( <button key={langItem.id} onClick={() => handleLangChange(langItem.id)} className={cn("w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors flex items-center justify-between group", isSelectedLang ? "bg-primary/10 text-primary" : "text-va-black hover:bg-va-off-white")}><span>{langItem.label}</span>{isSelectedLang && <Check size={14} strokeWidth={3} className="text-primary" />}</button> ); })}
                    </div>
                  </motion.div>
                )}
                {isCountrySelectorOpen && (
                  <motion.div ref={countrySelectorRef} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-black/10 py-2 z-[110]" onClick={(e) => e.stopPropagation()}>
                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                      {availableCountries.map(item => { const isSelected = item.id === (voice as any).country_id; return ( <button key={item.id} onClick={() => handleCountryChange(item.id)} className={cn("w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors flex items-center justify-between group", isSelected ? "bg-primary/10 text-primary" : "text-va-black hover:bg-va-off-white")}><span>{item.label}</span>{isSelected && <Check size={14} strokeWidth={3} className="text-primary" />}</button> ); })}
                    </div>
                  </motion.div>
                )}
                {isGenderSelectorOpen && (
                  <motion.div ref={genderSelectorRef} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-black/10 py-2 z-[110]" onClick={(e) => e.stopPropagation()}>
                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                      {availableGenders.map(item => { const isSelected = item.id === (voice as any).gender_id; return ( <button key={item.id} onClick={() => handleGenderChange(item.id)} className={cn("w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors flex items-center justify-between group", isSelected ? "bg-primary/10 text-primary" : "text-va-black hover:bg-va-off-white")}><span>{item.label}</span>{isSelected && <Check size={14} strokeWidth={3} className="text-primary" />}</button> ); })}
                    </div>
                  </motion.div>
                )}
                {isExperienceSelectorOpen && (
                  <motion.div ref={experienceSelectorRef} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-black/10 py-2 z-[110]" onClick={(e) => e.stopPropagation()}>
                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                      {availableExperienceLevels.map(item => { const isSelected = item.id === (voice as any).experience_level_id; return ( <button key={item.id} onClick={() => handleExperienceChange(item.id)} className={cn("w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors flex items-center justify-between group", isSelected ? "bg-primary/10 text-primary" : "text-va-black hover:bg-va-off-white")}><span>{item.label}</span>{isSelected && <Check size={14} strokeWidth={3} className="text-primary" />}</button> ); })}
                    </div>
                  </motion.div>
                )}
                {isStatusSelectorOpen && (
                  <motion.div ref={statusSelectorRef} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-black/10 py-2 z-[110]" onClick={(e) => e.stopPropagation()}>
                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                      {availableStatuses.map(item => { const isSelected = item.id === (voice as any).status_id; return ( <button key={item.id} onClick={() => handleStatusChange(item.id)} className={cn("w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors flex items-center justify-between group", isSelected ? "bg-primary/10 text-primary" : "text-va-black hover:bg-va-off-white")}><span>{item.label}</span>{isSelected && <Check size={14} strokeWidth={3} className="text-primary" />}</button> ); })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {voice?.extra_langs && masterControlState.journey === 'telephony' && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-1 animate-in fade-in slide-in-from-left-1 duration-500">
                {voice.extra_langs.split(',').filter(Boolean).map((lItem, idx) => {
                  const trimmed = lItem.trim().toLowerCase();
                  // 🛡️ CHRIS-PROTOCOL: Use alias to prevent ReferenceError: MarketManager is not defined
                  const label = MarketManager.getLanguageLabel(trimmed);
                  const isSelectedInFilter = masterControlState.filters.languages?.includes(trimmed) || (masterControlState.filters.languageIds && (masterControlState.filters.languageIds || []).length > 1 && masterControlState.filters.languages?.includes(trimmed));
                  return (
                    <div key={idx} className={cn("flex items-center gap-1.5 transition-all duration-500", isSelectedInFilter ? "scale-110" : "opacity-60")}>
                      <div className={cn("w-4 h-4 rounded-full border border-black/5 flex items-center justify-center overflow-hidden shadow-sm shrink-0", isSelectedInFilter ? "ring-2 ring-primary ring-offset-1" : "bg-va-off-white")}>
                        <VoiceFlag lang={trimmed} size={10} />
                      </div>
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest whitespace-nowrap", isSelectedInFilter ? "text-primary" : "text-va-black/40")}><VoiceglotText translationKey={`common.language.${trimmed}`} defaultText={label} /></span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!compact && (
            <div className={cn("flex flex-col items-end justify-center px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg md:rounded-xl border transition-colors duration-500", (deliveryInfo as any).isToday || deliveryInfo.delivery_days_max <= 1 ? "bg-green-500/5 border-green-500/10 text-green-600" : "bg-blue-500/5 border-blue-500/10 text-blue-600")}>
              <span className="text-[7px] md:text-[8px] font-black tracking-[0.1em] uppercase leading-none mb-0.5 md:mb-1 flex items-center gap-1 opacity-40"><Clock size={8} className="md:w-2.5 md:h-2.5" strokeWidth={3} /><VoiceglotText translationKey="common.delivery" defaultText="Levering" /></span>
              <span className="text-[10px] md:text-[12px] font-bold tracking-tight leading-none"><VoiceglotText translationKey={`actor.${voice.id}.delivery_info`} defaultText={deliveryInfo.formattedShort} /></span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-6">
          <div className="flex flex-col mb-2 md:mb-3">
            <HeadingInstrument level={3} className={cn("font-extralight tracking-tighter leading-none group-hover:text-primary transition-colors truncate", compact ? "text-xl md:text-2xl mb-1 md:mb-1.5" : "text-2xl md:text-3xl mb-1 md:mb-1.5")}>
              <VoiceglotText translationKey={`actor.${voice?.id}.name`} defaultText={voice?.display_name || ''} noTranslate={true} />
            </HeadingInstrument>

            {voice?.tone_of_voice && (
              <div className="flex flex-wrap gap-1 animate-in fade-in slide-in-from-bottom-1 duration-500 relative">
                {voice.tone_of_voice.split(',').filter(Boolean).slice(0, 2).map((toneItem, i) => (
                  <span key={i} className="text-[7px] md:text-[8px] font-light tracking-[0.2em] uppercase px-1.5 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10"><VoiceglotText translationKey={`actor.${voice.id}.tone.${i}`} context="Voice characteristic" defaultText={toneItem.trim()} /></span>
                ))}
                {isEditMode && (
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setIsToneSelectorOpen(!isToneSelectorOpen); playClick('pro'); }} className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-all shadow-sm" title="Relational Tones"><Zap size={10} strokeWidth={3} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setIsTagSelectorOpen(!isTagSelectorOpen); playClick('pro'); }} className="w-5 h-5 rounded-full bg-va-black/20 text-white flex items-center justify-center hover:scale-110 transition-all shadow-sm" title="Legacy Tags"><Plus size={10} strokeWidth={3} /></button>
                  </div>
                )}
                <AnimatePresence>
                  {isToneSelectorOpen && (
                    <motion.div ref={toneSelectorRef} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-black/10 p-4 z-[100]" onClick={(e) => e.stopPropagation()}>
                      <HeadingInstrument level={4} className="text-[10px] font-bold tracking-widest uppercase text-va-black/40 mb-3 px-1">Voice Tones</HeadingInstrument>
                      <div className="max-h-48 overflow-y-auto no-scrollbar flex flex-wrap gap-2">
                        {availableVoiceTones.map(tone => { const isSelected = voice.tone_ids?.includes(tone.id); return ( <button key={tone.id} onClick={() => handleToneToggle(tone.id)} className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all", isSelected ? "bg-primary text-white" : "bg-va-off-white text-va-black/40 hover:bg-va-black/5")}>{tone.label}</button> ); })}
                      </div>
                    </motion.div>
                  )}
                  {isTagSelectorOpen && (
                    <motion.div ref={tagSelectorRef} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-black/10 p-4 z-[100]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 mb-4 bg-va-off-white px-3 py-2 rounded-full border border-black/5">
                        <SearchIcon size={14} className="text-va-black/30" />
                        <input autoFocus type="text" value={tagSearchQuery} onChange={(e) => setTagSearchQuery(e.target.value)} placeholder={t('action.search_or_add_tag', "Zoek of voeg tag toe...")} className="bg-transparent border-none outline-none text-[13px] font-medium w-full" onKeyDown={(e) => { if (e.key === 'Enter' && tagSearchQuery.trim()) { handleTagToggle(tagSearchQuery.trim()); setTagSearchQuery(''); } }} />
                      </div>
                      <div className="max-h-64 overflow-y-auto no-scrollbar flex flex-wrap gap-2">
                        {filteredAvailableTags.map(tagItem => { const isSelectedTag = voice.tone_of_voice?.split(',').map(t => t.trim()).includes(tagItem); return ( <button key={tagItem} onClick={() => handleTagToggle(tagItem)} className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all", isSelectedTag ? "bg-primary text-white" : "bg-va-off-white text-va-black/40 hover:bg-va-black/5")}>{tagItem}</button> ); })}
                        {tagSearchQuery && !availableTags.includes(tagSearchQuery) && ( <button onClick={() => { handleTagToggle(tagSearchQuery); setTagSearchQuery(''); }} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase flex items-center gap-1"><Plus size={10} strokeWidth={3} />Voeg &quot;{tagSearchQuery}&quot; toe</button> )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          <div className="mb-2 md:mb-4 h-[40px] md:h-[60px] overflow-y-auto no-scrollbar">
            <span className="text-va-black/60 text-[11px] md:text-[13px] font-medium leading-relaxed italic">
              {sectorDemo ? sectorDemo : <VoiceglotText translationKey={`actor.${voice?.id}.bio`} defaultText={cleanDescription(voice?.tagline || voice?.bio || 'Professionele voice-over voor al uw projecten.')} />}
            </span>
          </div>

          {/* 🛡️ CHRIS-PROTOCOL: Contextual Mirroring Review Injection (v2.14.805) */}
          {/* REMOVED: Review injection removed to improve visual balance as requested by user (v2.15.073) */}
          {/* 
          <AnimatePresence>
            {topReview && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-va-off-white/50 rounded-[12px] border border-black/[0.03] group/review-box hover:bg-white transition-all duration-500"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={8} className={cn(i < (topReview.rating || 5) ? "text-[#fabc05]" : "text-va-black/5")} fill="currentColor" />
                    ))}
                  </div>
                  <TextInstrument className="text-[8px] font-bold uppercase tracking-[0.1em] text-va-black/20">
                    {topReview.type === 'actor' ? (
                      <VoiceglotText translationKey="common.review_for_actor" defaultText={`Review voor ${voice.first_name}`} />
                    ) : (
                      <VoiceglotText translationKey="common.review_for_voices" defaultText="Klant over Voices" />
                    )}
                  </TextInstrument>
                </div>
                <TextInstrument className="text-[11px] font-light italic text-va-black/50 line-clamp-2 leading-snug">
                  &quot;{topReview.textNl || topReview.textEn || "Top service!"}&quot;
                </TextInstrument>
              </motion.div>
            )}
          </AnimatePresence>
          */}

          <div className="flex justify-between items-center mt-auto pt-2 md:pt-4 border-t border-black/[0.03]">
            <div className="flex flex-col items-start">
              {!hidePrice && displayPrice && (
                <>
                  <span className="text-[7px] md:text-[9px] font-light tracking-[0.2em] text-va-black/30 uppercase leading-none mb-0.5 md:mb-1"><VoiceglotText translationKey="common.starting_from" defaultText="Vanaf" /></span>
                  <div className="flex items-baseline gap-0.5 md:gap-1">
                    <span className="text-base md:text-xl font-extralight tracking-tighter text-va-black">{displayPrice.price}</span>
                  </div>
                </>
              )}
            </div>

            {!hideButton && (
              <ButtonInstrument onClick={handleMainAction} variant={isSelected ? "default" : "outline"} size="sm" className={cn("rounded-lg md:rounded-xl font-light tracking-[0.1em] uppercase text-[9px] md:text-[12px] transition-all duration-500", isSelected ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105 px-2 md:px-4 py-2 md:py-4" : "px-3 md:px-5 py-2 md:py-4 hover:bg-va-black hover:text-white hover:border-va-black", ((voice as any).allow_free_trial === false || masterControlState.journey === 'telephony') && !onSelect && "opacity-0 pointer-events-none")}>
                {isSelected ? <Check size={14} strokeWidth={3} className="md:w-4.5 md:h-4.5 animate-in zoom-in duration-300" /> : <div className="flex flex-col items-center leading-none gap-0.5 md:gap-1"><VoiceglotText translationKey={onSelect ? "common.choose_voice" : "common.add_to_casting"} defaultText={onSelect ? "Kies stem" : "Proefopname +"} />{!onSelect && <span className="text-[7px] md:text-[8px] font-black tracking-[0.2em] opacity-50"><VoiceglotText translationKey="common.free" defaultText="GRATIS" /></span>}</div>}
              </ButtonInstrument>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
