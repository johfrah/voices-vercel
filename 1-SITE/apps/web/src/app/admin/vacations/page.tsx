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
import { ArrowLeft, LayoutDashboard, Sun, Calendar, User, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format, isAfter, isBefore } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function VakantiesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/operational');
      const json = await res.json();
      setData(json.vacations);
    } catch (err) {
      console.error('Failed to fetch vacations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const now = new Date();
  const activeVacations = data.filter(v => isBefore(new Date(v.holiday_from), now) && isAfter(new Date(v.holiday_till), now));
  const upcomingVacations = data.filter(v => isAfter(new Date(v.holiday_from), now));

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <ContainerInstrument className="flex justify-between items-start">
            <ContainerInstrument>
              <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
                Availability Intelligence
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Vakanties
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Beheer de beschikbaarheid van stemmen en teamleden om boekingsconflicten te voorkomen.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Status Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Holidays */}
          <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
            <ContainerInstrument className="p-8 border-b border-black/[0.03] flex items-center gap-3 bg-orange-500/5">
              <Sun className="text-orange-500" size={24} />
              <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">Nu op Vakantie</HeadingInstrument>
            </ContainerInstrument>
            <div className="p-4">
              {loading ? (
                <div className="py-20 text-center text-black/20">Laden...</div>
              ) : activeVacations.length > 0 ? (
                <div className="space-y-2">
                  {activeVacations.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-6 bg-va-off-white rounded-3xl border border-black/[0.03]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-va-black text-white rounded-full flex items-center justify-center font-light">
                          {v.first_name?.[0]}{v.last_name?.[0]}
                        </div>
                        <div>
                          <TextInstrument className="font-bold text-va-black">{v.first_name} {v.last_name}</TextInstrument>
                          <TextInstrument className="text-[13px] text-orange-500 font-black uppercase tracking-widest">Afwezig</TextInstrument>
                        </div>
                      </div>
                      <div className="text-right">
                        <TextInstrument className="text-[14px] font-medium text-va-black">
                          {(() => {
                            if (!v.holiday_till) return "Geen einddatum";
                            const date = new Date(v.holiday_till);
                            if (isNaN(date.getTime())) return "Ongeldige datum";
                            return `Tot ${format(date, 'dd MMM', { locale: nl })}`;
                          })()}
                        </TextInstrument>
                        <TextInstrument className="text-[12px] text-black/20">
                          {(() => {
                            if (!v.holiday_till) return "";
                            const date = new Date(v.holiday_till);
                            if (isNaN(date.getTime())) return "";
                            return `Terug over ${formatDistanceToNow(date, { locale: nl })}`;
                          })()}
                        </TextInstrument>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-black/20 font-medium">Niemand is momenteel afwezig.</div>
              )}
            </div>
          </ContainerInstrument>

          {/* Upcoming Holidays */}
          <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
            <ContainerInstrument className="p-8 border-b border-black/[0.03] flex items-center gap-3">
              <Calendar className="text-va-black/40" size={24} />
              <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">Geplande Vakanties</HeadingInstrument>
            </ContainerInstrument>
            <div className="p-4">
              {loading ? (
                <div className="py-20 text-center text-black/20">Laden...</div>
              ) : upcomingVacations.length > 0 ? (
                <div className="space-y-2">
                  {upcomingVacations.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-4 hover:bg-va-off-white rounded-2xl transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-va-black/5 rounded-full flex items-center justify-center font-bold text-va-black/20">
                          {v.first_name?.[0]}
                        </div>
                        <div>
                          <TextInstrument className="font-bold text-va-black">{v.first_name} {v.last_name}</TextInstrument>
                          <TextInstrument className="text-[13px] text-black/40">
                            {format(new Date(v.holiday_from), 'dd MMM', { locale: nl })} - {format(new Date(v.holiday_till), 'dd MMM', { locale: nl })}
                          </TextInstrument>
                        </div>
                      </div>
                      <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} className="text-va-black/20" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-black/20 font-medium">Geen toekomstige vakanties gepland.</div>
              )}
            </div>
          </ContainerInstrument>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}

// Helper for relative time (already used in other pages but good to have here)
function formatDistanceToNow(date: Date, options: any) {
  const now = new Date();
  const diff = Math.abs(date.getTime() - now.getTime());
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} dagen`;
}
