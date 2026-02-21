"use client";

import { useAuth } from '@/contexts/AuthContext';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { 
  Zap, 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Briefcase, 
  BarChart3,
  ExternalLink,
  Plus,
  ArrowRight,
  Clock
} from 'lucide-react';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';

export default function PartnerDashboardClient() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreenInstrument />;

    const stats = [
      { label: <VoiceglotText translationKey="account.partner.stats.active_projects" defaultText="Actieve Projecten" />, value: '12', icon: <Briefcase strokeWidth={1.5} size={20} />, trend: '+2' },
      { label: <VoiceglotText translationKey="account.partner.stats.on_time" defaultText="On-time Delivery" />, value: '98%', icon: <Zap strokeWidth={1.5} size={20} />, trend: 'Stable' },
      { label: <VoiceglotText translationKey="account.partner.stats.delivery_time" defaultText="Gem. Levertijd" />, value: '24u', icon: <Clock strokeWidth={1.5} size={20} />, trend: '-2u' },
      { label: <VoiceglotText translationKey="account.partner.stats.revenue" defaultText="Inkomsten (30d)" />, value: ' 2.450', icon: <BarChart3 strokeWidth={1.5} size={20} />, trend: '+15%' },
    ];

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-16">
        <Link  
          href="/account" 
          className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft strokeWidth={1.5} size={12} /> 
          <VoiceglotText  translationKey="account.back_to_dashboard" defaultText="Terug naar Dashboard" />
        </Link>
        <ContainerInstrument className="space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/10">
            <Zap strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText  translationKey="account.partner.badge" defaultText="Partner" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
            <VoiceglotText  translationKey="account.partner.title_part1" defaultText="Partner " />
            <TextInstrument as="span" className="text-primary font-light">
              <VoiceglotText  translationKey="account.partner.title_part2" defaultText="Overzicht" />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light"><VoiceglotText  translationKey="account.partner.subtitle" defaultText="Beheer je samenwerkingen en bekijk je resultaten." /></TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Stats Grid */}
      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {stats.map((stat, i) => (
          <ContainerInstrument key={i} className="bg-white border border-black/5 p-8 rounded-[32px] shadow-sm hover:shadow-aura transition-all group">
            <ContainerInstrument className="flex justify-between items-start mb-6">
              <ContainerInstrument className="w-12 h-12 bg-va-off-white rounded-2xl flex items-center justify-center text-va-black/40 group-hover:text-primary transition-colors">
                {stat.icon}
              </ContainerInstrument>
              <TextInstrument as="span" className="text-[15px] font-light text-green-500 bg-green-500/10 px-2 py-1 rounded-[20px]">
                {stat.trend}
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="space-y-1">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30">{stat.label}</TextInstrument>
              <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter">{stat.value}</HeadingInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>

      <BentoGrid strokeWidth={1.5} columns={3}>
        {/* Campaign Manager */}
        <BentoCard span="lg" className="bg-va-black text-white p-12 h-[400px] flex flex-col justify-between relative overflow-hidden group">
          <ContainerInstrument className="relative z-10">
            <Briefcase strokeWidth={1.5} className="text-primary mb-8" size={40} />
            <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter mb-4">
              <VoiceglotText  translationKey="account.partner.campaigns.title" defaultText="Campagne Beheer" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 max-w-sm text-[15px] font-light leading-relaxed">
              <VoiceglotText  
                translationKey="account.partner.campaigns.text" 
                defaultText="Bekijk en beheer al je actieve campagnes en voice-over projecten op één plek." 
              />
            </TextInstrument>
          </ContainerInstrument>
          <ButtonInstrument className="relative z-10 va-btn-pro !bg-primary w-fit flex items-center gap-2"><VoiceglotText  translationKey="account.partner.campaigns.cta" defaultText="Nieuwe Campagne" /><Plus strokeWidth={1.5} size={16} /></ButtonInstrument>
          <ContainerInstrument className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-1000" />
        </BentoCard>

        {/* Affiliate Links */}
        <BentoCard span="sm" className="bg-white border border-black/5 p-10 flex flex-col justify-between h-[400px] group hover:border-primary/20 transition-all">
          <ContainerInstrument>
            <ExternalLink strokeWidth={1.5} className="text-va-black/20 group-hover:text-primary transition-colors mb-8" size={32} />
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-4">
              <VoiceglotText  translationKey="account.partner.links.title" defaultText="Affiliate Links" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed">
              <VoiceglotText  
                translationKey="account.partner.links.text" 
                defaultText="Genereer unieke links en verdien commissie op elke succesvolle casting." 
              />
            </TextInstrument>
          </ContainerInstrument>
          <ButtonInstrument className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 group-hover:gap-4 transition-all"><VoiceglotText  translationKey="account.partner.links.cta" defaultText="Links Genereren" /><ArrowRight strokeWidth={1.5} size={12} /></ButtonInstrument>
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
