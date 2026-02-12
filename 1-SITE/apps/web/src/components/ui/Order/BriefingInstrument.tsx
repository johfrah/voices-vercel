"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { FileCheck } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';

interface BriefingInstrumentProps {
  script: string;
}

export const BriefingInstrument: React.FC<BriefingInstrumentProps> = ({ script }) => {
  return (
    <BentoCard 
      title={<VoiceglotText translationKey="order.briefing.title" defaultText="Briefing" />}
      icon={<FileCheck className="w-5 h-5" />}
      className="col-span-1"
    >
      <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-sm italic text-slate-600 border border-dashed border-slate-300">
        &quot;{script || <VoiceglotText translationKey="order.briefing.empty" defaultText="Geen script gevonden..." />}&quot;
      </div>
      <button className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
        <VoiceglotText translationKey="order.briefing.action" defaultText="Open Full Script" />
      </button>
    </BentoCard>
  );
};
