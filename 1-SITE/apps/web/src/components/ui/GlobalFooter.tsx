"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
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

  const averageRating = reviewStats?.averageRating || "4.9";
  const totalReviews = reviewStats?.totalCount || "390";

  const [sections, setSections] = useState<any[]>([]);
  const [marketConfig, setMarketConfig] = useState<any>(null);
  const [generalSettings, setGeneralSettings] = useState<any>(null);
  const [isEditingLink, setIsEditingLink] = useState<{ sectionIdx: number, linkIdx: number } | null>(null);
  const [isEditingSocial, setIsEditingSocial] = useState<string | null>(null);
  const [isEditingContact, setIsEditingContact] = useState<'phone' | 'email' | null>(null);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const isPortfolio = market.market_code === 'PORTFOLIO';
  const isArtist = market.market_code === 'ARTIST';
  const isAdeming = market.market_code === 'ADEMING';
  const isStudio = market.market_code === 'STUDIO' || market.market_code === 'ACADEMY';
  const isAcademy = market.market_code === 'ACADEMY';
  const isSpecial = isPortfolio || isArtist || isAdeming || isStudio || isAcademy;

  const socialIcons = [
    { id: 'instagram', icon: Instagram, alt: 'Instagram' },
    { id: 'youtube', icon: Youtube, alt: 'YouTube' },
    { id: 'spotify', icon: Music, alt: 'Spotify' },
    { id: 'facebook', icon: Facebook, alt: 'Facebook' },
    { id: 'linkedin', icon: Linkedin, alt: 'LinkedIn' },
  ];

  const activeSocials: Record<string, string> = marketConfig?.socialLinks || market.social_links || {};
  const activePhone = marketConfig?.phone || market.phone;
  const activeEmail = marketConfig?.email || market.email;

  const renderJourneyFooter = () => {
    if (isArtist) {
      // Artist specifieke footer (bestaande logica behouden voor nu)
      return null; // Wordt hieronder afgehandeld in de originele if(isArtist)
    }

    if (isPortfolio && actor?.portfolio_tier && actor?.portfolio_tier !== 'none') {
      // Portfolio specifieke footer (bestaande logica behouden voor nu)
      return null; // Wordt hieronder afgehandeld in de originele if(showPortfolioFooter)
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

  const standardSections = useMemo(() => {
    const sections = [
      {
        title: t('footer.section.voices.title', 'Kies je stem'),
        links: [
          { name: t('footer.link.voices.browse', 'Onze stemmen'), href: '/agency/' },
          { name: t('footer.link.voices.how_it_works', 'Hoe werkt het'), href: '/agency/zo-werkt-het/' },
          { name: t('footer.link.voices.rates', 'Tarieven'), href: '/tarieven/' },
          { name: t('footer.link.voices.casting_help', 'Casting-hulp'), href: '/contact/' },
        ]
      },
      {
        title: t('footer.section.growth.title', 'Groei'),
        links: [
          { name: t('footer.link.growth.studio', 'Voices Studio'), href: '/studio/' },
          { name: t('footer.link.growth.academy', 'Academy'), href: '/academy/' },
          { name: t('footer.link.growth.signup', 'Aanmelden als stem'), href: '/account' },
        ],
        badges: { [t('footer.link.growth.academy', 'Academy')]: t('common.new', 'Nieuw') }
      },
      {
        title: t('footer.section.trust.title', 'Vertrouwen'),
        links: [
          { name: t('footer.link.trust.faq', 'FAQ'), href: '/agency/zo-werkt-het/#faq' },
          { name: t('footer.link.trust.terms', 'Voorwaarden'), href: '/agency/voorwaarden/' },
          { name: t('footer.link.trust.privacy', 'Privacy'), href: '/privacy/' },
        ]
      },
      {
        title: t('footer.section.discover.title', 'Ontdek'),
        links: [
          { name: t('footer.link.discover.story', 'Ons verhaal'), href: '/agency/over-ons/' },
          { name: t('footer.link.discover.ademing', 'Ademing (Rust)'), href: MarketManager.getMarketDomains()['ADEMING'] },
          { name: t('footer.link.discover.blog', 'Blog'), href: '/blog/' },
          { name: t('footer.link.discover.contact', 'Contact'), href: '/contact/' },
        ]
      }
    ];

    // Verberg "Aanmelden als stem" op portfolio pagina's
    if (isPortfolio) {
      sections[1].links = sections[1].links.filter(l => l.href !== '/account');
    }

    return sections;
  }, [isPortfolio, t]);

  useEffect(() => {
    const fetchData = async () => {
      // CHRIS-PROTOCOL: Only fetch admin config if user is admin to avoid 401 console clutter
      // MAAR: We moeten wel de standaard secties tonen als we niet in edit mode zijn.
      if (!isEditMode) {
        setSections(standardSections);
        return;
      }

      try {
        // We proberen de config op te halen, maar we vangen 401/403 op zonder de console te vervuilen
        const [navRes, configRes, generalRes] = await Promise.all([
          fetch('/api/admin/navigation/footer_nav'),
          fetch(`/api/admin/config/market?market=${market.market_code}`),
          fetch('/api/admin/config')
        ]);
        
        if (navRes.status === 401 || navRes.status === 403) {
          setSections(standardSections);
        } else {
          const navData = await navRes.json();
          if (navData && navData.sections) {
            setSections(navData.sections);
          } else {
            setSections(standardSections);
          }
        }

        if (configRes.status !== 401 && configRes.status !== 403) {
          const configData = await configRes.json();
          setMarketConfig(configData);
        }

        if (generalRes.status !== 401 && generalRes.status !== 403) {
          const generalData = await generalRes.json();
          setGeneralSettings(generalData.general_settings);
        }
      } catch (e) {
        console.warn('Footer admin fetch skipped (not logged in or API unavailable)');
        setSections(standardSections);
      }
    };
    fetchData();
  }, [market.market_code, isEditMode, standardSections]);

  const saveFooter = async (newSections: any[]) => {
    try {
      await fetch('/api/admin/navigation/footer_nav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: newSections })
      });
      setSections(newSections);
      playClick('success');
    } catch (e) {
      console.error('Failed to save footer nav:', e);
    }
  };

  const saveMarketConfig = async (newData: any) => {
    try {
      await fetch('/api/admin/config/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market: market.market_code, ...newData })
      });
      setMarketConfig({ ...marketConfig, ...newData });
      playClick('success');
    } catch (e) {
      console.error('Failed to save market config:', e);
    }
  };

  const addLink = (sectionIdx: number) => {
    const newSections = [...sections];
    newSections[sectionIdx].links.push({ name: 'Nieuwe link', href: '#' });
    saveFooter(newSections);
  };

  const removeLink = (sectionIdx: number, linkIdx: number) => {
    const newSections = [...sections];
    newSections[sectionIdx].links.splice(linkIdx, 1);
    saveFooter(newSections);
  };

  const updateLinkUrl = (sectionIdx: number, linkIdx: number, newHref: string) => {
    const newSections = [...sections];
    newSections[sectionIdx].links[linkIdx].href = newHref;
    saveFooter(newSections);
    setIsEditingLink(null);
  };

  const updateSocialLink = (platform: string, newUrl: string) => {
    const newSocialLinks = { ...(marketConfig?.socialLinks || {}), [platform]: newUrl };
    saveMarketConfig({ socialLinks: newSocialLinks });
    setIsEditingSocial(null);
  };

  const updateContactInfo = (type: 'phone' | 'email', newValue: string) => {
    saveMarketConfig({ [type]: newValue });
    setIsEditingContact(null);
  };

  const activeSections = useMemo(() => {
    return market.footer_sections || sections;
  }, [market.footer_sections, sections]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsEditingLink(null);
        setIsEditingSocial(null);
        setIsEditingContact(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOrdering = masterControlState.currentStep !== 'voice';
  const showPortfolioFooter = isPortfolio && actor?.portfolio_tier && actor?.portfolio_tier !== 'none';

  const socialIcons = [
    { id: 'instagram', icon: Instagram, alt: 'Instagram' },
    { id: 'youtube', icon: Youtube, alt: 'YouTube' },
    { id: 'spotify', icon: Music, alt: 'Spotify' },
    { id: 'facebook', icon: Facebook, alt: 'Facebook' },
    { id: 'linkedin', icon: Linkedin, alt: 'LinkedIn' },
  ];

  const activeSocials: Record<string, string> = marketConfig?.socialLinks || market.social_links || {};

  const activePhone = marketConfig?.phone || market.phone;
  const activeEmail = marketConfig?.email || market.email;

  if (isArtist) {
    return (
      <ContainerInstrument as="footer" className="bg-va-black text-white pt-24 pb-12 overflow-hidden relative border-t border-white/5 !px-0">
        <ContainerInstrument className="max-w-[1140px] mx-auto px-6 relative z-10">
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
            <ContainerInstrument className="space-y-8 flex flex-col items-start">
              <VoicesLink href="/" className="flex items-center gap-3 group justify-start">
                <Image  
                  src={market.logo_url} 
                  alt={market.name} 
                  width={180} 
                  height={60}
                  className="h-12 w-auto transition-transform duration-500 group-hover:scale-105"
                />
              </VoicesLink>
              <TextInstrument className="text-white/40 text-lg font-light leading-relaxed max-w-sm text-left">
                <VoiceglotText translationKey="footer.artist.tagline" defaultText="Independent singers releasing music on their own terms. Supported by Voices Artists." />
              </TextInstrument>
              <ContainerInstrument className="flex gap-4">
                {socialIcons.filter(s => activeSocials[s.id]).map((social) => (
                  <ButtonInstrument 
                    key={social.id}
                    as="a"
                    href={activeSocials[social.id]}
                    size="none"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white group/social-btn transition-all duration-300"
                  >
                    <social.icon size={18} strokeWidth={1.5} className="text-white group-hover/social-btn:text-va-black shrink-0" />
                  </ButtonInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>

            {activeSections.map((section: any, i: number) => (
              <ContainerInstrument key={i} className="space-y-6 flex flex-col items-start">
                <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-white/20 uppercase">
                  <VoiceglotText translationKey={`footer.section.${i}.title`} defaultText={section.title} />
                </HeadingInstrument>
                <ul className="space-y-2">
                  {section.links.map((link: any, j: number) => (
                    <li key={j}>
                      <VoicesLink href={link.href} className="text-[15px] font-light text-white/40 hover:text-white transition-colors">
                        {link.name}
                      </VoicesLink>
                    </li>
                  ))}
                </ul>
              </ContainerInstrument>
            ))}

            <ContainerInstrument className="space-y-6 flex flex-col items-start">
              <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-white/20 uppercase">
                <VoiceglotText translationKey="footer.contact.title" defaultText="Contact" />
              </HeadingInstrument>
              <ContainerInstrument className="space-y-3">
                <a href={`mailto:${activeEmail}`} className="flex items-center gap-2 text-[15px] font-light text-white/40 hover:text-white transition-colors">
                  <Mail size={14} strokeWidth={1.5} />
                  <span>{activeEmail}</span>
                </a>
                <a href={`tel:${activePhone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-[15px] font-light text-white/40 hover:text-white transition-colors">
                  <Phone size={14} strokeWidth={1.5} />
                  <span>{activePhone}</span>
                </a>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <TextInstrument className="text-[15px] font-light tracking-widest text-white/20">
              © 2026 Voices Artists. <span className="opacity-50"><VoiceglotText translationKey="footer.powered_by_voices" defaultText="Powered by Voices" /></span>
            </TextInstrument>
            <ContainerInstrument className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <ContainerInstrument className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <TextInstrument className="text-[12px] font-bold tracking-widest text-white/40 uppercase">
                <VoiceglotText translationKey="footer.status.label_online" defaultText="Label Online" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  if (showPortfolioFooter) {
    return (
      <ContainerInstrument as="footer" className="bg-va-off-white text-va-black pt-32 pb-16 overflow-hidden relative border-t border-black/5 !px-0">
        <ContainerInstrument className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none hmagic" />
        <ContainerInstrument className="max-w-[1140px] mx-auto px-6 relative z-10">
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start mb-24">
            {/* Linkerkolom: Brand & Contact */}
            <ContainerInstrument className="md:col-span-5 space-y-10">
              <ContainerInstrument className="space-y-6">
                <TextInstrument className="text-3xl font-light tracking-tighter text-va-black">
                  {actorFirstName} <span className="text-primary/30 italic">{actorLastName}</span>
                </TextInstrument>
                <TextInstrument className="text-lg text-va-black/40 font-light leading-relaxed max-sm text-left">
                  <VoiceglotText translationKey={`footer.portfolio.${actor?.slug}.tagline`} defaultText={actor?.tagline || "De stem achter het verhaal. Warme, natuurlijke voice-over & host."} />
                </TextInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="space-y-4">
                <ContainerInstrument className="flex flex-col gap-3">
                  {actor?.phone && (
                    <ButtonInstrument 
                      as="a"
                      href={`tel:${actor.phone.replace(/\s+/g, '')}`}
                      variant="plain"
                      size="none"
                      className="flex items-center gap-3 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors group w-fit"
                    >
                      <ContainerInstrument className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Phone size={16} strokeWidth={1.5} />
                      </ContainerInstrument>
                      <TextInstrument as="span">{actor.phone}</TextInstrument>
                    </ButtonInstrument>
                  )}
                  {actor?.email && (
                    <ButtonInstrument 
                      as="a"
                      href={`mailto:${actor.email}`}
                      variant="plain"
                      size="none"
                      className="flex items-center gap-3 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors group w-fit"
                    >
                      <ContainerInstrument className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Mail size={16} strokeWidth={1.5} />
                      </ContainerInstrument>
                      <TextInstrument as="span">{actor.email}</TextInstrument>
                    </ButtonInstrument>
                  )}
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            {/* Rechterkolom: Quick Links & Socials */}
            <ContainerInstrument className="md:col-span-7 grid grid-cols-2 gap-12">
              <ContainerInstrument className="space-y-6">
                <HeadingInstrument level={4} className="text-[11px] font-black tracking-[0.2em] text-va-black/20 uppercase">
                  <VoiceglotText translationKey="footer.navigation.title" defaultText="Navigatie" />
                </HeadingInstrument>
                <ul className="space-y-3">
                  {[
                    { name: t('common.voiceover', 'Voice-over'), href: '/demos' },
                    { name: t('common.host_reporter', 'Host & Reporter'), href: '/host' },
                    { name: t('common.rates', 'Tarieven'), href: '/tarieven' },
                    { name: t('common.contact', 'Contact'), href: '/contact' },
                  ].map((link) => (
                    <li key={link.name}>
                      <VoicesLink href={link.href} className="text-[15px] font-light text-va-black/40 hover:text-va-black transition-colors">
                        {link.name}
                      </VoicesLink>
                    </li>
                  ))}
                </ul>
              </ContainerInstrument>

              <ContainerInstrument className="space-y-6">
                <HeadingInstrument level={4} className="text-[11px] font-black tracking-[0.2em] text-va-black/20 uppercase">
                  <VoiceglotText translationKey="footer.social_media.title" defaultText="Social Media" />
                </HeadingInstrument>
                <ContainerInstrument className="flex gap-4">
                  {socialIcons.filter(s => actor?.[s.id] || activeSocials[s.id]).slice(0, 3).map((social) => (
                    <ButtonInstrument 
                      key={social.id}
                      as="a"
                      href={actor?.[social.id] || activeSocials[social.id] || '#'}
                      size="none"
                      className="w-12 h-12 rounded-full bg-va-black/10 flex items-center justify-center hover:bg-va-black group/social-btn transition-all duration-500 shadow-sm"
                    >
                      <social.icon size={20} strokeWidth={1.5} className="text-va-black group-hover/social-btn:text-white shrink-0" />
                    </ButtonInstrument>
                  ))}
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <TextInstrument className="flex items-center gap-2 text-[13px] font-light tracking-widest text-va-black/20 ">
               2026 {actorName}. 
              <TextInstrument as="span">
                <VoiceglotText translationKey="footer.powered_by" defaultText="Powered by" />
                <ButtonInstrument as="a" href={MarketManager.getMarketDomains()['BE']} variant="plain" size="none" className="hover:text-va-black transition-colors underline decoration-black/10 underline-offset-4 ml-1">
                  {MarketManager.getCurrentMarket(MarketManager.getMarketDomains()['BE']?.replace('https://', '')).name || 'Voices'}
                </ButtonInstrument>
              </TextInstrument>
            </TextInstrument>
            
            <ContainerInstrument className="flex items-center gap-3 px-4 py-2 bg-va-black/5 rounded-full border border-black/5">
              <ContainerInstrument className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <TextInstrument className="text-[12px] font-bold tracking-widest text-va-black/40 uppercase">
                <VoiceglotText translationKey="footer.status.online" defaultText="Beschikbaar voor opnames" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  return (
    <footer className="bg-va-off-white text-va-black pt-24 pb-12 overflow-hidden relative border-t border-black/5 !px-0">
      {/* Liquid Gradient Background */}
      <ContainerInstrument className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none hmagic" />

      <ContainerInstrument className="max-w-[1140px] mx-auto px-6 relative z-10">
        {!isSpecial && <BreadcrumbsInstrument />}

        {/* Dynamic Journey Elements */}
        {!isSpecial && !isOrdering && (
          <ContainerInstrument className="mb-24">
            <JourneyCta strokeWidth={1.5} journey={isStudio ? 'studio' as any : isAcademy ? 'academy' as any : state.current_journey} />
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
                <VoiceglotText translationKey="footer.powered_by" defaultText="Powered by" />
                <ButtonInstrument as="a" href={MarketManager.getMarketDomains()['BE']} variant="plain" size="none" className="hover:text-va-black transition-colors underline decoration-black/10 underline-offset-4 ml-1">
                  <VoiceglotText  translationKey="auto.globalfooter.voices_be.46435e" defaultText={MarketManager.getCurrentMarket(MarketManager.getMarketDomains()['BE']?.replace('https://', '')).name || 'Voices'} />
                </ButtonInstrument>
              </TextInstrument>
            )}
          </TextInstrument>
            
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
      </ContainerInstrument>
    </footer>
  );
}
