import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { HitlActionCardInstrument } from '@/components/ui/HitlActionCardInstrument';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { db } from '@db';
import { workshops } from '@db/schema';
import { desc } from 'drizzle-orm';
import { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";

/**
 * STUDIO
 * Mantra: "Directe begeleiding. Jouw verhaal komt binnen."
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Voices Studio | Workshops voor Professionele Sprekers",
  description: "Directe begeleiding in het stemmenambacht. Leer stemacteren van de experts in onze fysieke studio in Gent.",
  openGraph: {
    title: "Voices Studio | Workshops voor Professionele Sprekers",
    description: "Directe begeleiding in het stemmenambacht. Leer stemacteren van de experts in onze fysieke studio in Gent.",
    type: "website",
  },
  alternates: {
    canonical: "https://www.voices.be/studio",
  }
};

export default async function StudioPage() {
  // 🎙️ Fetch Workshops
  const activeWorkshops = await db.query.workshops.findMany({
    limit: 6,
    orderBy: [desc(workshops.date)],
    with: {
      media: true
    }
  }) || [];

  // 🎓 Fetch Instructors
  const teachers = await db.query.instructors.findMany({ 
    limit: 4,
    with: {
      photo: true
    }
  }) || [];

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white selection:bg-primary selection:text-white">
      <LiquidBackground />
      
      {/* LIQUID DNA HEADER */}
      <SectionInstrument className="relative pt-40 pb-24 overflow-hidden">
        <ContainerInstrument>
          <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-[20px] mb-12 shadow-sm border border-black/[0.03]">
            <TextInstrument className="w-2 h-2 rounded-full bg-primary animate-pulse font-light" />
            <TextInstrument className="text-[15px] font-light tracking-widest text-black/60">
              <VoiceglotText translationKey="studio.hero.badge" defaultText="Voices Studio • Jouw verhaal komt binnen" />
            </TextInstrument>
          </ContainerInstrument>
          
          <HeadingInstrument level={1} className="text-[12vw] md:text-[8vw] font-light tracking-tighter leading-[0.8] mb-12 "><VoiceglotText translationKey="studio.hero.title_part1" defaultText="Workshops for " /><br /><TextInstrument className="text-primary font-light"><VoiceglotText translationKey="studio.hero.title_part2" defaultText="professionele sprekers." /></TextInstrument></HeadingInstrument>
          
          <TextInstrument className="text-2xl md:text-3xl text-black/40 font-light leading-tight tracking-tight max-w-3xl"><VoiceglotText 
              translationKey="studio.hero.subtitle" 
              defaultText="Voices Studio is de fysieke plek voor directe begeleiding. Samen in de studio staan. Direct horen wat werkt. Leren van de experts in het vak." 
            /></TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="pb-40">
        <ContainerInstrument>
          <BentoGrid columns={3}>
            {/* 🎯 DE GIDS BENTO */}
            <BentoCard span="lg" className="bg-blue-600 p-12 text-white relative overflow-hidden flex flex-col justify-between min-h-[500px] rounded-[20px]">
              <ContainerInstrument className="relative z-10">
                <ContainerInstrument className="w-12 h-12 rounded-[10px] bg-white/20 backdrop-blur-md flex items-center justify-center mb-8">
                  <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" className="brightness-0 invert" / />
                </ContainerInstrument>
                <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter leading-none mb-8 "><VoiceglotText translationKey="studio.bento.guide.title" defaultText="Welke workshop past bij jou?" /><TextInstrument className="text-white/70 font-light max-w-sm text-[15px] leading-relaxed"><VoiceglotText translationKey="studio.bento.guide.text" defaultText="Geen blabla. Focus op de actie. Ontdek welk traject het beste bij jouw doelen aansluit." /></TextInstrument></HeadingInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="relative z-10">
                <Link strokeWidth={1.5} href="/studio/quiz">
                  <ButtonInstrument className="va-btn-pro !bg-white !text-black flex items-center gap-4 group !rounded-[10px] font-light tracking-widest "><VoiceglotText translationKey="studio.bento.guide.cta" defaultText="Doe de quiz" /><Image strokeWidth={1.5} src="/assets/common/branding/icons/FORWARD.svg" width={18} height={18} alt="" className="group-hover:translate-x-2 transition-transform" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / /></ButtonInstrument>
                </Link>
              </ContainerInstrument>
              <ContainerInstrument className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-[20px] blur-3xl" />
            </BentoCard>

            {/* 💬 AFSPRAAK BENTO */}
            <BentoCard span="sm" className="bg-va-black text-white p-12 flex flex-col justify-between rounded-[20px] shadow-aura-lg">
              <ContainerInstrument>
                <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={48} height={48} alt="" className="text-primary mb-8 brightness-0 invert opacity-20" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-6 leading-none">
                  <VoiceglotText translationKey="studio.bento.appointment.title" defaultText="Samen aan de slag" />
                  <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed">
                    <VoiceglotText translationKey="studio.bento.appointment.text" defaultText="Twijfel je over je potentieel? Plan een gesprek in met Johfrah in de studio." />
                  </TextInstrument>
                </HeadingInstrument>
              </ContainerInstrument>
              <ButtonInstrument as={Link} href="/studio/afspraak" className="w-full py-6 rounded-[10px] bg-white/5 border border-white/10 text-white font-light tracking-widest text-[15px] hover:bg-primary hover:border-primary transition-all duration-500 flex items-center justify-center ">
                <VoiceglotText translationKey="studio.bento.appointment.cta" defaultText="Agenda bekijken" />
              </ButtonInstrument>
            </BentoCard>

            {/* 🎓 ACADEMY BRIDGE HITL */}
            <BentoCard span="sm" className="bg-white p-12 flex flex-col justify-between rounded-[20px] shadow-aura border border-black/5">
              <ContainerInstrument>
                <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={48} height={48} alt="" className="text-primary mb-8" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-6 leading-none">
                  <VoiceglotText translationKey="studio.bento.academy_bridge.title" defaultText="Academy talent" />
                  <TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed mb-8">
                    <VoiceglotText translationKey="studio.bento.academy_bridge.text" defaultText="Er zijn 3 studenten die bijna klaar zijn met hun online traject. Nodig ze uit voor een fysieke sessie." />
                  </TextInstrument>
                </HeadingInstrument>
                
                <ContainerInstrument className="space-y-4">
                  <HitlActionCardInstrument 
                    title="Uitnodiging: Julie V."
                    description="Heeft module 4 voltooid met een score van 9.2. Ideaal voor de 'Stem & Presentatie' workshop."
                    type="bridge"
                    onApprove={() => console.log('✅ Bridge uitnodiging verstuurd naar Julie')}
                    onDismiss={() => console.log('❌ Bridge suggestie genegeerd')}
                  />
                </ContainerInstrument>
              </ContainerInstrument>
              <ButtonInstrument as={Link} href="/studio/participants" className="text-[15px] font-light tracking-widest text-va-black/20 hover:text-primary transition-colors text-center mt-6">
                <VoiceglotText translationKey="studio.bento.academy_bridge.cta" defaultText="Bekijk alle talenten" />
              </ButtonInstrument>
            </BentoCard>

            {/* 🎙️ WORKSHOP GRID */}
            <ContainerInstrument className="md:col-span-2 space-y-12 pt-12">
              <ContainerInstrument className="flex justify-between items-end px-4">
                <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest text-black/30"><VoiceglotText translationKey="studio.grid_label" defaultText="Aan de slag in de studio" /></HeadingInstrument>
                <Link strokeWidth={1.5} href="/studio/kalender" className="text-[15px] font-light tracking-widest text-primary hover:underline flex items-center gap-2"><VoiceglotText translationKey="studio.calendar_link" defaultText="Volledige kalender" /><Image strokeWidth={1.5} src="/assets/common/branding/icons/FORWARD.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / /></Link>
              </ContainerInstrument>
              {activeWorkshops.length === 0 ? (
                <ContainerInstrument className="p-12 text-center rounded-[20px] border-2 border-dashed border-black/5 bg-va-off-white/30">
                  <TextInstrument className="text-black/40 font-light tracking-tighter"><VoiceglotText translationKey="studio.no_workshops" defaultText="Momenteel geen geplande sessies." /></TextInstrument>
                  <TextInstrument className="text-[15px] text-black/20 font-light mt-2 tracking-widest italic"><VoiceglotText translationKey="studio.no_workshops_subtitle" defaultText="Nieuwe data volgen binnenkort." /></TextInstrument>
                </ContainerInstrument>
              ) : (
                <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activeWorkshops.map((workshop: any) => (
                    <ContainerInstrument 
                      key={workshop.id} 
                      className="group relative bg-white rounded-[20px] overflow-hidden shadow-aura hover:scale-[1.01] transition-all duration-500 border border-black/[0.02] flex flex-col"
                    >
                      {/* 🎬 VIDEO PREVIEW / AFTERMOVIE */}
                      {workshop.media && (
                        <ContainerInstrument className="relative aspect-video w-full bg-va-black overflow-hidden">
                          <video 
                            src={`/assets/${workshop.media.filePath}`}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                            muted
                            loop
                            playsInline
                            autoPlay
                          />
                          <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <ContainerInstrument className="absolute bottom-4 left-6 flex items-center gap-2">
                            <ContainerInstrument className="w-8 h-8 rounded-[10px] bg-primary/80 backdrop-blur-md flex items-center justify-center text-white">
                              <Image strokeWidth={1.5} src="/assets/common/branding/icons/PLAY.svg" width={14} height={14} alt="" className="brightness-0 invert ml-1" / />
                            </ContainerInstrument>
                            <TextInstrument className="text-[15px] font-light text-white tracking-widest">
                              <VoiceglotText translationKey="studio.aftermovie" defaultText="Aftermovie" />
                            </TextInstrument>
                          </ContainerInstrument>
                        </ContainerInstrument>
                      )}

                      <ContainerInstrument className="p-8 flex flex-col flex-grow">
                        <ContainerInstrument className="flex justify-between items-start mb-8">
                          <ContainerInstrument className="bg-black text-white text-[15px] font-light px-4 py-1.5 rounded-[10px] tracking-widest">
                            <VoiceglotText translationKey="studio.workshop_badge" defaultText="Workshop" />
                          </ContainerInstrument>
                          <TextInstrument className="text-[15px] font-light text-black/30 tracking-widest flex items-center gap-2">
                            <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} / /> {new Date(workshop.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })}
                          </TextInstrument>
                        </ContainerInstrument>

                        <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter leading-none mb-4 group-hover:text-primary transition-colors">
                          <VoiceglotText translationKey={`studio.workshop.${workshop.id}.title`} defaultText={workshop.title} />
                        </HeadingInstrument>
                        <TextInstrument className="text-black/50 text-[15px] mb-8 font-light leading-relaxed max-w-xs flex-grow">
                          <VoiceglotText 
                            translationKey={`studio.workshop.${workshop.id}.description`} 
                            defaultText={workshop.description || 'Ga samen met de workshopgever aan de slag in de studio.'} 
                          />
                        </TextInstrument>

                        <ContainerInstrument className="flex justify-between items-end pt-4 border-t border-black/[0.03]">
                          <ContainerInstrument>
                            <TextInstrument className="text-[15px] text-black/40 font-light tracking-widest mb-1">
                              <VoiceglotText translationKey="studio.investment" defaultText="Investering" />
                            </TextInstrument>
                            <TextInstrument className="text-2xl font-light tracking-tighter">€ {workshop.price}</TextInstrument>
                          </ContainerInstrument>
                          <Link strokeWidth={1.5} 
                            href={`/studio/book?id=${workshop.id}`}
                            className="flex items-center gap-3 text-[15px] font-light tracking-widest text-primary group/btn"
                          ><VoiceglotText translationKey="studio.book_cta" defaultText="Ik kom ook" /><Image strokeWidth={1.5} src="/assets/common/branding/icons/FORWARD.svg" width={16} height={16} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} className="group-hover/btn:translate-x-2 transition-transform" / /></Link>
                        </ContainerInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  ))}
                </ContainerInstrument>
              )}
            </ContainerInstrument>

            {/* 🎓 INSTRUCTEURS FOCUS */}
            <BentoCard span="full" className="bg-white p-16 rounded-[20px] shadow-aura">
              <ContainerInstrument className="max-w-4xl mb-20">
                <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest text-black/30 mb-8"><VoiceglotText translationKey="studio.instructors.label" defaultText="Jouw workshopgevers" /></HeadingInstrument>
                <HeadingInstrument level={2} className="text-6xl font-light tracking-tighter leading-none mb-8"><VoiceglotText translationKey="studio.instructors.title_part1" defaultText="Leer professioneler spreken met " /><br /><TextInstrument className="text-primary font-light"><VoiceglotText translationKey="studio.instructors.title_part2" defaultText="Bernadette en Johfrah." /></TextInstrument></HeadingInstrument>
                <TextInstrument className="text-xl text-black/40 font-light leading-relaxed"><VoiceglotText translationKey="studio.instructors.text" defaultText="Maak kennis met je instructeurs. Wij staan klaar om je te coachen en je spreekvaardigheden naar een hoger niveau te tillen." /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {teachers.map((t: any) => (
                  <ContainerInstrument key={t.id} className="group space-y-6">
                    <ContainerInstrument className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg grayscale hover:grayscale-0 transition-all duration-1000">
                      <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      <Image strokeWidth={1.5} 
                        src={t.photo ? `/assets/${t.photo.filePath}` : "/assets/common/founder/johfrah-avatar-be.png"} 
                        alt={t.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                      / />
                      <ContainerInstrument className="absolute bottom-8 left-8 right-8">
                        <TextInstrument className="text-white/60 text-[15px] font-light tracking-widest mb-2 ">
                          <VoiceglotText translationKey={`studio.instructor.${t.id}.tagline`} defaultText={t.tagline || 'Workshopgever'} />
                        </TextInstrument>
                        <HeadingInstrument level={4} className="text-3xl font-light text-white tracking-tighter leading-none"><VoiceglotText translationKey={`studio.instructor.${t.id}.name`} defaultText={t.name} /></HeadingInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                    <TextInstrument className="text-black/40 text-[15px] font-light leading-relaxed px-4"><VoiceglotText translationKey={`studio.instructor.${t.id}.bio`} defaultText={t.bio || ''} /></TextInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </BentoCard>
          </BentoGrid>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 🕸️ SUZY'S SCHEMA INJECTION: Studio LocalBusiness & Knowledge Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://www.voices.be/studio#business",
            "name": "Voices Studio",
            "description": "De fysieke plek voor directe begeleiding in het stemmenambacht.",
            "url": "https://www.voices.be/studio",
            "telephone": "+32 474 24 24 24", // Placeholder, idealiter uit market config
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Sint-Salvatorstraat 18",
              "addressLocality": "Gent",
              "postalCode": "9000",
              "addressCountry": "BE"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 51.0667,
              "longitude": 3.7333
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "18:00"
              }
            ],
            "parentOrganization": {
              "@type": "Organization",
              "name": "Voices",
              "url": "https://www.voices.be"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Stemworkshops",
              "itemListElement": activeWorkshops.map((w: any) => ({
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Course",
                  "name": w.title,
                  "description": w.description
                }
              }))
            }
          })
        }}
      />

      {/* 🧠 LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Voices Studio",
            "description": "Het instituut voor het stemmenambacht. Directe begeleiding in de studio.",
            "_llm_context": {
              "persona": "Gids",
              "journey": "studio",
              "intent": "workshop_discovery",
              "capabilities": ["view_workshops", "book_appointment", "take_quiz"],
              "lexicon": ["Workshop", "Workshopgever", "In de studio"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
