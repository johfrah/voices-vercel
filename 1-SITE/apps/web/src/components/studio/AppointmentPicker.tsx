'use client';
import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '../ui/VoiceglotText';

interface TimeSlot {
  start: string;
  end: string;
  time: string;
}

export const AppointmentPicker: React.FC<{ onSelect: (slot: TimeSlot) => void }> = ({ onSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/studio/calendar/slots?date=${selectedDate.toISOString()}`);
        const data = await response.json();
        setSlots(data.slots || []);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  return (
    <ContainerInstrument className="space-y-6 md:space-y-8">
      {/* Date Selection */}
      <ContainerInstrument className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {days.map((day) => (
          <ButtonInstrument
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={`flex-shrink-0 w-20 py-3 md:py-4 rounded-2xl border-2 transition-all ${
              isSameDay(day, selectedDate)
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-black/5 bg-white text-black/40 hover:border-black/10'
            }`}
          >
            <TextInstrument className="text-[15px] font-black tracking-widest mb-1">
              {format(day, 'EEE', { locale: nlBE })}
            </TextInstrument>
            <TextInstrument className="text-lg md:text-xl font-black tracking-tighter">
              {format(day, 'd')}
            </TextInstrument>
          </ButtonInstrument>
        ))}
      </ContainerInstrument>

      {/* Time Selection */}
      <ContainerInstrument className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3">
        <AnimatePresence  mode="wait">
          {loading ? (
            <ContainerInstrument className="col-span-full py-8 md:py-12 text-center animate-pulse text-black/20 font-black tracking-widest">
              <VoiceglotText  translationKey="studio.calendar.searching_slots" defaultText="Zoeken naar gaatjes..." />
            </ContainerInstrument>
          ) : slots.length > 0 ? (
            slots.map((slot) => (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={slot.start}
                onClick={() => {
                  setSelectedSlot(slot);
                  onSelect(slot);
                }}
                className={`py-3 md:py-4 rounded-xl border-2 font-black tracking-tighter transition-all ${
                  selectedSlot?.start === slot.start
                    ? 'border-primary bg-primary text-white shadow-aura'
                    : 'border-black/5 bg-white text-black/60 hover:border-black/20'
                }`}
              >
                {slot.time}
              </motion.button>
            ))
          ) : (
            <ContainerInstrument className="col-span-full py-8 md:py-12 text-center text-black/20 font-black tracking-widest">
              <VoiceglotText  translationKey="studio.calendar.no_slots" defaultText="Geen plekjes vrij op deze dag." />
            </ContainerInstrument>
          )}
        </AnimatePresence>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
