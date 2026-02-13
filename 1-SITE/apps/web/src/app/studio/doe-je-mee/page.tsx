import React from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { WorkshopInterestForm } from '@/components/studio/WorkshopInterestForm';

export default function DoeJeMeePage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-40 px-6">
      <ContainerInstrument className="max-w-5xl mx-auto">
        
        {/* HERO */}
        <SectionInstrument className="mb-20 text-center space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full mb-8 shadow-sm border border-black/[0.03]">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[15px] font-black tracking-widest text-black/60">
              <VoiceglotText translationKey="studio.interest.badge" defaultText="Blijf op de hoogte" />
            </span>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9]">
            <VoiceglotText translationKey="studio.interest.title" defaultText="Doe je mee?" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl max-w-2xl mx-auto">
            <VoiceglotText 
              translationKey="studio.interest.subtitle" 
              defaultText="Vink aan voor welke workshop(s) je interesse hebt. Je ontvangt dan zo snel mogelijk alle nodige informatie." 
            />
          </TextInstrument>
        </SectionInstrument>

        {/* FORM */}
        <WorkshopInterestForm />

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
