'use client';
import { AppointmentPicker } from "@/components/studio/AppointmentPicker";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { ZeroLossCheckoutInstrument } from "@/components/ui/ZeroLossCheckoutInstrument";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from 'react';

export default function BookMeetingPage() {
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  if (isCompleted) {
    return (
      <PageWrapperInstrument className="min-h-screen bg-va-off-white flex items-center justify-center px-6">
        <ContainerInstrument className="max-w-3xl mx-auto text-center space-y-8 py-20">
          <ContainerInstrument className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-aura animate-in zoom-in duration-700">
            <CheckCircle2 strokeWidth={1.5} size={48} />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-4">
            <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter"><VoiceglotText translationKey="studio.meeting.success.title" defaultText="Afspraak staat!" /><TextInstrument className="text-va-black/50 font-light text-[15px]"><VoiceglotText 
                translationKey="studio.meeting.success.subtitle" 
                defaultText="Je ontvangt direct een bevestiging met de meeting link in je mailbox. Tot snel in de studio!" 
              /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="pt-8">
            <Link href="/studio" className="va-btn-pro"><VoiceglotText translationKey="common.back_to_home" defaultText="Terug naar home" /></Link>
          </ContainerInstrument>
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-20">
      <ContainerInstrument className="max-w-4xl mx-auto px-6">
        <SectionInstrument className="mb-16 text-center space-y-4">
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter"><VoiceglotText translationKey="studio.meeting.title" defaultText="Kennismaken" /><TextInstrument className="text-va-black/40 font-light max-w-xl mx-auto text-[15px]"><VoiceglotText 
              translationKey="studio.meeting.subtitle" 
              defaultText="Plan een moment in met Johfrah om je potentieel te bespreken. De koffie staat klaar (virtueel of fysiek)." 
            /></TextInstrument></HeadingInstrument>
        </SectionInstrument>

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Step 1: Pick a slot */}
          <ContainerInstrument className="space-y-8">
            <ContainerInstrument className="flex items-center gap-4">
              <ContainerInstrument className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-light">1</ContainerInstrument>
              <h2 className="text-xl font-light tracking-tight"><VoiceglotText translationKey="auto.page.kies_een_moment.6552a2" defaultText="Kies een moment" /></h2>
            </ContainerInstrument>
            <AppointmentPicker onSelect={setSelectedSlot} />
          </ContainerInstrument>

          {/* Step 2: Details & Confirm */}
          <ContainerInstrument className={`space-y-8 transition-opacity duration-500 ${selectedSlot ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <ContainerInstrument className="flex items-center gap-4">
              <ContainerInstrument className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-light">2</ContainerInstrument>
              <h2 className="text-xl font-light tracking-tight"><VoiceglotText translationKey="auto.page.jouw_gegevens.dbb685" defaultText="Jouw gegevens" /></h2>
            </ContainerInstrument>
            
            {selectedSlot && (
              <ZeroLossCheckoutInstrument 
                item={{
                  name: "Kennismakingsgesprek",
                  price: 0,
                  date: new Date(selectedSlot.start).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                }}
                onComplete={(data) => {
                  console.log('🚀 Meeting booked:', data, selectedSlot);
                  setIsCompleted(true);
                }}
              />
            )}
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
