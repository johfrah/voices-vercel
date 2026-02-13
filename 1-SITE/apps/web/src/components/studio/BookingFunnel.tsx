"use client";

import { VoiceCard } from '@/components/ui/VoiceCard';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { Actor } from '@/types';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Info, Loader2, MapPin, Search } from "lucide-react";
import React, { useEffect, useState } from 'react';
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
      <ContainerInstrument className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ButtonInstrument 
          onClick={() => setShowInterestForm(false)}
          className="text-[13px] font-light tracking-widest text-va-black/40 hover:text-va-black transition-colors flex items-center gap-2 p-0 bg-transparent uppercase"
        >
          <ArrowLeft strokeWidth={1.5} size={12} /> 
          <VoiceglotText translationKey="common.back_to_overview" defaultText="Terug naar overzicht" />
        </ButtonInstrument>
        <ContainerInstrument className="p-8 bg-va-off-white rounded-[20px] border border-va-black/5">
          <HeadingInstrument level={4} className="text-xl font-light tracking-tight mb-4">
            <VoiceglotText translationKey="studio.booking.notify_me.title" defaultText="Houd me op de hoogte" />
          </HeadingInstrument>
          <TextInstrument className="text-[15px] text-va-black/60 mb-8 leading-relaxed font-light">
            <VoiceglotText 
              translationKey="studio.booking.notify_me.text" 
              defaultText="Er zijn momenteel geen data gepland voor deze workshop. Laat je gegevens achter en we laten je als eerste weten wanneer er nieuwe edities beschikbaar zijn." 
            />
          </TextInstrument>
          <form className="space-y-4">
            <InputInstrument 
              type="email" 
              placeholder={t('common.placeholder.email', 'Jouw e-mailadres')} 
              className="w-full p-4 !rounded-[10px] border border-va-black/10 text-[15px] outline-none transition-all"
            />
            <ButtonInstrument className="w-full py-4 bg-va-black text-white rounded-[10px] font-medium tracking-widest text-[13px] hover:bg-primary transition-all uppercase">
              <VoiceglotText translationKey="common.send" defaultText="VERZENDEN" />
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
    <ContainerInstrument className="space-y-8">
      {/* 🔍 VOICE SEARCH */}
      <ContainerInstrument className="space-y-4">
        <ContainerInstrument className="relative group">
          <InputInstrument 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('studio.booking.search_voice', "Zoek een stem (bijv. 'johfra')...")}
            className="w-full bg-va-off-white border border-va-black/5 rounded-[20px] py-4 pl-12 pr-4 text-[15px] font-light focus:ring-2 focus:ring-primary/20 outline-none transition-all group-hover:border-va-black/10"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={16} strokeWidth={1.5} />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" size={16} strokeWidth={1.5} />
          )}
        </ContainerInstrument>

        <AnimatePresence>
          {foundVoices.length > 0 && (
            <ContainerInstrument className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <TextInstrument className="text-[13px] font-light tracking-widest text-va-black/30 px-2 uppercase">
                <VoiceglotText translationKey="studio.booking.found_voices" defaultText="Gevonden Stemmen" />
              </TextInstrument>
              {foundVoices.map((voice) => (
                <ContainerInstrument key={voice.id} className="scale-90 origin-top-left -mb-10 last:mb-0">
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
      <ContainerInstrument className="space-y-4">
        <ContainerInstrument className="flex items-center justify-between">
          <HeadingInstrument level={4} className="text-[13px] font-light tracking-widest text-va-black/40 uppercase">
            <VoiceglotText translationKey="studio.booking.available_dates" defaultText="Beschikbare Data" />
          </HeadingInstrument>
          <TextInstrument className="text-[13px] font-light text-primary tracking-widest flex items-center gap-1 uppercase">
            <Info size={12} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="studio.booking.limited_spots" defaultText="Slechts enkele plaatsen" />
          </TextInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="grid gap-3">
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
                "w-full p-5 rounded-[20px] border transition-all duration-500 flex items-center justify-between group",
                selectedDateIndex === index 
                  ? "bg-va-black border-va-black text-white shadow-aura scale-[1.02]" 
                  : "bg-va-off-white border-va-black/5 text-va-black/60 hover:border-va-black/20 hover:bg-white"
              )}
            >
              <ContainerInstrument className="flex items-center gap-4">
                <ContainerInstrument className={cn(
                  "w-10 h-10 rounded-[10px] flex flex-col items-center justify-center transition-colors",
                  selectedDateIndex === index ? "bg-white/10" : "bg-va-black/5"
                )}>
                  <Calendar strokeWidth={1.5} size={16} className={selectedDateIndex === index ? "text-primary" : "text-va-black/40"} />
                </ContainerInstrument>
                <ContainerInstrument className="text-left">
                  <TextInstrument className="text-[15px] font-medium tracking-tight">{date.date_raw}</TextInstrument>
                  <TextInstrument className="text-[12px] font-light opacity-40 tracking-widest flex items-center gap-2 mt-0.5 uppercase">
                    <MapPin size={10} strokeWidth={1.5} /> {date.location}
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="text-right">
                <TextInstrument className="text-[15px] font-medium tracking-tighter">€{parseFloat(date.price || String(priceExclVatValue))}</TextInstrument>
              </ContainerInstrument>
            </ButtonInstrument>
          )) : (
            <ContainerInstrument className="p-8 rounded-[20px] bg-va-off-white border border-dashed border-va-black/10 text-center">
              <TextInstrument className="text-[13px] font-light tracking-widest text-va-black/30 uppercase">
                <VoiceglotText translationKey="studio.booking.no_dates" defaultText="Geen data gepland" />
              </TextInstrument>
              <ButtonInstrument 
                onClick={() => setShowInterestForm(true)}
                className="text-[13px] font-light tracking-widest text-primary mt-2 hover:underline p-0 bg-transparent uppercase"
              >
                <VoiceglotText translationKey="studio.booking.notify_me.cta" defaultText="Houd me op de hoogte" />
              </ButtonInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </ContainerInstrument>

      {/* SUMMARY & ACTION */}
      <ContainerInstrument className="pt-8 border-t border-va-black/5 space-y-6">
        <ContainerInstrument className="flex justify-between items-end">
          <ContainerInstrument>
            <TextInstrument className="text-[13px] font-light tracking-widest text-va-black/30 mb-1 uppercase">
              <VoiceglotText translationKey="studio.booking.total_investment" defaultText="Totaal Investering" />
            </TextInstrument>
            <TextInstrument className="text-4xl font-light tracking-tighter">€{priceExclVatValue}</TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="text-right">
            <ContainerInstrument className="flex items-center gap-2 text-[13px] font-light text-emerald-500 tracking-widest mb-1 uppercase">
              <CheckCircle2 strokeWidth={1.5} size={12} /> 
              <VoiceglotText translationKey="studio.booking.includes_lunch" defaultText="Inclusief lunch" />
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 text-[13px] font-light text-emerald-500 tracking-widest uppercase">
              <CheckCircle2 strokeWidth={1.5} size={12} /> 
              <VoiceglotText translationKey="studio.booking.certificate" defaultText="Certificaat" />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ButtonInstrument 
          onClick={handleBooking}
          disabled={isBooking || dates.length === 0}
          className={cn(
            "w-full py-6 rounded-[10px] font-medium uppercase tracking-widest text-[13px] transition-all duration-500 shadow-aura flex items-center justify-center gap-3 group relative overflow-hidden",
            isBooking ? "bg-va-black/80 cursor-wait" : "bg-va-black text-white hover:bg-primary active:scale-95"
          )}
        >
          {isBooking ? (
            <ContainerInstrument className="flex items-center gap-2">
              <ContainerInstrument className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></ContainerInstrument>
              <VoiceglotText translationKey="common.processing" defaultText="VERWERKEN..." />
            </ContainerInstrument>
          ) : (
            <>
              <VoiceglotText translationKey="studio.booking.cta" defaultText="NU INSCHRIJVEN" /> 
              <ArrowRight strokeWidth={1.5} size={18} className="group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </ButtonInstrument>
        
        <TextInstrument className="text-[12px] text-center text-va-black/30 font-light tracking-widest uppercase">
          <VoiceglotText translationKey="studio.booking.security_info" defaultText="Veilig betalen via Mollie • Directe bevestiging" />
        </TextInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
