import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument,
    FixedActionDockInstrument
} from "@/components/ui/LayoutInstruments";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { useAdminTracking } from '@/hooks/useAdminTracking';
import {
    ArrowRight,
    Calendar,
    Clock,
    ExternalLink,
    MapPin,
    Plus,
    Settings,
    TrendingUp,
    Users,
    History,
    BookOpen,
    UserMinus,
    Download
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Workshop Beheer | Voices Admin',
  description: 'Beheer van workshop edities en deelnemers.',
};

export default async function StudioAdminWorkshopsPage() {
  const user = await getServerUser();
  if (!user) redirect('/account');
  if (!isAdminUser(user)) redirect('/studio');

  const editions = await StudioDataBridge.getAllEditions();
  const now = new Date();
  
  // 1 Truth Handshake: Datum is de bron van waarheid, status is een label
  const upcomingEditions = editions.filter(e => {
    const editionDate = new Date(e.date);
    return editionDate >= now && e.status !== 'cancelled';
  });
  
  const pastEditions = editions.filter(e => {
    const editionDate = new Date(e.date);
    return editionDate < now || e.status === 'completed';
  });

  // Forensische check: Edities die in het verleden liggen maar niet op 'completed' staan
  const needsAction = editions.filter(e => {
    const editionDate = new Date(e.date);
    return editionDate < now && e.status === 'upcoming';
  });

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <ContainerInstrument>
          <TextInstrument className="text-[15px] font-light tracking-widest text-black/40 mb-2">
            <VoiceglotText translationKey="admin.studio.label" defaultText="Studio Admin" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">
            <VoiceglotText translationKey="admin.studio.title" defaultText="Workshop beheer" />
          </HeadingInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {needsAction.length > 0 && (
        <ContainerInstrument className="mb-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center text-amber-700">
              <Clock size={20} />
            </div>
            <div>
              <TextInstrument className="font-black text-amber-900 uppercase tracking-tight">Actie Vereist</TextInstrument>
              <TextInstrument className="text-amber-700/70 text-sm font-medium">{needsAction.length} edities liggen in het verleden maar staan nog op 'upcoming'.</TextInstrument>
            </div>
          </div>
          <Link href="/admin/studio/workshops/audit" className="va-btn-pro !bg-amber-200 !text-amber-900 !text-[11px]">START AUTO-HEAL</Link>
        </ContainerInstrument>
      )}

      <BentoGrid columns={3} className="gap-8">
        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between rounded-[20px]">
          <ContainerInstrument>
            <Calendar strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-black/30 font-light"><VoiceglotText translationKey="admin.studio.upcoming" defaultText="Geplande edities" /></TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">{upcomingEditions.length}</HeadingInstrument>
          </ContainerInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between rounded-[20px]">
          <ContainerInstrument>
            <History strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-black/30 font-light"><VoiceglotText translationKey="admin.studio.past" defaultText="Historische edities" /></TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">{pastEditions.length}</HeadingInstrument>
          </ContainerInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-va-black text-white p-8 flex flex-col justify-between rounded-[20px]">
          <ContainerInstrument>
            <Users strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-white/30 font-light"><VoiceglotText translationKey="admin.studio.total_participants" defaultText="Totaal unieke deelnemers" /></TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">114</HeadingInstrument>
          </ContainerInstrument>
        </BentoCard>

        <BentoCard span="lg" className="bg-white shadow-aura p-10 border border-black/5 rounded-[20px]">
          <HeadingInstrument level={2} className="text-[15px] tracking-widest text-black/30 mb-8 font-light"><VoiceglotText translationKey="admin.studio.upcoming_workshops" defaultText="Komende workshops" /></HeadingInstrument>
          <ContainerInstrument className="space-y-4">
            {upcomingEditions.map((edition) => <EditionRow key={edition.id} edition={edition} />)}
          </ContainerInstrument>
          <HeadingInstrument level={2} className="text-[15px] tracking-widest text-black/30 mt-16 mb-8 font-light"><VoiceglotText translationKey="admin.studio.past_workshops" defaultText="Historische workshops" /></HeadingInstrument>
          <ContainerInstrument className="space-y-4">
            {pastEditions.map((edition) => <EditionRow key={edition.id} edition={edition} />)}
          </ContainerInstrument>
        </BentoCard>

        {/* QUICK ACTIONS */}
        <BentoCard span="sm" className="bg-va-off-white p-10 border border-black/5 rounded-[20px]">
          <HeadingInstrument level={3} className="text-[15px] tracking-widest text-black/30 mb-6 font-light">
            <VoiceglotText translationKey="admin.studio.manage_label" defaultText="Beheer" />
          </HeadingInstrument>
          <ContainerInstrument className="space-y-4">
            <Link href="/admin/studio/workshops/catalog" className="flex items-center gap-3 p-4 rounded-[10px] bg-white border border-black/5 hover:border-primary/20 transition-all group">
              <BookOpen size={18} className="text-primary" />
              <TextInstrument className="text-[15px] font-light">
                <VoiceglotText translationKey="admin.studio.catalog" defaultText="Workshop catalogus" />
              </TextInstrument>
            </Link>
            <Link href="/admin/studio/orphans" className="flex items-center gap-3 p-4 rounded-[10px] bg-white border border-black/5 hover:border-primary/20 transition-all group">
              <UserMinus size={18} className="text-primary" />
              <TextInstrument className="text-[15px] font-light">
                <VoiceglotText translationKey="admin.studio.orphans" defaultText="Deelnemers zonder datum" />
              </TextInstrument>
            </Link>
            <Link href="/admin/studio/locations" className="flex items-center gap-3 p-4 rounded-[10px] bg-white border border-black/5 hover:border-primary/20 transition-all group">
              <MapPin size={18} className="text-primary" />
              <TextInstrument className="text-[15px] font-light">
                <VoiceglotText translationKey="admin.studio.locations" defaultText="Locaties beheren" />
              </TextInstrument>
            </Link>
            <Link href="/admin/studio/instructors" className="flex items-center gap-3 p-4 rounded-[10px] bg-white border border-black/5 hover:border-primary/20 transition-all group">
              <Users size={18} className="text-primary" />
              <TextInstrument className="text-[15px] font-light">
                <VoiceglotText translationKey="admin.studio.instructors" defaultText="Instructeurs beheren" />
              </TextInstrument>
            </Link>
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>

      <FixedActionDockInstrument>
        <ContainerInstrument plain className="flex items-center gap-4">
          <Link href="/admin/studio/workshops/new">
            <ButtonInstrument className="va-btn-pro !bg-va-black flex items-center gap-2">
              <Plus strokeWidth={1.5} size={16} /> 
              <VoiceglotText translationKey="admin.studio.new_edition" defaultText="Nieuwe editie plannen" />
            </ButtonInstrument>
          </Link>
          <ButtonInstrument variant="outline" className="border-black/10 text-va-black hover:bg-va-black/5 flex items-center gap-2">
            <Download strokeWidth={1.5} size={16} />
            <VoiceglotText translationKey="admin.studio.export" defaultText="Deelnemers exporteren" />
          </ButtonInstrument>
        </ContainerInstrument>
      </FixedActionDockInstrument>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "Workshop Beheer",
            "description": "Beheer van workshop edities en deelnemers.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "workshop_management",
              "capabilities": ["create_edition", "manage_participants", "export_data"],
              "lexicon": ["Workshop", "Editie", "Deelnemers", "Studio"],
              "visual_dna": ["Bento Grid", "Liquid DNA"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}

function EditionRow({ edition }: { edition: any }) {
  const date = new Date(edition.date);
  return (
    <ContainerInstrument className="group p-6 rounded-2xl bg-va-off-white border border-transparent hover:border-black/5 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
      <ContainerInstrument className="flex items-center gap-6 w-full md:w-auto">
        <ContainerInstrument className="w-14 h-14 rounded-2xl bg-black text-white flex flex-col items-center justify-center">
          <TextInstrument className="text-[15px] font-light">{date.getDate()}</TextInstrument>
          <TextInstrument className="text-[15px] font-light ">{date.toLocaleString('nl-BE', { month: 'short' })}</TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument>
          <HeadingInstrument level={4} className="text-lg font-light tracking-tight">{edition.title || edition.workshop?.title}</HeadingInstrument>
          <ContainerInstrument className="flex gap-4 mt-1 text-[13px] font-light text-black/30 tracking-widest">
            <span className="flex items-center gap-1"><MapPin size={10} /> {edition.location?.name || 'Gent'}</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}</span>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
      <Link href={`/admin/studio/workshops/${edition.id}`} className="va-btn-secondary !p-4 !rounded-[10px]">
        <Settings strokeWidth={1.5} size={16} className="text-black/20 group-hover:text-primary transition-colors" />
      </Link>
    </ContainerInstrument>
  );
}
