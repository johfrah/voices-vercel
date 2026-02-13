'use client';

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
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';

/**
 * STUDIO BOOKING FLOW
 * 
 * Doel: Een frictieloze booking flow.
 * ToV: Gastvrije Expert.
 */

function BookingContent() {
  const [isCompleted, setIsCompleted] = React.useState(false);
  const searchParams = useSearchParams();
  const workshopId = searchParams.get('id');
  
  // In een echte scenario zouden we hier de workshop data ophalen op basis van ID
  // Voor nu gebruiken we fallback data als er geen ID is
  const item = {
    name: workshopId ? `Workshop #${workshopId}` : "Stem & Presentatie Workshop",
    price: 395.00,
    date: "12 Februari 2026"
  };

  if (isCompleted) {
    return (
      <>
        <ContainerInstrument className="max-w-3xl mx-auto text-center space-y-8 py-20">
          <ContainerInstrument className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-aura animate-in zoom-in duration-700">
            <CheckCircle2 strokeWidth={1.5} size={48} />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-4">
            <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter"><VoiceglotText translationKey="studio.booking.success.title" defaultText="Je bent erbij!" /><TextInstrument className="text-va-black/50 font-medium text-lg"><VoiceglotText 
                translationKey="studio.booking.success.subtitle" 
                defaultText="We hebben je inschrijving goed ontvangen. Je ontvangt direct een bevestiging en factuur in je mailbox." 
              /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="pt-8">
            <Link href="/account/orders" className="va-btn-pro"><VoiceglotText translationKey="studio.booking.success.cta" defaultText="Bekijk mijn bestelling" /></Link>
          </ContainerInstrument>
        </ContainerInstrument>
      </>
    );
  }

  return (
    <>
      <SectionInstrument className="mb-20 text-center space-y-4">
        <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter"><VoiceglotText translationKey="studio.booking.title" defaultText="Reserveer je plek" /><TextInstrument className="text-va-black/40 font-medium max-w-xl mx-auto text-lg"><VoiceglotText 
            translationKey="studio.booking.subtitle" 
            defaultText="Vul je gegevens in om je inschrijving voor de workshop te voltooien." 
          /></TextInstrument></HeadingInstrument>
      </SectionInstrument>

      <ZeroLossCheckoutInstrument 
        item={item}
        onComplete={(data) => {
          console.log('🚀 Checkout completed:', data);
          setIsCompleted(true);
        }}
      />
    </>
  );
}

export default function BookingPage() {
  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20">
      <Suspense fallback={<div className="animate-pulse text-va-black/20 font-black tracking-widest text-center py-40"><VoiceglotText translationKey="auto.page.laden___.cb4395" defaultText="Laden..." /></div>}>
        <BookingContent />
      </Suspense>
    </PageWrapperInstrument>
  );
}
