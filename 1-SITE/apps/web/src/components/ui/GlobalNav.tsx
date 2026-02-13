"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { MarketManager } from '@config/market-manager';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Activity, 
  Bell, 
  Brain, 
  Lock, 
  Mail, 
  Unlock, 
  User, 
  Heart, 
  ShoppingBag, 
  LogOut, 
  Settings, 
  LayoutDashboard,
  ChevronRight,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

import { TextInstrument } from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { LanguageSwitcher } from './LanguageSwitcher';

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
  isActive
}: { 
  src?: string, 
  icon?: any,
  alt: string, 
  badge?: number, 
  children?: React.ReactNode,
  onClick?: () => void,
  href?: string,
  isActive?: boolean
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
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        onClick={() => {
          playClick('soft');
          if (onClick) onClick();
        }}
        className={`p-2 rounded-xl transition-all duration-500 cursor-pointer group/icon ${
          isActive ? 'bg-primary/10 text-primary' : 'hover:bg-va-black/5 text-va-black'
        }`}
      >
        {src ? (
          <Image 
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

        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[15px] font-medium rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            {badge}
          </span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && children && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-80 bg-white/80 backdrop-blur-2xl rounded-[24px] shadow-aura border border-black/5 overflow-hidden z-50"
          >
            <div className="p-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (href && !children) {
    return <Link href={href}>{content}</Link>;
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
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
        variant === 'danger' ? 'hover:bg-red-50 text-red-500' : 
        variant === 'primary' ? 'hover:bg-primary/10 text-primary' :
        'hover:bg-va-black/5 text-va-black/60 hover:text-va-black'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={16} strokeWidth={variant === 'primary' ? 2 : 1.5} />
        <span className="text-[15px] font-medium tracking-widest">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[15px] font-medium rounded-md">
            {badge}
          </span>
        )}
        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
};

