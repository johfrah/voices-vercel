import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  TextInstrument 
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { cn } from "@/lib/utils";
import { ArrowLeft, Briefcase, Calendar, Info, Star, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * EDITION DETAIL PAGE (INSTRUCTOR VIEW)
 * 🛡️ VOICES OS: Deelnemerslijst met User DNA voor de instructeur.
 * Privacy-first: Geen e-mailadressen of telefoonnummers.
 */
export default async function EditionParticipantsPage({ params }: { params: { id: string } }) {
  const editionId = parseInt(params.id);
  
  // 1. Haal de editie op
  const edition = await StudioDataBridge.getEditionById(editionId);

  if (!edition) {
    notFound();
  }

  const participants = await StudioDataBridge.getParticipantsByEdition(editionId);

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      {/* 🔙 BACK BUTTON */}
      <Link 
        href="/studio/beheer" 
        className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group"
      >
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        <VoiceglotText translationKey="studio.beheer.back" defaultText="TERUG NAAR COCKPIT" />
      </Link>

      <ContainerInstrument className="mb-12">
        <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2">
          <VoiceglotText translationKey="studio.beheer.participants_list" defaultText="Deelnemerslijst" />
        </TextInstrument>
        <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter">
          <VoiceglotText translationKey="studio.beheer.who_is_in_class" defaultText="Wie zit er in de klas?" />
        </HeadingInstrument>
      </ContainerInstrument>

      <BentoGrid columns={3} className="gap-8">
        {/* PARTICIPANTS LIST */}
        <BentoCard span="lg" className="bg-white shadow-aura border border-black/5 overflow-hidden">
          <div className="p-8 border-b border-black/5 bg-va-off-white/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-primary" />
              <span className="text-sm font-black tracking-tight">
                {participants.length} Deelnemers bevestigd
              </span>
            </div>
            <div className="text-[15px] font-bold text-black/20 tracking-widest">
              Privacy Mode Actief (No PII)
            </div>
          </div>

          <div className="divide-y divide-black/5">
            {participants.length > 0 ? participants.map((p: any) => {
              const user = p.order?.user;
              const dna = user?.preferences || {};
              
              return (
                <div key={p.id} className="p-8 hover:bg-va-off-white/30 transition-colors group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xl font-black tracking-tight">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="flex gap-4 mt-1">
                          <div className="flex items-center gap-1 text-[15px] font-bold text-black/30 tracking-widest">
                            <Briefcase strokeWidth={1.5} size={10} /> {dna.profession || 'Niet opgegeven'}
                          </div>
                          <div className="flex items-center gap-1 text-[15px] font-bold text-black/30 tracking-widest">
                            <Calendar strokeWidth={1.5} size={10} /> {dna.age || '?'} jaar
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* USER DNA TAGS */}
                    <div className="flex flex-wrap gap-2">
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-[15px] font-black uppercase tracking-widest border",
                        dna.experience === 'beginner' ? "bg-green-500/5 border-green-500/20 text-green-600" :
                        dna.experience === 'intermediate' ? "bg-blue-500/5 border-blue-500/20 text-blue-600" :
                        "bg-primary/5 border-primary/20 text-primary"
                      )}>
                        {dna.experience || 'beginner'}
                      </div>
                      {dna.goal && (
                        <div className="px-3 py-1.5 rounded-full text-[15px] font-black tracking-widest bg-black/5 border-black/10 text-black/40">
                          Doelgericht
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GOAL / EXPECTATIONS (IF AVAILABLE) */}
                  {dna.goal && (
                    <div className="mt-6 p-4 rounded-xl bg-va-off-white/50 border border-black/5 italic text-[15px] text-black/60 leading-relaxed">
                      &quot;{dna.goal}&quot;
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="py-20 text-center">
                <TextInstrument className="text-[15px] font-black tracking-widest text-black/20">
                  Nog geen deelnemers voor deze editie.
                </TextInstrument>
              </div>
            )}
          </div>
        </BentoCard>

        {/* SIDEBAR: INSTRUCTOR INFO & TIPS */}
        <div className="space-y-8">
          <BentoCard span="sm" className="bg-va-black text-white p-10">
            <Star strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <HeadingInstrument level={3} className="text-xl font-black tracking-tighter mb-4">
              <VoiceglotText translationKey="studio.beheer.prepare_title" defaultText="Bereid je voor" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 text-[15px] font-medium leading-relaxed mb-8">
              <VoiceglotText 
                translationKey="studio.beheer.prepare_desc" 
                defaultText="Gebruik het &lsquo;User DNA&rsquo; om je coaching aan te passen. Heb je veel beginners? Focus dan meer op de basis." 
              />
            </TextInstrument>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Info size={16} className="text-primary" />
                <span className="text-[15px] font-bold tracking-widest">80% Beginners</span>
              </div>
            </div>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-off-white p-10 border border-black/5">
            <HeadingInstrument level={3} className="text-[15px] font-black tracking-widest text-black/30 mb-6">
              Hulp nodig?
            </HeadingInstrument>
            <TextInstrument className="text-[15px] font-medium text-black/60 leading-relaxed mb-8">
              Vragen over de deelnemers of de logistiek? Neem contact op met de admin.
            </TextInstrument>
            <Link href="/studio/afspraak" className="text-[15px] font-black tracking-widest text-primary hover:underline">
              CONTACTEER ADMIN
            </Link>
          </BentoCard>
        </div>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
