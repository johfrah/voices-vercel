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
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 *  LIVE VISITOR COCKPIT (2026)
 * 
 * Real-time monitoring van website bezoekers.
 * Gekoppeld aan Voicejar (rrweb) en Customer DNA.
 */

export default function LiveVisitorDashboard() {
  const { logAction } = useAdminTracking();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
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
      setLogs(liveData.logs || []);
      setStats(statsData.stats || null);
    } catch (err) {
      console.error(' Failed to fetch Mat Radar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling elke 10 seconden
    return () => clearInterval(interval);
  }, []);

  const recentSessions = visitors.filter(v => new Date(v.lastVisitAt).getTime() > Date.now() - 3600000);

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-2">
          <ContainerInstrument className="flex items-center gap-2 text-primary">
            <Activity strokeWidth={1.5} size={16} />
            <TextInstrument as="span" className="text-[15px] font-light tracking-[0.2em]">
              <VoiceglotText  translationKey="admin.visitors.badge" defaultText="Live Intelligence" />
            </TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter ">
            <VoiceglotText  translationKey="admin.visitors.title" defaultText="Visitor Dashboard" />
          </HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex gap-4 bg-va-black text-white p-6 rounded-[20px] border border-white/5">
          <ContainerInstrument className="flex flex-col">
            <TextInstrument className="text-[15px] font-light tracking-widest text-white/40"><VoiceglotText  translationKey="auto.page.live_radar.71ada0" defaultText="Live Radar" /></TextInstrument>
            <TextInstrument className="text-3xl font-light text-primary">{visitors.filter(v => new Date(v.lastVisitAt).getTime() > Date.now() - 300000).length}</TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="w-px h-full bg-white/10 mx-4" />
          <ContainerInstrument className="flex flex-col">
            <TextInstrument className="text-[15px] font-light tracking-widest text-white/40"><VoiceglotText  translationKey="auto.page.uniek_vandaag.abc54b" defaultText="Uniek Vandaag" /></TextInstrument>
            <TextInstrument className="text-3xl font-light">{stats?.totalToday || 0}</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Live Table */}
      <SectionInstrument className="bg-white border border-black/5 rounded-[20px] overflow-hidden shadow-sm">
        <ContainerInstrument className="p-8 border-b border-black/5 flex justify-between items-center">
          <HeadingInstrument level={2} className="text-xl font-light tracking-tight">
            <VoiceglotText  translationKey="admin.visitors.table_title" defaultText="Intelligence Playlist" />
          </HeadingInstrument>
          <ContainerInstrument className="flex items-center gap-4">
            <ContainerInstrument className="flex items-center gap-2">
              <ContainerInstrument className={`w-2 h-2 bg-green-500 rounded-full animate-pulse`} />
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40">{visitors.length} Live</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="w-px h-4 bg-black/10" />
            <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/20">{recentSessions.length} Recent</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-va-off-white">
                <th className="p-6 text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText  translationKey="auto.page.bezoeker.fa9ef7" defaultText="Bezoeker" /></th>
                <th className="p-6 text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText  translationKey="auto.page.status.ec53a8" defaultText="Status" /></th>
                <th className="p-6 text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText  translationKey="auto.page.huidige_pagina.ff04e6" defaultText="Huidige pagina" /></th>
                <th className="p-6 text-[15px] font-light tracking-widest text-va-black/40">Duur</th>
                <th className="p-6 text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText  translationKey="auto.page.events.87f9f7" defaultText="Events" /></th>
                <th className="p-6 text-[15px] font-light tracking-widest text-va-black/40 text-right"><VoiceglotText  translationKey="auto.page.actie.98b596" defaultText="Actie" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <ContainerInstrument className="flex flex-col items-center gap-4">
                      <Activity strokeWidth={1.5} className="text-primary animate-spin" size={40} />
                      <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/20"><VoiceglotText  translationKey="auto.page.laden_van_mat_radar_.b71278" defaultText="Laden van radar..." /></TextInstrument>
                    </ContainerInstrument>
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <TextInstrument className="text-va-black/40 font-light text-[15px]"><VoiceglotText  translationKey="auto.page.geen_bezoekers_op_de.a7be98" defaultText="Geen bezoekers op de radar." /></TextInstrument>
                  </td>
                </tr>
              ) : (
                visitors.map((v) => {
                  const isLive = new Date(v.lastVisitAt).getTime() > Date.now() - 300000;
                  return (
                    <tr key={v.id} className="hover:bg-va-off-white transition-colors group">
                      <td className="p-6">
                        <ContainerInstrument className="flex items-center gap-4">
                          <ContainerInstrument className={`w-10 h-10 rounded-xl flex items-center justify-center font-light text-[15px] ${isLive ? "bg-va-black text-white" : "bg-va-black/5 text-va-black/40"}`}>
                            {v.visitorHash.substring(0, 2).toUpperCase()}
                          </ContainerInstrument>
                          <ContainerInstrument>
                            <TextInstrument className="text-[15px] font-light text-va-black">
                              {v.companyName || 'Anonieme Bezoeker'}
                            </TextInstrument>
                            <TextInstrument className="text-[15px] text-va-black/40 font-light tracking-widest">
                              {v.locationCity ? `${v.locationCity}, ${v.locationCountry}` : v.visitorHash}
                            </TextInstrument>
                          </ContainerInstrument>
                        </ContainerInstrument>
                      </td>
                      <td className="p-6">
                        <ContainerInstrument className="flex flex-col gap-1">
                          <ContainerInstrument className="flex items-center gap-2">
                            <ContainerInstrument className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-va-black/20"}`} />
                            <TextInstrument className={`text-[15px] font-light ${isLive ? "text-green-500" : "text-va-black/20"}`}>
                              {isLive ? 'Live' : 'Recent'}
                            </TextInstrument>
                          </ContainerInstrument>
                          <TextInstrument className="text-[15px] font-light text-va-black/20 tracking-widest ">{v.journeyState}</TextInstrument>
                        </ContainerInstrument>
                      </td>
                      <td className="p-6">
                        <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light bg-va-black/5 px-3 py-1.5 rounded-[20px] w-fit max-w-[200px] truncate">
                          <Monitor strokeWidth={1.5} size={12} className="text-va-black/20" />
                          <TextInstrument>{v.currentPage || '/'}</TextInstrument>
                        </ContainerInstrument>
                      </td>
                      <td className="p-6">
                        <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light">
                          <Globe strokeWidth={1.5} size={12} className="text-va-black/20" />
                          <TextInstrument>{v.market}</TextInstrument>
                        </ContainerInstrument>
                      </td>
                      <td className="p-6">
                        <ContainerInstrument className="flex flex-col gap-1">
                          <TextInstrument className="text-[15px] font-light text-va-black/60">{v.utmSource || 'Direct'}</TextInstrument>
                          <TextInstrument className="text-[15px] font-light text-va-black/20">{v.utmMedium || '-'}</TextInstrument>
                        </ContainerInstrument>
                      </td>
                      <td className="p-6 text-right">
                        <Link  
                          href={`/admin/marketing/visitors/${v.visitorHash}`}
                          className="inline-flex items-center gap-2 bg-va-black text-white px-4 py-2 rounded-xl text-[15px] font-light tracking-widest hover:bg-primary transition-all group-hover:scale-105"
                        >
                          <Eye strokeWidth={1.5} size={14} />
                          <TextInstrument as="span"><VoiceglotText  translationKey="auto.page.details.3ec365" defaultText="Details" /></TextInstrument>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Intelligence Cards */}
      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ContainerInstrument className="bg-va-black text-white p-10 rounded-[20px] relative overflow-hidden">
          <MousePointer2 strokeWidth={1.5} className="text-primary mb-6" size={32} />
          <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4"><VoiceglotText  translationKey="auto.page.heatmap_insights.66123f" defaultText="Heatmap insights" /><TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed mb-6"><VoiceglotText  translationKey="auto.page.meest_geklikte_eleme.7483c3" defaultText="Meest geklikte elementen in de laatste 24 uur. Focus op de &apos;Tarieven&apos; knop bij Agency." /></TextInstrument></HeadingInstrument>
          <ButtonInstrument variant="plain" size="none" className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 opacity-40 cursor-not-allowed">
            Bekijk Heatmap <ArrowRight strokeWidth={1.5} size={12} />
          </ButtonInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="bg-white border border-black/5 p-10 rounded-[20px]">
          <Users strokeWidth={1.5} className="text-va-black/20 mb-6" size={32} />
          <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4"><VoiceglotText  translationKey="auto.page.customer_dna.d578eb" defaultText="Customer DNA" /><TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed mb-6"><VoiceglotText  translationKey="auto.page.80__van_de_huidige_b.6971bf" defaultText="80% van de huidige bezoekers zijn &apos;Decision Makers&apos; binnen de Agency journey." /></TextInstrument></HeadingInstrument>
          <Link  href="/admin/users" className="text-[15px] font-light tracking-widest text-va-black/40 flex items-center gap-2">
            User DNA Dashboard <ArrowRight strokeWidth={1.5} size={12} />
          </Link>
        </ContainerInstrument>

        <ContainerInstrument className="bg-va-off-white border border-black/5 p-10 rounded-[20px]">
          <Eye strokeWidth={1.5} className="text-va-black/20 mb-6" size={32} />
          <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4"><VoiceglotText  translationKey="auto.page.drop_off_radar.e0c6b4" defaultText="Drop-off radar" /><TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed mb-6"><VoiceglotText  translationKey="auto.page.hoge_bounce_rate_op_.61ffa3" defaultText="Hoge bounce-rate op de &apos;Over Ons&apos; pagina. AI stelt voor om de CTA te verduidelijken." /></TextInstrument></HeadingInstrument>
          <ButtonInstrument variant="plain" size="none" className="text-[15px] font-light tracking-widest text-va-black/40 flex items-center gap-2 opacity-40 cursor-not-allowed">
            Analyseer Flow <ArrowRight strokeWidth={1.5} size={12} />
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <FixedActionDockInstrument>
        <ButtonInstrument 
          onClick={() => {
            logAction('visitors_refresh');
            fetchData();
          }}
          className="va-btn-pro !bg-va-black flex items-center gap-2"
        >
          <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
          <VoiceglotText translationKey="admin.visitors.refresh" defaultText="Radar Vernieuwen" />
        </ButtonInstrument>
      </FixedActionDockInstrument>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "Visitor Dashboard",
            "description": "Real-time monitoring van website bezoekers.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "visitor_intelligence",
              "capabilities": ["view_visitors", "view_stats", "analyze_behavior"],
              "lexicon": ["Visitor Dashboard", "Live Intelligence", "Mat Radar"],
              "visual_dna": ["Bento Grid", "Liquid DNA"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