export default function GlobalNav() {
  const pathname = usePathname();
  const { playClick, playSwell } = useSonicDNA();
  const { isEditMode, toggleEditMode, canEdit } = useEditMode();
  const auth = useAuth();
  const isAdmin = auth.isAdmin;
  const market = MarketManager.getCurrentMarket(); 
  const [mounted, setMounted] = useState(false);
  const [links, setLinks] = useState<any[]>([
    { name: 'Onze Stemmen', href: '/agency', key: 'nav.my_voice' },
    { name: 'Werkwijze', href: '/#how-it-works', key: 'nav.how_it_works' },
    { name: 'Tarieven', href: '/tarieven', key: 'nav.pricing' },
    { name: 'Contact', href: '/contact', key: 'nav.contact' }
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
        { name: 'Contact', href: '/contact', key: 'nav.contact' }
      ]);
    } else if (market.market_code === 'YOUSSEF') {
      setLinks([
        { name: 'The Story', href: '/#story', key: 'nav.artist_story' },
        { name: 'Music', href: '/#music', key: 'nav.artist_music' },
        { name: 'Support', href: '/#support', key: 'nav.artist_support' },
        { name: 'Contact', href: '/contact', key: 'nav.contact' }
      ]);
    }
  }, [market.market_code]);

  if (!mounted) return null;

  const isSpecialJourney = market.market_code === 'JOHFRAH' || market.market_code === 'YOUSSEF' || market.market_code === 'ADEMING';

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-4 md:px-6 py-4 md:py-6 flex justify-between items-center bg-white/40 backdrop-blur-3xl border-b border-black/5 golden-curve">
      <Link 
        href="/" 
        className="flex items-center gap-2 md:gap-3 group"
        onClick={() => playClick('soft')}
        onMouseEnter={() => playSwell()}
      >
        {market.market_code === 'JOHFRAH' || (typeof window !== 'undefined' && window.location.host.includes('johfrah.be')) ? (
          <span className="text-xl font-light tracking-tighter transition-transform duration-500 group-hover:scale-105 text-va-black whitespace-nowrap">
            JOHFRAH LEFEBVRE
          </span>
        ) : market.market_code === 'YOUSSEF' ? (
          <span className="text-xl font-light tracking-tighter transition-transform duration-500 group-hover:scale-105 text-va-black whitespace-nowrap">
            YOUSSEF ZAKI
          </span>
        ) : (
          <VoiceglotImage 
            src={market.logo_url} 
            alt={market.name} 
            width={142} 
            height={56}
            priority={true}
            journey="common"
            category="branding"
            className="h-14 w-auto transition-transform duration-500 group-hover:scale-105"
            style={{ width: 'auto', height: 'auto' }}
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
            className={`text-[15px] font-medium tracking-widest transition-all duration-500 uppercase ${
              pathname.startsWith(link.href) ? 'text-primary' : 'text-va-black/30 hover:text-va-black'
            }`}
          >
            <VoiceglotText translationKey={link.key || `nav.${(link.name || '').toLowerCase()}`} defaultText={link.name || ''} />
          </Link>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        {/* 🍔 MENU ICON */}
        <HeaderIcon 
          src="/assets/common/branding/icons/MENU.svg" 
          alt="Menu"
        >
          <div className="p-2 space-y-1">
            <div className="px-4 py-3 border-b border-black/5 mb-2">
              <TextInstrument className="text-[15px] font-medium text-va-black/30 tracking-[0.2em] ">Navigatie</TextInstrument>
            </div>
            {links.map((link) => (
              <DropdownItem 
                key={link.href}
                icon={ChevronRight} 
                label={link.name} 
                href={link.href}
              />
            ))}
            <div className="mt-2 pt-2 border-t border-black/5">
              <DropdownItem 
                icon={Mail} 
                label="Support" 
                href="/contact" 
              />
            </div>
          </div>
        </HeaderIcon>

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
                <div className="px-4 py-4 border-b border-black/5 mb-2">
                  <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest mb-1">Ingelogd als</TextInstrument>
                  <TextInstrument className="text-sm font-light text-va-black truncate">{auth.user?.email}</TextInstrument>
                </div>
                {isAdmin && (
                  <DropdownItem 
                    icon={LayoutDashboard} 
                    label="Admin Dashboard" 
                    href="/admin/dashboard" 
                    variant="primary"
                    badge="God Mode"
                  />
                )}
                <DropdownItem icon={User} label="Mijn Profiel" href="/account" />
                <DropdownItem icon={ShoppingBag} label="Bestellingen" href="/account/orders" />
                <DropdownItem icon={Heart} label="Favorieten" href="/account/favorites" />
                <DropdownItem icon={Settings} label="Instellingen" href="/account/settings" />
                <div className="mt-2 pt-2 border-t border-black/5">
                  <DropdownItem 
                    icon={LogOut} 
                    label="Uitloggen" 
                    onClick={() => auth.logout()} 
                    variant="danger" 
                  />
                </div>
              </>
            ) : (
              <div className="p-4 space-y-4 text-center">
                <div className="w-12 h-12 bg-va-black/5 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User strokeWidth={1.5} size={24} className="text-va-black/20" />
                </div>
                <div>
                  <HeadingInstrument level={4} className="text-sm font-light tracking-tight mb-1 ">Welkom bij Voices</HeadingInstrument>
                  <TextInstrument className="text-[15px] text-va-black/40 font-light">Log in om je favoriete stemmen op te slaan en bestellingen te beheren.</TextInstrument>
                </div>
                <div className="space-y-2">
                  <Link href="/auth/login" className="block w-full py-3 bg-va-black text-white rounded-[10px] text-[15px] font-light tracking-widest hover:bg-primary transition-all">
                    Inloggen
                  </Link>
                  <Link href="/auth/register" className="block w-full py-3 border border-black/10 text-va-black rounded-[10px] text-[15px] font-light tracking-widest hover:bg-va-black/5 transition-all">
                    Account aanmaken
                  </Link>
                </div>
              </div>
            )}
          </HeaderIcon>
        )}

        {/* ❤️ FAVORITES ICON */}
        {!isSpecialJourney && (
          <HeaderIcon 
            src="/assets/common/branding/icons/FAVORITES.svg" 
            alt="Favorieten"
            href="/account/favorites"
          >
            <div className="p-4 text-center">
              <Heart size={24} className="text-primary/20 mx-auto mb-3" />
              <TextInstrument className="text-[15px] font-light tracking-widest mb-2">Jouw Favorieten</TextInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light mb-4">Je hebt nog geen stemmen opgeslagen.</TextInstrument>
              <Link href="/agency" className="text-[15px] font-light text-primary tracking-widest hover:underline">
                Ontdek stemmen
              </Link>
            </div>
          </HeaderIcon>
        )}

        {/* 🛍️ CART ICON */}
        {!isSpecialJourney && (
          <HeaderIcon 
            src="/assets/common/branding/icons/CART.svg" 
            alt="Winkelmandje" 
            badge={0}
            href="/checkout"
          >
            <div className="p-4 text-center">
              <ShoppingBag size={24} className="text-va-black/10 mx-auto mb-3" />
              <TextInstrument className="text-[15px] font-light tracking-widest mb-2">Winkelmandje</TextInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light mb-4">Je mandje is nog leeg.</TextInstrument>
              <Link href="/agency" className="block w-full py-3 bg-va-black text-white rounded-[10px] text-[15px] font-light tracking-widest hover:bg-primary transition-all">
                Start een project
              </Link>
            </div>
          </HeaderIcon>
        )}
      </div>
    </nav>
  );
}

function HeadingInstrument({ level, className, children }: { level: number, className?: string, children: React.ReactNode }) {
  const Tag = `h${level}` as any;
  return <Tag className={className}>{children}</Tag>;
}
