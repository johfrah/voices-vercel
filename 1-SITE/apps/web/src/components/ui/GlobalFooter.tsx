"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { usePathname } from 'next/navigation';
import { BreadcrumbsInstrument } from './BreadcrumbsInstrument';
import { Star, Check, Phone, Mail, Facebook, Instagram, Linkedin, Plus, Trash2, Link as LinkIcon, Search as SearchIcon, X, Quote, ChevronDown, Youtube, Music } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { isOfficeOpen, formatOpeningHours, getNextOpeningTime } from '@/lib/utils/delivery-logic';
import Image from 'next/image';
import { VoicesLink } from './VoicesLink';
import { ThemeToggle } from './ademing/ThemeToggle';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import toast from 'react-hot-toast';

import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { JourneyCta } from './JourneyCta';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { VoiceglotImage } from './VoiceglotImage';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { AgencyFooter } from './footers/AgencyFooter';
import { StudioFooter } from './footers/StudioFooter';
import { AcademyFooter } from './footers/AcademyFooter';
import { PortfolioFooter } from './footers/PortfolioFooter';
import { ArtistFooter } from './footers/ArtistFooter';

/**
 *  GLOBAL FOOTER (NUCLEAR 2026)
 * 
 * Volgt de Zero Laws:
 * - HTML ZERO: Geen rauwe HTML tags.
 * - CSS ZERO: Geen Tailwind classes direct in dit bestand.
 * - TEXT ZERO: Geen hardcoded strings.
 */
