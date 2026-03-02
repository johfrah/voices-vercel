"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { ContainerInstrument, HeadingInstrument, SectionInstrument, TextInstrument, ButtonInstrument, InputInstrument } from '@/components/ui/LayoutInstruments';
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
import { VoicesLinkInstrument as Link } from '@/components/ui/VoicesLinkInstrument';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { VoiceCard } from '@/components/ui/VoiceCardInstrument';
import dynamic from 'next/dynamic';

const LiquidBackground = dynamic(() => import('@/components/ui/LiquidBackgroundInstrument').then((mod) => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <ContainerInstrument plain className="fixed inset-0 bg-va-off-white" />
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
  }, [calcUsage, pricingConfig]);

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
  }, [script, projectName, clientName, clientCompany, clientEmail, selectedMedia, spotsDetail, yearsDetail, calcWords, deadline, selectedActors, actorNotes, selectedVibe, t, router]);

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
    <ContainerInstrument className="max-w-6xl mx-auto">
      <ContainerInstrument className="space-y-8">
        <ContainerInstrument className="p-10 bg-white/80 backdrop-blur-xl rounded-[30px] border border-white/20 shadow-aura space-y-12">
          <ContainerInstrument className="flex justify-center">
            <ContainerInstrument className="flex p-1 bg-va-off-white rounded-2xl border border-black/5 shadow-inner">
              {[
                { id: 'telefonie', label: 'Telefoon', icon: Phone },
                { id: 'unpaid', label: 'Video', icon: Video },
                { id: 'paid', label: 'Advertentie', icon: Megaphone }
              ].map((u) => (
                <ButtonInstrument 
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
                </ButtonInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ContainerInstrument className="space-y-8">
              <ContainerInstrument className="space-y-3">
                <TextInstrument as="label" className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                  <VoiceglotText translationKey="common.project_name" defaultText="Projectnaam" />
                </TextInstrument>
                <InputInstrument value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder={t('launchpad.placeholder.project', "Bijv. Zomer Campagne 2026")} className="w-full h-14 bg-va-off-white/50" />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-3">
                <TextInstrument as="label" className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                  <VoiceglotText translationKey="common.email" defaultText="E-mailadres" />
                </TextInstrument>
                <InputInstrument type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder={t('common.placeholder.email', "naam@bedrijf.be")} className="w-full h-14 bg-va-off-white/50" />
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="space-y-8">
              {calcUsage === 'paid' ? (
                <ContainerInstrument className="space-y-4">
                  <TextInstrument as="label" className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                    <VoiceglotText translationKey="common.select_channels" defaultText="Selecteer Kanalen" />
                  </TextInstrument>
                  <ContainerInstrument className="space-y-3">
                    {mediaOptions.map((m) => {
                      const isActive = selectedMedia.includes(m.id as any);
                      return (
                        <ContainerInstrument key={m.id} className={cn(
                          "p-4 rounded-2xl border-2 transition-all duration-500 bg-white",
                          isActive ? "border-primary/20 shadow-aura-sm" : "border-black/5 opacity-60"
                        )}>
                          <ButtonInstrument
                            onClick={() => setSelectedMedia((prev) => prev.includes(m.id as any) ? (prev.length > 1 ? prev.filter((i) => i !== m.id) : prev) : [...prev, m.id as any])}
                            className="w-full flex items-center justify-between mb-3"
                          >
                            <ContainerInstrument className="flex items-center gap-4">
                              <ContainerInstrument className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isActive ? "bg-primary text-white" : "bg-va-off-white text-va-black/20")}>
                                <m.icon size={20} />
                              </ContainerInstrument>
                              <ContainerInstrument className="text-left">
                                <TextInstrument className="text-[14px] font-bold text-va-black">
                                  <VoiceglotText translationKey={`common.media.${m.id}`} defaultText={m.label} />
                                </TextInstrument>
                                <TextInstrument className="text-[11px] text-va-black/30 font-light">
                                  <VoiceglotText translationKey={`common.media.${m.id}.desc`} defaultText={m.sub} />
                                </TextInstrument>
                              </ContainerInstrument>
                            </ContainerInstrument>
                            <ContainerInstrument className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isActive ? "bg-primary border-primary text-white" : "border-black/10")}>
                              {isActive && <CheckCircle2 size={14} />}
                            </ContainerInstrument>
                          </ButtonInstrument>
                          
                          {isActive && (
                            <ContainerInstrument className="grid grid-cols-2 gap-4 pt-3 border-t border-black/5">
                              <ContainerInstrument className="space-y-2">
                                <TextInstrument as="label" className="text-[9px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                                  <VoiceglotText translationKey="common.spots" defaultText="Spots" />
                                </TextInstrument>
                                <ContainerInstrument className="flex items-center justify-between bg-va-off-white rounded-lg p-1">
                                  <ButtonInstrument onClick={() => setSpotsDetail((prev) => ({ ...prev, [m.id]: Math.max(1, (prev[m.id] || 1) - 1) }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Minus size={12} /></ButtonInstrument>
                                  <TextInstrument className="text-[12px] font-bold text-primary">{spotsDetail[m.id] || 1}</TextInstrument>
                                  <ButtonInstrument onClick={() => setSpotsDetail((prev) => ({ ...prev, [m.id]: (prev[m.id] || 1) + 1 }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Plus size={12} /></ButtonInstrument>
                                </ContainerInstrument>
                              </ContainerInstrument>
                              <ContainerInstrument className="space-y-2">
                                <TextInstrument as="label" className="text-[9px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                                  <VoiceglotText translationKey="common.duration" defaultText="Looptijd" />
                                </TextInstrument>
                                <ContainerInstrument className="flex items-center justify-between bg-va-off-white rounded-lg p-1">
                                  <ButtonInstrument onClick={() => setYearsDetail((prev) => ({ ...prev, [m.id]: Math.max(1, (prev[m.id] || 1) - 1) }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Minus size={12} /></ButtonInstrument>
                                  <TextInstrument className="text-[12px] font-bold text-primary">{yearsDetail[m.id] || 1}j</TextInstrument>
                                  <ButtonInstrument onClick={() => setYearsDetail((prev) => ({ ...prev, [m.id]: (prev[m.id] || 1) + 1 }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Plus size={12} /></ButtonInstrument>
                                </ContainerInstrument>
                              </ContainerInstrument>
                            </ContainerInstrument>
                          )}
                        </ContainerInstrument>
                      );
                    })}
                  </ContainerInstrument>
                </ContainerInstrument>
              ) : (
                <ContainerInstrument className="space-y-6">
                  <TextInstrument as="label" className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                    <VoiceglotText translationKey="common.word_count" defaultText="Hoeveelheid woorden" />
                  </TextInstrument>
                  <ContainerInstrument className="bg-white rounded-[24px] p-8 border border-black/5 shadow-aura space-y-8">
                    <ContainerInstrument className="flex justify-between items-center">
                      <TextInstrument className="text-[13px] font-medium text-va-black/40">
                        <VoiceglotText translationKey="common.volume" defaultText="Volume" />
                      </TextInstrument>
                      <TextInstrument className="text-xl font-bold text-primary">{calcWords} <VoiceglotText translationKey="common.words" defaultText="woorden" /></TextInstrument>
                    </ContainerInstrument>
                    <InputInstrument 
                      type="range" 
                      min={calcUsage === 'telefonie' ? (pricingConfig?.telephonyWordThreshold || 25) : (pricingConfig?.videoWordThreshold || 200)} 
                      max={2000} 
                      value={calcWords} 
                      onChange={(e) => setCalcWords(parseInt(e.target.value))} 
                      className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-primary p-0" 
                    />
                    <ContainerInstrument className="flex items-center gap-4 bg-va-off-white rounded-2xl p-1.5 border border-black/5 max-w-xs mx-auto">
                      <ButtonInstrument onClick={() => setCalcWords(Math.max(calcUsage === 'telefonie' ? (pricingConfig?.telephonyWordThreshold || 25) : (pricingConfig?.videoWordThreshold || 200), calcWords - 25))} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all text-va-black/40 shadow-sm">-</ButtonInstrument>
                      <TextInstrument className="flex-1 text-center font-bold text-primary">{calcWords}</TextInstrument>
                      <ButtonInstrument onClick={() => setCalcWords(calcWords + 25)} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all text-va-black/40 shadow-sm">+</ButtonInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="flex justify-end pt-8 border-t border-black/5">
            <ButtonInstrument onClick={handleNext} className="va-btn-pro !bg-va-black !text-white px-12 py-6 rounded-2xl text-lg flex items-center gap-3 shadow-aura-lg hover:scale-105 transition-all">
              <VoiceglotText translationKey="common.next_step" defaultText="Volgende stap" /> <ArrowRight size={20} />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );

  const renderStep2 = () => (
    <ContainerInstrument className="max-w-6xl mx-auto">
      <ContainerInstrument className="flex flex-col gap-8">
        <ContainerInstrument className="p-10 bg-white/80 backdrop-blur-xl rounded-[30px] border border-white/20 shadow-aura">
          <ContainerInstrument className="flex items-center justify-between mb-12">
            <HeadingInstrument level={3} className="text-3xl font-light tracking-tight text-va-black">
              <VoiceglotText translationKey="launchpad.step2.title" defaultText="Jouw selectie" />
            </HeadingInstrument>
            <Link href="/agency" className="text-primary text-[15px] font-light hover:underline tracking-widest uppercase">
              <VoiceglotText translationKey="launchpad.add_more" defaultText="+ Voeg meer toe" />
            </Link>
          </ContainerInstrument>
          {selectedActors.length > 0 ? (
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {selectedActors.map((actor) => (
                <ContainerInstrument key={actor.id} className="relative group flex flex-col gap-3">
                  <ContainerInstrument className="relative">
                    <VoiceCard voice={actor} hideButton compact hidePrice />
                    <ButtonInstrument 
                      onClick={() => toggleActorSelection(actor)} 
                      className="absolute -top-3 -right-3 w-8 h-8 bg-white text-va-black/20 hover:text-red-500 rounded-full flex items-center justify-center shadow-lg border border-va-black/5 transition-all z-50"
                    >
                      <LucideX strokeWidth={1.5} size={16} />
                    </ButtonInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          ) : (
            <ContainerInstrument className="py-20 text-center space-y-6">
              <ButtonInstrument as={Link} href="/agency" className="inline-block bg-va-black text-white px-8 py-4 rounded-[10px] font-medium tracking-widest uppercase hover:scale-105 transition-all">
                Bekijk stemmen
              </ButtonInstrument>
            </ContainerInstrument>
          )}
          <ContainerInstrument className="flex items-center justify-between pt-12 border-t border-black/5 mt-12">
            <ButtonInstrument onClick={handleBack} className="flex items-center gap-2 px-8 py-4 rounded-xl border border-black/10 hover:bg-black/5 transition-all text-va-black/60 font-medium tracking-widest uppercase">
              <LucideArrowLeft size={16} />
              <VoiceglotText translationKey="common.previous" defaultText="Vorige" />
            </ButtonInstrument>
            <ButtonInstrument onClick={handleNext} className="va-btn-pro !bg-va-black !text-white px-12 py-6 rounded-2xl text-lg flex items-center gap-3 shadow-aura-lg hover:scale-105 transition-all">
              <VoiceglotText translationKey="common.next_step" defaultText="Volgende stap" /> <ArrowRight size={20} />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );

  const renderStep3 = () => (
    <ContainerInstrument className="max-w-6xl mx-auto">
      <ContainerInstrument className="flex flex-col gap-8">
        <ContainerInstrument className="p-10 bg-white/80 backdrop-blur-xl rounded-[30px] border border-white/20 shadow-aura">
          <ContainerInstrument className="flex items-center justify-between mb-8">
            <HeadingInstrument level={3} className="text-3xl font-light tracking-tight text-va-black">
              <VoiceglotText translationKey="launchpad.step3.title" defaultText="Het Script" />
            </HeadingInstrument>
            <ButtonInstrument onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-primary text-[15px] font-light hover:opacity-80 transition-opacity tracking-widest uppercase">
              {isMatching ? <Loader2 size={16} className="animate-spin" /> : <LucideUpload size={16} strokeWidth={1.5} />}
              <VoiceglotText translationKey="launchpad.upload" defaultText={isMatching ? "Bezig..." : "Upload bestand"} />
            </ButtonInstrument>
            <InputInstrument type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) console.log('File uploaded:', file.name); }} accept=".pdf,.doc,.docx,.txt" />
          </ContainerInstrument>
          <ContainerInstrument className={cn("relative min-h-[320px] rounded-[20px] transition-all duration-500 overflow-hidden", isDragging ? "bg-primary/5 ring-2 ring-primary ring-inset scale-[0.99]" : "bg-va-off-white")} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleFileDrop}>
            <textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder={t('launchpad.placeholder.script', "Plak hier je tekst of sleep een bestand...")} className="w-full h-80 bg-transparent rounded-[20px] p-8 text-lg font-light leading-relaxed border-none focus:ring-2 focus:ring-primary/10 transition-all resize-none relative z-10" spellCheck={false} />
          </ContainerInstrument>
          <ContainerInstrument className="flex items-center justify-between pt-12 border-t border-black/5 mt-12">
            <ButtonInstrument onClick={handleBack} className="flex items-center gap-2 px-8 py-4 rounded-xl border border-black/10 hover:bg-black/5 transition-all text-va-black/60 font-medium tracking-widest uppercase">
              <LucideArrowLeft size={16} />
              <VoiceglotText translationKey="common.previous" defaultText="Vorige" />
            </ButtonInstrument>
            <ButtonInstrument onClick={handleLaunch} disabled={isLaunching} className="va-btn-pro !bg-primary !text-white px-12 py-6 rounded-2xl text-lg flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
              {isLaunching ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              <VoiceglotText translationKey="launchpad.cta" defaultText="Ontvang gratis proefopnames" />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );

  return (
    <ContainerInstrument className="bg-va-off-white min-h-screen pb-32 overflow-hidden">
      <LiquidBackground />
      <ContainerInstrument className="pt-40 pb-12 relative z-10 max-w-5xl mx-auto px-6 text-center">
        <ContainerInstrument as="header" className="max-w-4xl mx-auto">
          <HeadingInstrument level={1} className="text-[8vw] lg:text-[80px] font-extralight tracking-tighter mb-8 leading-[0.85] text-va-black">
            <VoiceglotText translationKey="launchpad.title" defaultText="Gratis Proefopname" />
          </HeadingInstrument>
          <ContainerInstrument className="h-[60px] flex items-center justify-center overflow-hidden">
            <TextInstrument className="text-xl lg:text-2xl text-va-black/40 font-light tracking-tight max-w-2xl mx-auto leading-tight">
              <VoiceglotText translationKey={`launchpad.subtitle.step${currentStep}`} defaultText={currentStep === 1 ? "Wat gaan we maken? Kies je projecttype en details." : currentStep === 2 ? "Bevestig je selectie van stemacteurs voor je proefopname." : "Geef je script en instructies door voor de proefopname."} />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="w-16 h-1 bg-primary/20 rounded-full mx-auto mt-6" />
        </ContainerInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="relative z-20 max-w-6xl mx-auto px-6 mb-12">
        <ContainerInstrument className="bg-white/50 border border-black/5 p-2 rounded-[32px] shadow-aura flex items-center gap-2 max-w-xl mx-auto">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <ButtonInstrument key={step.id} onClick={() => { if (isCompleted || (isActive && currentStep > 1)) setCurrentStep(step.id); }} disabled={!isCompleted && !isActive} className={cn("flex-1 flex items-center justify-start gap-4 px-6 py-4 rounded-[28px] transition-all duration-500 relative overflow-hidden text-left group", isActive ? "text-white cursor-default" : isCompleted ? "text-primary hover:bg-primary/5" : "text-va-black/20 cursor-not-allowed")}>
                {isActive && <motion.div layoutId="activeStep" className="absolute inset-0 bg-va-black shadow-xl" style={{ borderRadius: 28 }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                <ContainerInstrument className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors relative z-10", isActive ? "border-primary bg-primary/10" : isCompleted ? "border-primary/20 bg-primary/5" : "border-black/5 bg-black/5")}>
                  {isCompleted ? <LucideCheckCircle size={14} strokeWidth={3} /> : <TextInstrument className="text-[13px] font-bold tracking-tighter">0{step.id}</TextInstrument>}
                </ContainerInstrument>
                <ContainerInstrument className="flex flex-col relative z-10 min-w-0">
                  <TextInstrument as="span" className={cn("text-[12px] font-bold tracking-widest leading-none mb-1 uppercase truncate", isActive ? "text-white" : isCompleted ? "text-va-black" : "text-va-black/20")}>
                    <VoiceglotText translationKey={step.key} defaultText={step.title} />
                  </TextInstrument>
                </ContainerInstrument>
              </ButtonInstrument>
            );
          })}
        </ContainerInstrument>
      </ContainerInstrument>

      <SectionInstrument className="py-4 relative z-10 max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </motion.div>
        </AnimatePresence>
      </SectionInstrument>
    </ContainerInstrument>
  );
}
