import { 
    ContainerInstrument, 
    HeadingInstrument, 
    PageWrapperInstrument, 
    TextInstrument 
} from "@/components/ui/LayoutInstruments";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { redirect, notFound } from "next/navigation";
import WorkshopCatalogFormClient from "./WorkshopCatalogFormClient";

export default async function AdminWorkshopEditPage({ params }: { params: { id: string } }) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) redirect('/studio');

  const workshopId = parseInt(params.id);
  const workshop = await StudioDataBridge.getWorkshopById(workshopId);
  if (!workshop) notFound();

  const instructors = await StudioDataBridge.getAllInstructors();

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-4xl mx-auto">
      <Link href="/admin/studio/workshops/catalog" className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group">
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        TERUG NAAR CATALOGUS
      </Link>

      <ContainerInstrument className="mb-16">
        <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2 uppercase">Catalogus Beheer</TextInstrument>
        <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">Workshop Bewerken</HeadingInstrument>
      </ContainerInstrument>

      <WorkshopCatalogFormClient 
        workshop={workshop} 
        instructors={instructors} 
      />
    </PageWrapperInstrument>
  );
}
