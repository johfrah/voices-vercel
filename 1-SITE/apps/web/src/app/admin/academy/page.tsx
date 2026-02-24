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
import { ArrowLeft, LayoutDashboard, GraduationCap, BookOpen, Users, CheckCircle2, RefreshCw, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function AcademyDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/academy');
      const json = await res.json();
      setData(json);
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
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <ContainerInstrument className="flex justify-between items-start">
            <ContainerInstrument>
              <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
                Education Intelligence
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Academy Dashboard
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Beheer cursussen, volg studentenvoortgang en beoordeel inzendingen binnen de leeromgeving.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Academy Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Stats Grid */}
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <Users className="text-primary mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Studenten</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.stats?.totalStudents || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <BookOpen className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Cursussen</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.workshops?.length || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <PlayCircle className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">In Progress</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.stats?.progress?.in_progress || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <CheckCircle2 className="text-green-500 mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Voltooid</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.stats?.progress?.completed || 0}</HeadingInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Courses */}
          <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
            <ContainerInstrument className="p-8 border-b border-black/[0.03] flex justify-between items-center">
              <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
                Actieve Cursussen
              </HeadingInstrument>
              <Link href="/admin/academy/lessons" className="text-[13px] font-black text-primary uppercase tracking-widest hover:underline">
                Lessen Beheer
              </Link>
            </ContainerInstrument>
            <div className="p-4">
              {loading ? (
                <div className="py-20 text-center text-black/20">Laden...</div>
              ) : (
                <div className="space-y-2">
                  {data?.workshops?.map((workshop: any) => (
                    <div key={workshop.id} className="flex items-center justify-between p-4 hover:bg-va-off-white rounded-2xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-va-black/5 rounded-xl flex items-center justify-center">
                          <GraduationCap className="text-va-black/20" size={24} />
                        </div>
                        <div>
                          <TextInstrument className="font-bold text-va-black">{workshop.title}</TextInstrument>
                          <TextInstrument className="text-[13px] text-black/40">{workshop.status}</TextInstrument>
                        </div>
                      </div>
                      <div className="text-right">
                        <TextInstrument className="text-xl font-light">€{workshop.price}</TextInstrument>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ContainerInstrument>

          {/* Recent Submissions */}
          <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
            <ContainerInstrument className="p-8 border-b border-black/[0.03]">
              <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
                Recente Inzendingen
              </HeadingInstrument>
            </ContainerInstrument>
            <div className="p-4">
              {loading ? (
                <div className="py-20 text-center text-black/20">Laden...</div>
              ) : (
                <div className="space-y-2">
                  {data?.recentSubmissions?.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-va-off-white rounded-2xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${sub.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'}`} />
                        <div>
                          <TextInstrument className="font-bold text-va-black">{sub.users?.first_name} {sub.users?.last_name}</TextInstrument>
                          <TextInstrument className="text-[13px] text-black/40">Les ID: {sub.lessonId}</TextInstrument>
                        </div>
                      </div>
                      <div className="text-right">
                        <TextInstrument className="text-[12px] text-black/20">
                          {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true, locale: nl })}
                        </TextInstrument>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                          sub.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {data?.recentSubmissions?.length === 0 && (
                    <div className="py-20 text-center text-black/20">Geen recente inzendingen</div>
                  )}
                </div>
              )}
            </div>
          </ContainerInstrument>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
