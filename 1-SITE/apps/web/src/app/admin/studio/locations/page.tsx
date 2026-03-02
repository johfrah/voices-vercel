import { BentoCard, BentoGrid } from "@/components/ui/BentoGridInstrument";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { cn } from "@/lib/utils";
import { 
    MapPin, 
    Plus, 
    Edit2, 
    Trash2, 
    ExternalLink,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";
import LocationFormClient from "./LocationFormClient";

export default async function AdminLocationsPage() {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) redirect('/studio');

  const locations = await StudioDataBridge.getLocations();

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <Link href="/admin/studio/workshops" className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group">
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        TERUG NAAR COCKPIT
      </Link>

      <ContainerInstrument className="flex justify-between items-end mb-16">
        <div>
          <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2 uppercase">Studio Beheer</TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">Workshop Locaties</HeadingInstrument>
        </div>
      </ContainerInstrument>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LIJST MET LOCATIES */}
        <div className="lg:col-span-7 space-y-6">
          {locations.map((loc: any) => (
            <BentoCard key={loc.id} className="bg-white shadow-aura border border-black/5 p-8 group">
              <div className="flex justify-between items-start">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-va-off-white rounded-2xl flex items-center justify-center text-black/20">
                    <MapPin size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                    <HeadingInstrument level={3} className="text-2xl font-light">{loc.name}</HeadingInstrument>
                    <TextInstrument className="text-black/40 font-medium mt-1">{loc.address}, {loc.zip} {loc.city}</TextInstrument>
                    
                    <div className="flex gap-4 mt-4">
                      <div className="bg-va-off-white px-3 py-1 rounded-lg text-[11px] font-black tracking-widest text-black/30 uppercase">
                        BTW: {loc.vatNumber || 'Niet ingesteld'}
                      </div>
                      {loc.mapUrl && (
                        <a href={loc.mapUrl} target="_blank" className="text-[11px] font-black tracking-widest text-primary hover:underline flex items-center gap-1">
                          GOOGLE MAPS <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-va-off-white rounded-lg text-black/20 hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-black/20 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </BentoCard>
          ))}
        </div>

        {/* FORMULIER VOOR NIEUWE LOCATIE */}
        <div className="lg:col-span-5">
          <BentoCard className="bg-va-black text-white p-10 sticky top-32">
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter mb-8 text-white">Locatie Toevoegen</HeadingInstrument>
            <LocationFormClient />
          </BentoCard>
        </div>
      </div>
    </PageWrapperInstrument>
  );
}
