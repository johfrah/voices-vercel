"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, InputInstrument, LabelInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { ArrowRight, User, X } from "lucide-react";

interface ParticipantData {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  profession: string;
  experience: string;
}

interface WorkshopParticipantFormProps {
  workshopTitle: string;
  onSubmit: (data: ParticipantData) => void;
  onCancel: () => void;
}

/**
 * Workshop Participant Form (2026)
 * 
 * Deelnemer ≠ Betaler. Dit formulier verzamelt de gegevens van de
 * persoon die daadwerkelijk de workshop volgt. De betaler-gegevens
 * worden apart ingevuld in de checkout.
 * 
 * Data gaat naar: order_items.meta_data.participant_info
 */
export const WorkshopParticipantForm: React.FC<WorkshopParticipantFormProps> = ({
  workshopTitle,
  onSubmit,
  onCancel
}) => {
  const { playClick } = useSonicDNA();
  const [data, setData] = useState<ParticipantData>({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    profession: '',
    experience: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim()) {
      setError('Vul minstens voornaam, familienaam en e-mailadres in.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setError('Voer een geldig e-mailadres in.');
      return;
    }

    playClick('pro');
    onSubmit(data);
  };

  const update = (field: keyof ParticipantData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  if (!mounted) return null;

  const content = (
    <ContainerInstrument plain className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <ContainerInstrument plain className="absolute inset-0 bg-va-black/60 backdrop-blur-sm" onClick={onCancel} />
      
      <ContainerInstrument plain className="relative bg-white rounded-[24px] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <ButtonInstrument
          onClick={onCancel}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-va-black/30 hover:text-va-black"
        >
          <X size={20} strokeWidth={1.5} />
        </ButtonInstrument>

        <ContainerInstrument plain className="space-y-3">
          <ContainerInstrument plain className="flex items-center gap-3">
            <ContainerInstrument plain className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User size={18} strokeWidth={1.5} className="text-primary" />
            </ContainerInstrument>
            <ContainerInstrument plain>
              <TextInstrument className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary">
                <VoiceglotText translationKey="studio.participant.label" defaultText="Deelnemergegevens" />
              </TextInstrument>
              <HeadingInstrument level={2} className="text-2xl font-light tracking-tighter text-va-black">
                <VoiceglotText translationKey="studio.participant.title" defaultText="Wie volgt de workshop?" />
              </HeadingInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-va-black/40 font-light text-[14px]">
            {workshopTitle}
          </TextInstrument>
        </ContainerInstrument>

        {error && (
          <ContainerInstrument plain className="bg-red-50 border border-red-100 rounded-xl p-4">
            <TextInstrument className="text-red-600 text-[14px] font-light">{error}</TextInstrument>
          </ContainerInstrument>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <ContainerInstrument plain className="grid grid-cols-2 gap-4">
            <ContainerInstrument plain>
              <LabelInstrument className="text-[12px] font-medium text-va-black/40 uppercase tracking-widest mb-2">
                <VoiceglotText translationKey="common.first_name" defaultText="Voornaam" /> *
              </LabelInstrument>
              <InputInstrument
                value={data.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                placeholder="Marie"
                required
              />
            </ContainerInstrument>
            <ContainerInstrument plain>
              <LabelInstrument className="text-[12px] font-medium text-va-black/40 uppercase tracking-widest mb-2">
                <VoiceglotText translationKey="common.last_name" defaultText="Familienaam" /> *
              </LabelInstrument>
              <InputInstrument
                value={data.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                placeholder="Janssen"
                required
              />
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument plain>
            <LabelInstrument className="text-[12px] font-medium text-va-black/40 uppercase tracking-widest mb-2">
              <VoiceglotText translationKey="common.email" defaultText="E-mailadres" /> *
            </LabelInstrument>
            <InputInstrument
              type="email"
              value={data.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="marie@voorbeeld.be"
              required
            />
          </ContainerInstrument>

          <ContainerInstrument plain className="grid grid-cols-2 gap-4">
            <ContainerInstrument plain>
              <LabelInstrument className="text-[12px] font-medium text-va-black/40 uppercase tracking-widest mb-2">
                <VoiceglotText translationKey="common.profession" defaultText="Beroep" />
              </LabelInstrument>
              <InputInstrument
                value={data.profession}
                onChange={(e) => update('profession', e.target.value)}
                placeholder="Leerkracht"
              />
            </ContainerInstrument>
            <ContainerInstrument plain>
              <LabelInstrument className="text-[12px] font-medium text-va-black/40 uppercase tracking-widest mb-2">
                <VoiceglotText translationKey="common.age" defaultText="Leeftijd" />
              </LabelInstrument>
              <InputInstrument
                type="number"
                value={data.age}
                onChange={(e) => update('age', e.target.value)}
                placeholder="35"
              />
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument plain>
            <LabelInstrument className="text-[12px] font-medium text-va-black/40 uppercase tracking-widest mb-2">
              <VoiceglotText translationKey="studio.participant.experience" defaultText="Ervaring met stemwerk" />
            </LabelInstrument>
            <select
              value={data.experience}
              onChange={(e) => update('experience', e.target.value)}
              className="w-full bg-va-off-white border-none rounded-[10px] px-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-va-black/10 transition-all"
            >
              <option value="">Kies je niveau...</option>
              <option value="beginner">Beginner (geen ervaring)</option>
              <option value="hobby">Hobby (af en toe)</option>
              <option value="semipro">Semi-professioneel</option>
              <option value="pro">Professioneel</option>
            </select>
          </ContainerInstrument>

          <ContainerInstrument plain className="pt-4 border-t border-black/5 flex items-center justify-between gap-4">
            <TextInstrument className="text-[12px] text-va-black/30 font-light">
              <VoiceglotText translationKey="studio.participant.note" defaultText="De betaler kan iemand anders zijn." />
            </TextInstrument>
            <ButtonInstrument
              type="submit"
              className="!bg-primary !text-va-black !rounded-[12px] font-bold tracking-[0.1em] px-8 py-4 hover:!bg-va-black hover:!text-white transition-all duration-500 flex items-center gap-3"
            >
              <VoiceglotText translationKey="studio.participant.cta" defaultText="Verder naar betaling" />
              <ArrowRight size={16} strokeWidth={2} />
            </ButtonInstrument>
          </ContainerInstrument>
        </form>
      </ContainerInstrument>
    </ContainerInstrument>
  );

  return createPortal(content, document.body);
};
