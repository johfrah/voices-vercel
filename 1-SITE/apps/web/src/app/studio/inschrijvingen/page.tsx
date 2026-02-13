import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { StudioDataBridge } from "@/lib/studio-bridge";
import {
    ArrowRight,
    Calendar,
    Clock,
    ExternalLink,
    MapPin,
    Plus,
    Settings,
    TrendingUp,
    Users
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * INSTRUCTOR DASHBOARD (BEHEER)
 * 🛡️ VOICES OS: De cockpit voor de ondernemende instructeur.
 * Alleen voor ingelogde instructeurs (of admins die als instructeur doorgaan).
 */
export default async function InstructorDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/auth/login');

  // Admin mag door; anders moet user een instructeur zijn
  const isAdmin = isAdminUser(user);
  const isBernadette = user.email === 'bernadette@voices.be'; // Partner workshop sleutel
  
  const currentUserId = user.id;
  const instructor = await StudioDataBridge.getInstructorByUserId(currentUserId);

  if (!instructor && !isAdmin && !isBernadette) {
    redirect('/studio');
  }
  // Admin of Bernadette zonder instructeur-profiel: gebruik fallback voor demo (Johfrah)
  const effectiveInstructor = instructor ?? await StudioDataBridge.getInstructorByUserId(9450);
  if (!effectiveInstructor) {
    redirect('/admin/dashboard');
  }

  const editions = await StudioDataBridge.getInstructorEditions(effectiveInstructor.id);
  
  // Statistieken berekenen voor de instructeur
  const upcomingEditions = editions.filter(e => e.status === 'upcoming');
  const totalParticipants = upcomingEditions.reduce((acc, e) => acc + (e.capacity || 0), 0); // TODO: Echte deelnemers tellen

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <ContainerInstrument>
          <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2"><VoiceglotText translationKey="studio.beheer.cockpit_badge" defaultText="Instructor Cockpit" /></TextInstrument>
          <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter"><VoiceglotText translationKey="studio.beheer.welcome" defaultText="Welkom," /> <TextInstrument className="text-primary font-light">{effectiveInstructor.name.split(' ')[0]}</TextInstrument>.</HeadingInstrument>
        </ContainerInstrument>
        
        <ButtonInstrument className="va-btn-pro">
          <Plus strokeWidth={1.5} size={16} /> <VoiceglotText translationKey="studio.beheer.cta.new_workshop" defaultText="NIEUWE WORKSHOP PLANNEN" />
        </ButtonInstrument>
      </ContainerInstrument>

      <BentoGrid columns={3} className="gap-8">
        {/* STATS CARDS */}
        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between">
          <ContainerInstrument>
            <Calendar strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-black/30 font-light"><VoiceglotText translationKey="studio.beheer.stats.planned" defaultText="Geplande Edities" /></TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter mt-2">{upcomingEditions.length}</HeadingInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-bold text-black/20 tracking-widest mt-8"><VoiceglotText translationKey="studio.beheer.stats.next" defaultText="Volgende:" /> {upcomingEditions[0]?.date.toLocaleDateString('nl-BE') || <VoiceglotText translationKey="common.none" defaultText="Geen" />}</TextInstrument>
        </BentoCard>

        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between">
          <ContainerInstrument>
            <Users strokeWidth={1.5} className="text-primary mb-6" size={24} / />
            <TextInstrument className="text-[15px] tracking-widest text-black/30 font-light"><VoiceglotText translationKey="studio.beheer.stats.capacity" defaultText="Totale Capaciteit" /></TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter mt-2">{totalParticipants}</HeadingInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-bold text-black/20 tracking-widest mt-8"><VoiceglotText translationKey="studio.beheer.stats.avg" defaultText="Gem. 8 per workshop" /></TextInstrument>
        </BentoCard>

        <BentoCard span="sm" className="bg-va-black text-white p-8 flex flex-col justify-between">
          <ContainerInstrument>
            <TrendingUp className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-white/30 font-light"><VoiceglotText translationKey="studio.beheer.stats.impact" defaultText="Jouw Impact" /></TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter mt-2">4.9/5</HeadingInstrument>
          </ContainerInstrument>
          <Link strokeWidth={1.5} href="/studio/reviews" className="text-[15px] font-black tracking-widest text-primary hover:underline mt-8 flex items-center gap-2"><VoiceglotText translationKey="studio.beheer.stats.reviews_cta" defaultText="BEKIJK REVIEWS" /><ExternalLink strokeWidth={1.5} size={12} / /></Link>
        </BentoCard>

        {/* ACTIVE EDITIONS LIST */}
        <BentoCard span="lg" className="bg-white shadow-aura p-10 border border-black/5">
          <HeadingInstrument level={2} className="text-[15px] tracking-widest text-black/30 mb-8 font-light"><VoiceglotText translationKey="studio.beheer.active_workshops" defaultText="Jouw Actieve Workshops" /></HeadingInstrument>
          
          <ContainerInstrument className="space-y-4">
            {upcomingEditions.length > 0 ? upcomingEditions.map((edition) => (
              <ContainerInstrument key={edition.id} className="group p-6 rounded-2xl bg-va-off-white border border-transparent hover:border-black/5 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                <ContainerInstrument className="flex items-center gap-6 w-full md:w-auto">
                  <ContainerInstrument className="w-14 h-14 rounded-2xl bg-black text-white flex flex-col items-center justify-center">
                    <TextInstrument className="text-[15px] font-black">{edition.date.getDate()}</TextInstrument>
                    <TextInstrument className="text-[15px] font-bold ">{edition.date.toLocaleString('nl-BE', { month: 'short' })}</TextInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={4} className="text-lg font-black tracking-tight">
                      {edition.workshop?.title}
                    </HeadingInstrument>
                    <ContainerInstrument className="flex flex-wrap gap-4 mt-1">
                      <ContainerInstrument className="flex items-center gap-1 text-[15px] font-bold text-black/30 tracking-widest">
                        <MapPin strokeWidth={1.5} size={10} / /> {edition.location?.name || 'Gent'}
                      </ContainerInstrument>
                      <ContainerInstrument className="flex items-center gap-1 text-[15px] font-bold text-black/30 tracking-widest">
                        <Clock strokeWidth={1.5} size={10} / /> {edition.date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                      </ContainerInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                
                <ContainerInstrument className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                  <ContainerInstrument className="text-right">
                    <ContainerInstrument className="text-[15px] font-black tracking-widest text-black/20 mb-1">
                      <VoiceglotText translationKey="studio.beheer.occupancy" defaultText="Bezetting" />
                    </ContainerInstrument>
                    <ContainerInstrument className="flex items-center gap-2">
                      <ContainerInstrument className="w-24 h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <ContainerInstrument className="h-full bg-primary w-[75%]" />
                      </ContainerInstrument>
                      <TextInstrument className="text-[15px] font-black">6/{edition.capacity}</TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <Link strokeWidth={1.5} href={`/studio/inschrijvingen/editie/${edition.id}`} className="va-btn-secondary !p-4 !rounded-xl">
                    <Settings strokeWidth={1.5} size={16} className="text-black/20 group-hover/btn:text-primary transition-colors" / />
                  </Link>
                </ContainerInstrument>
              </ContainerInstrument>
            )) : (
              <ContainerInstrument className="py-20 text-center border-2 border-dashed border-black/5 rounded-[32px]">
                <TextInstrument className="text-[15px] tracking-widest text-black/20 font-light"><VoiceglotText translationKey="studio.beheer.no_workshops" defaultText="Nog geen workshops gepland. Start met je eerste!" /></TextInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        </BentoCard>

        {/* QUICK ACTIONS / TIPS */}
        <BentoCard span="sm" className="bg-va-off-white p-10 border border-black/5 flex flex-col justify-between">
          <ContainerInstrument>
            <HeadingInstrument level={3} className="text-[15px] tracking-widest text-black/30 mb-6 font-light"><VoiceglotText translationKey="studio.beheer.tips.title" defaultText="Tips voor succes" /></HeadingInstrument>
            <ContainerInstrument className="space-y-6">
              <ContainerInstrument className="flex gap-4">
                <ContainerInstrument className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <TextInstrument as="span" className="text-[15px] font-black text-primary">1</TextInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[15px] font-medium text-black/60 leading-relaxed"><VoiceglotText translationKey="studio.beheer.tips.tip1" defaultText="Deel je persoonlijke link op LinkedIn om meer deelnemers te trekken." /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex gap-4">
                <ContainerInstrument className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <TextInstrument as="span" className="text-[15px] font-black text-primary">2</TextInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[15px] font-medium text-black/60 leading-relaxed"><VoiceglotText translationKey="studio.beheer.tips.tip2" defaultText="Upload je bio en foto om je profiel aantrekkelijker te maken." /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ButtonInstrument className="va-btn-pro !bg-transparent !text-primary !px-0 !justify-start hover:!bg-transparent hover:underline">
            <VoiceglotText translationKey="studio.beheer.tips.cta" defaultText="MEER TIPS BEKIJKEN" />
            <ArrowRight strokeWidth={1.5} size={14} />
          </ButtonInstrument>
        </BentoCard>
      </BentoGrid>

      {/* 🧠 LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "InstructorDashboard",
            "name": "Instructor Cockpit",
            "description": "Beheer-omgeving voor Voices Studio instructeurs.",
            "_llm_context": {
              "persona": "Ondernemende Instructeur",
              "journey": "studio",
              "intent": "workshop_management",
              "capabilities": ["manage_editions", "view_participants", "read_reviews", "update_profile"],
              "lexicon": ["Cockpit", "Editie", "Bezetting", "Impact"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
