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
    Ghost,
    Home,
    Headphones,
    Layers,
    Mail,
    PieChart,
    Shield,
    Sparkles,
    Smartphone,
    Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { HeadingInstrument, ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface MenuItem {
  title: string;
  icon: any;
  href: string;
  color: string;
  group: 'Directie' | 'Productie' | 'Relaties' | 'Groei' | 'Systeem';
  agent?: string;
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
    "BOB: 'Visie is de basis van elke journey.'",
    "VOICY: 'De perfecte stem is een match in DNA.'",
    "CHRIS: 'Integriteit in code is integriteit in business.'"
  ],
  studio: [
    "BERNY: 'Vakmanschap wordt doorgegeven, niet gekopieerd.'",
    "LAYA: 'Esthetiek is de ziel van de Studio.'",
    "LOUIS: 'Elk frame moet spreken.'"
  ],
  academy: [
    "BERNY: 'Leren is het proces van herhaling naar meesterschap.'",
    "ANNA: 'De show is altijd aan in de Academy.'",
    "LEX: 'Waarheid in educatie is heilig.'"
  ],
  all: [
    "MARK: 'Conversie is het resultaat van een goed verteld verhaal.'",
    "MAT: 'Elke footprint vertelt een verhaal.'",
    "KELLY: 'Een slimme kassa is een blije kassa.'"
  ]
};

