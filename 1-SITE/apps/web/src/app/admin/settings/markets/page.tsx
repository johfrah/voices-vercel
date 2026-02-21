"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument, 
  FixedActionDockInstrument
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import { useEditMode } from '@/contexts/EditModeContext';
import { 
  Globe, 
  Check, 
  Zap, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  Search,
  Languages
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

/**
 *  MARKET MANAGEMENT DASHBOARD (GOD MODE 2026)
 * 
 * Beheer van actieve markten, talen en de 'Slimme vertaling' motor.
 */
export default function AdminMarketsPage() {
  const { playClick } = useSonicDNA();
  const { isEditMode, toggleEditMode } = useEditMode();
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Mock data voor nu, wordt later uit app_configs gehaald
  const [markets, setMarkets] = useState([
    { code: 'BE', name: 'België', domains: ['voices.be'], langs: ['nl', 'fr', 'en'], default: 'nl', status: 'active' },
    { code: 'FR', name: 'Frankrijk', domains: ['voices.fr'], langs: ['fr', 'en'], default: 'fr', status: 'active' },
    { code: 'DE', name: 'Duitsland', domains: ['voices.de'], langs: ['de', 'en'], default: 'de', status: 'active' },
    { code: 'EU', name: 'Europa', domains: ['voices.eu'], langs: ['en', 'fr', 'de', 'es', 'it', 'pt'], default: 'en', status: 'active' }
  ]);

  const [activeLangs, setActiveLangs] = useState(['nl', 'fr', 'en', 'de', 'es', 'it', 'pt']);

  useEffect(() => {
    // Simuleer laden
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleSlimmeVertaling = async (lang?: string) => {
    setAuditing(true);
    playClick('pro');
    toast.loading('Slimme vertaling wordt uitgevoerd op de hele site...', { id: 'audit' });

    try {
      const res = await fetch('/api/admin/voiceglot/nuclear-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lang, 
          auth: 'bob-nuclear-audit-2026',
          scope: 'all' 
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Klaar! ${data.improved} teksten zijn verbeterd op basis van Market DNA.`, { id: 'audit' });
        playClick('success');
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      toast.error('Fout bij uitvoeren van Slimme vertaling.', { id: 'audit' });
    } finally {
      setAuditing(false);
    }
  };

  if (loading) return (
    <ContainerInstrument className="min-h-screen flex items-center justify-center">
      <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} />
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link href="/admin/settings" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            Terug naar Instellingen
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
            Markt Beheer
          </HeadingInstrument>
          <TextInstrument className="text-xl text-va-black/40 font-light max-w-2xl">
            Beheer hier de actieve markten, talen en dwing de Voices-kwaliteit af via de Slimme vertaling motor.
          </TextInstrument>
        </ContainerInstrument>

        <div className="flex items-center gap-4">
          <ButtonInstrument 
            onClick={() => handleSlimmeVertaling()}
            disabled={auditing}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white text-[15px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            {auditing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Slimme vertaling (Global)
          </ButtonInstrument>
        </div>
      </SectionInstrument>

      <BentoGrid columns={3}>
        {/* ACTIEVE MARKTEN */}
        <BentoCard span="lg" className="bg-white border border-black/5 p-10 space-y-8 rounded-[20px]">
          <ContainerInstrument className="flex items-center gap-4 border-b border-black/5 pb-6">
            <ContainerInstrument className="w-12 h-12 bg-va-black/5 text-va-black rounded-[10px] flex items-center justify-center">
              <Globe strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <ContainerInstrument>
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Actieve Markten</HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light">Configuratie per domein en regio.</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <div className="space-y-4">
            {markets.map((m) => (
              <div key={m.code} className="flex items-center justify-between p-6 bg-va-off-white/50 rounded-2xl border border-black/[0.03] group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg font-bold">
                    {m.code}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[17px] font-bold">{m.name}</span>
                    <span className="text-[13px] text-va-black/40 font-mono">{m.domains.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest mb-1">Talen</span>
                    <div className="flex gap-1">
                      {m.langs.map(l => (
                        <span key={l} className="px-2 py-0.5 bg-white border border-black/5 rounded text-[10px] font-bold uppercase">{l}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest mb-1">Default</span>
                    <span className="text-[13px] font-bold text-primary uppercase">{m.default}</span>
                  </div>

                  <ButtonInstrument variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Bewerken
                  </ButtonInstrument>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* TAAL REGISTRY & DNA */}
        <BentoCard span="sm" className="bg-va-black text-white p-10 space-y-8 rounded-[20px] relative overflow-hidden">
          <ContainerInstrument className="relative z-10 flex items-center gap-4 border-b border-white/10 pb-6">
            <ContainerInstrument className="w-12 h-12 bg-primary rounded-[10px] flex items-center justify-center text-va-black">
              <Languages strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <ContainerInstrument>
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Taal DNA</HeadingInstrument>
              <TextInstrument className="text-white/40 text-[15px] font-light">Native regels & Inclusiviteit.</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <div className="relative z-10 space-y-4">
            {activeLangs.map(lang => (
              <div key={lang} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-lg uppercase font-black text-primary/60">{lang}</span>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium capitalize">{new Intl.DisplayNames(['nl'], { type: 'language' }).of(lang)}</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={10} className="text-green-500" />
                      <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">DNA Actief</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleSlimmeVertaling(lang)}
                  className="p-2 hover:text-primary transition-colors"
                  title="Scan deze taal"
                >
                  <Zap size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        </BentoCard>

        {/* VOICES QUALITY WATCHDOG */}
        <BentoCard span="full" className="bg-va-off-white border border-black/5 p-10 rounded-[20px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-[10px] flex items-center justify-center">
                <Zap strokeWidth={1.5} size={24} />
              </div>
              <ContainerInstrument>
                <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Kwaliteit Monitor</HeadingInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light">Status van de Slimme vertaling motor.</TextInstrument>
              </ContainerInstrument>
            </div>
            
          <div className="flex gap-8">
            <Link href="/admin/voiceglot" className="flex flex-col items-end group">
              <span className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest group-hover:text-primary transition-colors">Registry</span>
              <span className="text-2xl font-light tracking-tighter flex items-center gap-2">
                Beheer <ArrowLeft className="rotate-180" size={16} />
              </span>
            </Link>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest">Gescand</span>
              <span className="text-2xl font-light tracking-tighter">1.420 strings</span>
            </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest">Native Score</span>
                <span className="text-2xl font-light tracking-tighter text-green-600">98.4%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm">
              <TextInstrument className="text-[11px] font-bold text-va-black/30 uppercase tracking-widest mb-4">Inclusiviteit</TextInstrument>
              <div className="h-2 w-full bg-va-off-white rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[100%]" />
              </div>
              <TextInstrument className="mt-2 text-[13px] font-medium text-va-black/60">100% Voices Standard</TextInstrument>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm">
              <TextInstrument className="text-[11px] font-bold text-va-black/30 uppercase tracking-widest mb-4">Vaktaal (Glossary)</TextInstrument>
              <div className="h-2 w-full bg-va-off-white rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[95%]" />
              </div>
              <TextInstrument className="mt-2 text-[13px] font-medium text-va-black/60">Glossary V1.2 actief</TextInstrument>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm">
              <TextInstrument className="text-[11px] font-bold text-va-black/30 uppercase tracking-widest mb-4">SEO Metadata</TextInstrument>
              <div className="h-2 w-full bg-va-off-white rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[88%]" />
              </div>
              <TextInstrument className="mt-2 text-[13px] font-medium text-va-black/60">Rescan nodig voor DE</TextInstrument>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm">
              <TextInstrument className="text-[11px] font-bold text-va-black/30 uppercase tracking-widest mb-4">Spatial Awareness</TextInstrument>
              <div className="h-2 w-full bg-va-off-white rounded-full overflow-hidden">
                <div className="h-full bg-va-black w-[92%]" />
              </div>
              <TextInstrument className="mt-2 text-[13px] font-medium text-va-black/60">MaxChars handhaving actief</TextInstrument>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      {auditing && (
        <FixedActionDockInstrument>
          <ContainerInstrument plain className="flex items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={20} />
            <TextInstrument className="text-[15px] font-bold tracking-tight">
              Slimme vertaling motor is bezig met een volledige site-scan...
            </TextInstrument>
          </ContainerInstrument>
        </FixedActionDockInstrument>
      )}
    </PageWrapperInstrument>
  );
}
