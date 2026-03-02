"use client";

import { usePathname } from 'next/navigation';
import { VoicesLinkInstrument as Link } from '@/components/ui/VoicesLinkInstrument';
import { ChevronRight, Home } from 'lucide-react';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

export const BreadcrumbsInstrument = () => {
  const pathname = usePathname();
  const market = MarketManager.getCurrentMarket();
  
  if (!pathname || pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  
  // We bouwen de breadcrumbs op
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    
    // Formatteer de label (slug naar tekst)
    let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    // Speciale mapping voor bekende routes
    if (segment === 'agency') label = 'Agency';
    if (segment === 'studio') label = 'Studio';
    if (segment === 'academy') label = 'Academy';
    if (segment === 'voice') label = 'Stemmen';
    
    return { label, href, isLast, segment };
  });

  return (
    <ContainerInstrument plain className="mb-12 flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      <Link href="/" className="text-va-black/20 hover:text-primary transition-colors">
        <Home size={14} strokeWidth={1.5} />
      </Link>
      
      {breadcrumbs.map((crumb, i) => (
        <div key={crumb.href} className="flex items-center gap-2 shrink-0">
          <ChevronRight size={12} className="text-va-black/10" strokeWidth={1.5} />
          {crumb.isLast ? (
            <TextInstrument as="span" className="text-[13px] font-medium text-va-black/40">
              <VoiceglotText 
                translationKey={`breadcrumb.${crumb.segment}`} 
                defaultText={crumb.label} 
              />
            </TextInstrument>
          ) : (
            <Link 
              href={crumb.href} 
              className="text-[13px] font-light text-va-black/20 hover:text-va-black transition-colors"
            >
              <VoiceglotText 
                translationKey={`breadcrumb.${crumb.segment}`} 
                defaultText={crumb.label} 
              />
            </Link>
          )}
        </div>
      ))}
    </ContainerInstrument>
  );
};
