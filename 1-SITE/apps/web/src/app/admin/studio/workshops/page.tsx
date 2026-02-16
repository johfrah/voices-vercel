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
    Users,
    History,
    BookOpen,
    UserMinus
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudioAdminWorkshopsPage() {
  const user = await getServerUser();
  if (!user) redirect('/auth/login');
  if (!isAdminUser(user)) redirect('/studio');

  const editions = await StudioDataBridge.getAllEditions();
  const upcomingEditions = editions.filter(e => e.status === 'upcoming');
  const pastEditions = editions.filter(e => e.status === 'completed');

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <ContainerInstrument>
          <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2">STUDIO ADMIN</TextInstrument>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">Workshop Beheer</HeadingInstrument>
        </ContainerInstrument>
        <Link href="/admin/studio/workshops/new">
          <ButtonInstrument className="va-btn-pro">
            <Plus strokeWidth={1.5} size={16} /> NIEUWE EDITIE PLANNEN
          </ButtonInstrument>
        </Link>
      </ContainerInstrument>

      <BentoGrid columns={3} className="gap-8">
        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between">
          <ContainerInstrument>
            <Calendar strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-black/30 font-light">Geplande Edities</TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">{upcomingEditions.length}</HeadingInstrument>
          </ContainerInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-va-off-white p-8 border border-black/5 flex flex-col justify-between">
          <ContainerInstrument>
            <History strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-black/30 font-light">Historische Edities</TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">{pastEditions.length}</HeadingInstrument>
          </ContainerInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-va-black text-white p-8 flex flex-col justify-between">
          <ContainerInstrument>
            <Users strokeWidth={1.5} className="text-primary mb-6" size={24} />
            <TextInstrument className="text-[15px] tracking-widest text-white/30 font-light">Totaal Unieke Deelnemers</TextInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter mt-2">114</HeadingInstrument>
          </ContainerInstrument>
        </BentoCard>

        <BentoCard span="lg" className="bg-white shadow-aura p-10 border border-black/5">
          <HeadingInstrument level={2} className="text-[15px] tracking-widest text-black/30 mb-8 font-light uppercase">Komende Workshops</HeadingInstrument>
          <ContainerInstrument className="space-y-4">
            {upcomingEditions.map((edition) => <EditionRow key={edition.id} edition={edition} />)}
          </ContainerInstrument>
          <HeadingInstrument level={2} className="text-[15px] tracking-widest text-black/30 mt-16 mb-8 font-light uppercase">Historische Workshops</HeadingInstrument>
          <ContainerInstrument className="space-y-4">
            {pastEditions.map((edition) => <EditionRow key={edition.id} edition={edition} />)}
          </ContainerInstrument>
        </BentoCard>

        {/* QUICK ACTIONS */}
        <BentoCard span="sm" className="bg-va-off-white p-10 border border-black/5">
          <HeadingInstrument level={3} className="text-[15px] tracking-widest text-black/30 mb-6 font-light uppercase">Beheer</HeadingInstrument>
          <ContainerInstrument className="space-y-4">
            <Link href="/admin/studio/workshops/catalog" className="flex items-center gap-3 p-4 rounded-xl bg-white border border-black/5 hover:border-primary/20 transition-all group">
              <BookOpen size={18} className="text-primary" />
              <TextInstrument className="text-[15px] font-bold">Workshop Catalogus</TextInstrument>
            </Link>
            <Link href="/admin/studio/orphans" className="flex items-center gap-3 p-4 rounded-xl bg-white border border-black/5 hover:border-primary/20 transition-all group">
              <UserMinus size={18} className="text-primary" />
              <TextInstrument className="text-[15px] font-bold">Deelnemers zonder datum</TextInstrument>
            </Link>
            <Link href="/admin/studio/locations" className="flex items-center gap-3 p-4 rounded-xl bg-white border border-black/5 hover:border-primary/20 transition-all group">
              <MapPin size={18} className="text-primary" />
              <TextInstrument className="text-[15px] font-bold">Locaties Beheren</TextInstrument>
            </Link>
            <Link href="/admin/studio/instructors" className="flex items-center gap-3 p-4 rounded-xl bg-white border border-black/5 hover:border-primary/20 transition-all group">
              <Users size={18} className="text-primary" />
              <TextInstrument className="text-[15px] font-bold">Instructeurs Beheren</TextInstrument>
            </Link>
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}

function EditionRow({ edition }: { edition: any }) {
  const date = new Date(edition.date);
  return (
    <ContainerInstrument className="group p-6 rounded-2xl bg-va-off-white border border-transparent hover:border-black/5 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
      <ContainerInstrument className="flex items-center gap-6 w-full md:w-auto">
        <ContainerInstrument className="w-14 h-14 rounded-2xl bg-black text-white flex flex-col items-center justify-center">
          <TextInstrument className="text-[15px] font-black">{date.getDate()}</TextInstrument>
          <TextInstrument className="text-[15px] font-bold ">{date.toLocaleString('nl-BE', { month: 'short' })}</TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument>
          <HeadingInstrument level={4} className="text-lg font-light tracking-tight">{edition.title || edition.workshop?.title}</HeadingInstrument>
          <ContainerInstrument className="flex gap-4 mt-1 text-[13px] font-bold text-black/30 tracking-widest uppercase">
            <span className="flex items-center gap-1"><MapPin size={10} /> {edition.location?.name || 'Gent'}</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}</span>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
      <Link href={`/admin/studio/workshops/${edition.id}`} className="va-btn-secondary !p-4 !rounded-xl">
        <Settings strokeWidth={1.5} size={16} className="text-black/20 group-hover:text-primary transition-colors" />
      </Link>
    </ContainerInstrument>
  );
}
