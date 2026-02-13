import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { ArrowLeft, ArrowRight, Calendar, Globe, Instagram, Linkedin, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * INSTRUCTOR DETAIL PAGE
 * 🛡️ VOICES OS: 100% Native & WordPress-vrij
 */
export default async function InstructorDetailPage({ params }: { params: { slug: string } }) {
  const instructor = await StudioDataBridge.getInstructorBySlug(params.slug);

  if (!instructor) {
    notFound();
  }

  const workshops = await StudioDataBridge.getWorkshopsByInstructor(instructor.id);

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      {/* 🔙 BACK BUTTON */}
      <Link 
        href="/studio/instructeurs" 
        className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group"
      >
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        <VoiceglotText translationKey="common.back_to_instructors" defaultText="TERUG NAAR OVERZICHT" />
      </Link>

      <BentoGrid columns={3} className="gap-8">
        {/* 👤 PROFILE CARD */}
        <BentoCard span="sm" className="bg-va-black text-white p-10 flex flex-col justify-between">
          <ContainerInstrument>
            <ContainerInstrument className="relative w-48 h-48 rounded-3xl overflow-hidden mb-8 border-2 border-white/10 mx-auto">
              <Image 
                src={instructor.photo?.filePath ? `/assets/${instructor.photo.filePath}` : "/assets/common/founder/johfrah-avatar-be.png"} 
                alt={instructor.name}
                fill
                className="object-cover"
              />
            </ContainerInstrument>
            <HeadingInstrument level={1} className="text-3xl font-black tracking-tighter text-center mb-2">
              {instructor.name}
            </HeadingInstrument>
            <TextInstrument className="text-primary text-[15px] font-black tracking-widest text-center mb-8">
              {instructor.tagline || "Studio Instructeur"}
            </TextInstrument>

            {/* SOCIALS */}
            <ContainerInstrument className="flex justify-center gap-4 pt-8 border-t border-white/5">
              {instructor.socials?.linkedin && (
                <a href={instructor.socials.linkedin} target="_blank" className="text-white/20 hover:text-white transition-colors">
                  <Linkedin size={20} />
                </a>
              )}
              {instructor.socials?.instagram && (
                <a href={instructor.socials.instagram} target="_blank" className="text-white/20 hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {instructor.socials?.website && (
                <a href={instructor.socials.website} target="_blank" className="text-white/20 hover:text-white transition-colors">
                  <Globe strokeWidth={1.5} size={20} />
                </a>
              )}
            </ContainerInstrument>
          </ContainerInstrument>
          <ButtonInstrument className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[15px] font-black tracking-widest transition-all mt-12"><VoiceglotText translationKey="instructor.book_session" defaultText="PLAN EEN SESSIE" /></ButtonInstrument>
        </BentoCard>

        {/* 📝 BIO CARD */}
        <BentoCard span="lg" className="bg-white shadow-aura p-12 border border-black/5">
          <HeadingInstrument level={2} className="text-[15px] font-black tracking-widest text-black/30 mb-8"><VoiceglotText translationKey="instructor.about_title" defaultText="Over de instructeur" /></HeadingInstrument>
          <div className="prose prose-lg prose-black max-w-none">
            <TextInstrument className="text-black/60 font-medium leading-relaxed whitespace-pre-wrap">
              {instructor.bio || "Geen bio beschikbaar."}
            </TextInstrument>
          </div>
        </BentoCard>

        {/* 🎓 WORKSHOPS CARD */}
        <BentoCard span="lg" className="bg-va-off-white p-12">
          <HeadingInstrument level={3} className="text-[15px] font-black tracking-widest text-black/30 mb-10"><VoiceglotText translationKey="instructor.workshops_title" defaultText="Workshops door deze instructeur" /></HeadingInstrument>
          
          <div className="grid md:grid-cols-2 gap-6">
            {workshops.length > 0 ? workshops.map((workshop) => (
              <Link 
                key={workshop.id} 
                href={`/studio/${workshop.slug}`}
                className="group bg-white p-6 rounded-2xl border border-black/5 hover:border-primary/20 hover:shadow-xl transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <HeadingInstrument level={4} className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                    {workshop.title}
                  </HeadingInstrument>
                  <ArrowRight strokeWidth={1.5} size={18} className="text-black/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-black/40 tracking-widest">
                    <Calendar strokeWidth={1.5} size={12} /> 
                    {workshop.editions?.[0] 
                      ? new Date(workshop.editions[0].date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })
                      : "Binnenkort"}
                  </div>
                  <div className="flex items-center gap-2 text-[15px] font-bold text-black/40 tracking-widest">
                    <MapPin size={12} /> {workshop.editions?.[0]?.location || "Gent"}
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-2 p-12 rounded-2xl border border-dashed border-black/10 text-center">
                <TextInstrument className="text-[15px] font-black tracking-widest text-black/20"><VoiceglotText translationKey="auto.page.momenteel_geen_works.7d9a37" defaultText="Momenteel geen workshops gepland" /></TextInstrument>
              </div>
            )}
          </div>
        </BentoCard>

        {/* 💬 QUOTE / FOOTER CARD */}
        <BentoCard span="sm" className="bg-primary text-black p-10 flex flex-col justify-center items-center text-center">
          <HeadingInstrument level={4} className="text-2xl font-black tracking-tighter mb-4"><VoiceglotText 
              translationKey="instructor.quote" 
              defaultText="De stem is het instrument van de ziel." 
            /></HeadingInstrument>
          <TextInstrument className="text-[15px] font-black tracking-widest opacity-40">
            — {instructor.name}
          </TextInstrument>
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
