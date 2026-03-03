"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { normalizeSlug } from '@/lib/system/slug';
import { emitNavigationFeedbackStart } from '@/lib/utils/navigation-feedback';
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

interface VoicesLinkInstrumentProps extends LinkProps {
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onTouchStart?: (e: React.TouchEvent<HTMLAnchorElement>) => void;
  title?: string;
  entityId?: number;
  routingType?: string;
}

function isModifiedNavigationEvent(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export const VoicesLinkInstrument = ({ 
  href, 
  children, 
  className, 
  entityId,
  routingType,
  onClick,
  onMouseEnter,
  onTouchStart,
  prefetch,
  ...props 
}: VoicesLinkInstrumentProps) => {
  const { language } = useTranslation();
  const pathname = usePathname();
  const router = useNextRouter();
  const [resolvedHref, setResolvedHref] = React.useState<string | null>(null);

  // 🛡️ DNA-ROUTING: Resolve entityId to slug on the fly if needed
  React.useEffect(() => {
    if (entityId && routingType) {
      const fetchSlug = async () => {
        try {
          const response = await fetch(`/api/admin/config?type=resolve-dna&entityId=${entityId}&routingType=${routingType}`);
          const data = await response.json();
          if (data.slug) setResolvedHref(data.slug);
        } catch (err) {
          console.error(`[VoicesLinkInstrument] DNA Resolve failed`, err);
        }
      };
      fetchSlug();
    }
  }, [entityId, routingType]);

    // 1. Bepaal de finale URL
  const getLocalizedHref = () => {
    const rawHref = resolvedHref || href?.toString() || '/';
    
    // 🛡️ CHRIS-PROTOCOL: Handle undefined or empty href (v2.16.134)
    if ((!href && !resolvedHref) || rawHref === 'undefined' || rawHref === '') {
      console.warn(`[VoicesLinkInstrument] Undefined or empty href detected, falling back to anchor: #`);
      return '#';
    }

    // Uitzonderingen: externe links, anchors, of mailto/tel
    if (rawHref.startsWith('http') || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return rawHref;
    }

    // Normaliseer de href
    const normalized = normalizeSlug(rawHref);
    
    // Als we in NL zitten (default), voegen we geen prefix toe (Bob-methode)
    if (language.startsWith('nl')) {
      return normalized.startsWith('/') ? normalized : `/${normalized}`;
    }

    // Voor andere talen: voeg de prefix toe als die er nog niet staat
    // 🛡️ CHRIS-PROTOCOL: Public URLs MUST use 2-char language codes
    const shortLang = language.split('-')[0];
    const prefix = `/${shortLang}`;
    if (normalized.startsWith(shortLang + '/') || normalized === shortLang) {
      return normalized.startsWith('/') ? normalized : `/${normalized}`;
    }

    const finalPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
    return `${prefix}${finalPath === '/' ? '' : finalPath}`;
  };

  const localizedHref = getLocalizedHref();
  const isInternalHref = localizedHref.startsWith('/');

  React.useEffect(() => {
    if (!isInternalHref) return;
    router.prefetch(localizedHref);
  }, [isInternalHref, localizedHref, router]);

  const triggerWarmup = (eventTargetHref: string) => {
    if (!eventTargetHref.startsWith('/')) return;
    router.prefetch(eventTargetHref);
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (
      isInternalHref &&
      (props.target === undefined || props.target === '_self') &&
      !isModifiedNavigationEvent(event) &&
      pathname !== localizedHref
    ) {
      emitNavigationFeedbackStart();
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onMouseEnter?.(event);
    if (event.defaultPrevented) return;
    triggerWarmup(localizedHref);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLAnchorElement>) => {
    onTouchStart?.(event);
    if (event.defaultPrevented) return;
    triggerWarmup(localizedHref);
  };

  return (
    <Link 
      href={localizedHref} 
      className={className}
      prefetch={isInternalHref ? (prefetch ?? true) : false}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </Link>
  );
};

VoicesLinkInstrument.displayName = 'VoicesLinkInstrument';

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
    const shortLang = language.split('-')[0];
    const prefix = shortLang === 'nl' ? '' : `/${shortLang}`;
    const finalPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
    const localizedHref = `${prefix}${finalPath === '/' ? '' : finalPath}`;
    
    emitNavigationFeedbackStart();
    router.push(localizedHref, options);
  };

  const replace = (href: string, options?: any) => {
    if (href.startsWith('http') || href.startsWith('#')) {
      router.replace(href, options);
      return;
    }

    const normalized = normalizeSlug(href);
    const shortLang = language.split('-')[0];
    const prefix = shortLang === 'nl' ? '' : `/${shortLang}`;
    const finalPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
    const localizedHref = `${prefix}${finalPath === '/' ? '' : finalPath}`;
    
    emitNavigationFeedbackStart();
    router.replace(localizedHref, options);
  };

  return {
    ...router,
    push,
    replace
  };
};
