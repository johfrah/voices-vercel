"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
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
    Search as SearchIcon,
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
    Zap,
    Bot,
    Ghost
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { HeadingInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'react-hot-toast';

interface MenuItem {
  title: string;
  icon: any;
  href: string;
  color: string;
  group: 'Core' | 'Commerce' | 'Studio' | 'Academy' | 'Agency' | 'Marketing' | 'Systems' | 'Support' | 'Account' | 'Content' | 'Analytics' | 'Financieel';
  badge?: string | number;
  journey?: 'agency' | 'studio' | 'academy' | 'all';
}

interface DataResult {
  type: 'actor' | 'order' | 'user' | 'article';
  title: string;
  subtitle: string;
  href: string;
  id: number | string;
}

const journeyInstructions: Record<string, string[]> = {
  agency: [
    "Zoek op ISO-codes (nl-BE, fr-FR) om stemmen te filteren.",
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
  //  CORE & OPERATIONS
  { title: 'Command Center', icon: Zap, href: '/admin/dashboard', color: 'text-yellow-500', group: 'Core', journey: 'all' },
  { title: 'Mailbox', icon: MessageSquare, href: '/admin/mailbox', color: 'text-primary', group: 'Core', badge: 3, journey: 'all' },
  { title: 'Workshop Dashboard', icon: Calendar, href: '/admin/studio/workshops', color: 'text-purple-500', group: 'Core', journey: 'studio' },
  { title: 'Datamatch Monitor', icon: Activity, href: '/admin/datamatch', color: 'text-blue-400', group: 'Core', journey: 'all' },
  { title: 'Analytics Hub', icon: TrendingUp, href: '/admin/analytics', color: 'text-orange-500', group: 'Core', journey: 'all' },
  { title: 'Klant Inzichten', icon: Brain, href: '/admin/insights', color: 'text-pink-500', group: 'Core', journey: 'all' },

  //  CONTENT & JOURNEYS
  { title: 'Article Manager', icon: FileText, href: '/admin/articles', color: 'text-blue-500', group: 'Content', journey: 'all' },
  { title: 'Journey Orchestrator', icon: Target, href: '/admin/journeys', color: 'text-primary', group: 'Content', journey: 'all' },
  { title: 'Media Engine', icon: Video, href: '/admin/media', color: 'text-va-black/40', group: 'Content', journey: 'all' },

  //  ANALYTICS & INTELLIGENCE
  { title: 'UTM Attribution', icon: BarChart3, href: '/admin/marketing/utm', color: 'text-orange-500', group: 'Analytics', journey: 'all' },
  { title: 'Visitor Intel', icon: Activity, href: '/admin/marketing/visitors', color: 'text-emerald-500', group: 'Analytics', journey: 'all' },
  { title: 'User DNA', icon: Users, href: '/admin/users', color: 'text-blue-400', group: 'Analytics', journey: 'all' },
  { title: 'CTA AB Test', icon: MousePointer2, href: '/admin/marketing/ab-test', color: 'text-primary', group: 'Analytics', journey: 'all' },
  { title: 'Trends & SWOT', icon: TrendingUp, href: '/admin/marketing/trends', color: 'text-indigo-500', group: 'Analytics', journey: 'all' },

  //  FINANCIEEL & COMMERCE
  { title: 'Bestellingen', icon: ShoppingBag, href: '/admin/orders', color: 'text-blue-600', group: 'Financieel', badge: 5, journey: 'all' },
  { title: 'Boekhouder Review', icon: ShieldCheck, href: '/admin/approvals', color: 'text-green-600', group: 'Financieel', journey: 'all' },
  { title: 'Yuki Dashboard', icon: CreditCard, href: '/admin/finance', color: 'text-indigo-500', group: 'Financieel', journey: 'all' },
  { title: 'Tarieven', icon: Tag, href: '/admin/rates', color: 'text-emerald-500', group: 'Financieel', journey: 'all' },
  { title: 'Vouchers', icon: Star, href: '/admin/vouchers', color: 'text-yellow-600', group: 'Financieel', journey: 'all' },
  { title: 'Omzet Monitor', icon: TrendingUp, href: '/admin/finance/revenue', color: 'text-green-500', group: 'Financieel', journey: 'all' },

  //  AGENCY & VOICES
  { title: 'Voice Manager', icon: Mic, href: '/admin/voices', color: 'text-purple-500', group: 'Agency', journey: 'agency' },
  { title: 'Product Catalogus', icon: Database, href: '/admin/catalog', color: 'text-va-black', group: 'Agency', journey: 'agency' },
  { title: 'Demo Beheer', icon: Music, href: '/admin/demos', color: 'text-blue-500', group: 'Agency', journey: 'agency' },
  { title: 'Vakanties', icon: Clock, href: '/admin/vacations', color: 'text-red-400', group: 'Agency', journey: 'agency' },
  { title: 'Artist Dashboard', icon: Briefcase, href: '/admin/artists', color: 'text-slate-600', group: 'Agency', journey: 'agency' },

  //  STUDIO & WORKSHOPS
  { title: 'Workshop Manager', icon: Calendar, href: '/admin/workshops', color: 'text-primary', group: 'Studio', journey: 'studio' },
  { title: 'Deelnemers', icon: Users, href: '/admin/participants', color: 'text-green-500', group: 'Studio', journey: 'studio' },
  { title: 'Workshop Funnel', icon: Target, href: '/admin/funnel', color: 'text-orange-400', group: 'Studio', journey: 'studio' },
  { title: 'Feedback', icon: Smile, href: '/admin/feedback', color: 'text-yellow-500', group: 'Studio', journey: 'studio' },
  { title: 'Meetings', icon: Clock, href: '/admin/meetings', color: 'text-blue-400', group: 'Studio', journey: 'studio' },

  //  ACADEMY
  { title: 'Academy Dashboard', icon: GraduationCap, href: '/admin/academy', color: 'text-primary', group: 'Academy', journey: 'academy' },
  { title: 'Lessen Beheer', icon: FileText, href: '/admin/academy/lessons', color: 'text-blue-500', group: 'Academy', journey: 'academy' },

  //  SYSTEMS
  { title: 'Systeem Instellingen', icon: Settings, href: '/admin/settings', color: 'text-va-black/40', group: 'Systems', journey: 'all' },
  { title: 'Market SEO Manager', icon: Globe, href: '/admin/settings/markets', color: 'text-emerald-600', group: 'Systems', journey: 'all' },
  { title: 'Voiceglot Registry', icon: Globe, href: '/admin/voiceglot', color: 'text-blue-600', group: 'Systems', journey: 'all' },
  { title: 'OpenAI Intelligence', icon: Brain, href: '/admin/ai-settings', color: 'text-pink-400', group: 'Systems', journey: 'all' },
  { title: 'Core Locks', icon: Lock, href: '/admin/locks', color: 'text-red-500', group: 'Systems', journey: 'all' },
  { title: 'Vault', icon: Database, href: '/admin/vault', color: 'text-va-black/40', group: 'Systems', journey: 'all' },
  { title: 'AI Agent Control', icon: Bot, href: '/admin/agents', color: 'text-primary', group: 'Systems', journey: 'all' },
  { title: 'VibeCode', icon: Zap, href: '/admin/vibecode', color: 'text-primary', group: 'Systems', journey: 'all' },
  { title: 'Security', icon: ShieldCheck, href: '/admin/security', color: 'text-red-600', group: 'Systems', journey: 'all' },
];

export const SpotlightDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dataResults, setDataResults] = useState<DataResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();
  const { isAdmin, impersonate } = useAuth();
  const { t } = useTranslation();
  const { playClick, playSwell } = useSonicDNA();

  const handleImpersonate = async (userId: string) => {
    const toastId = toast.loading('Ghost Mode wordt geactiveerd...');
    try {
      const res = await impersonate(userId);
      if (res.success) {
        toast.success('Ghost Mode actief!', { id: toastId });
        setIsOpen(false);
      } else {
        toast.error(res.error || 'Ghost Mode mislukt', { id: toastId });
      }
    } catch (err) {
      toast.error('Er is een fout opgetreden', { id: toastId });
    }
  };

  const performDataSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setDataResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setDataResults(data.results || []);
      }
    } catch (e) {
      console.error('Spotlight search error:', e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      performDataSearch(debouncedSearch);
    } else {
      setDataResults([]);
    }
  }, [debouncedSearch, performDataSearch]);
  
  //  JOURNEY DETECTION
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const journey = pathname.includes('agency') ? 'agency' : 
                  pathname.includes('studio') ? 'studio' : 
                  pathname.includes('academy') ? 'academy' : 'all';

  useEffect(() => {
    if (!isAdmin) return;
    const instructions = journeyInstructions[journey] || journeyInstructions.all;
    setCurrentInstruction(instructions[Math.floor(Math.random() * instructions.length)]);
  }, [journey, isOpen, isAdmin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        //  BOB'S MANDATE: Spotlight is uitsluitend voor admins
        if (!isAdmin) return; 

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
  }, [playClick, isAdmin]);

  //  BOB'S MANDATE: Spotlight is uitsluitend voor admins en moet open staan
  if (!isAdmin || !isOpen) return null;

  const filteredItems = menuItems
    .filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.group.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // 1. Prioriteit voor de huidige journey
      if (a.journey === journey && b.journey !== journey) return -1;
      if (b.journey === journey && a.journey !== journey) return 1;

      // 2. Prioriteit voor Financieel & Analytics (als we niet in een specifieke journey zitten)
      const highPriorityGroups = ['Financieel', 'Analytics', 'Core'];
      const aIsHigh = highPriorityGroups.includes(a.group);
      const bIsHigh = highPriorityGroups.includes(b.group);
      
      if (aIsHigh && !bIsHigh) return -1;
      if (bIsHigh && !aIsHigh) return 1;

      // 3. 'all' journey als fallback
      if (a.journey === 'all' && b.journey !== 'all') return -1;
      if (b.journey === 'all' && a.journey !== 'all') return 1;

      return 0;
    });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-va-black/95 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-5xl bg-white rounded-[20px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] z-[10001]">
        {/* Search Header */}
        <div className="p-10 border-b border-black/5 flex items-center gap-8">
          <div className="w-12 h-12 bg-primary/10 rounded-[10px] flex items-center justify-center text-primary">
            <SearchIcon strokeWidth={1.5} size={32} />
          </div>
          <input 
            autoFocus
            type="text" 
            placeholder={t('admin.spotlight.placeholder', 'Wat wil je beheren? (CMD + K)...')}
            className="flex-1 bg-transparent border-none text-3xl font-light tracking-tighter focus:ring-0 outline-none placeholder:text-va-black/10 Raleway"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            onClick={() => {
              setIsOpen(false);
              playClick('soft');
            }}
            className="w-14 h-14 rounded-[10px] bg-va-off-white flex items-center justify-center text-va-black/40 hover:text-va-black transition-all active:scale-90 touch-manipulation"
          >
            <X strokeWidth={1.5} size={28} />
          </button>
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-va-off-white/30">
          {isSearching && (
            <div className="flex items-center justify-center py-20">
              <Activity className="animate-spin text-primary" size={32} />
            </div>
          )}

          {!isSearching && (search.length >= 2 || filteredItems.length > 0) ? (
            <div className="space-y-10">
              {/* 1. DATABASE RESULTS (Spotlight 2.0) */}
              {dataResults.length > 0 && (
                <div className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-sm space-y-8">
                  <div className="flex items-center gap-4 px-2">
                    <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.3em] text-primary uppercase Raleway">
                      <VoiceglotText translationKey="admin.group.database_results" defaultText="Database Results" />
                    </HeadingInstrument>
                    <div className="h-[1px] flex-1 bg-black/[0.03]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dataResults.map((item, i) => (
                      <button
                        key={`data-${i}`}
                        onMouseEnter={() => playSwell()}
                        onClick={() => {
                          playClick('pro');
                          if (item.type === 'user') {
                            handleImpersonate(item.id as string);
                          } else {
                            router.push(item.href);
                            setIsOpen(false);
                          }
                        }}
                        className="flex items-center gap-4 p-5 rounded-[20px] bg-va-off-white/50 border border-black/[0.02] hover:border-primary/30 hover:bg-white hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)] transition-all group text-left relative overflow-hidden touch-manipulation"
                      >
                        <div className={`w-12 h-12 rounded-[10px] bg-white flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
                          {item.type === 'actor' && <Mic size={20} className="text-purple-500 group-hover:text-white" />}
                          {item.type === 'order' && <ShoppingBag size={20} className="text-blue-600 group-hover:text-white" />}
                          {item.type === 'user' && <Ghost size={20} className="text-emerald-500 group-hover:text-white" />}
                          {item.type === 'article' && <FileText size={20} className="text-orange-500 group-hover:text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-light tracking-tight text-[15px] text-va-black/80 Raleway truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] font-light tracking-widest text-va-black/30 uppercase truncate">
                            {item.type === 'user' ? `Ghost Mode • ${item.subtitle.split(' • ')[1]}` : item.subtitle}
                          </p>
                        </div>
                        {item.type === 'user' ? (
                          <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-bold uppercase tracking-widest">Inloggen</span>
                            <ArrowRight strokeWidth={1.5} size={14} className="group-hover:translate-x-1 transition-all" />
                          </div>
                        ) : (
                          <ArrowRight strokeWidth={1.5} size={14} className="text-va-black/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. MENU ITEMS */}
              {Array.from(new Set(filteredItems.map(item => item.group))).map(group => (
                <div key={group} className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-sm space-y-8">
                  <div className="flex items-center gap-4 px-2">
                    <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.3em] text-va-black/20 uppercase Raleway">
                      <VoiceglotText translationKey={`admin.group.${group.toLowerCase()}`} defaultText={group} />
                    </HeadingInstrument>
                    <div className="h-[1px] flex-1 bg-black/[0.03]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems
                      .filter(item => item.group === group)
                      .map((item, i) => (
                        <button
                          key={i}
                          onMouseEnter={() => playSwell()}
                          onClick={() => {
                            playClick('pro');
                            router.push(item.href);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-4 p-5 rounded-[20px] bg-va-off-white/50 border border-black/[0.02] hover:border-primary/30 hover:bg-white hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)] transition-all group text-left relative overflow-hidden touch-manipulation"
                        >
                          <div className={`w-12 h-12 rounded-[10px] bg-white flex items-center justify-center ${item.color} shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
                            {(() => {
                              const Icon = item.icon;
                              if (!Icon) return null;
                              return (typeof Icon === 'function' || (typeof Icon === 'object' && Icon.$$typeof)) 
                                ? <Icon strokeWidth={1.5} size={20} /> 
                                : Icon;
                            })()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-light tracking-tight text-[15px] text-va-black/80 Raleway">
                              <VoiceglotText  translationKey={`admin.menu.${item.title.toLowerCase().replace(/\s+/g, '_')}`} defaultText={item.title} />
                            </h4>
                          </div>
                          <ArrowRight strokeWidth={1.5} size={14} className="text-va-black/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : !isSearching && search.length >= 2 ? (
            <div className="py-32 text-center space-y-6">
              <div className="w-24 h-24 bg-va-off-white rounded-[20px] flex items-center justify-center mx-auto animate-pulse">
                <Brain strokeWidth={1.5} size={48} className="text-va-black/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-light tracking-tighter">
                  <VoiceglotText  translationKey="admin.spotlight.no_results" defaultText={`Geen resultaten voor "${search}"`} />
                </h3>
                <p className="text-va-black/40 text-[15px] font-medium">
                  <VoiceglotText  translationKey="admin.spotlight.ask_voicy" defaultText="Vraag Voicy om deze module voor je te bouwen of te vinden." />
                </p>
              </div>
            </div>
          ) : !isSearching && (
            <div className="space-y-10">
               {Array.from(new Set(filteredItems.map(item => item.group))).map(group => (
                 <div key={group} className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-sm space-y-8">
                    <div className="flex items-center gap-4 px-2">
                      <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.3em] text-va-black/20 uppercase Raleway">
                        <VoiceglotText translationKey={`admin.group.${group.toLowerCase()}`} defaultText={group} />
                      </HeadingInstrument>
                      <div className="h-[1px] flex-1 bg-black/[0.03]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredItems
                        .filter(item => item.group === group)
                        .map((item, i) => (
                          <button
                            key={i}
                            onMouseEnter={() => playSwell()}
                            onClick={() => {
                              playClick('pro');
                              router.push(item.href);
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-4 p-5 rounded-[20px] bg-va-off-white/50 border border-black/[0.02] hover:border-primary/30 hover:bg-white hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)] transition-all group text-left relative overflow-hidden touch-manipulation"
                          >
                            <div className={`w-12 h-12 rounded-[10px] bg-white flex items-center justify-center ${item.color} shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
                              {(() => {
                                const Icon = item.icon;
                                if (!Icon) return null;
                                return (typeof Icon === 'function' || (typeof Icon === 'object' && Icon.$$typeof)) 
                                  ? <Icon strokeWidth={1.5} size={20} /> 
                                  : Icon;
                              })()}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-light tracking-tight text-[15px] text-va-black/80 Raleway">
                                <VoiceglotText  translationKey={`admin.menu.${item.title.toLowerCase().replace(/\s+/g, '_')}`} defaultText={item.title} />
                              </h4>
                            </div>
                            <ArrowRight strokeWidth={1.5} size={14} className="text-va-black/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-va-off-white border-t border-black/5 flex justify-between items-center text-[15px] font-light tracking-widest text-va-black/30">
          <div className="flex gap-8">
            <span className="flex items-center gap-2 text-va-black/60">
              <MousePointer2 strokeWidth={1.5} size={12} className="text-primary" /> 
              <VoiceglotText  translationKey={`admin.instruction.${journey}`} defaultText={currentInstruction} />
            </span>
          </div>
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck strokeWidth={1.5} size={14} />
            {journey} mode
          </div>
        </div>
      </div>
    </div>
  );
};
