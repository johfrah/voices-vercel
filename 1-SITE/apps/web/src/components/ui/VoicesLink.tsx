"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { normalizeSlug } from '@/lib/system/slug';
import Link, { LinkProps } from 'next/link';
import { usePathname, useRouter as useNextRouter } from 'next/navigation';
import React, { ReactNode } from 'react';

/**
 * 🔗 VOICES LINK INSTRUMENT - 2026 EDITION
 * 
 * Een taalbewuste vervanger voor de standaard Next.js <Link>.
 * Voorkomt "Language Leaks" door automatisch de huidige taalprefix te behouden.
 * 
 * @mandaat MARK-CONVERSION, MOBY-INTERACTION
 */

interface VoicesLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
}

export const VoicesLink = ({ 
  href, 
  children, 
  className, 
  ...props 
}: VoicesLinkProps) => {
  const { language } = useTranslation();

  // 1. Bepaal de finale URL
  const getLocalizedHref = () => {
    const rawHref = href?.toString() || '/';
    
    // Uitzonderingen: externe links, anchors, of mailto/tel
    if (rawHref.startsWith('http') || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return rawHref;
    }

    // Normaliseer de href
    const normalized = normalizeSlug(rawHref);
    
    // Als we in NL zitten (default), voegen we geen prefix toe (Bob-methode)
    if (language === 'nl') {
      return normalized.startsWith('/') ? normalized : `/${normalized}`;
    }

    // Voor andere talen: voeg de prefix toe als die er nog niet staat
    const prefix = `/${language}`;
    if (normalized.startsWith(language + '/') || normalized === language) {
      return normalized.startsWith('/') ? normalized : `/${normalized}`;
    }

    const finalPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
    return `${prefix}${finalPath === '/' ? '' : finalPath}`;
  };

  const localizedHref = getLocalizedHref();

  return (
    <Link 
      href={localizedHref} 
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
};

VoicesLink.displayName = 'VoicesLink';

/**
 * 🧠 USE VOICES ROUTER HOOK
 * Voor programmatische navigatie (router.push) met taalbehoud.
 */
export const useVoicesRouter = () => {
  const router = useNextRouter();
  const { language } = useTranslation();

  const push = (href: string, options?: any) => {
    if (href.startsWith('http') || href.startsWith('#')) {
      router.push(href, options);
      return;
    }

    const normalized = normalizeSlug(href);
    const prefix = language === 'nl' ? '' : `/${language}`;
    const finalPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
    const localizedHref = `${prefix}${finalPath === '/' ? '' : finalPath}`;
    
    router.push(localizedHref, options);
  };

  const replace = (href: string, options?: any) => {
    if (href.startsWith('http') || href.startsWith('#')) {
      router.replace(href, options);
      return;
    }

    const normalized = normalizeSlug(href);
    const prefix = language === 'nl' ? '' : `/${language}`;
    const finalPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
    const localizedHref = `${prefix}${finalPath === '/' ? '' : finalPath}`;
    
    router.replace(localizedHref, options);
  };

  return {
    ...router,
    push,
    replace
  };
};
