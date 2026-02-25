"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, AlertCircle, CheckCircle2, Play, Pause, Music, Tag, Briefcase, Globe, Clock, Camera, Tv, Radio, Mic, Mic2, Info as InfoIcon, ChevronDown, Sparkles, Zap, Award, Coffee, Settings, Video, Star, Calendar, Upload, Home, Image as ImageIcon } from 'lucide-react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import Image from 'next/image';
import { Actor, Demo } from '@/types';
import { cn } from '@/lib/utils';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { PhotoUploader } from './PhotoUploader';
import { calculateDeliveryDate } from '@/lib/utils/delivery-logic';
import { formatDistanceToNow, isAfter, isBefore, startOfDay, format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ActorEditModalProps {
  actor: Actor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onUpdate?: (updatedActor: any) => void;
}

export const ActorEditModal: React.FC<ActorEditModalProps> = ({ 
  actor, 
  isOpen, 
  onClose,
  onSuccess,
  onUpdate
}) => {
  const { playClick } = useSonicDNA();
  const [taxonomies, setTaxonomies] = useState<{ tones: any[], languages: any[] }>({ tones: [], languages: [] });
  const [systemWorkingDays, setSystemWorkingDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [formData, setFormData] = useState({
    display_name: actor.display_name || '',
    tagline: actor.tagline || '',
    bio: actor.bio || '',
    tone_of_voice: actor.tone_of_voice || '',
    clients: actor.clients || '',
    voice_score: actor.voice_score || 10,
    status: actor.status || 'live',
    delivery_days_min: actor.delivery_days_min || 1,
    delivery_days_max: actor.delivery_days_max || 1,
    cutoff_time: actor.cutoff_time || '18:00',
    native_lang: actor.native_lang || '',
    native_lang_id: actor.native_lang_id || null,
    extra_langs: actor.extra_langs || '',
    extra_lang_ids: actor.extra_lang_ids || [],
    native_lang_label: actor.native_lang_label || '',
    dropbox_url: actor.dropbox_url || '',
    photo_id: actor.photo_id || null,
    demos: actor.demos || [],
    first_name: actor.first_name || '',
    last_name: actor.last_name || '',
    email: actor.email || (actor as any).user?.email || '',
    gender: actor.gender || 'male',
    experience_level: actor.experience_level || 'pro',
    holiday_from: actor.holiday_from || '',
    holiday_till: actor.holiday_till || '',
    price_online: actor.price_online || '',
    price_live_regie: actor.price_live_regie || '',
    rates: actor.rates || { GLOBAL: {} },
    delivery_config: actor.delivery_config || { type: '24h', cutoff: '18:00', weekly_on: ['mon', 'tue', 'wed', 'thu', 'fri'] },
    studio_specs: actor.studio_specs || { microphone: '', preamp: '', interface: '', booth: '' },
    connectivity: actor.connectivity || { source_connect: false, zoom: false, cleanfeed: false, session_link: false },
    portfolio_photos: actor.portfolio_photos || [],
    actor_videos: actor.actor_videos || [],
    reviews: actor.reviews || [],
    portfolio_tier: actor.portfolio_tier || 'none',
    pending_bio: actor.pending_bio || null,
    pending_tagline: actor.pending_tagline || null
  });

  //  CHRIS-PROTOCOL: If native_lang is a label (like "Vlaams"), try to find the code in taxonomies
  useEffect(() => {
    if (taxonomies.languages.length > 0 && formData.native_lang) {
      // 1. Check if it's already a valid code (contains a dash like 'nl-be' or is a known code)
      const isKnownCode = taxonomies.languages.some(l => l.code === formData.native_lang);
      
      if (!isKnownCode || !formData.native_lang.includes('-')) {
        const found = taxonomies.languages.find(l => 
          l.label.toLowerCase() === formData.native_lang.toLowerCase() || 
          l.code === formData.native_lang
        );
        if (found && found.code !== formData.native_lang) {
          console.log(` CHRIS-PROTOCOL: Resolving native_lang "${formData.native_lang}" to code "${found.code}"`);
          setFormData(prev => ({ 
            ...prev, 
            native_lang: found.code,
            native_lang_label: found.label 
          }));
        }
      }
    }
  }, [taxonomies.languages, formData.native_lang]);

  //  CHRIS-PROTOCOL: Resolve extra_langs labels to codes
  useEffect(() => {
    if (taxonomies.languages.length > 0 && formData.extra_langs) {
      const currentLangs = formData.extra_langs.split(',').map(l => l.trim()).filter(Boolean);
      let hasChanges = false;
      const newLangs = currentLangs.map(lang => {
        const found = taxonomies.languages.find(l => 
          l.label.toLowerCase() === lang.toLowerCase() || 
          l.code === lang
        );
        if (found && found.code !== lang) {
          hasChanges = true;
          return found.code;
        }
        return lang;
      });

      if (hasChanges) {
        console.log(` CHRIS-PROTOCOL: Resolving extra_langs to codes:`, newLangs);
        setFormData(prev => ({ ...prev, extra_langs: newLangs.join(', ') }));
      }
    }
  }, [taxonomies.languages, formData.extra_langs]);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingDemo, setIsUploadingDemo] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'availability' | 'rates' | 'portfolio' | 'demos' | 'reviews'>('info');
  const [selectedMarket, setSelectedMarket] = useState<string>('GLOBAL');
  const [simulatorScenario, setSimulatorScenario] = useState<'1ch' | '2ch' | '3ch'>('1ch');
  const [simulatorSpots, setSimulatorSpots] = useState<Record<string, number>>({});
  const [simulatorYears, setSimulatorYears] = useState<Record<string, number>>({});
  const [simulatorMedia, setSimulatorMedia] = useState<string[]>(['tv']);
  const [simulatorRegion, setSimulatorRegion] = useState<Record<string, string>>({ tv: 'national', radio: 'national' });

  //  CHRIS-PROTOCOL: Profile Strength Logic (2026)
  const profileStrength = useMemo(() => {
    let score = 0;
    if (formData.bio?.length > 100) score += 20;
    if (formData.tagline) score += 10;
    if (formData.tone_of_voice) score += 10;
    if (formData.clients) score += 10;
    const type = formData.delivery_config?.type;
    if (type === '24h' || type === 'sameday' || type === 'direct') score += 30;
    if (formData.delivery_config?.weekly_on?.length >= 5) score += 20;
    return Math.min(100, score);
  }, [formData]);

  const absenceStatus = useMemo(() => {
    if (!formData.holiday_from || !formData.holiday_till) return null;
    
    try {
      const from = startOfDay(parseISO(formData.holiday_from));
      const till = startOfDay(parseISO(formData.holiday_till));
      const now = startOfDay(new Date());
      
      if (isAfter(from, till)) return { text: "Einddatum moet na begindatum liggen.", type: 'error' };
      
      if (isAfter(from, now)) {
        const distance = formatDistanceToNow(from, { locale: nl, addSuffix: true });
        return { 
          text: `Afwezig vanaf ${distance.replace('over ', '')}`, 
          type: 'future' 
        };
      }
      
      if (!isAfter(now, till)) {
        const distance = formatDistanceToNow(till, { locale: nl, addSuffix: true });
        return { 
          text: `Nu afwezig tot ${distance.replace('over ', '')}`, 
          type: 'present' 
        };
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }, [formData.holiday_from, formData.holiday_till]);

  const updateRate = (market: string, field: string, value: string) => {
    const updatedRates = { ...(formData.rates || {}) };
    if (!updatedRates[market]) updatedRates[market] = {};
    
    const numValue = value === '' ? undefined : parseFloat(value);
    if (numValue === undefined || isNaN(numValue)) {
      delete updatedRates[market][field];
      if (Object.keys(updatedRates[market]).length === 0 && market !== 'GLOBAL') {
        delete updatedRates[market];
      }
    } else {
      updatedRates[market][field] = numValue;
    }
    
    setFormData({ ...formData, rates: updatedRates });
    playClick('light');
  };

  const addMarket = (marketCode: string) => {
    const updatedRates = { ...(formData.rates || {}) };
    if (!updatedRates[marketCode]) {
      updatedRates[marketCode] = {};
      setFormData({
        ...formData,
        rates: updatedRates
      });
      setSelectedMarket(marketCode);
      playClick('success');
    }
  };

  const removeMarket = (marketCode: string) => {
    if (marketCode === 'GLOBAL') return;
    const updatedRates = { ...(formData.rates || {}) };
    delete updatedRates[marketCode];
    setFormData({ ...formData, rates: updatedRates });
    if (selectedMarket === marketCode) setSelectedMarket('GLOBAL');
    playClick('light');
  };

  // CHRIS-PROTOCOL: Earnings Intelligence (2026)
  // De platformfee bedraagt 25% op de verkoopwaarde.
  // Inkoop (Stem) = 75% van de verkoopwaarde.
  const EARNINGS_FACTOR = 0.75;
  
  const calculateEarnings = (verkoopPrice: string | number) => {
    const price = typeof verkoopPrice === 'string' ? parseFloat(verkoopPrice) : verkoopPrice;
    if (isNaN(price) || price === 0) return 0;
    return Math.floor(price * EARNINGS_FACTOR);
  };

  const [showLiveRegie, setShowLiveRegie] = useState(!!(actor as any).price_live_regie || !!(actor as any).price_live_regie);

  const RateIntelligence = ({ value, label, isPlaceholder = false }: { value: string | number, label: string, isPlaceholder?: boolean }) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (!numValue || isNaN(numValue)) {
      return (
        <div className="mt-2 px-1 animate-in fade-in duration-300">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-500/60 bg-amber-500/5 py-1 px-2 rounded-md border border-amber-500/10">
            <AlertCircle size={10} strokeWidth={3} />
            Niet boekbaar
          </div>
        </div>
      );
    }
    
    return (
      <div className={cn(
        "mt-2 flex items-center justify-between px-3 py-1.5 bg-va-black/[0.03] rounded-lg border border-black/5",
        isPlaceholder && "opacity-50"
      )}>
        <span className="text-[9px] font-black text-va-black/20 uppercase tracking-widest">Totaal Klant:</span>
        <span className="text-[12px] font-black text-va-black/60">€ {numValue}</span>
      </div>
    );
  };

  const RateSelector = ({ 
    id, 
    value, 
    onChange, 
    isAllIn = false, 
    placeholder = '0' 
  }: { 
    id: string, 
    value: string | number, 
    onChange: (val: string) => void,
    isAllIn?: boolean,
    placeholder?: string
  }) => {
    const BSF = 199;
    const options = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 750, 1000];
    
    // Calculate the buyout part for the display
    const currentTotal = value ? parseFloat(value.toString()) : 0;
    const currentBuyout = isAllIn ? currentTotal : Math.max(0, currentTotal - BSF);

    return (
      <div className="relative group/input">
        <select 
          value={currentBuyout || ''}
          onChange={(e) => {
            const buyout = e.target.value;
            const finalVal = buyout ? (isAllIn ? buyout : (parseFloat(buyout) + BSF).toString()) : '';
            onChange(finalVal);
          }}
          className="w-full pl-4 pr-10 py-3 bg-va-off-white/50 rounded-xl border border-transparent focus:bg-white focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-black text-base appearance-none cursor-pointer"
        >
          <option value="">{placeholder === '-' ? 'Kies...' : `€ ${placeholder}`}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>€ {opt}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-va-black/20 group-hover/input:text-primary transition-colors">
          <ChevronDown size={16} />
        </div>
        {!isAllIn && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-2 bg-white text-[8px] font-black text-primary uppercase tracking-widest border border-primary/10 rounded-full shadow-sm">
            + {BSF} BSF
          </div>
        )}
      </div>
    );
  };

  const [playingDemoId, setPlayingDemoId] = useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  //  Load Taxonomies and System Config for better UI
  useEffect(() => {
    const loadData = async () => {
      try {
        const [taxRes, configRes] = await Promise.all([
          fetch('/api/taxonomies'),
          fetch('/api/admin/config')
        ]);

        if (taxRes.ok) {
          const data = await taxRes.json();
          setTaxonomies(data);
        }

        if (configRes.ok) {
          const data = await configRes.json();
          if (data.general_settings?.system_working_days) {
            setSystemWorkingDays(data.general_settings.system_working_days);
          }
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    };
    if (isOpen) loadData();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // CHRIS-PROTOCOL: Initialize rates with at least GLOBAL object
      // Bridge legacy fields into GLOBAL if they exist and GLOBAL is empty
      const initialRates = JSON.parse(JSON.stringify(actor.rates || (actor as any).rates || { GLOBAL: {} }));
      if (!initialRates.GLOBAL) initialRates.GLOBAL = {};

      // Legacy Bridge: if GLOBAL is empty, try to fill from legacy fields
      const legacyFields = {
        tv_national: (actor as any).price_tv_national || (actor as any).price_tv_national,
        tv_regional: (actor as any).price_tv_regional || (actor as any).price_tv_regional,
        tv_local: (actor as any).price_tv_local || (actor as any).price_tv_local,
        radio_national: (actor as any).price_radio_national || (actor as any).price_radio_national,
        radio_regional: (actor as any).price_radio_regional || (actor as any).price_radio_regional,
        radio_local: (actor as any).price_radio_local || (actor as any).price_radio_local,
        podcast: (actor as any).price_podcast || (actor as any).price_podcast,
        social_media: (actor as any).price_social_media || (actor as any).price_social_media,
        online: (actor as any).price_online || (actor as any).price_online
      };

      Object.entries(legacyFields).forEach(([key, val]) => {
        if (val && !initialRates.GLOBAL[key]) {
          initialRates.GLOBAL[key] = parseFloat(val.toString());
        }
      });

      // CHRIS-PROTOCOL: Intelligent Rate Bridge (2026)
      // If GLOBAL is still empty after legacy bridge, try to populate it from the actor's 
      // native country rates or the first country found in the rates object.
      if (Object.keys(initialRates.GLOBAL).length === 0) {
        const nativeLang = actor.native_lang || '';
        const nativeCountry = nativeLang.includes('-') ? nativeLang.split('-')[1].toUpperCase() : 'BE';
        
        // Find the best source for global rates
        const sourceMarket = initialRates[nativeCountry] && Object.keys(initialRates[nativeCountry]).length > 0
          ? nativeCountry 
          : Object.keys(initialRates).find(m => m !== 'GLOBAL' && Object.keys(initialRates[m]).length > 0);
        
        if (sourceMarket && initialRates[sourceMarket]) {
          console.log(` CHRIS-PROTOCOL: Auto-populating GLOBAL rates from ${sourceMarket} for ${actor.display_name}`);
          initialRates.GLOBAL = { ...initialRates[sourceMarket] };
        }
      }

      console.log('Final Initial Rates:', initialRates);

      setFormData({
        display_name: actor.display_name || '',
        tagline: actor.tagline || '',
        bio: actor.bio || '',
        tone_of_voice: actor.tone_of_voice || '',
        clients: actor.clients || '',
        voice_score: actor.voice_score || 10,
        menu_order: actor.menu_order || 0,
        status: actor.status || 'live',
        delivery_days: actor.delivery_days_max || 1,
        cutoff_time: actor.cutoff_time || '18:00',
        native_lang: actor.native_lang || '',
        extra_langs: actor.extra_langs || '',
        native_lang_label: actor.native_lang_label || (actor as any).native_lang_label || '',
        photo_url: actor.photo_url || '',
        demos: actor.demos || [],
        first_name: actor.first_name || actor.first_name || (actor as any).display_name || '',
        last_name: actor.last_name || actor.last_name || '',
        email: actor.email || (actor as any).user?.email || '',
        gender: actor.gender || 'male',
        experience_level: actor.experience_level || actor.experience_level || 'pro',
        holiday_from: (actor as any).holiday_from || (actor as any).holiday_from || '',
        holiday_till: (actor as any).holiday_till || (actor as any).holiday_till || '',
        price_live_regie: (actor as any).price_live_regie || (actor as any).price_live_regie || '',
        rates: initialRates,
        delivery_config: (actor as any).delivery_config || (actor as any).deliveryConfig || { type: '24h', cutoff: '18:00', weekly_on: ['mon', 'tue', 'wed', 'thu', 'fri'] },
        photo_id: (actor as any).photo_id || (actor as any).photo_id || null,
        price_online: (actor as any).price_online || (actor as any).price_online || '',
        actor_videos: (actor as any).actor_videos || (actor as any).actor_videos || [],
        pending_bio: (actor as any).pending_bio || (actor as any).pending_bio || null,
        pending_tagline: (actor as any).pending_tagline || (actor as any).pending_tagline || null
      });
      setMessage(null);
    }
  }, [isOpen, actor]);

  const handlePhotoUploadSuccess = async (newUrl: string, mediaId: number) => {
    setFormData(prev => ({ ...prev, photo_url: newUrl, photo_id: mediaId }));
    playClick('success');

    //  CHRIS-PROTOCOL: Immediate Profile Sync (2026)
    try {
      const payload = {
        photo_id: mediaId,
        photo_url: newUrl,
        // 🛡️ CHRIS-PROTOCOL: Explicitly include language IDs for relational update
        native_lang_id: formData.native_lang_id,
        extra_lang_ids: formData.extra_lang_ids
      };

      console.log(` ADMIN: Auto-saving profile with new photo...`, { actorId: actor.id, mediaId });

      const response = await fetch(`/api/admin/actors/${actor.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Voices-Version': '2.14.519'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to auto-save photo to profile');
      }
      
      const data = await response.json();
      
      // Update global UI
      window.dispatchEvent(new CustomEvent('voices:actor-updated', { 
        detail: { 
          actor: { 
            ...actor, 
            photo_url: newUrl,
            photo_id: mediaId 
          } 
        } 
      }));

      if (onUpdate && data.actor) {
        onUpdate(data.actor);
      }
      
      setMessage({ type: 'success', text: 'Foto geüpload en profiel direct bijgewerkt!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setMessage({ type: 'error', text: 'Foto geüpload, maar profiel kon niet automatisch worden bijgewerkt.' });
    }
  };

  const handleDemoUpload = async (e: React.ChangeEvent<HTMLInputElement>, demoIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const demoId = formData.demos[demoIdx].id;
    setIsUploadingDemo(demoId);
    playClick('pro');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/actors/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const newDemos = [...formData.demos];
      newDemos[demoIdx] = { ...newDemos[demoIdx], audio_url: data.url };
      setFormData({ ...formData, demos: newDemos });
      
      playClick('success');
    } catch (error) {
      console.error('Demo upload error:', error);
      setMessage({ type: 'error', text: 'Fout bij uploaden demo.' });
    } finally {
      setIsUploadingDemo(null);
    }
  };

  const toggleTone = (toneLabel: string) => {
    const currentTones = formData.tone_of_voice ? formData.tone_of_voice.split(',').map(tagItem => tagItem.trim()).filter(Boolean) : [];
    let newTones;
    if (currentTones.includes(toneLabel)) {
      newTones = currentTones.filter(tagItem => tagItem !== toneLabel);
    } else {
      newTones = [...currentTones, toneLabel];
    }
    setFormData({ ...formData, tone_of_voice: newTones.join(', ') });
    playClick('light');
  };

  const toggleExtraLang = (langCode: string) => {
    const currentLangs = formData.extra_langs ? formData.extra_langs.split(',').map(langItem => langItem.trim()).filter(Boolean) : [];
    let newLangs;
    if (currentLangs.includes(langCode)) {
      newLangs = currentLangs.filter(langItem => langItem !== langCode);
    } else {
      newLangs = [...currentLangs, langCode];
    }
    setFormData({ ...formData, extra_langs: newLangs.join(', ') });
    playClick('light');
  };

  const toggleDemoPlay = (demo: Demo) => {
    if (playingDemoId === demo.id) {
      audioRef.current?.pause();
      setPlayingDemoId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = demo.audio_url;
        audioRef.current.play();
        setPlayingDemoId(demo.id);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    //  CHRIS-PROTOCOL: 1 Truth Payload (v2.14.518)
    //  We only send IDs for assets. URL strings are legacy noise.
    const payload = {
      ...formData,
      photo_id: formData.photo_id,
      // Ensure price_live_regie is null if empty to avoid DB errors
      price_live_regie: formData.price_live_regie || null,
    };

    // 🧹 Remove legacy URL fields from payload to enforce 1 Truth
    delete (payload as any).photo_url;
    delete (payload as any).dropbox_url;
    delete (payload as any).dropboxUrl;

    console.log('🚀 [ActorEditModal] Forensic Save Trace:', {
      actorId: actor.id,
      formData: JSON.parse(JSON.stringify(formData)),
      payload: JSON.parse(JSON.stringify(payload))
    });

    try {
      const response = await fetch(`/api/admin/actors/${actor.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Voices-Version': '2.14.195'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update actor');

      const data = await response.json();
      setMessage({ type: 'success', text: 'Stem succesvol bijgewerkt!' });
      
      //  CHRIS-PROTOCOL: Global Sync (2026 Mandate)
      // We dispatch a global event so all UI components (VoiceCards, Grids) 
      // can update immediately without a page refresh.
      if (data.actor) {
        window.dispatchEvent(new CustomEvent('voices:actor-updated', { 
          detail: { actor: data.actor } 
        }));
      }
      
      //  CHRIS-PROTOCOL: Trigger immediate UI update without reload
      if (onUpdate && data.actor) {
        onUpdate(data.actor);
      }
      
      if (onSuccess) onSuccess();
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij opslaan. Probeer het opnieuw.' });
    } finally {
      setIsSaving(false);
    }
  };
  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10">
        {/* Backdrop */}
        <motion.div 
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-va-black/95 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          key="modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-[10001]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-black/5 flex flex-col gap-6 bg-va-off-white/50">
            <div className="flex justify-between items-center">
              <div>
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter">
                  Bewerk <span className="text-primary italic">{actor.display_name}</span>
                </HeadingInstrument>
                <div className="flex items-center gap-3 mt-1">
                  <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-widest">
                    Profielbeheer
                  </TextInstrument>
                  <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Profiel Score: {profileStrength}%</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm border border-black/5">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'info' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                  )}
                >
                  <VoiceglotText translationKey="admin.actor.tab.info" defaultText="Info" />
                </button>
                <button 
                  onClick={() => setActiveTab('availability')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'availability' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                  )}
                >
                  <VoiceglotText translationKey="admin.actor.tab.availability" defaultText="Beschikbaarheid" />
                </button>
                <button 
                  onClick={() => setActiveTab('rates')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'rates' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                  )}
                >
                  <VoiceglotText translationKey="admin.actor.tab.rates" defaultText="Tarieven" />
                </button>
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'portfolio' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                  )}
                >
                  <VoiceglotText translationKey="admin.actor.tab.portfolio" defaultText="Portfolio & Studio" />
                </button>
                <button 
                  onClick={() => setActiveTab('demos')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'demos' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                  )}
                >
                  <VoiceglotText translationKey="admin.actor.tab.demos" defaultText="Demos" />
                </button>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'reviews' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                  )}
                >
                  <VoiceglotText translationKey="admin.actor.tab.reviews" defaultText="Reviews" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl flex items-center gap-3",
                  message.type === 'success' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}
              >
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <TextInstrument className="text-sm font-medium">{message.text}</TextInstrument>
              </motion.div>
            )}

            {activeTab === 'info' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/*  PHOTO UPLOAD SECTION */}
                <div className="flex flex-col md:flex-row gap-8 items-start bg-va-off-white/30 p-6 rounded-[30px] border border-black/[0.02]">
                  <PhotoUploader 
                    currentPhotoUrl={formData.photo_url} 
                    onUploadSuccess={handlePhotoUploadSuccess}
                    actorName={formData.display_name}
                  />
                  <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Voornaam (Publiek)</label>
                    <input 
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value, display_name: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1 italic">Familienaam (Priv)</label>
                    <input 
                      type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                </div>

                {/*  PORTFOLIO TIER SELECTOR */}
                <div className="space-y-3 pt-4 border-t border-black/5">
                  <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <Award size={14} className="text-primary" />
                    Portfolio Abonnement (Tier)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'none', label: 'Geen', icon: X, color: 'text-va-black/20' },
                      { id: 'mic', label: 'The Mic', icon: Mic, color: 'text-blue-500' },
                      { id: 'studio', label: 'The Studio', icon: Home, color: 'text-primary' },
                      { id: 'agency', label: 'The Agency', icon: Briefcase, color: 'text-va-black' }
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, portfolio_tier: tier.id });
                          playClick('pro');
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center group",
                          formData.portfolio_tier === tier.id
                            ? "bg-white border-primary shadow-aura-sm ring-1 ring-primary/20"
                            : "bg-va-off-white/50 border-black/5 text-va-black/40 hover:border-black/10"
                        )}
                      >
                        <tier.icon size={18} className={cn(formData.portfolio_tier === tier.id ? tier.color : "text-va-black/20")} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", formData.portfolio_tier === tier.id ? "text-va-black" : "")}>{tier.label}</span>
                      </button>
                    ))}
                  </div>
                  <TextInstrument className="text-[10px] text-va-black/30 italic px-1">
                    De tier bepaalt welke details (achternaam, studio, contact) zichtbaar zijn op het portfolio.
                  </TextInstrument>
                </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1 italic">E-mail (Priv)</label>
                        <input 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Status</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light appearance-none"
                        >
                          <option value="live">Live</option>
                          <option value="unavailable">Afwezig (Verborgen)</option>
                          <option value="pending">Pending</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Geslacht</label>
                        <select 
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light appearance-none"
                        >
                          <option value="male">Mannelijk</option>
                          <option value="female">Vrouwelijk</option>
                          <option value="non-binary">Non-binair</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Ervaring</label>
                        <select 
                          value={formData.experience_level}
                          onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light appearance-none"
                        >
                          <option value="junior">Junior</option>
                          <option value="pro">Pro</option>
                          <option value="senior">Senior</option>
                          <option value="legend">Legend</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest">Tagline</label>
                        {formData.pending_tagline && (
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 flex items-center gap-1">
                            <Clock size={10} /> Pending Review
                          </span>
                        )}
                      </div>
                      <input 
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        className={cn(
                          "w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light",
                          formData.pending_tagline && "border-amber-500/20 bg-amber-500/[0.02]"
                        )}
                        placeholder="Korte krachtige omschrijving..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest">Bio</label>
                    {formData.pending_bio && (
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 flex items-center gap-1">
                        <Clock size={10} /> Pending Review
                      </span>
                    )}
                  </div>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className={cn(
                      "w-full px-6 py-4 bg-va-off-white rounded-[20px] border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light resize-none text-[15px]",
                      formData.pending_bio && "border-amber-500/20 bg-amber-500/[0.02]"
                    )}
                    placeholder="Uitgebreide biografie..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                      <Tag size={14} className="text-primary" />
                      Tone of Voice
                    </label>
                    
                    {/*  Smart Tone Chips */}
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[80px] p-4 bg-va-off-white/50 rounded-[20px] border border-black/[0.02]">
                      {taxonomies.tones.map((tone) => {
                        const isActive = formData.tone_of_voice.split(',').map(tag => tag.trim()).includes(tone.label);
                        return (
                          <button
                            key={tone.id}
                            type="button"
                            onClick={() => toggleTone(tone.label)}
                            className={cn(
                              "px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-500 border",
                              isActive 
                                ? "bg-primary text-white border-primary shadow-aura-sm scale-105" 
                                : "bg-white border-black/5 text-va-black/40 hover:border-black/10 hover:text-va-black"
                            )}
                          >
                            {tone.label}
                          </button>
                        );
                      })}
                    </div>

                    <input 
                      type="text"
                      value={formData.tone_of_voice}
                      onChange={(e) => setFormData({ ...formData, tone_of_voice: e.target.value })}
                      className="w-full px-6 py-4 bg-va-off-white rounded-[20px] border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[15px] placeholder:opacity-20"
                      placeholder="Warm, Zakelijk, Energiek..."
                    />
                  </div>
                </div>

                {/*  LANGUAGES SECTION */}
                <div className="space-y-3 pt-8 border-t border-black/5">
                  <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <Globe size={14} className="text-primary" />
                    Talen & Moedertaal
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-va-off-white/30 p-6 rounded-[30px] border border-black/[0.02]">
                    <div className="space-y-3">
                      <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest px-1">Moedertaal</span>
                      <select 
                        value={formData.native_lang_id || ''}
                        onChange={(e) => {
                          const id = parseInt(e.target.value);
                          const lang = taxonomies.languages.find(l => l.id === id);
                          setFormData({ 
                            ...formData, 
                            native_lang_id: id,
                            native_lang: lang?.code || '',
                            native_lang_label: lang?.label || ''
                          });
                        }}
                        className="w-full px-6 py-4 bg-white rounded-[20px] border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[15px] appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="">Kies taal...</option>
                        {taxonomies.languages.map(lang => (
                          <option key={lang.id} value={lang.id}>{lang.label} ({lang.code})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest px-1">Extra Talen</span>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-white rounded-[20px] border border-black/5 custom-scrollbar shadow-inner">
                        {taxonomies.languages.map((lang) => {
                          const isActive = (formData.extra_lang_ids || []).includes(lang.id);
                          const isNative = formData.native_lang_id === lang.id;
                          if (isNative) return null;

                          return (
                            <button
                              key={lang.id}
                              type="button"
                              onClick={() => {
                                const current = formData.extra_lang_ids || [];
                                const next = current.includes(lang.id)
                                  ? current.filter(id => id !== lang.id)
                                  : [...current, lang.id];
                                
                                const nextCodes = taxonomies.languages
                                  .filter(l => next.includes(l.id))
                                  .map(l => l.code);

                                setFormData({ 
                                  ...formData, 
                                  extra_lang_ids: next,
                                  extra_langs: nextCodes.join(', ')
                                });
                              }}
                              className={cn(
                                "px-4 py-2 rounded-full text-[11px] font-medium transition-all duration-300 border",
                                isActive 
                                  ? "bg-va-black text-white border-va-black shadow-aura-sm scale-105" 
                                  : "bg-va-off-white border-black/5 text-va-black/40 hover:border-black/10"
                              )}
                            >
                              {lang.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-8 border-t border-black/5">
                  <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <Briefcase size={14} className="text-primary" />
                    Klanten
                  </label>
                  
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[45px] p-4 bg-va-off-white/50 rounded-[20px] border border-black/[0.02]">
                    {formData.clients.split(',').map(client => client.trim()).filter(Boolean).map((client, i) => (
                      <span key={i} className="px-4 py-2 bg-white rounded-full text-[12px] font-medium text-va-black/60 border border-black/5 shadow-sm animate-in fade-in zoom-in duration-300">
                        {client}
                      </span>
                    ))}
                  </div>

                  <input 
                    type="text"
                    value={formData.clients}
                    onChange={(e) => setFormData({ ...formData, clients: e.target.value })}
                    className="w-full px-6 py-4 bg-va-off-white rounded-[20px] border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[15px] placeholder:opacity-20"
                    placeholder="BMW, Coca-Cola, Nike..."
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'availability' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/*  LIVE PREVIEW (CUSTOMER VIEW) */}
                <div className="bg-va-black p-6 rounded-[30px] shadow-aura-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                        <Tv size={24} className="text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <HeadingInstrument level={4} className="text-lg font-bold text-white tracking-tight">
                          Live Preview
                        </HeadingInstrument>
                        <p className="text-[11px] text-white/40 uppercase font-black tracking-widest">
                          Wat de klant nu ziet
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 flex flex-col items-end">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Clock size={10} /> Levering
                      </span>
                      <span className="text-2xl font-light text-primary tracking-tighter">
                        {(() => {
                          const preview = calculateDeliveryDate({
                            ...actor,
                            ...formData, // Gebruik actuele formData voor live preview
                            delivery_config: formData.delivery_config
                          }, new Date(), systemWorkingDays);
                          const todayStr = new Date().toLocaleDateString('nl-BE');
                          return preview.formattedShort === todayStr ? "VANDAAG" : preview.formattedShort;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/*  SMART PRESETS */}
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    Snel-instellingen (Aanbevolen)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { 
                        id: 'sameday', 
                        label: 'Same-Day Hero', 
                        icon: Award, 
                        desc: 'Ma-Vr, voor 12:00 besteld',
                        config: { type: 'sameday', cutoff: '12:00', weekly_on: ['mon', 'tue', 'wed', 'thu', 'fri'], avg_turnaround_hours: 4 }
                      },
                      { 
                        id: 'fulltime', 
                        label: 'Fulltime Pro', 
                        icon: Zap, 
                        desc: 'Ma-Vr, 24u levering',
                        config: { type: '24h', cutoff: '18:00', weekly_on: ['mon', 'tue', 'wed', 'thu', 'fri'], avg_turnaround_hours: undefined }
                      },
                      { 
                        id: 'weekend', 
                        label: 'Altijd Aan', 
                        icon: Coffee, 
                        desc: 'Ook op zaterdag opnames',
                        config: { type: '24h', cutoff: '18:00', weekly_on: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], avg_turnaround_hours: undefined }
                      }
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, delivery_config: preset.config as any });
                          playClick('pro');
                        }}
                        className="flex flex-col items-start p-4 bg-white border border-black/5 rounded-2xl hover:border-primary/30 hover:shadow-aura-sm transition-all text-left group"
                      >
                        <div className="w-8 h-8 bg-va-off-white rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                          <preset.icon size={16} className="text-va-black/40 group-hover:text-primary" />
                        </div>
                        <span className="text-[13px] font-bold text-va-black mb-1">{preset.label}</span>
                        <span className="text-[11px] text-va-black/40 leading-tight">{preset.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-black/5">
                  <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <Settings size={14} className="text-primary" />
                    Handmatige Aanpassingen
                  </label>
                  
                  <div className="grid grid-cols-1 gap-6 p-6 bg-va-off-white/50 rounded-[30px] border border-black/[0.02]">
                    {/* Delivery Type */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest">Hoe snel kan je de audio aanleveren?</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">Tip: 24u converteert het best</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'sameday', label: 'Same-Day (4u)', icon: Zap },
                            { id: '24h', label: 'Binnen 24u', icon: Clock },
                            { id: '48h', label: 'Binnen 48u', icon: Clock },
                            { id: '72u', label: 'Binnen 72u', icon: Clock }
                          ].map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                const newConfig = { ...formData.delivery_config, type: type.id as any };
                                // Als men kiest voor Same-Day, zetten we de cutoff vast op 12:00
                                if (type.id === 'sameday') {
                                  newConfig.cutoff = '12:00';
                                  newConfig.avg_turnaround_hours = 4;
                                } else {
                                  // Reset turnaround voor andere types indien nodig
                                  newConfig.avg_turnaround_hours = undefined;
                                }
                                setFormData({ 
                                  ...formData, 
                                  delivery_config: newConfig 
                                });
                                playClick('light');
                              }}
                            className={cn(
                              "px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-2",
                              formData.delivery_config.type === type.id
                                ? "bg-primary text-white border-primary shadow-aura-sm"
                                : "bg-white border-black/5 text-va-black/40 hover:border-black/10"
                            )}
                          >
                            <type.icon size={12} />
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cutoff & Turnaround */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1 px-1">
                          <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest">Dagelijkse Deadline (Cutoff)</span>
                          <span className="text-[11px] text-va-black/20 italic leading-tight">
                            {formData.delivery_config.type === 'sameday' 
                              ? "Voor Same-Day staat de deadline vast op 12:00." 
                              : "Tot hoe laat sta je in de studio?"}
                          </span>
                        </div>
                        <input 
                          type="time"
                          disabled={formData.delivery_config.type === 'sameday'}
                          value={formData.delivery_config.cutoff || '18:00'}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            delivery_config: { ...formData.delivery_config, cutoff: e.target.value } 
                          })}
                          className={cn(
                            "w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[14px]",
                            formData.delivery_config.type === 'sameday' && "opacity-50 cursor-not-allowed bg-va-off-white"
                          )}
                        />
                      </div>
                      {formData.delivery_config.type === 'sameday' && (
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1 px-1">
                            <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest">Turnaround (uren)</span>
                            <span className="text-[11px] text-va-black/20 italic leading-tight">Gemiddelde tijd tot levering.</span>
                          </div>
                          <input 
                            type="number"
                            readOnly
                            value={4}
                            className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 outline-none font-light text-[14px] opacity-50"
                          />
                        </div>
                      )}
                    </div>

                    {/* Weekly Schedule */}
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1 px-1">
                        <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest">Opnamedagen (Wekelijks)</span>
                        <span className="text-[11px] text-va-black/20 italic leading-tight">Op welke dagen neem je op? (Klant ziet automatisch de juiste datum)</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[
                          { id: 'mon', label: 'Ma' },
                          { id: 'tue', label: 'Di' },
                          { id: 'wed', label: 'Wo' },
                          { id: 'thu', label: 'Do' },
                          { id: 'fri', label: 'Vr' },
                          { id: 'sat', label: 'Za' },
                          { id: 'sun', label: 'Zo' }
                        ].map((day) => {
                          const isActive = formData.delivery_config.weekly_on?.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => {
                                const current = formData.delivery_config.weekly_on || [];
                                const next = isActive 
                                  ? current.filter(d => d !== day.id)
                                  : [...current, day.id];
                                setFormData({ 
                                  ...formData, 
                                  delivery_config: { ...formData.delivery_config, weekly_on: next } 
                                });
                                playClick('light');
                              }}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-[10px] font-black transition-all border",
                                isActive
                                  ? "bg-va-black text-white border-va-black shadow-sm"
                                  : "bg-white border-black/5 text-va-black/20 hover:border-black/10"
                              )}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-8 border-t border-black/5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      Vakanties & Afwezigheid
                    </label>
                    {absenceStatus && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border",
                          absenceStatus.type === 'error' ? "bg-red-50 text-red-500 border-red-100" :
                          absenceStatus.type === 'present' ? "bg-amber-500 text-white border-amber-600" :
                          "bg-primary/10 text-primary border-primary/20"
                        )}
                      >
                        {absenceStatus.type === 'present' ? <Zap size={10} className="animate-pulse" /> : <Calendar size={10} />}
                        {absenceStatus.text}
                      </motion.div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-va-off-white/30 p-6 rounded-[30px] border border-black/[0.02]">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Vakantie Van</label>
                      <input 
                        type="date"
                        value={formData.holiday_from ? formData.holiday_from.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, holiday_from: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Vakantie Tot</label>
                      <input 
                        type="date"
                        value={formData.holiday_till ? formData.holiday_till.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, holiday_till: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'rates' && (() => {
              const BSF = 199;
              return (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/*  CHRIS-PROTOCOL: The "One Truth" Banner (2026) */}
                <div className="space-y-6">
                  <div className="bg-va-black p-6 rounded-[24px] shadow-aura-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/20 transition-all duration-1000" />
                    <div className="relative z-10 flex items-start gap-5">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                        <Sparkles size={24} className="text-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <HeadingInstrument level={4} className="text-lg font-bold text-white tracking-tight">
                          Belangrijk over jouw tarieven
                        </HeadingInstrument>
                        <p className="text-[13px] text-white/60 leading-relaxed max-w-md">
                          Voor 
                          <span className="group/tip relative inline-block mx-1">
                            <span className="text-white font-bold cursor-help">Telefonie (€89)</span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white text-va-black text-[11px] rounded-xl shadow-2xl opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-50 border border-black/5 font-medium leading-tight">
                              Wachtmuziek, IVR-menu&apos;s en voicemailberichten.
                            </span>
                          </span>
                          en 
                          <span className="group/tip relative inline-block mx-1">
                            <span className="text-white font-bold cursor-help">Corporate Video (€249)</span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white text-va-black text-[11px] rounded-xl shadow-2xl opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-50 border border-black/5 font-medium leading-tight">
                              Bedrijfsvideo&apos;s, e-learnings en interne presentaties (niet-betaalde media).
                            </span>
                          </span>
                          hanteren we vaste tarieven. 
                          Voor 
                          <span className="group/tip relative inline-block mx-1">
                            <span className="text-white font-bold cursor-help">Paid Media</span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white text-va-black text-[11px] rounded-xl shadow-2xl opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-50 border border-black/5 font-medium leading-tight">
                              TV, Radio, Online Ads en Social Media campagnes (betaalde media).
                            </span>
                          </span>
                          voer je hieronder de gewenste extra buyout in. 
                          Voices hanteert een vaste platformfee van 
                          <span className="group/tip relative inline-block mx-1">
                            <span className="text-primary font-black cursor-help">25%</span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white text-va-black text-[11px] rounded-xl shadow-2xl opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-50 border border-black/5 font-medium leading-tight">
                              Inclusief marketing, hosting en administratie.
                            </span>
                          </span>
                          op het totaalbedrag.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-va-black/5 rounded-2xl border border-va-black/5">
                    <div className="w-8 h-8 rounded-full bg-va-black/10 flex items-center justify-center shrink-0">
                      <Sparkles size={16} className="text-primary" />
                    </div>
                    <div className="space-y-1">
                      <TextInstrument className="text-[13px] font-bold text-va-black/80">Eenvoudige Prijsopbouw</TextInstrument>
                      <TextInstrument className="text-[12px] text-va-black/40 leading-relaxed">
                        Voices hanteert een transparante prijs per spot. Elke extra spot of kanaal wordt eenvoudig opgeteld, zodat je precies weet waar je aan toe bent.
                      </TextInstrument>
                    </div>
                  </div>
                </div>

                {/* Market Selector */}
                <div className="space-y-6 pt-8 border-t border-black/5">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                      <HeadingInstrument level={4} className="text-2xl font-light tracking-tighter flex items-center gap-3">
                        Media Tarieven
                      </HeadingInstrument>
                      <TextInstrument className="text-[13px] text-va-black/40 font-medium leading-relaxed max-w-md">
                        Hanteer je voor specifieke landen andere tarieven? Voeg dan een land toe. 
                        De <span className="text-va-black/60 font-bold">BSF ligt vast op €199</span>. Voor grote campagnes vul je de extra buyout in (1 jaar), voor kleine campagnes de all-in prijs.
                      </TextInstrument>
                    </div>
                    
                    <div className="flex items-center gap-2 p-1 bg-va-off-white rounded-2xl border border-black/5">
                      <button
                        onClick={() => setSelectedMarket('GLOBAL')}
                        className={cn(
                          "px-5 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shrink-0",
                          selectedMarket === 'GLOBAL' 
                            ? "bg-va-black text-white shadow-aura-sm" 
                            : "text-va-black/40 hover:text-va-black"
                        )}
                      >
                        <Globe size={14} /> Standaard
                      </button>
                      
                      {Object.keys(formData.rates || {}).filter(m => m !== 'GLOBAL').map(market => (
                        <div key={market} className="relative group/market shrink-0">
                          <button
                            onClick={() => setSelectedMarket(market)}
                            className={cn(
                              "px-5 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2",
                              selectedMarket === market 
                                ? "bg-primary text-white shadow-aura-sm" 
                                : "text-va-black/40 hover:text-va-black"
                            )}
                          >
                            {market}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMarket(market);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-va-black text-white rounded-full flex items-center justify-center opacity-0 group-hover/market:opacity-100 transition-opacity shadow-sm z-10"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      
                      <div className="relative">
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              addMarket(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="pl-4 pr-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-transparent text-primary outline-none cursor-pointer hover:bg-primary/5 transition-all shrink-0 appearance-none border-none"
                        >
                          <option value="">+ Land</option>
                          <option value="BE">BE</option>
                          <option value="NL">NL</option>
                          <option value="FR">FR</option>
                          <option value="DE">DE</option>
                          <option value="UK">UK</option>
                          <option value="US">US</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] border border-black/5 shadow-aura-lg overflow-hidden">
                    <div className="p-8 space-y-12">
                      {/* Grote Campagnes Section */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-black/5 pb-2">
                          <HeadingInstrument level={5} className="text-[11px] font-black tracking-widest text-va-black/30 uppercase flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" />
                            Grote Campagnes (BSF + Buyout)
                          </HeadingInstrument>
                          <span className="text-[10px] text-va-black/20 italic">Landelijk (incl. 1 jaar buyout)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { id: 'tv_national', label: 'TV Nationaal', icon: Tv },
                            { id: 'radio_national', label: 'Radio Nationaal', icon: Radio },
                            { id: 'online', label: 'Online Commercial', icon: Globe }
                          ].map(field => {
                            const isAllIn = false;
                            const storedValue = formData.rates?.[selectedMarket]?.[field.id];
                            const displayValue = storedValue 
                              ? (isAllIn ? storedValue : Math.max(0, parseFloat(storedValue.toString()) - BSF)) 
                              : '';
                            
                            const globalValue = formData.rates?.GLOBAL?.[field.id];
                            const globalDisplay = globalValue 
                              ? (isAllIn ? globalValue : Math.max(0, parseFloat(globalValue.toString()) - BSF)) 
                              : '-';

                            const Icon = field.icon;

                            return (
                            <div key={field.id} className="space-y-2">
                              <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-1.5">
                                  <Icon size={12} className="text-va-black/20" />
                                  <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest">{field.label}</label>
                                </div>
                              </div>
                              <RateSelector 
                                id={field.id}
                                value={storedValue || ''}
                                onChange={(val) => updateRate(selectedMarket, field.id, val)}
                                isAllIn={isAllIn}
                                placeholder={globalDisplay.toString()}
                              />
                              <RateIntelligence 
                                value={storedValue || (selectedMarket !== 'GLOBAL' ? globalValue : '')} 
                                label={field.label} 
                                isPlaceholder={!storedValue && selectedMarket !== 'GLOBAL'}
                              />
                            </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Kleinere Campagnes Section */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-black/5 pb-2">
                          <HeadingInstrument level={5} className="text-[11px] font-black tracking-widest text-va-black/30 uppercase flex items-center gap-2">
                            <Briefcase size={14} />
                            Kleinere Campagnes (All-in)
                          </HeadingInstrument>
                          <span className="text-[10px] text-va-black/20 italic">Regionaal / Lokaal (opname inbegrepen)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                          {[
                            { id: 'tv_regional', label: 'TV Regionaal', icon: Tv },
                            { id: 'tv_local', label: 'TV Lokaal', icon: Tv },
                            { id: 'radio_regional', label: 'Radio Regionaal', icon: Radio },
                            { id: 'radio_local', label: 'Radio Lokaal', icon: Radio },
                            { id: 'podcast', label: 'Podcast Pre-roll', icon: Mic2 }
                          ].map(field => {
                            const isAllIn = true;
                            const storedValue = formData.rates?.[selectedMarket]?.[field.id];
                            const displayValue = storedValue 
                              ? (isAllIn ? storedValue : Math.max(0, parseFloat(storedValue.toString()) - BSF)) 
                              : '';
                            
                            const globalValue = formData.rates?.GLOBAL?.[field.id];
                            const globalDisplay = globalValue 
                              ? (isAllIn ? globalValue : Math.max(0, parseFloat(globalValue.toString()) - BSF)) 
                              : '-';

                            const Icon = field.icon;

                            return (
                            <div key={field.id} className="space-y-2">
                              <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-1.5">
                                  <Icon size={12} className="text-va-black/20" />
                                  <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest">{field.label}</label>
                                </div>
                                <span className="text-[9px] font-black text-primary/40 uppercase tracking-tighter bg-primary/5 px-1.5 py-0.5 rounded-md">All-in</span>
                              </div>
                              <RateSelector 
                                id={field.id}
                                value={storedValue || ''}
                                onChange={(val) => updateRate(selectedMarket, field.id, val)}
                                isAllIn={isAllIn}
                                placeholder={globalDisplay.toString()}
                              />
                              <RateIntelligence 
                                value={storedValue || (selectedMarket !== 'GLOBAL' ? globalValue : '')} 
                                label={field.label} 
                                isPlaceholder={!storedValue && selectedMarket !== 'GLOBAL'}
                              />
                            </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Extra Opties Section */}
                      <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between border-b border-black/5 pb-2">
                          <HeadingInstrument level={5} className="text-[11px] font-black tracking-widest text-va-black/30 uppercase flex items-center gap-2">
                            <Clock size={14} />
                            Extra Opties & Regie
                          </HeadingInstrument>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                          <div className={cn(
                            "flex items-center justify-between gap-8 p-6 rounded-[24px] border transition-all duration-500",
                            showLiveRegie 
                              ? "bg-primary/10 border-primary/20 shadow-sm" 
                              : "bg-va-off-white/30 border-black/[0.03] opacity-60"
                          )}>
                            <div className="flex items-start gap-6 flex-1">
                              <button 
                                type="button"
                                onClick={() => {
                                  const newState = !showLiveRegie;
                                  setShowLiveRegie(newState);
                                  if (!newState) {
                                    setFormData({ ...formData, price_live_regie: '' });
                                  }
                                  playClick('light');
                                }}
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all mt-1",
                                  showLiveRegie ? "bg-primary text-white scale-110" : "bg-white text-va-black/20"
                                )}
                              >
                                {showLiveRegie ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                              </button>
                              <div className="space-y-1.5 flex-1">
                                <TextInstrument className="text-[15px] font-bold text-va-black/80">Live Regie (1 uur via Zoom)</TextInstrument>
                                <TextInstrument className="text-[13px] text-va-black/40 leading-relaxed max-w-xl">
                                  Een live-sessie is standaard inbegrepen in de BSF. Vink dit enkel aan als je hier expliciet een extra vergoeding voor vraagt.
                                </TextInstrument>
                              </div>
                            </div>
                            
                            {showLiveRegie && (
                              <div className="relative group/input w-32 animate-in fade-in zoom-in duration-300">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20 font-bold text-[13px]">€</span>
                                <select 
                                  value={formData.price_live_regie || ''}
                                  onChange={(e) => setFormData({ ...formData, price_live_regie: e.target.value })}
                                  className="w-full pl-8 pr-10 py-4 bg-white rounded-2xl border border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-black text-lg shadow-inner appearance-none cursor-pointer"
                                >
                                  <option value="">0</option>
                                  {[50, 75, 99, 125, 150, 200, 250].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-va-black/20 group-hover/input:text-primary transition-colors">
                                  <ChevronDown size={16} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Master Rates JSON (Hidden by default, available for power users) */}
                <div className="bg-va-off-white/30 p-8 rounded-[32px] border border-black/[0.02] space-y-6">
                  <button 
                    onClick={() => {
                      const el = document.getElementById('pricing-simulator');
                      if (el) el.classList.toggle('hidden');
                    }}
                    className="w-full flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-aura-sm group-hover:scale-110 transition-transform">
                        <Sparkles size={20} />
                      </div>
                      <div className="text-left">
                        <HeadingInstrument level={4} className="text-lg font-bold tracking-tight">Earnings Simulator</HeadingInstrument>
                        <TextInstrument className="text-[11px] text-va-black/40 italic">Zie wat je verdient bij meerdere spots of kanalen</TextInstrument>
                      </div>
                    </div>
                    <ChevronDown size={20} className="text-va-black/20 group-hover:text-primary transition-colors" />
                  </button>

                  <div id="pricing-simulator" className="hidden space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-8 rounded-[32px] border border-primary/10 shadow-aura-lg">
                      <div className="md:col-span-7 space-y-6">
                        <div className="space-y-4">
                          <label className="text-[11px] font-black text-va-black/40 uppercase tracking-[0.2em] px-1">Selecteer Media</label>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { id: 'online', label: 'Online & Socials', sub: 'YouTube, Meta, LinkedIn', icon: Globe },
                              { id: 'podcast', label: 'Podcast', sub: 'Pre-roll, Mid-roll', icon: Mic2 },
                              { id: 'radio', label: 'Radio', sub: 'Landelijke of regionale zenders', icon: Radio, hasRegions: true },
                              { id: 'tv', label: 'TV', sub: 'Landelijke of regionale zenders', icon: Tv, hasRegions: true }
                            ].map((m) => {
                              const isActive = simulatorMedia.includes(m.id);
                              return (
                                <div key={m.id} className="space-y-3">
                                  <button
                                    onClick={() => {
                                      if (isActive) {
                                        if (simulatorMedia.length > 1) setSimulatorMedia(simulatorMedia.filter(item => item !== m.id));
                                      } else {
                                        setSimulatorMedia([...simulatorMedia, m.id]);
                                      }
                                      playClick('light');
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500",
                                      isActive ? "border-primary bg-primary/[0.02] shadow-sm" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
                                    )}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-primary text-white" : "bg-white text-va-black/20 shadow-sm border border-black/5"
                                      )}>
                                        <m.icon size={20} />
                                      </div>
                                      <div className="text-left">
                                        <div className={cn("text-[14px] font-bold tracking-tight", isActive ? "text-va-black" : "text-va-black/40")}>{m.label}</div>
                                        <div className="text-[11px] text-va-black/20 font-medium">{m.sub}</div>
                                      </div>
                                    </div>
                                    <div className={cn(
                                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                      isActive ? "bg-primary border-primary text-white" : "border-black/10"
                                    )}>
                                      {isActive && <CheckCircle2 size={14} />}
                                    </div>
                                  </button>

                                  {isActive && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="px-4 pb-4 space-y-4 border-l-2 border-primary/10 ml-5"
                                    >
                                      {m.hasRegions && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-black text-va-black/30 uppercase tracking-widest">Uitzendgebied</span>
                                          <div className="flex items-center gap-3 bg-va-off-white p-1 rounded-lg border border-black/5">
                                            <button 
                                              onClick={() => {
                                                const current = simulatorRegion[m.id] || 'national';
                                                const regions = ['local', 'regional', 'national'];
                                                const currentIndex = regions.indexOf(current);
                                                const nextIndex = Math.max(0, currentIndex - 1);
                                                setSimulatorRegion(prev => ({ ...prev, [m.id]: regions[nextIndex] }));
                                                playClick('light');
                                              }}
                                              className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                            >-</button>
                                            <span className="text-[12px] font-black text-primary min-w-[65px] text-center uppercase tracking-tight">
                                              {(() => {
                                                const r = simulatorRegion[m.id] || 'national';
                                                if (r === 'national') return 'Nationaal';
                                                if (r === 'regional') return 'Regionaal';
                                                return 'Lokaal';
                                              })()}
                                            </span>
                                            <button 
                                              onClick={() => {
                                                const current = simulatorRegion[m.id] || 'national';
                                                const regions = ['local', 'regional', 'national'];
                                                const currentIndex = regions.indexOf(current);
                                                const nextIndex = Math.min(regions.length - 1, currentIndex + 1);
                                                setSimulatorRegion(prev => ({ ...prev, [m.id]: regions[nextIndex] }));
                                                playClick('light');
                                              }}
                                              className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                            >+</button>
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-va-black/30 uppercase tracking-widest">Aantal Spots</span>
                                        <div className="flex items-center gap-3 bg-va-off-white p-1 rounded-lg border border-black/5">
                                          <button 
                                            onClick={() => setSimulatorSpots(prev => ({ ...prev, [m.id]: Math.max(1, (prev[m.id] || 1) - 1) }))}
                                            className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                          >-</button>
                                          <span className="text-[12px] font-black text-primary min-w-[45px] text-center">{(simulatorSpots[m.id] || 1)} spot{(simulatorSpots[m.id] || 1) > 1 ? 's' : ''}</span>
                                          <button 
                                            onClick={() => setSimulatorSpots(prev => ({ ...prev, [m.id]: (prev[m.id] || 1) + 1 }))}
                                            className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                          >+</button>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-va-black/30 uppercase tracking-widest">{m.id === 'podcast' ? 'Licentie' : 'Looptijd'}</span>
                                        <div className="flex items-center gap-3 bg-va-off-white p-1 rounded-lg border border-black/5">
                                          <button 
                                            onClick={() => {
                                              const current = simulatorYears[m.id] || 1;
                                              let next = current;
                                              if (m.id === 'podcast') {
                                                next = current === 2 ? 1 : (current === 1 ? 0.25 : 0.25);
                                              } else {
                                                next = current === 2 ? 1 : (current === 1 ? 0.5 : 0.5);
                                              }
                                              setSimulatorYears(prev => ({ ...prev, [m.id]: next }));
                                            }}
                                            className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                          >-</button>
                                          <span className="text-[12px] font-black text-primary min-w-[45px] text-center">
                                            {m.id === 'podcast' && (simulatorYears[m.id] || 1) === 0.25 ? '3 mnd' : 
                                             (simulatorYears[m.id] || 1) === 0.5 ? '6 mnd' : 
                                             `${(simulatorYears[m.id] || 1)} jaar`}
                                          </span>
                                          <button 
                                            onClick={() => {
                                              const current = simulatorYears[m.id] || 1;
                                              let next = current;
                                              if (m.id === 'podcast') {
                                                next = current === 0.25 ? 1 : (current === 1 ? 2 : 2);
                                              } else {
                                                next = current === 0.5 ? 1 : (current === 1 ? 2 : 2);
                                              }
                                              setSimulatorYears(prev => ({ ...prev, [m.id]: next }));
                                            }}
                                            className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                          >+</button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-5">
                        <div className="sticky top-8 bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex flex-col justify-center text-center space-y-6">
                          <div className="space-y-2">
                            <TextInstrument className="text-[11px] font-black text-primary/60 uppercase tracking-[0.2em]">Jouw Geschatte Netto</TextInstrument>
                            <div className="text-6xl font-black text-primary tracking-tighter">
                                  € {(() => {
                                    const BSF = 199;
                                    
                                    let totalBuyout = 0;
                                    let hasNational = false;

                                    simulatorMedia.forEach(mId => {
                                      // Determine effective media ID for rate lookup
                                      let effectiveId = mId;
                                      if (mId === 'radio' || mId === 'tv') {
                                        const region = simulatorRegion[mId] || 'national';
                                        effectiveId = `${mId}_${region}`;
                                      }

                                      const isAllIn = effectiveId.includes('regional') || effectiveId.includes('local') || effectiveId === 'podcast';
                                      const rate = formData.rates?.[selectedMarket]?.[effectiveId] || formData.rates?.GLOBAL?.[effectiveId] || BSF;
                                      const spots = simulatorSpots[mId] || 1;
                                      const years = simulatorYears[mId] || 1;

                                      if (isAllIn) {
                                        totalBuyout += rate * spots;
                                      } else {
                                        hasNational = true;
                                        const baseBuyout = Math.max(50, rate - BSF);
                                        const yearMultiplier = mId === 'podcast' && years === 0.25 ? 0.7 : 
                                                              years === 0.5 ? 0.8 : 
                                                              (1 + (0.5 * (years - 1)));
                                        
                                        totalBuyout += (baseBuyout * spots * yearMultiplier);
                                      }
                                    });

                                      const finalBase = hasNational ? BSF : 0;
                                      const totalVerkoop = (finalBase + totalBuyout);
                                      return Math.floor(totalVerkoop * 0.75);
                                    })()}
                                  </div>
                                </div>
                                
                                <div className="pt-6 border-t border-primary/10 space-y-4">
                                  <div className="flex justify-between items-center text-[11px] font-bold text-va-black/40 uppercase tracking-widest">
                                    <span>Klant Totaal:</span>
                                    <span className="text-va-black/80 text-[14px]">
                                      € {(() => {
                                        const BSF = 199;
                                        let totalBuyout = 0;
                                        let hasNational = false;
        
                                        simulatorMedia.forEach(mId => {
                                          // Determine effective media ID for rate lookup
                                          let effectiveId = mId;
                                          if (mId === 'radio' || mId === 'tv') {
                                            const region = simulatorRegion[mId] || 'national';
                                            effectiveId = `${mId}_${region}`;
                                          }
    
                                          const isAllIn = effectiveId.includes('regional') || effectiveId.includes('local') || effectiveId === 'podcast';
                                          const rate = formData.rates?.[selectedMarket]?.[effectiveId] || formData.rates?.GLOBAL?.[effectiveId] || BSF;
                                          const spots = simulatorSpots[mId] || 1;
                                          const years = simulatorYears[mId] || 1;
    
                                          if (isAllIn) {
                                            totalBuyout += rate * spots;
                                          } else {
                                            hasNational = true;
                                            const baseBuyout = Math.max(50, rate - BSF);
                                            const yearMultiplier = mId === 'podcast' && years === 0.25 ? 0.7 : 
                                                                  years === 0.5 ? 0.8 : 
                                                                  (1 + (0.5 * (years - 1)));
                                            
                                            totalBuyout += (baseBuyout * spots * yearMultiplier);
                                          }
                                        });
    
                                          const finalBase = hasNational ? BSF : 0;
                                          const totalVerkoop = (finalBase + totalBuyout);
                                          return Math.floor(totalVerkoop);
                                        })()}
                                      </span>
                                    </div>
                                <div className="bg-white/50 p-3 rounded-xl border border-primary/5">
                                  <TextInstrument className="text-[10px] text-va-black/30 italic leading-relaxed">
                                    Transparante prijsopbouw per spot en kanaal.
                                  </TextInstrument>
                                </div>
                              </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                      <InfoIcon size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <TextInstrument className="text-[11px] text-amber-700 leading-relaxed">
                        **Let op:** Dit is een indicatieve berekening. De uiteindelijke inkomsten hangen af van de specifieke kanaal-combinaties en staffels die de klant kiest in de checkout.
                      </TextInstrument>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/5">
                    <button 
                      onClick={() => {
                        const el = document.getElementById('master-rates-json');
                        if (el) el.classList.toggle('hidden');
                      }}
                      className="text-[11px] font-black tracking-widest text-va-black/20 uppercase hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Globe size={14} />
                      Advanced: Master Rates JSON
                    </button>
                    <div id="master-rates-json" className="hidden mt-4 space-y-4">
                      <TextInstrument className="text-[12px] text-va-black/40 leading-relaxed italic px-1">
                        Dit veld bevat de complexe tarieven per land en mediatype. Bewerk met voorzichtigheid.
                      </TextInstrument>
                      <textarea 
                        value={JSON.stringify(formData.rates, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setFormData({ ...formData, rates: parsed });
                          } catch (err) {
                            // Allow typing invalid JSON temporarily
                          }
                        }}
                        rows={15}
                        className="w-full px-6 py-4 bg-va-black text-green-400 rounded-[20px] border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-[13px] resize-none shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })()}

            {activeTab === 'portfolio' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                {/*  STUDIO SPECS */}
                <div className="space-y-6">
                  <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <Mic2 size={14} className="text-primary" />
                    Studio Apparatuur
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-va-off-white/30 p-6 rounded-[30px] border border-black/[0.02]">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest px-1">
                        <VoiceglotText translationKey="admin.actor.studio.microphone" defaultText="Microfoon" />
                      </label>
                      <input 
                        type="text"
                        value={formData.studio_specs.microphone}
                        onChange={(e) => setFormData({ ...formData, studio_specs: { ...formData.studio_specs, microphone: e.target.value } })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[14px]"
                        placeholder="Bijv. Neumann TLM 103"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest px-1">
                        <VoiceglotText translationKey="admin.actor.studio.interface" defaultText="Interface" />
                      </label>
                      <input 
                        type="text"
                        value={formData.studio_specs.interface}
                        onChange={(e) => setFormData({ ...formData, studio_specs: { ...formData.studio_specs, interface: e.target.value } })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[14px]"
                        placeholder="Bijv. Universal Audio Apollo"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest px-1">
                        <VoiceglotText translationKey="admin.actor.studio.preamp" defaultText="Preamp" />
                      </label>
                      <input 
                        type="text"
                        value={formData.studio_specs.preamp}
                        onChange={(e) => setFormData({ ...formData, studio_specs: { ...formData.studio_specs, preamp: e.target.value } })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[14px]"
                        placeholder="Bijv. Neve 1073"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest px-1">
                        <VoiceglotText translationKey="admin.actor.studio.booth" defaultText="Booth / Akoestiek" />
                      </label>
                      <input 
                        type="text"
                        value={formData.studio_specs.booth}
                        onChange={(e) => setFormData({ ...formData, studio_specs: { ...formData.studio_specs, booth: e.target.value } })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[14px]"
                        placeholder="Bijv. Studiobricks / Custom"
                      />
                    </div>
                  </div>
                </div>

                {/*  CONNECTIVITY */}
                <div className="space-y-6 pt-4 border-t border-black/5">
                  <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <Globe size={14} className="text-primary" />
                    <VoiceglotText translationKey="admin.actor.connectivity.title" defaultText="Connectiviteit (Live Regie)" />
                  </label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'source_connect', label: 'SourceConnect', icon: Zap },
                      { id: 'zoom', label: 'Zoom / Teams', icon: Video },
                      { id: 'cleanfeed', label: 'Cleanfeed', icon: Radio },
                      { id: 'session_link', label: 'SessionLink', icon: Globe }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            connectivity: { 
                              ...formData.connectivity, 
                              [opt.id]: !formData.connectivity[opt.id] 
                            } 
                          });
                          playClick('light');
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center group",
                          formData.connectivity[opt.id]
                            ? "bg-va-black text-white border-va-black shadow-lg"
                            : "bg-white border-black/5 text-va-black/40 hover:border-black/10"
                        )}
                      >
                        <opt.icon size={18} strokeWidth={formData.connectivity[opt.id] ? 2.5 : 1.5} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/*  PORTFOLIO PHOTOS (GALLERY) */}
                <div className="space-y-6 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                      <ImageIcon size={14} className="text-primary" />
                      <VoiceglotText translationKey="admin.actor.photos.title" defaultText="Portfolio Foto's (Gallerij)" />
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.portfolio_photos.map((photo: any, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-black/5">
                        <Image src={photo.url} alt={`Portfolio ${idx}`} fill className="object-cover" />
                        <button 
                          onClick={() => {
                            const next = formData.portfolio_photos.filter((_, i) => i !== idx);
                            setFormData({ ...formData, portfolio_photos: next });
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-va-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <div className="aspect-square">
                      <PhotoUploader 
                        actorName={formData.display_name}
                        onUploadSuccess={(url, id) => {
                          setFormData({ 
                            ...formData, 
                            portfolio_photos: [...formData.portfolio_photos, { url, id }] 
                          });
                        }}
                        compact
                      />
                    </div>
                  </div>
                </div>

                {/*  PORTFOLIO VIDEOS CATEGORIZATION */}
                <div className="space-y-6 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                      <Tv size={14} className="text-primary" />
                      <VoiceglotText translationKey="admin.actor.videos.title" defaultText="Portfolio Video's" />
                    </label>
                  </div>

                  <div className="space-y-3">
                    {formData.actor_videos.map((video, idx) => (
                      <div key={idx} className="p-6 bg-va-off-white/50 rounded-[24px] border border-black/[0.02] space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-va-black text-white flex items-center justify-center shrink-0">
                            <Video size={16} />
                          </div>
                          <input 
                            type="text" 
                            value={video.name}
                            onChange={(e) => {
                              const newVideos = [...formData.actor_videos];
                              newVideos[idx] = { ...newVideos[idx], name: e.target.value };
                              setFormData({ ...formData, actor_videos: newVideos });
                            }}
                            className="flex-1 bg-transparent border-none p-0 text-[15px] font-bold text-va-black focus:ring-0"
                            placeholder="Naam van de video..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-va-black/20 uppercase tracking-widest px-1">
                              <VoiceglotText translationKey="admin.actor.videos.category" defaultText="Type / Categorie" />
                            </label>
                            <select 
                              value={(video as any).type || 'portfolio'}
                              onChange={(e) => {
                                const newVideos = [...formData.actor_videos];
                                newVideos[idx] = { ...newVideos[idx], type: e.target.value };
                                setFormData({ ...formData, actor_videos: newVideos });
                              }}
                              className="w-full px-4 py-2 bg-white rounded-xl border border-black/5 text-[12px] font-medium outline-none focus:ring-2 focus:ring-primary/10"
                            >
                              <option value="portfolio">Portfolio (Algemeen)</option>
                              <option value="host">Host / Presentator</option>
                              <option value="reporter">Reporter / On-the-road</option>
                              <option value="commercial">Commercial / TV</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-va-black/20 uppercase tracking-widest px-1">Video URL / ID</label>
                            <input 
                              type="text"
                              value={video.url}
                              onChange={(e) => {
                                const newVideos = [...formData.actor_videos];
                                newVideos[idx] = { ...newVideos[idx], url: e.target.value };
                                setFormData({ ...formData, actor_videos: newVideos });
                              }}
                              className="w-full px-4 py-2 bg-white rounded-xl border border-black/5 text-[12px] font-mono outline-none focus:ring-2 focus:ring-primary/10"
                              placeholder="YouTube URL of VideoAsk ID"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'demos' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/*  DEMOS SECTION (VOICES DNA) */}
                <div className="flex items-center justify-between mb-6">
                  <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <Music size={14} className="text-primary" />
                    Demo&apos;s & Audio
                  </label>
                  <div className="flex items-center gap-3">
                    <TextInstrument className="text-[11px] font-light text-va-black/30 italic">
                      {formData.demos.length} fragmenten
                    </TextInstrument>
                    <ButtonInstrument 
                      type="button"
                      onClick={() => {
                        const newId = Math.max(0, ...formData.demos.map(d => d.id)) + 1;
                        setFormData({
                          ...formData,
                          demos: [...formData.demos, { id: newId, title: 'Nieuwe Demo', audio_url: '', category: 'video' }]
                        });
                      }}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      + Toevoegen
                    </ButtonInstrument>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.demos.length > 0 ? (
                    formData.demos.map((demo, idx) => (
                      <div 
                        key={demo.id || idx} 
                        className="group flex items-center gap-4 p-4 bg-va-off-white/50 rounded-[20px] border border-black/[0.02] hover:bg-white hover:shadow-aura-sm transition-all duration-500"
                      >
                        <button 
                          type="button" 
                          onClick={() => toggleDemoPlay(demo)}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm",
                            playingDemoId === demo.id ? "bg-primary text-white scale-110" : "bg-white text-va-black/40 hover:text-primary"
                          )}
                        >
                          {playingDemoId === demo.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                        </button>
                        
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={demo.title}
                                onChange={(e) => {
                                  const newDemos = [...formData.demos];
                                  newDemos[idx] = { ...newDemos[idx], title: e.target.value };
                                  setFormData({ ...formData, demos: newDemos });
                                }}
                                className="flex-1 bg-transparent border-none p-0 text-[15px] font-light text-va-black focus:ring-0 truncate placeholder:opacity-20"
                                placeholder="Titel van de demo..."
                              />
                              {demo.status === 'pending' && (
                                <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded border border-amber-500/20">
                                  Pending
                                </span>
                              )}
                            </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.15em]">
                              {demo.category || 'Online'}
                            </span>
                            <input 
                              type="text"
                              value={demo.audio_url}
                              onChange={(e) => {
                                const newDemos = [...formData.demos];
                                newDemos[idx] = { ...newDemos[idx], audio_url: e.target.value };
                                setFormData({ ...formData, demos: newDemos });
                              }}
                              className="flex-1 bg-transparent border-none p-0 text-[10px] text-va-black/20 focus:ring-0 truncate font-mono"
                              placeholder="url/naar/audio.mp3"
                            />
                            
                            {/*  CHRIS-PROTOCOL: Quick Upload for Demos */}
                            <div className="flex items-center gap-2">
                              <input 
                                type="file"
                                id={`demo-upload-${idx}`}
                                accept="audio/*"
                                className="hidden"
                                onChange={(e) => handleDemoUpload(e, idx)}
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById(`demo-upload-${idx}`)?.click()}
                                disabled={isUploadingDemo === demo.id}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all flex items-center gap-1.5",
                                  isUploadingDemo === demo.id 
                                    ? "bg-primary/10 text-primary animate-pulse" 
                                    : "bg-va-black/5 text-va-black/20 hover:bg-primary/10 hover:text-primary"
                                )}
                                title="Upload audio bestand"
                              >
                                {isUploadingDemo === demo.id ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <Upload size={10} />
                                )}
                                <span className="text-[8px] font-black uppercase tracking-widest">Upload</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select 
                            value={demo.category}
                            onChange={(e) => {
                              const newCategory = e.target.value;
                              const newDemos = [...formData.demos];
                              let newTitle = newDemos[idx].title;

                              // 🛡️ CHRIS-PROTOCOL: Auto-naming for primary categories (v2.14.151)
                              if (newCategory === 'commercial') newTitle = 'Commercial';
                              if (newCategory === 'video' || newCategory === 'corporate') newTitle = 'Corporate';
                              if (newCategory === 'telephony') newTitle = 'Telefonie';

                              newDemos[idx] = { ...newDemos[idx], category: newCategory, title: newTitle };
                              setFormData({ ...formData, demos: newDemos });
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest bg-white border border-black/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                          >
                            <option value="commercial">Commercial</option>
                            <option value="video">Corporate</option>
                            <option value="telephony">Telefonie</option>
                            <option value="e-learning">E-learning</option>
                            <option value="meditatie">Meditatie</option>
                          </select>
                          
                          <button 
                            type="button"
                            onClick={() => {
                              const newDemos = formData.demos.filter((_, i) => i !== idx);
                              setFormData({ ...formData, demos: newDemos });
                            }}
                            className="p-2 text-va-black/10 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 border-2 border-dashed border-black/5 rounded-[30px] flex flex-col items-center justify-center text-center bg-va-off-white/20">
                      <Music size={40} className="text-va-black/5 mb-4" />
                      <TextInstrument className="text-[15px] text-va-black/30 font-light">
                        Geen demo&apos;s gekoppeld aan deze stem.
                      </TextInstrument>
                      <ButtonInstrument 
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            demos: [{ id: Date.now(), title: 'Eerste Demo', audio_url: '', category: 'video' }]
                          });
                        }}
                        className="mt-4 va-btn-pro py-2 px-6 text-[12px]"
                      >
                        Demo Toevoegen
                      </ButtonInstrument>
                    </div>
                  )}
                </div>

                {/*  VIDEOS SECTION (GOD MODE 2026) */}
                <div className="pt-8 border-t border-black/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                      <Tv size={14} className="text-primary" />
                      Video&apos;s & Showreels
                    </label>
                    <ButtonInstrument 
                      type="button"
                      onClick={() => {
                        const newId = Date.now();
                        setFormData({
                          ...formData,
                          actor_videos: [...formData.actor_videos, { id: newId, name: 'Nieuwe Video', url: '' }]
                        });
                      }}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      + Video Toevoegen
                    </ButtonInstrument>
                  </div>

                  <div className="space-y-3">
                    {formData.actor_videos.length > 0 ? (
                      formData.actor_videos.map((video, idx) => (
                        <div 
                          key={(video as any).id || idx} 
                          className="group flex items-center gap-4 p-4 bg-va-off-white/50 rounded-[20px] border border-black/[0.02] hover:bg-white hover:shadow-aura-sm transition-all duration-500"
                        >
                          <div className="w-12 h-12 rounded-full bg-va-black text-white flex items-center justify-center shrink-0">
                            <Video size={20} />
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={video.name}
                                onChange={(e) => {
                                  const newVideos = [...formData.actor_videos];
                                  newVideos[idx] = { ...newVideos[idx], name: e.target.value };
                                  setFormData({ ...formData, actor_videos: newVideos });
                                }}
                                className="flex-1 bg-transparent border-none p-0 text-[15px] font-light text-va-black focus:ring-0 truncate placeholder:opacity-20"
                                placeholder="Titel van de video (bijv. Unizo Reporter)..."
                              />
                              {video.status === 'pending' && (
                                <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded border border-amber-500/20">
                                  Pending
                                </span>
                              )}
                            </div>
                            <input 
                              type="text"
                              value={video.url}
                              onChange={(e) => {
                                const newVideos = [...formData.actor_videos];
                                newVideos[idx] = { ...newVideos[idx], url: e.target.value };
                                setFormData({ ...formData, actor_videos: newVideos });
                              }}
                              className="w-full bg-transparent border-none p-0 text-[10px] text-va-black/20 focus:ring-0 truncate font-mono"
                              placeholder="url/naar/video.mp4 of VideoAsk ID"
                            />
                          </div>

                          <button 
                            type="button"
                            onClick={() => {
                              const newVideos = formData.actor_videos.filter((_, i) => i !== idx);
                              setFormData({ ...formData, actor_videos: newVideos });
                            }}
                            className="p-2 text-va-black/10 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 border-2 border-dashed border-black/5 rounded-[30px] flex flex-col items-center justify-center text-center bg-va-off-white/10">
                        <TextInstrument className="text-[13px] text-va-black/30 font-light">
                          Geen video&apos;s gekoppeld.
                        </TextInstrument>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <Star size={14} className="text-primary" />
                    Reviews & Testimonials
                  </label>
                  <ButtonInstrument 
                    type="button"
                    onClick={() => {
                      const newReview = { 
                        id: Date.now(), 
                        author_name: '', 
                        text_nl: '', 
                        rating: 5, 
                        provider: 'manual',
                        created_at: new Date().toISOString()
                      };
                      setFormData({
                        ...formData,
                        reviews: [newReview, ...formData.reviews]
                      });
                    }}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                  >
                    + Review Toevoegen
                  </ButtonInstrument>
                </div>

                <div className="space-y-4">
                  {formData.reviews.length > 0 ? (
                    formData.reviews.map((review: any, idx: number) => (
                      <div 
                        key={review.id || idx} 
                        className="p-6 bg-va-off-white/50 rounded-[24px] border border-black/[0.02] space-y-4 group relative"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => {
                                  const newReviews = [...formData.reviews];
                                  newReviews[idx] = { ...newReviews[idx], rating: star };
                                  setFormData({ ...formData, reviews: newReviews });
                                }}
                                className="focus:outline-none"
                              >
                                <Star 
                                  size={14} 
                                  className={cn(
                                    "transition-colors",
                                    star <= (review.rating || 5) ? "text-[#fabc05] fill-current" : "text-va-black/10"
                                  )} 
                                />
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                              review.provider === 'google_places' ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
                            )}>
                              {review.provider === 'google_places' ? 'Google' : 'Handmatig'}
                            </span>
                            <button 
                              type="button"
                              onClick={() => {
                                const newReviews = formData.reviews.filter((_, i) => i !== idx);
                                setFormData({ ...formData, reviews: newReviews });
                              }}
                              className="p-1 text-va-black/10 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <input 
                            type="text" 
                            value={review.author_name || review.authorName || ''}
                            onChange={(e) => {
                              const newReviews = [...formData.reviews];
                              newReviews[idx] = { ...newReviews[idx], author_name: e.target.value, authorName: e.target.value };
                              setFormData({ ...formData, reviews: newReviews });
                            }}
                            className="w-full bg-transparent border-none p-0 text-[14px] font-bold text-va-black focus:ring-0 placeholder:opacity-20"
                            placeholder="Naam van de klant of bedrijf..."
                          />
                          <textarea 
                            value={review.text_nl || review.textNl || review.text || ''}
                            onChange={(e) => {
                              const newReviews = [...formData.reviews];
                              newReviews[idx] = { ...newReviews[idx], text_nl: e.target.value, textNl: e.target.value };
                              setFormData({ ...formData, reviews: newReviews });
                            }}
                            rows={3}
                            className="w-full bg-white/50 rounded-xl border border-black/5 p-3 text-[13px] font-light text-va-black focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none placeholder:opacity-20"
                            placeholder="Schrijf hier de testimonial..."
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 border-2 border-dashed border-black/5 rounded-[30px] flex flex-col items-center justify-center text-center bg-va-off-white/20">
                      <Star size={40} className="text-va-black/5 mb-4" />
                      <TextInstrument className="text-[15px] text-va-black/30 font-light">
                        Nog geen reviews toegevoegd.
                      </TextInstrument>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            <audio ref={audioRef} onEnded={() => setPlayingDemoId(null)} className="hidden" />
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-black/5 bg-va-off-white/30 flex justify-between items-center">
            <div className="flex items-center gap-2 text-[11px] text-va-black/40 font-medium italic max-w-[250px] leading-tight">
              <InfoIcon size={14} className="text-primary shrink-0" />
              Wijzigingen door stemacteurs vereisen admin-goedkeuring voor ze live gaan.
            </div>
            <div className="flex gap-4">
              <ButtonInstrument 
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-xl px-6"
              >
                Annuleren
              </ButtonInstrument>
              <ButtonInstrument 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-va-black text-white hover:bg-primary rounded-xl px-8 flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Opslaan
              </ButtonInstrument>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
