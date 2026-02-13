'use client';
import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="space-y-8">
      {/* Date Selection */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={`flex-shrink-0 w-20 py-4 rounded-2xl border-2 transition-all ${
              isSameDay(day, selectedDate)
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-black/5 bg-white text-black/40 hover:border-black/10'
            }`}
          >
            <div className="text-[15px] font-black tracking-widest mb-1">
              {format(day, 'EEE', { locale: nlBE })}
            </div>
            <div className="text-xl font-black tracking-tighter">
              {format(day, 'd')}
            </div>
          </button>
        ))}
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        <AnimatePresence strokeWidth={1.5} mode="wait">
          {loading ? (
            <div className="col-span-full py-12 text-center animate-pulse text-black/20 font-black tracking-widest">
              Zoeken naar gaatjes...
            </div>
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
                className={`py-4 rounded-xl border-2 font-black tracking-tighter transition-all ${
                  selectedSlot?.start === slot.start
                    ? 'border-primary bg-primary text-white shadow-aura'
                    : 'border-black/5 bg-white text-black/60 hover:border-black/20'
                }`}
              >
                {slot.time}
              </motion.button>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-black/20 font-black tracking-widest">
              Geen plekjes vrij op deze dag.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
