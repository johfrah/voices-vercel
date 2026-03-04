'use client';

import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    InputInstrument,
    LabelInstrument,
    OptionInstrument,
    SelectInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowRight, Check, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

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

const WORKSHOPS = [
  { id: '260250', title: 'Voice-over voor Beginners' },
  { id: '267781', title: 'Perfectie van Intonatie' },
  { id: '267780', title: 'Perfectie van Articulatie' },
  { id: '260273', title: 'Audioboeken Inspreken' },
  { id: '260274', title: 'Maak je eigen Podcast' },
  { id: '260272', title: 'Maak je eigen Radioshow' },
  { id: '260266', title: 'Documentaires Inspreken' },
  { id: '263913', title: 'Verwen je stem!' }
];

export const WorkshopInterestForm: React.FC = () => {
  const { t } = useTranslation();
  const { playClick } = useSonicDNA();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successWorkshops, setSuccessWorkshops] = useState<any[]>([]);

  // 🛡️ CHRIS-PROTOCOL: Handshake Truth - Fetch workshops from DB
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await fetch('/api/admin/config?type=actors'); // Using actors as a proxy for workshops for now
        const data = await res.json();
        
        // If we have live workshops in the DB, use them
        if (data.results && data.results.length > 0) {
          setWorkshops(data.results.map((w: any) => ({
            id: w.id.toString(),
            title: w.title
          })));
        } else {
          setWorkshops(WORKSHOPS);
        }
      } catch (err) {
        setWorkshops(WORKSHOPS);
      } finally {
        setIsFetching(false);
      }
    };
    fetchWorkshops();
  }, []);

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

  const toggleWorkshop = (id: string) => {
    setSelectedWorkshops(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profession: '',
    age: '',
    experience: '',
    goal: ''
  });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    playClick('light');
    setStep(2);
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
          selectedWorkshops,
          profession: formData.profession || undefined,
          age: formData.age || undefined,
          experience: formData.experience || undefined,
          goal: formData.goal || undefined,
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
            <div className="rounded-[20px] border border-black/[0.06] bg-white/80 backdrop-blur-sm p-6 shadow-sm">
              <SuccessWorkshopCalendar workshops={successWorkshops} />
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
            
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {isFetching ? (
                // Skeleton loading
                [1, 2, 3, 4].map((i) => (
                  <ContainerInstrument key={i} className="h-16 bg-va-black/5 rounded-[20px] animate-pulse" />
                ))
              ) : workshops.map((w) => (
                <ButtonInstrument
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
                    <VoiceglotText  translationKey={`workshop.${w.id}.title`} defaultText={w.title} noTranslate={true} />
                  </TextInstrument>
                  <ContainerInstrument className={cn(
                    "w-6 h-6 rounded-[10px] border-2 flex items-center justify-center shrink-0 transition-all duration-100",
                    selectedWorkshops.includes(w.id)
                      ? "bg-primary border-primary"
                      : "border-black/10 group-hover:border-primary/30"
                  )}>
                    {selectedWorkshops.includes(w.id) && <Check size={14} strokeWidth={3} className="text-white" />}
                  </ContainerInstrument>
                </ButtonInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Basic Info */}
          <ContainerInstrument className="pt-10 sm:pt-12 border-t border-black/5 space-y-6 sm:space-y-8">
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <ContainerInstrument className="space-y-2">
                <LabelInstrument className="text-[15px] font-light text-black/50 px-1"><VoiceglotText  translationKey="common.first_name" defaultText="Voornaam" /></LabelInstrument>
                <InputInstrument 
                  required 
                  placeholder={t('common.placeholder.first_name', 'Jouw voornaam')} 
                  className="w-full"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2">
                <LabelInstrument className="text-[15px] font-light text-black/50 px-1"><VoiceglotText  translationKey="common.last_name" defaultText="Familienaam" /></LabelInstrument>
                <InputInstrument 
                  required 
                  placeholder={t('common.placeholder.last_name', 'Jouw familienaam')} 
                  className="w-full"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-light text-black/50 px-1"><VoiceglotText  translationKey="common.email" defaultText="E-mailadres" /></LabelInstrument>
                <InputInstrument 
                  required 
                  type="email" 
                  placeholder={t('common.placeholder.email', 'naam@voorbeeld.be')} 
                  className="w-full"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </ContainerInstrument>
            </ContainerInstrument>

            <ButtonInstrument
              type="submit"
              disabled={selectedWorkshops.length === 0 || !formData.email}
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
            <ContainerInstrument className="flex items-center gap-3 p-4 rounded-[10px] bg-red-500/10 text-red-600 border border-red-500/20" role="alert">
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

            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <ContainerInstrument className="space-y-2">
                <LabelInstrument className="text-[15px] font-light text-black/50 px-1"><VoiceglotText  translationKey="common.profession" defaultText="Beroep" /></LabelInstrument>
                <InputInstrument 
                  placeholder={t('common.placeholder.profession', 'Wat doe je in het dagelijks leven?')} 
                  className="w-full"
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2">
                <LabelInstrument className="text-[15px] font-light text-black/50 px-1"><VoiceglotText  translationKey="common.age" defaultText="Leeftijd" /></LabelInstrument>
                <InputInstrument 
                  type="number" 
                  placeholder={t('common.placeholder.age', 'Je leeftijd')} 
                  className="w-full"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-light text-black/50 px-1"><VoiceglotText  translationKey="common.experience" defaultText="Ervaring met stemwerk" /></LabelInstrument>
                <SelectInstrument 
                  className="w-full p-4 rounded-[20px] border-2 border-black/5 bg-white text-[15px] font-light outline-none focus:border-primary transition-all duration-100 min-h-[52px]"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                >
                  <OptionInstrument value="">{t('common.choose_level', 'Kies je niveau...')}</OptionInstrument>
                  <OptionInstrument value="beginner">{t('common.level.beginner', 'Beginner (geen ervaring)')}</OptionInstrument>
                  <OptionInstrument value="intermediate">{t('common.level.intermediate', 'Enige ervaring (hobby/amateur)')}</OptionInstrument>
                  <OptionInstrument value="pro">{t('common.level.pro', 'Professional')}</OptionInstrument>
                </SelectInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2 md:col-span-2">
                <LabelInstrument className="text-[15px] font-light text-black/50 px-1"><VoiceglotText  translationKey="common.goal" defaultText="Wat is je doel?" /></LabelInstrument>
                <textarea 
                  rows={4}
                  placeholder={t('common.placeholder.goal', 'Wat hoop je te bereiken met deze workshop?')} 
                  className="w-full p-5 sm:p-6 rounded-[20px] border-2 border-black/5 bg-white text-[15px] font-light outline-none focus:border-primary transition-all duration-100 resize-none min-h-[120px]"
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                />
              </ContainerInstrument>
            </ContainerInstrument>
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
