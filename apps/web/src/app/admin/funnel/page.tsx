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
import { ArrowLeft, LayoutDashboard, Filter, RefreshCw, Layers, MousePointer2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function WorkshopFunnelPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/funnel');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch funnel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalViews = data?.funnelSteps?.find((s: any) => s.step.includes('view'))?.count || 1;

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
                Conversion Intelligence
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Workshop Funnel
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Analyseer de reis van bezoeker naar cursist en optimaliseer de conversie-stappen.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Funnel Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Funnel Visualization */}
        <SectionInstrument className="mb-12">
          <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-8">Conversie Piramide</HeadingInstrument>
          <div className="space-y-4">
            {data?.funnelSteps?.map((step: any, i: number) => (
              <div key={i} className="relative">
                <div 
                  className="h-16 bg-white border border-black/[0.03] rounded-2xl flex items-center px-8 relative z-10 overflow-hidden shadow-sm"
                  style={{ width: `${Math.max(30, (step.count / totalViews) * 100)}%` }}
                >
                  <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-va-black/5 rounded-full flex items-center justify-center text-[13px] font-black text-va-black/40">{i + 1}</span>
                      <TextInstrument className="font-bold text-va-black uppercase tracking-widest text-[14px]">{step.step.replace(/_/g, ' ')}</TextInstrument>
                    </div>
                    <div className="text-right">
                      <TextInstrument className="text-xl font-light">{step.count}</TextInstrument>
                      <TextInstrument className="text-[11px] text-black/40 font-black uppercase tracking-tighter">
                        {Math.round((step.count / totalViews) * 100)}% conversie
                      </TextInstrument>
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                </div>
              </div>
            ))}
          </div>
        </SectionInstrument>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interest Stats */}
          <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
            <ContainerInstrument className="p-8 border-b border-black/[0.03] flex items-center gap-3">
              <MousePointer2 className="text-primary" size={20} />
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Interesse Status</HeadingInstrument>
            </ContainerInstrument>
            <div className="p-8 space-y-4">
              {data?.interestStats?.map((stat: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 bg-va-off-white rounded-2xl">
                  <span className="text-[14px] font-bold text-va-black uppercase tracking-widest">{stat.status}</span>
                  <span className="text-2xl font-light">{stat.count}</span>
                </div>
              ))}
            </div>
          </ContainerInstrument>

          {/* Order Stats */}
          <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
            <ContainerInstrument className="p-8 border-b border-black/[0.03] flex items-center gap-3">
              <CheckCircle2 className="text-green-500" size={20} />
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Workshop Orders</HeadingInstrument>
            </ContainerInstrument>
            <div className="p-8 space-y-4">
              {data?.workshopOrders?.map((stat: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 bg-va-off-white rounded-2xl">
                  <span className="text-[14px] font-bold text-va-black uppercase tracking-widest">{stat.status}</span>
                  <span className="text-2xl font-light">{stat.count}</span>
                </div>
              ))}
            </div>
          </ContainerInstrument>

          {/* Recent Events */}
          <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
            <ContainerInstrument className="p-8 border-b border-black/[0.03] flex items-center gap-3">
              <Layers className="text-va-black/40" size={20} />
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Live Feed</HeadingInstrument>
            </ContainerInstrument>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {data?.recentEvents?.map((event: any) => (
                <div key={event.id} className="p-4 border-b border-black/[0.03] last:border-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] font-black text-primary uppercase tracking-tighter">{event.step}</span>
                    <span className="text-[11px] text-black/20">{format(new Date(event.createdAt), 'HH:mm:ss')}</span>
                  </div>
                  <TextInstrument className="text-[13px] text-va-black/60 truncate">{event.visitorHash}</TextInstrument>
                </div>
              ))}
            </div>
          </ContainerInstrument>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
