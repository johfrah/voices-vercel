"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, animate } from 'framer-motion';
import { 
  ContainerInstrument, 
  SectionInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument,
  LabelInstrument,
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { PricingEngine } from '@/lib/pricing-engine';
import { 
  Mic, Clock, ChevronRight, Phone, Video, 
  Megaphone, Info, ShoppingBag, CheckCircle2, Wand2, Check,
  Plus, Minus, Music, Radio, Tv, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { VoiceCard } from '@/components/ui/VoiceCard';
import { OrderStepsInstrument } from '@/components/ui/OrderStepsInstrument';
import { useMasterControl, JourneyType } from '@/contexts/VoicesMasterControlContext';

/**
 *  CHRIS-PROTOCOL: Count-Up Component for Pricing
 */
const PriceCountUp = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (latest) => setDisplayValue(latest)
    });
    return () => controls.stop();
  }, [value, displayValue]);

  return <span>{PricingEngine.format(displayValue)}</span>;
};

/**
 *  ULTIMATE CONFIGURATOR (2026) - 3 KOLOMMEN MASTERCLASS
 */
export default function ConfiguratorPageClient({ 
  isEmbedded = false, 
  hideMediaSelector = false,
  minimalMode = false
}: { 
  isEmbedded?: boolean,
  hideMediaSelector?: boolean,
  minimalMode?: boolean
}) {
  const { state, updateBriefing, updateUsage, updateMedia, updateSpots, updateYears, updateSpotsDetail, updateYearsDetail, updateLiveSession, updateMusic, updateCountry, setStep, addItem, calculatePricing } = useCheckout();
  const { state: masterControlState, updateJourney, updateStep } = useMasterControl();
  const { t } = useTranslation();
  const router = useRouter();
  
  const [localBriefing, setLocalBriefing] = useState(state.briefing);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Auto-Save Logic
  useEffect(() => {
    const saved = localStorage.getItem('voices_draft_script');
    // CHRIS-PROTOCOL: Only restore if there is NO existing briefing in state
    // and the saved content is not just dummy text.
    if (saved && !state.briefing && saved.trim() !== '' && !saved.includes('woord woord')) {
      setLocalBriefing(saved);
      updateBriefing(saved);
    }
  }, [state.briefing, updateBriefing]);

  useEffect(() => {
    if (!localBriefing) return;
    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem('voices_draft_script', localBriefing);
      updateBriefing(localBriefing);
      setIsAutoSaving(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [localBriefing, updateBriefing]);

  const wordCount = useMemo(() => localBriefing.trim().split(/\s+/).filter(Boolean).length, [localBriefing]);
  
  //  CHRIS-PROTOCOL: Binding Word Count for Telephony & Video
  // We ensure that the pricing engine uses the ACTUAL word count from the script
  // once the user has started typing, overriding any indicative filter values.
  const effectiveWordCount = useMemo(() => {
    if (wordCount > 0) return wordCount;
    return masterControlState.filters.words || 0;
  }, [wordCount, masterControlState.filters.words]);

  const estimatedTime = useMemo(() => {
    const seconds = Math.round((effectiveWordCount / 160) * 60);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  }, [effectiveWordCount]);

  // MARK'S LIVE TIPS
  const liveTip = useMemo(() => {
    if (wordCount === 0) {
      if (state.usage === 'telefonie') return "Tip: Voer hier je IVR of voicemail prompts in.";
      if (state.usage === 'commercial') return "Tip: Vergeet niet de regie-aanwijzingen voor de spot.";
      return "Begin met typen om je script tot leven te brengen.";
    }
    if (wordCount < 10) return "Tip: Gebruik (haakjes) voor regie-aanwijzingen zoals (enthousiast).";
    if (wordCount > 150) return "Wist je dat scripts boven 150 woorden vaak beter werken als ze in delen worden opgenomen?";
    if (state.usage === 'telefonie') return "Voor IVR: Pauzes tussen prompts maken het menu duidelijker.";
    return "Je script ziet er goed uit! De prijs wordt live berekend op basis van je woorden.";
  }, [wordCount, state.usage]);

  const scriptPlaceholder = useMemo(() => {
    if (state.usage === 'telefonie') return "Voer hier uw IVR of voicemail teksten in...";
    if (state.usage === 'commercial') return "Voer hier uw commercial script in...";
    return "Voer hier uw tekst in...";
  }, [state.usage]);

  const handleUsageSwitch = (usageId: any) => {
    const journeyMap: Record<string, JourneyType> = {
      'telefonie': 'telephony',
      'unpaid': 'video',
      'commercial': 'commercial'
    };

    if (journeyMap[usageId]) {
      updateJourney(journeyMap[usageId]);
    } else {
      updateUsage(usageId);
    }

    if (usageId !== 'commercial') {
      updateSpots(1);
      updateYears(1);
    }
    
    setTimeout(() => {
      if (calculatePricing) calculatePricing();
    }, 250);
  };

  const handleMediaToggle = (mediaId: string) => {
    const currentMedia = state.media || [];
    const baseId = mediaId.split('_')[0];
    const existingMedia = currentMedia.find(m => m.startsWith(baseId));
    
    let newMedia: string[];
    if (existingMedia) {
      if (currentMedia.length > 1) {
        newMedia = currentMedia.filter(m => m !== existingMedia);
      } else {
        return;
      }
    } else {
      newMedia = [...currentMedia, mediaId];
    }
    
    updateMedia(newMedia);
    setTimeout(() => {
      if (calculatePricing) calculatePricing();
    }, 100);
  };

  const handleBriefingChange = (val: string) => {
    setLocalBriefing(val);
    updateBriefing(val);
  };

  const usageTypes = [
    { id: 'telefonie', label: 'Telefoon', icon: Phone, key: 'journey.telephony', description: 'IVR, Wachtmuziek' },
    { id: 'unpaid', label: 'Video', icon: Video, key: 'journey.video', description: 'Online, Corporate' },
    { id: 'commercial', label: 'Commercial', icon: Megaphone, key: 'journey.commercial', description: 'Radio, TV, Ads' },
  ];

  const commercialMediaOptions = [
    { id: 'online', label: 'Online / Social', icon: Video, description: 'Web, Social Media' },
    { id: 'radio_national', label: 'Radio', icon: Radio, description: 'Landelijke Radio', hasRegions: true },
    { id: 'tv_national', label: 'TV', icon: Tv, description: 'Landelijke TV', hasRegions: true },
    { id: 'podcast', label: 'Podcast', icon: Mic, description: 'In-podcast Ads' },
  ];

  const regions = [
    { id: 'Nationaal', label: 'Nationaal' },
    { id: 'Regionaal', label: 'Regionaal' },
    { id: 'Lokaal', label: 'Lokaal' },
  ];

  const countries = [
    { id: 'BE', label: 'België' },
    { id: 'NL', label: 'Nederland' },
    { id: 'FR', label: 'Frankrijk' },
    { id: 'EU', label: 'Europa' },
    { id: 'GLOBAL', label: 'Wereldwijd' },
  ];

  const handleAddToCart = () => {
    if (!state.selectedActor || effectiveWordCount === 0) return;
    addItem({
      id: `voice-${state.selectedActor.id}-${Date.now()}`,
      type: 'voice_over',
      actor: state.selectedActor,
      script: localBriefing,
      usage: state.usage,
      pricing: { ...state.pricing }
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <ContainerInstrument className={cn(
      "relative overflow-hidden",
      !isEmbedded && "min-h-screen bg-va-off-white pb-32"
    )}>
      
      {!isEmbedded && (
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent opacity-50 pointer-events-none" />
      )}
      
      <SectionInstrument className={cn(
        "max-w-7xl mx-auto relative z-10",
        !isEmbedded ? "pt-20 px-6" : "pt-0 px-0"
      )}>
        {!isEmbedded && (
          <ContainerInstrument className="text-center mb-12 space-y-8">
            <OrderStepsInstrument currentStep="script" className="mb-4" />
            <div className="space-y-2">
              <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter text-va-black leading-none">
                <VoiceglotText translationKey="configurator.title" defaultText="Script & Prijs" />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-va-black/30 font-light tracking-tight">
                <VoiceglotText translationKey="configurator.subtitle" defaultText="Verfijn je script en kies de juiste rechten." />
              </TextInstrument>
            </div>
          </ContainerInstrument>
        )}

        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-0",
          isEmbedded ? "pt-0" : ""
        )}>
          
          {!minimalMode && (
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-10 pt-0">
              <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/20 uppercase px-2">
                01. De Stem
              </LabelInstrument>
              {state.selectedActor ? (
                <div className="w-full">
                  <VoiceCard voice={state.selectedActor} />
                </div>
              ) : (
                <div onClick={() => router.push('/agency')} className="bg-white rounded-[20px] shadow-aura p-12 text-center border border-black/[0.03] cursor-pointer hover:scale-[1.02] transition-all group">
                  <Mic size={48} strokeWidth={1} className="mx-auto text-va-black/10 group-hover:text-primary/20 transition-colors mb-4" />
                  <TextInstrument className="text-[15px] font-light text-va-black/40">Kies eerst een stemacteur</TextInstrument>
                </div>
              )}
            </div>
          )}

            <div className={cn(
            "pt-0",
            minimalMode ? "lg:col-span-12" : "lg:col-span-6 space-y-6"
          )}>
            {!hideMediaSelector && (
              <div className="space-y-4 mb-8 relative">
                <div className="flex items-center justify-between px-2">
                  <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/20 uppercase">
                    02. Gebruik & Rechten
                  </LabelInstrument>
                </div>
                <div className="grid grid-cols-3 gap-3 relative">
                  {usageTypes.map((type) => {
                    const isActive = state.usage === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUsageSwitch(type.id as any);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-[15px] bg-white shadow-aura border transition-all duration-500 text-center group relative cursor-pointer w-full",
                          isActive ? "ring-2 ring-primary bg-primary/[0.02] border-primary/20" : "border-black/[0.03] hover:scale-[1.02]"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors pointer-events-none",
                          isActive ? "bg-primary text-white" : "bg-va-off-white text-va-black/20 group-hover:text-primary"
                        )}>
                          <type.icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="pointer-events-none">
                          <div className={cn("text-[12px] font-bold tracking-tight leading-tight transition-colors", isActive ? "text-primary" : "text-va-black")}>{type.label}</div>
                          <div className="text-[9px] text-va-black/30 uppercase tracking-widest font-black mt-0.5">{type.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {state.usage === 'commercial' && (
                  <div className="pt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="space-y-3">
                      <LabelInstrument className="text-[10px] font-bold tracking-[0.15em] text-va-black/30 uppercase px-2">Land van uitzending</LabelInstrument>
                      <div className="flex flex-wrap gap-2">
                        {countries.map((c) => {
                          const isSelected = Array.isArray(state.country) ? state.country.includes(c.id) : state.country === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                updateCountry(c.id);
                                setTimeout(() => calculatePricing?.(), 50);
                              }}
                              className={cn(
                                "px-4 py-2 rounded-full border text-[11px] font-bold transition-all",
                                isSelected ? "bg-va-black text-white border-va-black shadow-md" : "bg-white border-black/[0.03] text-va-black/40 hover:border-black/10"
                              )}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <LabelInstrument className="text-[10px] font-bold tracking-[0.15em] text-va-black/30 uppercase px-2">Selecteer kanalen</LabelInstrument>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {commercialMediaOptions.map((opt) => {
                          const baseId = opt.id.split('_')[0];
                          const isSelected = state.media?.some(m => m.startsWith(baseId));
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleMediaToggle(opt.id)}
                              className={cn(
                                "flex flex-col items-center gap-1 p-3 rounded-[12px] border transition-all text-center group relative overflow-hidden",
                                isSelected ? "bg-va-black text-white border-va-black shadow-lg scale-[1.02]" : "bg-white border-black/[0.03] text-va-black/40 hover:border-black/10 hover:bg-va-off-white/50"
                              )}
                            >
                              <opt.icon size={16} strokeWidth={isSelected ? 2.5 : 1.5} className={cn(isSelected ? "text-white" : "text-va-black/20 group-hover:text-va-black/40")} />
                              <span className="text-[11px] font-bold tracking-tight leading-none mt-1 uppercase">{opt.label}</span>
                              {isSelected && <motion.div layoutId="active-media-glow" className="absolute inset-0 bg-primary/10 blur-xl pointer-events-none" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <AnimatePresence mode="popLayout">
                        {state.media?.map((mediaId) => {
                          const opt = commercialMediaOptions.find(o => o.id === mediaId);
                          if (!opt) return null;
                          const isPodcast = mediaId === 'podcast';
                          const hasRegions = (opt as any).hasRegions;
                          const currentSpots = (state.spotsDetail && state.spotsDetail[mediaId]) || state.spots || 1;
                          const currentYears = (state.yearsDetail && state.yearsDetail[mediaId]) || state.years || 1;

                          return (
                            <motion.div key={mediaId} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[20px] p-5 shadow-aura border border-black/[0.03] relative overflow-hidden group">
                              <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-va-black text-white flex items-center justify-center">
                                    <opt.icon size={14} strokeWidth={2.5} />
                                  </div>
                                  <span className="text-[13px] font-bold text-va-black uppercase tracking-tight">{opt.label}</span>
                                </div>
                                <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md">Rechten</div>
                              </div>
                              <div className="space-y-6">
                                {hasRegions && (
                                  <div className="space-y-3">
                                    <span className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest">Regio</span>
                                    <div className="flex gap-2">
                                      {regions.map(r => (
                                        <button key={r.id} onClick={() => {
                                          const baseId = mediaId.split('_')[0];
                                          const newId = `${baseId}_${r.id.toLowerCase()}`;
                                          const newMedia = state.media.map(m => m === mediaId ? newId : m);
                                          updateMedia(newMedia);
                                          setTimeout(() => calculatePricing?.(), 50);
                                        }} className={cn("flex-1 py-2 rounded-lg border text-[11px] font-bold transition-all", mediaId.includes(r.id.toLowerCase()) ? "bg-primary/10 border-primary/20 text-primary" : "bg-va-off-white/50 border-black/[0.03] text-va-black/40 hover:border-black/10")}>{r.label}</button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest">Aantal Spots</span>
                                      <span className="text-[14px] font-black text-primary">{currentSpots}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button onClick={() => { const next = Math.max(1, currentSpots - 1); updateSpotsDetail({ ...state.spotsDetail, [mediaId]: next }); setTimeout(() => calculatePricing?.(), 50); }} className="w-8 h-8 rounded-xl bg-va-off-white border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all active:scale-90"><Minus size={14} strokeWidth={2.5} /></button>
                                      <div className="flex-1 relative h-1.5 bg-va-black/5 rounded-full overflow-hidden">
                                        <motion.div className="absolute inset-y-0 left-0 bg-primary" initial={false} animate={{ width: `${(currentSpots / 10) * 100}%` }} />
                                        <input type="range" min="1" max="10" step="1" value={currentSpots} onChange={(e) => { updateSpotsDetail({ ...state.spotsDetail, [mediaId]: parseInt(e.target.value) }); setTimeout(() => calculatePricing?.(), 50); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                      </div>
                                      <button onClick={() => { const next = Math.min(10, currentSpots + 1); updateSpotsDetail({ ...state.spotsDetail, [mediaId]: next }); setTimeout(() => calculatePricing?.(), 50); }} className="w-8 h-8 rounded-xl bg-va-off-white border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all active:scale-90"><Plus size={14} strokeWidth={2.5} /></button>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest">{isPodcast ? 'Licentie' : 'Looptijd'}</span>
                                      <span className="text-[14px] font-black text-primary">{isPodcast ? `${currentYears * 4} units` : `${currentYears} jaar`}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button onClick={() => { const next = Math.max(isPodcast ? 0.25 : 1, currentYears - (isPodcast ? 0.25 : 1)); updateYearsDetail({ ...state.yearsDetail, [mediaId]: next }); setTimeout(() => calculatePricing?.(), 50); }} className="w-8 h-8 rounded-xl bg-va-off-white border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all active:scale-90"><Minus size={14} strokeWidth={2.5} /></button>
                                      <div className="flex-1 relative h-1.5 bg-va-black/5 rounded-full overflow-hidden">
                                        <motion.div className="absolute inset-y-0 left-0 bg-primary" initial={false} animate={{ width: `${(currentYears / 5) * 100}%` }} />
                                        <input type="range" min={isPodcast ? 0.25 : 1} max="5" step={isPodcast ? 0.25 : 1} value={currentYears} onChange={(e) => { updateYearsDetail({ ...state.yearsDetail, [mediaId]: parseFloat(e.target.value) }); setTimeout(() => calculatePricing?.(), 50); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                      </div>
                                      <button onClick={() => { const next = Math.min(5, currentYears + (isPodcast ? 0.25 : 1)); updateYearsDetail({ ...state.yearsDetail, [mediaId]: next }); setTimeout(() => calculatePricing?.(), 50); }} className="w-8 h-8 rounded-xl bg-va-off-white border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all active:scale-90"><Plus size={14} strokeWidth={2.5} /></button>
                                    </div>
                                    {isPodcast && <div className="text-[10px] text-va-black/40 font-medium italic leading-none">Buyout per 3 maanden.</div>}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            )}

            <ContainerInstrument className="bg-white rounded-[20px] shadow-aura border border-black/[0.03] overflow-hidden group/script">
              <div className="p-4 bg-va-off-white/50 border-b border-black/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-[11px] font-bold text-va-black/20 tracking-widest uppercase">
                    {effectiveWordCount} {effectiveWordCount === 1 ? 'woord' : 'woorden'}
                  </div>
                  <div className="w-[1px] h-3 bg-va-black/10" />
                  <div className="flex items-center gap-2 text-va-black/40">
                    <Clock size={12} strokeWidth={1.5} />
                    <span className="text-[11px] font-medium uppercase tracking-widest">± {estimatedTime} min</span>
                  </div>
                  {isAutoSaving && (
                    <>
                      <div className="w-[1px] h-3 bg-va-black/10" />
                      <span className="text-[10px] font-bold text-primary animate-pulse tracking-widest uppercase">Auto-saving...</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-va-black/40 font-light italic">
                  <Info size={12} className="text-primary/40" /> Tip: Gebruik (haakjes) voor regie
                </div>
              </div>
              <textarea
                value={localBriefing}
                onChange={(e) => handleBriefingChange(e.target.value)}
                placeholder={scriptPlaceholder}
                className="w-full h-[400px] p-8 text-xl font-light leading-relaxed bg-transparent border-none focus:ring-0 outline-none resize-none placeholder:text-va-black/10"
              />
            </ContainerInstrument>

            <div className={cn("grid grid-cols-1 gap-4", state.usage === 'telefonie' ? "md:grid-cols-2" : "md:grid-cols-1", !minimalMode && "mt-8")}>
              <button onClick={() => updateLiveSession(!state.liveSession)} className={cn("flex items-center justify-between p-5 rounded-[20px] border transition-all text-left group", state.liveSession ? "bg-primary/5 border-primary/20" : "bg-white border-black/[0.03] hover:border-black/10")}>
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", state.liveSession ? "bg-primary text-white" : "bg-va-off-white text-va-black/20 group-hover:text-primary")}><Mic size={18} strokeWidth={1.5} /></div>
                  <div>
                    <div className={cn("text-[13px] font-bold", state.liveSession ? "text-primary" : "text-va-black")}>Live Regie</div>
                    <div className="text-[11px] text-va-black/40 font-light">Regisseer via Zoom/Teams</div>
                  </div>
                </div>
                <div className={cn("text-[13px] font-medium", state.liveSession ? "text-primary" : "text-va-black/40")}>+ €99</div>
              </button>
              
              {state.usage === 'telefonie' && (
                <button onClick={() => updateMusic({ asBackground: !state.music.asBackground, trackId: state.music.trackId || 'corporate-growth' })} className={cn("flex items-center justify-between p-5 rounded-[20px] border transition-all text-left group", state.music.asBackground ? "bg-primary/5 border-primary/20" : "bg-white border-black/[0.03] hover:border-black/10")}>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", state.music.asBackground ? "bg-primary text-white" : "bg-va-off-white text-va-black/20 group-hover:text-primary")}><Music size={18} strokeWidth={1.5} /></div>
                    <div>
                      <div className={cn("text-[13px] font-bold", state.music.asBackground ? "text-primary" : "text-va-black")}>Muziek Mix</div>
                      <div className="text-[11px] text-va-black/40 font-light">Rechtenvrije achtergrond</div>
                    </div>
                  </div>
                  <div className={cn("text-[13px] font-medium", state.music.asBackground ? "text-primary" : "text-va-black/40")}>+ €59</div>
                </button>
              )}
            </div>

            {minimalMode && (
              <div className="mt-8">
                <ContainerInstrument className="bg-white rounded-[20px] p-8 text-va-black shadow-aura border border-black/[0.03] relative overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-black/[0.03] pb-2">
                        <span className="text-[11px] font-bold tracking-widest text-va-black/30 uppercase">Opbouw prijs</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex justify-between text-[13px]">
                          <span className="text-va-black/40 font-light">Basis (BSF)</span>
                          <span className="font-medium">{PricingEngine.format(state.pricing.base)}</span>
                        </div>
                        {state.pricing.wordSurcharge > 0 && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-va-black/40 font-light">{state.usage === 'telefonie' ? 'Extra prompts' : 'Extra woorden'}</span>
                            <span className="font-medium">+{PricingEngine.format(state.pricing.wordSurcharge)}</span>
                          </div>
                        )}
                        {state.usage === 'commercial' && state.pricing.mediaSurcharge > 0 && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-va-black/40 font-light">Buyout ({state.media?.length} {state.media?.length === 1 ? 'kanaal' : 'kanalen'})</span>
                            <span className="font-medium">+{PricingEngine.format(state.pricing.mediaSurcharge)}</span>
                          </div>
                        )}
                        {state.music.asBackground && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-va-black/40 font-light">Muziek Mix</span>
                            <span className="font-medium">+{PricingEngine.format(59)}</span>
                          </div>
                        )}
                        {state.liveSession && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-va-black/40 font-light">Live Regie</span>
                            <span className="font-medium">+{PricingEngine.format(99)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-va-black/20 uppercase">Totaal (excl. BTW)</div>
                        <div className="text-5xl font-light tracking-tighter text-va-black">
                          <PriceCountUp value={state.pricing.total} />
                        </div>
                      </div>
                      <div className="flex-1 w-full space-y-3">
                        <ButtonInstrument onClick={() => { if (isEmbedded) { updateJourney(state.usage === 'commercial' ? 'commercial' : state.usage === 'telefonie' ? 'telephony' : 'video'); updateStep('checkout'); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} disabled={!state.selectedActor || effectiveWordCount === 0} className="va-btn-pro w-full !bg-va-black !text-white flex items-center justify-center gap-2 group py-5 text-xl hover:!bg-primary transition-all">Bestellen <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></ButtonInstrument>
                        <button onClick={handleAddToCart} disabled={!state.selectedActor || effectiveWordCount === 0 || addedToCart} className="w-full py-3 text-[11px] font-bold tracking-[0.2em] text-va-black/20 hover:text-primary transition-all flex items-center justify-center gap-2 uppercase">{addedToCart ? (<><CheckCircle2 size={12} className="text-green-500" /> Toegevoegd</>) : (<><ShoppingBag size={12} /> Bewaar in mandje</>)}</button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 blur-[80px] rounded-full" />
                </ContainerInstrument>
              </div>
            )}
          </div>

          {!minimalMode && (
            <div className="lg:col-span-3 space-y-8 lg:sticky lg:top-10 pt-0">
              <ContainerInstrument className="bg-white rounded-[20px] p-8 text-va-black shadow-aura border border-black/[0.03] relative overflow-hidden">
                <div className="space-y-6 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-black/[0.03] pb-2">
                      <span className="text-[11px] font-bold tracking-widest text-va-black/30 uppercase">Opbouw prijs</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-va-black/40 font-light">Basis (BSF)</span>
                        <span className="font-medium">{PricingEngine.format(state.pricing.base)}</span>
                      </div>
                      {state.pricing.wordSurcharge > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-va-black/40 font-light">{state.usage === 'telefonie' ? 'Extra prompts' : 'Extra woorden'}</span>
                          <span className="font-medium">+{PricingEngine.format(state.pricing.wordSurcharge)}</span>
                        </div>
                      )}
                      {state.usage === 'commercial' && state.pricing.mediaSurcharge > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-va-black/40 font-light">Buyout ({state.media?.length} {state.media?.length === 1 ? 'kanaal' : 'kanalen'})</span>
                          <span className="font-medium">+{PricingEngine.format(state.pricing.mediaSurcharge)}</span>
                        </div>
                      )}
                      {state.music.asBackground && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-va-black/40 font-light">Muziek Mix</span>
                          <span className="font-medium">+{PricingEngine.format(59)}</span>
                        </div>
                      )}
                      {state.liveSession && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-va-black/40 font-light">Live Regie</span>
                          <span className="font-medium">+{PricingEngine.format(99)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 pt-4 border-t border-black/[0.03]">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-va-black/20 uppercase">Totaal (excl. BTW)</div>
                    <div className="text-4xl font-light tracking-tighter text-va-black">
                      <PriceCountUp value={state.pricing.total} />
                    </div>
                    {state.pricing.legalDisclaimer && <div className="text-[10px] text-va-black/40 font-light italic mt-2 leading-tight">{state.pricing.legalDisclaimer}</div>}
                  </div>
                  <div className="pt-4 space-y-3">
                    <ButtonInstrument onClick={() => { if (isEmbedded) { updateJourney(state.usage === 'commercial' ? 'commercial' : state.usage === 'telefonie' ? 'telephony' : 'video'); updateStep('checkout'); window.scrollTo({ top: 0, behavior: 'smooth' }); } else { setStep('details'); router.push('/checkout'); } }} disabled={!state.selectedActor || effectiveWordCount === 0} className="va-btn-pro w-full !bg-va-black !text-white flex items-center justify-center gap-2 group py-5 text-lg hover:!bg-primary transition-all">Bestellen <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></ButtonInstrument>
                    <button onClick={handleAddToCart} disabled={!state.selectedActor || effectiveWordCount === 0 || addedToCart} className="w-full py-3 text-[11px] font-bold tracking-[0.2em] text-va-black/20 hover:text-primary transition-all flex items-center justify-center gap-2 uppercase border border-black/[0.03] rounded-[10px] hover:bg-black/[0.02]">{addedToCart ? (<><CheckCircle2 size={12} className="text-green-500" /> Toegevoegd</>) : (<><ShoppingBag size={12} /> Bewaar in mandje</>)}</button>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 blur-[80px] rounded-full" />
              </ContainerInstrument>
            </div>
          )}
        </div>
      </SectionInstrument>

      {/* MOBY'S STICKY MOBILE ACTION BAR */}
      {isEmbedded && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white/80 backdrop-blur-xl border-t border-black/5 animate-in slide-in-from-bottom-full duration-500">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest leading-none">Totaal</span>
              <span className="text-2xl font-light tracking-tighter text-va-black leading-none">
                <PriceCountUp value={state.pricing.total} />
              </span>
            </div>
              <button 
                onClick={() => { updateJourney(state.usage === 'commercial' ? 'commercial' : state.usage === 'telefonie' ? 'telephony' : 'video'); updateStep('checkout'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={!state.selectedActor || effectiveWordCount === 0}
                className="bg-va-black text-white px-8 py-3 rounded-xl font-bold text-[13px] tracking-widest uppercase active:scale-95 transition-all disabled:opacity-50"
              >
                Bestellen
              </button>
          </div>
        </div>
      )}
    </ContainerInstrument>
  );
}
