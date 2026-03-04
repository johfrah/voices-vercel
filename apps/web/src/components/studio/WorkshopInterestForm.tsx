'use client';

import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    InputInstrument,
    LabelInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowRight, Check, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

const VIDEO_TEASER_SRC = 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/studio/workshops/videos/workshop_studio_teaser.mp4';
const VIDEO_POSTER = 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/assets/visuals/branding/branding-branding-photo-horizontal-1.webp';

const SuccessVideoPlayer = dynamic(
  () => import('@/components/ui/VideoPlayer').then(mod => mod.VideoPlayer),
  { ssr: false, loading: () => <div className="w-full aspect-video rounded-[20px] bg-va-black/5 animate-pulse" /> }
);
const SuccessWorkshopCalendar = dynamic(
  () => import('@/components/studio/WorkshopCalendar').then(mod => mod.WorkshopCalendar),
  { ssr: false, loading: () => <div className="h-[320px] rounded-[20px] bg-va-off-white/50 animate-pulse" /> }
);

export const WorkshopInterestForm: React.FC = () => {
  const { t } = useTranslation();
  const { playClick } = useSonicDNA();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [skills, setSkills] = useState<{ id: number; slug: string; label_nl: string }[]>([]);
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitErrorRef = useRef<HTMLDivElement | null>(null);
  const [successWorkshops, setSuccessWorkshops] = useState<any[]>([]);

  // Scroll naar foutmelding zodra die verschijnt (gebruiker ziet wat er misging)
  useEffect(() => {
    if (submitError && submitErrorRef.current && typeof window !== 'undefined') {
      submitErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [submitError]);

  // 🛡️ CHRIS-PROTOCOL: Pre-select workshop from URL parameter (ID-First)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const workshopId = params.get('workshopId');
    if (workshopId) {
      setSelectedWorkshops(prev => prev.includes(workshopId) ? prev : [...prev, workshopId]);
    }
  }, []);

  // 🛡️ CHRIS-PROTOCOL: Workshops uitsluitend van Studio API (Source of Truth, geen hardcoded fallback)
  const fetchWorkshops = React.useCallback(async () => {
    setFetchError(null);
    setIsFetching(true);
    try {
      const res = await fetch('/api/studio/workshops/');
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data?.message || 'Kon workshops niet laden.');
        setWorkshops([]);
        return;
      }
      if (data.workshops && data.workshops.length > 0) {
        setWorkshops(data.workshops.map((w: { id: number | string; title: string }) => ({
          id: String(w.id),
          title: w.title ?? ''
        })));
      } else {
        setWorkshops([]);
      }
      setSkills(Array.isArray(data.skills) ? data.skills.filter((s: any) => s && (s.slug != null || s.id != null)) : []);
    } catch {
      setFetchError('Kon workshops niet laden. Probeer de pagina te vernieuwen.');
      setWorkshops([]);
      setSkills([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  // Na succes: haal workshops op voor de kalender (met editions)
  useEffect(() => {
    if (!isSubmitted) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/studio/workshops/');
        const data = await res.json();
        if (cancelled || !res.ok) return;
        const list = Array.isArray(data.workshops) ? data.workshops : [];
        setSuccessWorkshops(list.map((w: any) => ({
          ...w,
          editions: w.upcoming_editions || w.editions || []
        })));
      } catch {
        // Kalender toont leeg of placeholder
      }
    })();
    return () => { cancelled = true; };
  }, [isSubmitted]);

  // Anna: na succes naar boven scrollen zodat bedankview direct zichtbaar is
  useEffect(() => {
    if (isSubmitted && typeof window !== 'undefined') {
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }, [isSubmitted]);

  const toggleWorkshop = (id: string) => {
    setSelectedWorkshops(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profession: '',
    age: '',
    experience: '',
    goal: '',
    expectations: '',
    preferred_dates: '',
    how_heard: ''
  });

  const toggleSkill = (key: string) => {
    setSelectedSkills(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    playClick('light');
    setStep(2);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsLoading(true);
    playClick('light');

    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (v2.27.1)
    const handshake = typeof window !== 'undefined' ? (window as any).handshakeContext : null;
    const worldId = handshake?.worldId || 2;

    try {
      const res = await fetch('/api/studio/workshop-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || undefined,
          selectedWorkshops,
          skills_to_sharpen: selectedSkills.length > 0 ? selectedSkills : undefined,
          profession: formData.profession || undefined,
          age: formData.age || undefined,
          experience: formData.experience || undefined,
          goal: formData.goal || undefined,
          expectations: formData.expectations || undefined,
          preferred_dates: formData.preferred_dates || undefined,
          how_heard: formData.how_heard || undefined,
          worldId // 🛡️ Link to World
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || t('common.error.submit_failed', 'Versturen mislukt'));
      }
      setIsSubmitted(true);
    } catch (err) {
      playClick('error');
      setSubmitError(err instanceof Error ? err.message : t('common.error.generic', 'Er is iets misgegaan. Probeer het later opnieuw.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <ContainerInstrument className="max-w-6xl mx-auto py-12 sm:py-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Links: video zoals op de Studio-frontpage */}
          <div className="relative group animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="absolute -inset-2 bg-primary/5 rounded-[24px] blur-xl group-hover:bg-primary/10 transition-all duration-500" />
            <SuccessVideoPlayer
              src={VIDEO_TEASER_SRC}
              poster={VIDEO_POSTER}
              className="w-full aspect-video rounded-[20px] shadow-aura-lg border border-black/5 relative z-10"
              autoPlay={false}
              muted={false}
            />
          </div>

          {/* Rechts: bedankbericht + kalender */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
            <div className="flex flex-col items-start text-left">
              <ContainerInstrument className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500/10 text-green-500 rounded-[20px] flex items-center justify-center mb-6">
                <Check size={28} strokeWidth={2} className="sm:w-8 sm:h-8" />
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-3xl sm:text-4xl font-light tracking-tighter text-va-black mb-4">
                <VoiceglotText translationKey="workshop.interest.success.title" defaultText="Bedankt!" />
              </HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/60 font-light leading-relaxed max-w-md">
                <VoiceglotText translationKey="workshop.interest.success.text" defaultText="We hebben je interesse ontvangen. Johfrah neemt binnenkort contact met je op." />
              </TextInstrument>
              <ButtonInstrument as={Link} href="/studio" className="mt-6 va-btn-pro group min-h-[48px]">
                <VoiceglotText translationKey="workshop.interest.success.cta" defaultText="Bekijk workshops" />
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </ButtonInstrument>
            </div>

            {/* Kalender of lege staat (Berny) */}
            <div className="rounded-[20px] border border-black/[0.06] bg-white/80 backdrop-blur-sm p-6 shadow-sm">
              {successWorkshops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <TextInstrument className="text-[13px] font-bold text-va-black/40 uppercase tracking-widest mb-2">
                    <VoiceglotText translationKey="studio.calendar.title" defaultText="Workshop kalender" />
                  </TextInstrument>
                  <TextInstrument className="text-[15px] font-light text-va-black/50 max-w-xs">
                    <VoiceglotText translationKey="studio.calendar.empty_after_submit" defaultText="Binnenkort komen er nieuwe data. We houden je op de hoogte." />
                  </TextInstrument>
                  <ButtonInstrument as={Link} href="/studio" variant="outline" className="mt-6 min-h-[44px]">
                    <VoiceglotText translationKey="workshop.interest.success.cta" defaultText="Bekijk workshops" />
                  </ButtonInstrument>
                </div>
              ) : (
                <SuccessWorkshopCalendar workshops={successWorkshops} />
              )}
            </div>
          </div>
        </div>
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument className="max-w-4xl mx-auto space-y-10 sm:space-y-12 px-4 sm:px-6">
      {/* STAPPEN INDICATOR */}
      <ContainerInstrument className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
        <ContainerInstrument className={cn("h-1 rounded-[10px] transition-all duration-100", step === 1 ? "bg-primary w-8" : "bg-black/10 w-2")} />
        <ContainerInstrument className={cn("h-1 rounded-[10px] transition-all duration-100", step === 2 ? "bg-primary w-8" : "bg-black/10 w-2")} />
      </ContainerInstrument>

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Workshop Selection */}
          <ContainerInstrument className="space-y-6">
            <ContainerInstrument className="flex items-center gap-3 mb-6 sm:mb-8">
              <Info size={24} strokeWidth={1.5} className="text-va-black/40" />
              <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">
                <VoiceglotText  translationKey="workshop.interest.title" defaultText="Voor welke workshop(s) heb je interesse?" />
              </HeadingInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" role="list" aria-label={t('workshop.interest.list_label', 'Workshops')}>
              {isFetching ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-va-black/5 rounded-[20px] animate-pulse" />
                ))
              ) : fetchError ? (
                <ContainerInstrument className="md:col-span-2 flex flex-col items-center gap-4 p-6 rounded-[20px] bg-va-black/5">
                  <TextInstrument className="text-[15px] font-light text-va-black/70 text-center">{fetchError}</TextInstrument>
                  <ButtonInstrument type="button" onClick={() => { playClick('light'); fetchWorkshops(); }} variant="outline" size="sm">
                    <VoiceglotText translationKey="common.retry" defaultText="Opnieuw proberen" />
                  </ButtonInstrument>
                </ContainerInstrument>
              ) : workshops.length === 0 ? (
                <ContainerInstrument className="md:col-span-2 p-6 rounded-[20px] bg-va-black/5">
                  <TextInstrument className="text-[15px] font-light text-va-black/60">
                    <VoiceglotText translationKey="workshop.interest.no_workshops" defaultText="Er zijn momenteel geen workshops beschikbaar." />
                  </TextInstrument>
                </ContainerInstrument>
              ) : (
                workshops.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => { playClick('light'); toggleWorkshop(w.id); }}
                    className={cn(
                      "p-5 sm:p-6 rounded-[20px] border-2 transition-all duration-100 text-left flex items-center justify-between group min-h-[56px] active:scale-[0.99]",
                      selectedWorkshops.includes(w.id)
                        ? "bg-black border-black text-white shadow-aura scale-[1.01]"
                        : "bg-white border-black/5 text-va-black hover:border-primary/30"
                    )}
                  >
                    <TextInstrument className="font-light text-[15px] tracking-tight">
                      <VoiceglotText translationKey={`workshop.${w.id}.title`} defaultText={w.title} noTranslate={true} />
                    </TextInstrument>
                    <ContainerInstrument className={cn(
                      "w-6 h-6 rounded-[10px] border-2 flex items-center justify-center shrink-0 transition-all duration-100",
                      selectedWorkshops.includes(w.id)
                        ? "bg-primary border-primary"
                        : "border-black/10 group-hover:border-primary/30"
                    )}>
                      {selectedWorkshops.includes(w.id) && <Check size={14} strokeWidth={3} className="text-white" />}
                    </ContainerInstrument>
                  </button>
                ))
              )}
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Basic Info */}
          <ContainerInstrument className="pt-10 sm:pt-12 border-t border-black/5 space-y-6 sm:space-y-8">
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <ContainerInstrument className="space-y-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText  translationKey="common.first_name" defaultText="Voornaam" /></LabelInstrument>
                <InputInstrument 
                  required 
                  placeholder={t('common.placeholder.first_name', 'Jouw voornaam')} 
                  className="w-full min-h-[48px] px-4 text-[16px] rounded-xl"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText  translationKey="common.last_name" defaultText="Familienaam" /></LabelInstrument>
                <InputInstrument 
                  required 
                  placeholder={t('common.placeholder.last_name', 'Jouw familienaam')} 
                  className="w-full min-h-[48px] px-4 text-[16px] rounded-xl"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText  translationKey="common.email" defaultText="E-mailadres" /></LabelInstrument>
                <InputInstrument 
                  required 
                  type="email" 
                  placeholder={t('common.placeholder.email', 'naam@voorbeeld.be')} 
                  className="w-full min-h-[48px] px-4 text-[16px] rounded-xl"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText translationKey="common.phone" defaultText="Telefoonnummer" /></LabelInstrument>
                <InputInstrument 
                  type="tel" 
                  placeholder={t('common.placeholder.phone', 'Optioneel')} 
                  className="w-full min-h-[48px] px-4 text-[16px] rounded-xl"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </ContainerInstrument>
            </ContainerInstrument>

            <ButtonInstrument
              type="submit"
              disabled={isFetching || workshops.length === 0 || selectedWorkshops.length === 0 || !formData.email}
              className="w-full py-5 sm:py-6 rounded-[10px] bg-black text-white font-light tracking-tight text-[15px] hover:bg-primary transition-all duration-100 shadow-aura flex items-center justify-center gap-3 group min-h-[52px] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
            >
              <VoiceglotText  translationKey="common.next_step" defaultText="Volgende stap" />
              <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-100" />
            </ButtonInstrument>
          </ContainerInstrument>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
          {submitError && (
            <ContainerInstrument
              ref={(el) => { submitErrorRef.current = el as HTMLDivElement | null; }}
              className="flex items-center gap-3 p-4 rounded-[10px] bg-red-500/10 text-red-600 border border-red-500/20"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={20} strokeWidth={1.5} className="shrink-0" />
              <TextInstrument className="text-[15px] font-light">{submitError}</TextInstrument>
            </ContainerInstrument>
          )}
          <ContainerInstrument className="space-y-6">
            <ContainerInstrument className="flex items-center gap-3 mb-6 sm:mb-8">
              <Info size={24} strokeWidth={1.5} className="text-va-black/40" />
              <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">
                <VoiceglotText  translationKey="workshop.interest.step2.title" defaultText="Help ons je beter te leren kennen" />
              </HeadingInstrument>
            </ContainerInstrument>

            {/* 1. Context: wie ben je, wat is je niveau */}
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <ContainerInstrument className="space-y-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText  translationKey="common.profession" defaultText="Beroep" /></LabelInstrument>
                <InputInstrument 
                  placeholder={t('common.placeholder.profession', 'Wat doe je in het dagelijks leven?')} 
                  className="w-full min-h-[48px] px-4 text-[16px] rounded-xl"
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText  translationKey="common.age" defaultText="Leeftijd" /></LabelInstrument>
                <InputInstrument 
                  type="number" 
                  placeholder={t('common.placeholder.age', 'Je leeftijd')} 
                  className="w-full min-h-[48px] px-4 text-[16px] rounded-xl"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText  translationKey="common.experience" defaultText="Ervaring met stemwerk" /></LabelInstrument>
                <select 
                  className="w-full min-h-[48px] px-4 text-[16px] rounded-xl bg-white border border-black/10 outline-none focus:border-primary transition-all duration-100"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                >
                  <option value="">{t('common.choose_level', 'Kies je niveau...')}</option>
                  <option value="beginner">{t('common.level.beginner', 'Beginner (geen ervaring)')}</option>
                  <option value="intermediate">{t('common.level.intermediate', 'Enige ervaring (hobby/amateur)')}</option>
                  <option value="pro">{t('common.level.pro', 'Professional')}</option>
                </select>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText  translationKey="common.goal" defaultText="Wat is je doel?" /></LabelInstrument>
                <textarea 
                  rows={3}
                  placeholder={t('common.placeholder.goal', 'Wat hoop je te bereiken met deze workshop?')} 
                  className="w-full min-h-[100px] px-4 py-4 text-[16px] rounded-xl bg-white border border-black/10 outline-none focus:border-primary transition-all duration-100 resize-none"
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText translationKey="workshop.interest.expectations_label" defaultText="Wat zijn je verwachtingen?" /></LabelInstrument>
                <textarea 
                  rows={3}
                  placeholder={t('workshop.interest.expectations_placeholder', 'Waar kijk je het meest naar uit? Wat wil je zeker meenemen?')} 
                  className="w-full min-h-[100px] px-4 py-4 text-[16px] rounded-xl bg-white border border-black/10 outline-none focus:border-primary transition-all duration-100 resize-none"
                  value={formData.expectations}
                  onChange={(e) => setFormData({...formData, expectations: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText translationKey="workshop.interest.preferred_dates_label" defaultText="Voorkeursdata" /></LabelInstrument>
                <InputInstrument 
                  placeholder={t('workshop.interest.preferred_dates_placeholder', 'Optioneel: geef een datum of periode op die jou schikt')} 
                  className="w-full min-h-[48px] px-4 text-[16px] rounded-xl"
                  value={formData.preferred_dates}
                  onChange={(e) => setFormData({...formData, preferred_dates: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1"><VoiceglotText translationKey="workshop.interest.how_heard_label" defaultText="Hoe heb je ons gehoord?" /></LabelInstrument>
                <select 
                  className="w-full min-h-[48px] px-4 text-[16px] rounded-xl bg-white border border-black/10 outline-none focus:border-primary transition-all duration-100"
                  value={formData.how_heard}
                  onChange={(e) => setFormData({...formData, how_heard: e.target.value})}
                >
                  <option value="">{t('common.choose', 'Kies...')}</option>
                  <option value="social">{t('workshop.interest.how_heard.social', 'Sociale media')}</option>
                  <option value="search">{t('workshop.interest.how_heard.search', 'Zoekmachine')}</option>
                  <option value="friend">{t('workshop.interest.how_heard.friend', 'Via vriend(in) of collega')}</option>
                  <option value="newsletter">{t('workshop.interest.how_heard.newsletter', 'Nieuwsbrief')}</option>
                  <option value="event">{t('workshop.interest.how_heard.event', 'Evenement of workshop')}</option>
                  <option value="other">{t('workshop.interest.how_heard.other', 'Anders')}</option>
                </select>
              </ContainerInstrument>
            </ContainerInstrument>

            {/* 2. Verfijning: welke skills aanscherpen — handshake Supabase (workshops.meta.skill_dna) */}
            {skills.length > 0 && (
              <ContainerInstrument className="space-y-4">
                <LabelInstrument className="text-[15px] font-medium text-va-black/80 px-1">
                  <VoiceglotText translationKey="workshop.interest.skills_label" defaultText="Welke skills wil je aanscherpen?" />
                </LabelInstrument>
                <ContainerInstrument className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => { playClick('light'); toggleSkill(skill.slug); }}
                      className={cn(
                        "p-4 sm:p-5 rounded-[20px] border-2 transition-all duration-100 text-left flex items-center justify-between group min-h-[56px] active:scale-[0.99]",
                        selectedSkills.includes(skill.slug)
                          ? "bg-black border-black text-white shadow-aura scale-[1.01]"
                          : "bg-white border-black/5 text-va-black hover:border-primary/30"
                      )}
                    >
                      <TextInstrument className="font-light text-[15px] tracking-tight">
                        {skill.label_nl}
                      </TextInstrument>
                      <ContainerInstrument className={cn(
                        "w-6 h-6 rounded-[10px] border-2 flex items-center justify-center shrink-0 transition-all duration-100",
                        selectedSkills.includes(skill.slug)
                          ? "bg-primary border-primary"
                          : "border-black/10 group-hover:border-primary/30"
                      )}>
                        {selectedSkills.includes(skill.slug) && <Check size={14} strokeWidth={3} className="text-white" />}
                      </ContainerInstrument>
                    </button>
                  ))}
                </ContainerInstrument>
                <TextInstrument className="text-[13px] text-va-black/40 font-light px-1">
                  <VoiceglotText translationKey="workshop.interest.skills_hint" defaultText="Meerdere keuzes mogelijk. Geen idee? Laat leeg." />
                </TextInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>

          <ContainerInstrument className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <ButtonInstrument
              type="button"
              onClick={() => { playClick('light'); setStep(1); setSubmitError(null); }}
              className="px-6 sm:px-8 py-5 sm:py-6 rounded-[10px] bg-va-off-white text-black/50 font-light tracking-tight text-[15px] hover:bg-black/5 transition-all duration-100 min-h-[52px] active:scale-[0.99]"
            >
              <VoiceglotText  translationKey="common.previous" defaultText="Vorige" />
            </ButtonInstrument>
            <ButtonInstrument
              type="submit"
              disabled={isLoading}
              className="flex-1 py-5 sm:py-6 rounded-[10px] bg-black text-white font-light tracking-tight text-[15px] hover:bg-primary transition-all duration-100 shadow-aura flex items-center justify-center gap-3 group min-h-[52px] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? <VoiceglotText  translationKey="common.processing" defaultText="Verwerken" /> : <VoiceglotText  translationKey="workshop.interest.submit" defaultText="Inschrijving voltooien" />}
              <ArrowRight size={18} strokeWidth={1.5} className={cn("shrink-0 transition-transform duration-100 group-hover:translate-x-1", isLoading && "opacity-50")} />
            </ButtonInstrument>
          </ContainerInstrument>
        </form>
      )}
    </ContainerInstrument>
  );
};
