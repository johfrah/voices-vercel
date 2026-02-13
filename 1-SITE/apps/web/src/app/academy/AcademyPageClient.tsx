"use client";

import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import {
    ArrowRight,
    BookOpen,
    Clock,
    GraduationCap,
    Trophy
} from 'lucide-react';
import Link from 'next/link';

export default function AcademyPageClient({ courses }: { courses: any[] }) {
  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-16">
        <ContainerInstrument className="space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/20">
            <GraduationCap strokeWidth={1.5} size={12} fill="currentColor" / /> 
            <VoiceglotText strokeWidth={1.5} translationKey="academy.client.badge" defaultText="Voices Academy" / />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            <VoiceglotText strokeWidth={1.5} translationKey="academy.client.title_part1" defaultText="Master your " / />
            <TextInstrument as="span" className="text-primary font-light">
              <VoiceglotText strokeWidth={1.5} translationKey="academy.client.title_part2" defaultText="Instrument" / />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium max-w-2xl text-lg"><VoiceglotText strokeWidth={1.5} 
              translationKey="academy.client.subtitle" 
              defaultText="Leer de kunst van het inspreken van de beste experts in de sector. Van stemtechniek tot home-studio setup." 
            / /></TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid strokeWidth={1.5} columns={3}>
        {courses.map((course) => (
          <BentoCard key={course.id} span="md" className="bg-white shadow-aura group hover:border-primary/20 transition-all border border-black/5">
            <ContainerInstrument className="p-8 h-full flex flex-col justify-between">
              <ContainerInstrument>
                <ContainerInstrument className="flex justify-between items-start mb-8">
                  <ContainerInstrument className="w-12 h-12 bg-va-off-white rounded-2xl flex items-center justify-center text-va-black group-hover:bg-primary group-hover:text-white transition-all">
                    <BookOpen strokeWidth={1.5} size={24} />
                  </ContainerInstrument>
                  <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/20">
                    {course.level}
                  </TextInstrument>
                </ContainerInstrument>
                <HeadingInstrument level={3} className="text-2xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors">
                  {course.title}
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 text-[15px] font-medium leading-relaxed line-clamp-3 mb-8">
                  {course.description}
                </TextInstrument>
              </ContainerInstrument>
              
              <ContainerInstrument className="pt-6 border-t border-black/5 flex justify-between items-center">
                <TextInstrument className="flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40">
                  <Clock strokeWidth={1.5} size={12} / /> {course.duration}
                </TextInstrument>
                <Link strokeWidth={1.5} 
                  href={`/academy/lesson/${course.id}`}
                  className="text-[15px] font-black tracking-widest text-primary flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  <VoiceglotText strokeWidth={1.5} translationKey="academy.client.start_lesson" defaultText="Start Les" / />
                  <ArrowRight strokeWidth={1.5} size={14} />
                </Link>
              </ContainerInstrument>
            </ContainerInstrument>
          </BentoCard>
        ))}

        {/* Achievement Card */}
        <BentoCard span="sm" className="bg-va-black text-white p-10 flex flex-col justify-between group">
          <ContainerInstrument>
            <Trophy strokeWidth={1.5} className="text-primary mb-8" size={40} / />
            <HeadingInstrument level={2} className="text-2xl font-black tracking-tight mb-4">
              <VoiceglotText strokeWidth={1.5} translationKey="academy.client.achievements.title" defaultText="Certificering" / />
              <TextInstrument className="text-white/40 text-[15px] font-medium leading-relaxed">
                <VoiceglotText strokeWidth={1.5} 
                  translationKey="academy.client.achievements.text" 
                  defaultText="Ontvang een officieel Voices certificaat na het succesvol afronden van een masterclass." 
                / />
              </TextInstrument>
            </HeadingInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-black tracking-widest text-primary/60"><VoiceglotText strokeWidth={1.5} translationKey="academy.client.achievements.footer" defaultText="Voices" / /></TextInstrument>
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}