"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LoginPageClient } from '../auth/login/LoginPageClient';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument,
  TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Star, 
  Activity,
  Brain,
  TrendingUp
} from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { AccountHeroInstrument } from '@/components/ui/AccountHeroInstrument';

export default function AccountDashboardClient() {
  const { user, isAdmin, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [customerDNA, setCustomerDNA] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetch(`/api/intelligence/customer-360?email=${user.email}`)
        .then(res => res.json())
        .then(data => setCustomerDNA(data))
        .catch(err => console.error('DNA Fetch Error:', err));
    }
  }, [isAuthenticated, user]);

  if (isLoading) return <LoadingScreenInstrument />;

  if (!isAuthenticated) {
    return (
      <SectionInstrument>
        <Suspense fallback={<LoadingScreenInstrument />}>
          <LoginPageClient />
        </Suspense>
      </SectionInstrument>
    );
  }

  return (
    <PageWrapperInstrument className="va-home-container">
      {/* 🚀 ACCOUNT HERO */}
      <AccountHeroInstrument 
        userEmail={user?.email || 'user@voices.be'} 
        onLogout={logout}
      />

      <SectionInstrument className="va-section-grid">
        <ContainerInstrument className="va-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 📬 MAILBOX CARD */}
          {isAdmin && (
            <BentoCard 
              span="sm" 
              className="va-card-dna p-12"
              onClick={() => router.push('/account/mailbox')}
            >
              <ContainerInstrument className="space-y-4">
                <ContainerInstrument className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 bg-blue-500 shadow-lg shadow-blue-500/20">
                  <Mail size={24} className="text-white" />
                </ContainerInstrument>
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4">
                  <VoiceglotText translationKey="account.card.mailbox.title" defaultText="Mailbox" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 font-light max-w-xs">
                  <VoiceglotText translationKey="account.card.mailbox.desc" defaultText="Beheer je beveiligde communicatie." />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-2 font-light tracking-widest text-[15px] mt-8 transition-all text-blue-500 ">
                <VoiceglotText translationKey="account.card.mailbox.cta" defaultText="Open Inbox" /> <ArrowRight size={14} />
              </ContainerInstrument>
            </BentoCard>
          )}

          {/* 🛒 ORDERS CARD */}
          <BentoCard 
            span="sm"
            className="bg-va-dark-soft text-white p-12 rounded-[20px] border border-black/[0.03] flex flex-col justify-between va-interactive"
            onClick={() => router.push('/account/orders')}
          >
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 bg-white/20 backdrop-blur-md">
                <ShoppingBag size={24} className="text-white" />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4 text-white">
                <VoiceglotText translationKey="account.card.orders.title" defaultText="Bestellingen" />
              </HeadingInstrument>
              <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed max-w-xs">
                <VoiceglotText translationKey="account.card.orders.desc" defaultText="Bekijk de status van je projecten." />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 font-light tracking-widest text-[15px] mt-8 transition-all text-white ">
              <VoiceglotText translationKey="account.card.orders.cta" defaultText="Bekijk Orders" /> <ArrowRight size={14} />
            </ContainerInstrument>
          </BentoCard>

          {/* ⚙️ SETTINGS CARD */}
          <BentoCard 
            span="sm" 
            className="va-card-dna p-12"
            onClick={() => router.push('/account/settings')}
          >
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 bg-primary shadow-lg shadow-primary/20">
                <Settings size={24} className="text-white" />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4">
                <VoiceglotText translationKey="account.card.settings.title" defaultText="Instellingen" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/40 font-light max-w-xs">
                <VoiceglotText translationKey="account.card.settings.desc" defaultText="Beheer je profiel en voorkeuren." />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 font-light tracking-widest text-[15px] mt-8 transition-all text-primary ">
              <VoiceglotText translationKey="account.card.settings.cta" defaultText="Aanpassen" /> <ArrowRight size={14} />
            </ContainerInstrument>
          </BentoCard>

          {/* 🚀 PARTNER */}
          <BentoCard 
            span="sm" 
            className="va-card-dna p-12"
            onClick={() => router.push('/account/partner')}
          >
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 bg-primary shadow-lg shadow-primary/20">
                <Zap size={24} className="text-white" />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4">
                <VoiceglotText translationKey="account.card.partner.title" defaultText="Partner" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/40 font-light max-w-xs">
                <VoiceglotText translationKey="account.card.partner.desc" defaultText="Exclusieve tools voor partners." />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 font-light tracking-widest text-[15px] mt-8 transition-all text-primary ">
              <VoiceglotText translationKey="account.card.partner.cta" defaultText="Open" /> <ArrowRight size={14} />
            </ContainerInstrument>
          </BentoCard>

        </ContainerInstrument>
      </SectionInstrument>

      {/* 🧠 CUSTOMER DNA & INTELLIGENCE LAYER */}
      {customerDNA && (
        <SectionInstrument className="va-section-grid pt-0">
          <ContainerInstrument className="va-container grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Lead Vibe & Activity */}
            <BentoCard span="sm" className="va-card-dna p-10">
              <ContainerInstrument>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                  <ContainerInstrument className={`px-3 py-1 rounded-full text-[15px] font-light uppercase tracking-widest ${
                    customerDNA.intelligence.leadVibe === 'burning' ? 'bg-red-500 text-white' :
                    customerDNA.intelligence.leadVibe === 'hot' ? 'bg-orange-500 text-white' :
                    'bg-va-off-white text-va-black/40'
                  }`}>
                    {customerDNA.intelligence.leadVibe} <VoiceglotText translationKey="common.vibe" defaultText="vibe" />
                  </ContainerInstrument>
                </div>
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-2">
                  <VoiceglotText translationKey="account.dna.activity.title" defaultText="Activiteit" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 text-[15px] font-light">
                  <VoiceglotText translationKey="account.dna.activity.text" defaultText={`Je hebt ${customerDNA.stats.orderCount} projecten afgerond.`} />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="pt-8 border-t border-black/5 mt-8">
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-light tracking-widest text-va-black/20 ">
                    <VoiceglotText translationKey="common.status" defaultText="Status" />
                  </span>
                  <span className="text-[15px] font-light tracking-widest text-primary ">
                    <VoiceglotText translationKey={`common.journey_state.${customerDNA.intelligence.journeyState?.toLowerCase()}`} defaultText={customerDNA.intelligence.journeyState || 'Ontdekker'} />
                  </span>
                </div>
              </ContainerInstrument>
            </BentoCard>

            {/* AI Insights (The DNA) */}
            <BentoCard span="lg" className="bg-va-black text-white p-12 relative overflow-hidden group va-interactive">
              <ContainerInstrument className="relative z-10">
                <Brain className="text-primary mb-8" size={40} />
                <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter mb-4">
                  <VoiceglotText translationKey="account.dna.title" defaultText="Customer DNA" />
                </HeadingInstrument>
                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div className="space-y-2">
                    <span className="text-[15px] font-light tracking-widest text-white/20 block ">
                      <VoiceglotText translationKey="account.dna.languages" defaultText="Voorkeurstalen" />
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {customerDNA.dna.preferredLanguages.map((lang: string) => (
                        <span key={lang} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[15px] font-light tracking-wider ">{lang}</span>
                      )) || <span className="text-[15px] text-white/40 italic font-light"><VoiceglotText translationKey="common.no_data" defaultText="Nog geen data" /></span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[15px] font-light tracking-widest text-white/20 block ">
                      <VoiceglotText translationKey="account.dna.journeys" defaultText="Top Journeys" />
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {customerDNA.dna.topJourneys.map((j: string) => (
                        <span key={j} className="px-2 py-1 bg-primary/20 border border-primary/30 rounded text-[15px] font-light text-primary tracking-wider">{j}</span>
                      )) || <span className="text-[15px] text-white/40 italic font-light"><VoiceglotText translationKey="common.no_data" defaultText="Nog geen data" /></span>}
                    </div>
                  </div>
                </div>
              </ContainerInstrument>
              <ContainerInstrument className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />
            </BentoCard>

          </ContainerInstrument>
        </SectionInstrument>
      )}

      {/* 🔐 SECURITY & TRUST LAYER */}
      <SectionInstrument className="va-section-grid pt-0">
        <ContainerInstrument className="va-container">
          <ContainerInstrument className="flex flex-col md:flex-row gap-12">
            <ContainerInstrument className="flex-1 space-y-6">
              <ContainerInstrument className="flex items-center gap-3 text-primary">
                <ShieldCheck className="text-primary" size={32} />
                <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter">
                  <VoiceglotText translationKey="account.security.title" defaultText="Beveiliging & Privacy" />
                </HeadingInstrument>
              </ContainerInstrument>
              <TextInstrument className="text-va-black/40 font-light leading-relaxed max-w-md">
                <VoiceglotText 
                  translationKey="account.security.text" 
                  defaultText="Je data is versleuteld. We delen nooit informatie met derden zonder jouw expliciete toestemming." 
                />
              </TextInstrument>
              <ContainerInstrument className="flex gap-4">
                <ContainerInstrument className="px-4 py-2 bg-white rounded-xl border border-black/5 text-[15px] font-light tracking-widest text-va-black/40 ">
                  <VoiceglotText translationKey="account.security.badge1" defaultText="Privacy First" />
                </ContainerInstrument>
                <ContainerInstrument className="px-4 py-2 bg-white rounded-xl border border-black/5 text-[15px] font-light tracking-widest text-va-black/40 ">
                  <VoiceglotText translationKey="account.security.badge2" defaultText="Veilig" />
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="w-full md:w-48 aspect-square bg-va-black rounded-3xl flex items-center justify-center relative overflow-hidden">
              <ContainerInstrument className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
