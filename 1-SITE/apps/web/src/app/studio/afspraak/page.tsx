'use client';

import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { Calendar, CheckCircle2, RefreshCcw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';

import { AppointmentPicker } from "@/components/studio/AppointmentPicker";
import { ZeroLossCheckoutInstrument } from "@/components/ui/ZeroLossCheckoutInstrument";

export const dynamic = 'force-dynamic';

function AfspraakContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const isCancel = searchParams?.get('cancel') === '1';
  const manageToken = searchParams?.get('manage');
  const [isCancelled, setIsCancelled] = React.useState(false);
  const [loading, setLoading] = React.useState(isCancel);
  const [selectedSlot, setSelectedSlot] = React.useState<any>(null);
  const [isCompleted, setIsCompleted] = React.useState(false);

  React.useEffect(() => {
    if (isCancel && manageToken && !isCancelled) {
      const performCancel = async () => {
        try {
          const response = await fetch('/api/studio/afspraak/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: manageToken })
          });
          if (response.ok) {
            setIsCancelled(true);
          }
        } catch (error) {
          console.error('Cancellation failed:', error);
        } finally {
          setLoading(false);
        }
      };
      performCancel();
    }
  }, [isCancel, manageToken, isCancelled]);

  if (isCompleted) {
    return (
      <>
        <ContainerInstrument className="max-w-3xl mx-auto text-center space-y-8 py-20">
          <ContainerInstrument className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-aura animate-in zoom-in duration-700">
            <CheckCircle2 strokeWidth={1.5} size={48} />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-4">
            <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">
              <VoiceglotText  translationKey="studio.meeting.success.title" defaultText="Afspraak staat!" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/50 font-light text-[15px]">
              <VoiceglotText  
                translationKey="studio.meeting.success.subtitle" 
                defaultText="Je ontvangt direct een bevestiging met de meeting link in je mailbox. Tot snel in de studio!" 
              />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="pt-8">
            <Link  href="/studio" className="va-btn-pro"><VoiceglotText  translationKey="common.back_to_home" defaultText="Terug naar home" /></Link>
          </ContainerInstrument>
        </ContainerInstrument>
      </>
    );
  }

  if (loading) {
    return (
      <ContainerInstrument className="max-w-xl w-full bg-white p-12 md:p-16 rounded-[40px] shadow-aura text-center space-y-8 border border-black/5">
        <ContainerInstrument className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[15px] font-light tracking-widest text-va-black/60">
          <VoiceglotText  translationKey="studio.appointment.cancelling" defaultText="Afspraak annuleren..." />
        </p>
      </ContainerInstrument>
    );
  }

  if (isCancelled || (isCancel && !loading)) {
    return (
      <ContainerInstrument className="max-w-xl w-full bg-white p-12 md:p-16 rounded-[40px] shadow-aura text-center space-y-8 border border-black/5">
        <ContainerInstrument className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <XCircle strokeWidth={1.5} size={40} />
        </ContainerInstrument>
        
        <ContainerInstrument className="space-y-4">
          <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter">
            <VoiceglotText  translationKey="studio.appointment.cancel.title" defaultText="Afspraak geannuleerd" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/50 font-light text-[15px] leading-relaxed">
            <VoiceglotText  
              translationKey="studio.appointment.cancel.subtitle" 
              defaultText="Je afspraak is succesvol geannuleerd. We hebben je een e-mail gestuurd met een link om een nieuw moment in te plannen wanneer het jou uitkomt." 
            />
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="pt-8 flex flex-col gap-4">
          <Link  href="/studio/afspraak" className="va-btn-pro inline-flex items-center justify-center gap-2">
            <RefreshCcw strokeWidth={1.5} size={16} />
            <VoiceglotText  translationKey="studio.appointment.cancel.cta" defaultText="Nu herplannen" />
          </Link>
          <Link  href="/studio" className="text-[15px] font-light tracking-widest text-va-black/30 hover:text-primary transition-all"><VoiceglotText  translationKey="common.back_to_home" defaultText="Terug naar home" /></Link>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  if (manageToken) {
    return (
      <ContainerInstrument className="max-w-xl w-full bg-white p-12 md:p-16 rounded-[40px] shadow-aura text-center space-y-8 border border-black/5">
        <ContainerInstrument className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
          <Calendar strokeWidth={1.5} size={40} />
        </ContainerInstrument>
        
        <ContainerInstrument className="space-y-4">
          <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter">
            <VoiceglotText  translationKey="studio.appointment.manage.title" defaultText="Afspraak beheren" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/50 font-light text-[15px] leading-relaxed">
            <VoiceglotText  
              translationKey="studio.appointment.manage.subtitle" 
              defaultText="Wat wil je doen met je afspraak?" 
            />
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="pt-8 flex flex-col gap-4">
          <Link  href={`/studio/afspraak/?manage=${manageToken}&cancel=1`} className="va-btn-pro bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 inline-block"><VoiceglotText  translationKey="studio.appointment.manage.cancel_btn" defaultText="Afspraak annuleren" /></Link>
          <Link  href="/studio" className="text-[15px] font-light tracking-widest text-va-black/30 hover:text-primary transition-all"><VoiceglotText  translationKey="common.back_to_home" defaultText="Terug naar home" /></Link>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  // DEFAULT: BOOKING MODE
  return (
    <ContainerInstrument className="max-w-4xl w-full mx-auto px-6 py-20">
      <ContainerInstrument className="mb-16 text-center space-y-4">
        <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
          <VoiceglotText  translationKey="studio.meeting.title" defaultText="Kennismaken" />
        </HeadingInstrument>
        <TextInstrument className="text-va-black/40 font-light max-w-xl mx-auto text-[15px] text-center">
          <VoiceglotText  
            translationKey="studio.meeting.subtitle" 
            defaultText="Plan een moment in met Johfrah om je potentieel te bespreken. De koffie staat klaar (virtueel of fysiek)." 
          />
        </TextInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <ContainerInstrument className="space-y-8">
          <ContainerInstrument className="flex items-center gap-4">
            <ContainerInstrument className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black">1</ContainerInstrument>
            <h2 className="text-xl font-light tracking-tight">
              <VoiceglotText  translationKey="studio.appointment.step1" defaultText="Kies een moment" />
            </h2>
          </ContainerInstrument>
          <AppointmentPicker  onSelect={setSelectedSlot} />
        </ContainerInstrument>

        <ContainerInstrument className={`space-y-8 transition-opacity duration-500 ${selectedSlot ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <ContainerInstrument className="flex items-center gap-4">
            <ContainerInstrument className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-light">2</ContainerInstrument>
            <h2 className="text-xl font-light tracking-tight">
              <VoiceglotText  translationKey="studio.appointment.step2" defaultText="Jouw gegevens" />
            </h2>
          </ContainerInstrument>
          
          {selectedSlot && (
            <ZeroLossCheckoutInstrument 
              item={{
                name: t('studio.appointment.item_name', "Kennismakingsgesprek"),
                price: 0,
                date: new Date(selectedSlot.start).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
              }}
              onComplete={(data) => {
                console.log(' Meeting booked:', data, selectedSlot);
                setIsCompleted(true);
              }}
            />
          )}
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}

export default function AfspraakPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white flex items-center justify-center px-6">
      <Suspense  fallback={
        <ContainerInstrument className="animate-pulse text-va-black/20 font-light tracking-widest text-[15px]">
          <VoiceglotText  translationKey="common.loading" defaultText="Laden..." />
        </ContainerInstrument>
      }>
        <AfspraakContent   />
      </Suspense>
    </PageWrapperInstrument>
  );
}
