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
import { ArrowLeft, LayoutDashboard, Lock, Shield, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CoreLocksPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/operational-2');
      const json = await res.json();
      setData(json.locks);
    } catch (err) {
      console.error('Failed to fetch locks data:', err);
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
              <ContainerInstrument className="inline-block bg-red-500/10 text-red-500 text-[13px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
                Security Intelligence
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Core Locks
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Beheer de beveiliging van kritieke platform onderdelen en voorkom ongewenste wijzigingen aan de Freedom Machine.
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

        {/* Locks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center text-black/20 font-medium">Laden...</div>
          ) : data.length > 0 ? (
            data.map((lock) => (
              <ContainerInstrument key={lock.id} className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${lock.value?.enabled ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                      {lock.value?.enabled ? <Lock size={24} /> : <Shield size={24} />}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      lock.value?.enabled ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {lock.value?.enabled ? 'Locked' : 'Active'}
                    </span>
                  </div>
                  <HeadingInstrument level={3} className="text-xl font-bold text-va-black mb-2 uppercase tracking-tight">{lock.key.replace(/_/g, ' ')}</HeadingInstrument>
                  <TextInstrument className="text-[14px] text-black/40 font-medium mb-6">
                    {lock.description || 'Geen beschrijving beschikbaar voor dit beveiligingsonderdeel.'}
                  </TextInstrument>
                </div>
                <ButtonInstrument variant="plain" className="w-full py-4 bg-va-black/5 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-va-black hover:text-white transition-all">
                  Instellingen Wijzigen
                </ButtonInstrument>
              </ContainerInstrument>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-black/20 font-medium">
              Geen actieve locks gevonden in de configuratie.
            </div>
          )}
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
