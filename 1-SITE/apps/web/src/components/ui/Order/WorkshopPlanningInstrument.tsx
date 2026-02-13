"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Calendar, CheckCircle2, FileCheck } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';

interface WorkshopPlanningInstrumentProps {
  date?: string;
  time?: string;
  age?: string;
  profession?: string;
}

export const WorkshopPlanningInstrument: React.FC<WorkshopPlanningInstrumentProps> = ({ 
  date, 
  time, 
  age, 
  profession 
}) => {
  return (
    <>
      <BentoCard 
        title={<VoiceglotText translationKey="order.workshop.planning_title" defaultText="Planning & Deelnemers" />}
        icon={<Calendar strokeWidth={1.5} className="w-5 h-5" />}
        className="col-span-3"
      >
        <ContainerInstrument className="mt-4 flex gap-6">
          <ContainerInstrument className="flex-1 p-6 bg-primary/5 rounded-[20px] border border-primary/10">
            <TextInstrument className="text-primary/40 text-[15px] font-light tracking-widest ">
              <VoiceglotText strokeWidth={1.5} translationKey="order.workshop.date_time" defaultText="Datum & Tijd" / />
            </TextInstrument>
            <TextInstrument className="text-2xl font-light text-va-black mt-1">
              {date || <VoiceglotText strokeWidth={1.5} translationKey="order.workshop.pending_date" defaultText="Nog te plannen" / />}
            </TextInstrument>
            <TextInstrument className="text-va-black/60 font-light">
              {time || '00:00'}
            </TextInstrument>
            <ButtonInstrument className="mt-4 flex items-center gap-2 text-[15px] font-light text-primary hover:underline p-0 bg-transparent">
              <Calendar strokeWidth={1.5} className="w-4 h-4" /> 
              <VoiceglotText strokeWidth={1.5} translationKey="order.workshop.reschedule" defaultText="Reschedule" / />
            </ButtonInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="flex-1 space-y-3">
            <TextInstrument className="text-va-black/20 text-[15px] font-light tracking-widest ">
              <VoiceglotText strokeWidth={1.5} translationKey="order.workshop.details" defaultText="Details" / />
            </TextInstrument>
            <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light">
              <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-emerald-500" />
              <TextInstrument className="font-light">
                <VoiceglotText strokeWidth={1.5} translationKey="order.workshop.age" defaultText="Leeftijd:" / />
              </TextInstrument> 
              <TextInstrument>{age || 'N/A'}</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light">
              <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-emerald-500" />
              <TextInstrument className="font-light">
                <VoiceglotText strokeWidth={1.5} translationKey="order.workshop.profession" defaultText="Beroep:" / />
              </TextInstrument> 
              <TextInstrument>{profession || 'N/A'}</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </BentoCard>

      <BentoCard 
        title={<VoiceglotText translationKey="order.workshop.certificate_title" defaultText="Certificaat" />}
        icon={<FileCheck className="w-5 h-5" strokeWidth={1.5} />}
        className="col-span-1"
      >
        <ContainerInstrument className="mt-4 flex flex-col items-center text-center">
          <ContainerInstrument className="w-16 h-16 bg-va-off-white rounded-[20px] flex items-center justify-center mb-4 border border-black/5">
            <FileCheck className="w-8 h-8 text-va-black/20" strokeWidth={1.5} />
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-light text-va-black/40 mb-4">
            <VoiceglotText strokeWidth={1.5} translationKey="order.workshop.certificate_hint" defaultText="Certificaat wordt automatisch gegenereerd na afloop." / />
          </TextInstrument>
          <ButtonInstrument className="w-full py-3 bg-va-off-white text-va-black/20 rounded-[10px] font-light text-[15px] cursor-not-allowed" disabled>
            <VoiceglotText strokeWidth={1.5} translationKey="order.workshop.certificate_download" defaultText="Download PDF" / />
          </ButtonInstrument>
        </ContainerInstrument>
      </BentoCard>
    </>
  );
};
