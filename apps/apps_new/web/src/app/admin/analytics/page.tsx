"use client";

import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument,
    ButtonInstrument,
    FixedActionDockInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useAdminTracking } from '@/hooks/useAdminTracking';
import {
    Activity,
    ArrowRight,
    Eye,
    Globe,
    Monitor,
    MousePointer2,
    Users,
    RefreshCw,
    TrendingUp,
    Map,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 *  ANALYTICS HUB (2026)
 * 
 * Centraal dashboard voor platform-brede analytics.
 * Combineert Mat Intelligence (Bezoekers), Journey Stats en Market Insights.
 */

export default function AnalyticsHubPage() {
  const { logAction } = useAdminTracking();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [liveRes, statsRes] = await Promise.all([
        fetch('/api/admin/marketing/live'),
        fetch('/api/admin/marketing/stats')
      ]);
      
      const liveData = await liveRes.json();
      const statsData = await statsRes.json();
      
      setVisitors(liveData.visitors || []);
      setStats(statsData.stats || null);
    } catch (err) {
      console.error(' Failed to fetch Analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Polling elke 30 seconden voor analytics
    return () => clearInterval(interval);
  }, []);

  const totalToday = stats?.totalToday || 0;
  const journeyStats = stats?.journeys || {};
  const marketStats = stats?.markets || {};

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-2">
          <ContainerInstrument className="flex items-center gap-2 text-primary">
            <TrendingUp strokeWidth={1.5} size={16} />
            <TextInstrument as="span" className="text-[15px] font-light tracking-[0.2em]">
              <VoiceglotText translationKey="admin.analytics.badge" defaultText="Platform Intelligence" />
            </TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter ">
            <VoiceglotText translationKey="admin.analytics.title" defaultText="Analytics Hub" />
          </HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex gap-4 bg-va-black text-white p-6 rounded-[20px] border border-white/5">
          <ContainerInstrument className="flex flex-col">
            <TextInstrument className="text-[15px] font-light tracking-widest text-white/40">Uniek Vandaag</TextInstrument>
            <TextInstrument className="text-3xl font-light text-primary">{totalToday}</TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="w-px h-full bg-white/10 mx-4" />
          <ContainerInstrument className="flex flex-col">
            <TextInstrument className="text-[15px] font-light tracking-widest text-white/40">Live Nu</TextInstrument>
            <TextInstrument className="text-3xl font-light">{visitors.filter(v => new Date(v.lastVisitAt).getTime() > Date.now() - 300000).length}</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Main Grid */}
      <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Journey Distribution */}
        <ContainerInstrument className="bg-white border border-black/5 rounded-[20px] p-8 shadow-sm">
          <ContainerInstrument className="flex items-center gap-3 mb-8">
            <Zap strokeWidth={1.5} className="text-primary" size={24} />
            <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Journey Verdeling</HeadingInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="space-y-4">
            {Object.entries(journeyStats).length > 0 ? Object.entries(journeyStats).map(([journey, count]: [string, any]) => (
              <ContainerInstrument key={journey} className="flex flex-col gap-2">
                <ContainerInstrument className="flex justify-between text-[13px] font-bold tracking-widest uppercase">
                  <span className="text-va-black/40">{journey}</span>
                  <span>{count}</span>
                </ContainerInstrument>
                <ContainerInstrument className="h-1.5 w-full bg-va-off-white rounded-full overflow-hidden">
                  <ContainerInstrument 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (count / totalToday) * 100)}%` }} 
                  />
                </ContainerInstrument>
              </ContainerInstrument>
            )) : (
              <TextInstrument className="text-va-black/20 font-bold tracking-widest uppercase text-center py-10">Geen data beschikbaar</TextInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Market Insights */}
        <ContainerInstrument className="bg-white border border-black/5 rounded-[20px] p-8 shadow-sm">
          <ContainerInstrument className="flex items-center gap-3 mb-8">
            <Globe strokeWidth={1.5} className="text-primary" size={24} />
            <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Markt Bereik</HeadingInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="space-y-4">
            {Object.entries(marketStats).length > 0 ? Object.entries(marketStats).map(([market, count]: [string, any]) => (
              <ContainerInstrument key={market} className="flex flex-col gap-2">
                <ContainerInstrument className="flex justify-between text-[13px] font-bold tracking-widest uppercase">
                  <span className="text-va-black/40">{market}</span>
                  <span>{count}</span>
                </ContainerInstrument>
                <ContainerInstrument className="h-1.5 w-full bg-va-off-white rounded-full overflow-hidden">
                  <ContainerInstrument 
                    className="h-full bg-va-black transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (count / totalToday) * 100)}%` }} 
                  />
                </ContainerInstrument>
              </ContainerInstrument>
            )) : (
              <TextInstrument className="text-va-black/20 font-bold tracking-widest uppercase text-center py-10">Geen data beschikbaar</TextInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Intelligence Card */}
        <ContainerInstrument className="bg-va-black text-white p-10 rounded-[20px] relative overflow-hidden flex flex-col justify-between">
          <ContainerInstrument className="relative z-10">
            <Activity strokeWidth={1.5} className="text-primary mb-6" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4">
              AI Insights
            </HeadingInstrument>
            <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed mb-6">
              {stats?.aiInsight || "Voicy analyseert momenteel de conversie-paden..."}
            </TextInstrument>
          </ContainerInstrument>
          
          <ButtonInstrument as={Link} href="/admin/marketing/visitors" className="relative z-10 va-btn-pro !bg-primary w-full text-center !text-va-black">
            Bekijk Live Radar
          </ButtonInstrument>
          <ContainerInstrument className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Secondary Grid */}
      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ContainerInstrument className="bg-va-off-white border border-black/5 p-10 rounded-[20px] group hover:border-primary/20 transition-all">
          <Map strokeWidth={1.5} className="text-va-black/20 group-hover:text-primary transition-colors mb-6" size={32} />
          <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4 text-va-black">
            UTM Attribution
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed mb-8">
            Gedetailleerd overzicht van campagne prestaties en herkomst van leads.
          </TextInstrument>
          <Link href="/admin/marketing/utm" className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
            Open Attribution <ArrowRight size={12} />
          </Link>
        </ContainerInstrument>

        <ContainerInstrument className="bg-va-off-white border border-black/5 p-10 rounded-[20px] group hover:border-primary/20 transition-all">
          <Users strokeWidth={1.5} className="text-va-black/20 group-hover:text-primary transition-colors mb-6" size={32} />
          <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4 text-va-black">
            Customer DNA
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed mb-8">
            Analyse van gebruikersgedrag en segmentatie op basis van platform interactie.
          </TextInstrument>
          <Link href="/admin/insights" className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
            Bekijk Inzichten <ArrowRight size={12} />
          </Link>
        </ContainerInstrument>
      </ContainerInstrument>

      <FixedActionDockInstrument>
        <ButtonInstrument 
          onClick={() => {
            logAction('analytics_refresh');
            fetchData();
          }}
          className="va-btn-pro !bg-va-black flex items-center gap-2"
        >
          <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
          Radar Vernieuwen
        </ButtonInstrument>
      </FixedActionDockInstrument>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "Analytics Hub",
            "description": "Centraal dashboard voor platform-brede analytics.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "platform_analytics",
              "capabilities": ["view_stats", "analyze_trends", "market_insights"],
              "lexicon": ["Analytics Hub", "Intelligence", "Market Insights"],
              "visual_dna": ["Bento Grid", "Liquid DNA"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
