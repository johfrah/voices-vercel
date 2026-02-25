"use client";

import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    InputInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface WorkshopDate {
  date_raw: string;
  price: string;
  location: string;
  capacity: number;
  filled?: number; //  Aantal deelnemers
  time?: string;
  includes_lunch?: boolean;
  includes_certificate?: boolean;
}

interface BookingFunnelProps {
  workshopId: number;
  title: string;
  priceExclVat: number;
  dates: WorkshopDate[];
  onDateSelect?: (index: number) => void;
  selectedDateIndex?: number;
  isLoading?: boolean;
}

export const BookingFunnel: React.FC<BookingFunnelProps> = ({ 
  workshopId, 
  title, 
  priceExclVat, 
  dates,
  onDateSelect,
  selectedDateIndex: controlledIndex
}) => {
  const { playClick } = useSonicDNA();
  const { t } = useTranslation();
  const router = useRouter();
  const { addItem, setJourney, setStep, updateCustomer } = useCheckout();
  const [internalIndex, setInternalIndex] = useState<number>(0);
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedDateIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const selectedDate = dates[selectedDateIndex] || null;
  const hasDates = dates.length > 0;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age: '',
    profession: ''
  });

  const handleBooking = () => {
    playClick('premium');
    setIsBooking(true);
    
    //  NUCLEAR WORKSHOP SPA ENGINE
    // We voegen de workshop toe aan de checkout en navigeren direct.
    const workshopItem = {
      id: `workshop-${workshopId}-${Date.now()}`,
      type: 'workshop_edition',
      name: title,
      price: priceExclVatValue,
      date: selectedDate?.date_raw,
      location: selectedDate?.location,
      pricing: {
        total: priceExclVatValue,
        subtotal: priceExclVatValue
      }
    };

    // Update customer info in context
    updateCustomer({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email
    });

    // Add to cart and set journey
    addItem(workshopItem);
    setJourney('studio', workshopId);
    setStep('details'); // Direct naar de details stap in de checkout

    setTimeout(() => {
      setIsBooking(false);
      router.push('/checkout');
    }, 800);
  };

  
  if (isLoading) {
    return (
      <ContainerInstrument plain className="space-y-8 animate-pulse">
        <ContainerInstrument plain className="space-y-4">
          <div className="h-4 w-32 bg-va-black/5 rounded-full mb-4" />
          <div className="grid gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="w-full h-[84px] rounded-[15px] bg-va-black/5 border border-va-black/5" />
            ))}
          </div>
        </ContainerInstrument>
        <ContainerInstrument plain className="space-y-4">
          <div className="h-4 w-32 bg-va-black/5 rounded-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={cn("h-[54px] bg-va-black/5 rounded-[10px]", i === 3 && "md:col-span-2")} />
            ))}
          </div>
        </ContainerInstrument>
        <div className="pt-8 border-t border-va-black/5">
          <div className="w-full h-[68px] bg-va-black/5 rounded-[10px]" />
        </div>
      </ContainerInstrument>
    );
  }

  if (isSuccess) {
    return (
      <ContainerInstrument className="space-y-6 py-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <ContainerInstrument className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Image src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" style={{ filter: 'invert(58%) sepia(68%) saturate(534%) hue-rotate(113deg) brightness(94%) contrast(91%)' }} />
        </ContainerInstrument>
        <HeadingInstrument level={3} className="text-2xl font-light tracking-tight text-va-black">
          {hasDates ? <VoiceglotText translationKey="studio.booking.success.title" defaultText="Bedankt voor je inschrijving!" /> : <VoiceglotText translationKey="studio.booking.notify_me.success.title" defaultText="Je staat op de lijst!" />}
        </HeadingInstrument>
        <TextInstrument className="text-[15px] text-va-black/60 font-light leading-relaxed max-w-[240px] mx-auto">
          {hasDates 
            ? <VoiceglotText translationKey="studio.booking.success.text" defaultText="We hebben je gegevens ontvangen. Je ontvangt binnen enkele minuten een bevestiging per e-mail." />
            : <VoiceglotText translationKey="studio.booking.notify_me.success.text" defaultText="We laten je als eerste weten wanneer er een nieuwe datum voor deze workshop beschikbaar is." />}
        </TextInstrument>
        <ButtonInstrument 
          onClick={() => setIsSuccess(false)}
          className="text-[15px] font-light tracking-widest text-primary mt-8 hover:underline"
        >
          <VoiceglotText translationKey="common.close" defaultText="Sluiten" />
        </ButtonInstrument>
      </ContainerInstrument>
    );
  }

  const priceExclVatValue = selectedDate ? parseFloat(selectedDate.price) || priceExclVat : priceExclVat;

  return (
    <ContainerInstrument plain className="space-y-8">
      {/*  DATE SELECTOR (Alleen tonen als er data zijn) */}
      {hasDates && (
        <ContainerInstrument plain className="space-y-4">
        <HeadingInstrument level={4} className="text-[15px] font-light tracking-[0.2em] text-va-black/60 ">
          <VoiceglotText translationKey="studio.booking.select_date" defaultText="Kies je datum" />
        </HeadingInstrument>

          <ContainerInstrument plain className="grid gap-3">
            {dates.map((date, index) => (
              <ButtonInstrument
                key={index}
                onClick={() => {
                  playClick('light');
                  if (onDateSelect) onDateSelect(index);
                  else setInternalIndex(index);
                }}
                className={cn(
                  "w-full p-5 rounded-[15px] border transition-all duration-500 flex items-center justify-between group text-left",
                  selectedDateIndex === index 
                    ? "bg-va-black border-va-black text-white shadow-aura" 
                    : "bg-va-off-white border-va-black/5 text-va-black/80 hover:border-va-black/20 hover:bg-white"
                )}
              >
                <ContainerInstrument plain className="flex-1">
                  <ContainerInstrument plain className="flex items-center gap-3">
                    <TextInstrument className="text-[15px] font-light tracking-tight text-inherit">{date.date_raw}</TextInstrument>
                    {date.capacity && (
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase",
                        (date.capacity - (date.filled || 0)) <= 0 
                          ? "bg-red-500/20 text-red-500" 
                          : (date.capacity - (date.filled || 0)) <= 2 
                            ? "bg-primary/20 text-primary animate-pulse" 
                            : "bg-va-black/10 text-va-black/40"
                      )}>
                        {(date.capacity - (date.filled || 0)) <= 0 
                          ? <VoiceglotText translationKey="common.full" defaultText="VOLZET" /> 
                          : (date.capacity - (date.filled || 0)) <= 2 
                            ? <VoiceglotText translationKey="common.last_spots" defaultText={t('common.last_spots_count', `LAATSTE ${ (date.capacity - (date.filled || 0)) === 1 ? 'PLEK' : 'PLEKKEN' }`, { count: date.capacity - (date.filled || 0) })} /> 
                            : <VoiceglotText translationKey="common.available" defaultText="BESCHIKBAAR" />}
                      </div>
                    )}
                  </ContainerInstrument>
                  <TextInstrument className="text-[15px] font-light opacity-60 tracking-widest mt-1 text-inherit">
                    {date.location}  {date.time}
                  </TextInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[15px] font-light tracking-tighter ml-4 text-inherit">
                  € {parseFloat(date.price || String(priceExclVatValue))}
                </TextInstrument>
              </ButtonInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>
      )}

      {/*  REGISTRATION FORM */}
      <ContainerInstrument plain className="space-y-4">
        <HeadingInstrument level={4} className="text-[15px] font-light tracking-[0.2em] text-va-black/60 ">
          {hasDates ? (
            <VoiceglotText translationKey="studio.booking.your_details" defaultText="Jouw gegevens" />
          ) : (
            <VoiceglotText translationKey="studio.booking.notify_me.title" defaultText="Houd me op de hoogte" />
          )}
        </HeadingInstrument>

        {!hasDates && (
          <TextInstrument className="text-[15px] text-va-black/80 font-light leading-relaxed mb-4">
            <VoiceglotText translationKey="studio.booking.notify_me.text" defaultText="Er zijn momenteel geen data gepland. Laat je gegevens achter en we laten je weten wanneer er een nieuwe editie is." />
          </TextInstrument>
        )}

        <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputInstrument 
            placeholder={t('common.placeholder.first_name', "Voornaam")}
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            className="w-full p-4 bg-va-off-white border border-va-black/5 rounded-[10px] text-[15px] font-light outline-none focus:border-primary/30 transition-all"
          />
          <InputInstrument 
            placeholder={t('common.placeholder.last_name', "Familienaam")}
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            className="w-full p-4 bg-va-off-white border border-va-black/5 rounded-[10px] text-[15px] font-light outline-none focus:border-primary/30 transition-all"
          />
          
          <InputInstrument 
            type="email"
            placeholder={t('common.placeholder.email', "Emailadres")}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-4 bg-va-off-white border border-va-black/5 rounded-[10px] text-[15px] font-light outline-none focus:border-primary/30 transition-all md:col-span-2"
          />

          <InputInstrument 
            placeholder={t('common.placeholder.age', "Leeftijd")}
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="w-full p-4 bg-va-off-white border border-va-black/5 rounded-[10px] text-[15px] font-light outline-none focus:border-primary/30 transition-all"
          />
          <InputInstrument 
            placeholder={t('common.placeholder.profession', "Beroep")}
            value={formData.profession}
            onChange={(e) => setFormData({...formData, profession: e.target.value})}
            className="w-full p-4 bg-va-off-white border border-va-black/5 rounded-[10px] text-[15px] font-light outline-none focus:border-primary/30 transition-all"
          />
        </ContainerInstrument>
      </ContainerInstrument>

      {/* SUMMARY & ACTION */}
      <ContainerInstrument plain className={cn("pt-8 border-t border-va-black/5 space-y-6", !hasDates && "border-none pt-0")}>
        {hasDates && (
          <ContainerInstrument plain className="flex justify-between items-end">
            <ContainerInstrument plain>
              <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-va-black/60 mb-1 ">
                <VoiceglotText translationKey="studio.booking.total_investment" defaultText="Totaal Investering" />
              </TextInstrument>
              <TextInstrument className="text-4xl font-light tracking-tighter text-va-black">{priceExclVatValue}</TextInstrument>
              <TextInstrument className="text-[15px] font-light opacity-60 tracking-widest mt-1">
                <VoiceglotText translationKey="common.excl_vat" defaultText="Excl. BTW" />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument plain className="text-right space-y-1">
              {selectedDate?.includes_lunch && (
                <ContainerInstrument plain className="flex items-center justify-end gap-2 text-[15px] font-light text-emerald-700 tracking-widest ">
                  <VoiceglotText translationKey="studio.booking.includes_lunch" defaultText="Inclusief lunch" />
                </ContainerInstrument>
              )}
              {selectedDate?.includes_certificate && (
                <ContainerInstrument plain className="flex items-center justify-end gap-2 text-[15px] font-light text-emerald-700 tracking-widest ">
                  <VoiceglotText translationKey="studio.booking.certificate" defaultText="Certificaat" />
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          </ContainerInstrument>
        )}

        <ButtonInstrument 
          onClick={handleBooking}
          disabled={isBooking}
          className={cn(
            "w-full py-6 rounded-[10px] font-light tracking-widest text-[15px] transition-all duration-500 shadow-aura flex items-center justify-center gap-3 group",
            isBooking ? "bg-va-black/80 cursor-wait" : "bg-va-black text-white hover:bg-primary active:scale-95"
          )}
        >
          {isBooking ? (
            <ContainerInstrument className="flex items-center gap-2">
              <ContainerInstrument className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></ContainerInstrument>
              <VoiceglotText translationKey="common.processing" defaultText="Verwerken..." />
            </ContainerInstrument>
          ) : (
            <>
              <VoiceglotText 
                translationKey={hasDates ? "studio.booking.cta" : "studio.booking.notify_me.cta_v2"} 
                defaultText={hasDates ? "Nu inschrijven" : "Op de hoogte blijven"} 
              /> 
              <Image src="/assets/common/branding/icons/FORWARD.svg" width={18} height={18} alt="" className="brightness-0 invert group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </ButtonInstrument>
        
        {hasDates && (
          <TextInstrument className="text-[15px] text-center text-va-black/60 font-light tracking-[0.2em] ">
            <VoiceglotText translationKey="studio.booking.security_info" defaultText="Veilig betalen via Mollie • Directe bevestiging" />
          </TextInstrument>
        )}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
