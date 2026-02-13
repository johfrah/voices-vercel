"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { 
  Users, 
  Activity, 
  Eye, 
  MousePointer2, 
  Clock, 
  Globe, 
  Monitor,
  ArrowRight,
  PlayCircle
} from 'lucide-react';
import Link from 'next/link';

/**
 * 🏺 LIVE VISITOR COCKPIT (2026)
 * 
 * Real-time monitoring van website bezoekers.
 * Gekoppeld aan Voicejar (rrweb) en Customer DNA.
 */

export default function LiveVisitorCockpit() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
        console.error('❌ Failed to fetch Mat Radar data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling elke 10 seconden
    return () => clearInterval(interval);
  }, []);

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-2">
          <ContainerInstrument className="flex items-center gap-2 text-primary">
            <Activity strokeWidth={1.5} size={16} />
            <TextInstrument as="span" className="text-[15px] font-black tracking-[0.2em]">
              <VoiceglotText translationKey="admin.visitors.badge" defaultText="Live Intelligence" />
            </TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter ">
            <VoiceglotText translationKey="admin.visitors.title" defaultText="Visitor Cockpit" />
          </HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex gap-4 bg-va-black text-white p-6 rounded-[24px] border border-white/5">
          <div className="flex flex-col">
            <span className="text-[15px] font-black tracking-widest text-white/40">Live Radar</span>
            <span className="text-3xl font-black text-primary">{visitors.filter(v => new Date(v.lastVisitAt).getTime() > Date.now() - 300000).length}</span>
          </div>
          <div className="w-px h-full bg-white/10 mx-4" />
          <div className="flex flex-col">
            <span className="text-[15px] font-black tracking-widest text-white/40">Uniek Vandaag</span>
            <span className="text-3xl font-black">{stats?.totalToday || 0}</span>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Live Table */}
      <SectionInstrument className="bg-white border border-black/5 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-black/5 flex justify-between items-center">
          <HeadingInstrument level={2} className="text-xl font-black tracking-tight">
            <VoiceglotText translationKey="admin.visitors.table_title" defaultText="Intelligence Playlist" />
          </HeadingInstrument>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[15px] font-black tracking-widest text-va-black/40">{visitors.length} Live</span>
            </div>
            <div className="w-px h-4 bg-black/10" />
            <span className="text-[15px] font-black tracking-widest text-va-black/20">{recentSessions.length} Recent</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-va-off-white">
                <th className="p-6 text-[15px] font-black tracking-widest text-va-black/40">Bezoeker</th>
                <th className="p-6 text-[15px] font-black tracking-widest text-va-black/40">Status</th>
                <th className="p-6 text-[15px] font-black tracking-widest text-va-black/40">Huidige Pagina</th>
                <th className="p-6 text-[15px] font-black tracking-widest text-va-black/40">Duur</th>
                <th className="p-6 text-[15px] font-black tracking-widest text-va-black/40">Events</th>
                <th className="p-6 text-[15px] font-black tracking-widest text-va-black/40 text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Activity strokeWidth={1.5} className="text-primary animate-spin" size={40} />
                      <span className="text-[15px] font-bold tracking-widest text-va-black/20">Laden van Mat Radar...</span>
                    </div>
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <TextInstrument className="text-va-black/40 font-medium">Geen bezoekers op de radar.</TextInstrument>
                  </td>
                </tr>
              ) : (
                visitors.map((v) => {
                  const isLive = new Date(v.lastVisitAt).getTime() > Date.now() - 300000;
                  return (
                    <tr key={v.id} className="hover:bg-va-off-white transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[15px] ${isLive ? "bg-va-black text-white" : "bg-va-black/5 text-va-black/40"}`}>
                            {v.visitorHash.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <TextInstrument className="text-sm font-black text-va-black">
                              {v.companyName || 'Anonieme Bezoeker'}
                            </TextInstrument>
                            <TextInstrument className="text-[15px] text-va-black/40 font-bold tracking-widest">
                              {v.locationCity ? `${v.locationCity}, ${v.locationCountry}` : v.visitorHash}
                            </TextInstrument>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-va-black/20"}`} />
                            <span className={`text-[15px] font-black ${isLive ? "text-green-500" : "text-va-black/20"}`}>
                              {isLive ? 'Live' : 'Recent'}
                            </span>
                          </div>
                          <span className="text-[12px] font-bold text-va-black/20 tracking-widest ">{v.journeyState}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-[15px] font-bold bg-va-black/5 px-3 py-1.5 rounded-lg w-fit max-w-[200px] truncate">
                          <Monitor strokeWidth={1.5} size={12} className="text-va-black/20" />
                          <span>{v.currentPage || '/'}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-[15px] font-bold">
                          <Globe strokeWidth={1.5} size={12} className="text-va-black/20" />
                          <span>{v.market}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-bold text-va-black/60">{v.utmSource || 'Direct'}</span>
                          <span className="text-[11px] font-medium text-va-black/20">{v.utmMedium || '-'}</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <Link 
                          href={`/admin/marketing/visitors/${v.visitorHash}`}
                          className="inline-flex items-center gap-2 bg-va-black text-white px-4 py-2 rounded-xl text-[15px] font-black tracking-widest hover:bg-primary transition-all group-hover:scale-105"
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionInstrument>

      {/* Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ContainerInstrument className="bg-va-black text-white p-10 rounded-[40px] relative overflow-hidden">
          <MousePointer2 className="text-primary mb-6" size={32} />
          <HeadingInstrument level={2} className="text-2xl font-black tracking-tight mb-4">
            Heatmap Insights
          </HeadingInstrument>
          <TextInstrument className="text-white/40 text-[15px] font-medium leading-relaxed mb-6">
            Meest geklikte elementen in de laatste 24 uur. Focus op de &apos;Tarieven&apos; knop bij Agency.
          </TextInstrument>
          <Link href="#" className="text-[15px] font-black tracking-widest text-primary flex items-center gap-2">
            Bekijk Heatmap <ArrowRight strokeWidth={1.5} size={12} />
          </Link>
        </ContainerInstrument>

        <ContainerInstrument className="bg-white border border-black/5 p-10 rounded-[40px]">
          <User strokeWidth={1.5}s className="text-va-black/20 mb-6" size={32} />
          <HeadingInstrument level={2} className="text-2xl font-black tracking-tight mb-4">
            Customer DNA
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 text-[15px] font-medium leading-relaxed mb-6">
            80% van de huidige bezoekers zijn &apos;Decision Makers&apos; binnen de Agency journey.
          </TextInstrument>
          <Link href="/admin/users" className="text-[15px] font-black tracking-widest text-va-black/40 flex items-center gap-2">
            User DNA Dashboard <ArrowRight strokeWidth={1.5} size={12} />
          </Link>
        </ContainerInstrument>

        <ContainerInstrument className="bg-va-off-white border border-black/5 p-10 rounded-[40px]">
          <Eye className="text-va-black/20 mb-6" size={32} />
          <HeadingInstrument level={2} className="text-2xl font-black tracking-tight mb-4">
            Drop-off Radar
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 text-[15px] font-medium leading-relaxed mb-6">
            Hoge bounce-rate op de &apos;Over Ons&apos; pagina. AI stelt voor om de CTA te verduidelijken.
          </TextInstrument>
          <Link href="#" className="text-[15px] font-black tracking-widest text-va-black/40 flex items-center gap-2">
            Analyseer Flow <ArrowRight strokeWidth={1.5} size={12} />
          </Link>
        </ContainerInstrument>
      </div>
    </PageWrapperInstrument>
  );
}
