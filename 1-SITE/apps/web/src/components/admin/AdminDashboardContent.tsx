"use client";

import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useAdminTracking } from '@/hooks/useAdminTracking';
import {
    Activity,
    ArrowRight,
    Bell,
    Brain,
    Calendar,
    Clock,
    Database,
    Layout,
    Mail,
    Mic,
    Settings,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Users,
    Zap,
    Bot,
    Music,
    Phone,
    Euro,
    ShoppingBag,
    Loader2,
    Link as LinkIcon,
    X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminDashboardContent() {
  const [recentHeals, setRecentHeals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickLinkNames, setQuickLinkNames] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { logAction } = useAdminTracking();

  const handleQuickLink = async () => {
    if (!quickLinkNames.trim()) return;
    setIsGeneratingLink(true);
    try {
      const res = await fetch('/api/admin/casting/quick-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rawNames: quickLinkNames,
          projectName: 'Dashboard Quick Link'
        })
      });
      const data = await res.json();
      if (data.success) {
        const fullUrl = `${window.location.origin}${data.url}`;
        await navigator.clipboard.writeText(fullUrl);
        toast.success('Pitch link gekopieerd naar klembord!');
        setQuickLinkNames('');
      } else {
        toast.error(data.error || 'Fout bij genereren link');
      }
    } catch (err) {
      toast.error('Netwerkfout');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const healsRes = await fetch('/api/admin/godmode/heals');
        const healsData = await healsRes.json();
        if (healsData.success) setRecentHeals(healsData.heals);

        const notifyRes = await fetch('/api/admin/system/logs');
        const notifyData = await notifyRes.json();
        
        if (notifyData && notifyData.logs) {
          setNotifications(notifyData.logs.slice(0, 5).map((log: any) => ({
            id: log.id,
            type: log.level === 'error' ? 'ai' : log.source === 'mail' ? 'mail' : 'approval',
            title: log.message,
            user: log.source,
            time: new Date(log.created_at || log.createdAt).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
            icon: log.source === 'mail' ? <Mail size={14} /> : log.level === 'error' ? <Brain size={14} /> : <Bell size={14} />
          })));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: <VoiceglotText  translationKey="admin.stats.mails" defaultText="Nieuwe Mails" />, value: '...', icon: <Mail strokeWidth={1.5} size={20} />, trend: 'Inbox', color: 'text-blue-500', href: '/admin/mailbox' },
    { label: <VoiceglotText  translationKey="admin.stats.analytics" defaultText="Statistieken" />, value: 'Inzicht', icon: <TrendingUp strokeWidth={1.5} size={20} />, trend: 'Groei', color: 'text-orange-500', href: '/admin/analytics' },
    { label: <VoiceglotText  translationKey="admin.stats.approvals" defaultText="Wachtrij" />, value: '...', icon: <Bell strokeWidth={1.5} size={20} />, trend: 'Actie nodig', color: 'text-orange-500', href: '/admin/approvals' },
    { label: <VoiceglotText  translationKey="admin.stats.finance" defaultText="Financieel" />, value: 'Overzicht', icon: <Euro strokeWidth={1.5} size={20} />, trend: 'Kassa', color: 'text-green-500', href: '/admin/finance' },
    { label: <VoiceglotText  translationKey="admin.stats.workshops" defaultText="Workshops" />, value: '...', icon: <Calendar strokeWidth={1.5} size={20} />, trend: 'Studio', color: 'text-purple-500', href: '/admin/studio/workshops' },
    { label: <VoiceglotText  translationKey="admin.stats.voices" defaultText="Stemmen" />, value: '...', icon: <Mic strokeWidth={1.5} size={20} />, trend: 'Demos', color: 'text-va-black/40', href: '/admin/voices' },
    { label: <VoiceglotText  translationKey="admin.stats.artists" defaultText="Artiesten" />, value: 'Actief', icon: <Music strokeWidth={1.5} size={20} />, trend: 'Portfolio', color: 'text-pink-500', href: '/admin/artists' },
    { label: <VoiceglotText  translationKey="admin.stats.agents" defaultText="Assistenten" />, value: 'Actief', icon: <Bot strokeWidth={1.5} size={20} />, trend: 'Beheer', color: 'text-primary', href: '/admin/agents' },
  ];

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-2">
          <ContainerInstrument className="flex items-center gap-2 text-primary">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={16} height={16} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            <TextInstrument as="span" className="text-[15px] font-bold tracking-[0.15em] uppercase"><VoiceglotText  translationKey="admin.badge" defaultText="Voices Admin" /></TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter text-va-black"><VoiceglotText  translationKey="admin.title" defaultText="Beheer-dashboard" /></HeadingInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument 
            onClick={() => {
              logAction('create_dashboard_snapshot');
              import('react-hot-toast').then(toast => toast.default.success('Snapshot opgeslagen!'));
            }}
            className="va-btn-nav !rounded-[10px]"
          >
            <VoiceglotText  translationKey="admin.cta.snapshot" defaultText="Snapshot maken" />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Quick Stats */}
      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <ContainerInstrument key={i} className="bg-white border border-black/5 p-8 rounded-[20px] shadow-sm hover:shadow-aura transition-all group relative overflow-hidden">
            {stat.href && <Link  href={stat.href} className="absolute inset-0 z-10" />}
            <ContainerInstrument className="flex justify-between items-start mb-6">
              <ContainerInstrument className={`w-12 h-12 bg-va-off-white rounded-[10px] flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </ContainerInstrument>
              <TextInstrument as="span" className="text-[15px] font-light text-va-black/40 bg-va-black/5 px-2 py-1 rounded-[10px]">
                {stat.trend}
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="space-y-1">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30">
                {stat.label}
              </TextInstrument>
              <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-va-black">{stat.value}</HeadingInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>

      {/* Live Feed & Notifications */}
      <SectionInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ContainerInstrument className="lg:col-span-2 bg-white border border-black/5 rounded-[20px] p-10 shadow-sm">
          <ContainerInstrument className="flex justify-between items-center mb-8">
          <ContainerInstrument>
            <ContainerInstrument className="w-10 h-10 bg-primary/10 text-primary rounded-[10px] flex items-center justify-center">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            </ContainerInstrument>
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight text-va-black mt-4"><VoiceglotText  translationKey="admin.feed.title" defaultText="Recente activiteit" /></HeadingInstrument>
            <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText  translationKey="admin.feed.subtitle" defaultText="Meldingen uit de mailbox en van assistenten" /></TextInstrument>
          </ContainerInstrument>
            <ButtonInstrument as={Link} href="/admin/mailbox" className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all"><VoiceglotText  translationKey="admin.feed.full_inbox" defaultText="Volledige inbox" /><Image  src="/assets/common/branding/icons/FORWARD.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} /></ButtonInstrument>
          </ContainerInstrument>

      <ContainerInstrument className="space-y-4">
        {loading ? (
          <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary/20" size={40} /></div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <ContainerInstrument key={n.id} className="flex items-center justify-between p-5 bg-va-off-white rounded-[24px] border border-black/[0.02] hover:border-primary/20 transition-all group cursor-pointer">
              <ContainerInstrument className="flex items-center gap-4">
                <ContainerInstrument className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  n.type === 'mail' ? 'bg-blue-500/10 text-blue-500' : 
                  n.type === 'approval' ? 'bg-orange-500/10 text-orange-500' : 
                  'bg-purple-500/10 text-purple-500'
                }`}>
                  {n.icon}
                </ContainerInstrument>
                <ContainerInstrument>
                  <TextInstrument className="text-[15px] font-black text-gray-900">{n.title}</TextInstrument>
                  <TextInstrument className="text-[15px] text-va-black/40 font-bold tracking-widest uppercase">{n.user}</TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-4">
                <ContainerInstrument className="flex items-center gap-1.5 text-va-black/20">
                  <Clock strokeWidth={1.5} size={12} />
                  <TextInstrument as="span" className="text-[15px] font-bold">{n.time}</TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <ArrowRight strokeWidth={1.5} size={14} className="text-primary" />
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          ))
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-black/5 rounded-[32px]">
            <TextInstrument className="text-va-black/20 font-bold tracking-widest uppercase">Geen recente meldingen</TextInstrument>
          </div>
        )}
      </ContainerInstrument>
    </ContainerInstrument>

        <ContainerInstrument className="bg-va-black text-white rounded-[20px] p-10 relative overflow-hidden flex flex-col justify-between">
          <ContainerInstrument className="relative z-10">
            <ContainerInstrument className="w-12 h-12 bg-primary rounded-[10px] flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" className="brightness-0 invert" />
            </ContainerInstrument>
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter mb-4 leading-tight text-white">
              <VoiceglotText  translationKey="admin.voicy_brain.title" defaultText="De assistent denkt mee" />
              <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed mb-8">
                <VoiceglotText  translationKey="admin.voicy_brain.text" defaultText="Ik analyseer de mailbox om je te helpen bij het beheer van je projecten." />
              </TextInstrument>
            </HeadingInstrument>
            
            <ContainerInstrument className="space-y-3">
              <ContainerInstrument className="flex items-center gap-3 p-3 bg-white/5 rounded-[10px] border border-white/5">
                <ContainerInstrument className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <TextInstrument className="text-[15px] tracking-widest text-white/60 font-light"><VoiceglotText  translationKey="admin.voicy_brain.syncing" defaultText="Syncing Gmail..." /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-3 p-3 bg-white/5 rounded-[10px] border border-white/5">
                <ContainerInstrument className="w-2 h-2 bg-blue-500 rounded-full" />
                <TextInstrument className="text-[15px] tracking-widest text-white/60 font-light"><VoiceglotText  translationKey="admin.voicy_brain.analyzing" defaultText="Analyzing Trends" /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ButtonInstrument as={Link} href="/admin/mailbox?tab=insights" className="relative z-10 va-btn-pro !bg-primary w-full text-center mt-8 !rounded-[10px]"><VoiceglotText  translationKey="admin.voicy_brain.cta" defaultText="Bekijk inzichten" /></ButtonInstrument>

          <ContainerInstrument className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-[20px] blur-[80px]" />
        </ContainerInstrument>
      </SectionInstrument>

      {/* Main Control Grid */}
      <BentoGrid strokeWidth={1.5} columns={3}>
        {/* Quick Link Widget */}
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 flex flex-col justify-between h-[400px] group hover:border-primary/20 transition-all rounded-[20px]">
          <ContainerInstrument>
            <LinkIcon strokeWidth={1.5} className="text-primary mb-6" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4 text-va-black">
              Quick Pitch Link
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 text-[13px] font-medium leading-relaxed mb-6">
              Plak namen van stemmen (gescheiden door komma of enter) om direct een deelbare link met tarieven te maken.
            </TextInstrument>
            <textarea 
              value={quickLinkNames}
              onChange={(e) => setQuickLinkNames(e.target.value)}
              placeholder="Bijv: Johfrah, Eveline, ..."
              className="w-full h-24 bg-va-off-white rounded-xl p-4 text-[13px] font-medium border-none focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </ContainerInstrument>
          <ButtonInstrument 
            onClick={handleQuickLink}
            disabled={isGeneratingLink || !quickLinkNames.trim()}
            className="va-btn-pro !bg-va-black w-full !rounded-[10px] mt-4 flex items-center justify-center gap-2"
          >
            {isGeneratingLink ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
            <span>Genereer & Kopieer</span>
          </ButtonInstrument>
        </BentoCard>

        {/* Database Management */}
        <BentoCard span="sm" className="bg-va-black text-white p-10 flex flex-col justify-between h-[400px] group relative overflow-hidden rounded-[20px]">
          <ContainerInstrument className="relative z-10">
            <Calendar strokeWidth={1.5} className="text-primary mb-8" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tighter mb-4">
              <VoiceglotText translationKey="admin.studio.dashboard_title" defaultText="Workshop Dashboard" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 text-[15px] font-medium leading-relaxed">
              <VoiceglotText translationKey="admin.studio.dashboard_text" defaultText="Beheer edities, deelnemers en bezettingsgraad voor de Studio-tak." />
            </TextInstrument>
          </ContainerInstrument>
          <Link href="/admin/studio/workshops" className="relative z-10 va-btn-pro !bg-primary w-fit">
            <VoiceglotText translationKey="admin.studio.dashboard_cta" defaultText="Open Dashboard" />
          </Link>
          <ContainerInstrument className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-[60px]" />
        </BentoCard>

        {/* Systeem instellingen */}
        <BentoCard span="sm" className="bg-white border border-black/5 p-10 flex flex-col justify-between h-[400px] group hover:border-primary/20 transition-all rounded-[20px]">
          <ContainerInstrument>
            <Settings strokeWidth={1.5} className="text-va-black/20 group-hover:text-primary transition-colors mb-8" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4 text-va-black"><VoiceglotText  translationKey="admin.settings.title" defaultText="Systeem instellingen" /><TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="admin.settings.text" defaultText="Configureer bedrijfsinformatie, openingsuren en de globale vakantieregeling." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <div className="flex flex-col gap-2">
            <Link  href="/admin/settings" className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
              <VoiceglotText  translationKey="admin.settings.cta" defaultText="Bedrijfsinstellingen" />
              <ArrowRight strokeWidth={1.5} size={12} />
            </Link>
            <Link  href="/admin/telephony" className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
              <VoiceglotText  translationKey="admin.telephony.cta" defaultText="Telefonie Tarieven" />
              <Euro strokeWidth={1.5} size={12} />
            </Link>
          </div>
        </BentoCard>

        {/* Page Builder Quick Access */}
        <BentoCard span="sm" className="bg-va-off-white p-10 flex flex-col justify-between h-[400px] border border-black/5 group hover:border-primary/20 transition-all rounded-[20px]">
          <ContainerInstrument>
            <Layout strokeWidth={1.5} className="text-va-black/20 group-hover:text-primary transition-colors mb-8" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4 text-va-black"><VoiceglotText  translationKey="admin.architect.title" defaultText="Pagina beheer" /><TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="admin.architect.text" defaultText="Beheer de structuur van de website en maak nieuwe landingspagina's aan." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <Link  href="/" className="text-[15px] font-light tracking-widest text-va-black/40 hover:text-va-black transition-colors"><VoiceglotText  translationKey="admin.architect.cta" defaultText="Naar website" /></Link>
        </BentoCard>

        {/* Klantprofielen */}
        <BentoCard span="lg" className="bg-white border border-black/5 p-12 h-[400px] flex flex-col justify-between group hover:border-primary/20 transition-all rounded-[20px]">
          <ContainerInstrument className="flex justify-between items-start">
            <ContainerInstrument>
              <Users strokeWidth={1.5} className="text-va-black/20 group-hover:text-primary transition-colors mb-8" size={32} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter mb-4 text-va-black"><VoiceglotText  translationKey="admin.users.title" defaultText="Klantprofielen" /><TextInstrument className="text-va-black/40 max-w-sm text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="admin.users.text" defaultText="Beheer je klanten, hun rollen en voorkeuren. Bekijk inzichten over hun gedrag op het platform." /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex flex-col items-end gap-2">
              <Link  href="/admin/marketing/visitors" className="px-4 py-2 bg-green-500/10 text-green-500 rounded-[20px] text-[15px] font-light hover:bg-green-500/20 transition-all"><VoiceglotText  translationKey="admin.users.online_count" defaultText="8 online" /></Link>
            </ContainerInstrument>
          </ContainerInstrument>
          <ButtonInstrument as={Link} href="/admin/users" className="va-btn-pro !bg-va-black w-fit !rounded-[10px]"><VoiceglotText  translationKey="admin.users.cta" defaultText="Klanten beheren" /></ButtonInstrument>
        </BentoCard>

        {/* Assistenten Beheer */}
        <BentoCard span="sm" className="bg-va-black text-white p-10 h-[400px] flex flex-col justify-between relative overflow-hidden group rounded-[20px]">
          <ContainerInstrument className="relative z-10">
            <Bot strokeWidth={1.5} className="text-primary mb-8" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4 text-white">
              <VoiceglotText translationKey="admin.agents.title" defaultText="Assistenten" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed">
              <VoiceglotText translationKey="admin.agents.desc" defaultText="Beheer de instructies en kennis van de verschillende assistenten op het platform." />
            </TextInstrument>
          </ContainerInstrument>
          
          <Link href="/admin/agents" className="relative z-10 va-btn-pro !bg-primary w-fit !text-va-black font-bold tracking-widest text-[11px] uppercase">
            <VoiceglotText translationKey="admin.agents.cta" defaultText="Open Beheer" />
          </Link>
          <ContainerInstrument className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-[20px] blur-[40px]" />
        </BentoCard>
      </BentoGrid>

      {/*  LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminDashboard",
            "name": "Voices Admin",
            "description": "Centraal beheer-dashboard voor het Voices platform.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "system_management",
            "capabilities": ["manage_database", "view_logs", "user_management", "page_management"],
            "lexicon": ["Admin", "Zelfherstellend", "Klantprofiel", "Overzicht"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
