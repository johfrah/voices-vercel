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
import { ArrowLeft, LayoutDashboard, Users, Brain, MessageSquare, TrendingUp, RefreshCw, Activity } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function KlantInzichtenPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/insights');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch insights data:', err);
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
                AI Intelligence
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Klant Inzichten
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                AI-gedreven analyse van klantgedrag, intenties en behoeften binnen de Freedom Machine.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Inzichten Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Stats Grid */}
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <Users className="text-primary mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Segmenten</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.segmentation?.length || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <Brain className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Top Intent</TextInstrument>
            <HeadingInstrument level={3} className="text-xl font-medium truncate">{data?.chatIntents?.[0]?.intent || 'Geen data'}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <TrendingUp className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Gem. Order</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">€{Math.round(data?.orderValueStats?.[0]?.avgTotal || 0)}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <Activity className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Actieve Gebruikers</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.recentActivity?.length || 0}</HeadingInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
            <ContainerInstrument className="p-8 border-b border-black/[0.03]">
              <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
                Recente Activiteit
              </HeadingInstrument>
            </ContainerInstrument>
            <div className="p-4">
              {loading ? (
                <div className="py-20 text-center text-black/20">Laden...</div>
              ) : (
                <div className="space-y-2">
                  {data?.recentActivity?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 hover:bg-va-off-white rounded-2xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-va-black text-white rounded-full flex items-center justify-center font-light">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <TextInstrument className="font-bold text-va-black">{user.first_name} {user.last_name}</TextInstrument>
                          <TextInstrument className="text-[13px] text-black/40">{user.email}</TextInstrument>
                        </div>
                      </div>
                      <div className="text-right">
                        <TextInstrument className="text-[13px] font-medium text-primary uppercase tracking-widest">{user.journeyState}</TextInstrument>
                        <TextInstrument className="text-[12px] text-black/20">
                          {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true, locale: nl })}
                        </TextInstrument>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ContainerInstrument>

          {/* Chat Intents */}
          <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
            <ContainerInstrument className="p-8 border-b border-black/[0.03]">
              <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
                Top Chat Intenties
              </HeadingInstrument>
            </ContainerInstrument>
            <div className="p-8">
              {loading ? (
                <div className="py-20 text-center text-black/20">Laden...</div>
              ) : (
                <div className="space-y-6">
                  {data?.chatIntents?.map((intent: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[14px] font-medium">
                        <span className="text-va-black uppercase tracking-widest">{intent.intent}</span>
                        <span className="text-black/40">{intent.count} gesprekken</span>
                      </div>
                      <div className="w-full h-2 bg-va-off-white rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${(intent.count / data.chatIntents[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ContainerInstrument>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
