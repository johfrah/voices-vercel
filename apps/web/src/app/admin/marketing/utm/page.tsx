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
import { ArrowLeft, LayoutDashboard, Target, BarChart3, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function UTMAttributionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/utm');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch UTM data:', err);
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
                Marketing
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Herkomst Bezoekers
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Analyseer de herkomst van je conversies en de effectiviteit van je campagnes.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Stats Grid */}
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <ContainerInstrument className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Target strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <TextInstrument className="text-[15px] font-black tracking-widest text-black/20 uppercase mb-1">Top Bron</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light tracking-tight">
              {data?.stats?.sources?.[0]?.source || 'Geen data'}
            </HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <ContainerInstrument className="w-12 h-12 bg-va-black/5 rounded-2xl flex items-center justify-center text-va-black/40 mb-6">
              <TrendingUp strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <TextInstrument className="text-[15px] font-black tracking-widest text-black/20 uppercase mb-1">Actieve Campagnes</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light tracking-tight">
              {data?.stats?.campaigns?.length || 0}
            </HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <ContainerInstrument className="w-12 h-12 bg-va-black/5 rounded-2xl flex items-center justify-center text-va-black/40 mb-6">
              <BarChart3 strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <TextInstrument className="text-[15px] font-black tracking-widest text-black/20 uppercase mb-1">Totaal Touchpoints</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light tracking-tight">
              {data?.touchpoints?.length || 0}
            </HeadingInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Main Content Table */}
        <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
          <ContainerInstrument className="p-8 border-b border-black/[0.03] flex justify-between items-center">
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
              Recent Attribution Log
            </HeadingInstrument>
            <ContainerInstrument className="flex items-center gap-2 text-va-black/40 text-[14px]">
              <Filter size={14} />
              <span>Laatste 100 touchpoints</span>
            </ContainerInstrument>
          </ContainerInstrument>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-va-off-white/50 border-b border-black/[0.03]">
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase">Datum</th>
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase">Bron / Medium</th>
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase">Campagne</th>
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase">Vibe</th>
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <RefreshCw className="animate-spin mx-auto text-primary mb-4" size={32} />
                      <TextInstrument className="text-black/40">Data ophalen uit de kluis...</TextInstrument>
                    </td>
                  </tr>
                ) : data?.touchpoints?.length > 0 ? (
                  data.touchpoints.map((tp: any) => (
                    <tr key={tp.id} className="hover:bg-va-off-white/30 transition-colors">
                      <td className="px-8 py-6">
                        <TextInstrument className="text-[15px] font-medium text-va-black">
                          {format(new Date(tp.createdAt), 'dd MMM HH:mm', { locale: nl })}
                        </TextInstrument>
                      </td>
                      <td className="px-8 py-6">
                        <ContainerInstrument className="flex flex-col">
                          <TextInstrument className="text-[15px] font-bold text-va-black">{tp.source || 'Direct'}</TextInstrument>
                          <TextInstrument className="text-[13px] text-black/40">{tp.medium || '-'}</TextInstrument>
                        </ContainerInstrument>
                      </td>
                      <td className="px-8 py-6">
                        <TextInstrument className="text-[15px] text-va-black">{tp.campaign || '-'}</TextInstrument>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[12px] font-black tracking-widest uppercase ${
                          tp.vibe === 'hot' ? 'bg-orange-500/10 text-orange-500' : 
                          tp.vibe === 'warm' ? 'bg-primary/10 text-primary' : 
                          'bg-va-black/5 text-va-black/40'
                        }`}>
                          {tp.vibe || 'neutral'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <ContainerInstrument className="flex gap-2">
                          {tp.isFirstTouch && <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded uppercase tracking-tighter">First</span>}
                          {tp.isLastTouch && <span className="text-[10px] font-black bg-green-500 text-white px-2 py-0.5 rounded uppercase tracking-tighter">Last</span>}
                          {!tp.isFirstTouch && !tp.isLastTouch && <span className="text-[10px] font-black bg-va-black/10 text-va-black/40 px-2 py-0.5 rounded uppercase tracking-tighter">Assist</span>}
                        </ContainerInstrument>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-black/40">
                      Geen UTM touchpoints gevonden in de database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
