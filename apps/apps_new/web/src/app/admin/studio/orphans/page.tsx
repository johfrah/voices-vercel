import { 
    ContainerInstrument, 
    HeadingInstrument, 
    PageWrapperInstrument, 
    TextInstrument 
} from "@/components/ui/LayoutInstruments";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { ArrowLeft, UserMinus, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";
import OrphanManagerClient from "./OrphanManagerClient";

export default async function AdminOrphanManagerPage() {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) redirect('/studio');

  // Haal alle wezen op (deelnemers zonder editionId of bij geannuleerde edities)
  const orphans = await StudioDataBridge.getOrphanedParticipants();
  const allEditions = await StudioDataBridge.getAllEditions();
  const upcomingEditions = allEditions.filter(e => e.status === 'upcoming');

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <Link href="/admin/studio/workshops" className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group">
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        TERUG NAAR COCKPIT
      </Link>

      <ContainerInstrument className="mb-16">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-primary">
            <UserMinus size={20} />
          </div>
          <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 uppercase">Studio Beheer</TextInstrument>
        </div>
        <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">Deelnemers zonder datum</HeadingInstrument>
        <TextInstrument className="text-xl text-black/40 mt-4 max-w-2xl">
          Deze {orphans.length} deelnemers hebben betaald, maar zijn nog niet gekoppeld aan een actieve workshop-datum.
        </TextInstrument>
      </ContainerInstrument>

      <OrphanManagerClient 
        initialOrphans={orphans} 
        editions={upcomingEditions} 
      />
    </PageWrapperInstrument>
  );
}