export default function GlobalFooter() {
  const { t } = useTranslation();
  const { playClick, playSwell } = useSonicDNA();
  const { state, reviewStats } = useVoicesState();
  const { state: masterControlState } = useMasterControl();
  const { isEditMode } = useEditMode();
  const { state: checkoutState } = useCheckout();
  const market = MarketManager.getCurrentMarket();

  const actor = checkoutState.selectedActor;
  const actorName = actor?.display_name || 'Johfrah Lefebvre';
  const actorFirstName = actor?.first_name || actor?.first_name || actorName.split(' ')[0];
  const actorLastName = actor?.last_name || actor?.last_name || actorName.split(' ').slice(1).join(' ');

  const [marketConfig, setMarketConfig] = useState<any>(null);
  const [generalSettings, setGeneralSettings] = useState<any>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isPortfolio = market.market_code === 'PORTFOLIO';
  const isArtist = market.market_code === 'ARTIST';
  const isAdeming = market.market_code === 'ADEMING';
  const isStudio = market.market_code === 'STUDIO';
  const isAcademy = market.market_code === 'ACADEMY';
  const isSpecial = isPortfolio || isArtist || isAdeming || isStudio || isAcademy;

  const activeSocials: Record<string, string> = marketConfig?.socialLinks || market.social_links || {};
  const activePhone = marketConfig?.phone || market.phone;
  const activeEmail = marketConfig?.email || market.email;

  const pathname = usePathname();
  const isCheckout = pathname === '/checkout';

  const isOrdering = masterControlState.currentStep !== 'voice';
  const showPortfolioFooter = isPortfolio && (actor as any)?.portfolio_tier && (actor as any)?.portfolio_tier !== 'none';

  const renderJourneyFooter = () => {
    if (isArtist) {
      return (
        <ArtistFooter 
          market={market} 
          activeSocials={activeSocials} 
          activePhone={activePhone} 
          activeEmail={activeEmail} 
        />
      );
    }

    if (showPortfolioFooter) {
      return (
        <PortfolioFooter 
          market={market} 
          actor={actor} 
          activeSocials={activeSocials} 
        />
      );
    }

    if (isAcademy) {
      return (
        <AcademyFooter 
          market={market} 
          activeSocials={activeSocials} 
          activePhone={activePhone} 
          activeEmail={activeEmail} 
        />
      );
    }

    if (isStudio) {
      return (
        <StudioFooter 
          market={market} 
          activeSocials={activeSocials} 
          activePhone={activePhone} 
          activeEmail={activeEmail} 
        />
      );
    }

    // Default: Agency Footer
    return (
      <AgencyFooter 
        market={market} 
        activeSocials={activeSocials} 
        activePhone={activePhone} 
        activeEmail={activeEmail} 
        reviewStats={reviewStats}
      />
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isEditMode) return;

      try {
        const [configRes, generalRes] = await Promise.all([
          fetch(`/api/admin/config/market?market=${market.market_code}`),
          fetch('/api/admin/config')
        ]);
        
        if (configRes.status !== 401 && configRes.status !== 403) {
          const configData = await configRes.json();
          setMarketConfig(configData);
        }

        if (generalRes.status !== 401 && generalRes.status !== 403) {
          const generalData = await generalRes.json();
          setGeneralSettings(generalData.general_settings);
        }
      } catch (e) {
        console.warn('Footer admin fetch skipped');
      }
    };
    fetchData();
  }, [market.market_code, isEditMode]);

  return (
    <footer className="bg-va-off-white text-va-black pt-24 pb-12 overflow-hidden relative border-t border-black/5 !px-0">
      {/* Liquid Gradient Background */}
      <ContainerInstrument className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none hmagic" />

      <ContainerInstrument className="max-w-[1140px] mx-auto px-6 relative z-10">
        {!isSpecial && <BreadcrumbsInstrument />}

        {/* Dynamic Journey Elements */}
        {!isSpecial && !isOrdering && !isCheckout && (
          <ContainerInstrument className="mb-24">
            <JourneyCta journey={isStudio ? 'general' : isAcademy ? 'general' : state.current_journey as any} />
          </ContainerInstrument>
        )}

        {renderJourneyFooter()}
      </ContainerInstrument>

      {/* Bottom Bar */}
      <ContainerInstrument className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <ContainerInstrument className="flex flex-col md:flex-row items-center gap-8">
          <TextInstrument className="flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/20 ">
             2026 {market.name}. {isSpecial && (
              <TextInstrument as="span">
                <VoiceglotText translationKey="footer.powered_by" defaultText="Portfolio powered by" />
                <ButtonInstrument as="a" href={MarketManager.getMarketDomains()['BE'] || `https://www.voices.${'be'}`} variant="plain" size="none" className="hover:text-va-black transition-colors underline decoration-black/10 underline-offset-4 ml-1">
                  <VoiceglotText  translationKey="auto.globalfooter.voices_be.46435e" defaultText={MarketManager.getCurrentMarket(MarketManager.getMarketDomains()['BE']?.replace('https://', '') || `www.voices.${'be'}`).name || `voices.${'be'}`} />
                </ButtonInstrument>
              </TextInstrument>
            )}
          </TextInstrument>
            
            <ContainerInstrument className="flex items-center gap-6">
              <VoicesLink href="/agency/voorwaarden" className="text-[11px] font-bold uppercase tracking-[0.2em] text-va-black/20 hover:text-va-black transition-colors">
                <VoiceglotText translationKey="footer.link.terms" defaultText="Voorwaarden" />
              </VoicesLink>
              <VoicesLink href="/privacy" className="text-[11px] font-bold uppercase tracking-[0.2em] text-va-black/20 hover:text-va-black transition-colors">
                <VoiceglotText translationKey="footer.link.privacy" defaultText="Privacy" />
              </VoicesLink>
            </ContainerInstrument>

            {/* Trust Logos (Kelly-Mandate) */}
            {!isSpecial && (
              <ContainerInstrument className="flex items-center gap-6 opacity-20 grayscale hover:grayscale-0 hover:opacity-50 transition-all duration-700">
                <Image src="/assets/common/branding/payment/mollie.svg" alt={t('common.payment.mollie', "Mollie")} width={60} height={20} className="h-4 w-auto" />
                <Image src="/assets/common/branding/payment/bancontact.svg" alt={t('common.payment.bancontact', "Bancontact")} width={30} height={20} className="h-5 w-auto" />
                <Image src="/assets/common/branding/payment/visa.svg" alt={t('common.payment.visa', "Visa")} width={40} height={20} className="h-3 w-auto" />
                <Image src="/assets/common/branding/payment/mastercard.svg" alt={t('common.payment.mastercard', "Mastercard")} width={30} height={20} className="h-5 w-auto" />
              </ContainerInstrument>
            )}
          </ContainerInstrument>
          
          <ContainerInstrument className="flex items-center gap-8">
            <ThemeToggle />
            <ContainerInstrument className="flex items-center gap-3 px-4 py-2 bg-va-black/5 rounded-full border border-black/5">
              {(() => {
                const isOpen = generalSettings?.opening_hours ? isOfficeOpen(generalSettings.opening_hours) : true;
                return (
                  <>
                    <TextInstrument as="span" className={cn("w-2 h-2 rounded-full animate-pulse font-light", isOpen ? "bg-green-500" : "bg-amber-500")} />
                    <TextInstrument as="span" className="text-[15px] font-light tracking-widest text-va-black/40 ">
                      {isOpen ? (
                        <>
                          <VoiceglotText translationKey="footer.status.online" defaultText="Wij staan voor u klaar" />
                          {generalSettings?.opening_hours && (
                            <span className="ml-2 opacity-50">({formatOpeningHours(generalSettings.opening_hours)})</span>
                          )}
                        </>
                      ) : (
                        <>
                          <VoiceglotText translationKey="footer.status.offline" defaultText="Terug bereikbaar" />
                          {(() => {
                            const next = generalSettings?.opening_hours ? getNextOpeningTime(generalSettings.opening_hours) : null;
                            return next ? (
                              <span className="ml-1 opacity-50">
                                <VoiceglotText translationKey="footer.status.back_at" defaultText={`vanaf ${next.day} om ${next.time}`} noTranslate={true} />
                              </span>
                            ) : null;
                          })()}
                        </>
                      )}
                    </TextInstrument>
                  </>
                );
              })()}
            </ContainerInstrument>
          </ContainerInstrument>
      </ContainerInstrument>
    </footer>
  );
}
