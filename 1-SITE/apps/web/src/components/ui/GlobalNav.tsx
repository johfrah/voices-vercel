"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { MarketManager } from '@config/market-manager';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bell,
    Building2,
    ChevronRight,
    Globe,
    Heart,
    LayoutDashboard,
    LogOut,
    Mail,
    Mic2,
    Monitor,
    Phone,
    Radio,
    Settings,
    ShoppingBag,
    User
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { LanguageSwitcher } from './LanguageSwitcher';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';

/**
 * 💎 HEADER ICON INSTRUMENT
 * Focus: High-End Interactie & Duidelijkheid
 */
const HeaderIcon = ({ 
  src, 
  icon: Icon,
  alt, 
  badge, 
  children,
  onClick,
  href,
  isActive,
  badgeText
}: { 
  src?: string, 
  icon?: any,
  alt: string, 
  badge?: number, 
  children?: React.ReactNode,
  onClick?: () => void,
  href?: string,
  isActive?: boolean,
  badgeText?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<any>(null);
  const { playClick, playSwell } = useSonicDNA();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
    playSwell();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  const content = (
    <ContainerInstrument 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ContainerInstrument 
        onClick={() => {
          playClick('soft');
          if (onClick) onClick();
        }}
        className={`p-2 rounded-xl transition-all duration-500 cursor-pointer group/icon flex items-center justify-center min-w-[40px] h-[40px] ${
          isActive ? 'bg-primary/10 text-primary' : 'hover:bg-va-black/5 text-va-black'
        }`}
      >
        {src ? (
          <VoiceglotImage 
            src={src} 
            alt={alt} 
            width={24}
            height={24}
            className="w-6 h-6 transition-transform duration-500 group-hover/icon:scale-110" 
            style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
          />
        ) : Icon ? (
          <Icon size={22} className="text-primary transition-transform duration-500 group-hover/icon:scale-110" />
        ) : null}

        {(badge !== undefined && badge > 0) || badgeText ? (
          <TextInstrument 
            as={motion.span}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[11px] font-light rounded-full flex items-center justify-center shadow-lg border-2 border-white leading-none z-10"
          >
            {badgeText || badge}
          </TextInstrument>
        ) : null}
      </ContainerInstrument>

            <AnimatePresence>
              {isOpen && children && (
                <ContainerInstrument
                  as={motion.div}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full right-0 mt-2 w-[400px] bg-white rounded-[24px] shadow-aura border border-black/5 overflow-hidden z-50"
                >
                  <ContainerInstrument className="p-2">
                    {children}
                  </ContainerInstrument>
                </ContainerInstrument>
              )}
            </AnimatePresence>
    </ContainerInstrument>
  );

  if (href && !children) {
    return <ButtonInstrument as={Link} href={href}>{content}</ButtonInstrument>;
  }

  return content;
};

/**
 * 💎 DROPDOWN ITEM
 */
const DropdownItem = ({ 
  icon: Icon, 
  label, 
  href, 
  onClick, 
  variant = 'default',
  badge 
}: { 
  icon: any, 
  label: string | React.ReactNode, 
  href?: string, 
  onClick?: () => void, 
  variant?: 'default' | 'danger' | 'primary',
  badge?: string | number
}) => {
  const { playClick } = useSonicDNA();
  const router = useRouter();

  const handleClick = () => {
    playClick(variant === 'primary' ? 'pro' : 'soft');
    if (onClick) onClick();
    if (href) router.push(href);
  };

  return (
    <ButtonInstrument
      onClick={handleClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
        variant === 'danger' ? 'hover:bg-red-50 text-red-500' : 
        variant === 'primary' ? 'hover:bg-primary/10 text-primary' :
        'hover:bg-va-black/5 text-va-black/60 hover:text-va-black'
      }`}
    >
      <ContainerInstrument className="flex items-center gap-3">
        {typeof Icon === 'function' ? <Icon size={16} strokeWidth={variant === 'primary' ? 2 : 1.5} /> : Icon}
        <TextInstrument className="text-[15px] font-light tracking-widest">{label}</TextInstrument>
      </ContainerInstrument>
      <ContainerInstrument className="flex items-center gap-2">
        {badge && (
          <TextInstrument className="px-1.5 py-0.5 bg-primary/10 text-primary text-[15px] font-light rounded-md">
            {badge}
          </TextInstrument>
        )}
        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </ContainerInstrument>
    </ButtonInstrument>
  );
};

export default function GlobalNav() {
  const pathname = usePathname();
  const { playClick, playSwell } = useSonicDNA();
  const { isEditMode, toggleEditMode, canEdit } = useEditMode();
  const { state: voicesState } = useVoicesState();
  const auth = useAuth();
  const isAdmin = auth.isAdmin;
  const market = MarketManager.getCurrentMarket(); 
  const [mounted, setMounted] = useState(false);

  // Live data voor badges
  const favoritesCount = voicesState.selected_actors?.length || 0;
  const cartCount = 0; // Wordt later gekoppeld aan de echte cart context
  
  // 🔔 NOTIFICATION LOGIC
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nieuwe stem beschikbaar', message: 'Johfrah heeft een nieuwe demo geüpload.', time: '2 min geleden', read: false, type: 'voice' },
    { id: 2, title: 'Bestelling voltooid', message: 'Je opname voor "Project X" is klaar.', time: '1 uur geleden', read: false, type: 'order' },
    { id: 3, title: 'Voicy Tip', message: 'Wist je dat we nu ook AI-stemmen aanbieden?', time: '3 uur geleden', read: false, type: 'tip' }
  ]);
  const notificationsCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const [links, setLinks] = useState<any[]>([
    { name: 'Onze Stemmen', href: '/agency', key: 'nav.my_voice' },
    { name: 'Werkwijze', href: '/over-ons', key: 'nav.how_it_works' },
    { name: 'Tarieven', href: '/tarieven', key: 'nav.pricing' },
    { name: 'Contact', href: '#', onClick: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('voicy:suggestion', { 
          detail: { 
            tab: 'chat',
            content: 'Hallo! 👋 Je wilde contact opnemen? Ik ben Voicy, hoe kan ik je helpen?' 
          } 
        }));
      }
    }, key: 'nav.contact' }
  ]);

  useEffect(() => {
    setMounted(true);
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
        { name: 'Contact', href: '#', onClick: () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('voicy:suggestion', { 
              detail: { 
                tab: 'chat',
                content: 'Hallo! 👋 Je wilde contact opnemen? Ik ben Voicy, hoe kan ik je helpen?' 
              } 
            }));
          }
        }, key: 'nav.contact' }
      ]);
    } else if (market.market_code === 'YOUSSEF') {
      setLinks([
        { name: 'The Story', href: '/#story', key: 'nav.artist_story' },
        { name: 'Music', href: '/#music', key: 'nav.artist_music' },
        { name: 'Support', href: '/#support', key: 'nav.artist_support' },
        { name: 'Contact', href: '#', onClick: () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('voicy:suggestion', { 
              detail: { 
                tab: 'chat',
                content: 'Hallo! 👋 Je wilde contact opnemen? Ik ben Voicy, hoe kan ik je helpen?' 
              } 
            }));
          }
        }, key: 'nav.contact' }
      ]);
    }
  }, [market.market_code]);

  if (!mounted) return null;

  const isSpecialJourney = market.market_code === 'JOHFRAH' || market.market_code === 'YOUSSEF' || market.market_code === 'ADEMING';

  return (
    <ContainerInstrument as="nav" className="fixed top-0 left-0 right-0 z-40 px-4 md:px-6 py-4 md:py-6 flex justify-between items-center bg-white/40 backdrop-blur-3xl border-b border-black/5 golden-curve">
      <ButtonInstrument 
        as={Link}
        href="/" 
        className="flex items-center gap-2 md:gap-3 group"
        onClick={() => playClick('soft')}
        onMouseEnter={() => playSwell()}
      >
        {market.market_code === 'JOHFRAH' || (typeof window !== 'undefined' && window.location.host.includes('johfrah.be')) ? (
          <TextInstrument className="text-xl font-light tracking-tighter transition-transform duration-500 group-hover:scale-105 text-va-black whitespace-nowrap"><VoiceglotText translationKey="auto.globalnav.johfrah_lefebvre.95a724" defaultText="JOHFRAH LEFEBVRE" /></TextInstrument>
        ) : market.market_code === 'YOUSSEF' ? (
          <TextInstrument className="text-xl font-light tracking-tighter transition-transform duration-500 group-hover:scale-105 text-va-black whitespace-nowrap"><VoiceglotText translationKey="auto.globalnav.youssef_zaki.42bcfa" defaultText="YOUSSEF ZAKI" /></TextInstrument>
        ) : (
          <VoiceglotImage 
            src={market.logo_url} 
            alt={market.name} 
            width={200} 
            height={80}
            priority={true}
            journey="common"
            category="branding"
            className="h-10 md:h-12 w-auto transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </ButtonInstrument>

      <ContainerInstrument className="hidden md:flex gap-8">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href) && link.href !== '#';
          return (
            <ButtonInstrument 
              as={Link}
              key={link.name} 
              href={link.href}
              onClick={(e) => {
                if (link.onClick) {
                  e.preventDefault();
                  link.onClick();
                }
                playClick('soft');
              }}
              onMouseEnter={() => playSwell()}
              className={`relative text-[15px] font-light tracking-widest transition-all duration-500 ${
                isActive ? 'text-primary' : 'text-va-black/30 hover:text-va-black'
              }`}
            >
              <VoiceglotText translationKey={link.key || `nav.${(link.name || '').toLowerCase()}`} defaultText={link.name || ''} />
              
              {isActive && (
                <ContainerInstrument
                  as={motion.div}
                  layoutId="nav-indicator"
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 380, 
                    damping: 30 
                  }}
                />
              )}
            </ButtonInstrument>
          );
        })}
      </ContainerInstrument>

      <ContainerInstrument className="flex gap-4 items-center ml-auto">
        {/* ❤️ FAVORITES ICON */}
        {!isSpecialJourney && (
          <HeaderIcon 
            src="/assets/common/branding/icons/FAVORITES.svg" 
            alt="Favorieten"
            badge={favoritesCount}
            href="/account/favorites"
          />
        )}

        {/* 🛍️ CART ICON */}
        {!isSpecialJourney && (
          <HeaderIcon 
            src="/assets/common/branding/icons/CART.svg" 
            alt="Winkelmandje" 
            badge={cartCount}
            href="/checkout"
          />
        )}

        {/* 🔔 NOTIFICATIONS ICON */}
        {!isSpecialJourney && (
          <HeaderIcon 
            src="/assets/common/branding/icons/INFO.svg" 
            alt="Notificaties"
            badge={notificationsCount}
          >
            <ContainerInstrument className="p-2 space-y-1">
              <ContainerInstrument className="px-4 py-3 border-b border-black/5 mb-2 flex justify-between items-center">
                <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-[0.2em] "><VoiceglotText translationKey="nav.notifications_title" defaultText="Notificaties" /></TextInstrument>
                {notificationsCount > 0 && (
                  <ButtonInstrument 
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-[15px] font-light text-primary hover:underline"
                  >
                    <VoiceglotText translationKey="nav.notifications_clear" defaultText="Wis alles" />
                  </ButtonInstrument>
                )}
              </ContainerInstrument>
              
              <ContainerInstrument className="max-h-[400px] overflow-y-auto no-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <ButtonInstrument
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 group mb-1 last:mb-0 flex gap-4 ${
                        n.read ? 'opacity-50 hover:bg-va-black/5' : 'bg-primary/5 hover:bg-primary/10'
                      }`}
                    >
                      <ContainerInstrument className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === 'voice' ? 'bg-blue-500/10 text-blue-500' :
                        n.type === 'order' ? 'bg-green-500/10 text-green-500' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {n.type === 'voice' ? <Mic2 strokeWidth={1.5} size={18} /> : 
                         n.type === 'order' ? <ShoppingBag size={18} /> : 
                         <Bell size={18} />}
                      </ContainerInstrument>
                      <ContainerInstrument className="flex-1 min-w-0">
                        <ContainerInstrument className="flex justify-between items-start mb-1">
                          <TextInstrument className="text-[15px] font-light text-va-black truncate pr-2">{n.title}</TextInstrument>
                          <TextInstrument className="text-[15px] text-va-black/30 whitespace-nowrap font-light">{n.time}</TextInstrument>
                        </ContainerInstrument>
                        <TextInstrument className="text-[15px] text-va-black/60 leading-relaxed line-clamp-2 font-light">{n.message}</TextInstrument>
                      </ContainerInstrument>
                      {!n.read && (
                        <ContainerInstrument className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      )}
                    </ButtonInstrument>
                  ))
                ) : (
                  <ContainerInstrument className="p-8 text-center">
                    <Bell size={32} className="text-va-black/10 mx-auto mb-3" />
                    <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="nav.notifications_empty" defaultText="Geen nieuwe meldingen." /></TextInstrument>
                  </ContainerInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>
          </HeaderIcon>
        )}

        {/* 🌐 LANGUAGE ICON */}
        <LanguageSwitcher />

        {/* 👤 ACCOUNT ICON */}
        {!isSpecialJourney && (
          <HeaderIcon 
            src="/assets/common/branding/icons/ACCOUNT.svg" 
            alt="Account"
            isActive={auth.isAuthenticated}
          >
            {auth.isAuthenticated ? (
              <>
                <ContainerInstrument className="px-4 py-4 border-b border-black/5 mb-2">
                  <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest mb-1 "><VoiceglotText translationKey="nav.logged_in_as" defaultText="Ingelogd als" /></TextInstrument>
                  <TextInstrument className="text-[15px] font-light text-va-black truncate">{auth.user?.email}</TextInstrument>
                </ContainerInstrument>
                {isAdmin && (
                  <DropdownItem 
                    icon={LayoutDashboard} 
                    label="Admin Dashboard" 
                    href="/admin/dashboard" 
                    variant="primary" 
                    badge="God Mode"
                  />
                )}
                <DropdownItem icon={() => <VoiceglotImage src="/assets/common/branding/icons/ACCOUNT.svg" width={16} height={16} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />} label="Mijn profiel" href="/account" />
                <DropdownItem icon={() => <VoiceglotImage src="/assets/common/branding/icons/CART.svg" width={16} height={16} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />} label="Bestellingen" href="/account/orders" />
                <DropdownItem icon={() => <VoiceglotImage src="/assets/common/branding/icons/FAVORITES.svg" width={16} height={16} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />} label="Favorieten" href="/account/favorites" badge={favoritesCount > 0 ? favoritesCount : undefined} />
                <DropdownItem icon={() => <VoiceglotImage src="/assets/common/branding/icons/INFO.svg" width={16} height={16} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />} label="Instellingen" href="/account/settings" />
                <DropdownItem 
                  icon={LogOut} 
                  label={<VoiceglotText translationKey="nav.logout" defaultText="Uitloggen" />} 
                  onClick={() => auth.logout()} 
                  variant="danger" 
                />
              </>
            ) : (
              <ContainerInstrument className="p-4 space-y-4 text-center">
                <ContainerInstrument className="w-12 h-12 bg-va-black/5 rounded-full flex items-center justify-center mx-auto mb-2">
                  <VoiceglotImage src="/assets/common/branding/icons/ACCOUNT.svg" width={24} height={24} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.2 }} />
                </ContainerInstrument>
                <ContainerInstrument>
                  <HeadingInstrument level={4} className="text-xl font-light tracking-tight mb-1 "><VoiceglotText translationKey="nav.welcome_title" defaultText="Welkom bij Voices" /><TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="nav.welcome_text" defaultText="Log in om je favoriete stemmen op te slaan en bestellingen te beheren." /></TextInstrument></HeadingInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="space-y-2">
                  <ButtonInstrument 
                    as={Link}
                    href="/auth/login" 
                    className="block w-full py-3 bg-va-black text-white rounded-[10px] text-[15px] font-light tracking-widest hover:bg-primary transition-all "
                  >
                    <VoiceglotText translationKey="nav.login_cta" defaultText="Inloggen" />
                  </ButtonInstrument>
                  <ButtonInstrument 
                    as={Link}
                    href="/auth/register" 
                    className="block w-full py-3 border border-black/10 text-va-black rounded-[10px] text-[15px] font-light tracking-widest hover:bg-va-black/5 transition-all "
                  >
                    <VoiceglotText translationKey="nav.register_cta" defaultText="Account aanmaken" />
                  </ButtonInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            )}
          </HeaderIcon>
        )}

        {/* 🍔 MENU ICON */}
        <HeaderIcon 
          src="/assets/common/branding/icons/MENU.svg" 
          alt="Menu"
        >
          <ContainerInstrument className="p-2 space-y-1">
            <ContainerInstrument className="px-4 py-3 border-b border-black/5 mb-2">
              <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-[0.2em] "><VoiceglotText translationKey="nav.navigation_label" defaultText="Navigatie" /></TextInstrument>
            </ContainerInstrument>
            {links.map((link) => (
              <DropdownItem 
                key={link.name}
                icon={ChevronRight} 
                label={link.name} 
                href={link.href !== '#' ? link.href : undefined}
                onClick={link.onClick}
              />
            ))}
            
            <ContainerInstrument className="mt-4 px-4 py-3 border-t border-black/5">
              <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-[0.2em] mb-4 "><VoiceglotText translationKey="nav.menu.proefopname_title" defaultText="Direct naar proefopname" /></TextInstrument>
              <ContainerInstrument className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { label: 'TV Spot', icon: Monitor, href: '/agency?category=tv', key: 'category.tv' },
                  { label: 'Radio', icon: Radio, href: '/agency?category=radio', key: 'category.radio' },
                  { label: 'Online', icon: Globe, href: '/agency?category=online', key: 'category.online' },
                  { label: 'Podcast', icon: Mic2, href: '/agency?category=podcast', key: 'category.podcast' },
                  { label: 'Telefonie', icon: Phone, href: '/agency?category=telefoon', key: 'category.telefoon' },
                  { label: 'Corporate', icon: Building2, href: '/agency?category=corporate', key: 'category.corporate' }
                ].map((cat) => (
                  <ButtonInstrument 
                    as={Link}
                    key={cat.label} 
                    href={cat.href}
                    className="flex items-center gap-2 p-3 rounded-xl bg-va-off-white hover:bg-primary/5 hover:text-primary transition-all group"
                  >
                    <cat.icon size={14} strokeWidth={1.5} className="text-va-black/20 group-hover:text-primary transition-colors" />
                    <TextInstrument className="text-[15px] font-light whitespace-nowrap">
                      <VoiceglotText translationKey={cat.key} defaultText={cat.label} />
                    </TextInstrument>
                  </ButtonInstrument>
                ))}
              </ContainerInstrument>

              <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-[0.2em] mb-4 "><VoiceglotText translationKey="nav.menu.recommended_title" defaultText="Aanbevolen stemmen" /></TextInstrument>
              <ContainerInstrument className="space-y-2 mb-6">
                {[
                  { name: 'Johfrah', type: 'Mannelijk', slug: 'johfrah', typeKey: 'gender.male' },
                  { name: 'Birgit', type: 'Vrouwelijk', slug: 'birgit', typeKey: 'gender.female' },
                  { name: 'Korneel', type: 'Mannelijk', slug: 'korneel', typeKey: 'gender.male' },
                  { name: 'Annelies', type: 'Vrouwelijk', slug: 'annelies-1', typeKey: 'gender.female' }
                ].map((voice) => (
                  <ContainerInstrument key={voice.slug} className="flex items-center justify-between p-2 rounded-xl hover:bg-va-black/5 transition-all group">
                    <ContainerInstrument className="flex items-center gap-3">
                      <ContainerInstrument className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center overflow-hidden">
                        <VoiceglotImage src="/assets/common/branding/icons/ACCOUNT.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.2 }} />
                      </ContainerInstrument>
                      <ContainerInstrument>
                        <TextInstrument className="text-[15px] font-light text-va-black">{voice.name}</TextInstrument>
                        <TextInstrument className="text-[15px] text-va-black/40 font-light">
                          <VoiceglotText translationKey={voice.typeKey} defaultText={voice.type} />
                        </TextInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                    <ButtonInstrument 
                      as={Link}
                      href={`/artist/${voice.slug}`}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-[20px] text-[15px] font-light opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                    ><VoiceglotText translationKey="action.proefopname" defaultText="Proefopname" /></ButtonInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
              
              <ButtonInstrument 
                as={Link}
                href="/agency"
                className="flex items-center justify-center gap-2 w-full py-4 bg-va-black text-white rounded-2xl text-[15px] font-light tracking-widest hover:bg-primary transition-all shadow-lg"
              >
                <VoiceglotText translationKey="nav.menu.discover_all" defaultText="Ontdek alle stemmen" />
              </ButtonInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="mt-2 pt-2 border-t border-black/5">
              <DropdownItem 
                icon={Mail} 
                label={<VoiceglotText translationKey="nav.support" defaultText="Support" />} 
                href="/contact" 
              />
            </ContainerInstrument>
          </ContainerInstrument>
        </HeaderIcon>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
