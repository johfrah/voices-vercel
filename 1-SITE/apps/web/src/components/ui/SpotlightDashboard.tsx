"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import {
    Activity,
    ArrowRight,
    BarChart3,
    Brain,
    Briefcase,
    Calendar,
    Clock,
    Command,
    CreditCard,
    Database,
    FileText,
    Globe,
    GraduationCap,
    Lock,
    MessageSquare,
    Mic,
    MousePointer2,
    Music,
    Search,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Smile,
    Star,
    Tag,
    Target,
    TrendingUp,
    Users,
    Video,
    X,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface MenuItem {
  title: string;
  icon: any;
  href: string;
  color: string;
  group: 'Core' | 'Commerce' | 'Studio' | 'Academy' | 'Agency' | 'Marketing' | 'Systems' | 'Support' | 'Account';
  badge?: string | number;
  journey?: 'agency' | 'studio' | 'academy' | 'all';
}

const journeyInstructions: Record<string, string[]> = {
  agency: [
    "Zoek op 'Vlaams' of 'Nederlands' om stemmen te filteren.",
    "Klik op een stem om demo's te beluisteren en direct te boeken.",
    "Gebruik Voicy Chat voor een persoonlijke casting op maat."
  ],
  studio: [
    "Selecteer een workshop in de kalender om je in te schrijven.",
    "Upload je eigen opnames in de recorder voor professionele feedback.",
    "Beheer je boekingen en deelnemers via het Studio Dashboard."
  ],
  academy: [
    "Start een les en volg je voortgang in het Academy Dashboard.",
    "Stuur je oefeningen in voor persoonlijke coaching door onze experts.",
    "Bekijk video-lessen en download oefenmateriaal."
  ],
  all: [
    "Gebruik CMD + K om razendsnel tussen alle modules te navigeren.",
    "Klik op het Voicy icoon rechtsonder voor directe AI-ondersteuning.",
    "Beheer je account, bestellingen en instellingen via het menu."
  ]
};

