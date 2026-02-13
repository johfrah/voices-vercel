"use client";

import { VoiceCard } from '@/components/ui/VoiceCard';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { Actor } from '@/types';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument,
  HeadingInstrument,
  InputInstrument,
  LabelInstrument
} from '@/components/ui/LayoutInstruments';

interface WorkshopDate {
  date_raw: string;
  price: string;
  location: string;
  capacity: number;
  time?: string;
}

interface BookingFunnelProps {
  workshopId: number;
  title: string;
  priceExclVat: number;
  dates: WorkshopDate[];
  onDateSelect?: (index: number) => void;
  selectedDateIndex?: number;
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
  const [internalIndex, setInternalIndex] = useState<number>(0);
  const [isBooking, setIsBooking] = useState(false);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [foundVoices, setFoundVoices] = useState<Actor[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const selectedDateIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const selectedDate = dates[selectedDateIndex] || null;

  useEffect(() => {
    const searchVoices = async () => {
      if (searchQuery.length < 3) {
        setFoundVoices([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/agency/actors?search=${encodeURIComponent(searchQuery)}&journey=studio`);
        if (res.ok) {
          const { results } = await res.json();
          setFoundVoices(results || []);
        }
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchVoices, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (showInterestForm) {
    return (
      <ContainerInstrument className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ButtonInstrument 
          onClick={() => setShowInterestForm(false)}
          className="text-[15px] font-light tracking-widest text-va-black/40 hover:text-va-black transition-colors flex items-center gap-2 p-0 bg-transparent "
        >
          <Image  src="/assets/common/branding/icons/BACK.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} /> 
          <VoiceglotText  translationKey="common.back_to_overview" defaultText="Terug naar overzicht" />
        </ButtonInstrument>
        <ContainerInstrument className="p-6 md:p-8 bg-va-off-white rounded-[20px] border border-va-black/5">
          <HeadingInstrument level={4} className="text-xl font-light tracking-tight mb-4 text-va-black">
            <VoiceglotText  translationKey="studio.booking.notify_me.title" defaultText="Houd me op de hoogte" />
          </HeadingInstrument>
          <TextInstrument className="text-[15px] text-va-black/60 mb-6 md:mb-8 leading-relaxed font-light">
            <VoiceglotText  
              translationKey="studio.booking.notify_me.text" 
              defaultText="Er zijn momenteel geen data gepland voor deze workshop. Laat je gegevens achter en we laten je als eerste weten wanneer er nieuwe edities beschikbaar zijn." 
            />
          </TextInstrument>
          <form className="space-y-3 md:space-y-4">
            <InputInstrument 
              type="email" 
              placeholder={t('common.placeholder.email', 'Jouw e-mailadres')} 
              className="w-full p-3 md:p-4 !rounded-[10px] border border-va-black/10 text-[15px] outline-none transition-all"
            />
            <ButtonInstrument className="w-full py-3 md:py-4 bg-va-black text-white rounded-[10px] font-light tracking-widest text-[15px] hover:bg-primary transition-all ">
              <VoiceglotText  translationKey="common.send" defaultText="Verzenden" />
            </ButtonInstrument>
          </form>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }
  const priceExclVatValue = selectedDate ? parseFloat(selectedDate.price) || priceExclVat : priceExclVat;

  const handleBooking = () => {
    playClick('premium');
    setIsBooking(true);
    setTimeout(() => {
      console.log(`Core Booking: ${title} for ${selectedDate?.date_raw}`);
      setIsBooking(false);
    }, 1500);
  };

  return (
    <ContainerInstrument className="space-y-6 md:space-y-8">
      {/* 🔍 VOICE SEARCH */}
      <ContainerInstrument className="space-y-3 md:space-y-4">
        <ContainerInstrument className="relative group">
            <InputInstrument 
              type="text"
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              placeholder={t('studio.booking.search_voice', "Zoek een stem (bijv. 'johfra')...")}
              className="w-full bg-va-off-white border border-va-black/5 rounded-[20px] py-3 px-4 md:py-4 md:pl-12 md:pr-4 pl-10 text-[15px] font-light focus:ring-2 focus:ring-primary/20 outline-none transition-all group-hover:border-va-black/10"
            />
            <Image  src="/assets/common/branding/icons/SEARCH.svg" width={16} height={16} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            {isSearching && (
              <ContainerInstrument className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></ContainerInstrument>
            )}
          </ContainerInstrument>

        <AnimatePresence>
          {foundVoices.length > 0 && (
            <ContainerInstrument className="grid grid-cols-1 gap-3 md:gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 px-2 ">
                <VoiceglotText  translationKey="studio.booking.found_voices" defaultText="Gevonden Stemmen" />
              </TextInstrument>
              {foundVoices.map((voice) => (
                <ContainerInstrument key={voice.id} className="scale-90 origin-top-left -mb-8 md:-mb-10 last:mb-0">
                  <VoiceCard voice={voice} onSelect={() => {
                    playClick('pro');
                    window.location.href = `/checkout?usage=telefonie&voice=${voice.id}`;
                  }} />
                </ContainerInstrument>
              ))}
              <ContainerInstrument className="pt-4 border-t border-va-black/5" />
            </ContainerInstrument>
          )}
        </AnimatePresence>
      </ContainerInstrument>

      {/* DATE SELECTOR */}
      <ContainerInstrument className="space-y-3 md:space-y-4">
        <ContainerInstrument className="flex items-center justify-between">
          <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-va-black/40 ">
            <VoiceglotText  translationKey="studio.booking.available_dates" defaultText="Beschikbare Data" />
          </HeadingInstrument>
          <TextInstrument className="text-[15px] font-light text-primary tracking-widest flex items-center gap-1 ">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} /> 
            <VoiceglotText  translationKey="studio.booking.limited_spots" defaultText="Slechts enkele plaatsen" />
          </TextInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="grid gap-2 md:gap-3">
          {dates.length > 0 ? dates.map((date, index) => (
            <ButtonInstrument
              key={index}
              onClick={() => {
                playClick('light');
                if (onDateSelect) {
                  onDateSelect(index);
                } else {
                  setInternalIndex(index);
                }
              }}
              className={cn(
                "w-full p-4 md:p-5 rounded-[20px] border transition-all duration-500 flex items-center justify-between group",
                selectedDateIndex === index 
                  ? "bg-va-black border-va-black text-white shadow-aura scale-[1.02]" 
                  : "bg-va-off-white border-va-black/5 text-va-black/60 hover:border-va-black/20 hover:bg-white"
              )}
            >
              <ContainerInstrument className="flex items-center gap-3 md:gap-4">
                <ContainerInstrument className={cn(
                  "w-10 h-10 rounded-[10px] flex flex-col items-center justify-center transition-colors",
                  selectedDateIndex === index ? "bg-white/10" : "bg-va-black/5"
                )}>
                  <Image  src="/assets/common/branding/icons/INFO.svg" width={16} height={16} alt="" className={selectedDateIndex === index ? "brightness-0 invert" : ""} style={selectedDateIndex !== index ? { filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 } : {}} />
                </ContainerInstrument>
                <ContainerInstrument className="text-left">
                  <TextInstrument className="text-[15px] font-light tracking-tight">{date.date_raw}</TextInstrument>
                  <TextInstrument className="text-[15px] font-light opacity-40 tracking-widest flex items-center gap-2 mt-0.5 ">
                    <Image  src="/assets/common/branding/icons/INFO.svg" width={10} height={10} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} /> {date.location}
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="text-right">
                <TextInstrument className="text-[15px] font-light tracking-tighter">€{parseFloat(date.price || String(priceExclVatValue))}</TextInstrument>
              </ContainerInstrument>
            </ButtonInstrument>
          )) : (
            <ContainerInstrument className="p-6 md:p-8 rounded-[20px] bg-va-off-white border border-dashed border-va-black/10 text-center">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 ">
                <VoiceglotText  translationKey="studio.booking.no_dates" defaultText="Geen data gepland" />
              </TextInstrument>
              <ButtonInstrument 
                onClick={() => setShowInterestForm(true)}
                className="text-[15px] font-light tracking-widest text-primary mt-2 hover:underline p-0 bg-transparent "
              >
                <VoiceglotText  translationKey="studio.booking.notify_me.cta" defaultText="Houd me op de hoogte" />
              </ButtonInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </ContainerInstrument>

      {/* SUMMARY & ACTION */}
      <ContainerInstrument className="pt-6 md:pt-8 border-t border-va-black/5 space-y-4 md:space-y-6">
        <ContainerInstrument className="flex justify-between items-end">
          <ContainerInstrument>
            <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 mb-1 ">
              <VoiceglotText  translationKey="studio.booking.total_investment" defaultText="Totaal Investering" />
            </TextInstrument>
            <TextInstrument className="text-3xl md:text-4xl font-light tracking-tighter">€{priceExclVatValue}</TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="text-right">
            <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light text-emerald-500 tracking-widest mb-1 ">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} /> 
              <VoiceglotText  translationKey="studio.booking.includes_lunch" defaultText="Inclusief lunch" />
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light text-emerald-500 tracking-widest ">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} /> 
              <VoiceglotText  translationKey="studio.booking.certificate" defaultText="Certificaat" />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ButtonInstrument 
          onClick={handleBooking}
          disabled={isBooking || dates.length === 0}
          className={cn(
            "w-full py-4 md:py-6 rounded-[10px] font-light tracking-widest text-[15px] transition-all duration-500 shadow-aura flex items-center justify-center gap-3 group relative overflow-hidden",
            isBooking ? "bg-va-black/80 cursor-wait" : "bg-va-black text-white hover:bg-primary active:scale-95"
          )}
        >
          {isBooking ? (
            <ContainerInstrument className="flex items-center gap-2">
              <ContainerInstrument className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></ContainerInstrument>
              <VoiceglotText  translationKey="common.processing" defaultText="Verwerken..." />
            </ContainerInstrument>
          ) : (
            <>
              <VoiceglotText  translationKey="studio.booking.cta" defaultText="Nu inschrijven" /> 
              <Image  src="/assets/common/branding/icons/FORWARD.svg" width={18} height={18} alt="" className="brightness-0 invert group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </ButtonInstrument>
        
        <TextInstrument className="text-[15px] text-center text-va-black/30 font-light tracking-widest ">
          <VoiceglotText  translationKey="studio.booking.security_info" defaultText="Veilig betalen via Mollie • Directe bevestiging" />
        </TextInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
