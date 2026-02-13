"use client";

import React, { useState } from 'react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument, 
  SectionInstrument,
  LabelInstrument,
  InputInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import { CheckCircle2, Loader2, Send, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const RATINGS = [
  { id: 'relevance', label: 'Relevantie van de inhoud' },
  { id: 'balance', label: 'Balans theorie/praktijk' },
  { id: 'knowledge', label: 'Kennis workshopgever' },
  { id: 'support', label: 'Ondersteuning & vragen' },
  { id: 'organization', label: 'Organisatie & communicatie' }
];

const OPTIONS = ["Uitstekend", "Goed", "Voldoende", "Onvoldoende"];

import { useAuth } from '@/contexts/AuthContext';

export const StudioFeedbackForm = () => {
  const { playClick } = useSonicDNA();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    workshop_name: '',
    ratings: {
      relevance: '',
      balance: '',
      knowledge: '',
      support: '',
      organization: ''
    },
    text_most_valuable: '',
    text_improvement: '',
    text_recommendation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    playClick('pro');

    try {
      const res = await fetch('/api/studio/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_email: user?.email
        })
      });

      if (res.ok) {
        setIsSent(true);
        playClick('success');
      }
    } catch (err) {
      playClick('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <ContainerInstrument className="text-center py-20 space-y-6 animate-in fade-in zoom-in duration-700">
        <ContainerInstrument className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </ContainerInstrument>
        <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter">
          Bedankt voor je feedback!
        </HeadingInstrument>
        <TextInstrument className="text-va-black/40 max-w-md mx-auto font-light">
          Jouw inzichten helpen ons (en Bernadette) om de Voices Experience continu te verbeteren.
        </TextInstrument>
        <ButtonInstrument onClick={() => window.location.href = '/studio'} className="va-btn-pro">
          Terug naar de Studio
        </ButtonInstrument>
      </ContainerInstrument>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-3xl mx-auto">
      {/* Workshop Select */}
      <SectionInstrument className="space-y-4">
        <LabelInstrument className="text-xl text-va-black">Welke workshop heb je gevolgd?</LabelInstrument>
        <InputInstrument 
          required
          placeholder="Naam van de workshop..."
          value={formData.workshop_name}
          onChange={e => setFormData({...formData, workshop_name: e.target.value})}
          className="w-full text-lg"
        />
      </SectionInstrument>

      {/* Ratings Grid */}
      <SectionInstrument className="space-y-8">
        <HeadingInstrument level={3} className="text-2xl font-light border-b border-black/5 pb-4">
          Hoe beoordeel je de volgende punten?
        </HeadingInstrument>
        <ContainerInstrument className="grid gap-8">
          {RATINGS.map(r => (
            <ContainerInstrument key={r.id} className="space-y-4">
              <LabelInstrument className="text-[15px] font-medium text-va-black/60">{r.label}</LabelInstrument>
              <ContainerInstrument className="flex flex-wrap gap-3">
                {OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      playClick('soft');
                      setFormData({
                        ...formData, 
                        ratings: { ...formData.ratings, [r.id]: opt }
                      });
                    }}
                    className={cn(
                      "px-6 py-2 rounded-full border text-[15px] tracking-widest transition-all",
                      formData.ratings[r.id as keyof typeof formData.ratings] === opt
                        ? "bg-va-black text-white border-va-black shadow-lg"
                        : "bg-white text-va-black/40 border-black/5 hover:border-black/20"
                    )}
                  >
                    {opt.toUpperCase()}
                  </button>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </SectionInstrument>

      {/* Open Questions */}
      <SectionInstrument className="space-y-8">
        <HeadingInstrument level={3} className="text-2xl font-light border-b border-black/5 pb-4">
          Jouw ervaring in detail
        </HeadingInstrument>
        
        <ContainerInstrument className="space-y-4">
          <LabelInstrument>Wat vond je het meest waardevol aan deze dag?</LabelInstrument>
          <textarea 
            required
            className="w-full bg-va-off-white rounded-[20px] p-6 min-h-[120px] focus:ring-2 focus:ring-primary/20 transition-all border-none text-[15px] font-light"
            placeholder="Deel je hoogtepunten..."
            value={formData.text_most_valuable}
            onChange={e => setFormData({...formData, text_most_valuable: e.target.value})}
          />
        </ContainerInstrument>

        <ContainerInstrument className="space-y-4">
          <LabelInstrument>Heb je suggesties voor verbetering?</LabelInstrument>
          <textarea 
            className="w-full bg-va-off-white rounded-[20px] p-6 min-h-[120px] focus:ring-2 focus:ring-primary/20 transition-all border-none text-[15px] font-light"
            placeholder="Wat kan er nog beter?"
            value={formData.text_improvement}
            onChange={e => setFormData({...formData, text_improvement: e.target.value})}
          />
        </ContainerInstrument>

        <ContainerInstrument className="space-y-4">
          <LabelInstrument>Zou je de workshop aanbevelen? (En waarom?)</LabelInstrument>
          <textarea 
            required
            className="w-full bg-va-off-white rounded-[20px] p-6 min-h-[120px] focus:ring-2 focus:ring-primary/20 transition-all border-none text-[15px] font-light"
            placeholder="Jouw eerlijke mening..."
            value={formData.text_recommendation}
            onChange={e => setFormData({...formData, text_recommendation: e.target.value})}
          />
        </ContainerInstrument>
      </SectionInstrument>

      <ButtonInstrument 
        type="submit" 
        disabled={isSubmitting}
        className="w-full va-btn-pro py-6 text-xl flex items-center justify-center gap-4"
      >
        {isSubmitting ? <Loader2 strokeWidth={1.5} className="animate-spin" /> : <Send strokeWidth={1.5} size={20} />}
        FEEDBACK VERZENDEN
      </ButtonInstrument>
    </form>
  );
};
