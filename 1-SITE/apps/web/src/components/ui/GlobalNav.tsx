"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Building2, 
  ChevronRight, 
  ChevronDown, 
  Globe, 
  Heart, 
  LayoutDashboard, 
  LogOut, 
  Mail, 
  Menu, 
  Mic2, 
  Monitor, 
  Phone, 
  Radio, 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Info, 
  Settings, 
  Home, 
  Euro, 
  GraduationCap, 
  Quote, 
  Users 
} from 'lucide-react';
import { VoicesLink, useVoicesRouter } from './VoicesLink';
import { 
  ButtonInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument
} from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { NavConfig } from '@/lib/utils/config-bridge';
import { Plus, Trash2, Link as LinkIcon, Search as SearchIcon, X, Check, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { LanguageSwitcher } from './LanguageSwitcher';

/**
 *  HEADER ICON INSTRUMENT
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
    timeoutRef.current = setTimeout(() => { setIsOpen(false); }, 300);
  };

  const content = (
    <ContainerInstrument 
      plain
      className="relative"
      onMouseEnter={() => { handleMouseEnter(); }}
      onMouseLeave={() => { handleMouseLeave(); }}
    >
      <ButtonInstrument 
        variant="ghost"
        size="icon"
        as={href ? VoicesLink : 'button'}
        href={href || undefined}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(
          "w-10 h-10 !rounded-full transition-all duration-500 cursor-pointer group/icon flex items-center justify-center relative",
          isActive ? "!bg-primary text-white shadow-aura-sm" : "hover:bg-va-black/5 text-va-black/40 hover:text-va-black"
        )}
      >
        {src ? (
          <Image  
            src={src} 
            alt={alt} 
            width={20}
            height={20}
            className={`w-5 h-5 transition-transform duration-500 group-hover/icon:scale-110 ${isActive ? 'brightness-0 invert' : ''}`} 
          />
        ) : Icon ? (
          <Icon size={20} className={`transition-transform duration-500 group-hover/icon:scale-110 ${isActive ? 'text-white' : ''}`} />
        ) : null}

        {(badge !== undefined && badge > 0) || badgeText ? (
          <TextInstrument 
            as={motion.span}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white leading-none z-10"
          >
            {badgeText || badge}
          </TextInstrument>
        ) : null}
      </ButtonInstrument>

      <AnimatePresence>
        {isOpen && children && (
          <ContainerInstrument
            as={motion.div}
            plain
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-1 w-[320px] bg-white rounded-[20px] shadow-aura border border-black/5 overflow-hidden z-[210]"
          >
            <ContainerInstrument plain className="p-1">
              {children}
            </ContainerInstrument>
          </ContainerInstrument>
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );

  if (href && !children) {
    return content; // Link logic is handled by HeaderIcon wrapper or internal ButtonInstrument
  }

  return content;
};

/**
 *  DROPDOWN ITEM
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
  const router = useVoicesRouter();
  const pathname = usePathname();

  const isActive = href && pathname === href;

  const handleClick = () => {
    playClick(variant === 'primary' ? 'pro' : 'soft');
    if (onClick) onClick();
    if (href) {
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        window.open(href, '_blank');
      } else {
        router.push(href);
      }
    }
  };

  const content = (
    <ContainerInstrument plain className="flex items-center gap-3">
      {Icon ? (typeof Icon === 'function' || (typeof Icon === 'object' && Icon.$$typeof)) ? <Icon size={18} className={isActive ? 'text-primary' : 'text-va-black/40 group-hover:text-va-black transition-colors duration-500'} /> : Icon : null}
      <TextInstrument className={`text-[15px] font-light tracking-widest ${isActive ? 'text-primary' : ''}`}>{label}</TextInstrument>
    </ContainerInstrument>
  );

  if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
    return (
      <VoicesLink href={href} className="block w-full" onClick={() => {
        playClick(variant === 'primary' ? 'pro' : 'soft');
        if (onClick) onClick();
      }}>
        <ButtonInstrument
          variant="plain"
          size="none"
          as="div"
          className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-500 group ${
            isActive ? 'bg-primary/5 text-primary' : 
            variant === 'danger' ? 'text-red-500 hover:bg-red-50' : 
            variant === 'primary' ? 'text-primary hover:bg-primary/5' :
            'text-va-black/40 hover:text-va-black hover:bg-va-black/5'
          }`}
        >
          {content}
          <ContainerInstrument plain className="flex items-center gap-2">
            {badge && (
              <TextInstrument className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">
                {badge}
              </TextInstrument>
            )}
            <ChevronRight size={12} className={`transition-all duration-500 ${isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
          </ContainerInstrument>
        </ButtonInstrument>
      </VoicesLink>
    );
  }

  return (
    <ButtonInstrument
      onClick={handleClick}
      variant="plain"
      size="none"
      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-500 group ${
        isActive ? 'bg-primary/5 text-primary' : 
        variant === 'danger' ? 'text-red-500 hover:bg-red-50' : 
        variant === 'primary' ? 'text-primary hover:bg-primary/5' :
        'text-va-black/40 hover:text-va-black hover:bg-va-black/5'
      }`}
    >
      {content}
      <ContainerInstrument plain className="flex items-center gap-2">
        {badge && (
          <TextInstrument className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">
            {badge}
          </TextInstrument>
        )}
        <ChevronRight strokeWidth={1.5} size={12} className={`transition-all duration-500 ${isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
      </ContainerInstrument>
    </ButtonInstrument>
  );
};

export default function GlobalNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { playClick, playSwell } = useSonicDNA();
  const { isEditMode, toggleEditMode, canEdit } = useEditMode();
  const { state: voicesState, toggleActorSelection } = useVoicesState();
  const { state: checkoutState, subtotal, removeItem } = useCheckout();
  const { notifications: customerNotifications, unreadCount: customerUnreadCount, markAsRead: markCustomerAsRead, markAllAsRead: markAllCustomerAsRead } = useNotifications();
  const auth = useAuth();
  const isAdmin = auth.isAdmin;
  const market = MarketManager.getCurrentMarket(); 
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Live data voor badges
  const favoritesCount = voicesState.selected_actors?.length || 0;
  const cartCount = checkoutState.items?.length || 0;
  
  //  NOTIFICATION LOGIC
  const notifications = customerNotifications;
  const notificationsCount = customerUnreadCount;

  const markAsRead = (id: any) => {
    markCustomerAsRead(id);
  };
  
  const [navConfig, setNavConfig] = useState<NavConfig | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [isEditingLink, setIsEditingLink] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const getJourneyKey = useCallback(() => {
    switch (market.market_code) {
      case 'ADEMING': return 'ademing';
      case 'PORTFOLIO': return 'portfolio';
      case 'ARTIST': return 'artist';
      case 'STUDIO': return 'studio';
      case 'ACADEMY': return 'academy';
      default: return 'agency';
    }
  }, [market.market_code]);

  useEffect(() => {
    setMounted(true);
    
    const fetchNavConfig = async () => {
      try {
        const res = await fetch(`/api/admin/config?type=navigation&journey=${getJourneyKey()}`);
        if (!res.ok) {
          throw new Error(`Nav fetch failed with status: ${res.status}`);
        }
        const data = await res.json();
        if (data && data.links) {
          setNavConfig(data);
          setLinks(data.links);
        } else {
          // Fallback naar defaults als er geen database config is
          const defaultLinks = [
            { name: 'Onze Stemmen', href: '/agency/', key: 'nav.my_voice' },
            { name: 'Gratis Proefopname', href: '/agency/gratis-proefopname/', key: 'nav.free_demo' },
            { name: 'Tarieven', href: '/tarieven/', key: 'nav.pricing' },
            { name: 'Contact', href: '/contact/', key: 'nav.contact' }
          ];
          setLinks(defaultLinks);
        }
      } catch (error) {
        console.error('Failed to fetch nav config:', error);
        // Fallback bij error
        const defaultLinks = [
          { name: 'Onze Stemmen', href: '/agency/', key: 'nav.my_voice' },
          { name: 'Gratis Proefopname', href: '/agency/gratis-proefopname/', key: 'nav.free_demo' },
          { name: 'Tarieven', href: '/tarieven/', key: 'nav.pricing' },
          { name: 'Contact', href: '/contact/', key: 'nav.contact' }
        ];
        setLinks(defaultLinks);
      }
    };

    fetchNavConfig();
  }, [market.market_code, pathname, getJourneyKey, isAdmin]);

  const saveNav = async (newLinks: any[], newLogo?: any) => {
    try {
      const config = { 
        ...navConfig, 
        links: newLinks,
        logo: newLogo || navConfig?.logo,
        icons: navConfig?.icons || {
          favorites: true,
          cart: true,
          notifications: true,
          language: true,
          account: true,
          menu: true
        }
      };
      await fetch(`/api/admin/navigation/${getJourneyKey()}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setLinks(newLinks);
      if (newLogo) setNavConfig({ ...navConfig!, logo: newLogo });
      playClick('success');
    } catch (e) {
      console.error('Failed to save nav config:', e);
    }
  };

  const addLink = () => {
    const newLinks = [...links];
    newLinks.push({ name: 'Nieuwe link', href: '#' });
    saveNav(newLinks);
  };

  const removeLink = (idx: number) => {
    const newLinks = [...links];
    newLinks.splice(idx, 1);
    saveNav(newLinks);
  };

  const updateLinkUrl = (idx: number, newHref: string) => {
    const newLinks = [...links];
    newLinks[idx].href = newHref;
    saveNav(newLinks);
    setIsEditingLink(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsEditingLink(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loginMessage, setLoginMessage] = useState('');

  const activeLinks = useMemo(() => {
    // 🛡️ VISIONARY MANDATE: Links exclusively from database config
    return navConfig?.links || [];
  }, [navConfig]);

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    
    setLoginStatus('loading');
    playClick('pro');
    
    try {
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, redirect: pathname }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setLoginStatus('success');
        setLoginMessage(t('nav.login.check_inbox', 'Check je inbox!'));
        playClick('success');
      } else {
        setLoginStatus('error');
        setLoginMessage(data.error || t('nav.login.error_request', 'Fout bij aanvraag'));
      }
    } catch (err) {
      setLoginStatus('error');
      setLoginMessage(t('nav.login.network_error', 'Netwerkfout'));
    }
  };

  if (!mounted) return null;

  const isPortfolioMarket = market.market_code === 'PORTFOLIO';
  const isSpecialJourney = ['PORTFOLIO', 'ARTIST', 'ADEMING'].includes(market.market_code);
  const isStudioJourney = ['STUDIO', 'ACADEMY'].includes(market.market_code);
  const isArtist = market.market_code === 'ARTIST';
  
  //  CHRIS-PROTOCOL: Hide GlobalNav completely for specific standalone pages
  // UITZONDERING: Op de Youssef artist pagina willen we de nav WEL zien voor de taalswitcher en logo
  // UITZONDERING: Op portfolio pagina's willen we de nav WEL zien (header/footer mandate)
  if ((pathname.startsWith('/artist/') || pathname.startsWith('/voice/')) && !isArtist && !pathname.includes('/artist/youssef')) return null;

  //  CHRIS-PROTOCOL: For Youssef Artist Journey, use a simpler nav without TopBar and specific FABs
  if (isArtist) {
    return (
      <ContainerInstrument as="nav" className="w-full px-4 md:px-6 py-3 flex items-center bg-va-black border-b border-white/5 relative z-[200]">
        <ContainerInstrument plain className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-3 group">
            <Image  
              src={market.logo_url} 
              alt={market.name} 
              width={160} 
              height={50}
              priority
              className="h-8 md:h-10 w-auto transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        </ContainerInstrument>

        <ContainerInstrument plain className="hidden md:flex gap-8 items-center justify-center">
          {[
            { name: 'Story', href: '/story', key: 'nav.artist.story' },
            { name: 'Music', href: '/music', key: 'nav.artist.music' },
            { name: 'Support', href: '/support', key: 'nav.artist.support' }
          ].map((link) => (
            <VoicesLink 
              key={link.name} 
              href={link.href}
              className="text-[13px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-[#FFC421] transition-all hover:tracking-[0.25em] cursor-pointer"
            >
              <VoiceglotText translationKey={link.key} defaultText={link.name} />
            </VoicesLink>
          ))}
        </ContainerInstrument>

        <ContainerInstrument plain className="flex-1 flex gap-6 items-center justify-end">
          <LanguageSwitcher className="w-10 h-10 rounded-[10px] bg-white/5 text-white/40 hover:text-[#FFC421] hover:bg-white/10 transition-all flex items-center justify-center" />
          <ButtonInstrument 
            as={Link} 
            href="/agency/"
            variant="plain"
            size="none"
            className="text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-[#FFC421] transition-colors hidden lg:block border border-white/5 px-3 py-1.5 rounded-full"
          >
            <VoiceglotText translationKey="nav.artist.back_to_agency" defaultText="Voices Agency" />
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  //  ICON VISIBILITY LOGIC
  // CHRIS-PROTOCOL: Admins ALWAYS see all icons and links to ensure persistence during editing
  // 🛡️ VISIONARY MANDATE: Icon visibility exclusively from database config (navConfig)
  const showFavorites = isAdmin || (navConfig?.icons?.favorites ?? (!isSpecialJourney && !isStudioJourney && !isMobile));
  const showCart = isAdmin || (navConfig?.icons?.cart ?? (!isSpecialJourney && !isStudioJourney && !isPortfolioMarket && !isMobile));
  const showNotifications = isAdmin || (navConfig?.icons?.notifications ?? (auth.isAuthenticated && notificationsCount > 0 && !isPortfolioMarket && !isMobile));
  const showLanguage = isAdmin || (navConfig?.icons?.language ?? !isMobile);
  const showAccount = isAdmin || (navConfig?.icons?.account ?? (!isSpecialJourney && !isStudioJourney && !isMobile));
  const showMenu = isAdmin || (navConfig?.icons?.menu ?? !isSpecialJourney);
  const showLinks = isAdmin || (navConfig?.links?.length > 0 && !isMobile); 

  const showPortfolioAdmin = isPortfolioMarket && isAdmin;

  const handleSpeakToJohfrah = () => {
    playClick('pro');
    localStorage.setItem('voices_persona_preference', 'johfrah');
    window.dispatchEvent(new CustomEvent('voices:persona_change', { detail: 'johfrah' }));
    window.dispatchEvent(new CustomEvent('voicy:open', { detail: { persona: 'johfrah' } }));
  };

  const getPortfolioHref = (subPath: string) => {
    if (typeof window === 'undefined') return `/portfolio/johfrah${subPath}`;
    if (market.market_code === 'PORTFOLIO') {
      return subPath;
    }
    return `/portfolio/johfrah${subPath}`;
  };

  // BOB-DEBUG: Ensure nav is always visible in dev
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <ContainerInstrument as="nav" className={`w-full px-4 md:px-6 py-1 flex items-center bg-white/40 backdrop-blur-3xl border-b border-black/5 golden-curve relative`}>
      <ContainerInstrument plain className="flex-1 flex justify-start">
        <ButtonInstrument 
          as={VoicesLink}
          href="/" 
          variant="plain"
          size="none"
          className="flex items-center gap-2 md:gap-3 group"
          onClick={() => { playClick('soft'); }}
          onMouseEnter={() => { playSwell(); }}
        >
        {navConfig?.logo?.src ? (
          <div className="relative group/logo">
            <VoiceglotImage  
              src={navConfig.logo.src} 
              alt={navConfig.logo.alt || "Logo"} 
              width={navConfig.logo.width || 200} 
              height={navConfig.logo.height || 80}
              priority
              sizes="(max-width: 768px) 150px, 200px"
              journey={getJourneyKey()}
              category="branding"
              onUpdate={(newSrc) => {
                saveNav(links, { ...navConfig.logo, src: newSrc });
              }}
              className="h-10 md:h-12 w-auto transition-transform duration-500 group-hover:scale-105 relative z-50"
            />
          </div>
        ) : isPortfolioMarket ? (
          <TextInstrument className="text-xl font-light tracking-tighter transition-transform duration-500 group-hover:scale-105 text-va-black whitespace-nowrap relative z-50"><VoiceglotText  translationKey="nav.portfolio_name" defaultText={market.name} noTranslate={true} /></TextInstrument>
        ) : market.market_code === 'ARTIST' ? (
          <TextInstrument className="text-xl font-light tracking-tighter transition-transform duration-500 group-hover:scale-105 text-va-black whitespace-nowrap relative z-50"><VoiceglotText  translationKey="nav.artist_name" defaultText={market.name} noTranslate={true} /></TextInstrument>
        ) : (
        <Image  
          src={market.logo_url} 
          alt={t(`market.name.${market.market_code.toLowerCase()}`, market.name)} 
          width={200} 
          height={80}
          priority
          sizes="(max-width: 768px) 150px, 200px"
          className="h-10 md:h-12 w-auto transition-transform duration-500 group-hover:scale-105 relative z-50"
        />
      )}
      </ButtonInstrument>
    </ContainerInstrument>

      <ContainerInstrument plain className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2 items-center z-50">
      {activeLinks.slice(0, 6).map((link: any, idx: number) => {
        const isActive = pathname.startsWith(link.href) && link.href !== '#';
        const hasSubmenu = link.submenu && link.submenu.length > 0;

        return (
          <div key={idx} className="relative group/link flex items-center gap-1">
            <ButtonInstrument 
              as={hasSubmenu ? 'div' : VoicesLink}
              href={hasSubmenu ? undefined : link.href}
              variant="plain"
              size="none"
              onClick={(e) => {
                if (link.onClick) {
                  e.preventDefault();
                  link.onClick();
                }
                playClick('soft');
              }}
              onMouseEnter={() => { playSwell(); }}
              className={`relative text-[15px] font-light tracking-widest transition-all duration-500 flex items-center gap-1 py-3 ${
                isActive ? 'text-primary' : 'text-va-black/40 hover:text-va-black'
              }`}
            >
              <VoiceglotText  translationKey={link.key || `nav.${getJourneyKey()}.${idx}`} defaultText={link.name || ''} />
              {hasSubmenu && <ChevronDown size={12} className="opacity-40 group-hover/link:rotate-180 transition-transform duration-500" />}
              
              {isActive && (
                <ContainerInstrument
                  as={motion.div}
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
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

            {hasSubmenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/link:opacity-100 group-hover/link:translate-y-0 group-hover/link:pointer-events-auto transition-all duration-500 z-[250]">
                <div className="bg-white rounded-[20px] shadow-aura border border-black/5 p-2 w-64 overflow-hidden">
                  {link.submenu.map((sub: any, subIdx: number) => (
                    <DropdownItem 
                      key={subIdx}
                      icon={ChevronRight}
                      label={<VoiceglotText translationKey={sub.key} defaultText={sub.name} />}
                      href={sub.href}
                    />
                  ))}
                </div>
              </div>
            )}

            {isEditMode && !isPortfolioMarket && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover/link:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setIsEditingLink(idx);
                    setEditValue(link.href);
                    playClick('pro');
                  }}
                  className="p-1 text-primary hover:bg-primary/10 rounded"
                >
                  <LinkIcon size={10} />
                </button>
                <button 
                  onClick={() => removeLink(idx)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            )}

            <AnimatePresence>
              {isEditingLink === idx && (
                <motion.div 
                  ref={popoverRef}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-black/10 p-3 z-[250]"
                >
                  <div className="flex flex-col gap-3">
                    <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-widest">
                      <VoiceglotText translationKey="nav.edit.link_url" defaultText="Link url" />
                    </TextInstrument>
                    <input 
                      autoFocus
                      type="text" 
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="bg-va-off-white px-3 py-2 rounded-lg border border-black/5 text-[13px] font-medium w-full outline-none focus:ring-2 focus:ring-primary/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateLinkUrl(idx, editValue);
                        if (e.key === 'Escape') setIsEditingLink(null);
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsEditingLink(null)} className="px-3 py-1.5 text-[11px] font-bold text-va-black/40 hover:text-va-black">
                        <VoiceglotText translationKey="common.cancel" defaultText="Annuleer" />
                      </button>
                      <button onClick={() => updateLinkUrl(idx, editValue)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                        <Check size={12} strokeWidth={3} /> <VoiceglotText translationKey="common.save" defaultText="Save" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      {isEditMode && !isPortfolioMarket && (
        <button 
          onClick={addLink}
          className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all"
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      )}
    </ContainerInstrument>

      <ContainerInstrument plain className="flex-1 flex gap-4 items-center justify-end relative z-50">
        {/*  PAAS ADMIN TRIGGER (Invisible for visitors) */}
        {showPortfolioAdmin && (
          <HeaderIcon 
            icon={Settings} 
            alt={t('nav.portfolio_admin_alt', "Portfolio Beheer")}
            href={getPortfolioHref('/admin')}
            isActive={pathname.includes('/admin')}
            badgeText="ADMIN"
          />
        )}

        {/*  FAVORITES ICON */}
        {showFavorites && (
          <HeaderIcon icon={Heart} 
            alt={t('nav.favorites_alt', 'Favorieten')}
            badge={favoritesCount}
            href="/account/favorites/"
          >
            <ContainerInstrument plain className="p-1 space-y-1">
              <ContainerInstrument plain className="px-4 py-3 border-b border-black/5 mb-1 flex justify-between items-center">
                <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-[0.2em] uppercase">
                  <VoiceglotText translationKey="nav.favorites_title" defaultText="Jouw selectie" />
                </TextInstrument>
                <TextInstrument className="text-[11px] font-medium text-va-black/30 tracking-widest uppercase">
                  {favoritesCount} {favoritesCount === 1 ? t('common.voice', 'stem') : t('common.voices', 'stemmen')}
                </TextInstrument>
              </ContainerInstrument>

              <ContainerInstrument plain className="max-h-[320px] overflow-y-auto no-scrollbar px-1">
                {voicesState.selected_actors.length > 0 ? (
                  <ContainerInstrument plain className="space-y-1">
                    {voicesState.selected_actors.map((actor: any) => (
                      <ContainerInstrument
                        key={actor.id}
                        plain
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-va-black/5 transition-all group border border-transparent hover:border-black/5"
                      >
                        <ContainerInstrument plain className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center shrink-0 border border-black/5 overflow-hidden relative shadow-sm">
                          {actor.photo_url ? (
                            <Image src={actor.photo_url} alt={actor.display_name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <User size={16} className="text-va-black/20" />
                          )}
                        </ContainerInstrument>
                        <ContainerInstrument plain className="flex-1 min-w-0">
                          <TextInstrument className="text-[14px] font-medium text-va-black truncate">
                            {actor.display_name}
                          </TextInstrument>
                          <TextInstrument className="text-[11px] text-va-black/40 font-light truncate tracking-widest uppercase">
                            <VoiceglotText 
                              translationKey={`common.language.${actor.native_lang?.toLowerCase()}`} 
                              defaultText={actor.native_lang_label || MarketManager.getLanguageLabel(actor.native_lang || '')} 
                            />
                          </TextInstrument>
                        </ContainerInstrument>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActorSelection(actor);
                            playClick('light');
                          }}
                          className="p-2 text-va-black/20 hover:text-red-500 transition-colors"
                          title={t('common.remove', 'Verwijderen')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </ContainerInstrument>
                    ))}
                  </ContainerInstrument>
                ) : (
                  <ContainerInstrument plain className="p-8 text-center">
                    <Heart size={32} className="text-va-black/10 mx-auto mb-3" />
                    <TextInstrument className="text-[15px] text-va-black/40 font-light">
                      <VoiceglotText translationKey="nav.favorites_empty" defaultText="Nog geen stemmen geselecteerd." />
                    </TextInstrument>
                  </ContainerInstrument>
                )}
              </ContainerInstrument>

              {favoritesCount > 0 && (
                <ContainerInstrument plain className="p-2 pt-3 border-t border-black/5 mt-1">
                  <ButtonInstrument 
                    as={VoicesLink}
                    href="/casting/launchpad/"
                    variant="default"
                    className="w-full py-3 bg-primary text-white rounded-xl text-[15px] font-bold tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <VoiceglotText translationKey="nav.favorites_cta" defaultText="Gratis proefopname" />
                    <ArrowRight size={16} strokeWidth={2} />
                  </ButtonInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          </HeaderIcon>
        )}

    {/*  CART ICON */}
    {showCart && (
      <HeaderIcon icon={ShoppingCart} 
        alt={t('nav.cart_alt', 'Winkelmandje')} 
        badge={cartCount}
        href="/checkout/"
        // CHRIS-PROTOCOL: On checkout page, don't show the dropdown, just link to checkout
      >
        {pathname !== '/checkout' && (
          <ContainerInstrument plain className="p-1 space-y-1">
            <ContainerInstrument plain className="px-4 py-3 border-b border-black/5 mb-1 flex justify-between items-center">
              <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-[0.2em] uppercase">
                <VoiceglotText translationKey="nav.cart_title" defaultText="Winkelmandje" />
              </TextInstrument>
              <TextInstrument className="text-[11px] font-medium text-va-black/30 tracking-widest uppercase">
                {cartCount} {cartCount === 1 ? t('common.item', 'item') : t('common.items', 'items')}
              </TextInstrument>
            </ContainerInstrument>

            <ContainerInstrument plain className="max-h-[320px] overflow-y-auto no-scrollbar px-1">
              {checkoutState.items.length > 0 ? (
                <ContainerInstrument plain className="space-y-1">
                  {checkoutState.items.map((item: any, idx: number) => (
                    <ContainerInstrument
                      key={item.id || idx}
                      plain
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-va-black/5 transition-all group border border-transparent hover:border-black/5"
                    >
                      <ContainerInstrument plain className="w-12 h-12 rounded-xl bg-va-off-white flex items-center justify-center shrink-0 border border-black/5 overflow-hidden relative shadow-sm">
                        {item.actor?.photo_url && item.actor.photo_url !== 'NULL' || item.actor?.image_url && item.actor.image_url !== 'NULL' ? (
                          <Image src={item.actor.photo_url || item.actor.image_url} alt={item.actor.name || item.actor.display_name} fill sizes="48px" className="object-cover" />
                        ) : (
                          <Mic2 size={18} className="text-va-black/20" />
                        )}
                      </ContainerInstrument>
                      <ContainerInstrument plain className="flex-1 min-w-0">
                        <TextInstrument className="text-[14px] font-medium text-va-black truncate">
                          {item.actor?.display_name || item.actor?.name || 'Stemopname'}
                        </TextInstrument>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <TextInstrument className="text-[11px] text-va-black/40 font-light truncate tracking-widest">
                            {item.usage === 'commercial' ? t('common.commercial', 'Commercial') : item.usage === 'telefonie' ? t('common.telephony', 'Telefonie') : t('common.corporate', 'Corporate')}
                          </TextInstrument>
                          {item.country && (
                            <>
                              <span className="w-0.5 h-0.5 rounded-full bg-va-black/10" />
                              <TextInstrument className="text-[11px] text-va-black/40 font-light tracking-widest">
                                {Array.isArray(item.country) ? item.country[0] : item.country}
                              </TextInstrument>
                            </>
                          )}
                        </div>
                      </ContainerInstrument>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <TextInstrument className="text-[14px] font-medium text-va-black">
                            €{item.pricing?.total || item.pricing?.subtotal || 0}
                          </TextInstrument>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              removeItem(item.id);
                              playClick('light');
                            }}
                            className="p-1.5 text-va-black/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title={t('common.remove', 'Verwijderen')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <TextInstrument className="text-[10px] text-va-black/20 font-light tracking-tighter">
                          <VoiceglotText translationKey="common.excl_vat" defaultText="Excl. BTW" />
                        </TextInstrument>
                      </div>
                    </ContainerInstrument>
                  ))}
                </ContainerInstrument>
              ) : (
                <ContainerInstrument plain className="p-8 text-center">
                  <ShoppingCart size={32} className="text-va-black/10 mx-auto mb-3" />
                  <TextInstrument className="text-[15px] text-va-black/40 font-light">
                    <VoiceglotText translationKey="nav.cart_empty" defaultText="Je winkelmandje is leeg." />
                  </TextInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>

            {checkoutState.items.length > 0 && (
              <ContainerInstrument plain className="p-2 pt-3 border-t border-black/5 mt-1">
                <div className="flex justify-between items-center mb-3 px-2">
                  <TextInstrument className="text-[13px] font-light text-va-black/40">
                    <VoiceglotText translationKey="common.subtotal" defaultText="Subtotaal" />
                  </TextInstrument>
                  <TextInstrument className="text-[15px] font-medium text-va-black">
                    €{subtotal.toFixed(2)}
                  </TextInstrument>
                </div>
                <ButtonInstrument 
                  as={VoicesLink}
                  href="/checkout/"
                  variant="default"
                  className="w-full py-3 bg-va-black text-white rounded-xl text-[15px] font-light tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                >
                  <VoiceglotText translationKey="nav.cart_checkout" defaultText="Afrekenen" />
                  <ChevronRight size={16} />
                </ButtonInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        )}
      </HeaderIcon>
    )}

        {/*  NOTIFICATIONS ICON */}
        {showNotifications && (
          <HeaderIcon 
            icon={Bell} 
            alt={t('nav.notifications_alt', 'Notificaties')}
            badge={notificationsCount}
          >
            <ContainerInstrument plain className="p-1 space-y-1">
              <ContainerInstrument plain className="px-4 py-3 border-b border-black/5 mb-1 flex justify-between items-center">
                <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-[0.2em] uppercase">
                  <VoiceglotText  translationKey="nav.notifications_title" defaultText="Notificaties" />
                </TextInstrument>
                {notificationsCount > 0 && (
                  <ButtonInstrument 
                    variant="link"
                    size="none"
                    onClick={() => { 
                      markAllCustomerAsRead();
                    }}
                    className="text-[11px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
                  >
                    <VoiceglotText  translationKey="nav.notifications_clear" defaultText="Wis alles" />
                  </ButtonInstrument>
                )}
              </ContainerInstrument>
              
              <ContainerInstrument plain className="max-h-[320px] overflow-y-auto no-scrollbar px-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <ButtonInstrument
                      key={n.id}
                      variant="plain"
                      size="none"
                      onClick={() => { markAsRead(n.id); }}
                      className={`w-full text-left p-2 rounded-xl transition-all duration-300 group mb-1 last:mb-0 flex gap-3 ${
                        (isAdmin ? n.read : n.isRead) ? 'opacity-50 hover:bg-va-black/5' : 'bg-primary/5 hover:bg-primary/10'
                      }`}
                    >
                      <ContainerInstrument plain className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === 'voice' ? 'bg-blue-500/10 text-blue-500' :
                        n.type === 'order' || n.type === 'order_update' ? 'bg-green-500/10 text-green-500' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {n.type === 'voice' ? <Mic2 size={14} /> : 
                         n.type === 'order' || n.type === 'order_update' ? <ShoppingBag size={14} /> : 
                         <Bell size={14} />}
                      </ContainerInstrument>
                      <ContainerInstrument plain className="flex-1 min-w-0">
                        <ContainerInstrument plain className="flex justify-between items-start mb-0.5">
                          <TextInstrument className="text-[13px] font-light text-va-black truncate pr-2">{n.title}</TextInstrument>
                          <TextInstrument className="text-[11px] text-va-black/30 whitespace-nowrap font-light">
                            {new Date(n.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
                          </TextInstrument>
                        </ContainerInstrument>
                        <TextInstrument className="text-[13px] text-va-black/60 leading-tight line-clamp-2 font-light">{n.message}</TextInstrument>
                      </ContainerInstrument>
                      {!n.isRead && (
                        <ContainerInstrument plain className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      )}
                    </ButtonInstrument>
                  ))
                ) : (
                  <ContainerInstrument plain className="p-8 text-center">
                    <Bell size={32} className="text-va-black/10 mx-auto mb-3" />
                    <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText  translationKey="nav.notifications_empty" defaultText="Geen nieuwe meldingen." /></TextInstrument>
                  </ContainerInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>
          </HeaderIcon>
        )}

        {/*  LANGUAGE ICON */}
        {showLanguage && (
          <LanguageSwitcher className={`w-10 h-10 rounded-full transition-all duration-500 cursor-pointer group flex items-center justify-center relative ${
            pathname.includes('/lang/') ? 'bg-primary text-white shadow-aura-sm' : 'hover:bg-va-black/5 text-va-black/40 hover:text-va-black'
          }`} />
        )}

        {/*  ACCOUNT ICON */}
        {showAccount && (
          <HeaderIcon 
            icon={User} 
            alt={t('nav.account_alt', 'Account')}
            isActive={auth.isAuthenticated && pathname.startsWith('/account')}
          >
            {auth.isAuthenticated ? (
              <ContainerInstrument plain className="p-1 space-y-0.5">
                <ContainerInstrument plain className="px-4 py-4 border-b border-black/5 mb-1 bg-va-off-white/30 rounded-t-[16px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={16} />
                    </div>
                    <div>
                      <TextInstrument className="text-[10px] font-bold text-va-black/30 tracking-[0.2em] uppercase leading-none">
                        <VoiceglotText translationKey="nav.logged_in_as" defaultText="Ingelogd als" />
                      </TextInstrument>
                      <TextInstrument className="text-[14px] font-medium text-va-black truncate max-w-[200px] mt-0.5">{auth.user?.email}</TextInstrument>
                    </div>
                  </div>
                  
                  {/* Toegang Sectie */}
                  <div className="mt-3 pt-3 border-t border-black/5">
                    <TextInstrument className="text-[9px] font-bold text-va-black/20 tracking-[0.1em] uppercase mb-2">
                      <VoiceglotText translationKey="nav.your_access" defaultText="Jouw Toegang" />
                    </TextInstrument>
                    <div className="flex flex-wrap gap-1.5">
                      <div className="px-2 py-0.5 bg-va-black text-white text-[9px] font-bold rounded-md tracking-wider uppercase">
                        <VoiceglotText translationKey="nav.access.customer" defaultText="Klant" />
                      </div>
                      {isAdmin && (
                        <div className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded-md tracking-wider uppercase">
                          <VoiceglotText translationKey="nav.access.admin" defaultText="Admin" />
                        </div>
                      )}
                      {(auth.user?.email?.includes('voices.') || isAdmin) && (
                        <div className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-md tracking-wider uppercase">
                          <VoiceglotText translationKey="nav.access.partner" defaultText="Partner" />
                        </div>
                      )}
                    </div>
                  </div>
                </ContainerInstrument>
            {isAdmin && (
              <DropdownItem icon={LayoutDashboard} 
                label={<VoiceglotText translationKey="nav.admin_dashboard" defaultText="Admin Dashboard" />} 
                href="/admin/dashboard/" 
                variant="primary" 
                badge={t('common.admin', "Admin")} />
            )}
            {isAdmin && (
              <ButtonInstrument
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEditMode();
                  playClick(isEditMode ? 'light' : 'pro');
                }}
                variant="plain"
                size="none"
                className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl transition-all duration-300 group ${
                  isEditMode ? 'bg-primary/10 text-primary' : 'text-va-black/80 hover:text-va-black hover:bg-va-black/5'
                }`}
              >
                <ContainerInstrument plain className="flex items-center gap-2.5">
                  <Settings size={16} className={!isEditMode ? 'text-va-black/40 group-hover:text-va-black' : ''} />
                  <TextInstrument className="text-[15px] font-medium tracking-tight">
                    <VoiceglotText translationKey="nav.edit_mode" defaultText={isEditMode ? "Edit Mode: AAN" : "Edit Mode: UIT"} />
                  </TextInstrument>
                </ContainerInstrument>
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isEditMode ? 'bg-primary' : 'bg-va-black/10'}`}>
                  <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all duration-300 ${isEditMode ? 'left-5' : 'left-1'}`} />
                </div>
              </ButtonInstrument>
            )}
            <DropdownItem icon={User} label={<VoiceglotText translationKey="nav.my_profile" defaultText="Mijn profiel" />} href="/account/" />
            <DropdownItem icon={ShoppingBag} label={<VoiceglotText translationKey="nav.orders" defaultText="Bestellingen" />} href="/account/orders/" />
            <DropdownItem icon={Heart} label={<VoiceglotText translationKey="nav.favorites" defaultText="Favorieten" />} href="/account/favorites/" badge={favoritesCount > 0 ? favoritesCount : undefined} />
            <DropdownItem icon={Info} label={<VoiceglotText translationKey="nav.settings" defaultText="Instellingen" />} href="/account/settings/" />
                <DropdownItem icon={LogOut} 
                  label={<VoiceglotText  translationKey="nav.logout" defaultText="Uitloggen" />} 
                  onClick={() => { auth.logout(); }} 
                  variant="danger" 
                />
              </ContainerInstrument>
            ) : (
              <ContainerInstrument plain className="p-1 space-y-2 text-center">
                <ContainerInstrument className="w-8 h-8 bg-va-black/5 rounded-full flex items-center justify-center mx-auto mb-1">
                  <User size={16} className="text-va-black/20" />
                </ContainerInstrument>
                <ContainerInstrument plain className="px-3">
                  <HeadingInstrument level={4} className="text-base font-light tracking-tight mb-0.5 ">
                    <VoiceglotText  translationKey="nav.welcome_title" defaultText="Welkom bij Voices" />
                  </HeadingInstrument>
                  <TextInstrument className="text-[11px] text-va-black/40 font-light leading-snug">
                    <VoiceglotText  translationKey="nav.welcome_text" defaultText="Log in om je favoriete stemmen op te slaan en bestellingen te beheren." />
                  </TextInstrument>
                </ContainerInstrument>
                
                <ContainerInstrument plain className="space-y-2 px-1.5 pb-1.5">
                  {loginStatus === 'success' ? (
                    <ContainerInstrument plain className="py-4 px-2 bg-green-500/10 rounded-xl animate-in zoom-in-95 duration-500">
                      <Mail size={24} className="text-green-500 mx-auto mb-2 animate-bounce" />
                      <TextInstrument className="text-[13px] font-medium text-green-600">
                        {loginMessage}
                      </TextInstrument>
                      <TextInstrument className="text-[10px] text-green-600/60 mt-1">
                        <VoiceglotText 
                          translationKey="nav.login.link_sent_to_v2" 
                          defaultText="Link verstuurd naar {email}" 
                          values={{ email: loginEmail }}
                        />
                      </TextInstrument>
                    </ContainerInstrument>
                  ) : (
                    <form onSubmit={handleMagicLinkRequest} className="space-y-4">
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/30 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                          type="email"
                          placeholder={t('nav.login.email_placeholder', "E-mailadres")}
                          className="w-full py-4 pl-12 pr-4 rounded-xl bg-va-off-white border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all text-[15px] font-light outline-none text-va-black placeholder:text-va-black/20"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          disabled={loginStatus === 'loading'}
                        />
                      </div>
                      
                      {loginStatus === 'error' && (
                        <TextInstrument className="text-[12px] text-red-500 px-1 font-medium">
                          {loginMessage}
                        </TextInstrument>
                      )}

                      <ButtonInstrument 
                        type="submit"
                        variant="pure"
                        disabled={loginStatus === 'loading' || !loginEmail}
                        className="w-full py-4 bg-va-black text-white rounded-xl text-[15px] font-medium tracking-[0.1em] hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-aura-sm disabled:opacity-50 active:scale-[0.98]"
                      >
                        {loginStatus === 'loading' ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <VoiceglotText translationKey="nav.login_magic_cta" defaultText="Stuur Magic Link" />
                            <ArrowRight size={18} strokeWidth={2} />
                          </>
                        )}
                      </ButtonInstrument>
                      
                      <div className="flex items-center gap-2 py-1">
                        <div className="h-[1px] flex-1 bg-black/5" />
                        <TextInstrument className="text-[11px] font-bold text-va-black/20 tracking-widest uppercase"><VoiceglotText translationKey="common.or" defaultText="of" /></TextInstrument>
                        <div className="h-[1px] flex-1 bg-black/5" />
                      </div>

                      <ButtonInstrument 
                        as={VoicesLink}
                        href="/account/" 
                        variant="ghost"
                        className="block w-full py-4 border-2 border-black/5 text-va-black/60 rounded-xl text-[15px] font-light tracking-widest hover:bg-va-black/5 hover:text-va-black transition-all text-center"
                      >
                        <VoiceglotText translationKey="nav.register_cta" defaultText="Account aanmaken" />
                      </ButtonInstrument>
                    </form>
                  )}
                </ContainerInstrument>
              </ContainerInstrument>
            )}
          </HeaderIcon>
        )}

        {/*  MENU ICON */}
        {showMenu && (
          <HeaderIcon 
            icon={Menu} 
            alt={t('nav.menu_alt', 'Menu')}
            isActive={isMobile}
          >
            <ContainerInstrument plain className="p-1 space-y-1">
              {isMobile && (
                <>
                  <ContainerInstrument plain className="px-4 py-3 border-b border-black/5 mb-1">
                    <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-[0.2em] uppercase">
                      <VoiceglotText translationKey="nav.mobile_menu_label" defaultText="Menu" />
                    </TextInstrument>
                  </ContainerInstrument>
                  <DropdownItem icon={Home} label={<VoiceglotText translationKey="nav.home" defaultText="Home" />} href="/" />
                  {activeLinks.map((link: any) => (
                    <DropdownItem 
                      key={link.name}
                      icon={ChevronRight} 
                      label={<VoiceglotText translationKey={link.key || `nav.${(link.name || '').toLowerCase().replace(/\s+/g, '_')}`} defaultText={link.name || ''} />} 
                      href={link.href !== '#' ? link.href : undefined}
                      onClick={link.onClick} 
                    />
                  ))}
                  <DropdownItem icon={Heart} label={<VoiceglotText translationKey="nav.favorites" defaultText="Favorieten" />} href="/account/favorites/" badge={favoritesCount > 0 ? favoritesCount : undefined} />
                  {!isPortfolioMarket && <DropdownItem icon={ShoppingCart} label={<VoiceglotText translationKey="nav.cart" defaultText="Winkelmandje" />} href="/checkout/" badge={cartCount > 0 ? cartCount : undefined} />}
                  <DropdownItem icon={User} label={<VoiceglotText translationKey="nav.account" defaultText={auth.isAuthenticated ? "Mijn Account" : "Inloggen"} />} href="/account/" />
                  <div className="h-px bg-black/5 mx-2 my-1" />
                </>
              )}
              
              {!isMobile && activeLinks.map((link: any) => (
                <DropdownItem key={link.name}
                  icon={ChevronRight} 
                  label={<VoiceglotText translationKey={link.key || `nav.${(link.name || '').toLowerCase().replace(/\s+/g, '_')}`} defaultText={link.name || ''} />} 
                  href={link.href !== '#' ? link.href : undefined}
                  onClick={link.onClick} />
              ))}

              {/* Footer Links Integration (Nuclear Sync) */}
              {!isSpecialJourney && (
                <ContainerInstrument plain className="mt-1.5 pt-1.5 border-t border-black/5">
                  {[
                    { name: 'Hoe werkt het', href: '/agency/zo-werkt-het/', icon: Info, key: 'nav.extra.how_it_works' },
                    { name: 'Tarieven', href: '/tarieven/', icon: Euro, key: 'nav.extra.rates' },
                    { name: 'Ons verhaal', href: '/agency/over-ons/', icon: Quote, key: 'nav.extra.story' },
                  ].map((item) => (
                    <DropdownItem 
                      key={item.name}
                      icon={item.icon || ChevronRight}
                      label={<VoiceglotText translationKey={item.key} defaultText={item.name} />}
                      href={item.href}
                    />
                  ))}
                </ContainerInstrument>
              )}
              
              <ContainerInstrument plain className="mt-1 px-1 py-1">
                {!isSpecialJourney && (
                  <>
                    <div className="px-3 py-3 border-t border-black/5 mb-1">
                      <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-[0.2em] uppercase">
                        <VoiceglotText translationKey="nav.menu.categories_title" defaultText="Stemmen per categorie" />
                      </TextInstrument>
                    </div>
                    
                    <ContainerInstrument plain className="space-y-0.5">
                      {[
                        { label: 'TV Spot', icon: Monitor, href: '/agency/commercial/tv', key: 'category.tv' },
                        { label: 'Radio', icon: Radio, href: '/agency/commercial/radio', key: 'category.radio' },
                        { label: 'Online', icon: Globe, href: '/agency/commercial/online', key: 'category.online' },
                        { label: 'Podcast', icon: Mic2, href: '/agency/commercial/podcast', key: 'category.podcast' },
                        { label: 'Telefonie', icon: Phone, href: '/agency/telephony', key: 'category.telefoon' },
                        { label: 'Corporate', icon: Building2, href: '/agency/video', key: 'category.corporate' }
                      ].map((cat) => (
                        <DropdownItem 
                          key={cat.label}
                          icon={cat.icon}
                          label={<VoiceglotText translationKey={cat.key} defaultText={cat.label} />}
                          href={cat.href}
                        />
                      ))}
                    </ContainerInstrument>
                    
                    <div className="mt-4 px-1">
                      <ButtonInstrument 
                        as={VoicesLink}
                        href="/agency/"
                        variant="default"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-va-black text-white rounded-xl text-[15px] font-light tracking-widest hover:bg-primary transition-all shadow-lg"
                      >
                        <VoiceglotText translationKey="nav.menu.discover_all" defaultText="Ontdek alle stemmen" />
                        <ChevronRight size={16} />
                      </ButtonInstrument>
                    </div>
                  </>
                )}
              </ContainerInstrument>

          <ContainerInstrument plain className="mt-2 pt-2 border-t border-black/5">
            <DropdownItem icon={Mail} 
              label={<VoiceglotText  translationKey="nav.support" defaultText="Support" />} 
              href="/contact/" 
            />
          </ContainerInstrument>
            </ContainerInstrument>
          </HeaderIcon>
        )}
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
