"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { MarketManager } from '@config/market-manager';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Building2, ChevronRight, Globe, Heart, LayoutDashboard, LogOut, Mail, Menu, Mic2, Monitor, Phone, Radio, ShoppingBag, ShoppingCart, User, Info, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { LanguageSwitcher } from './LanguageSwitcher';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { NavConfig } from '@/lib/config-bridge';

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
        variant="plain"
        size="none"
        as={href && !children ? Link : 'button'}
        href={href && !children ? href : undefined}
        onClick={() => {
          playClick('soft');
          if (onClick) onClick();
        }}
        className={`p-1 rounded-[8px] transition-all duration-500 cursor-pointer group/icon flex items-center justify-center min-w-[32px] h-[32px] ${
          isActive ? 'bg-primary/10 text-primary' : 'hover:bg-va-black/5 text-va-black'
        }`}
      >
        {src ? (
          <Image  
            src={src} 
            alt={alt} 
            width={18}
            height={18}
            className="w-4.5 h-4.5 transition-transform duration-500 group-hover/icon:scale-110" 
          />
        ) : Icon ? (
          <Icon strokeWidth={1.5} size={18} className="text-primary transition-transform duration-500 group-hover/icon:scale-110" />
        ) : null}

        {(badge !== undefined && badge > 0) || badgeText ? (
          <TextInstrument 
            as={motion.span}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg border border-white leading-none z-10 "
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
  const router = useRouter();

  const handleClick = () => {
    playClick(variant === 'primary' ? 'pro' : 'soft');
    if (onClick) onClick();
    if (href) router.push(href);
  };

  return (
    <ButtonInstrument
      onClick={handleClick}
      variant="plain"
      size="none"
      className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl transition-all duration-300 group ${
        variant === 'danger' ? 'text-red-500 hover:bg-red-50' : 
        variant === 'primary' ? 'text-primary hover:bg-primary/5' :
        'text-va-black/80 hover:text-va-black hover:bg-va-black/5'
      }`}
    >
      <ContainerInstrument plain className="flex items-center gap-2.5">
        {Icon ? (typeof Icon === 'function' || (typeof Icon === 'object' && Icon.$$typeof)) ? <Icon size={16} strokeWidth={1.5} className={variant === 'default' ? 'text-va-black/40 group-hover:text-va-black' : ''} /> : Icon : null}
        <TextInstrument className="text-[15px] font-medium tracking-tight">{label}</TextInstrument>
      </ContainerInstrument>
      <ContainerInstrument plain className="flex items-center gap-2">
        {badge && (
          <TextInstrument className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-light rounded-md">
            {badge}
          </TextInstrument>
        )}
        <ChevronRight strokeWidth={1.5} size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </ContainerInstrument>
    </ButtonInstrument>
  );
};

export default function GlobalNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { playClick, playSwell } = useSonicDNA();
  const { isEditMode, toggleEditMode, canEdit } = useEditMode();
  const { state: voicesState } = useVoicesState();
  const { state: checkoutState } = useCheckout();
  const auth = useAuth();
  const isAdmin = auth.isAdmin;
  const market = MarketManager.getCurrentMarket(); 
  const [mounted, setMounted] = useState(false);

  // Live data voor badges
  const favoritesCount = voicesState.selected_actors?.length || 0;
  const cartCount = checkoutState.items?.length || 0;
  
  //  NOTIFICATION LOGIC
  const [notifications, setNotifications] = useState([
    { id: 1, title: t('nav.notification.1.title', 'Nieuwe stem beschikbaar'), message: t('nav.notification.1.message', 'Johfrah heeft een nieuwe demo gepload.'), time: t('nav.notification.1.time', '2 min geleden'), read: false, type: 'voice' },
    { id: 2, title: t('nav.notification.2.title', 'Bestelling voltooid'), message: t('nav.notification.2.message', 'Je opname voor "Project X" is klaar.'), time: t('nav.notification.2.time', '1 uur geleden'), read: false, type: 'order' },
    { id: 3, title: t('nav.notification.3.title', 'Voicy Tip'), message: t('nav.notification.3.message', 'Wist je dat we nu ook AI-stemmen aanbieden?'), time: t('nav.notification.3.time', '3 uur geleden'), read: false, type: 'tip' }
  ]);
  const notificationsCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const [navConfig, setNavConfig] = useState<NavConfig | null>(null);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    
    //  BEPAAL JOURNEY KEY
    let journeyKey = 'agency';
    if (market.market_code === 'ADEMING') journeyKey = 'ademing';
    else if (market.market_code === 'JOHFRAH') journeyKey = 'johfrah';
    else if (market.market_code === 'YOUSSEF') journeyKey = 'youssef';
    else if (pathname.startsWith('/studio')) journeyKey = 'studio';
    else if (pathname.startsWith('/academy')) journeyKey = 'academy';

    const fetchNavConfig = async () => {
      try {
        const res = await fetch(`/api/admin/navigation/${journeyKey}/`);
        const data = await res.json();
        if (data && data.links) {
          setNavConfig(data);
          setLinks(data.links);
        } else {
          // Fallback naar defaults als er geen database config is
          const defaultLinks = [
            { name: 'Onze Stemmen', href: '/agency/', key: 'nav.my_voice' },
            { name: 'Werkwijze', href: '/over-ons/', key: 'nav.how_it_works' },
            { name: 'Tarieven', href: '/tarieven/', key: 'nav.pricing' },
            { name: 'FAQ', href: '/studio/veelgestelde-vragen/', key: 'nav.faq' },
            { name: 'Contact', href: '/contact/', key: 'nav.contact' }
          ];
          setLinks(defaultLinks);
        }
      } catch (error) {
        console.error('Failed to fetch nav config:', error);
        // Fallback bij error
        const defaultLinks = [
          { name: 'Onze Stemmen', href: '/agency/', key: 'nav.my_voice' },
          { name: 'Werkwijze', href: '/over-ons/', key: 'nav.how_it_works' },
          { name: 'Tarieven', href: '/tarieven/', key: 'nav.pricing' },
          { name: 'FAQ', href: '/studio/veelgestelde-vragen/', key: 'nav.faq' },
          { name: 'Contact', href: '/contact/', key: 'nav.contact' }
        ];
        setLinks(defaultLinks);
      }
    };

    fetchNavConfig();
  }, [market.market_code, pathname]);

  if (!mounted) return null;

  const isSpecialJourney = market.market_code === 'JOHFRAH' || market.market_code === 'YOUSSEF' || market.market_code === 'ADEMING';
  const isStudioJourney = pathname.startsWith('/studio') || pathname.startsWith('/academy');

  //  ICON VISIBILITY LOGIC
  const showFavorites = navConfig?.icons?.favorites ?? (!isSpecialJourney && !isStudioJourney);
  const showCart = navConfig?.icons?.cart ?? (!isSpecialJourney && !isStudioJourney);
  const showNotifications = navConfig?.icons?.notifications ?? !isSpecialJourney;
  const showLanguage = navConfig?.icons?.language ?? true;
  const showAccount = navConfig?.icons?.account ?? !isSpecialJourney;
  const showMenu = navConfig?.icons?.menu ?? true;

  // BOB-DEBUG: Ensure nav is always visible in dev
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <ContainerInstrument as="nav" className="absolute top-0 left-0 right-0 z-[200] px-4 md:px-6 py-1.5 md:py-2 flex items-center bg-white/40 backdrop-blur-3xl border-b border-black/5 golden-curve">
      <ContainerInstrument plain className="flex-1 flex justify-start">
        <ButtonInstrument 
          as={Link}
          href="/" 
          variant="plain"
          size="none"
          className="flex items-center gap-2 md:gap-3 group"
          onClick={() => { playClick('soft'); }}
          onMouseEnter={() => { playSwell(); }}
        >
        {navConfig?.logo?.src ? (
          <Image  
            src={navConfig.logo.src} 
            alt={navConfig.logo.alt || "Logo"} 
            width={navConfig.logo.width || 200} 
            height={navConfig.logo.height || 80}
            priority
            className="h-10 md:h-12 w-auto transition-transform duration-500 group-hover:scale-105 relative z-50"
          />
        ) : market.market_code === 'JOHFRAH' || (typeof window !== 'undefined' && window.location.host.includes('johfrah.be')) ? (
          <TextInstrument className="text-xl font-light tracking-tighter transition-transform duration-500 group-hover:scale-105 text-va-black whitespace-nowrap relative z-50"><VoiceglotText  translationKey="auto.globalnav.johfrah_lefebvre.95a724" defaultText="JOHFRAH LEFEBVRE" /></TextInstrument>
        ) : market.market_code === 'YOUSSEF' ? (
          <TextInstrument className="text-xl font-light tracking-tighter transition-transform duration-500 group-hover:scale-105 text-va-black whitespace-nowrap relative z-50"><VoiceglotText  translationKey="auto.globalnav.youssef_zaki.42bcfa" defaultText="YOUSSEF ZAKI" /></TextInstrument>
        ) : isStudioJourney ? (
          <Image  
            src="/assets/studio/common/branding/VSTUDIO.webp" 
            alt="Voices Studio" 
            width={240} 
            height={80}
            priority
            className="h-12 md:h-14 w-auto transition-transform duration-500 group-hover:scale-105 relative z-50"
          />
        ) : (
          <Image  
            src={market.logo_url} 
            alt={market.name} 
            width={200} 
            height={80}
            priority
            className="h-10 md:h-12 w-auto transition-transform duration-500 group-hover:scale-105 relative z-50"
          />
        )}
        </ButtonInstrument>
      </ContainerInstrument>

      <ContainerInstrument plain className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
        {links.slice(0, 5).map((link) => {
          const isActive = pathname.startsWith(link.href) && link.href !== '#';
          return (
            <ButtonInstrument 
              as={Link}
              key={link.name} 
              href={link.href}
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
              className={`relative text-[15px] font-light tracking-widest transition-all duration-500 ${
                isActive ? 'text-primary' : 'text-va-black/30 hover:text-va-black'
              }`}
            >
              <VoiceglotText  translationKey={link.key || `nav.${(link.name || '').toLowerCase().replace(/\s+/g, '_')}`} defaultText={link.name || ''} />
              
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

      <ContainerInstrument plain className="flex-1 flex gap-4 items-center justify-end relative z-50">
        {/*  FAVORITES ICON */}
        {showFavorites && (
          <HeaderIcon strokeWidth={1.5} icon={Heart} 
            alt={t('nav.favorites_alt', 'Favorieten')}
        badge={favoritesCount}
        href="/account/favorites/" />
    )}

    {/*  CART ICON */}
    {showCart && (
      <HeaderIcon strokeWidth={1.5} icon={ShoppingCart} 
        alt={t('nav.cart_alt', 'Winkelmandje')} 
        badge={cartCount}
        href="/checkout/"
        // CHRIS-PROTOCOL: On checkout page, don't show the dropdown, just link to checkout
        children={pathname === '/checkout' ? undefined : (
          <ContainerInstrument plain className="p-1 space-y-1">
            <ContainerInstrument plain className="px-4 py-2 border-b border-black/5 mb-1 flex justify-between items-center">
              <TextInstrument className="text-[13px] font-light text-va-black/30 tracking-[0.2em] uppercase">
                <VoiceglotText translationKey="nav.cart_title" defaultText="Winkelmandje" />
              </TextInstrument>
              <TextInstrument className="text-[11px] font-light text-va-black/40">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
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
                        {item.actor?.photo_url || item.actor?.image_url ? (
                          <Image src={item.actor.photo_url || item.actor.image_url} alt={item.actor.name || item.actor.display_name} fill className="object-cover" />
                        ) : (
                          <Mic2 size={18} strokeWidth={1.5} className="text-va-black/20" />
                        )}
                      </ContainerInstrument>
                      <ContainerInstrument plain className="flex-1 min-w-0">
                        <TextInstrument className="text-[14px] font-medium text-va-black truncate">
                          {item.actor?.display_name || item.actor?.name || 'Stemopname'}
                        </TextInstrument>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <TextInstrument className="text-[11px] text-va-black/40 font-light truncate uppercase tracking-widest">
                            {item.usage === 'commercial' ? 'Commercial' : item.usage === 'telefonie' ? 'Telefonie' : 'Corporate'}
                          </TextInstrument>
                          {item.country && (
                            <>
                              <span className="w-0.5 h-0.5 rounded-full bg-va-black/10" />
                              <TextInstrument className="text-[11px] text-va-black/40 font-light uppercase tracking-widest">
                                {Array.isArray(item.country) ? item.country[0] : item.country}
                              </TextInstrument>
                            </>
                          )}
                        </div>
                      </ContainerInstrument>
                      <div className="text-right flex flex-col items-end gap-0.5">
                        <TextInstrument className="text-[14px] font-medium text-va-black">
                          €{item.pricing?.total || item.pricing?.subtotal || 0}
                        </TextInstrument>
                        <TextInstrument className="text-[10px] text-va-black/20 font-light uppercase tracking-tighter">
                          Excl. BTW
                        </TextInstrument>
                      </div>
                    </ContainerInstrument>
                  ))}
                </ContainerInstrument>
              ) : (
                <ContainerInstrument plain className="p-8 text-center">
                  <ShoppingCart strokeWidth={1.5} size={32} className="text-va-black/10 mx-auto mb-3" />
                  <TextInstrument className="text-[15px] text-va-black/40 font-light">
                    <VoiceglotText translationKey="nav.cart_empty" defaultText="Je winkelmandje is leeg." />
                  </TextInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>

            {checkoutState.items.length > 0 && (
              <ContainerInstrument plain className="p-2 pt-3 border-t border-black/5 mt-1">
                <div className="flex justify-between items-center mb-3 px-2">
                  <TextInstrument className="text-[13px] font-light text-va-black/40">Subtotaal</TextInstrument>
                  <TextInstrument className="text-[15px] font-medium text-va-black">
                    €{checkoutState.items.reduce((sum: number, item: any) => sum + (item.pricing?.total || item.pricing?.subtotal || 0), 0)}
                  </TextInstrument>
                </div>
                <ButtonInstrument 
                  as={Link}
                  href="/checkout/"
                  variant="default"
                  className="w-full py-2.5 bg-va-black text-white rounded-xl text-[12px] font-light tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                >
                  <VoiceglotText translationKey="nav.cart_checkout" defaultText="Afrekenen" />
                  <ChevronRight size={14} strokeWidth={1.5} />
                </ButtonInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        )}
      >
      </HeaderIcon>
    )}

        {/*  NOTIFICATIONS ICON */}
        {showNotifications && (
          <HeaderIcon strokeWidth={1.5} 
            icon={Bell} 
            alt={t('nav.notifications_alt', 'Notificaties')}
            badge={notificationsCount}
          >
            <ContainerInstrument plain className="p-1 space-y-1">
              <ContainerInstrument plain className="px-4 py-2 border-b border-black/5 mb-1 flex justify-between items-center">
                <TextInstrument className="text-[13px] font-light text-va-black/30 tracking-[0.2em] "><VoiceglotText  translationKey="nav.notifications_title" defaultText="Notificaties" /></TextInstrument>
                {notificationsCount > 0 && (
                  <ButtonInstrument 
                    variant="link"
                    size="none"
                    onClick={() => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }}
                    className="text-[13px] font-light text-primary hover:underline"
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
                        n.read ? 'opacity-50 hover:bg-va-black/5' : 'bg-primary/5 hover:bg-primary/10'
                      }`}
                    >
                      <ContainerInstrument plain className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === 'voice' ? 'bg-blue-500/10 text-blue-500' :
                        n.type === 'order' ? 'bg-green-500/10 text-green-500' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {n.type === 'voice' ? <Mic2 strokeWidth={1.5} size={14} /> : 
                         n.type === 'order' ? <ShoppingBag strokeWidth={1.5} size={14} /> : 
                         <Bell strokeWidth={1.5} size={14} />}
                      </ContainerInstrument>
                      <ContainerInstrument plain className="flex-1 min-w-0">
                        <ContainerInstrument plain className="flex justify-between items-start mb-0.5">
                          <TextInstrument className="text-[13px] font-light text-va-black truncate pr-2">{n.title}</TextInstrument>
                          <TextInstrument className="text-[11px] text-va-black/30 whitespace-nowrap font-light">{n.time}</TextInstrument>
                        </ContainerInstrument>
                        <TextInstrument className="text-[13px] text-va-black/60 leading-tight line-clamp-2 font-light">{n.message}</TextInstrument>
                      </ContainerInstrument>
                      {!n.read && (
                        <ContainerInstrument plain className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      )}
                    </ButtonInstrument>
                  ))
                ) : (
                  <ContainerInstrument plain className="p-8 text-center">
                    <Bell strokeWidth={1.5} size={32} className="text-va-black/10 mx-auto mb-3" />
                    <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText  translationKey="nav.notifications_empty" defaultText="Geen nieuwe meldingen." /></TextInstrument>
                  </ContainerInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>
          </HeaderIcon>
        )}

        {/*  LANGUAGE ICON */}
        {showLanguage && (
          <LanguageSwitcher strokeWidth={1.5}  />
        )}

        {/*  ACCOUNT ICON */}
        {showAccount && (
          <HeaderIcon strokeWidth={1.5} 
            icon={User} 
            alt={t('nav.account_alt', 'Account')}
            isActive={auth.isAuthenticated}
          >
            {auth.isAuthenticated ? (
              <ContainerInstrument plain className="p-1 space-y-0.5">
                <ContainerInstrument plain className="px-3 py-2 border-b border-black/5 mb-1">
                  <TextInstrument className="text-[11px] font-light text-va-black/30 tracking-widest mb-0.5 "><VoiceglotText  translationKey="nav.logged_in_as" defaultText="Ingelogd als" /></TextInstrument>
                  <TextInstrument className="text-[13px] font-light text-va-black truncate">{auth.user?.email}</TextInstrument>
                </ContainerInstrument>
            {isAdmin && (
              <DropdownItem strokeWidth={1.5} icon={LayoutDashboard} 
                label={<VoiceglotText translationKey="nav.admin_dashboard" defaultText="Admin Dashboard" />} 
                href="/admin/dashboard/" 
                variant="primary" 
                badge="God Mode" />
            )}
            <DropdownItem strokeWidth={1.5} icon={User} label={<VoiceglotText translationKey="nav.my_profile" defaultText="Mijn profiel" />} href="/account/" />
            <DropdownItem strokeWidth={1.5} icon={ShoppingBag} label={<VoiceglotText translationKey="nav.orders" defaultText="Bestellingen" />} href="/account/orders/" />
            <DropdownItem strokeWidth={1.5} icon={Heart} label={<VoiceglotText translationKey="nav.favorites" defaultText="Favorieten" />} href="/account/favorites/" badge={favoritesCount > 0 ? favoritesCount : undefined} />
            <DropdownItem strokeWidth={1.5} icon={Info} label={<VoiceglotText translationKey="nav.settings" defaultText="Instellingen" />} href="/account/settings/" />
                <DropdownItem strokeWidth={1.5} icon={LogOut} 
                  label={<VoiceglotText  translationKey="nav.logout" defaultText="Uitloggen" />} 
                  onClick={() => { auth.logout(); }} 
                  variant="danger" 
                />
              </ContainerInstrument>
            ) : (
              <ContainerInstrument plain className="p-1 space-y-2 text-center">
                <ContainerInstrument className="w-8 h-8 bg-va-black/5 rounded-full flex items-center justify-center mx-auto mb-1">
                  <User strokeWidth={1.5} size={16} className="text-va-black/20" />
                </ContainerInstrument>
                <ContainerInstrument plain className="px-3">
                  <HeadingInstrument level={4} className="text-base font-light tracking-tight mb-0.5 ">
                    <VoiceglotText  translationKey="nav.welcome_title" defaultText="Welkom bij Voices" />
                  </HeadingInstrument>
                  <TextInstrument className="text-[11px] text-va-black/40 font-light leading-snug">
                    <VoiceglotText  translationKey="nav.welcome_text" defaultText="Log in om je favoriete stemmen op te slaan en bestellingen te beheren." />
                  </TextInstrument>
                </ContainerInstrument>
            <ContainerInstrument plain className="space-y-1 px-1.5 pb-1.5">
              <ButtonInstrument 
                as={Link}
                href="/account/" 
                variant="pure"
                className="block w-full py-2 bg-va-black text-white rounded-[10px] text-[11px] font-light tracking-widest hover:bg-va-black/80 transition-all "
              >
                <VoiceglotText  translationKey="nav.login_cta" defaultText="Inloggen" />
              </ButtonInstrument>
              <ButtonInstrument 
                as={Link}
                href="/account/" 
                variant="ghost"
                className="block w-full py-2 border border-black/10 text-va-black rounded-[10px] text-[11px] font-light tracking-widest hover:bg-va-black/5 transition-all "
              >
                <VoiceglotText  translationKey="nav.register_cta" defaultText="Account aanmaken" />
              </ButtonInstrument>
            </ContainerInstrument>
              </ContainerInstrument>
            )}
          </HeaderIcon>
        )}

        {/*  MENU ICON */}
        {showMenu && (
          <HeaderIcon strokeWidth={1.5} 
            icon={Menu} 
            alt={t('nav.menu_alt', 'Menu')}
          >
            <ContainerInstrument plain className="p-1 space-y-1">
              <ContainerInstrument plain className="px-4 py-2 border-b border-black/5 mb-1">
                <TextInstrument className="text-[13px] font-light text-va-black/30 tracking-[0.2em] "><VoiceglotText  translationKey="nav.navigation_label" defaultText="Navigatie" /></TextInstrument>
              </ContainerInstrument>
              {links.map((link) => (
                <DropdownItem strokeWidth={1.5} key={link.name}
                  icon={ChevronRight} 
                  label={<VoiceglotText translationKey={link.key || `nav.${(link.name || '').toLowerCase().replace(/\s+/g, '_')}`} defaultText={link.name || ''} />} 
                  href={link.href !== '#' ? link.href : undefined}
                  onClick={link.onClick} />
              ))}
              
              <ContainerInstrument plain className="mt-1.5 px-3 py-1.5 border-t border-black/5">
                <TextInstrument className="text-[12px] font-bold text-va-black/40 tracking-[0.1em] uppercase mb-3 "><VoiceglotText  translationKey="nav.menu.proefopname_title" defaultText="Direct naar proefopname" /></TextInstrument>
                <ContainerInstrument plain className="grid grid-cols-2 gap-2 mb-4">
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
                      variant="plain"
                      size="none"
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-va-off-white hover:bg-primary/5 hover:text-primary transition-all group border border-black/[0.03]"
                    >
                      <cat.icon size={14} strokeWidth={1.5} className="text-va-black/40 group-hover:text-primary transition-colors" />
                      <TextInstrument className="text-[13px] font-medium whitespace-nowrap">
                        <VoiceglotText  translationKey={cat.key} defaultText={cat.label} />
                      </TextInstrument>
                    </ButtonInstrument>
                  ))}
                </ContainerInstrument>

                <TextInstrument className="text-[12px] font-bold text-va-black/40 tracking-[0.1em] uppercase mb-3 "><VoiceglotText  translationKey="nav.menu.recommended_title" defaultText="Aanbevolen stemmen" /></TextInstrument>
                <ContainerInstrument plain className="space-y-1.5 mb-4">
                  {[
                    { name: 'Johfrah', type: 'Mannelijk', slug: 'johfrah', typeKey: 'gender.male' },
                    { name: 'Birgit', type: 'Vrouwelijk', slug: 'birgit', typeKey: 'gender.female' },
                    { name: 'Korneel', type: 'Mannelijk', slug: 'korneel', typeKey: 'gender.male' },
                    { name: 'Annelies', type: 'Vrouwelijk', slug: 'annelies-1', typeKey: 'gender.female' }
                  ].map((voice) => (
                    <ContainerInstrument plain key={voice.slug} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-va-black/5 transition-all group">
                      <ContainerInstrument plain className="flex items-center gap-3">
                        <ContainerInstrument plain className="w-8 h-8 rounded-full bg-va-black/5 flex items-center justify-center overflow-hidden border border-black/[0.03]">
                          <User strokeWidth={1.5} size={16} className="text-va-black/40" />
                        </ContainerInstrument>
                        <ContainerInstrument plain>
                          <TextInstrument className="text-[14px] font-medium text-va-black">{voice.name}</TextInstrument>
                          <TextInstrument className="text-[12px] text-va-black/60 font-light">
                            <VoiceglotText  translationKey={voice.typeKey} defaultText={voice.type} />
                          </TextInstrument>
                        </ContainerInstrument>
                      </ContainerInstrument>
                      <ButtonInstrument 
                        as={Link}
                        href={`/artist/${voice.slug}`}
                        variant="plain"
                        size="none"
                        className="px-3 py-1 bg-primary/10 text-primary rounded-[20px] text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                      ><VoiceglotText  translationKey="action.proefopname" defaultText="Proefopname" /></ButtonInstrument>
                    </ContainerInstrument>
                  ))}
                </ContainerInstrument>
                
            <ButtonInstrument 
              as={Link}
              href="/agency/"
              variant="default"
              className="flex items-center justify-center gap-2 w-full py-3 bg-va-black text-white rounded-xl text-[13px] font-medium tracking-widest hover:bg-primary transition-all shadow-lg"
            >
              <VoiceglotText  translationKey="nav.menu.discover_all" defaultText="Ontdek alle stemmen" />
            </ButtonInstrument>
          </ContainerInstrument>

          <ContainerInstrument plain className="mt-2 pt-2 border-t border-black/5">
            <DropdownItem strokeWidth={1.5} icon={Mail} 
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
