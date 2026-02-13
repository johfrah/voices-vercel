"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import React from 'react';

export const WorkshopCalendar: React.FC<{ workshops: any[] }> = ({ workshops }) => {
  const { playClick } = useSonicDNA();
  const days = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  
  const handleDayClick = (day: number) => {
    playClick('light');
    // Atomic Mapping: Intent "booking" trigger
    window.location.href = `/studio/book?day=${day}`;
  };

  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-[40px] p-8 shadow-aura group/calendar">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-va-black text-white flex items-center justify-center shadow-lg group-hover/calendar:bg-primary transition-all duration-500">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-va-black">
              <VoiceglotText translationKey="studio.calendar.title" defaultText="Workshop Kalender" />
            </h3>
            <p className="text-[15px] font-black tracking-widest text-va-black/30 mt-1">
              <VoiceglotText translationKey="studio.calendar.month" defaultText="Februari 2026" />
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => playClick('light')}
            className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/40 hover:text-primary transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => playClick('light')}
            className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/40 hover:text-primary transition-all shadow-sm active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Mini Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {days.map(day => (
          <div key={day} className="text-center text-[15px] font-black tracking-widest text-va-black/20 py-2">
            <VoiceglotText translationKey={`common.day.${day.toLowerCase()}`} defaultText={day} />
          </div>
        ))}
        {[...Array(28)].map((_, i) => {
          const day = i + 1;
          const hasWorkshop = [12, 18, 24].includes(day);
          return (
            <div 
              key={i} 
              onClick={() => handleDayClick(day)}
              className={`aspect-square rounded-xl flex items-center justify-center text-[15px] font-bold transition-all cursor-pointer active:scale-90 ${
                hasWorkshop 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110 hover:rotate-3' 
                  : 'bg-va-off-white text-va-black/40 hover:bg-white hover:shadow-sm'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Upcoming List */}
      <div className="space-y-4">
        <h4 className="text-[15px] font-black tracking-widest text-va-black/30 mb-4">
          <VoiceglotText translationKey="studio.calendar.upcoming" defaultText="Eerstvolgende Sessies" />
        </h4>
        {workshops.slice(0, 2).map((workshop, i) => (
          <div 
            key={i} 
            onClick={() => playClick('deep')}
            className="p-4 rounded-2xl bg-white border border-black/5 flex items-center justify-between group hover:border-primary/20 hover:shadow-aura transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-va-off-white flex flex-col items-center justify-center group-hover:bg-primary/10 transition-all">
                <span className="text-[15px] font-black text-va-black/30 group-hover:text-primary transition-all">
                  <VoiceglotText translationKey="common.month.feb.short" defaultText="FEB" />
                </span>
                <span className="text-[15px] font-black text-va-black group-hover:text-primary transition-all">12</span>
              </div>
              <div>
                <h5 className="text-[15px] font-black tracking-tight">
                  <VoiceglotText translationKey={`workshop.${workshop.id}.title`} defaultText={workshop.title} noTranslate={true} />
                </h5>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[15px] font-bold text-va-black/30 tracking-widest">
                    <Clock size={10} /> 10:00 - 17:00
                  </div>
                  <div className="flex items-center gap-1 text-[15px] font-bold text-va-black/30 tracking-widest">
                    <MapPin size={10} /> <VoiceglotText translationKey="common.location.brussels" defaultText="Studio Brussel" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users size={12} className="text-va-black/20" />
              <span className="text-[15px] font-black text-va-black/40 tracking-widest">6/8</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
