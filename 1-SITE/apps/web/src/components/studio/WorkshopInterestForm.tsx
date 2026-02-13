'use client';

import React, { useState } from 'react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { CheckCircle2, ArrowRight, Star, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/sonic-dna';

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
    setIsLoading(true);
    
    // In een echte implementatie sturen we hier formData + selectedWorkshops naar de API
    console.log('Final Submission:', { ...formData, selectedWorkshops });
    
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-8 py-20">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <Check strokeWidth={1.5}Circle2 size={40} />
        </div>
        <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter">
          <VoiceglotText translationKey="workshop.interest.success.title" defaultText="Bedankt!" />
        </HeadingInstrument>
        <TextInstrument className="text-va-black/40 font-medium text-lg">
          <VoiceglotText translationKey="workshop.interest.success.text" defaultText="We hebben je interesse ontvangen. Johfrah neemt binnenkort contact met je op." />
        </TextInstrument>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* STAPPEN INDICATOR */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className={cn("w-2 h-2 rounded-full transition-all duration-500", step === 1 ? "bg-primary w-8" : "bg-black/10")} />
        <div className={cn("w-2 h-2 rounded-full transition-all duration-500", step === 2 ? "bg-primary w-8" : "bg-black/10")} />
      </div>

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Workshop Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Star strokeWidth={1.5} className="text-primary fill-primary" size={24} />
              <h3 className="text-xl font-black tracking-tight">
                <VoiceglotText translationKey="workshop.interest.title" defaultText="Voor welke workshop(s) heb je interesse?" />
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WORKSHOPS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleWorkshop(w.id)}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all duration-500 text-left flex items-center justify-between group",
                    selectedWorkshops.includes(w.id)
                      ? "bg-black border-black text-white shadow-xl scale-[1.02]"
                      : "bg-white border-black/5 text-va-black hover:border-primary/30"
                  )}
                >
                  <span className="font-black tracking-tight text-sm">
                    <VoiceglotText translationKey={`workshop.${w.id}.title`} defaultText={w.title} noTranslate={true} />
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedWorkshops.includes(w.id)
                      ? "bg-primary border-primary"
                      : "border-black/10 group-hover:border-primary/30"
                  )}>
                    {selectedWorkshops.includes(w.id) && <Check strokeWidth={1.5}Circle2 size={14} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="pt-12 border-t border-black/5 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[15px] font-black tracking-widest text-black/40 px-4">
                  <VoiceglotText translationKey="common.first_name" defaultText="Voornaam" />
                </label>
                <InputInstrument 
                  required 
                  placeholder={t('common.placeholder.first_name', 'Jouw voornaam')} 
                  className="w-full"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-black tracking-widest text-black/40 px-4">
                  <VoiceglotText translationKey="common.last_name" defaultText="Familienaam" />
                </label>
                <InputInstrument 
                  required 
                  placeholder={t('common.placeholder.last_name', 'Jouw familienaam')} 
                  className="w-full"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[15px] font-black tracking-widest text-black/40 px-4">
                  <VoiceglotText translationKey="common.email" defaultText="E-mailadres" />
                </label>
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

            <button
              type="submit"
              disabled={selectedWorkshops.length === 0 || !formData.email}
              className="w-full py-6 rounded-2xl bg-black text-white font-black tracking-widest text-sm hover:bg-primary transition-all shadow-xl flex items-center justify-center gap-3 group"
            >
              <VoiceglotText translationKey="common.next_step" defaultText="VOLGENDE STAP" /> <ArrowRight strokeWidth={1.5} size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Star strokeWidth={1.5} className="text-primary fill-primary" size={24} />
              <h3 className="text-xl font-black tracking-tight">
                <VoiceglotText translationKey="workshop.interest.step2.title" defaultText="Help ons je beter te leren kennen" />
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[15px] font-black tracking-widest text-black/40 px-4">
                  <VoiceglotText translationKey="common.profession" defaultText="Beroep" />
                </label>
                <InputInstrument 
                  placeholder={t('common.placeholder.profession', 'Wat doe je in het dagelijks leven?')} 
                  className="w-full"
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-black tracking-widest text-black/40 px-4">
                  <VoiceglotText translationKey="common.age" defaultText="Leeftijd" />
                </label>
                <InputInstrument 
                  type="number" 
                  placeholder={t('common.placeholder.age', 'Je leeftijd')} 
                  className="w-full"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[15px] font-black tracking-widest text-black/40 px-4">
                  <VoiceglotText translationKey="common.experience" defaultText="Ervaring met stemwerk" />
                </label>
                <select 
                  className="w-full p-4 rounded-2xl border-2 border-black/5 bg-white text-sm font-medium outline-none focus:border-primary transition-all"
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
                <label className="text-[15px] font-black tracking-widest text-black/40 px-4">
                  <VoiceglotText translationKey="common.goal" defaultText="Wat is je doel?" />
                </label>
                <textarea 
                  rows={4}
                  placeholder={t('common.placeholder.goal', 'Wat hoop je te bereiken met deze workshop?')} 
                  className="w-full p-6 rounded-2xl border-2 border-black/5 bg-white text-sm font-medium outline-none focus:border-primary transition-all resize-none"
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-8 py-6 rounded-2xl bg-va-off-white text-black/40 font-black tracking-widest text-sm hover:bg-black/5 transition-all"
            >
              <VoiceglotText translationKey="common.previous" defaultText="VORIGE" />
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-6 rounded-2xl bg-black text-white font-black tracking-widest text-sm hover:bg-primary transition-all shadow-xl flex items-center justify-center gap-3 group"
            >
              {isLoading ? <VoiceglotText translationKey="common.processing" defaultText="VERWERKEN..." /> : <VoiceglotText translationKey="workshop.interest.submit" defaultText="INSCHRIJVING VOLTOOIEN" />} <Send strokeWidth={1.5} size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