const menuItems: MenuItem[] = [
  // 🚀 CORE & OPERATIONS
  { title: 'Command Center', icon: Zap, href: '/admin/dashboard', color: 'text-yellow-500', group: 'Core' },
  { title: 'Datamatch Monitor', icon: Activity, href: '/admin/datamatch', color: 'text-blue-400', group: 'Core' },
  { title: 'Voicy Chat', icon: MessageSquare, href: '/admin/chat', color: 'text-primary', group: 'Core', badge: 3 },
  { title: 'Analytics Hub', icon: TrendingUp, href: '/admin/analytics', color: 'text-orange-500', group: 'Core' },
  { title: 'Klant Inzichten', icon: Brain, href: '/admin/insights', color: 'text-pink-500', group: 'Core' },

  // 🛒 COMMERCE
  { title: 'Bestellingen', icon: ShoppingBag, href: '/admin/orders', color: 'text-blue-600', group: 'Commerce', badge: 5 },
  { title: 'Boekhouder Review', icon: ShieldCheck, href: '/admin/orders?status=review', color: 'text-green-600', group: 'Commerce' },
  { title: 'Yuki Dashboard', icon: CreditCard, href: '/admin/yuki', color: 'text-indigo-500', group: 'Commerce' },
  { title: 'Tarieven', icon: Tag, href: '/admin/rates', color: 'text-emerald-500', group: 'Commerce' },
  { title: 'Vouchers', icon: Star, href: '/admin/vouchers', color: 'text-yellow-600', group: 'Commerce' },

  // 🎙️ AGENCY & VOICES
  { title: 'Voice Manager', icon: Mic, href: '/admin/voices', color: 'text-purple-500', group: 'Agency' },
  { title: 'Product Catalogus', icon: Database, href: '/admin/catalog', color: 'text-va-black', group: 'Agency' },
  { title: 'Demo Beheer', icon: Music, href: '/admin/demos', color: 'text-blue-500', group: 'Agency' },
  { title: 'Vakanties', icon: Clock, href: '/admin/vacations', color: 'text-red-400', group: 'Agency' },
  { title: 'Artist Cockpit', icon: Briefcase, href: '/admin/artists', color: 'text-slate-600', group: 'Agency' },

  // 🎧 STUDIO & WORKSHOPS
  { title: 'Workshop Manager', icon: Calendar, href: '/admin/workshops', color: 'text-primary', group: 'Studio' },
  { title: 'Deelnemers', icon: Users, href: '/admin/participants', color: 'text-green-500', group: 'Studio' },
  { title: 'Workshop Funnel', icon: Target, href: '/admin/funnel', color: 'text-orange-400', group: 'Studio' },
  { title: 'Feedback', icon: Smile, href: '/admin/feedback', color: 'text-yellow-500', group: 'Studio' },
  { title: 'Meetings', icon: Clock, href: '/admin/meetings', color: 'text-blue-400', group: 'Studio' },

  // 🎓 ACADEMY
  { title: 'Academy Dashboard', icon: GraduationCap, href: '/admin/academy', color: 'text-primary', group: 'Academy' },
  { title: 'Lessen Beheer', icon: FileText, href: '/admin/academy/lessons', color: 'text-blue-500', group: 'Academy' },

  // 📈 MARKETING
  { title: 'UTM Attribution', icon: BarChart3, href: '/admin/marketing/utm', color: 'text-orange-500', group: 'Marketing' },
  { title: 'Visitor Intel', icon: Activity, href: '/admin/marketing/visitors', color: 'text-emerald-500', group: 'Marketing' },
  { title: 'CTA AB Test', icon: MousePointer2, href: '/admin/marketing/ab-test', color: 'text-primary', group: 'Marketing' },

  // ⚙️ SYSTEMS
  { title: 'Systeem Instellingen', icon: Settings, href: '/admin/settings', color: 'text-va-black/40', group: 'Systems' },
  { title: 'Voiceglot Registry', icon: Globe, href: '/admin/voiceglot', color: 'text-blue-600', group: 'Systems' },
  { title: 'OpenAI Intelligence', icon: Brain, href: '/admin/ai-settings', color: 'text-pink-400', group: 'Systems' },
  { title: 'Core Locks', icon: Lock, href: '/admin/locks', color: 'text-red-500', group: 'Systems' },
  { title: 'Media Engine', icon: Video, href: '/admin/media', color: 'text-va-black/40', group: 'Systems' },
];

