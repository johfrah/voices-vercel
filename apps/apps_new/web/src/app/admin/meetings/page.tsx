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
import { ArrowLeft, LayoutDashboard, Calendar, Clock, User, RefreshCw, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function MeetingsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/operational');
      const json = await res.json();
      setData(json.meetings);
    } catch (err) {
      console.error('Failed to fetch meetings data:', err);
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
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <ContainerInstrument className="flex justify-between items-start">
            <ContainerInstrument>
              <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
                Agenda
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Afspraken
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Beheer alle geplande studio-sessies, afspraken en agenda-items binnen het platform.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Agenda Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Meetings List */}
        <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
          <ContainerInstrument className="p-8 border-b border-black/[0.03] flex justify-between items-center bg-va-off-white/30">
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
              Aankomende Afspraken
            </HeadingInstrument>
            <div className="flex items-center gap-2 text-va-black/40 text-[14px] font-medium">
              <Calendar size={16} />
              <span>{format(new Date(), 'MMMM yyyy', { locale: nl })}</span>
            </div>
          </ContainerInstrument>
          
          <div className="divide-y divide-black/[0.03]">
            {loading ? (
              <div className="py-20 text-center text-black/20 font-medium">Laden...</div>
            ) : data.length > 0 ? (
              data.map((meeting) => (
                <div key={meeting.id} className="p-8 hover:bg-va-off-white/30 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-8">
                    {/* Date Badge */}
                    <div className="w-16 h-16 bg-va-black text-white rounded-2xl flex flex-col items-center justify-center">
                      <span className="text-[11px] font-black uppercase tracking-tighter opacity-60">{format(new Date(meeting.startTime), 'MMM', { locale: nl })}</span>
                      <span className="text-2xl font-light">{format(new Date(meeting.startTime), 'dd')}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          meeting.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {meeting.status}
                        </span>
                        <HeadingInstrument level={3} className="text-xl font-bold text-va-black">Studio Sessie</HeadingInstrument>
                      </div>
                      <div className="flex items-center gap-4 text-[14px] text-black/40 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{format(new Date(meeting.startTime), 'HH:mm')} - {format(new Date(meeting.endTime), 'HH:mm')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={14} />
                          <span>{meeting.users?.first_name} {meeting.users?.last_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          <span>Voices Studio A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-10 h-10 bg-va-black/5 rounded-full flex items-center justify-center text-va-black/20 group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-black/20 font-medium">
                Geen aankomende afspraken gevonden.
              </div>
            )}
          </div>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
