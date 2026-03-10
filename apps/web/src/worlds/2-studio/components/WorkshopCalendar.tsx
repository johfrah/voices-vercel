"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import React from 'react';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument,
  HeadingInstrument
} from '@/components/ui/LayoutInstruments';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Info, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';

const STORAGE_BASE = 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices';

function toPublicMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE}/${path.replace(/^\/+/, '')}`;
}

function isImagePath(path?: string | null): boolean {
  if (!path) return false;
  return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(path);
}

export const WorkshopCalendar: React.FC<{ workshops: any[] }> = ({ workshops }) => {
  const { playClick } = useSonicDNA();
  const [mounted, setMounted] = React.useState(false);
  const days = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  //  CHRIS-PROTOCOL: Extract workshop dates dynamically
  const workshopDates = React.useMemo(() => {
    if (!mounted || !Array.isArray(workshops)) return [];
    const dates = new Set<number>();
    workshops.forEach(workshop => {
      if (workshop && Array.isArray(workshop.editions)) {
        workshop.editions.forEach((edition: any) => {
          if (edition && edition.date) {
            const date = new Date(edition.date);
            if (!isNaN(date.getTime()) && date >= new Date()) {
              dates.add(date.getDate());
            }
          }
        });
      }
    });
    return Array.from(dates);
  }, [workshops, mounted]);

  const upcomingSessions = React.useMemo(() => {
    if (!Array.isArray(workshops)) return [];
    const now = Date.now();

    const sessions = workshops.flatMap((workshop) => {
      if (!workshop) return [];
      const editions = Array.isArray(workshop.editions)
        ? workshop.editions
        : (Array.isArray(workshop.upcoming_editions) ? workshop.upcoming_editions : []);

      const mediaCandidate =
        workshop.featured_image?.file_path ||
        workshop.media?.file_path ||
        workshop.media?.filePath ||
        null;
      const workshopImagePath = isImagePath(mediaCandidate) ? mediaCandidate : (workshop.featured_image?.file_path || null);

      return editions
        .filter((edition: any) => edition?.date)
        .map((edition: any) => {
          const dateObj = new Date(edition.date);
          const capacity = Number(edition.capacity ?? 8);
          const filledFromParticipants = Array.isArray(edition.participants) ? edition.participants.length : 0;
          const filled = Number.isFinite(Number(edition.registered_count))
            ? Number(edition.registered_count)
            : (Number.isFinite(Number(edition.filled)) ? Number(edition.filled) : filledFromParticipants);
          const available = Number.isFinite(Number(edition.available_seats))
            ? Math.max(0, Number(edition.available_seats))
            : Math.max(0, capacity - filled);

          return {
            id: edition.id,
            workshopId: workshop.id,
            workshopTitle: workshop.title,
            workshopSlug: workshop.slug || String(workshop.id),
            workshopImagePath,
            workshopImageAlt: workshop.featured_image?.alt_text || workshop.title,
            date: edition.date,
            dateObj,
            start_time: edition.start_time || null,
            location: edition.location,
            capacity,
            available
          };
        })
        .filter((session: any) => !Number.isNaN(session.dateObj.getTime()) && session.dateObj.getTime() >= now);
    });

    return sessions
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .slice(0, 4);
  }, [workshops]);
  
  const handleDayClick = (day: number) => {
    playClick('soft');
    // window.location.href = `/studio/book?day=${day}`;
  };

  return (
    <ContainerInstrument plain className="bg-white/40 backdrop-blur-md border border-white/20 rounded-[20px] p-8 shadow-aura group/calendar">
      <ContainerInstrument plain className="flex items-center justify-between mb-8">
        <ContainerInstrument plain className="flex items-center gap-4">
          <ContainerInstrument plain className="w-12 h-12 rounded-[10px] bg-va-black text-white flex items-center justify-center shadow-lg group-hover/calendar:bg-primary transition-all duration-500">
            <Info size={24} strokeWidth={1.5} />
          </ContainerInstrument>
          <ContainerInstrument plain>
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight text-va-black">
              <VoiceglotText  translationKey="studio.calendar.title" defaultText="Workshop kalender" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 mt-1 ">
              <VoiceglotText  translationKey="studio.calendar.month" defaultText="Maart 2026" />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        <ContainerInstrument plain className="flex gap-2">
          <ButtonInstrument 
            onClick={() => playClick('soft')}
            className="w-10 h-10 rounded-[10px] bg-white border border-va-black/5 flex items-center justify-center text-va-black/40 hover:text-primary transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft size={20} strokeWidth={1.5} className="opacity-40" />
          </ButtonInstrument>
          <ButtonInstrument 
            onClick={() => playClick('soft')}
            className="w-10 h-10 rounded-[10px] bg-white border border-va-black/5 flex items-center justify-center text-va-black/40 hover:text-primary transition-all shadow-sm active:scale-95"
          >
            <ChevronRight size={20} strokeWidth={1.5} className="opacity-40" />
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
          const hasWorkshop = mounted && workshopDates.includes(day);
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
        {upcomingSessions.length === 0 && (
          <ContainerInstrument plain className="p-4 rounded-[14px] bg-va-off-white/70">
            <TextInstrument className="text-[13px] text-va-black/50 font-light">
              <VoiceglotText translationKey="studio.calendar.empty" defaultText="Momenteel zijn er geen eerstvolgende sessies beschikbaar." />
            </TextInstrument>
          </ContainerInstrument>
        )}

        {upcomingSessions.map((session) => (
          <ButtonInstrument
            key={session.id}
            as={Link}
            href={`/studio/${session.workshopSlug}`}
            onClick={() => playClick('pro')}
            className="w-full p-4 rounded-[20px] bg-white border border-va-black/5 flex items-center justify-between group hover:border-primary/20 hover:shadow-aura transition-all cursor-pointer active:scale-[0.98]"
          >
            <ContainerInstrument plain className="flex items-center gap-4">
              {session.workshopImagePath ? (
                <ContainerInstrument plain className="relative w-14 h-14 rounded-[12px] overflow-hidden border border-black/5 shrink-0">
                  <Image
                    src={toPublicMediaUrl(session.workshopImagePath) || ''}
                    alt={session.workshopImageAlt || session.workshopTitle}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </ContainerInstrument>
              ) : (
                <ContainerInstrument plain className="w-14 h-14 rounded-[12px] bg-va-off-white flex items-center justify-center shrink-0">
                  <TextInstrument className="text-[10px] uppercase tracking-widest text-va-black/35">
                    <VoiceglotText translationKey="studio.workshop.label" defaultText="Workshop" />
                  </TextInstrument>
                </ContainerInstrument>
              )}
              <ContainerInstrument plain className="w-10 h-10 rounded-[10px] bg-va-off-white flex flex-col items-center justify-center group-hover:bg-primary/10 transition-all">
                <TextInstrument className="text-[10px] font-bold uppercase tracking-widest text-va-black/30 group-hover:text-primary transition-all">
                  {session.dateObj.toLocaleString('nl-BE', { month: 'short' })}
                </TextInstrument>
                <TextInstrument className="text-[14px] font-light text-va-black group-hover:text-primary transition-all">
                  {session.dateObj.getDate()}
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument plain className="text-left">
                <HeadingInstrument level={5} className="text-[15px] font-light tracking-tight">
                  {session.workshopTitle}
                </HeadingInstrument>
                <ContainerInstrument plain className="flex flex-wrap items-center gap-3 mt-1">
                  <ContainerInstrument plain className="flex items-center gap-1 text-[12px] font-light text-va-black/35 tracking-wide">
                    <Clock size={10} strokeWidth={1.5} className="opacity-40" />
                    {session.start_time ? session.start_time.substring(0, 5) : session.dateObj.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                  </ContainerInstrument>
                  <ContainerInstrument plain className="flex items-center gap-1 text-[12px] font-light text-va-black/35 tracking-wide">
                    <MapPin size={10} strokeWidth={1.5} className="opacity-40" />
                    {session.location?.city || 'Locatie n.t.b.'}
                  </ContainerInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument plain className="flex items-center gap-2">
              <Users size={12} strokeWidth={1.5} className="opacity-40" />
              <TextInstrument className="text-[12px] font-light text-va-black/45 tracking-wide">
                {session.available}/{session.capacity}{' '}
                <VoiceglotText translationKey="studio.seats.remaining" defaultText="plaatsen vrij" />
              </TextInstrument>
            </ContainerInstrument>
          </ButtonInstrument>
        ))}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
