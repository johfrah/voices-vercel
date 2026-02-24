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
import { ArrowLeft, LayoutDashboard, Brain, Cpu, Settings, RefreshCw, Save, Sliders, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OpenAIIntelligencePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/operational-2');
      const json = await res.json();
      setData(json.aiSettings);
    } catch (err) {
      console.error('Failed to fetch AI settings:', err);
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
                AI Engine Control
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                OpenAI Intelligence
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Configureer de AI-modellen, prompts en cognitieve parameters van de Freedom Machine.
              </TextInstrument>
            </ContainerInstrument>

            <div className="flex gap-4">
              <ButtonInstrument className="va-btn-pro !bg-va-black flex items-center gap-2">
                <Save strokeWidth={1.5} size={16} /> Instellingen Opslaan
              </ButtonInstrument>
              <ButtonInstrument onClick={fetchData} variant="plain" className="p-3 bg-white border border-black/5 rounded-xl">
                <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              </ButtonInstrument>
            </div>
          </ContainerInstrument>
        </SectionInstrument>

        {/* AI Config Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center text-black/20 font-medium">Laden...</div>
          ) : data.length > 0 ? (
            data.map((setting) => (
              <ContainerInstrument key={setting.id} className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-va-black/5 rounded-2xl flex items-center justify-center text-va-black/40">
                    {setting.key.includes('prompt') ? <Cpu size={24} /> : <Brain size={24} />}
                  </div>
                  <div>
                    <HeadingInstrument level={3} className="text-xl font-bold text-va-black uppercase tracking-tight">{setting.key.replace(/_/g, ' ')}</HeadingInstrument>
                    <TextInstrument className="text-[12px] font-black text-primary uppercase tracking-widest">Active Model: GPT-4o</TextInstrument>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-va-off-white rounded-2xl border border-black/[0.03]">
                    <TextInstrument className="text-[13px] font-black text-black/20 uppercase tracking-widest mb-2">Configuratie Waarde</TextInstrument>
                    <pre className="text-[14px] font-medium text-va-black/60 whitespace-pre-wrap font-mono">
                      {JSON.stringify(setting.value, null, 2)}
                    </pre>
                  </div>
                  <ButtonInstrument variant="plain" className="flex items-center gap-2 text-[13px] font-black text-va-black/40 uppercase tracking-widest hover:text-primary transition-colors">
                    <Sliders size={14} /> Parameter Tuner
                  </ButtonInstrument>
                </div>
              </ContainerInstrument>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-black/20 font-medium">
              Geen AI instellingen gevonden in de kluis.
            </div>
          )}

          {/* Quick Actions */}
          <ContainerInstrument className="bg-va-black p-8 rounded-[40px] border border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <Zap className="text-primary mb-6" size={32} />
              <HeadingInstrument level={3} className="text-2xl font-light text-white mb-2">AI Health Check</HeadingInstrument>
              <TextInstrument className="text-white/40 text-[15px] font-medium leading-relaxed mb-8">
                Voer een volledige audit uit op alle AI-koppelingen en verifieer de responstijden van de Freedom Machine.
              </TextInstrument>
            </div>
            <ButtonInstrument className="w-full py-4 bg-primary text-va-black rounded-2xl text-[13px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
              Start Systeem Audit
            </ButtonInstrument>
          </ContainerInstrument>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
