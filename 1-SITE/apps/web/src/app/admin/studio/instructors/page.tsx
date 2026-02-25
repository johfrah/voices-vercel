import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { cn } from "@/lib/utils";
import { 
    User, 
    Plus, 
    Edit2, 
    Trash2, 
    Mail,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";
import InstructorFormClient from "./InstructorFormClient";

export default async function AdminInstructorsPage() {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) redirect('/studio');

  const instructors = await StudioDataBridge.getAllInstructors();

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <Link href="/admin/studio/workshops" className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group">
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        TERUG NAAR COCKPIT
      </Link>

      <ContainerInstrument className="flex justify-between items-end mb-16">
        <div>
          <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2 uppercase">Studio Beheer</TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">Workshopgevers</HeadingInstrument>
        </div>
      </ContainerInstrument>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LIJST MET INSTRUCTEURS */}
        <div className="lg:col-span-7 space-y-6">
          {instructors.map((ins: any) => (
            <BentoCard key={ins.id} className="bg-white shadow-aura border border-black/5 p-8 group">
              <div className="flex justify-between items-start">
                <div className="flex gap-6">
                  <div className="w-20 h-20 bg-va-off-white rounded-2xl flex items-center justify-center text-black/20 overflow-hidden">
                    {ins.photo_id ? (
                      <Image src={`/assets/${ins.photo?.filePath}`} className="w-full h-full object-cover" alt={ins.name} width={80} height={80} />
                    ) : (
                      <User size={40} strokeWidth={1} />
                    )}
                  </div>
                  <div>
                    <HeadingInstrument level={3} className="text-2xl font-light">{ins.first_name} {ins.last_name}</HeadingInstrument>
                    <TextInstrument className="text-primary font-bold text-[13px] tracking-widest uppercase mt-1">{ins.tagline || 'Geen tagline'}</TextInstrument>
                    
                    <div className="flex gap-4 mt-4">
                      <div className="bg-va-off-white px-3 py-1 rounded-lg text-[11px] font-black tracking-widest text-black/30 uppercase">
                        BTW: {ins.vatNumber || 'Niet ingesteld'}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-black tracking-widest text-black/20 uppercase">
                        <Mail size={10} /> {ins.user?.email || 'Geen email'}
                      </div>
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

        {/* FORMULIER VOOR NIEUWE INSTRUCTEUR */}
        <div className="lg:col-span-5">
          <BentoCard className="bg-va-black text-white p-10 sticky top-32">
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter mb-8 text-white">Docent Toevoegen</HeadingInstrument>
            <InstructorFormClient />
          </BentoCard>
        </div>
      </div>
    </PageWrapperInstrument>
  );
}
