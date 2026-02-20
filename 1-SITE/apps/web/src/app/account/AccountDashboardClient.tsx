"use client";

import { AccountHeroInstrument } from '@/components/ui/AccountHeroInstrument';
import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import {
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument,
    ButtonInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LoginPageClient } from './login/LoginPageClient';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { 
  Zap, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Layout, 
  TrendingUp, 
  Users, 
  Briefcase, 
  BarChart3,
  MessageCircle,
  ArrowRight,
  Plus,
  ExternalLink,
  Shield,
  Bell,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function AccountDashboardClient() {
  const { user, isAdmin, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customerDNA, setCustomerDNA] = useState<any>(null);
  const [isPartner, setIsPartner] = useState(true); // In productie checken we dit via user roles
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (searchParams.get('auth') === 'success') {
      toast.success('Succesvol ingelogd! Welkom terug.', {
        id: 'auth-success',
        duration: 5000,
        icon: <CheckCircle2 className="text-green-500" size={20} />,
      });
      // Verwijder de query param uit de URL zonder de pagina te herladen
      const newUrl = window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetch(`/api/intelligence/customer-360?email=${user.email}`)
        .then(res => res.json())
        .then(data => setCustomerDNA(data))
        .catch(err => console.error('DNA Fetch Error:', err));

      // Fetch notifications
      fetch('/api/account/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data.notifications || []))
        .catch(err => console.error('Notifications Fetch Error:', err));
    }
  }, [isAuthenticated, user]);

  if (isLoading) return <LoadingScreenInstrument />;

  if (!isAuthenticated) {
    return (
      <SectionInstrument>
        <Suspense fallback={<LoadingScreenInstrument />}>
          <LoginPageClient strokeWidth={1.5} />
        </Suspense>
      </SectionInstrument>
    );
  }

  // Mock stats voor de winkelier-ervaring
  const performanceStats = [
    { label: 'Bezoekers (24u)', value: '124', icon: <Users size={20} />, trend: '+12%' },
    { label: 'Demo Plays', value: '42', icon: <Zap size={20} />, trend: '+5' },
    { label: 'Interesse', value: 'Burning', icon: <TrendingUp size={20} />, trend: '🔥' },
    { label: 'Omzet (30d)', value: '€ 1.840', icon: <BarChart3 size={20} />, trend: '+15%' },
  ];

  // Mock notifications voor de demo
  const mockNotifications = [
    { id: 1, type: 'order', title: 'Nieuwe Opdracht', message: 'Je hebt een nieuwe boeking voor een online video.', time: '2u geleden', unread: true },
    { id: 2, type: 'chat', title: 'Chat Interactie', message: 'Een bezoeker op johfrah.be stelt een vraag over tarieven.', time: '4u geleden', unread: true },
    { id: 3, type: 'lead', title: 'Warme Lead', message: 'Iemand heeft je demo 3x beluisterd in de laatste 10 minuten.', time: '5u geleden', unread: false },
  ];

  const activeNotifications = notifications.length > 0 ? notifications : mockNotifications;

  return (
    <PageWrapperInstrument className="va-home-container">
      {/*  ACCOUNT HERO */}
      <AccountHeroInstrument 
        userEmail={user?.email || 'user@voices.be'} 
        onLogout={logout}
        isAdmin={isAdmin}
      />

      <SectionInstrument className="va-section-grid">
        <ContainerInstrument className="va-container">
          
          {/*  Winkelier Overzicht Header (Alleen voor Partners/Stemacteurs) */}
          {isPartner && (
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-primary/10 rounded-full text-primary text-[11px] font-bold tracking-widest uppercase border border-primary/10">
                  Mijn Winkel Overzicht
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-medium text-va-black/40 tracking-widest uppercase">Live Status</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {performanceStats.map((stat, i) => (
                  <div key={i} className="bg-white border border-black/[0.03] p-6 rounded-[24px] shadow-aura-sm hover:shadow-aura transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-va-off-white rounded-xl flex items-center justify-center text-va-black/20 group-hover:text-primary transition-colors">
                        {stat.icon}
                      </div>
                      <span className={`text-[12px] font-bold px-2 py-1 rounded-lg ${stat.label === 'Interesse' ? 'bg-primary text-white' : 'bg-green-500/10 text-green-600'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[13px] font-medium text-va-black/30 tracking-tight">{stat.label}</div>
                      <div className="text-2xl font-light tracking-tighter">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <BentoGrid columns={4} gap={6}>
            
            {/*  MIJN WINKEL (PORTFOLIO) CARD */}
            {isPartner && (
              <BentoCard 
                span="lg" 
                className="bg-va-black text-white p-10 rounded-[32px] relative overflow-hidden group va-interactive"
                onClick={() => window.open('https://johfrah.be', '_blank')}
              >
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
                      <Layout strokeWidth={1.5} size={24} />
                    </div>
                    <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter mb-4">
                      Mijn Winkel <span className="text-primary/60 text-2xl ml-2 font-light">johfrah.be</span>
                    </HeadingInstrument>
                    <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed max-w-md">
                      Beheer je eigen etalage. Pas teksten aan, voeg nieuwe demo&apos;s toe en bekijk hoe je winkel eruit ziet voor klanten.
                    </TextInstrument>
                  </div>
                  <div className="flex items-center gap-4 mt-8">
                    <ButtonInstrument className="va-btn-pro !bg-white !text-va-black !rounded-xl text-[13px]">
                      Winkel Openen
                    </ButtonInstrument>
                    <Link href="/account/settings" onClick={(e) => e.stopPropagation()}>
                      <ButtonInstrument variant="outline" className="border-white/10 text-white hover:bg-white/5 !rounded-xl text-[13px]">
                        Tarieven Beheren
                      </ButtonInstrument>
                    </Link>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-1000" />
              </BentoCard>
            )}

            {/*  NOTIFICATIE CENTRUM CARD */}
            {isPartner && (
              <BentoCard 
                span="lg" 
                className="bg-white p-10 rounded-[32px] border border-black/[0.03] shadow-aura-sm flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-va-off-white rounded-xl flex items-center justify-center text-va-black">
                      <Bell strokeWidth={1.5} size={20} />
                    </div>
                    <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">Meldingen</HeadingInstrument>
                  </div>
                  {activeNotifications.some(n => n.unread) && (
                    <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-full animate-pulse">
                      NIEUW
                    </span>
                  )}
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                  {activeNotifications.map((notification) => (
                    <div key={notification.id} className={`p-4 rounded-2xl border transition-all ${notification.unread ? 'bg-primary/5 border-primary/10' : 'bg-va-off-white/50 border-black/5'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <TextInstrument className="text-[14px] font-medium">{notification.title}</TextInstrument>
                        <TextInstrument className="text-[11px] opacity-30">{notification.time}</TextInstrument>
                      </div>
                      <TextInstrument className="text-[13px] text-va-black/60 leading-relaxed">
                        {notification.message}
                      </TextInstrument>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-black/5 flex justify-center">
                  <ButtonInstrument variant="plain" className="text-[13px] font-bold tracking-widest text-va-black/20 hover:text-primary transition-all uppercase">
                    Alle Meldingen Bekijken
                  </ButtonInstrument>
                </div>
              </BentoCard>
            )}

            {/*  BESTELLINGEN CARD */}
            <BentoCard 
              span="sm"
              className="bg-va-off-white p-10 rounded-[32px] border border-black/[0.03] flex flex-col justify-between va-interactive group"
              onClick={() => router.push('/account/orders')}
            >
              <div>
                <div className="w-12 h-12 bg-va-black rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <ShoppingBag strokeWidth={1.5} size={24} />
                </div>
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-2">
                  Bestellingen
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 text-[14px] font-light leading-relaxed">
                  Volg je lopende projecten en download je facturen.
                </TextInstrument>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-bold tracking-widest text-va-black/20 group-hover:text-primary transition-all uppercase mt-6">
                Overzicht <ArrowRight size={14} />
              </div>
            </BentoCard>

            {/*  INSTELLINGEN CARD */}
            <BentoCard 
              span="sm" 
              className="bg-va-off-white p-10 rounded-[32px] border border-black/[0.03] flex flex-col justify-between va-interactive group"
              onClick={() => router.push('/account/settings')}
            >
              <div>
                <div className="w-12 h-12 bg-va-off-white border border-black/5 rounded-2xl flex items-center justify-center text-va-black/40 mb-6 group-hover:rotate-90 transition-transform duration-500">
                  <SettingsIcon strokeWidth={1.5} size={24} />
                </div>
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-2">
                  Profiel
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 text-[14px] font-light leading-relaxed">
                  Pas je persoonlijke gegevens en artistieke specs aan.
                </TextInstrument>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-bold tracking-widest text-va-black/20 group-hover:text-primary transition-all uppercase mt-6">
                Beheren <ArrowRight size={14} />
              </div>
            </BentoCard>

            {/*  MAILBOX & LIVE CHAT CARD (Voor Admins/Partners) */}
            {(isAdmin || isPartner) && (
              <BentoCard 
                span="sm" 
                className="bg-va-off-white p-10 rounded-[32px] border border-black/[0.03] flex flex-col justify-between va-interactive group"
                onClick={() => router.push(isAdmin ? '/admin/mailbox' : '/account/mailbox')}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white group-hover:animate-bounce">
                      <MessageCircle strokeWidth={1.5} size={24} />
                    </div>
                    <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      Live
                    </div>
                  </div>
                  <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-2">
                    Mailbox & Chat
                  </HeadingInstrument>
                  <TextInstrument className="text-va-black/40 text-[14px] font-light leading-relaxed">
                    Beheer je berichten en neem live chats over van de assistent.
                  </TextInstrument>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-bold tracking-widest text-va-black/20 group-hover:text-blue-500 transition-all uppercase mt-6">
                  Open Inbox <ArrowRight size={14} />
                </div>
              </BentoCard>
            )}

            {/*  CUSTOMER DNA CARD */}
            {customerDNA && (
              <BentoCard span="lg" className="bg-white p-10 rounded-[32px] shadow-aura border border-black/[0.02] flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">Jouw Klant DNA</HeadingInstrument>
                  </div>
                  <TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed">
                    Op basis van je laatste {customerDNA.stats.orderCount} projecten zien we dat je vooral gevraagd wordt voor <span className="text-va-black font-medium">{customerDNA.dna.topJourneys[0]}</span> in het <span className="text-va-black font-medium">{customerDNA.dna.preferredLanguages[0]}</span>.
                  </TextInstrument>
                </div>
                <div className="w-full lg:w-48 aspect-square bg-va-black rounded-2xl flex flex-col items-center justify-center text-white p-6 text-center">
                  <div className="text-4xl font-light tracking-tighter text-primary mb-1">{customerDNA.intelligence.leadVibe}</div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">Status</div>
                </div>
              </BentoCard>
            )}

            {/*  SECURITY CARD */}
            <BentoCard span="sm" className="bg-va-off-white p-10 rounded-[32px] border border-black/[0.03] flex flex-col justify-between group">
              <div>
                <Shield strokeWidth={1.5} size={24} className="text-va-black/20 mb-6" />
                <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-2">Veiligheid</HeadingInstrument>
                <TextInstrument className="text-va-black/40 text-[13px] font-light">
                  Je data is versleuteld en veilig volgens de 2026 standaarden.
                </TextInstrument>
              </div>
              <div className="mt-6 px-3 py-1 bg-white rounded-lg border border-black/5 text-[10px] font-bold tracking-widest text-va-black/20 uppercase w-fit">
                Privacy First
              </div>
            </BentoCard>

          </BentoGrid>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
