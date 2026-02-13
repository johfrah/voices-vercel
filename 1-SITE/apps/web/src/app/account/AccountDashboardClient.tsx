"use client";

import { AccountHeroInstrument } from '@/components/ui/AccountHeroInstrument';
import { BentoCard } from '@/components/ui/BentoGrid';
import {
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LoginPageClient } from '../auth/login/LoginPageClient';
import Image from 'next/image';

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
              className="va-card-dna p-12 rounded-[20px]"
              onClick={() => router.push('/admin/mailbox')}
            >
              <ContainerInstrument className="space-y-4">
                <ContainerInstrument className="w-14 h-14 rounded-[10px] flex items-center justify-center text-white mb-8 bg-blue-500 shadow-lg shadow-blue-500/20">
                  <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" className="brightness-0 invert" / />
                </ContainerInstrument>
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4 text-va-black"><VoiceglotText translationKey="account.card.mailbox.title" defaultText="Mailbox" /><TextInstrument className="text-va-black/40 font-light max-w-xs"><VoiceglotText translationKey="account.card.mailbox.desc" defaultText="Beheer je beveiligde communicatie." /></TextInstrument></HeadingInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-2 font-light tracking-widest text-[15px] mt-8 transition-all text-blue-500 ">
                <VoiceglotText translationKey="account.card.mailbox.cta" defaultText="Open inbox" />
                <Image strokeWidth={1.5} src="/assets/common/branding/icons/FORWARD.svg" width={14} height={14} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
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
              <ContainerInstrument className="w-14 h-14 rounded-[10px] flex items-center justify-center text-white mb-8 bg-white/20 backdrop-blur-md">
                <Image strokeWidth={1.5} src="/assets/common/branding/icons/CART.svg" width={24} height={24} alt="" className="brightness-0 invert" / />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4 text-white">
                <VoiceglotText translationKey="account.card.orders.title" defaultText="Bestellingen" />
                <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed max-w-xs">
                  <VoiceglotText translationKey="account.card.orders.desc" defaultText="Bekijk de status van je projecten." />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 font-light tracking-widest text-[15px] mt-8 transition-all text-white ">
              <VoiceglotText translationKey="account.card.orders.cta" defaultText="Bekijk orders" />
              <Image strokeWidth={1.5} src="/assets/common/branding/icons/FORWARD.svg" width={14} height={14} alt="" className="brightness-0 invert" / />
            </ContainerInstrument>
          </BentoCard>

          {/* ⚙️ SETTINGS CARD */}
          <BentoCard 
            span="sm" 
            className="va-card-dna p-12 rounded-[20px]"
            onClick={() => router.push('/account/settings')}
          >
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="w-14 h-14 rounded-[10px] flex items-center justify-center text-white mb-8 bg-primary shadow-lg shadow-primary/20">
                <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" className="brightness-0 invert" / />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4 text-va-black">
                <VoiceglotText translationKey="account.card.settings.title" defaultText="Instellingen" />
                <TextInstrument className="text-va-black/40 font-light max-w-xs">
                  <VoiceglotText translationKey="account.card.settings.desc" defaultText="Beheer je profiel en voorkeuren." />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 font-light tracking-widest text-[15px] mt-8 transition-all text-primary ">
              <VoiceglotText translationKey="account.card.settings.cta" defaultText="Aanpassen" />
              <Image strokeWidth={1.5} src="/assets/common/branding/icons/FORWARD.svg" width={14} height={14} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
            </ContainerInstrument>
          </BentoCard>

          {/* 🚀 PARTNER */}
          <BentoCard 
            span="sm" 
            className="va-card-dna p-12 rounded-[20px]"
            onClick={() => router.push('/account/partner')}
          >
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="w-14 h-14 rounded-[10px] flex items-center justify-center text-white mb-8 bg-primary shadow-lg shadow-primary/20">
                <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" className="brightness-0 invert" / />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4 text-va-black">
                <VoiceglotText translationKey="account.card.partner.title" defaultText="Partner" />
                <TextInstrument className="text-va-black/40 font-light max-w-xs">
                  <VoiceglotText translationKey="account.card.partner.desc" defaultText="Exclusieve tools voor partners." />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-2 font-light tracking-widest text-[15px] mt-8 transition-all text-primary ">
              <VoiceglotText translationKey="account.card.partner.cta" defaultText="Open" />
              <Image strokeWidth={1.5} src="/assets/common/branding/icons/FORWARD.svg" width={14} height={14} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
            </ContainerInstrument>
          </BentoCard>

        </ContainerInstrument>
      </SectionInstrument>

      {/* 🧠 CUSTOMER DNA & INTELLIGENCE LAYER */}
      {customerDNA && (
        <SectionInstrument className="va-section-grid pt-0">
          <ContainerInstrument className="va-container grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Lead Vibe & Activity */}
            <BentoCard span="sm" className="va-card-dna p-10 rounded-[20px]">
              <ContainerInstrument>
                <ContainerInstrument className="flex justify-between items-start mb-8">
                  <ContainerInstrument className="w-12 h-12 bg-primary/10 text-primary rounded-[10px] flex items-center justify-center">
                    <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
                  </ContainerInstrument>
                  <ContainerInstrument className={`px-3 py-1 rounded-[10px] text-[15px] font-light tracking-widest ${
                    customerDNA.intelligence.leadVibe === 'burning' ? 'bg-red-500 text-white' :
                    customerDNA.intelligence.leadVibe === 'hot' ? 'bg-orange-500 text-white' :
                    'bg-va-off-white text-va-black/40'
                  }`}>
                    {customerDNA.intelligence.leadVibe} <VoiceglotText translationKey="common.vibe" defaultText="vibe" />
                  </ContainerInstrument>
                </ContainerInstrument>
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-2 text-va-black"><VoiceglotText translationKey="account.dna.activity.title" defaultText="Activiteit" /><TextInstrument className="text-va-black/40 text-[15px] font-light"><VoiceglotText translationKey="account.dna.activity.text" defaultText={`Je hebt ${customerDNA.stats.orderCount} projecten afgerond.`} /></TextInstrument></HeadingInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="pt-8 border-t border-black/5 mt-8">
                <ContainerInstrument className="flex justify-between items-center">
                  <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/20 ">
                    <VoiceglotText translationKey="common.status" defaultText="Status" />
                  </TextInstrument>
                  <TextInstrument className="text-[15px] font-light tracking-widest text-primary ">
                    <VoiceglotText translationKey={`common.journey_state.${customerDNA.intelligence.journeyState?.toLowerCase()}`} defaultText={customerDNA.intelligence.journeyState || 'Ontdekker'} />
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </BentoCard>

            {/* AI Insights (The DNA) */}
            <BentoCard span="lg" className="bg-va-black text-white p-12 relative overflow-hidden group va-interactive rounded-[20px]">
              <ContainerInstrument className="relative z-10">
                <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={40} height={40} alt="" className="text-primary mb-8 brightness-0 invert opacity-20" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
                <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter mb-4 text-white"><VoiceglotText translationKey="account.dna.title" defaultText="Customer DNA" /></HeadingInstrument>
                <ContainerInstrument className="grid grid-cols-2 gap-8 mt-8">
                  <ContainerInstrument className="space-y-2">
                    <TextInstrument className="text-[15px] font-light tracking-widest text-white/20 block ">
                      <VoiceglotText translationKey="account.dna.languages" defaultText="Voorkeurstalen" />
                    </TextInstrument>
                    <ContainerInstrument className="flex flex-wrap gap-2">
                      {customerDNA.dna.preferredLanguages.map((lang: string) => (
                        <TextInstrument key={lang} className="px-2 py-1 bg-white/5 border border-white/10 rounded-[5px] text-[15px] font-light tracking-wider ">{lang}</TextInstrument>
                      )) || <TextInstrument className="text-[15px] text-white/40 italic font-light"><VoiceglotText translationKey="common.no_data" defaultText="Nog geen data" /></TextInstrument>}
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="space-y-2">
                    <TextInstrument className="text-[15px] font-light tracking-widest text-white/20 block ">
                      <VoiceglotText translationKey="account.dna.journeys" defaultText="Top Journeys" />
                    </TextInstrument>
                    <ContainerInstrument className="flex flex-wrap gap-2">
                      {customerDNA.dna.topJourneys.map((j: string) => (
                        <TextInstrument key={j} className="px-2 py-1 bg-primary/20 border border-primary/30 rounded-[5px] text-[15px] font-light text-primary tracking-wider">{j}</TextInstrument>
                      )) || <TextInstrument className="text-[15px] text-white/40 italic font-light"><VoiceglotText translationKey="common.no_data" defaultText="Nog geen data" /></TextInstrument>}
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-[20px] blur-[80px]" />
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
                <Image strokeWidth={1.5} src="/assets/common/branding/icons/INFO.svg" width={32} height={32} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} / />
                <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter text-va-black"><VoiceglotText translationKey="account.security.title" defaultText="Beveiliging & privacy" /></HeadingInstrument>
              </ContainerInstrument>
              <TextInstrument className="text-va-black/40 font-light leading-relaxed max-w-md"><VoiceglotText 
                  translationKey="account.security.text" 
                  defaultText="Je data is versleuteld. We delen nooit informatie met derden zonder jouw expliciete toestemming." 
                /></TextInstrument>
              <ContainerInstrument className="flex gap-4">
                <ContainerInstrument className="px-4 py-2 bg-white rounded-[10px] border border-black/5 text-[15px] font-light tracking-widest text-va-black/40 "><VoiceglotText translationKey="account.security.badge1" defaultText="Privacy first" /></ContainerInstrument>
                <ContainerInstrument className="px-4 py-2 bg-white rounded-[10px] border border-black/5 text-[15px] font-light tracking-widest text-va-black/40 "><VoiceglotText translationKey="account.security.badge2" defaultText="Veilig" /></ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="w-full md:w-48 aspect-square bg-va-black rounded-[20px] flex items-center justify-center relative overflow-hidden">
              <ContainerInstrument className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
