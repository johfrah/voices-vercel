"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { MarketManager } from '@config/market-manager';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Bell, Brain, Lock, Mail, Unlock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TextInstrument } from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';

import { LanguageSwitcher } from './LanguageSwitcher';

/**
 * GLOBAL NAVIGATION
 * Focus: Menselijkheid & Duidelijkheid (Bijbel-compliant)
 */

export default function GlobalNav() {
  const pathname = usePathname();
  const { playClick, playSwell } = useSonicDNA();
  const { isEditMode, toggleEditMode, canEdit } = useEditMode();
  const auth = useAuth();
  const isAdmin = auth.isAdmin;
  const market = MarketManager.getCurrentMarket(); 
  const showVoicy = market.has_voicy || market.market_code === 'BE' || market.market_code === 'NLNL' || market.market_code === 'JOHFRAI';
  const isPortfolio = market.market_code === 'JOHFRAH';
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [links, setLinks] = useState<any[]>([
    { name: 'Mijn Stem', href: '/#demos', key: 'nav.my_voice' },
    { name: 'Werkwijze', href: '/#how-it-works', key: 'nav.how_it_works' },
    { name: 'Tarieven', href: '/tarieven', key: 'nav.pricing' },
    { name: 'Contact', href: '/contact', key: 'nav.contact' }
  ]);

  useEffect(() => {
    if (market.market_code === 'ADEMING') {
      setLinks([
        { name: 'Meditaties', href: '/ademing', key: 'nav.meditations' },
        { name: 'Mijn Rust', href: '/account/ademing', key: 'nav.my_rest' },
        { name: 'Voices', href: 'https://voices.be', key: 'nav.voices_back' }
      ]);
    } else if (market.market_code === 'JOHFRAH') {
      setLinks([
        { name: 'Mijn Stem', href: '/#demos', key: 'nav.my_voice' },
        { name: 'Host & Reporter', href: '/host', key: 'nav.host' },
        { name: 'Over Johfrah', href: '/over-mij', key: 'nav.about' },
        { name: 'Contact', href: '/contact', key: 'nav.contact' }
      ]);
    }
  }, [market.market_code]);

  const notifications = [
    { id: 1, title: 'Nieuwe offerte-aanvraag', user: 'Greenpeace', type: 'mail', time: '5m' },
    { id: 2, title: 'Factuur Christina', user: 'Wacht op goedkeuring', type: 'approval', time: '12m' },
    { id: 3, title: 'Nieuwe FAQ gevonden', user: 'Voicy Brain', type: 'ai', time: '1u' },
  ];

  useEffect(() => {
    setMounted(true);
    async function fetchNav() {
      try {
        const response = await fetch('/api/config/nav/main_nav');
        if (!response.ok) {
          console.warn('Nav API returned non-ok status, using defaults');
          return;
        }
        const data = await response.json();
        
        // 🛡️ CHRIS-FIX: Overschrijf alleen als we data hebben EN we niet in een specifieke journey zitten die eigen links heeft
        if (data && data.items && data.items.length > 0 && market.market_code !== 'ADEMING' && market.market_code !== 'JOHFRAH') {
          setLinks(data.items);
        } else {
          console.log('🛡️ Keeping journey-specific or default links');
        }
      } catch (error) {
        console.error('Failed to fetch nav, using defaults:', error);
      }
    }
    fetchNav();
  }, []);

  if (!mounted) return null;

  // Verberg navigatie in de mailbox
  if (pathname.includes('/account/mailbox')) {
    return null;
  }

  // Navigatie is altijd zichtbaar voor alle gebruikers op alle pagina's

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-8 py-6 flex justify-between items-center bg-white/50 backdrop-blur-xl border-b border-black/5 golden-curve">
      <Link 
        href="/" 
        className="flex items-center gap-3 group"
        onClick={() => playClick('soft')}
        onMouseEnter={() => playSwell()}
      >
        {market.market_code === 'JOHFRAH' || (typeof window !== 'undefined' && window.location.host.includes('johfrah.be')) ? (
          <span className="text-xl font-black tracking-tighter uppercase transition-transform duration-500 group-hover:scale-105 text-va-black whitespace-nowrap">
            JOHFRAH LEFEBVRE
          </span>
        ) : (
          <VoiceglotImage 
            src={market.logo_url} 
            alt={market.name} 
            width={142}
            height={56}
            journey="common"
            category="branding"
            className="h-14 w-auto transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </Link>

      <div className="hidden md:flex gap-8">
        {links.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            onClick={() => playClick('soft')}
            onMouseEnter={() => playSwell()}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              pathname.startsWith(link.href) ? 'text-primary' : 'text-va-black/30 hover:text-va-black'
            }`}
          >
            <VoiceglotText translationKey={link.key || `nav.${(link.name || '').toLowerCase()}`} defaultText={link.name || ''} />
          </Link>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => {
                playClick('soft');
                setShowNotifications(!showNotifications);
              }}
              className={`p-3 rounded-full transition-all relative ${showNotifications ? 'bg-va-black text-white' : 'bg-va-black/5 text-va-black hover:bg-va-black/10'}`}
            >
              <Bell size={16} />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-4 w-80 bg-white rounded-[32px] shadow-2xl border border-black/5 overflow-hidden z-[100]"
                >
                  <div className="p-6 border-b border-black/5 flex justify-between items-center">
                    <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/40">
                      <VoiceglotText translationKey="nav.notifications.title" defaultText="Meldingencentrum" />
                    </TextInstrument>
                    <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-full uppercase">
                      3 <VoiceglotText translationKey="common.new" defaultText="Nieuw" />
                    </span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((n) => (
                      <Link 
                        key={n.id} 
                        href={n.type === 'mail' ? '/account/mailbox' : n.type === 'approval' ? '/admin/approvals' : '/admin/dashboard'}
                        onClick={() => {
                          playClick('soft');
                          setShowNotifications(false);
                          if (n.type === 'ai') {
                            window.dispatchEvent(new CustomEvent('voicy:suggestion', {
                              detail: {
                                title: n.title,
                                content: `Ik heb een nieuwe FAQ suggestie voor je gevonden: "${n.title}". Wil je dat ik deze toevoeg aan de kennisbank?`,
                                type: 'ai'
                              }
                            }));
                          }
                        }}
                        className="block p-4 hover:bg-va-off-white transition-colors border-b border-black/[0.02] cursor-pointer group"
                      >
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            n.type === 'mail' ? 'bg-blue-500/10 text-blue-500' : 
                            n.type === 'approval' ? 'bg-orange-500/10 text-orange-500' : 
                            'bg-purple-500/10 text-purple-500'
                          }`}>
                            {n.type === 'mail' ? <Mail size={16} /> : n.type === 'approval' ? <Activity size={16} /> : <Brain size={16} />}
                          </div>
                          <div className="min-w-0">
                            <TextInstrument className="text-xs font-black text-gray-900 truncate">
                              <VoiceglotText translationKey={`admin.notification.${n.id}.title`} defaultText={n.title} noTranslate={true} />
                            </TextInstrument>
                            <TextInstrument className="text-[10px] text-va-black/40 font-bold uppercase tracking-tight">
                              <VoiceglotText translationKey={`admin.notification.${n.id}.user`} defaultText={n.user} noTranslate={true} />
                            </TextInstrument>
                            <TextInstrument className="text-[9px] text-va-black/20 mt-1 font-bold">{n.time}</TextInstrument>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    href="/admin/dashboard" 
                    onClick={() => setShowNotifications(false)}
                    className="block p-4 bg-va-black text-white text-center text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                  >
                    <VoiceglotText translationKey="nav.notifications.view_all" defaultText="Bekijk alle meldingen" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {canEdit && (
          <button
            onClick={() => {
              playClick('pro');
              toggleEditMode();
            }}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-500 ${
              isEditMode 
                ? 'bg-primary text-white shadow-primary/20' 
                : 'bg-va-black/5 text-va-black hover:bg-va-black/10'
            }`}
          >
            {isEditMode ? <Unlock size={12} /> : <Lock size={12} />}
            {isEditMode ? (
              <VoiceglotText translationKey="nav.edit_mode_on" defaultText="Edit Mode ON" />
            ) : (
              <VoiceglotText translationKey="nav.edit_mode" defaultText="Edit Mode" />
            )}
          </button>
        )}
        <LanguageSwitcher />
        {!isPortfolio && (
          <Link 
            href={isAdmin ? "/admin/dashboard" : "/auth/login"}
            onClick={() => playClick('pro')}
            onMouseEnter={() => playSwell()}
            className="va-btn-nav"
          >
            {isAdmin ? (
              <VoiceglotText translationKey="nav.dashboard" defaultText="Dashboard" />
            ) : (
              <VoiceglotText translationKey="nav.login" defaultText="Inloggen" />
            )}
          </Link>
        )}
      </div>
    </nav>
  );
}
