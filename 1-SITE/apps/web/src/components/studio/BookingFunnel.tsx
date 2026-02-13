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

  // 🕵️ VOICE SEARCH LOGIC
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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setShowInterestForm(false)}
          className="text-[15px] font-black tracking-widest text-black/40 hover:text-black transition-colors flex items-center gap-2"
        >
          <ArrowLeft strokeWidth={1.5} size={12} /> Terug naar overzicht
        </button>
        <div className="p-8 bg-va-off-white rounded-3xl border border-black/5">
          <h4 className="text-xl font-black tracking-tighter mb-4">
            <VoiceglotText translationKey="studio.booking.notify_me.title" defaultText="Houd me op de hoogte" />
          </h4>
          <p className="text-[15px] text-black/60 mb-8 leading-relaxed">
            <VoiceglotText 
              translationKey="studio.booking.notify_me.text" 
              defaultText="Er zijn momenteel geen data gepland voor deze workshop. Laat je gegevens achter en we laten je als eerste weten wanneer er nieuwe edities beschikbaar zijn." 
            />
          </p>
          <form className="space-y-4">
            <input 
              type="email" 
              placeholder={t('common.placeholder.email', 'Jouw e-mailadres')} 
              className="w-full p-4 rounded-xl border border-black/10 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <button className="w-full py-4 bg-black text-white rounded-xl font-black tracking-widest text-[15px] hover:bg-primary transition-all">
              <VoiceglotText translationKey="common.send" defaultText="VERZENDEN" />
            </button>
          </form>
        </div>
      </div>
    );
  }
  const priceExclVatValue = selectedDate ? parseFloat(selectedDate.price) || priceExclVat : priceExclVat;

  const handleBooking = () => {
    playClick('premium');
    setIsBooking(true);
    // In a real implementation, this would trigger the cart logic or redirect
    setTimeout(() => {
      console.log(`Core Booking: ${title} for ${selectedDate?.date_raw}`);
      setIsBooking(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* 🔍 VOICE SEARCH (NEW) */}
      <div className="space-y-4">
        <div className="relative group">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('studio.booking.search_voice', "Zoek een stem (bijv. 'johfra')...")}
            className="w-full bg-va-off-white border border-black/5 rounded-2xl py-4 pl-12 pr-4 text-[15px] font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all group-hover:border-black/10"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={16} />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" size={16} />
          )}
        </div>

        {/* Search Results (VoiceCards) */}
        <AnimatePresence>
          {foundVoices.length > 0 && (
            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="text-[15px] font-black tracking-widest text-black/30 px-2">
                <VoiceglotText translationKey="studio.booking.found_voices" defaultText="Gevonden Stemmen" />
              </div>
              {foundVoices.map((voice) => (
                <div key={voice.id} className="scale-90 origin-top-left -mb-10 last:mb-0">
                  <VoiceCard voice={voice} onSelect={() => {
                    playClick('pro');
                    // Optioneel: actie bij selectie van een stem in de funnel
                    window.location.href = `/checkout?usage=telefonie&voice=${voice.id}`;
                  }} />
                </div>
              ))}
              <div className="pt-4 border-t border-black/5" />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* DATE SELECTOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[15px] font-black tracking-widest text-black/40">
            <VoiceglotText translationKey="studio.booking.available_dates" defaultText="Beschikbare Data" />
          </h4>
          <span className="text-[15px] font-bold text-primary tracking-widest flex items-center gap-1">
            <Info size={12} /> <VoiceglotText translationKey="studio.booking.limited_spots" defaultText="Slechts enkele plaatsen" />
          </span>
        </div>
        
        <div className="grid gap-3">
          {dates.length > 0 ? dates.map((date, index) => (
            <button
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
                "w-full p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between group",
                selectedDateIndex === index 
                  ? "bg-black border-black text-white shadow-xl scale-[1.02]" 
                  : "bg-va-off-white border-black/5 text-black/60 hover:border-black/20 hover:bg-white"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-colors",
                  selectedDateIndex === index ? "bg-white/10" : "bg-black/5"
                )}>
                  <Calendar strokeWidth={1.5} size={16} className={selectedDateIndex === index ? "text-primary" : "text-black/40"} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black tracking-tight">{date.date_raw}</div>
                  <div className="text-[15px] font-bold opacity-40 tracking-widest flex items-center gap-2 mt-0.5">
                    <MapPin size={10} /> {date.location}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black tracking-tighter">€{parseFloat(date.price || String(priceExclVatValue))}</div>
              </div>
            </button>
          )) : (
            <div className="p-8 rounded-2xl bg-va-off-white border border-dashed border-black/10 text-center">
              <p className="text-[15px] font-black tracking-widest text-black/30">
                <VoiceglotText translationKey="studio.booking.no_dates" defaultText="Geen data gepland" />
              </p>
              <button 
                onClick={() => setShowInterestForm(true)}
                className="text-[15px] font-black tracking-widest text-primary mt-2 hover:underline"
              >
                <VoiceglotText translationKey="studio.booking.notify_me.cta" defaultText="Houd me op de hoogte" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY & ACTION */}
      <div className="pt-8 border-t border-black/5 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[15px] font-black tracking-widest text-black/30 mb-1">
              <VoiceglotText translationKey="studio.booking.total_investment" defaultText="Totaal Investering" />
            </div>
            <div className="text-4xl font-black tracking-tighter">€{priceExclVatValue}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-[15px] font-bold text-green-500 tracking-widest mb-1">
              <Check strokeWidth={1.5}Circle2 size={12} /> <VoiceglotText translationKey="studio.booking.includes_lunch" defaultText="Inclusief lunch" />
            </div>
            <div className="flex items-center gap-2 text-[15px] font-bold text-green-500 tracking-widest">
              <Check strokeWidth={1.5}Circle2 size={12} /> <VoiceglotText translationKey="studio.booking.certificate" defaultText="Certificaat" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleBooking}
          disabled={isBooking || dates.length === 0}
          className={cn(
            "w-full py-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden",
            isBooking ? "bg-black/80 cursor-wait" : "bg-black text-white hover:bg-primary active:scale-95"
          )}
        >
          {isBooking ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              <VoiceglotText translationKey="common.processing" defaultText="VERWERKEN..." />
            </span>
          ) : (
            <>
              <VoiceglotText translationKey="studio.booking.cta" defaultText="NU INSCHRIJVEN" /> <ArrowRight strokeWidth={1.5} size={18} className="group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>
        
        <p className="text-[15px] text-center text-black/30 font-medium tracking-widest">
          <VoiceglotText translationKey="studio.booking.security_info" defaultText="Veilig betalen via Mollie • Directe bevestiging" />
        </p>
      </div>
    </div>
  );
};
