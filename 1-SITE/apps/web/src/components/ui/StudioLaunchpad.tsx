"use client";

import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    InputInstrument,
    LabelInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LucideArrowLeft,
    LucideCheckCircle,
    LucideFileText,
    LucideMic,
    LucideUpload,
    LucideX,
    Loader2,
    ArrowRight,
    Globe,
    Radio,
    Tv,
    Mic2,
    Building2,
    Phone,
    Video,
    Megaphone,
    Sparkles,
    CheckCircle2,
    Minus,
    Plus
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';

import { VoiceCard } from '@/components/ui/VoiceCard';
import { LiquidBackground } from '@/components/ui/LiquidBackground';
import { CommercialMediaType, SlimmeKassa } from '@/lib/pricing-engine';

interface StudioLaunchpadProps {
  initialActors?: any[];
}

/**
 * STUDIO LAUNCHPAD (2026)
 * Voldoet aan het Voices Configurator Pattern.
 * Gebruikt de "Slimme Zwevende Kassa" logica voor projectinformatie.
 */
export const StudioLaunchpad = ({ initialActors = [] }: StudioLaunchpadProps) => {
  const { state, toggleActorSelection, removeActor } = useVoicesState();
  const selectedActors = state.selected_actors;
  const [currentStep, setCurrentStep] = useState(1);
  const [script, setScript] = useState('');
  const [projectName, setProjectName] = useState('');
  const [calcUsage, setCalcUsage] = useState<"telefonie" | "unpaid" | "paid">("paid");
  const [selectedMedia, setSelectedMedia] = useState<CommercialMediaType[]>(['online']);
  const [spotsDetail, setSpotsDetail] = useState<Record<string, number>>({});
  const [yearsDetail, setYearsDetail] = useState<Record<string, number>>({});
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [calcWords, setCalcWords] = useState(200);
  
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
  }, []);

  // Sync selectedMedia with calcUsage
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

  const handleNext = () => {
    if (currentStep === 1 && (!clientEmail || !projectName)) return;
    if (currentStep === 2 && selectedActors.length === 0) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunch = async () => {
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
          selectedActors: selectedActors.map(actor => ({ ...actor, note: actorNotes[actor.id] || '' })), 
          selectedVibe 
        })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('voices_proefopname_draft');
        router.push(`/casting/session/${data.sessionHash}`);
      } else {
        throw new Error(data.error || 'Fout bij het indienen');
      }
    } catch (err) {
      console.error('Launch error:', err);
      alert('Er is iets misgegaan bij het aanvragen. Probeer het later opnieuw.');
      setIsLaunching(false);
    }
  };

  const handleFileDrop = async (e: React.DragEvent) => {
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
  };

  const mediaOptions = [
    { id: 'online', label: 'Online & Socials', sub: 'YouTube, Meta, LinkedIn', icon: Globe },
    { id: 'podcast', label: 'Podcast', sub: 'Pre-roll, Mid-roll', icon: Mic2 },
    { id: 'radio_national', label: 'Radio', sub: 'Landelijke Radio', icon: Radio },
    { id: 'tv_national', label: 'TV', sub: 'Landelijke TV', icon: Tv }
  ];

  return (
    <SectionInstrument className="bg-va-off-white min-h-screen pb-32 overflow-hidden">
      <LiquidBackground strokeWidth={1.5} />
      <ContainerInstrument className="pt-40 pb-12 relative z-10 max-w-5xl mx-auto px-6 text-center">
        <header className="max-w-4xl mx-auto">
          <HeadingInstrument level={1} className="text-[8vw] lg:text-[80px] font-extralight tracking-tighter mb-8 leading-[0.85] text-va-black">
            <VoiceglotText translationKey="launchpad.title" defaultText="Gratis Proefopname" />
          </HeadingInstrument>
          <div className="h-[60px] flex items-center justify-center overflow-hidden">
            <TextInstrument className="text-xl lg:text-2xl text-va-black/40 font-light tracking-tight max-w-2xl mx-auto leading-tight">
              <VoiceglotText translationKey={`launchpad.subtitle.step${currentStep}`} defaultText={currentStep === 1 ? "Wat gaan we maken? Kies je projecttype en details." : currentStep === 2 ? "Bevestig je selectie van stemacteurs voor je proefopname." : "Geef je script en instructies door voor de proefopname."} />
            </TextInstrument>
          </div>
          <ContainerInstrument className="w-16 h-1 bg-primary/20 rounded-full mx-auto mt-6" />
        </header>
      </ContainerInstrument>

      <ContainerInstrument className="relative z-20 max-w-6xl mx-auto px-6 mb-12">
        <ContainerInstrument plain className="bg-white/50 border border-black/5 p-2 rounded-[32px] shadow-aura flex items-center gap-2 max-w-xl mx-auto">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <button key={step.id} onClick={() => { if (isCompleted || (isActive && currentStep > 1)) setCurrentStep(step.id); }} disabled={!isCompleted && !isActive} className={cn("flex-1 flex items-center justify-start gap-4 px-6 py-4 rounded-[28px] transition-all duration-500 relative overflow-hidden text-left group", isActive ? "text-white cursor-default" : isCompleted ? "text-primary hover:bg-primary/5" : "text-va-black/20 cursor-not-allowed")}>
                {isActive && <motion.div layoutId="activeStep" className="absolute inset-0 bg-va-black shadow-xl" style={{ borderRadius: 28 }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors relative z-10", isActive ? "border-primary bg-primary/10" : isCompleted ? "border-primary/20 bg-primary/5" : "border-black/5 bg-black/5")}>
                  {isCompleted ? <LucideCheckCircle size={14} strokeWidth={3} /> : <span className="text-[13px] font-bold tracking-tighter">0{step.id}</span>}
                </div>
                <div className="flex flex-col relative z-10 min-w-0">
                  <span className={cn("text-[12px] font-bold tracking-widest leading-none mb-1 uppercase truncate", isActive ? "text-white" : isCompleted ? "text-va-black" : "text-va-black/20")}>
                    <VoiceglotText translationKey={step.key} defaultText={step.title} />
                  </span>
                </div>
              </button>
            );
          })}
        </ContainerInstrument>
      </ContainerInstrument>

      <SectionInstrument className="py-4 relative z-10 max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
            {currentStep === 1 && (
              <div className="space-y-8">
                <ContainerInstrument className="p-10 bg-white/80 backdrop-blur-xl rounded-[30px] border border-white/20 shadow-aura space-y-12">
                  
                  {/* 1. Journey Selector (Pill Mandaat) */}
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
                        <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">Projectnaam</LabelInstrument>
                        <InputInstrument value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Bijv. Zomer Campagne 2026" className="w-full h-14 bg-va-off-white/50" />
                      </div>
                      <div className="space-y-3">
                        <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">E-mailadres</LabelInstrument>
                        <InputInstrument type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="naam@bedrijf.be" className="w-full h-14 bg-va-off-white/50" />
                      </div>
                    </div>

                    <div className="space-y-8">
                      {calcUsage === 'paid' ? (
                        /* 2. Media Detail Kaarten Mandaat (Vertical Stack) */
                        <div className="space-y-4">
                          <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">Selecteer Kanalen</LabelInstrument>
                          <div className="space-y-3">
                            {mediaOptions.map((m) => {
                              const isActive = selectedMedia.includes(m.id as any);
                              return (
                                <div key={m.id} className={cn(
                                  "p-4 rounded-2xl border-2 transition-all duration-500 bg-white",
                                  isActive ? "border-primary/20 shadow-aura-sm" : "border-black/5 opacity-60"
                                )}>
                                  <button
                                    onClick={() => setSelectedMedia(prev => prev.includes(m.id as any) ? (prev.length > 1 ? prev.filter(i => i !== m.id) : prev) : [...prev, m.id as any])}
                                    className="w-full flex items-center justify-between mb-3"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isActive ? "bg-primary text-white" : "bg-va-off-white text-va-black/20")}>
                                        <m.icon size={20} />
                                      </div>
                                      <div className="text-left">
                                        <div className="text-[14px] font-bold text-va-black">{m.label}</div>
                                        <div className="text-[11px] text-va-black/30 font-light">{m.sub}</div>
                                      </div>
                                    </div>
                                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isActive ? "bg-primary border-primary text-white" : "border-black/10")}>
                                      {isActive && <CheckCircle2 size={14} />}
                                    </div>
                                  </button>
                                  
                                  {isActive && (
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-black/5">
                                      <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-va-black/30 uppercase tracking-[0.2em]">Spots</label>
                                        <div className="flex items-center justify-between bg-va-off-white rounded-lg p-1">
                                          <button onClick={() => setSpotsDetail(prev => ({ ...prev, [m.id]: Math.max(1, (prev[m.id] || 1) - 1) }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Minus size={12} /></button>
                                          <span className="text-[12px] font-bold text-primary">{spotsDetail[m.id] || 1}</span>
                                          <button onClick={() => setSpotsDetail(prev => ({ ...prev, [m.id]: (prev[m.id] || 1) + 1 }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Plus size={12} /></button>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-va-black/30 uppercase tracking-[0.2em]">Looptijd</label>
                                        <div className="flex items-center justify-between bg-va-off-white rounded-lg p-1">
                                          <button onClick={() => setYearsDetail(prev => ({ ...prev, [m.id]: Math.max(1, (prev[m.id] || 1) - 1) }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Minus size={12} /></button>
                                          <span className="text-[12px] font-bold text-primary">{yearsDetail[m.id] || 1}j</span>
                                          <button onClick={() => setYearsDetail(prev => ({ ...prev, [m.id]: (prev[m.id] || 1) + 1 }))} className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary"><Plus size={12} /></button>
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
                        /* 3. Slider Mandaat */
                        <div className="space-y-6">
                          <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">Hoeveelheid woorden</LabelInstrument>
                          <div className="bg-white rounded-[24px] p-8 border border-black/5 shadow-aura space-y-8">
                            <div className="flex justify-between items-center">
                              <span className="text-[13px] font-medium text-va-black/40">Volume</span>
                              <span className="text-xl font-bold text-primary">{calcWords} woorden</span>
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
                    <ButtonInstrument variant="primary" onClick={handleNext} disabled={!clientEmail || !projectName} className="va-btn-pro !bg-va-black !text-white px-12 py-6 rounded-2xl text-lg flex items-center gap-3">
                      Volgende stap <ArrowRight size={20} />
                    </ButtonInstrument>
                  </div>
                </ContainerInstrument>
              </div>
            )}

            {currentStep === 2 && (
              <ContainerInstrument className="max-w-6xl mx-auto">
                <div className="flex flex-col gap-8">
                  <ContainerInstrument className="p-10 bg-white/80 backdrop-blur-xl rounded-[30px] border border-white/20 shadow-aura">
                    <div className="flex items-center justify-between mb-12"><HeadingInstrument level={3} className="text-3xl font-light tracking-tight text-va-black"><VoiceglotText translationKey="launchpad.step2.title" defaultText="Jouw selectie" /></HeadingInstrument><Link href="/agency" className="text-primary text-[15px] font-light hover:underline tracking-widest uppercase"><VoiceglotText translationKey="launchpad.add_more" defaultText="+ Voeg meer toe" /></Link></div>
                    {selectedActors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">{selectedActors.map((actor) => (<div key={actor.id} className="relative group flex flex-col gap-3"><div className="relative"><VoiceCard voice={actor} hideButton compact hidePrice /><button onClick={() => removeActor(actor)} className="absolute -top-3 -right-3 w-8 h-8 bg-white text-va-black/20 hover:text-red-500 rounded-full flex items-center justify-center shadow-lg border border-va-black/5 transition-all z-50"><LucideX strokeWidth={1.5} size={16} /></button></div></div>))}</div>
                    ) : (
                      <div className="py-20 text-center space-y-6"><Link href="/agency" className="inline-block bg-va-black text-white px-8 py-4 rounded-[10px] font-medium tracking-widest uppercase hover:scale-105 transition-all">Bekijk stemmen</Link></div>
                    )}
                    <div className="flex items-center justify-between pt-12 border-t border-black/5 mt-12">
                      <ButtonInstrument variant="outline" onClick={handleBack} className="gap-2"><LucideArrowLeft size={16} />Vorige</ButtonInstrument>
                      <ButtonInstrument variant="primary" onClick={handleNext} disabled={selectedActors.length === 0} className="va-btn-pro !bg-va-black !text-white px-12 py-6 rounded-2xl text-lg flex items-center gap-3">Volgende stap <ArrowRight size={20} /></ButtonInstrument>
                    </div>
                  </ContainerInstrument>
                </div>
              </ContainerInstrument>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <ContainerInstrument className="p-10 bg-white/80 backdrop-blur-xl rounded-[30px] border border-white/20 shadow-aura">
                    <div className="flex items-center justify-between mb-8"><HeadingInstrument level={3} className="text-3xl font-light tracking-tight text-va-black"><VoiceglotText translationKey="launchpad.step3.title" defaultText="Het Script" /></HeadingInstrument><button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-primary text-[15px] font-light hover:opacity-80 transition-opacity tracking-widest uppercase">{isMatching ? <Loader2 size={16} className="animate-spin" /> : <LucideUpload size={16} strokeWidth={1.5} />}<VoiceglotText translationKey="launchpad.upload" defaultText={isMatching ? "Bezig..." : "Upload bestand"} /></button><input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) console.log('File uploaded:', file.name); }} accept=".pdf,.doc,.docx,.txt" /></div>
                    <div className={cn("relative min-h-[320px] rounded-[20px] transition-all duration-500 overflow-hidden", isDragging ? "bg-primary/5 ring-2 ring-primary ring-inset scale-[0.99]" : "bg-va-off-white")} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleFileDrop}>
                      <textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder="Plak hier je tekst of sleep een bestand..." className="w-full h-80 bg-transparent rounded-[20px] p-8 text-lg font-light leading-relaxed border-none focus:ring-2 focus:ring-primary/10 transition-all resize-none relative z-10" spellCheck={false} />
                    </div>
                    <div className="flex items-center justify-between pt-12 border-t border-black/5 mt-12">
                      <ButtonInstrument variant="outline" onClick={handleBack} className="gap-2"><LucideArrowLeft size={16} />Vorige</ButtonInstrument>
                      <ButtonInstrument variant="primary" onClick={handleLaunch} disabled={isLaunching || !script} className="va-btn-pro !bg-primary !text-white px-12 py-6 rounded-2xl text-lg flex items-center gap-3 shadow-xl shadow-primary/20">
                        {isLaunching ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        Ontvang gratis proefopnames
                      </ButtonInstrument>
                    </div>
                  </ContainerInstrument>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </SectionInstrument>
    </SectionInstrument>
  );
};
