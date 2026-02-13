import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { db } from '@db';
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function InstructorsPage() {
  const allInstructors = await db.query.instructors.findMany({
    with: {
      photo: true
    }
  });

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-40 px-6">
      <ContainerInstrument className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <SectionInstrument className="mb-20 space-y-4">
          <Link 
            href="/studio" 
            className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-all mb-4"
          >
            <ArrowLeft strokeWidth={1.5} size={14} /> 
            <VoiceglotText translationKey="studio.back_to_studio" defaultText="Terug naar Studio" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none"><VoiceglotText translationKey="studio.instructors.title" defaultText="Maak kennis met onze" /><br /><span className="text-primary"><VoiceglotText translationKey="auto.page.experts_.4d0ca8" defaultText="experts." /></span></HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl max-w-2xl"><VoiceglotText 
              translationKey="studio.instructors.subtitle" 
              defaultText="Leren van de besten in het vak. Onze instructeurs zijn actieve professionals met jarenlange ervaring in de stemmenwereld." 
            /></TextInstrument>
        </SectionInstrument>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {allInstructors.map((instructor) => (
            <ContainerInstrument key={instructor.id} className="group space-y-6">
              <Link href={`/studio/instructeurs/${instructor.slug || instructor.id}`} className="block">
                <ContainerInstrument className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-aura-lg grayscale hover:grayscale-0 transition-all duration-1000">
                  <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <Image 
                    src={instructor.photo ? `/assets/${instructor.photo.filePath}` : "/assets/common/founder/johfrah-avatar-be.png"} 
                    alt={instructor.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <ContainerInstrument className="absolute bottom-8 left-8 right-8">
                    <TextInstrument className="text-white/60 text-[15px] font-black tracking-widest mb-2"><VoiceglotText translationKey={`studio.instructor.${instructor.id}.tagline`} defaultText={instructor.tagline || 'Workshopgever'} /></TextInstrument>
                    <HeadingInstrument level={4} className="text-3xl font-black text-white tracking-tighter leading-none"><VoiceglotText translationKey={`studio.instructor.${instructor.id}.name`} defaultText={instructor.name} /></HeadingInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              </Link>
              <ContainerInstrument className="px-4 space-y-4">
                <TextInstrument className="text-black/40 text-[15px] font-medium leading-relaxed line-clamp-3"><VoiceglotText translationKey={`studio.instructor.${instructor.id}.bio`} defaultText={instructor.bio || ''} /></TextInstrument>
                <ContainerInstrument className="flex items-center gap-6">
                  <ButtonInstrument 
                    as={Link}
                    href={`/studio/instructeurs/${instructor.slug || instructor.id}`}
                    className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-primary group/btn"
                  >
                    <VoiceglotText translationKey="studio.instructor.view_profile" defaultText="BEKIJK PROFIEL" />
                    <ArrowRight strokeWidth={1.5} size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </ButtonInstrument>
                  <ButtonInstrument 
                    as={Link}
                    href={`/studio/afspraak`}
                    className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-colors"
                  >
                    <VoiceglotText translationKey="studio.instructor.book_meeting" defaultText="PLAN EEN GESPREK" />
                  </ButtonInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </div>

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
