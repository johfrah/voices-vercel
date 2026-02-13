"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Calendar, CheckCircle2, FileCheck } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';

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
        icon={<Calendar className="w-5 h-5" />}
        className="col-span-3"
      >
        <div className="mt-4 flex gap-6">
          <div className="flex-1 p-6 bg-purple-50 rounded-3xl border border-purple-100">
            <div className="text-purple-400 text-[15px] font-bold tracking-widest ">
              <VoiceglotText translationKey="order.workshop.date_time" defaultText="Datum & Tijd" />
            </div>
            <div className="text-2xl font-bold text-purple-900 mt-1">
              {date || <VoiceglotText translationKey="order.workshop.pending_date" defaultText="Nog te plannen" />}
            </div>
            <div className="text-purple-700 font-medium">
              {time || '00:00'}
            </div>
            <button className="mt-4 flex items-center gap-2 text-sm font-bold text-purple-700 hover:underline">
              <Calendar className="w-4 h-4" /> <VoiceglotText translationKey="order.workshop.reschedule" defaultText="Reschedule" />
            </button>
          </div>
          <div className="flex-1 space-y-3">
            <div className="text-slate-400 text-[15px] font-bold tracking-widest ">
              <VoiceglotText translationKey="order.workshop.details" defaultText="Details" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-medium"><VoiceglotText translationKey="order.workshop.age" defaultText="Leeftijd:" /></span> {age || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-medium"><VoiceglotText translationKey="order.workshop.profession" defaultText="Beroep:" /></span> {profession || 'N/A'}
            </div>
          </div>
        </div>
      </BentoCard>

      <BentoCard 
        title={<VoiceglotText translationKey="order.workshop.certificate_title" defaultText="Certificaat" />}
        icon={<FileCheck className="w-5 h-5" />}
        className="col-span-1"
      >
        <div className="mt-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
            <FileCheck className="w-8 h-8 text-slate-400" />
          </div>
          <div className="text-sm font-medium text-slate-500 mb-4">
            <VoiceglotText translationKey="order.workshop.certificate_hint" defaultText="Certificaat wordt automatisch gegenereerd na afloop." />
          </div>
          <button className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm cursor-not-allowed" disabled>
            <VoiceglotText translationKey="order.workshop.certificate_download" defaultText="Download PDF" />
          </button>
        </div>
      </BentoCard>
    </>
  );
};
