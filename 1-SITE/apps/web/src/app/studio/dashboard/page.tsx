import { StudioDataBridge } from "@/lib/studio-bridge";
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Calendar, Users, Mic, Download, ArrowRight, Star, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

/**
 * STUDIO COCKPIT (DASHBOARD)
 * Het centrale punt voor (Silent) Users om hun workshops en audio te beheren.
 * HTML Zero, CSS Zero, Text Zero.
 */

export default async function StudioDashboardPage() {
  // Voor nu simuleren we de ingelogde user (bijv. Peter Kerschot)
  // In de echte flow komt dit uit de auth session
  const userId = 8728; 
  const registrations = await StudioDataBridge.getRegistrationsByUserId(userId);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-40 px-6 md:px-12">
      <ContainerInstrument className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <SectionInstrument className="mb-16">
          <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full mb-8 shadow-sm border border-black/[0.03]">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[15px] font-black tracking-widest text-black/60">
              <VoiceglotText translationKey="studio.dashboard.badge" defaultText="Jouw Studio Cockpit" />
            </span>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none mb-4">
            <VoiceglotText translationKey="studio.dashboard.welcome" defaultText="Welkom terug," /> <br />
            <span className="text-primary">
              <VoiceglotText translationKey="user.current.first_name" defaultText="Peter" noTranslate={true} />.
            </span>
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
              </HeadingInstrument>
              <TextInstrument className="text-white/60 font-medium max-w-sm">
                <VoiceglotText translationKey="studio.dashboard.audio_desc" defaultText="Download je ruwe opnames en de gemonteerde versies van je laatste sessie." />
              </TextInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="space-y-4">
              {registrations.length > 0 && (registrations[0].items as any[]).map((item, idx) => (
                item.dropboxUrl && (
                  <a 
                    key={idx}
                    href={item.dropboxUrl} 
                    target="_blank"
                    className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Download size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-black tracking-tight">
                          <VoiceglotText translationKey={`order.item.${item.id}.name`} defaultText={item.name} noTranslate={true} />
                        </div>
                        <div className="text-[15px] font-bold opacity-40 tracking-widest">
                          <VoiceglotText translationKey="common.audio_quality" defaultText="WAV • High Quality" />
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </a>
                )
              ))}
            </ContainerInstrument>
          </BentoCard>

          {/* 📅 GEPLANDE WORKSHOPS */}
          <BentoCard span="sm" className="bg-white p-10 flex flex-col justify-between border border-black/5 shadow-aura">
            <ContainerInstrument>
              <Calendar className="text-primary mb-8" size={32} />
              <HeadingInstrument level={3} className="text-2xl font-black tracking-tighter mb-6">
                <VoiceglotText translationKey="studio.dashboard.upcoming" defaultText="Gepland" />
              </HeadingInstrument>
              
              <ContainerInstrument className="space-y-6">
                <div className="p-6 rounded-[24px] bg-va-off-white border border-black/[0.03]">
                  <div className="text-[15px] font-black text-primary tracking-widest mb-2">
                    <VoiceglotText translationKey="common.date.example" defaultText="27 FEBRUARI 2026" />
                  </div>
                  <div className="text-sm font-black tracking-tight mb-1">
                    <VoiceglotText translationKey="workshop.example.title" defaultText="Voice-overs voor beginners" />
                  </div>
                  <div className="text-[15px] font-bold text-black/30 tracking-widest flex items-center gap-2">
                    <Clock size={10} /> 10:00 - 17:00
                  </div>
                </div>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <Link href="/studio/kalender" className="text-[15px] font-black tracking-widest text-black/20 hover:text-primary transition-colors flex items-center gap-2">
              <VoiceglotText translationKey="studio.dashboard.view_calendar" defaultText="BEKIJK VOLLEDIGE KALENDER" /> <ArrowRight size={12} />
            </Link>
          </BentoCard>

          {/* 🧬 USER DNA BENTO */}
          <BentoCard span="sm" className="bg-va-black text-white p-10 flex flex-col justify-between">
            <ContainerInstrument>
              <Star className="text-primary mb-8" size={32} />
              <HeadingInstrument level={3} className="text-2xl font-black tracking-tighter mb-6">
                <VoiceglotText translationKey="studio.dashboard.dna" defaultText="Jouw User DNA" />
              </HeadingInstrument>
              <ContainerInstrument className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[15px] font-bold text-white/30 tracking-widest">
                    <VoiceglotText translationKey="common.profession" defaultText="Beroep" />
                  </span>
                  <span className="text-[15px] font-black tracking-tight text-primary">
                    <VoiceglotText translationKey="user.current.profession" defaultText="Tandarts" noTranslate={true} />
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[15px] font-bold text-white/30 tracking-widest">
                    <VoiceglotText translationKey="common.age" defaultText="Leeftijd" />
                  </span>
                  <span className="text-[15px] font-black tracking-tight">63</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[15px] font-bold text-white/30 tracking-widest">
                    <VoiceglotText translationKey="common.experience" defaultText="Ervaring" />
                  </span>
                  <span className="text-[15px] font-black tracking-tight">
                    <VoiceglotText translationKey="common.level.beginner" defaultText="Beginner" />
                  </span>
                </div>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <Link href="/account/settings" className="text-[15px] font-black tracking-widest text-white/20 hover:text-primary transition-colors">
              <VoiceglotText translationKey="studio.dashboard.edit_dna" defaultText="DNA BIJWERKEN" />
            </Link>
          </BentoCard>

          {/* 🎓 NEXT STEPS */}
          <BentoCard span="lg" className="bg-white p-12 border border-black/5 shadow-aura flex flex-col md:flex-row gap-12 items-center">
            <ContainerInstrument className="flex-1">
              <HeadingInstrument level={3} className="text-3xl font-black tracking-tighter mb-6">
                <VoiceglotText translationKey="studio.dashboard.next_step" defaultText="Klaar voor de volgende stap?" />
              </HeadingInstrument>
              <TextInstrument className="text-black/40 font-medium leading-relaxed mb-8">
                <VoiceglotText translationKey="studio.dashboard.next_step_desc" defaultText="Je hebt de basis onder de knie. De workshop 'Perfectie van Intonatie' is de ideale vervolgstap voor jouw profiel." />
              </TextInstrument>
              <Link href="/studio/perfectie-van-intonatie">
                <ButtonInstrument className="va-btn-pro flex items-center gap-4 group">
                  <VoiceglotText translationKey="studio.dashboard.next_step_cta" defaultText="ONTDEK DEZE WORKSHOP" /> <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </ButtonInstrument>
              </Link>
            </ContainerInstrument>
            <ContainerInstrument className="w-full md:w-64 aspect-square bg-va-off-white rounded-[32px] overflow-hidden relative border border-black/5">
              <Image 
                src="/assets/studio/placeholder.jpg" 
                alt="Next Step"
                fill
                className="object-cover grayscale"
              />
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
