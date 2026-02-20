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
    Euro
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [recentHeals, setRecentHeals] = useState<any[]>([]);
  const { logAction } = useAdminTracking();

  useEffect(() => {
    fetch('/api/admin/godmode/heals')
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecentHeals(data.heals);
      })
      .catch(err => console.error('Failed to fetch heals', err));
  }, []);

  const stats = [
    { label: <VoiceglotText  translationKey="admin.stats.mails" defaultText="Nieuwe Mails" />, value: '12', icon: <Mail strokeWidth={1.5} size={20} />, trend: 'Inbox', color: 'text-blue-500', href: '/admin/mailbox' },
    { label: <VoiceglotText  translationKey="admin.stats.approvals" defaultText="Approval Queue" />, value: '5', icon: <Bell strokeWidth={1.5} size={20} />, trend: 'Actie nodig', color: 'text-orange-500', href: '/admin/approvals' },
    { label: <VoiceglotText  translationKey="admin.stats.finance" defaultText="Financieel" />, value: 'Dashboard', icon: <TrendingUp strokeWidth={1.5} size={20} />, trend: 'Journeys', color: 'text-green-500', href: '/admin/finance' },
    { label: <VoiceglotText  translationKey="admin.stats.telephony" defaultText="Telefoon" />, value: 'Live', icon: <Phone strokeWidth={1.5} size={20} />, trend: 'Spotlight', color: 'text-primary', href: '/admin/telephony' },
    { label: <VoiceglotText  translationKey="admin.stats.workshops" defaultText="Workshops" />, value: '114', icon: <Calendar strokeWidth={1.5} size={20} />, trend: 'Studio', color: 'text-purple-500', href: '/admin/studio/workshops' },
    { label: <VoiceglotText  translationKey="admin.stats.voices" defaultText="Actieve Stemmen" />, value: '142', icon: <Mic strokeWidth={1.5} size={20} />, trend: 'Demos', color: 'text-va-black/40', href: '/admin/voices/demos' },
    { label: <VoiceglotText  translationKey="admin.stats.artists" defaultText="Music Label" />, value: 'Actief', icon: <Music strokeWidth={1.5} size={20} />, trend: 'Artists', color: 'text-pink-500', href: '/admin/artists' },
    { label: <VoiceglotText  translationKey="admin.stats.agents" defaultText="AI Agents" />, value: 'Actief', icon: <Bot strokeWidth={1.5} size={20} />, trend: 'Control', color: 'text-primary', href: '/admin/agents' },
  ];

  const notifications = [
    { id: 1, type: 'mail', title: 'Nieuwe offerte-aanvraag', user: 'Greenpeace', time: '5 min geleden', icon: <Mail strokeWidth={1.5} size={14} /> },
    { id: 2, type: 'approval', title: 'Factuur van Christina Van Geel', user: 'Wacht op goedkeuring', time: '12 min geleden', icon: <Bell strokeWidth={1.5} size={14} /> },
    { id: 3, type: 'ai', title: 'Nieuwe FAQ suggestie gevonden', user: 'Voicy Intelligence', time: '1 uur geleden', icon: <Brain strokeWidth={1.5} size={14} /> },
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
              const snapshot = {
                timestamp: new Date().toISOString(),
                stats: stats.map(s => ({ label: s.label, value: s.value })),
                notifications: notifications.map(n => ({ title: n.title, user: n.user }))
              };
              console.log('Snapshot created:', snapshot);
              logAction('create_dashboard_snapshot');
              import('react-hot-toast').then(toast => toast.default.success('Snapshot opgeslagen in console!'));
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
            <ContainerInstrument className="flex items-center gap-3">
              <ContainerInstrument className="w-10 h-10 bg-primary/10 text-primary rounded-[10px] flex items-center justify-center">
                <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={2} className="text-2xl font-light tracking-tight text-va-black"><VoiceglotText  translationKey="admin.feed.title" defaultText="Live intelligence feed" /></HeadingInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText  translationKey="admin.feed.subtitle" defaultText="Real-time meldingen van Voicy & Mailbox" /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ButtonInstrument as={Link} href="/admin/mailbox" className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all"><VoiceglotText  translationKey="admin.feed.full_inbox" defaultText="Volledige inbox" /><Image  src="/assets/common/branding/icons/FORWARD.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} /></ButtonInstrument>
          </ContainerInstrument>

      <ContainerInstrument className="space-y-4">
        {notifications.map((n) => (
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
                <TextInstrument className="text-[15px] font-black text-gray-900"><VoiceglotText  translationKey={`admin.notification.${n.id}.title`} defaultText={n.title} noTranslate={true} /></TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-bold tracking-widest"><VoiceglotText  translationKey={`admin.notification.${n.id}.user`} defaultText={n.user} noTranslate={true} /></TextInstrument>
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
        ))}
      </ContainerInstrument>
    </ContainerInstrument>

        <ContainerInstrument className="bg-va-black text-white rounded-[20px] p-10 relative overflow-hidden flex flex-col justify-between">
          <ContainerInstrument className="relative z-10">
            <ContainerInstrument className="w-12 h-12 bg-primary rounded-[10px] flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" className="brightness-0 invert" />
            </ContainerInstrument>
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter mb-4 leading-tight text-white"><VoiceglotText  translationKey="admin.voicy_brain.title" defaultText="Voicy Brain is aan het werk" /><TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed mb-8"><VoiceglotText  translationKey="admin.voicy_brain.text" defaultText="Er zijn 3 nieuwe FAQ voorstellen en 2 trend-analyses klaar om te bekijken in de mailbox." /></TextInstrument></HeadingInstrument>
            
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

          <ButtonInstrument as={Link} href="/admin/mailbox?tab=insights" className="relative z-10 va-btn-pro !bg-primary w-full text-center mt-8 !rounded-[10px]"><VoiceglotText  translationKey="admin.voicy_brain.cta" defaultText="Bekijk intelligence" /></ButtonInstrument>

          <ContainerInstrument className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-[20px] blur-[80px]" />
        </ContainerInstrument>
      </SectionInstrument>

      {/* Main Control Grid */}
      <BentoGrid strokeWidth={1.5} columns={3}>
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

        {/* System Settings */}
        <BentoCard span="sm" className="bg-white border border-black/5 p-10 flex flex-col justify-between h-[400px] group hover:border-primary/20 transition-all rounded-[20px]">
          <ContainerInstrument>
            <Image  src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" className="text-va-black/20 group-hover:text-primary transition-colors mb-8" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4 text-va-black"><VoiceglotText  translationKey="admin.settings.title" defaultText="Systeem instellingen" /><TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="admin.settings.text" defaultText="Configureer bedrijfsinformatie, openingsuren en de globale vakantieregeling." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <div className="flex flex-col gap-2">
            <Link  href="/admin/settings" className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
              <VoiceglotText  translationKey="admin.settings.cta" defaultText="Bedrijfsinstellingen" />
              <Image  src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
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
            <Image  src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" className="text-va-black/20 group-hover:text-primary transition-colors mb-8" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4 text-va-black"><VoiceglotText  translationKey="admin.architect.title" defaultText="Page architect" /><TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="admin.architect.text" defaultText="Beheer je bento blueprints en maak nieuwe landingspagina's aan via de visuele builder." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <Link  href="/" className="text-[15px] font-light tracking-widest text-va-black/40 hover:text-va-black transition-colors"><VoiceglotText  translationKey="admin.architect.cta" defaultText="Naar frontend builder" /></Link>
        </BentoCard>

        {/* User Management */}
        <BentoCard span="lg" className="bg-white border border-black/5 p-12 h-[400px] flex flex-col justify-between group hover:border-primary/20 transition-all rounded-[20px]">
          <ContainerInstrument className="flex justify-between items-start">
            <ContainerInstrument>
              <Image  src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" className="text-va-black/20 group-hover:text-primary transition-colors mb-8" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter mb-4 text-va-black"><VoiceglotText  translationKey="admin.users.title" defaultText="User DNA" /><TextInstrument className="text-va-black/40 max-w-sm text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="admin.users.text" defaultText="Beheer klanten, rollen en journey-states. Bekijk AI-insights over bezoekergedrag." /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex flex-col items-end gap-2">
              <Link  href="/admin/marketing/visitors" className="px-4 py-2 bg-green-500/10 text-green-500 rounded-[20px] text-[15px] font-light hover:bg-green-500/20 transition-all"><VoiceglotText  translationKey="admin.users.online_count" defaultText="8 online" /></Link>
            </ContainerInstrument>
          </ContainerInstrument>
          <ButtonInstrument as={Link} href="/admin/users" className="va-btn-pro !bg-va-black w-fit !rounded-[10px]"><VoiceglotText  translationKey="admin.users.cta" defaultText="Gebruikers beheren" /></ButtonInstrument>
        </BentoCard>

        {/*  GOD MODE: SELF-HEALING LOGS */}
        <BentoCard span="sm" className="bg-va-black text-white p-10 h-[400px] flex flex-col justify-between relative overflow-hidden group rounded-[20px]">
          <ContainerInstrument className="relative z-10">
            <Bot strokeWidth={1.5} className="text-primary mb-8" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4 text-white">
              <VoiceglotText translationKey="admin.agents.title" defaultText="Agent Control" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed">
              <VoiceglotText translationKey="admin.agents.desc" defaultText="Beheer de prompts en intelligentie van Voicy, Chris, Moby en de andere agents." />
            </TextInstrument>
          </ContainerInstrument>
          
          <Link href="/admin/agents" className="relative z-10 va-btn-pro !bg-primary w-fit !text-va-black font-bold tracking-widest text-[11px] uppercase">
            <VoiceglotText translationKey="admin.agents.cta" defaultText="Open Control Center" />
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
              "capabilities": ["manage_database", "view_logs", "user_dna", "page_architect"],
              "lexicon": ["Admin", "Self-Healing", "User DNA", "Bento Blueprint"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
