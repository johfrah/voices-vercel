import React from 'react';
import { 
  PageWrapperInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import Link from 'next/link';
import Image from 'next/image';

export default function BedanktMeetingPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white flex items-center justify-center px-6">
      <ContainerInstrument className="max-w-xl w-full bg-white p-12 md:p-16 rounded-[40px] shadow-aura text-center space-y-8 border border-black/5">
        <ContainerInstrument className="relative w-48 h-12 mx-auto mb-8">
          <Image  
            src="/assets/studio/vstudio-logo.webp" 
            alt="Voices Studio" 
            fill
            className="object-contain"
            priority
          />
        </ContainerInstrument>
        
        <ContainerInstrument className="space-y-4">
          <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter"><VoiceglotText  translationKey="studio.meeting.thanks.title" defaultText="Bedankt voor het gesprek!" /><TextInstrument className="text-va-black/50 font-medium text-lg leading-relaxed"><VoiceglotText  
              translationKey="studio.meeting.thanks.subtitle" 
              defaultText="Het was fijn om kennis te maken. We hebben de belangrijkste punten genoteerd en komen zo snel mogelijk bij je terug." 
            /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="pt-8">
          <Link  href="/studio" className="va-btn-pro inline-block"><VoiceglotText  translationKey="studio.meeting.thanks.cta" defaultText="Terug naar de Studio" /></Link>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
