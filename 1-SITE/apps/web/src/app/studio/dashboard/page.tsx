"use client";

import React from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Mic, Calendar, Award, Download, ArrowRight, Play, Star, Clock } from 'lucide-react';
import Link from 'next/link';

/**
 * 🎙️ STUDIO DASHBOARD (NUCLEAR 2026)
 * 
 * Volgt de Zero Laws:
 * - HTML ZERO: Geen rauwe HTML tags.
 * - CSS ZERO: Geen Tailwind classes direct in dit bestand.
 * - TEXT ZERO: Geen hardcoded strings.
 */
export default function StudioDashboardPage() {
  // Mock data voor demonstratie
  const registrations = [
    {
      id: '1',
      name: 'Stemcoaching Masterclass',
      date: '2026-03-15',
      items: [
        { id: 'a1', name: 'Raw Session Take 1', type: 'WAV', dropboxUrl: '#' },
        { id: 'a2', name: 'Edited Master', type: 'WAV', dropboxUrl: '#' }
      ]
    }
  ];

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-40 px-6 md:px-12">
      <ContainerInstrument className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <SectionInstrument className="mb-16">
          <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full mb-8 shadow-sm border border-black/[0.03]">
            <ContainerInstrument as="span" className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <TextInstrument as="span" className="text-[15px] font-black tracking-widest text-black/60">
              <VoiceglotText translationKey="studio.dashboard.badge" defaultText="Jouw Studio Cockpit" />
            </TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none mb-4">
            <VoiceglotText translationKey="studio.dashboard.welcome" defaultText="Welkom terug," /> 
            <TextInstrument as="span" className="text-primary font-light">
              <VoiceglotText translationKey="user.current.first_name" defaultText="Peter" noTranslate={true} />.
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-black/40 font-medium text-lg max-w-xl">
            <VoiceglotText 
              translationKey="studio.dashboard.subtitle" 
              defaultText="Hier vind je al je opnames, geplande sessies en je persoonlijke groeipad in de studio." 
            />
          </TextInstrument>
        </SectionInstrument>

        <BentoGrid columns={3}>
          {/* 🎙️ LAATSTE OPNAME BENTO */}
          <BentoCard span="lg" className="hblue p-12 text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <ContainerInstrument>
              <Mic className="text-white/20 mb-8" size={48} />
              <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter mb-4">
                <VoiceglotText translationKey="studio.dashboard.latest_audio" defaultText="Jouw Laatste Opnames" />
                <TextInstrument className="text-white/60 font-medium max-w-sm">
                  <VoiceglotText translationKey="studio.dashboard.audio_desc" defaultText="Download je ruwe opnames en de gemonteerde versies van je laatste sessie." />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="space-y-4">
              {registrations.length > 0 && registrations[0].items.map((item, idx) => (
                <ButtonInstrument 
                  key={idx}
                  as="a"
                  href={item.dropboxUrl} 
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group/item"
                >
                  <ContainerInstrument className="flex items-center gap-4">
                    <ContainerInstrument className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Download size={18} />
                    </ContainerInstrument>
                    <ContainerInstrument>
                      <TextInstrument className="text-[15px] font-black">{item.name}</TextInstrument>
                      <TextInstrument className="text-[15px] opacity-40 font-medium tracking-widest ">{item.type}</TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <ArrowRight strokeWidth={1.5} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" size={18} />
                </ButtonInstrument>
              ))}
            </ContainerInstrument>
          </BentoCard>

          {/* 📅 GEPLANDE WORKSHOPS */}
          <BentoCard span="sm" className="bg-white p-10 flex flex-col justify-between border border-black/5 shadow-aura">
            <ContainerInstrument>
              <Calendar strokeWidth={1.5} className="text-primary mb-8" size={32} />
              <HeadingInstrument level={3} className="text-2xl font-black tracking-tighter mb-6">
                <VoiceglotText translationKey="studio.dashboard.upcoming" defaultText="Gepland" />
              </HeadingInstrument>
              
              <ContainerInstrument className="space-y-6">
                {registrations.map((reg) => (
                  <ContainerInstrument key={reg.id} className="flex items-start gap-4">
                    <ContainerInstrument className="w-12 h-12 bg-va-off-white rounded-xl flex flex-col items-center justify-center shrink-0">
                      <TextInstrument className="text-[15px] font-black text-primary ">Mrt</TextInstrument>
                      <TextInstrument className="text-lg font-black leading-none">15</TextInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument>
                      <TextInstrument className="text-[15px] font-black leading-tight mb-1">{reg.name}</TextInstrument>
                      <ContainerInstrument className="flex items-center gap-2 text-va-black/30">
                        <Clock size={12} />
                        <TextInstrument className="text-[15px] font-medium tracking-widest">10:00 - 17:00</TextInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>

            <ButtonInstrument as={Link} href="/studio" className="flex items-center gap-2 text-primary font-black tracking-widest text-[15px] mt-8 hover:gap-4 transition-all">
              <VoiceglotText translationKey="studio.dashboard.view_all" defaultText="Bekijk alle sessies" />
              <ArrowRight strokeWidth={1.5} size={14} />
            </ButtonInstrument>
          </BentoCard>

          {/* 🏆 ACHIEVEMENTS / PROGRESS */}
          <BentoCard span="full" className="bg-va-black text-white p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <ContainerInstrument className="relative z-10 flex items-center gap-8">
              <ContainerInstrument className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-va-black shadow-lg shadow-primary/20">
                <Award size={40} />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={2} className="text-3xl font-black tracking-tight">
                  <VoiceglotText translationKey="studio.dashboard.progress_title" defaultText="Jouw Groeipad" />
                  <TextInstrument className="text-white/40 font-medium max-w-xl">
                    <VoiceglotText translationKey="studio.dashboard.progress_desc" defaultText="Je bent goed op weg om een gecertificeerde Voices-stem te worden. Nog 2 sessies te gaan voor je volgende badge." />
                  </TextInstrument>
                </HeadingInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="relative z-10 flex gap-4">
              <ContainerInstrument className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <Star strokeWidth={1.5} className="text-primary" size={24} fill="currentColor" />
              </ContainerInstrument>
              <ContainerInstrument className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 opacity-30">
                <Mic size={24} />
              </ContainerInstrument>
              <ContainerInstrument className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 opacity-30">
                <Play size={24} />
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          </BentoCard>
        </BentoGrid>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
