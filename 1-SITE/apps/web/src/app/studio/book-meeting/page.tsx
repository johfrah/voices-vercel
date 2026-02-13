'use client';
import React, { useState, Suspense } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { AppointmentPicker } from "@/components/studio/AppointmentPicker";
import { ZeroLossCheckoutInstrument } from "@/components/ui/ZeroLossCheckoutInstrument";
import { Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

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
            <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter">
              <VoiceglotText translationKey="studio.meeting.success.title" defaultText="Afspraak staat!" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/50 font-medium text-lg">
              <VoiceglotText 
                translationKey="studio.meeting.success.subtitle" 
                defaultText="Je ontvangt direct een bevestiging met de meeting link in je mailbox. Tot snel in de studio!" 
              />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="pt-8">
            <Link href="/studio" className="va-btn-pro">
              <VoiceglotText translationKey="common.back_to_home" defaultText="Terug naar home" />
            </Link>
          </ContainerInstrument>
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-20">
      <ContainerInstrument className="max-w-4xl mx-auto px-6">
        <SectionInstrument className="mb-16 text-center space-y-4">
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter">
            <VoiceglotText translationKey="studio.meeting.title" defaultText="Kennismaken" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium max-w-xl mx-auto text-lg">
            <VoiceglotText 
              translationKey="studio.meeting.subtitle" 
              defaultText="Plan een moment in met Johfrah om je potentieel te bespreken. De koffie staat klaar (virtueel of fysiek)." 
            />
          </TextInstrument>
        </SectionInstrument>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Step 1: Pick a slot */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black">1</div>
              <h2 className="text-xl font-black tracking-tight">Kies een moment</h2>
            </div>
            <AppointmentPicker onSelect={setSelectedSlot} />
          </div>

          {/* Step 2: Details & Confirm */}
          <div className={`space-y-8 transition-opacity duration-500 ${selectedSlot ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black">2</div>
              <h2 className="text-xl font-black tracking-tight">Jouw gegevens</h2>
            </div>
            
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
          </div>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
