"use client";

import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument,
    FixedActionDockInstrument
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAdminTracking } from '@/hooks/useAdminTracking';
import { ArrowLeft, Globe, Languages, Loader2, RefreshCw, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

/**
 *  VOICEGLOT ADMIN DASHBOARD (NUCLEAR 2026)
 * 
 * "De taal van de Freedom Machine."
 */
export default function VoiceglotAdminPage() {
  const { logAction } = useAdminTracking();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/voiceglot/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch Voiceglot stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleHeal = async () => {
    setIsSyncing(true);
    try {
      // De nieuwe Nuclear Heal-All API
      const res = await fetch('/api/admin/voiceglot/heal-all', { method: 'POST' });
      const data = await res.json();
      toast.success(`Heal voltooid: ${data.healedCount} strings vertaald!`);
      await fetchStats();
    } catch (e) {
      console.error('Heal failed', e);
      toast.error('Heal-all proces mislukt.');
    } finally {
      setIsSyncing(false);
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
          <Link  href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="admin.back_to_dashboard" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter "><VoiceglotText  translationKey="admin.voiceglot.title" defaultText="Voiceglot Intelligence" /></HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument 
            onClick={() => {
              logAction('voiceglot_heal_all');
              handleHeal();
            }}
            disabled={isSyncing}
            className={`va-btn-pro !bg-va-black flex items-center gap-2 ${isSyncing ? 'opacity-50' : ''}`}
          >
            {isSyncing ? <RefreshCw strokeWidth={1.5} className="animate-spin" size={16} /> : <Sparkles strokeWidth={1.5} size={16} />}
            <VoiceglotText  translationKey="admin.voiceglot.heal" defaultText="Self-Heal All" />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Stats Overview */}
      <BentoGrid strokeWidth={1.5} columns={4}>
        <BentoCard span="sm" className="bg-va-black text-white p-8 space-y-4 rounded-[20px]">
          <ContainerInstrument className="flex items-center gap-3">
            <ContainerInstrument className="p-2 bg-primary/20 text-primary rounded-[10px]">
              <Globe strokeWidth={1.5} size={20} />
            </ContainerInstrument>
            <TextInstrument className="text-[15px] opacity-40 text-white font-light"><VoiceglotText  translationKey="admin.voiceglot.registry" defaultText="Registry" /></TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter">
            {stats?.totalStrings || 0}
          </HeadingInstrument>
          <TextInstrument className="text-[15px] font-light tracking-widest opacity-40 text-white"><VoiceglotText  translationKey="admin.voiceglot.unique_strings" defaultText="Unieke Strings Gedetecteerd" /></TextInstrument>
        </BentoCard>

        {stats?.coverage?.map((c: any) => (
          <BentoCard key={c.lang} span="sm" className="bg-white border border-black/5 p-8 space-y-4 rounded-[20px]">
            <ContainerInstrument className="flex justify-between items-center">
              <ContainerInstrument className="flex items-center gap-3">
                <ContainerInstrument className="w-8 h-8 bg-va-off-white rounded-full flex items-center justify-center font-light text-[15px] ">
                  {c.lang}
                </ContainerInstrument>
                <TextInstrument className="text-[15px] text-va-black/30 font-light"><VoiceglotText  translationKey="admin.voiceglot.coverage" defaultText="Coverage" /></TextInstrument>
              </ContainerInstrument>
              <TextInstrument className="text-xl font-light">{c.percentage}%</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="w-full bg-va-off-white h-2 rounded-full overflow-hidden">
              <ContainerInstrument 
                className="bg-primary h-full transition-all duration-1000" 
                style={{ width: `${c.percentage}%` }}
              />
            </ContainerInstrument>
            <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/20">
              {c.count} <VoiceglotText  translationKey="admin.voiceglot.translated_count" defaultText="vertaalde strings" />
            </TextInstrument>
          </BentoCard>
        ))}
      </BentoGrid>

      {/* Recent Strings & Health */}
      <BentoGrid strokeWidth={1.5} columns={3}>
        <BentoCard span="lg" className="bg-white border border-black/5 p-10 space-y-8 rounded-[20px]">
          <ContainerInstrument className="flex justify-between items-center">
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight"><VoiceglotText  translationKey="admin.voiceglot.recent_title" defaultText="Recent Gedetecteerd" /></HeadingInstrument>
            <Languages strokeWidth={1.5} size={20} className="text-va-black/10" />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-4">
            {stats?.recentStrings?.map((s: any) => (
              <ContainerInstrument key={s.id} className="p-4 bg-va-off-white/50 rounded-[10px] flex justify-between items-center group hover:bg-va-off-white transition-all">
                <ContainerInstrument className="space-y-1">
                  <TextInstrument className="text-[15px] font-light text-primary tracking-widest">{s.registryKey}</TextInstrument>
                  <TextInstrument className="text-[15px] font-light text-va-black/60 line-clamp-1">{s.sourceText}</TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ButtonInstrument className="p-2 hover:text-primary transition-colors"><Zap strokeWidth={1.5} size={14} /></ButtonInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </BentoCard>

        <BentoCard span="sm" className="bg-primary text-white p-10 space-y-6 flex flex-col justify-between rounded-[20px]">
          <ContainerInstrument className="space-y-4">
            <ShieldCheck strokeWidth={1.5} size={40} />
            <HeadingInstrument level={3} className="text-3xl font-light tracking-tighter leading-none">
              <VoiceglotText  translationKey="admin.voiceglot.seo_title" defaultText="AI SEO AUTOMATION" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] font-light opacity-80">
              <VoiceglotText  
                translationKey="admin.voiceglot.seo_text" 
                defaultText="Alle slugs en meta-data worden automatisch gesynchroniseerd in 5 talen. Geen handmatige invoer nodig." 
              />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="p-4 bg-white/10 rounded-[10px] border border-white/10">
            <ContainerInstrument className="flex justify-between items-center mb-2">
              <TextInstrument className="text-[15px] font-light tracking-widest"><VoiceglotText  translationKey="admin.voiceglot.seo_status" defaultText="SEO Sync Status" /></TextInstrument>
              <TextInstrument className="text-[15px] font-light tracking-widest">100%</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <ContainerInstrument className="bg-white h-full w-full" />
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>

      {/* Warning / Info */}
      <ContainerInstrument className="p-8 bg-va-black text-white rounded-[20px] flex items-center gap-6">
        <ContainerInstrument className="w-16 h-16 bg-primary text-white rounded-[10px] flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Zap strokeWidth={1.5} size={32} />
        </ContainerInstrument>
        <ContainerInstrument className="space-y-1">
          <HeadingInstrument level={4} className="text-primary font-light tracking-tight">
            <VoiceglotText  translationKey="admin.voiceglot.protocol_title" defaultText="VOICEGLOT PROTOCOL" />
          </HeadingInstrument>
          <TextInstrument className="text-[15px] opacity-60 font-light">
            <VoiceglotText  
              translationKey="admin.voiceglot.protocol_text" 
              defaultText="De Freedom Machine spreekt elke taal. Zodra een nieuwe string wordt gedetecteerd in de UI, wordt deze binnen 60 seconden automatisch vertaald door de Intelligence Layer. Slugs worden automatisch 'slugified' per taal om SEO-waarde te maximaliseren." 
            />
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <FixedActionDockInstrument>
        <ButtonInstrument 
          onClick={() => {
            logAction('voiceglot_refresh');
            fetchStats();
          }}
          className="va-btn-pro !bg-va-black flex items-center gap-2"
        >
          <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
          <VoiceglotText translationKey="admin.voiceglot.refresh" defaultText="Status Vernieuwen" />
        </ButtonInstrument>
      </FixedActionDockInstrument>

      {/*  LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VoiceglotAdmin",
            "name": "Voiceglot Intelligence",
            "description": "Beheer van meertalige content en AI-vertalingen.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "content_localization",
              "capabilities": ["heal_all_strings", "view_coverage", "monitor_registry"],
              "lexicon": ["Voiceglot", "Registry", "Coverage", "Self-Heal"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
