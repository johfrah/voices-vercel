"use client";

import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { cn } from "@/lib/utils";
import {
    Activity,
    ArrowLeft,
    Clock,
    Monitor,
    MousePointer2,
    Play,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import 'rrweb-player/dist/style.css';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

/**
 *  LIVE VIEW PLAYER (2026)
 * 
 * Reconstrueert user sessies via rrweb-player.
 * Onderdeel van de Intelligence Layer.
 */

export default function VisitorPlayerPage() {
  const { hash } = useParams();
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventRes, recentRes] = await Promise.all([
          fetch(`/api/admin/visitors/events/${hash}`),
          fetch('/api/admin/visitors/recent')
        ]);
        
        const eventData = await eventRes.json();
        const recentData = await recentRes.json();

        if (eventData.error) {
          setError(eventData.error);
          return;
        }

        setSession(eventData.session);
        setRecentSessions(recentData.sessions || []);

        if (eventData.events && eventData.events.length > 0 && playerContainerRef.current) {
          // Initialize rrweb player
          const rrwebPlayer = (await import('rrweb-player')).default;
          playerRef.current = new rrwebPlayer({
            target: playerContainerRef.current,
            props: {
              events: eventData.events,
              width: playerContainerRef.current.offsetWidth,
              height: 600,
              autoPlay: true,
              showController: true,
            },
          });
        } else {
          setError("Geen events gevonden voor deze sessie.");
        }
      } catch (err) {
        console.error(' Failed to load session data:', err);
        setError("Fout bij het laden van de sessie.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const container = playerContainerRef.current;
    return () => {
      if (playerRef.current) {
        // Cleanup player if needed
        if (container) {
          container.innerHTML = '';
        }
      }
    };
  }, [hash]);

  return (
    <PageWrapperInstrument className="p-12 space-y-8 max-w-[1800px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-center">
        <ContainerInstrument className="space-y-2">
          <Link  href="/admin/marketing/visitors" className="flex items-center gap-2 text-va-black/40 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-4">
            <ArrowLeft strokeWidth={1.5} size={12} /><VoiceglotText  translationKey="auto.page.terug_naar_cockpit.87606e" defaultText="Terug naar cockpit" /></Link>
          <ContainerInstrument className="flex items-center gap-3">
            <ContainerInstrument className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Activity strokeWidth={1.5} size={20} />
            </ContainerInstrument>
            <ContainerInstrument>
              <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter "><VoiceglotText  translationKey="auto.page.sessie_replay.064195" defaultText="Sessie Replay" /></HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-medium">
                Visitor Hash: <TextInstrument className="text-va-black font-bold">{hash}</TextInstrument>
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {session && (
          <ContainerInstrument className="flex gap-4">
            <ContainerInstrument className="flex gap-6 bg-white border border-black/5 p-6 rounded-[24px] shadow-sm">
              <ContainerInstrument className="flex flex-col">
                <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.starttijd.b80649" defaultText="Starttijd" /></TextInstrument>
                <TextInstrument className="text-[15px] font-bold">{new Date(session.createdAt).toLocaleString()}</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="w-px h-full bg-black/5" />
              <ContainerInstrument className="flex flex-col">
                <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.pagina.265753" defaultText="Pagina" /></TextInstrument>
                <TextInstrument className="text-[15px] font-bold max-w-[200px] truncate">{session.url?.replace('https://www.voices.be', '') || '/'}</TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            
            {session.user && (
              <Link  href={`/admin/users/${session.userId}`} className="flex items-center gap-4 bg-va-black text-white p-6 rounded-[24px] shadow-lg hover:bg-primary transition-all group">
                <ContainerInstrument className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-[15px]">
                  {session.user.firstName?.[0]}{session.user.lastName?.[0]}
                </ContainerInstrument>
                <ContainerInstrument>
                  <TextInstrument className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.page.bekijk_dna.9a6c88" defaultText="Bekijk DNA" /></TextInstrument>
                  <TextInstrument className="text-[15px] font-bold text-white/60 group-hover:text-white">{session.user.firstName} {session.user.lastName}</TextInstrument>
                </ContainerInstrument>
              </Link>
            )}
          </ContainerInstrument>
        )}
      </SectionInstrument>

      <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Player Area */}
        <ContainerInstrument className="lg:col-span-3 space-y-8">
          <SectionInstrument className="bg-va-black rounded-[40px] overflow-hidden shadow-2xl border border-white/5 relative min-h-[700px] flex items-center justify-center">
            {loading ? (
              <ContainerInstrument className="flex flex-col items-center gap-4">
                <Activity strokeWidth={1.5} className="text-primary animate-spin" size={48} />
                <TextInstrument className="text-white/40 text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.page.reconstrueren_van_se.55b81b" defaultText="Reconstrueren van sessie..." /></TextInstrument>
              </ContainerInstrument>
            ) : error ? (
              <ContainerInstrument className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center max-w-md">
                <TextInstrument className="text-red-500 font-bold mb-4">{error}</TextInstrument>
                <Link  href="/admin/marketing/visitors" className="va-btn-pro !bg-white !text-va-black"><VoiceglotText  translationKey="auto.page.terug_naar_cockpit.dada9f" defaultText="Terug naar Cockpit" /></Link>
              </ContainerInstrument>
            ) : (
              <ContainerInstrument ref={playerContainerRef} className="w-full h-full" />
            )}
          </SectionInstrument>

          {/* Intelligence Sidebar / Info */}
          {!loading && !error && (
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ContainerInstrument className="bg-white border border-black/5 p-8 rounded-[32px] shadow-sm">
                <MousePointer2 strokeWidth={1.5} className="text-primary mb-4" size={24} />
                <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest mb-2"><VoiceglotText  translationKey="auto.page.interactie_score.ddc459" defaultText="Interactie Score" /><TextInstrument className="text-[15px] text-va-black/40 leading-relaxed font-light"><VoiceglotText  translationKey="auto.page.deze_bezoeker_vertoo.018e30" defaultText="Deze bezoeker vertoonde een hoge mate van interesse in de prijs-calculator. 
                  Gemiddelde dwell-time op de calculator: 45 seconden." /></TextInstrument></HeadingInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="bg-white border border-black/5 p-8 rounded-[32px] shadow-sm">
                <Monitor strokeWidth={1.5} className="text-va-black/20 mb-4" size={24} />
                <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest mb-2"><VoiceglotText  translationKey="auto.page.device_info.db271f" defaultText="Device Info" /></HeadingInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 leading-relaxed font-light">
                  Browser: {session?.userAgent?.split(') ')[1] || 'Chrome/120.0.0'} <br />
                  OS: {session?.userAgent?.match(/\(([^)]+)\)/)?.[1] || 'Unknown'}
                </TextInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="bg-va-black text-white p-8 rounded-[32px] shadow-sm">
                <Clock strokeWidth={1.5} className="text-primary mb-4" size={24} />
                <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest mb-2 text-white"><VoiceglotText  translationKey="auto.page.retentie_policy.4c86b2" defaultText="Retentie Policy" /><TextInstrument className="text-white/40 text-[15px] leading-relaxed font-light"><VoiceglotText  translationKey="auto.page.deze_opname_wordt_co.8fd284" defaultText="Deze opname wordt conform het Zero-Mandaat 14 dagen bewaard. Daarna worden de ruwe events automatisch gewist." /></TextInstrument></HeadingInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>

        {/* Playlist Sidebar */}
        <ContainerInstrument className="space-y-6">
          <ContainerInstrument className="bg-white border border-black/5 rounded-[32px] p-6 shadow-sm h-fit">
            <HeadingInstrument level={2} className="text-[15px] font-light tracking-widest text-va-black/40 mb-6 flex items-center gap-2">
              <Play strokeWidth={1.5} size={12} fill="currentColor" /><VoiceglotText  translationKey="auto.page.intelligence_playlis.05eaf7" defaultText="Intelligence Playlist" /></HeadingInstrument>
            
            <ContainerInstrument className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {recentSessions.map((s) => (
                <Link  
                  key={s.id} 
                  href={`/admin/marketing/visitors/${s.visitorHash}`}
                  className={cn(
                    "block p-4 rounded-2xl border transition-all",
                    s.visitorHash === hash 
                      ? "bg-primary/5 border-primary/20 shadow-sm" 
                      : "bg-va-off-white border-transparent hover:border-black/10"
                  )}
                >
                  <ContainerInstrument className="flex justify-between items-start mb-2">
                    <TextInstrument className={cn("text-[15px] font-black uppercase tracking-widest", s.visitorHash === hash ? "text-primary" : "text-va-black/40")}>
                      {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TextInstrument>
                    {s.visitorHash === hash && (
                      <ContainerInstrument className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    )}
                  </ContainerInstrument>
                  <TextInstrument className="text-[15px] font-bold truncate mb-1">
                    {s.user?.firstName ? `${s.user.firstName} ${s.user.lastName}` : 'Anonieme Bezoeker'}
                  </TextInstrument>
                  <TextInstrument className="text-[15px] text-va-black/30 font-medium truncate">
                    {s.url?.replace('https://www.voices.be', '') || '/'}
                  </TextInstrument>
                </Link>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>

          {/* AI Insights Card */}
          <ContainerInstrument className="bg-va-black text-white p-8 rounded-[32px] shadow-lg relative overflow-hidden">
            <Sparkles strokeWidth={1.5} className="text-primary mb-4" size={24} />
            <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest mb-2"><VoiceglotText  translationKey="auto.page.ai_analyse.a49774" defaultText="AI Analyse" /><TextInstrument className="text-[15px] text-white/40 leading-relaxed font-light"><VoiceglotText  translationKey="auto.page.voicy_merkt_op_dat_d.2aca6b" defaultText="Voicy merkt op dat deze bezoeker twijfelt tussen de &apos;Pro&apos; en &apos;Studio&apos; plannen. 
              Overweeg een persoonlijke kortingscode te sturen." /></TextInstrument></HeadingInstrument>
            <ContainerInstrument className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
