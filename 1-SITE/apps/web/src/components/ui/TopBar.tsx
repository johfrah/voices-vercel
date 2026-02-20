"use client";

import { usePathname } from 'next/navigation';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Mail, Phone, UserCircle } from 'lucide-react';
import { MarketManager } from '@config/market-manager';
import { ContainerInstrument, TextInstrument, ButtonInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';

/**
 * TOP BAR COMPONENT
 * Subtiele bar boven de GlobalNav voor contactinfo en snelle acties.
 * Volgt de Bob-methode (UX) en Chris-Protocol (Discipline).
 */
export const TopBar = () => {
  const pathname = usePathname();
  const { playClick } = useSonicDNA();
  const market = MarketManager.getCurrentMarket();
  const { t } = useTranslation();

  const handleSpeakToStaff = () => {
    playClick('pro');
    localStorage.setItem('voices_persona_preference', 'staff');
    window.dispatchEvent(new CustomEvent('voices:persona_change', { detail: 'staff' }));
    window.dispatchEvent(new CustomEvent('voicy:open', { detail: { persona: 'staff', tab: 'chat' } }));
  };

  const handleOpenMail = (e: React.MouseEvent) => {
    e.preventDefault();
    playClick('pro');
    window.dispatchEvent(new CustomEvent('voicy:open', { detail: { tab: 'mail' } }));
  };

  const handleOpenPhone = (e: React.MouseEvent) => {
    e.preventDefault();
    playClick('pro');
    window.dispatchEvent(new CustomEvent('voicy:open', { detail: { tab: 'phone' } }));
  };

  const isAdeming = market.market_code === 'ADEMING';
  const isJohfrah = market.market_code === 'JOHFRAH';
  const isYoussef = market.market_code === 'YOUSSEF' || (typeof window !== 'undefined' && window.location.host.includes('youssefzaki.eu'));
  const isStudioJourney = pathname.startsWith('/studio');
  const isAcademyJourney = pathname.startsWith('/academy');
  const isPortfolioPage = pathname.includes('/portfolio/') || 
                          ['/demos', '/host', '/tarieven', '/bestellen', '/contact', '/over-mij', 
                           '/demos/', '/host/', '/tarieven/', '/bestellen/', '/contact/', '/over-mij/'].includes(pathname);

  // Alleen tonen op de Agency journey (Voices.be / Voices.nl etc.)
  if (isJohfrah || isAdeming || isYoussef || pathname.startsWith('/artist/') || pathname.startsWith('/voice/') || isPortfolioPage || isStudioJourney || isAcademyJourney) return null;

  return (
    <ContainerInstrument 
      as="div" 
      plain 
      className="hidden md:flex w-full bg-va-off-white/80 backdrop-blur-md border-b border-black/[0.03] py-2 px-4 md:px-6 justify-end items-center gap-6 relative z-[201]"
    >
      {/* Medewerker spreken (Nu in TopBar) */}
      <ButtonInstrument
        variant="plain"
        size="none"
        onClick={handleSpeakToStaff}
        className="flex items-center gap-2 group"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <TextInstrument className="text-[11px] font-light tracking-[0.1em] text-va-black/40 group-hover:text-va-black transition-colors">
          <VoiceglotText translationKey="nav.speak_to_staff" defaultText="Medewerker spreken" />
        </TextInstrument>
      </ButtonInstrument>

      {/* Telefoonnummer */}
      {market.phone && (
        <ButtonInstrument
          variant="plain"
          size="none"
          className="flex items-center gap-2 group"
          onClick={handleOpenPhone}
        >
          <Phone size={12} strokeWidth={2.5} className="text-va-black/20 group-hover:text-primary transition-colors" />
          <TextInstrument className="text-[11px] font-light tracking-[0.1em] text-va-black/40 group-hover:text-va-black transition-colors">
            {market.phone}
          </TextInstrument>
        </ButtonInstrument>
      )}

      {/* Emailadres */}
      {market.email && (
        <ButtonInstrument
          variant="plain"
          size="none"
          className="flex items-center gap-2 group"
          onClick={handleOpenMail}
        >
          <Mail size={12} strokeWidth={2.5} className="text-va-black/20 group-hover:text-primary transition-colors" />
          <TextInstrument className="text-[11px] font-light tracking-[0.1em] text-va-black/40 group-hover:text-va-black transition-colors">
            {market.email}
          </TextInstrument>
        </ButtonInstrument>
      )}
    </ContainerInstrument>
  );
};
