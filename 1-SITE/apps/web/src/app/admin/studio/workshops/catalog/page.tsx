import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { cn } from "@/lib/utils";
import { 
    BookOpen, 
    Plus, 
    Edit2, 
    Trash2, 
    Video,
    Image as ImageIcon,
    ArrowLeft,
    Clock,
    User
} from "lucide-react";
import Link from "next/link";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";

export default async function AdminWorkshopCatalogPage() {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) redirect('/studio');

  const workshops = await StudioDataBridge.getWorkshops();

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <Link href="/admin/studio/workshops" className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-black/40 hover:text-primary transition-colors mb-12 group">
        <ArrowLeft strokeWidth={1.5} size={14} className="group-hover:-translate-x-1 transition-transform" />
        TERUG NAAR COCKPIT
      </Link>

      <ContainerInstrument className="flex justify-between items-end mb-16">
        <div>
          <TextInstrument className="text-[15px] font-black tracking-widest text-black/40 mb-2 uppercase">Studio Beheer</TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">Workshop Catalogus</HeadingInstrument>
        </div>
        <Link href="/admin/studio/workshops/catalog/new">
          <button className="va-btn-pro">
            <Plus size={16} /> NIEUWE WORKSHOP TOEVOEGEN
          </button>
        </Link>
      </ContainerInstrument>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workshops.map((w: any) => (
          <BentoCard key={w.id} className="bg-white shadow-aura border border-black/5 overflow-hidden group flex flex-col">
            <div className="aspect-video bg-va-off-white relative overflow-hidden">
              {w.mediaId ? (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                  <Video size={32} strokeWidth={1.5} />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-black/10">
                  <ImageIcon size={48} strokeWidth={1} />
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/admin/studio/workshops/catalog/${w.id}`} className="p-2 bg-white/90 backdrop-blur rounded-lg text-black hover:text-primary transition-colors shadow-sm">
                  <Edit2 size={14} />
                </Link>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <HeadingInstrument level={3} className="text-2xl font-light mb-4">{w.title}</HeadingInstrument>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-[13px] font-bold text-black/40 uppercase tracking-widest">
                  <Clock size={12} /> {w.duration || 'Duur onbekend'}
                </div>
                <div className="flex items-center gap-2 text-[13px] font-bold text-black/40 uppercase tracking-widest">
                  <User size={12} /> {w.instructorId ? 'Vaste docent' : 'Geen vaste docent'}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-black/5 flex justify-between items-center">
                <span className="text-xl font-light">€{parseFloat(w.price || '0').toFixed(2)}</span>
                <Link href={`/studio/${w.slug}`} target="_blank" className="text-[11px] font-black tracking-widest text-black/20 hover:text-primary transition-colors">
                  BEKIJK LIVE
                </Link>
              </div>
            </div>
          </BentoCard>
        ))}
      </div>
    </PageWrapperInstrument>
  );
}
