"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LucideArrowLeft,
    LucideCheckCircle,
    LucideUpload,
    LucideX,
    Loader2,
    ArrowRight,
    Globe,
    Radio,
    Tv,
    Mic2,
    Phone,
    Video,
    Megaphone,
    Sparkles,
    CheckCircle2,
    Minus,
    Plus
} from 'lucide-react';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { VoiceCard } from '@/components/ui/VoiceCard';
import dynamic from 'next/dynamic';

const LiquidBackground = dynamic(() => import('@/components/ui/LiquidBackground').then((mod) => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-va-off-white" />
});

import { CommercialMediaType } from '@/lib/engines/pricing-engine';

interface StudioLaunchpadProps {
  initialActors?: any[];
  initialJourney?: "telefonie" | "unpaid" | "paid" | string;
}

export function StudioLaunchpad({ initialActors = [], initialJourney }: StudioLaunchpadProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { state, toggleActorSelection } = useVoicesState();
  const selectedActors = state.selected_actors;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [script, setScript] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('');
  const [actorNotes, setActorNotes] = useState<Record<string, string>>({});
  const [isLaunching, setIsLaunching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialUsageValue = useMemo(() => {
    if (!initialJourney) return "paid";
    const s = initialJourney.toLowerCase();
    if (['telephony', 'telefonie', 'telefoon'].includes(s)) return 'telefonie';
    if (['video', 'corporate', 'unpaid'].includes(s)) return 'unpaid';
    if (['commercial', 'advertentie', 'paid'].includes(s)) return 'paid';
    return "paid";
  }, [initialJourney]);

  const [calcUsage, setCalcUsage] = useState<"telefonie" | "unpaid" | "paid">(initialUsageValue);
  const [selectedMedia, setSelectedMedia] = useState<CommercialMediaType[]>(['online']);
  const [spotsDetail, setSpotsDetail] = useState<Record<string, number>>({});
  const [yearsDetail, setYearsDetail] = useState<Record<string, number>>({});
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [calcWords, setCalcWords] = useState(200);
  
  const mediaOptions = useMemo(() => [
    { id: 'online', label: t('common.media.online', 'Online & Socials'), sub: t('common.media.online.desc', 'YouTube, Meta, LinkedIn'), icon: Globe },
    { id: 'podcast', label: t('common.media.podcast', 'Podcast'), sub: t('common.media.podcast.desc', 'Pre-roll, Mid-roll'), icon: Mic2 },
    { id: 'radio_national', label: t('common.media.radio', 'Radio'), sub: t('common.media.radio.desc', 'Landelijke Radio'), icon: Radio },
    { id: 'tv_national', label: t('common.media.tv', 'TV'), sub: t('common.media.tv.desc', 'Landelijke TV'), icon: Tv }
  ], [t]);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/pricing/config');
        const data = await res.json();
        setPricingConfig(data);
        setCalcWords(calcUsage === 'telefonie' ? (data.telephonyWordThreshold || 25) : (data.videoWordThreshold || 200));
      } catch (err) {
        console.error('Failed to fetch pricing config', err);
      }
    };
    fetchConfig();
  }, [calcUsage]);

  useEffect(() => {
    if (calcUsage === 'telefonie') {
      setSelectedMedia(['telephony' as any]);
      if (pricingConfig) setCalcWords(pricingConfig.telephonyWordThreshold || 25);
    } else if (calcUsage === 'unpaid') {
      setSelectedMedia(['online']);
      if (pricingConfig) setCalcWords(pricingConfig.videoWordThreshold || 200);
    }
  }, [calcUsage, pricingConfig]);

  const steps = [
    { id: 1, title: 'Project', key: 'step.access', description: 'Wat gaan we maken?' },
    { id: 2, title: 'Selectie', key: 'step.voices', description: 'Kies je stemmen' },
    { id: 3, title: 'Briefing', key: 'step.briefing', description: 'Script & vibe' },
  ];

  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      if (!projectName) {
        toast.error(t('launchpad.error.project_name', 'Geef je project een naam'));
        return;
      }
      if (!clientEmail) {
        toast.error(t('launchpad.error.email', 'Vul je e-mailadres in'));
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
        toast.error(t('launchpad.error.email_invalid', 'Vul een geldig e-mailadres in'));
        return;
      }
    }
    
    if (currentStep === 2 && selectedActors.length === 0) {
      toast.error(t('launchpad.error.no_actors', 'Selecteer minimaal één stemacteur'));
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, projectName, clientEmail, selectedActors.length, t]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLaunch = useCallback(async () => {
    if (!script || script.trim().length < 10) {
      toast.error(t('launchpad.error.script_short', 'Je script is te kort voor een proefopname'));
      return;
    }

    setIsLaunching(true);
    try {
      const response = await fetch('/api/casting/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectName, 
          clientName, 
          clientCompany, 
          clientEmail, 
          selectedMedia, 
          spots: spotsDetail,
          years: yearsDetail,
          words: calcWords,
          deadline, 
          script, 
          selectedActors: selectedActors.map((actor) => ({ ...actor, note: actorNotes[actor.id] || '' })), 
          selectedVibe 
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(t('launchpad.success.submit', 'Je aanvraag is succesvol verzonden!'));
        localStorage.removeItem('voices_proefopname_draft');
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            router.push(`/pitch/${data.sessionHash}`);
          }, 2000);
        }
      } else {
        throw new Error(data.error || 'Fout bij het indienen');
      }
    } catch (err: any) {
      console.error('Launch error:', err);
      toast.error(err.message || t('launchpad.error.submit', 'Er is iets misgegaan bij het aanvragen. Probeer het later opnieuw.'));
      setIsLaunching(false);
    }
  }, [script, projectName, clientName, clientCompany, clientEmail, selectedMedia, spotsDetail, yearsDetail, calcWords, deadline, selectedActors, actorNotes, selectedVibe, t]);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setIsMatching(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/audio/extract-text', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.success && data.script) setScript(data.script);
    } catch (err) {
      console.error('Drop extraction failed:', err);
    } finally {
      setIsMatching(false);
    }
  }, []);

  const renderStep1 = () => (
    <div className="max-w-6xl mx-auto">
      <div className="space-y-8">
        <div className="p-10 bg-white/80 backdrop-blur-xl rounded-[30px] border border-white/20 shadow-aura space-y-12">
          <div className="flex justify-center">
            <div className="flex p-1 bg-va-off-white rounded-2xl border border-black/5 shadow-inner">
              {[
                { id: 'telefonie', label: 'Telefoon', icon: Phone },
                { id: 'unpaid', label: 'Video', icon: Video },
                { id: 'paid', label: 'Advertentie', icon: Megaphone }
              ].map((u) => (
                <button 
                  key={u.id}
                  onClick={() => {
                    setCalcUsage(u.id as any);
                    setCalcWords(u.id === 'telefonie' ? 25 : 200);
                  }}
                  className={cn(
                    "px-8 py-3 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2",
                    calcUsage === u.id ? "bg-va-black text-white shadow-lg" : "text-va-black/30 hover:text-va-black"
                  )}
                >
                  <u.icon size={14} className={calcUsage === u.id ? "text-primary" : ""} />
                  <span>{u.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                  <VoiceglotText translationKey="common.project_name" defaultText="Projectnaam" />
                </label>
                <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder={t('launchpad.placeholder.project', "Bijv. Zomer Campagne 2026")} className="w-full h-14 bg-va-off-white/50 border-none rounded-[10px] px-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-va-black/10 transition-all placeholder:text-va-black/40" />
              </div>
              <div className="space-y-3">
                <label className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                  <VoiceglotText translationKey="common.email" defaultText="E-mailadres" />
                </label>
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder={t('common.placeholder.email', "naam@bedrijf.be")} className="w-full h-14 bg-va-off-white/50 border-none rounded-[10px] px-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-va-black/10 transition-all placeholder:text-va-black/40" />
              </div>
            </div>

            <div className="space-y-8">
              {calcUsage === 'paid' ? (
                <div className="space-y-4">
                  <label className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                    <VoiceglotText translationKey="common.select_channels" defaultText="Selecteer Kanalen" />
                  </label>
                  <div className="space-y-3">
                    {mediaOptions.map((m) => {
                      const isActive = selectedMedia.includes(m.id as any);
                      return (
                        <div key={m.id} className={cn(
                          "p-4 rounded-2xl border-2 transition-all duration-500 bg-white",
                          isActive ? "border-primary/20 shadow-aura-sm" : "border-black/5 opacity-60"
                        )}>
                          <button
                            onClick={() => setSelectedMedia((prev) => prev.includes(m.id as any) ? (prev.length > 1 ? prev.filter((i) => i !== m.id) : prev) : [...prev, m.id as any])}
                            className="w-full flex items-center justify-between mb-3"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isActive ? "bg-primary text-white" : "bg-va-off-white text-va-black/20")}>
                                <m.icon size={20} />
                              </div>
                              <div className="text-left">
                                <div className="text-[14px] font-bold text-va-black">
                                  <VoiceglotText translationKey={`common.media.${m.id}`} defaultText={m.label} />
                                </div>
                                <div className="text-[11px] text-va-black/30 font-light">
                                  <VoiceglotText translationKey={`common.media.${m.id}.desc`} defaultText={m.sub} />
                                </div>
                              </div>
                            </div>
                            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isActive ? "bg-primary border-primary text-white" : "border-black/10")}>
                              {isActive && <CheckCircle2 size={14} />}
                            </div>
                          </button>
                          
                          {isActive && (
                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-black/5">
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                                  <VoiceglotText translationKey="common.spots" defaultText="Spots" />
                                </label>
                                <div className="flex items-center justify-between bg-va-off-white rounded-lg p-1">
                                  <button onClick={() => setSpotsDetail((prev) => ({ ...prev, [m.id]: Math.max(1, (prev[m.id] || 1) - 1) }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Minus size={12} /></button>
                                  <span className="text-[12px] font-bold text-primary">{spotsDetail[m.id] || 1}</span>
                                  <button onClick={() => setSpotsDetail((prev) => ({ ...prev, [m.id]: (prev[m.id] || 1) + 1 }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Plus size={12} /></button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                                  <VoiceglotText translationKey="common.duration" defaultText="Looptijd" />
                                </label>
                                <div className="flex items-center justify-between bg-va-off-white rounded-lg p-1">
                                  <button onClick={() => setYearsDetail((prev) => ({ ...prev, [m.id]: Math.max(1, (prev[m.id] || 1) - 1) }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Minus size={12} /></button>
                                  <span className="text-[12px] font-bold text-primary">{yearsDetail[m.id] || 1}j</span>
                                  <button onClick={() => setYearsDetail((prev) => ({ ...prev, [m.id]: (prev[m.id] || 1) + 1 }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Plus size={12} /></button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <label className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                    <VoiceglotText translationKey="common.word_count" defaultText="Hoeveelheid woorden" />
                  </label>
                  <div className="bg-white rounded-[24px] p-8 border border-black/5 shadow-aura space-y-8">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-medium text-va-black/40">
                        <VoiceglotText translationKey="common.volume" defaultText="Volume" />
                      </span>
                      <span className="text-xl font-bold text-primary">{calcWords} <VoiceglotText translationKey="common.words" defaultText="woorden" /></span>
                    </div>
                    <input 
                      type="range" 
                      min={calcUsage === 'telefonie' ? (pricingConfig?.telephonyWordThreshold || 25) : (pricingConfig?.videoWordThreshold || 200)} 
                      max={2000} 
                      value={calcWords} 
                      onChange={(e) => setCalcWords(parseInt(e.target.value))} 
                      className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                    <div className="flex items-center gap-4 bg-va-off-white rounded-2xl p-1.5 border border-black/5 max-w-xs mx-auto">
                      <button onClick={() => setCalcWords(Math.max(calcUsage === 'telefonie' ? (pricingConfig?.telephonyWordThreshold || 25) : (pricingConfig?.videoWordThreshold || 200), calcWords - 25))} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all text-va-black/40 shadow-sm">-</button>
                      <div className="flex-1 text-center font-bold text-primary">{calcWords}</div>
                      <button onClick={() => setCalcWords(calcWords + 25)} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all text-va-black/40 shadow-sm">+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-8 border-t border-black/5">
            <button onClick={handleNext} className="va-btn-pro !bg-va-black !text-white px-12 py-6 rounded-2xl text-lg flex items-center gap-3 shadow-aura-lg hover:scale-105 transition-all">
              <VoiceglotText translationKey="common.next_step" defaultText="Volgende stap" /> <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-8">
        <div className="p-10 bg-white/80 backdrop-blur-xl rounded-[30px] border border-white/20 shadow-aura">
          <div className="flex items-center justify-between mb-12"><h3 className="text-3xl font-light tracking-tight text-va-black"><VoiceglotText translationKey="launchpad.step2.title" defaultText="Jouw selectie" /></h3><Link href="/agency" className="text-primary text-[15px] font-light hover:underline tracking-widest uppercase"><VoiceglotText translationKey="launchpad.add_more" defaultText="+ Voeg meer toe" /></Link></div>
          {selectedActors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {selectedActors.map((actor) => (
                <div key={actor.id} className="relative group flex flex-col gap-3">
                  <div className="relative">
                    <VoiceCard voice={actor} hideButton compact hidePrice />
                    <button 
                      onClick={() => toggleActorSelection(actor)} 
                      className="absolute -top-3 -right-3 w-8 h-8 bg-white text-va-black/20 hover:text-red-500 rounded-full flex items-center justify-center shadow-lg border border-va-black/5 transition-all z-50"
                    >
                      <LucideX strokeWidth={1.5} size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-6"><Link href="/agency" className="inline-block bg-va-black text-white px-8 py-4 rounded-[10px] font-medium tracking-widest uppercase hover:scale-105 transition-all">Bekijk stemmen</Link></div>
          )}
          <div className="flex items-center justify-between pt-12 border-t border-black/5 mt-12">
            <button onClick={handleBack} className="flex items-center gap-2 px-8 py-4 rounded-xl border border-black/10 hover:bg-black/5 transition-all text-va-black/60 font-medium tracking-widest uppercase"><LucideArrowLeft size={16} /><VoiceglotText translationKey="common.previous" defaultText="Vorige" /></button>
            <button onClick={handleNext} className="va-btn-pro !bg-va-black !text-white px-12 py-6 rounded-2xl text-lg flex items-center gap-3 shadow-aura-lg hover:scale-105 transition-all"><VoiceglotText translationKey="common.next_step" defaultText="Volgende stap" /> <ArrowRight size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-8">
        <div className="p-10 bg-white/80 backdrop-blur-xl rounded-[30px] border border-white/20 shadow-aura">
          <div className="flex items-center justify-between mb-8"><h3 className="text-3xl font-light tracking-tight text-va-black"><VoiceglotText translationKey="launchpad.step3.title" defaultText="Het Script" /></h3><button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-primary text-[15px] font-light hover:opacity-80 transition-opacity tracking-widest uppercase">{isMatching ? <Loader2 size={16} className="animate-spin" /> : <LucideUpload size={16} strokeWidth={1.5} />}<VoiceglotText translationKey="launchpad.upload" defaultText={isMatching ? "Bezig..." : "Upload bestand"} /></button><input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) console.log('File uploaded:', file.name); }} accept=".pdf,.doc,.docx,.txt" /></div>
          <div className={cn("relative min-h-[320px] rounded-[20px] transition-all duration-500 overflow-hidden", isDragging ? "bg-primary/5 ring-2 ring-primary ring-inset scale-[0.99]" : "bg-va-off-white")} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleFileDrop}>
            <textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder={t('launchpad.placeholder.script', "Plak hier je tekst of sleep een bestand...")} className="w-full h-80 bg-transparent rounded-[20px] p-8 text-lg font-light leading-relaxed border-none focus:ring-2 focus:ring-primary/10 transition-all resize-none relative z-10" spellCheck={false} />
          </div>
          <div className="flex items-center justify-between pt-12 border-t border-black/5 mt-12">
            <button onClick={handleBack} className="flex items-center gap-2 px-8 py-4 rounded-xl border border-black/10 hover:bg-black/5 transition-all text-va-black/60 font-medium tracking-widest uppercase"><LucideArrowLeft size={16} /><VoiceglotText translationKey="common.previous" defaultText="Vorige" /></button>
            <button onClick={handleLaunch} disabled={isLaunching} className="va-btn-pro !bg-primary !text-white px-12 py-6 rounded-2xl text-lg flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
              {isLaunching ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              <VoiceglotText translationKey="launchpad.cta" defaultText="Ontvang gratis proefopnames" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-va-off-white min-h-screen pb-32 overflow-hidden">
      <LiquidBackground />
      <div className="pt-40 pb-12 relative z-10 max-w-5xl mx-auto px-6 text-center">
        <header className="max-w-4xl mx-auto">
          <h1 