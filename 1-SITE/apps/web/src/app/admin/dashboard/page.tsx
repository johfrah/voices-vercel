"use client";

import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument,
  InputInstrument,
  LabelInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import {
    Activity,
    Database,
    Layout,
    Mic,
    Settings,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Users,
    Mail,
    Bell,
    ArrowRight,
    Brain,
    Clock,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [recentHeals, setRecentHeals] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/godmode/heals')
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecentHeals(data.heals);
      })
      .catch(err => console.error('Failed to fetch heals', err));
  }, []);

  const stats = [
    { label: <VoiceglotText translationKey="admin.stats.mails" defaultText="Nieuwe Mails" />, value: '12', icon: <Mail size={20} />, trend: 'Inbox', color: 'text-blue-500', href: '/account/mailbox' },
    { label: <VoiceglotText translationKey="admin.stats.approvals" defaultText="Approval Queue" />, value: '5', icon: <Bell size={20} />, trend: 'Actie nodig', color: 'text-orange-500', href: '/admin/approvals' },
    { label: <VoiceglotText translationKey="admin.stats.voices" defaultText="Actieve Stemmen" />, value: '142', icon: <Mic size={20} />, trend: '+12%', color: 'text-va-black/40' },
    { label: <VoiceglotText translationKey="admin.stats.ai_status" defaultText="AI Sync Status" />, value: 'Live', icon: <Activity size={20} />, trend: '100%', color: 'text-green-500' },
  ];

  const notifications = [
    { id: 1, type: 'mail', title: 'Nieuwe offerte-aanvraag', user: 'Greenpeace', time: '5 min geleden', icon: <Mail size={14} /> },
    { id: 2, type: 'approval', title: 'Factuur van Christina Van Geel', user: 'Wacht op goedkeuring', time: '12 min geleden', icon: <Bell size={14} /> },
    { id: 3, type: 'ai', title: 'Nieuwe FAQ suggestie gevonden', user: 'Voicy Intelligence', time: '1 uur geleden', icon: <Brain size={14} /> },
  ];

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-2">
          <ContainerInstrument className="flex items-center gap-2 text-primary">
            <ShieldCheck size={16} />
            <TextInstrument as="span" className="text-[10px] font-black uppercase tracking-[0.2em]">
              <VoiceglotText translationKey="admin.badge" defaultText="Voices Cockpit" />
            </TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter uppercase">
            <VoiceglotText translationKey="admin.title" defaultText="Beheer-dashboard" />
          </HeadingInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument className="va-btn-nav">
            <VoiceglotText translationKey="admin.cta.snapshot" defaultText="Snapshot Maken" />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Quick Stats */}
      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <ContainerInstrument key={i} className="bg-white border border-black/5 p-8 rounded-[32px] shadow-sm hover:shadow-aura transition-all group relative overflow-hidden">
            {stat.href && <Link href={stat.href} className="absolute inset-0 z-10" />}
            <ContainerInstrument className="flex justify-between items-start mb-6">
              <ContainerInstrument className={`w-12 h-12 bg-va-off-white rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </ContainerInstrument>
              <TextInstrument as="span" className="text-[10px] font-black text-va-black/40 bg-va-black/5 px-2 py-1 rounded-lg">
                {stat.trend}
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="space-y-1">
              <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/30">
                {stat.label}
              </TextInstrument>
              <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter">{stat.value}</HeadingInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>

      {/* Live Feed & Notifications */}
      <SectionInstrument className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ContainerInstrument className="lg:col-span-2 bg-white border border-black/5 rounded-[40px] p-10 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Activity size={20} />
              </div>
          <div>
            <HeadingInstrument level={2} className="text-2xl font-black uppercase tracking-tight">
              <VoiceglotText translationKey="admin.feed.title" defaultText="Live Intelligence Feed" />
            </HeadingInstrument>
            <TextInstrument className="text-xs text-va-black/40 font-medium">
              <VoiceglotText translationKey="admin.feed.subtitle" defaultText="Real-time meldingen van Voicy & Mailbox" />
            </TextInstrument>
          </div>
        </div>
        <Link href="/account/mailbox" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all">
          <VoiceglotText translationKey="admin.feed.full_inbox" defaultText="Volledige Inbox" /> <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-center justify-between p-5 bg-va-off-white rounded-[24px] border border-black/[0.02] hover:border-primary/20 transition-all group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                n.type === 'mail' ? 'bg-blue-500/10 text-blue-500' : 
                n.type === 'approval' ? 'bg-orange-500/10 text-orange-500' : 
                'bg-purple-500/10 text-purple-500'
              }`}>
                {n.icon}
              </div>
              <div>
                <TextInstrument className="text-sm font-black text-gray-900">
                  <VoiceglotText translationKey={`admin.notification.${n.id}.title`} defaultText={n.title} noTranslate={true} />
                </TextInstrument>
                <TextInstrument className="text-[11px] text-va-black/40 font-bold uppercase tracking-widest">
                  <VoiceglotText translationKey={`admin.notification.${n.id}.user`} defaultText={n.user} noTranslate={true} />
                </TextInstrument>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-va-black/20">
                <Clock size={12} />
                <span className="text-[10px] font-bold">{n.time}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <ArrowRight size={14} className="text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ContainerInstrument>

        <ContainerInstrument className="bg-va-black text-white rounded-[40px] p-10 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
              <Brain size={24} className="text-va-black" />
            </div>
            <HeadingInstrument level={2} className="text-3xl font-black uppercase tracking-tighter mb-4 leading-tight">
              <VoiceglotText translationKey="admin.voicy_brain.title" defaultText="Voicy Brain is aan het werk" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 text-sm font-medium leading-relaxed mb-8">
              <VoiceglotText translationKey="admin.voicy_brain.text" defaultText="Er zijn 3 nieuwe FAQ voorstellen en 2 trend-analyses klaar om te bekijken in de mailbox." />
            </TextInstrument>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <TextInstrument className="va-text-xs text-white/60">
                  <VoiceglotText translationKey="admin.voicy_brain.syncing" defaultText="Syncing Gmail..." />
                </TextInstrument>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <TextInstrument className="va-text-xs text-white/60">
                  <VoiceglotText translationKey="admin.voicy_brain.analyzing" defaultText="Analyzing Trends" />
                </TextInstrument>
              </div>
            </div>
          </div>

          <Link href="/account/mailbox?tab=insights" className="relative z-10 va-btn-pro !bg-primary w-full text-center mt-8">
            <VoiceglotText translationKey="admin.voicy_brain.cta" defaultText="Bekijk Intelligence" />
          </Link>

          <ContainerInstrument className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />
        </ContainerInstrument>
      </SectionInstrument>

      {/* Main Control Grid */}
      <BentoGrid columns={3}>
        {/* Database Management */}
        <BentoCard span="lg" className="bg-va-black text-white p-12 h-[400px] flex flex-col justify-between relative overflow-hidden group">
          <ContainerInstrument className="relative z-10">
            <Database className="text-primary mb-8" size={40} />
            <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tighter mb-4">
              <VoiceglotText translationKey="admin.database.title" defaultText="Database Manager" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 max-w-sm text-sm font-medium leading-relaxed">
              <VoiceglotText translationKey="admin.database.text" defaultText="Beheer alle records (Stemmen, Reviews, Workshops) direct in de cloud. 100% visuele interface." />
            </TextInstrument>
          </ContainerInstrument>
          <Link href="/admin/database" className="relative z-10 va-btn-pro !bg-primary w-fit">
            <VoiceglotText translationKey="admin.database.cta" defaultText="Open Database" />
          </Link>
          <ContainerInstrument className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-1000" />
        </BentoCard>

        {/* System Settings */}
        <BentoCard span="sm" className="bg-white border border-black/5 p-10 flex flex-col justify-between h-[400px] group hover:border-primary/20 transition-all">
          <ContainerInstrument>
            <Settings className="text-va-black/20 group-hover:text-primary transition-colors mb-8" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-black uppercase tracking-tight mb-4">
              <VoiceglotText translationKey="admin.settings.title" defaultText="Systeem Instellingen" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 text-xs font-medium leading-relaxed">
              <VoiceglotText translationKey="admin.settings.text" defaultText="Configureer bedrijfsinformatie, openingsuren en de globale vakantieregeling." />
            </TextInstrument>
          </ContainerInstrument>
          <Link href="/admin/settings" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
            <VoiceglotText translationKey="admin.settings.cta" defaultText="Beheer Instellingen" /> <Sparkles size={12} />
          </Link>
        </BentoCard>

        {/* Page Builder Quick Access */}
        <BentoCard span="sm" className="bg-va-off-white p-10 flex flex-col justify-between h-[400px] border border-black/5 group hover:border-primary/20 transition-all">
          <ContainerInstrument>
            <Layout className="text-va-black/20 group-hover:text-primary transition-colors mb-8" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-black uppercase tracking-tight mb-4">
              <VoiceglotText translationKey="admin.architect.title" defaultText="Page Architect" />
            </HeadingInstrument>
              <TextInstrument className="text-va-black/40 text-xs font-medium leading-relaxed">
                <VoiceglotText translationKey="admin.architect.text" defaultText="Beheer je Bento Blueprints en maak nieuwe landingspagina's aan via de visuele builder." />
              </TextInstrument>
          </ContainerInstrument>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-va-black/40 hover:text-va-black transition-colors">
            <VoiceglotText translationKey="admin.architect.cta" defaultText="Naar Frontend Builder" />
          </Link>
        </BentoCard>

        {/* User Management */}
        <BentoCard span="lg" className="bg-white border border-black/5 p-12 h-[400px] flex flex-col justify-between group hover:border-primary/20 transition-all">
          <ContainerInstrument className="flex justify-between items-start">
            <ContainerInstrument>
              <Users className="text-va-black/20 group-hover:text-primary transition-colors mb-8" size={32} />
              <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tighter mb-4">
                <VoiceglotText translationKey="admin.users.title" defaultText="User DNA" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/40 max-w-sm text-sm font-medium leading-relaxed">
                <VoiceglotText translationKey="admin.users.text" defaultText="Beheer klanten, rollen en journey-states. Bekijk AI-insights over bezoekergedrag." />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex flex-col items-end gap-2">
              <Link href="/admin/marketing/visitors" className="px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase hover:bg-green-500/20 transition-all">
                <VoiceglotText translationKey="admin.users.online_count" defaultText="8 Online" />
              </Link>
            </ContainerInstrument>
          </ContainerInstrument>
          <ButtonInstrument className="va-btn-pro !bg-va-black w-fit">
            <VoiceglotText translationKey="admin.users.cta" defaultText="Gebruikers Beheren" />
          </ButtonInstrument>
        </BentoCard>

        {/* 🩹 GOD MODE: SELF-HEALING LOGS */}
        <BentoCard span="sm" className="bg-va-black text-white p-10 h-[400px] flex flex-col justify-between relative overflow-hidden group">
          <ContainerInstrument className="relative z-10">
            <Zap className="text-primary mb-8" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-black uppercase tracking-tight mb-6">
              <VoiceglotText translationKey="admin.self_healing.title" defaultText="Self-Healing Logs" />
            </HeadingInstrument>
            
            <div className="space-y-4">
              {recentHeals.length > 0 ? recentHeals.map((heal, i) => (
                <div key={heal.id} className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                  <span className="text-primary">{heal.source.split('-')[0]}</span>
                  <span className="truncate flex-1">{heal.message}</span>
                </div>
              )) : (
                <TextInstrument className="va-text-xs text-white/20">
                  <VoiceglotText translationKey="admin.self_healing.empty" defaultText="Geen recente herstelacties." />
                </TextInstrument>
              )}
            </div>
          </ContainerInstrument>
          
          <Link href="/admin/security" className="relative z-10 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
            <VoiceglotText translationKey="admin.self_healing.view_all" defaultText="Bekijk alle logs" />
          </Link>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-[40px]" />
        </BentoCard>
      </BentoGrid>

      {/* 🧠 LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminDashboard",
            "name": "Voices Cockpit",
            "description": "Centraal beheer-dashboard voor het Voices platform.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "system_management",
              "capabilities": ["manage_database", "view_logs", "user_dna", "page_architect"],
              "lexicon": ["Cockpit", "Self-Healing", "User DNA", "Bento Blueprint"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
