"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowLeft, LayoutDashboard, BookOpen, Plus, Search, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LessenBeheerPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/academy');
      const json = await res.json();
      setWorkshops(json.workshops || []);
    } catch (err) {
      console.error('Failed to fetch academy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        <SectionInstrument className="mb-12">
          <Link href="/admin/academy" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            Terug naar Academy
          </Link>
          
          <ContainerInstrument className="flex justify-between items-start">
            <ContainerInstrument>
              <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
                Content Management
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Lessen Beheer
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Structureer de leerervaring door lessen, modules en opdrachten te beheren.
              </TextInstrument>
            </ContainerInstrument>

            <div className="flex gap-4">
              <ButtonInstrument className="va-btn-pro !bg-va-black flex items-center gap-2">
                <Plus strokeWidth={1.5} size={16} /> Nieuwe Les
              </ButtonInstrument>
              <ButtonInstrument onClick={fetchData} variant="plain" className="p-3 bg-white border border-black/5 rounded-xl">
                <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              </ButtonInstrument>
            </div>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Search & Filter */}
        <ContainerInstrument className="bg-white p-4 rounded-2xl border border-black/[0.03] mb-8 flex items-center gap-4">
          <Search className="text-black/20 ml-2" size={20} />
          <input 
            type="text" 
            placeholder="Zoek lessen of cursussen..." 
            className="bg-transparent border-0 outline-none w-full text-[15px] font-medium"
          />
        </ContainerInstrument>

        {/* Course List */}
        <div className="space-y-8">
          {workshops.map((workshop) => (
            <ContainerInstrument key={workshop.id} className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
              <ContainerInstrument className="p-8 border-b border-black/[0.03] flex justify-between items-center bg-va-off-white/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-va-black text-white rounded-xl flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <HeadingInstrument level={2} className="text-xl font-bold tracking-tight">{workshop.title}</HeadingInstrument>
                    <TextInstrument className="text-[13px] text-black/40 uppercase tracking-widest font-black">
                      {workshop.program?.modules?.length || 0} Modules • {workshop.status}
                    </TextInstrument>
                  </div>
                </div>
                <ButtonInstrument variant="plain" className="text-primary font-black text-[13px] uppercase tracking-widest">
                  Programma Bewerken
                </ButtonInstrument>
              </ContainerInstrument>
              
              <div className="p-4">
                {workshop.program?.modules?.map((module: any, mi: number) => (
                  <div key={mi} className="mb-4 last:mb-0">
                    <div className="px-4 py-2 bg-va-black/5 rounded-lg mb-2 flex justify-between items-center">
                      <span className="text-[12px] font-black uppercase tracking-widest text-va-black/40">Module {mi + 1}: {module.title}</span>
                    </div>
                    <div className="space-y-1">
                      {module.lessons?.map((lesson: any, li: number) => (
                        <div key={li} className="flex items-center justify-between p-4 hover:bg-va-off-white rounded-2xl transition-colors group">
                          <div className="flex items-center gap-4">
                            <span className="text-[13px] font-black text-black/20 w-6">{li + 1}</span>
                            <TextInstrument className="font-medium text-va-black">{lesson.title}</TextInstrument>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-va-black/5 rounded-lg text-va-black/40 hover:text-va-black transition-colors">
                              <Edit3 size={16} />
                            </button>
                            <button className="p-2 hover:bg-red-500/10 rounded-lg text-va-black/40 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {!workshop.program?.modules && (
                  <div className="py-12 text-center text-black/20 font-medium">
                    Geen modules gedefinieerd voor deze cursus.
                  </div>
                )}
              </div>
            </ContainerInstrument>
          ))}
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
