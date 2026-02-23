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
import { cn } from '@/lib/utils/utils';
import React, { useState } from 'react';
import Image from 'next/image';

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
      <ContainerInstrument className="max-w-xl mx-auto text-center space-y-8 py-16 px-4 sm:py-24">
        <ContainerInstrument className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 text-green-500 rounded-[20px] flex items-center justify-center mx-auto transition-transform duration-100">
          <Image  src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} className="sm:w-10 sm:h-10" />
        </ContainerInstrument>
        <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-va-black">
          <VoiceglotText  translationKey="workshop.interest.success.title" defaultText="Bedankt!" />
        </HeadingInstrument>
        <TextInstrument className="text-[15px] text-va-black/50 font-light leading-relaxed max-w-md mx-auto">
          <VoiceglotText  translationKey="workshop.interest.success.text" defaultText="We hebben je interesse ontvangen. Johfrah neemt binnenkort contact met je op." />
        </TextInstrument>
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
              <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} className="shrink-0" />
              <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">
                <VoiceglotText  translationKey="workshop.interest.title" defaultText="Voor welke workshop(s) heb je interesse?" />
              </HeadingInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                  <TextInstrument className="font-light text-[15px] tracking-tight">
                    <VoiceglotText  translationKey={`workshop.${w.id}.title`} defaultText={w.title} noTranslate={true} />
                  </TextInstrument>
                  <ContainerInstrument className={cn(
                    "w-6 h-6 rounded-[10px] border-2 flex items-center justify-center shrink-0 transition-all duration-100",
                    selectedWorkshops.includes(w.id)
                      ? "bg-primary border-primary"
                      : "border-black/10 group-hover:border-primary/30"
                  )}>
                    {selectedWorkshops.includes(w.id) && <Image  src="/assets/common/branding/icons/INFO.svg" width={14} height={14} alt="" className="brightness-0 invert" />}
                  </ContainerInstrument>
                </button>
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
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2">
                <LabelInstrument className="text-[15px] font-light text-black/50 px-1"><VoiceglotText  translationKey="common.last_name" defaultText="Familienaam" /></LabelInstrument>
                <InputInstrument 
                  required 
                  placeholder={t('common.placeholder.last_name', 'Jouw familienaam')} 
                  className="w-full"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
              <Image  src="/assets/common/branding/icons/FORWARD.svg" width={18} height={18} alt="" className="brightness-0 invert group-hover:translate-x-1 transition-transform duration-100" />
            </ButtonInstrument>
          </ContainerInstrument>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
          {submitError && (
            <ContainerInstrument className="flex items-center gap-3 p-4 rounded-[10px] bg-red-500/10 text-red-600 border border-red-500/20" role="alert">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} className="shrink-0" />
              <TextInstrument className="text-[15px] font-light">{submitError}</TextInstrument>
            </ContainerInstrument>
          )}
          <ContainerInstrument className="space-y-6">
            <ContainerInstrument className="flex items-center gap-3 mb-6 sm:mb-8">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} className="shrink-0" />
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
                <select 
                  className="w-full p-4 rounded-[20px] border-2 border-black/5 bg-white text-[15px] font-light outline-none focus:border-primary transition-all duration-100 min-h-[52px]"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                >
                  <option value=""><VoiceglotText  translationKey="common.choose_level" defaultText="Kies je niveau..." /></option>
                  <option value="beginner"><VoiceglotText  translationKey="common.level.beginner" defaultText="Beginner (geen ervaring)" /></option>
                  <option value="intermediate"><VoiceglotText  translationKey="common.level.intermediate" defaultText="Enige ervaring (hobby/amateur)" /></option>
                  <option value="pro"><VoiceglotText  translationKey="common.level.pro" defaultText="Professional" /></option>
                </select>
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
              <Image  src="/assets/common/branding/icons/FORWARD.svg" width={18} height={18} alt="" className={cn("brightness-0 invert shrink-0 transition-transform duration-100", isLoading && "opacity-50")} />
            </ButtonInstrument>
          </ContainerInstrument>
        </form>
      )}
    </ContainerInstrument>
  );
};
