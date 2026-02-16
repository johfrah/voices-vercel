"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import React from 'react';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument,
  HeadingInstrument
} from '@/components/ui/LayoutInstruments';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const WorkshopCalendar: React.FC<{ workshops: any[] }> = ({ workshops }) => {
  const { playClick } = useSonicDNA();
  const days = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  
  const handleDayClick = (day: number) => {
    playClick('light');
    window.location.href = `/studio/book?day=${day}`;
  };

  return (
    <ContainerInstrument plain className="bg-white/40 backdrop-blur-md border border-white/20 rounded-[20px] p-8 shadow-aura group/calendar">
      <ContainerInstrument plain className="flex items-center justify-between mb-8">
        <ContainerInstrument plain className="flex items-center gap-4">
          <ContainerInstrument plain className="w-12 h-12 rounded-[10px] bg-va-black text-white flex items-center justify-center shadow-lg group-hover/calendar:bg-primary transition-all duration-500">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" className="brightness-0 invert" />
          </ContainerInstrument>
          <ContainerInstrument plain>
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight text-va-black">
              <VoiceglotText  translationKey="studio.calendar.title" defaultText="Workshop kalender" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 mt-1 ">
              <VoiceglotText  translationKey="studio.calendar.month" defaultText="Februari 2026" />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        <ContainerInstrument plain className="flex gap-2">
          <ButtonInstrument 
            onClick={() => playClick('light')}
            className="w-10 h-10 rounded-[10px] bg-white border border-va-black/5 flex items-center justify-center text-va-black/40 hover:text-primary transition-all shadow-sm active:scale-95"
          >
            <Image  src="/assets/common/branding/icons/BACK.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} />
          </ButtonInstrument>
          <ButtonInstrument 
            onClick={() => playClick('light')}
            className="w-10 h-10 rounded-[10px] bg-white border border-va-black/5 flex items-center justify-center text-va-black/40 hover:text-primary transition-all shadow-sm active:scale-95"
          >
            <Image  src="/assets/common/branding/icons/FORWARD.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} />
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Mini Calendar Grid */}
      <ContainerInstrument plain className="grid grid-cols-7 gap-2 mb-8">
        {days.map(day => (
          <TextInstrument key={day} className="text-center text-[15px] font-light tracking-widest text-va-black/20 py-2 ">
            <VoiceglotText  translationKey={`common.day.${day.toLowerCase()}`} defaultText={day} />
          </TextInstrument>
        ))}
        {[...Array(28)].map((_, i) => {
          const day = i + 1;
          const hasWorkshop = [12, 18, 24].includes(day);
          return (
            <ButtonInstrument 
              key={i} 
              onClick={() => handleDayClick(day)}
              className={cn(
                "aspect-square rounded-[10px] flex items-center justify-center text-[15px] font-light transition-all cursor-pointer active:scale-90",
                hasWorkshop 
                  ? 'bg-primary text-white shadow-aura scale-110 hover:rotate-3' 
                  : 'bg-va-off-white text-va-black/40 hover:bg-white hover:shadow-sm'
              )}
            >
              {day}
            </ButtonInstrument>
          );
        })}
      </ContainerInstrument>

      {/* Upcoming List */}
      <ContainerInstrument plain className="space-y-4">
        <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-va-black/40 mb-4 ">
          <VoiceglotText  translationKey="studio.calendar.upcoming" defaultText="Eerstvolgende Sessies" />
        </HeadingInstrument>
        {workshops.slice(0, 2).map((workshop, i) => (
          <ButtonInstrument 
            key={i} 
            onClick={() => playClick('deep')}
            className="w-full p-4 rounded-[20px] bg-white border border-va-black/5 flex items-center justify-between group hover:border-primary/20 hover:shadow-aura transition-all cursor-pointer active:scale-[0.98]"
          >
            <ContainerInstrument plain className="flex items-center gap-4">
              <ContainerInstrument plain className="w-10 h-10 rounded-[10px] bg-va-off-white flex flex-col items-center justify-center group-hover:bg-primary/10 transition-all">
                <TextInstrument className="text-[15px] font-light text-va-black/30 group-hover:text-primary transition-all ">
                  <VoiceglotText  translationKey="common.month.feb.short" defaultText="FEB" />
                </TextInstrument>
                <TextInstrument className="text-[15px] font-light text-va-black group-hover:text-primary transition-all">12</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument plain className="text-left">
                <HeadingInstrument level={5} className="text-[15px] font-light tracking-tight">
                  <VoiceglotText  translationKey={`workshop.${workshop.id}.title`} defaultText={workshop.title} noTranslate={true} />
                </HeadingInstrument>
                <ContainerInstrument plain className="flex items-center gap-3 mt-1">
                  <ContainerInstrument plain className="flex items-center gap-1 text-[15px] font-light text-va-black/30 tracking-widest ">
                    <Image  src="/assets/common/branding/icons/INFO.svg" width={10} height={10} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} /> 10:00 - 17:00
                  </ContainerInstrument>
                  <ContainerInstrument plain className="flex items-center gap-1 text-[15px] font-light text-va-black/30 tracking-widest ">
                    <Image  src="/assets/common/branding/icons/INFO.svg" width={10} height={10} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} /> 
                    <VoiceglotText  translationKey="common.location.brussels" defaultText="Studio Brussel" />
                  </ContainerInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument plain className="flex items-center gap-2">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} />
              <TextInstrument className="text-[15px] font-light text-va-black/40 tracking-widest ">6/8</TextInstrument>
            </ContainerInstrument>
          </ButtonInstrument>
        ))}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