export const SpotlightDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState('');
  const router = useRouter();
  const { t } = useTranslation();
  const { playClick, playSwell } = useSonicDNA();
  
  // 🎯 JOURNEY DETECTION
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const journey = pathname.includes('agency') ? 'agency' : 
                  pathname.includes('studio') ? 'studio' : 
                  pathname.includes('academy') ? 'academy' : 'all';

  useEffect(() => {
    const instructions = journeyInstructions[journey] || journeyInstructions.all;
    setCurrentInstruction(instructions[Math.floor(Math.random() * instructions.length)]);
  }, [journey, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        playClick('pop');
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playClick]);

  if (!isOpen) return (
    <button 
      onClick={() => {
        setIsOpen(true);
        playClick('pop');
      }}
      className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-va-black text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-[100] group"
    >
      <Command strokeWidth={1.5} size={24} className="group-hover:rotate-12 transition-transform" />
    </button>
  );

  const filteredItems = menuItems.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.group.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ContainerInstrument className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-va-black/60 backdrop-blur-2xl animate-fade-in">
      <ContainerInstrument className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
        {/* Search Header */}
        <ContainerInstrument className="p-6 md:p-10 border-b border-black/5 flex items-center gap-4 md:gap-8">
          <ContainerInstrument className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary">
            <Search strokeWidth={1.5} size={24} md:size={32} />
          </ContainerInstrument>
          <input 
            autoFocus
            type="text" 
            placeholder={t('admin.spotlight.placeholder', 'Wat wil je beheren? (CMD + K)...')}
            className="flex-1 bg-transparent border-none text-xl md:text-3xl font-black tracking-tighter focus:ring-0 placeholder:text-va-black/10 "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ButtonInstrument 
            onClick={() => {
              setIsOpen(false);
              playClick('soft');
            }}
            className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-va-off-white flex items-center justify-center text-va-black/40 hover:text-va-black transition-all active:scale-90 p-0"
          >
            <X strokeWidth={1.5} size={20} md:size={28} />
          </ButtonInstrument>
        </ContainerInstrument>

        {/* Results Grid */}
        <ContainerInstrument className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredItems.map((item, i) => (
              <ButtonInstrument
                key={i}
                onMouseEnter={() => playSwell()}
                onClick={() => {
                  playClick('pro');
                  router.push(item.href);
                  setIsOpen(false);
                }}
                className="flex items-center gap-4 md:gap-5 p-4 md:p-6 rounded-[24px] md:rounded-[32px] bg-va-off-white border border-black/5 hover:border-primary/30 hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all group text-left relative overflow-hidden"
              >
                <ContainerInstrument className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white flex items-center justify-center ${item.color} shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0`}>
                  <item.icon size={20} md:size={24} />
                </ContainerInstrument>
                <ContainerInstrument className="flex-1 min-w-0">
                  <HeadingInstrument level={4} className="font-light tracking-tight text-[15px] md:text-[15px] text-va-black/80 truncate">
                    <VoiceglotText  translationKey={`admin.menu.${item.title.toLowerCase().replace(/\s+/g, '_')}`} defaultText={item.title} />
                  </HeadingInstrument>
                  <TextInstrument className="text-[15px] md:text-[15px] font-bold text-va-black/20 tracking-[0.2em] mt-1 md:mt-1.5 ">
                    <VoiceglotText  translationKey={`admin.group.${item.group.toLowerCase()}`} defaultText={item.group} />
                  </TextInstrument>
                </ContainerInstrument>
                {item.badge && (
                  <TextInstrument as="span" className="absolute top-3 right-3 md:top-4 md:right-4 bg-primary text-white text-[15px] md:text-[15px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-full shadow-lg shadow-primary/20">
                    {item.badge}
                  </TextInstrument>
                )}
                <ArrowRight strokeWidth={1.5} size={14} md:size={16} className="text-va-black/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </ButtonInstrument>
            ))}
          </ContainerInstrument>

          {filteredItems.length === 0 && (
            <ContainerInstrument className="py-24 md:py-32 text-center space-y-4 md:space-y-6">
              <ContainerInstrument className="w-20 h-20 md:w-24 md:h-24 bg-va-off-white rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Brain strokeWidth={1.5} size={40} md:size={48} className="text-va-black/10" />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2">
                <HeadingInstrument level={3} className="text-xl md:text-2xl font-light tracking-tighter">
                  <VoiceglotText  translationKey="admin.spotlight.no_results" defaultText={`Geen resultaten voor "${search}"`} />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 text-[15px] md:text-[15px] font-medium">
                  <VoiceglotText  translationKey="admin.spotlight.ask_voicy" defaultText="Vraag Voicy om deze module voor je te bouwen of te vinden." />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>

        {/* Footer */}
        <ContainerInstrument className="p-6 md:p-8 bg-va-off-white border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 text-[15px] md:text-[15px] font-black tracking-widest text-va-black/30">
          <ContainerInstrument className="flex gap-4 md:gap-8">
            <TextInstrument as="span" className="flex items-center gap-2 text-va-black/60 font-light">
              <MousePointer2 strokeWidth={1.5} size={12} className="text-primary" /> 
              <VoiceglotText  translationKey={`admin.instruction.${journey}`} defaultText={currentInstruction} />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="flex items-center gap-3 text-primary">
            <ShieldCheck strokeWidth={1.5} size={14} />
            {journey.toUpperCase()} MODE
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
