'use client';

import {
    ButtonInstrument,
    HeadingInstrument,
    InputInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowRight, CheckCircle2, Send, Star } from 'lucide-react';
import React, { useState } from 'react';

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
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleWorkshop = (id: string) => {
    setSelectedWorkshops(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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

    try {
      const res = await fetch('/api/studio/workshop-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          selectedWorkshops,
          profession: formData.profession || undefined,
          age: formData.age || undefined,
          experience: formData.experience || undefined,
          goal: formData.goal || undefined
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
      <div className="max-w-xl mx-auto text-center space-y-8 py-16 px-4 sm:py-24">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto transition-transform duration-100">
          <CheckCircle2 strokeWidth={1.5} size={32} className="sm:w-10 sm:h-10" />
        </div>
        <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-va-black">
          <VoiceglotText translationKey="workshop.interest.success.title" defaultText="Bedankt!" />
        </HeadingInstrument>
        <TextInstrument className="text-[15px] text-va-black/50 font-light leading-relaxed max-w-md mx-auto">
          <VoiceglotText translationKey="workshop.interest.success.text" defaultText="We hebben je interesse ontvangen. Johfrah neemt binnenkort contact met je op." />
        </TextInstrument>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12 px-4 sm:px-6">
      {/* STAPPEN INDICATOR */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div className={cn("h-1 rounded-full transition-all duration-100", step === 1 ? "bg-primary w-8" : "bg-black/10 w-2")} />
        <div className={cn("h-1 rounded-full transition-all duration-100", step === 2 ? "bg-primary w-8" : "bg-black/10 w-2")} />
      </div>

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Workshop Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <Star strokeWidth={1.5} className="text-primary fill-primary shrink-0" size={24} />
              <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">
                <VoiceglotText translationKey="workshop.interest.title" defaultText="Voor welke workshop(s) heb je interesse?" />
              </HeadingInstrument>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {WORKSHOPS.map((w) => (
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
                  <span className="font-light text-[15px] tracking-tight">
                    <VoiceglotText translationKey={`workshop.${w.id}.title`} defaultText={w.title} noTranslate={true} />
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-100",
                    selectedWorkshops.includes(w.id)
                      ? "bg-primary border-primary"
                      : "border-black/10 group-hover:border-primary/30"
                  )}>
                    {selectedWorkshops.includes(w.id) && <CheckCircle2 strokeWidth={1.5} size={14} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="pt-10 sm:pt-12 border-t border-black/5 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[15px] font-light text-black/50 px-1"><VoiceglotText translationKey="common.first_name" defaultText="Voornaam" /></label>
                <InputInstrument 
                  required 
                  placeholder={t('common.placeholder.first_name', 'Jouw voornaam')} 
                  className="w-full"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-light text-black/50 px-1"><VoiceglotText translationKey="common.last_name" defaultText="Familienaam" /></label>
                <InputInstrument 
                  required 
                  placeholder={t('common.placeholder.last_name', 'Jouw familienaam')} 
                  className="w-full"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[15px] font-light text-black/50 px-1"><VoiceglotText translationKey="common.email" defaultText="E-mailadres" /></label>
                <InputInstrument 
                  required 
                  type="email" 
                  placeholder={t('common.placeholder.email', 'naam@voorbeeld.be')} 
                  className="w-full"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <ButtonInstrument
              type="submit"
              disabled={selectedWorkshops.length === 0 || !formData.email}
              className="w-full py-5 sm:py-6 rounded-[10px] bg-black text-white font-light tracking-tight text-[15px] hover:bg-primary transition-all duration-100 shadow-aura flex items-center justify-center gap-3 group min-h-[52px] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
            >
              <VoiceglotText translationKey="common.next_step" defaultText="Volgende stap" />
              <ArrowRight strokeWidth={1.5} size={18} className="group-hover:translate-x-1 transition-transform duration-100" />
            </ButtonInstrument>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
          {submitError && (
            <div className="flex items-center gap-3 p-4 rounded-[10px] bg-red-500/10 text-red-600 border border-red-500/20" role="alert">
              <AlertCircle strokeWidth={1.5} size={20} className="shrink-0" />
              <TextInstrument className="text-[15px] font-light">{submitError}</TextInstrument>
            </div>
          )}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <Star strokeWidth={1.5} className="text-primary fill-primary shrink-0" size={24} />
              <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">
                <VoiceglotText translationKey="workshop.interest.step2.title" defaultText="Help ons je beter te leren kennen" />
              </HeadingInstrument>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[15px] font-light text-black/50 px-1"><VoiceglotText translationKey="common.profession" defaultText="Beroep" /></label>
                <InputInstrument 
                  placeholder={t('common.placeholder.profession', 'Wat doe je in het dagelijks leven?')} 
                  className="w-full"
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-light text-black/50 px-1"><VoiceglotText translationKey="common.age" defaultText="Leeftijd" /></label>
                <InputInstrument 
                  type="number" 
                  placeholder={t('common.placeholder.age', 'Je leeftijd')} 
                  className="w-full"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[15px] font-light text-black/50 px-1"><VoiceglotText translationKey="common.experience" defaultText="Ervaring met stemwerk" /></label>
                <select 
                  className="w-full p-4 rounded-[20px] border-2 border-black/5 bg-white text-[15px] font-light outline-none focus:border-primary transition-all duration-100 min-h-[52px]"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                >
                  <option value=""><VoiceglotText translationKey="common.choose_level" defaultText="Kies je niveau..." /></option>
                  <option value="beginner"><VoiceglotText translationKey="common.level.beginner" defaultText="Beginner (geen ervaring)" /></option>
                  <option value="intermediate"><VoiceglotText translationKey="common.level.intermediate" defaultText="Enige ervaring (hobby/amateur)" /></option>
                  <option value="pro"><VoiceglotText translationKey="common.level.pro" defaultText="Professional" /></option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[15px] font-light text-black/50 px-1"><VoiceglotText translationKey="common.goal" defaultText="Wat is je doel?" /></label>
                <textarea 
                  rows={4}
                  placeholder={t('common.placeholder.goal', 'Wat hoop je te bereiken met deze workshop?')} 
                  className="w-full p-5 sm:p-6 rounded-[20px] border-2 border-black/5 bg-white text-[15px] font-light outline-none focus:border-primary transition-all duration-100 resize-none min-h-[120px]"
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <ButtonInstrument
              type="button"
              onClick={() => { playClick('light'); setStep(1); setSubmitError(null); }}
              className="px-6 sm:px-8 py-5 sm:py-6 rounded-[10px] bg-va-off-white text-black/50 font-light tracking-tight text-[15px] hover:bg-black/5 transition-all duration-100 min-h-[52px] active:scale-[0.99]"
            >
              <VoiceglotText translationKey="common.previous" defaultText="Vorige" />
            </ButtonInstrument>
            <ButtonInstrument
              type="submit"
              disabled={isLoading}
              className="flex-1 py-5 sm:py-6 rounded-[10px] bg-black text-white font-light tracking-tight text-[15px] hover:bg-primary transition-all duration-100 shadow-aura flex items-center justify-center gap-3 group min-h-[52px] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? <VoiceglotText translationKey="common.processing" defaultText="Verwerken…" /> : <VoiceglotText translationKey="workshop.interest.submit" defaultText="Inschrijving voltooien" />}
              <Send strokeWidth={1.5} size={18} className={cn("shrink-0 transition-transform duration-100", isLoading && "opacity-50")} />
            </ButtonInstrument>
          </div>
        </form>
      )}
    </div>
  );
};
