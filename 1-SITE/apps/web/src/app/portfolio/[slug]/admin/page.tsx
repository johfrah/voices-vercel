"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  SectionInstrument, 
  ButtonInstrument,
  PageWrapperInstrument
} from '@/components/ui/LayoutInstruments';
import { 
  BarChart3, 
  Globe, 
  ShieldCheck, 
  Settings, 
  ExternalLink, 
  Eye, 
  CreditCard, 
  Zap,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
  Layout,
  MessageSquare
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getActor } from '@/lib/api';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * PORTFOLIO ADMIN DASHBOARD (2026)
 * 
 * Het centrale zenuwcentrum voor het beheer van een specifiek portfolio.
 * Alleen toegankelijk voor admins en de eigenaar van het portfolio.
 */
export default function PortfolioAdminPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAdmin, user } = useAuth();
  const [actor, setActor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActor() {
      try {
        const data = await getActor(slug);
        setActor(data);
      } catch (e) {
        console.error("Failed to load actor for admin", e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadActor();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-va-off-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
          <TextInstrument className="text-[11px] font-black uppercase tracking-widest text-va-black/20">Loading Dashboard...</TextInstrument>
        </div>
      </div>
    );
  }

  // Beveiliging: Alleen admin of de eigenaar zelf
  if (!isAdmin && user?.email !== actor?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-va-off-white p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tight">Geen toegang</HeadingInstrument>
            <TextInstrument className="text-va-black/40">Je hebt geen rechten om dit portfolio te beheren. Neem contact op met support als je denkt dat dit een fout is.</TextInstrument>
          </div>
          <ButtonInstrument onClick={() => router.push(`/portfolio/${slug}`)} variant="default" className="va-btn-pro px-8 py-3">
            Terug naar Portfolio
          </ButtonInstrument>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Bezoekers (30d)', value: '1.240', change: '+12%', icon: Users, trend: 'up' },
    { label: 'Conversie', value: '4.2%', change: '+0.5%', icon: Zap, trend: 'up' },
    { label: 'Geschatte Omzet', value: '€ 2.450', change: '+8%', icon: CreditCard, trend: 'up' },
  ];

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pb-32">
      {/* Header */}
      <SectionInstrument className="pt-32 pb-12 border-b border-black/5 bg-white/50 backdrop-blur-xl sticky top-0 z-[100]">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <button 
                onClick={() => router.push(`/portfolio/${slug}`)}
                className="flex items-center gap-2 text-[11px] font-black text-va-black/20 uppercase tracking-widest hover:text-primary transition-colors mb-4 group"
              >
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Terug naar Portfolio
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[20px] bg-va-black text-white flex items-center justify-center shadow-aura-lg relative overflow-hidden group">
                  <Globe size={28} className="relative z-10" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                <div>
                  <HeadingInstrument level={1} className="text-4xl md:text-5xl font-extralight tracking-tighter leading-none">
                    Beheer <span className="text-primary/40 italic">{actor?.display_name}</span>
                  </HeadingInstrument>
                  <div className="flex items-center gap-3 mt-2">
                    <TextInstrument className="text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                      Managed Portfolio Service
                    </TextInstrument>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Live & Beveiligd</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <ButtonInstrument 
                as="a" 
                href={`/portfolio/${slug}`} 
                target="_blank"
                variant="outline"
                className="rounded-xl px-6 flex items-center gap-2 bg-white border-black/5 hover:border-primary/20 transition-all shadow-sm"
              >
                <ExternalLink size={16} />
                Bekijk Site
              </ButtonInstrument>
              <ButtonInstrument 
                className="va-btn-pro !rounded-xl px-8 flex items-center gap-2 shadow-aura-lg"
              >
                <Settings size={16} className="animate-spin-slow" />
                Instellingen
              </ButtonInstrument>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Main Content */}
      <ContainerInstrument className="max-w-6xl mx-auto px-6 mt-12">
        <BentoGrid columns={3} className="gap-8">
          
          {/* Stats Row */}
          {stats.map((stat, i) => (
            <BentoCard key={i} className="bg-white p-8 border border-black/5 shadow-aura hover:shadow-aura-lg transition-all duration-700 group">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-2xl bg-va-off-white flex items-center justify-center text-va-black/40 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                  <stat.icon size={24} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={cn(
                    "text-[11px] font-black px-2 py-1 rounded-lg border flex items-center gap-1",
                    stat.trend === 'up' ? "text-green-500 bg-green-500/5 border-green-500/10" : "text-red-500 bg-red-500/5 border-red-500/10"
                  )}>
                    <TrendingUp size={10} />
                    {stat.change}
                  </span>
                </div>
              </div>
              <TextInstrument className="text-[11px] font-black text-va-black/20 uppercase tracking-[0.2em] mb-2">
                {stat.label}
              </TextInstrument>
              <TextInstrument className="text-5xl font-light tracking-tighter text-va-black">
                {stat.value}
              </TextInstrument>
            </BentoCard>
          ))}

          {/* PaaS Status Card */}
          <BentoCard span="lg" className="bg-va-black text-white p-12 border border-white/5 shadow-2xl relative overflow-hidden group min-h-[400px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-primary/20 transition-colors duration-1000" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[20px] bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                  <ShieldCheck size={28} className="text-primary" />
                </div>
                <div>
                  <HeadingInstrument level={3} className="text-3xl font-light tracking-tight">Managed Service Status</HeadingInstrument>
                  <TextInstrument className="text-white/40 text-base font-light">Jouw portfolio wordt 24/7 gemonitord en geoptimaliseerd.</TextInstrument>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6">
                {[
                  { label: "Technische SEO", status: "100/100 Geoptimaliseerd", icon: CheckCircle2 },
                  { label: "Beveiliging", status: "SSL & Bot Protection Actief", icon: CheckCircle2 },
                  { label: "Hosting", status: "Global Edge Network (Vercel)", icon: CheckCircle2 },
                  { label: "Updates", status: "Real-time Sync met Voices.be", icon: CheckCircle2 }
                ].map((item, i) => (
                  <div key={i} className="space-y-2 group/item">
                    <TextInstrument className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] group-hover/item:text-primary transition-colors">
                      {item.label}
                    </TextInstrument>
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-green-500" />
                      <span className="text-[15px] font-light text-white/80">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-12 mt-auto">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <TextInstrument className="text-[13px] font-medium text-white/60">Systeemstatus: Operationeel</TextInstrument>
                </div>
                <TextInstrument className="text-[11px] font-black uppercase tracking-widest text-white/20">v2.0.26</TextInstrument>
              </div>
            </div>
          </BentoCard>

          {/* Quick Actions */}
          <BentoCard span="sm" className="bg-white p-10 border border-black/5 shadow-aura flex flex-col">
            <div className="mb-10">
              <div className="w-12 h-12 rounded-2xl bg-va-off-white flex items-center justify-center text-primary mb-6 shadow-sm">
                <Layout size={24} strokeWidth={1.5} />
              </div>
              <HeadingInstrument level={3} className="text-[11px] font-black text-va-black/20 uppercase tracking-[0.2em] mb-2">
                Snelkoppelingen
              </HeadingInstrument>
              <TextInstrument className="text-[14px] text-va-black/40 font-light">Directe toegang tot de belangrijkste onderdelen.</TextInstrument>
            </div>

            <div className="space-y-4 mt-auto">
              {[
                { label: "Beheer Demo's", href: `/portfolio/${slug}/#demos`, icon: ChevronRight },
                { label: "Tarieven aanpassen", href: `/portfolio/${slug}/tarieven`, icon: ChevronRight },
                { label: "Account Instellingen", href: `/account/settings`, icon: ChevronRight },
                { label: "Support aanvragen", href: `/contact`, icon: ChevronRight }
              ].map((action, i) => (
                <ButtonInstrument 
                  key={i}
                  onClick={() => router.push(action.href)}
                  variant="plain" 
                  className="w-full justify-between bg-va-off-white hover:bg-va-black hover:text-white transition-all duration-500 p-5 rounded-2xl group/btn border border-black/[0.02]"
                >
                  <span className="text-[14px] font-bold tracking-tight">{action.label}</span>
                  <action.icon size={16} className="group-hover/btn:translate-x-1 transition-transform opacity-20 group-hover/btn:opacity-100" />
                </ButtonInstrument>
              ))}
            </div>
          </BentoCard>

          {/* Activity Log (Placeholder) */}
          <BentoCard span="full" className="bg-white p-12 border border-black/5 shadow-aura">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">Recent Activiteit</HeadingInstrument>
                <TextInstrument className="text-[13px] text-va-black/30 font-light uppercase tracking-widest">Visitor Intelligence Logs</TextInstrument>
              </div>
              <ButtonInstrument variant="outline" className="rounded-xl px-6 text-[11px] font-black uppercase tracking-widest border-black/5">
                Volledig Rapport
              </ButtonInstrument>
            </div>

            <div className="space-y-6">
              {[
                { event: "Nieuwe bestelling", details: "Commercial - Nationaal", time: "2 uur geleden", icon: Zap, color: "text-primary" },
                { event: "Demo beluisterd", details: "Corporate - Johfrah Demos", time: "4 uur geleden", icon: Eye, color: "text-blue-500" },
                { event: "Prijsaanvraag", details: "E-learning module (1000 woorden)", time: "1 dag geleden", icon: MessageSquare, color: "text-amber-500" },
                { event: "Systeem Update", details: "SEO Metadata geoptimaliseerd", time: "2 dagen geleden", icon: CheckCircle2, color: "text-green-500" }
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-va-off-white transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className={cn("w-10 h-10 rounded-xl bg-va-off-white flex items-center justify-center shadow-sm", log.color)}>
                      <log.icon size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <TextInstrument className="text-[15px] font-bold text-va-black">{log.event}</TextInstrument>
                      <TextInstrument className="text-[13px] text-va-black/40 font-light">{log.details}</TextInstrument>
                    </div>
                  </div>
                  <div className="text-right">
                    <TextInstrument className="text-[12px] font-medium text-va-black/30 flex items-center gap-2">
                      <Clock size={12} />
                      {log.time}
                    </TextInstrument>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

        </BentoGrid>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