const menuItems: MenuItem[] = [
  //  🏢 DIRECTIE (Core Operations)
  { title: 'Dashboard', icon: Home, href: '/admin/dashboard', color: 'text-va-black', group: 'Directie', agent: 'BOB', journey: 'all' },
  { title: 'Postvak', icon: Mail, href: '/admin/mailbox', color: 'text-primary', group: 'Directie', agent: 'SALLY', badge: 3, journey: 'all' },
  { title: 'Statistieken', icon: PieChart, href: '/admin/analytics', color: 'text-blue-500', group: 'Directie', agent: 'MARK', journey: 'all' },
  { title: 'Klant Inzichten', icon: Brain, href: '/admin/insights', color: 'text-pink-500', group: 'Directie', agent: 'MARK', journey: 'all' },

  //  🎙️ PRODUCTIE (Audiopost & Orders)
  { title: 'Bestellingen', icon: ShoppingBag, href: '/admin/orders', color: 'text-emerald-600', group: 'Productie', agent: 'KELLY', badge: 5, journey: 'all' },
  { title: 'Audiopost Studio', icon: Headphones, href: '/admin/media', color: 'text-va-black/40', group: 'Productie', agent: 'LOUIS', journey: 'all' },
  { title: 'Journey Beheer', icon: Layers, href: '/admin/journeys', color: 'text-primary', group: 'Productie', agent: 'BOB', journey: 'all' },
  { title: 'Stemmenbeheer', icon: Mic, href: '/admin/voices', color: 'text-purple-500', group: 'Productie', agent: 'VOICY', journey: 'agency' },
  { title: 'Workshop Beheer', icon: Calendar, href: '/admin/workshops', color: 'text-orange-500', group: 'Productie', agent: 'BERNY', journey: 'studio' },

  //  👥 RELATIES (CRM & People)
  { title: 'Klantprofielen', icon: Users, href: '/admin/users', color: 'text-blue-400', group: 'Relaties', agent: 'MAT', journey: 'all' },
  { title: 'Artiesten', icon: Briefcase, href: '/admin/artists', color: 'text-slate-600', group: 'Relaties', agent: 'LAYA', journey: 'agency' },
  { title: 'Deelnemers', icon: Smile, href: '/admin/participants', color: 'text-green-500', group: 'Relaties', agent: 'BERNY', journey: 'studio' },
  { title: 'Feedback', icon: MessageSquare, href: '/admin/feedback', color: 'text-yellow-500', group: 'Relaties', agent: 'CHATTY', journey: 'studio' },

  //  📈 GROEI (Marketing & Academy)
  { title: 'Academy Overzicht', icon: GraduationCap, href: '/admin/academy', color: 'text-primary', group: 'Groei', agent: 'BERNY', journey: 'academy' },
  { title: 'Bezoekers', icon: Activity, href: '/admin/marketing/visitors', color: 'text-emerald-500', group: 'Groei', agent: 'MAT', journey: 'all' },
  { title: 'Marketing & UTM', icon: Target, href: '/admin/marketing/utm', color: 'text-orange-500', group: 'Groei', agent: 'MARK', journey: 'all' },
  { title: 'Artikelen', icon: FileText, href: '/admin/articles', color: 'text-blue-500', group: 'Groei', agent: 'MARK', journey: 'all' },

  //  ⚙️ SYSTEEM (Technical)
  { title: 'Instellingen', icon: Settings, href: '/admin/settings', color: 'text-va-black/40', group: 'Systeem', agent: 'CHRIS', journey: 'all' },
  { title: 'AI Instellingen', icon: Bot, href: '/admin/ai-settings', color: 'text-primary', group: 'Systeem', agent: 'ANNA', journey: 'all' },
  { title: 'Beveiliging & Locks', icon: Shield, href: '/admin/locks', color: 'text-red-500', group: 'Systeem', agent: 'WIM', journey: 'all' },
  { title: 'Vertalingen', icon: Globe, href: '/admin/voiceglot', color: 'text-blue-600', group: 'Systeem', agent: 'CHATTY', journey: 'all' },
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

  const handleImpersonate = async (user_id: string) => {
    const toastId = toast.loading('Ghost Mode wordt geactiveerd...');
    try {
      const res = await impersonate(user_id);
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
    <ContainerInstrument className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-6 bg-va-black/95 backdrop-blur-2xl animate-fade-in">
      <ContainerInstrument className="w-full max-w-5xl bg-white md:rounded-[20px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-full md:max-h-[85vh] z-[10001]">
        {/* Search Header */}
        <ContainerInstrument plain className="p-6 md:p-10 border-b border-black/5 flex items-center gap-4 md:gap-8">
          <ContainerInstrument plain className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-[10px] flex items-center justify-center text-primary">
            <SearchIcon strokeWidth={1.5} size={24} className="md:w-8 md:h-8" />
          </ContainerInstrument>
          <input 
            autoFocus
            type="text" 
            placeholder={t('admin.spotlight.placeholder', 'Wat wil je doen? (CMD + K)...')}
            className="flex-1 bg-transparent border-none text-xl md:text-3xl font-light tracking-tighter focus:ring-0 outline-none placeholder:text-va-black/10 Raleway"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            onClick={() => {
              setIsOpen(false);
              playClick('soft');
            }}
            className="w-10 h-10 md:w-14 md:h-14 rounded-[10px] bg-va-off-white flex items-center justify-center text-va-black/40 hover:text-va-black transition-all active:scale-90 touch-manipulation"
          >
            <X strokeWidth={1.5} size={20} className="md:w-7 md:h-7" />
          </button>
        </ContainerInstrument>

        {/* Results Grid */}
        <ContainerInstrument plain className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-va-off-white/30">
          {isSearching && (
            <ContainerInstrument plain className="flex items-center justify-center py-20">
              <Activity className="animate-spin text-primary" size={32} />
            </ContainerInstrument>
          )}

          {!isSearching && (search.length >= 2 || filteredItems.length > 0) ? (
            <ContainerInstrument plain className="space-y-8 md:space-y-10">
              {/* 0. QUICK ACTIONS (Bureau Hub) - Only visible when not searching */}
              {search.length === 0 && (
                <ContainerInstrument plain className="bg-primary/5 rounded-[20px] p-6 md:p-8 border border-primary/10 space-y-6">
                  <ContainerInstrument plain className="flex items-center gap-4 px-2">
                    <HeadingInstrument level={3} className="text-[11px] md:text-[13px] font-bold tracking-[0.3em] text-primary uppercase Raleway">
                      <VoiceglotText translationKey="admin.group.quick_actions" defaultText="Snel naar je Bureau" />
                    </HeadingInstrument>
                    <ContainerInstrument plain className="h-[1px] flex-1 bg-primary/10" />
                  </ContainerInstrument>
                  <ContainerInstrument plain className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { title: 'Bestellingen', icon: ShoppingBag, href: '/admin/orders', agent: 'KELLY', color: 'text-emerald-600' },
                      { title: 'Studio', icon: Headphones, href: '/admin/media', agent: 'LOUIS', color: 'text-va-black/40' },
                      { title: 'Postvak', icon: Mail, href: '/admin/mailbox', agent: 'SALLY', color: 'text-primary', badge: 3 },
                      { title: 'Klanten', icon: Users, href: '/admin/users', agent: 'MAT', color: 'text-blue-400' },
                    ].map((action, i) => (
                      <button
                        key={`quick-${i}`}
                        onClick={() => {
                          playClick('pro');
                          router.push(action.href);
                          setIsOpen(false);
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-[20px] bg-white border border-primary/5 hover:border-primary/30 hover:shadow-lg transition-all group touch-manipulation relative"
                      >
                        <ContainerInstrument plain className={cn("w-12 h-12 rounded-full bg-va-off-white flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all", action.color)}>
                          <action.icon size={24} strokeWidth={1.5} />
                        </ContainerInstrument>
                        <ContainerInstrument plain className="text-center">
                          <TextInstrument className="block text-[13px] font-bold text-va-black/80">{action.title}</TextInstrument>
                          <TextInstrument className="block text-[9px] font-bold text-va-black/20 uppercase tracking-widest">{action.agent}</TextInstrument>
                        </ContainerInstrument>
                        {action.badge && (
                          <span className="absolute top-4 right-4 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {action.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </ContainerInstrument>
                </ContainerInstrument>
              )}

              {/* 1. DATABASE RESULTS */}
              {dataResults.length > 0 && (
                <div className="bg-white rounded-[20px] p-6 md:p-8 border border-black/[0.03] shadow-sm space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4 px-2">
                    <HeadingInstrument level={3} className="text-[11px] md:text-[13px] font-light tracking-[0.3em] text-primary uppercase Raleway">
                      <VoiceglotText translationKey="admin.group.database_results" defaultText="Resultaten" />
                    </HeadingInstrument>
                    <div className="h-[1px] flex-1 bg-black/[0.03]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                        className="flex items-center gap-4 p-4 md:p-5 rounded-[15px] md:rounded-[20px] bg-va-off-white/50 border border-black/[0.02] hover:border-primary/30 hover:bg-white hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)] transition-all group text-left relative overflow-hidden touch-manipulation"
                      >
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-[10px] bg-white flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
                          {item.type === 'actor' && <Mic size={18} className="text-purple-500 group-hover:text-white" />}
                          {item.type === 'order' && <ShoppingBag size={18} className="text-blue-600 group-hover:text-white" />}
                          {item.type === 'user' && <Ghost size={18} className="text-emerald-500 group-hover:text-white" />}
                          {item.type === 'article' && <FileText size={18} className="text-orange-500 group-hover:text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-light tracking-tight text-[14px] md:text-[15px] text-va-black/80 Raleway truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] md:text-[11px] font-light tracking-widest text-va-black/30 uppercase truncate">
                            {item.type === 'user' ? `Ghost Mode • ${item.subtitle.split(' • ')[1]}` : item.subtitle}
                          </p>
                        </div>
                        <ArrowRight strokeWidth={1.5} size={14} className="text-va-black/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. MENU ITEMS - Buro Indeling */}
              {Array.from(new Set(filteredItems.map(item => item.group))).map(group => (
                <ContainerInstrument key={group} plain className="bg-white rounded-[20px] p-6 md:p-8 border border-black/[0.03] shadow-sm space-y-6 md:space-y-8">
                  <ContainerInstrument plain className="flex items-center gap-4 px-2">
                    <HeadingInstrument level={3} className="text-[11px] md:text-[13px] font-light tracking-[0.3em] text-va-black/20 uppercase Raleway">
                      <VoiceglotText translationKey={`admin.group.${group.toLowerCase()}`} defaultText={group} />
                    </HeadingInstrument>
                    <ContainerInstrument plain className="h-[1px] flex-1 bg-black/[0.03]" />
                  </ContainerInstrument>
                  <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                          className="flex items-center gap-4 p-4 md:p-5 rounded-[15px] md:rounded-[20px] bg-va-off-white/50 border border-black/[0.02] hover:border-primary/30 hover:bg-white hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)] transition-all group text-left relative overflow-hidden touch-manipulation"
                        >
                          <ContainerInstrument plain className={`w-10 h-10 md:w-12 md:h-12 rounded-[10px] bg-white flex items-center justify-center ${item.color} shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
                            {(() => {
                              const Icon = item.icon;
                              if (!Icon) return null;
                              return (typeof Icon === 'function' || (typeof Icon === 'object' && Icon.$$typeof)) 
                                ? <Icon strokeWidth={1.5} size={18} className="md:w-5 md:h-5" /> 
                                : Icon;
                            })()}
                          </ContainerInstrument>
                          <ContainerInstrument plain className="flex-1">
                            <ContainerInstrument plain className="flex items-center justify-between gap-2">
                              <h4 className="font-light tracking-tight text-[14px] md:text-[15px] text-va-black/80 Raleway truncate">
                                <VoiceglotText  translationKey={`admin.menu.${item.title.toLowerCase().replace(/\s+/g, '_')}`} defaultText={item.title} />
                              </h4>
                              {item.agent && (
                                <TextInstrument className="hidden md:inline text-[9px] font-bold tracking-[0.2em] text-va-black/20 uppercase">
                                  {item.agent}
                                </TextInstrument>
                              )}
                            </ContainerInstrument>
                          </ContainerInstrument>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight strokeWidth={1.5} size={14} className="text-va-black/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          ) : !isSearching && search.length >= 2 ? (
            <ContainerInstrument plain className="py-20 md:py-32 text-center space-y-6">
              <ContainerInstrument plain className="w-20 h-20 md:w-24 md:h-24 bg-va-off-white rounded-[20px] flex items-center justify-center mx-auto animate-pulse">
                <Brain strokeWidth={1.5} size={40} className="md:w-12 md:h-12 text-va-black/10" />
              </ContainerInstrument>
              <ContainerInstrument plain className="space-y-2">
                <HeadingInstrument level={3} className="text-xl md:text-2xl font-light tracking-tighter">
                  <VoiceglotText  translationKey="admin.spotlight.no_results" defaultText={`Geen resultaten voor "${search}"`} />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 text-[14px] md:text-[15px] font-medium">
                  <VoiceglotText  translationKey="admin.spotlight.ask_voicy" defaultText="Vraag de assistent om je te helpen." />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          ) : null}
        </ContainerInstrument>

        {/* Footer - Mobile optimized */}
        <ContainerInstrument plain className="p-6 md:p-8 bg-va-off-white border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] md:text-[15px] font-light tracking-widest text-va-black/30">
          <ContainerInstrument plain className="flex gap-8">
            <TextInstrument className="flex items-center gap-2 text-va-black/60">
              <Smartphone strokeWidth={1.5} size={12} className="text-primary" /> 
              <VoiceglotText  translationKey={`admin.instruction.${journey}`} defaultText={currentInstruction} />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="flex items-center gap-3 text-primary font-bold">
            <Shield strokeWidth={1.5} size={14} />
            {journey.toUpperCase()} BEHEER
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
