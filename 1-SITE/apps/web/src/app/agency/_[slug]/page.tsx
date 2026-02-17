import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { getActor } from "@/lib/api";
import { ArrowLeft, Heart, Mic, Play, Share2, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default function ActorDetailPage({ params }: { params: { slug: string } }) {
  return (
    <PageWrapperInstrument>
      <Suspense  fallback={<LoadingScreenInstrument />}>
        <ActorDetailContent strokeWidth={1.5} params={params} />
      </Suspense>
    </PageWrapperInstrument>
  );
}

async function ActorDetailContent({ params }: { params: { slug: string } }) {
  const actor = await getActor(params.slug);

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      {/* Header / Breadcrumbs */}
      <SectionInstrument className="mb-12 flex items-center justify-between">
        <Link  
          href="/agency" 
          className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-all"
        >
          <ArrowLeft strokeWidth={1.5} size={14} /> 
          <VoiceglotText  translationKey="agency.back_to_voices" defaultText="Terug naar alle stemmen" />
        </Link>
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Heart strokeWidth={1.5} size={18} />
          </ButtonInstrument>
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Share2 strokeWidth={1.5} size={18} />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid>
        {/* Profile Card */}
        <BentoCard span="sm" className="!p-0 overflow-hidden bg-white shadow-aura">
          <ContainerInstrument className="aspect-[4/5] relative">
            <Image  
              src={actor.photo_url} 
              alt={actor.display_name} 
              fill
              className="object-cover"
            />
            <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/80 via-transparent to-transparent" />
            <ContainerInstrument className="absolute bottom-8 left-8 right-8">
              <HeadingInstrument level={1} className="text-3xl font-light text-white tracking-tighter mb-2"><VoiceglotText  translationKey={`actor.${actor.id}.name`} defaultText={actor.display_name} /></HeadingInstrument>
              <ContainerInstrument className="flex items-center gap-2">
                <ContainerInstrument className="px-3 py-1 bg-primary rounded-full text-[15px] font-black text-white tracking-widest"><VoiceglotText  translationKey="actor.badge.top_talent" defaultText="Top Talent" /></ContainerInstrument>
                <ContainerInstrument className="flex items-center gap-1 text-white/60 text-[15px] font-bold tracking-widest">
                  <Star strokeWidth={1.5} size={10} className="text-primary" fill="currentColor" /> 
                  <VoiceglotText  translationKey="actor.voice_score" defaultText={`${actor.voice_score} Voice Score`} />
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        {/* Demos & Player */}
        <BentoCard span="xl" className="bg-va-off-white/50 backdrop-blur-md border-white/20 shadow-aura p-12">
          <ContainerInstrument className="flex justify-between items-center mb-12">
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tight">
              <VoiceglotText  translationKey="actor.demos.title" defaultText="Demos & " />
              <TextInstrument as="span" className="text-primary font-light">
                <VoiceglotText  translationKey="actor.demos.subtitle" defaultText="Stijlen" />
              </TextInstrument>
            </HeadingInstrument>
            <ContainerInstrument className="flex gap-2">
              {['Commercieel', 'Corporate', 'E-learning'].map(cat => (
                <TextInstrument as="span" key={cat} className="px-4 py-2 bg-white rounded-full text-[15px] font-black tracking-widest text-va-black/40 border border-black/5"><VoiceglotText  translationKey={`category.${cat.toLowerCase()}`} defaultText={cat} /></TextInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actor.demos.map((demo, i) => (
              <ContainerInstrument 
                key={demo.id}
                className="group p-6 rounded-[24px] bg-white border border-black/5 hover:border-primary/20 transition-all flex items-center justify-between cursor-pointer"
              >
                <ContainerInstrument className="flex items-center gap-4">
                  <ContainerInstrument className="w-12 h-12 rounded-xl bg-va-off-white flex items-center justify-center text-va-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Play strokeWidth={1.5} size={20} fill="currentColor" className="ml-1" />
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={4} className="font-light tracking-tight text-[15px]">
                      <VoiceglotText  translationKey={`actor.${actor.id}.demo.${demo.id}.title`} defaultText={demo.title} />
                    </HeadingInstrument>
                    <TextInstrument className="text-[15px] font-bold text-va-black/30 tracking-widest mt-1">
                      <VoiceglotText  translationKey={`category.${demo.category.toLowerCase()}`} defaultText={demo.category} />
                    </TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[15px] font-black text-va-black/20 tracking-widest">0:30</TextInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </BentoCard>

        {/* Rates & Booking Sidebar */}
        <ContainerInstrument className="space-y-8">
          <BentoCard span="sm" className="bg-va-black text-white p-8">
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-6"><VoiceglotText  translationKey="actor.rates.title" defaultText="Tarieven" /></HeadingInstrument>
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="flex justify-between items-center py-3 border-b border-white/5">
                <TextInstrument as="span" className="text-[15px] font-black tracking-widest text-white/30"><VoiceglotText  translationKey="rate.telephony" defaultText="Telefonie" /></TextInstrument>
                <TextInstrument as="span" className="font-black text-primary">89</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex justify-between items-center py-3 border-b border-white/5">
                <TextInstrument as="span" className="text-[15px] font-black tracking-widest text-white/30"><VoiceglotText  translationKey="rate.web_video" defaultText="Web Video" /></TextInstrument>
                <TextInstrument as="span" className="font-black text-primary">175</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex justify-between items-center py-3">
                <TextInstrument as="span" className="text-[15px] font-black tracking-widest text-white/30"><VoiceglotText  translationKey="rate.commercial" defaultText="Commercial" /></TextInstrument>
                <TextInstrument as="span" className="font-black text-primary">v.a. 450</TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ButtonInstrument className="va-btn-pro w-full mt-8 !bg-primary flex items-center justify-center gap-2 group"><VoiceglotText  translationKey="actor.book_now" defaultText="Nu Boeken" /><Mic strokeWidth={1.5} size={16} /></ButtonInstrument>
          </BentoCard>

          <BentoCard span="sm" className="hred text-white p-8">
            <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <ShieldCheck strokeWidth={1.5} size={14} /> 
              <VoiceglotText  translationKey="actor.guarantee.title" defaultText="Kwaliteitsgarantie" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] font-medium leading-relaxed"><VoiceglotText  
                translationKey="actor.guarantee.text" 
                defaultText="Elke opname wordt geleverd in professionele studiokwaliteit, inclusief nabewerking en onbeperkte retakes op tone-of-voice." 
              /></TextInstrument>
          </BentoCard>
        </ContainerInstrument>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
