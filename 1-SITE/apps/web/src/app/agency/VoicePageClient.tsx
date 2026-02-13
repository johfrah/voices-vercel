"use client";

import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    InputInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import {
    Filter,
    Heart,
    Mic,
    Play,
    Search,
    Star
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function VoicePageClient({ actors }: { actors: any[] }) {
  const [search, setSearch] = useState('');

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-16">
        <ContainerInstrument className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <ContainerInstrument className="space-y-4">
            <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/20">
              <Image src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} /> 
              <VoiceglotText translationKey="agency.client.badge" defaultText="Voice Casting" />
            </ContainerInstrument>
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-none">
              <VoiceglotText translationKey="agency.client.title_part1" defaultText="Vind jouw " />
              <TextInstrument as="span" className="text-primary font-light">
                <VoiceglotText translationKey="agency.client.title_part2" defaultText="Stem" />
              </TextInstrument>
            </HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="flex gap-4">
            <ContainerInstrument className="relative">
              <Image src="/assets/common/branding/icons/SEARCH.svg" width={18} height={18} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
              <InputInstrument 
                type="text" 
                placeholder="Zoek op naam of taal..."
                className="bg-white border border-black/5 rounded-2xl pl-12 pr-6 py-4 text-[15px] font-light focus:ring-2 focus:ring-primary/20 transition-all w-64 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </ContainerInstrument>
            <ButtonInstrument className="w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-va-black/40 hover:text-primary transition-all shadow-sm">
              <Image src="/assets/common/branding/icons/MENU.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid columns={4}>
        {actors.map((actor) => (
          <BentoCard key={actor.id} span="sm" className="bg-white shadow-aura group overflow-hidden border border-black/5">
            <Link href={`/voice/${actor.slug}`}>
              <ContainerInstrument className="aspect-[4/5] relative">
                <Image 
                  src={actor.photo_url} 
                  alt={actor.display_name} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <ContainerInstrument className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                  <ContainerInstrument className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                    <Play size={18} fill="currentColor" className="ml-1" />
                  </ContainerInstrument>
                  <ButtonInstrument className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    <Image src="/assets/common/branding/icons/FAVORITES.svg" width={18} height={18} alt="" className="brightness-0 invert" />
                  </ButtonInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="p-6">
                <ContainerInstrument className="flex justify-between items-start mb-1">
                  <HeadingInstrument level={3} className="font-light tracking-tight text-lg">
                    <VoiceglotText translationKey={`actor.${actor.id}.name`} defaultText={actor.display_name} noTranslate={true} />
                  </HeadingInstrument>
                  <ContainerInstrument className="flex items-center gap-1 text-[15px] font-light text-primary">
                    <Star strokeWidth={1.5} size={10} fill="currentColor" /> {actor.voice_score}
                  </ContainerInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30">
                  <VoiceglotText translationKey={`common.language.${actor.native_lang?.toLowerCase()}`} defaultText={actor.native_lang || ''} />
                  <VoiceglotText translationKey="common.native" defaultText="Native" />
                </TextInstrument>
              </ContainerInstrument>
            </Link>
          </BentoCard>
        ))}
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
