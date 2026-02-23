"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { BreadcrumbsInstrument } from './BreadcrumbsInstrument';
import { Star, Check, Phone, Mail, Facebook, Instagram, Linkedin, Plus, Trash2, Link as LinkIcon, Search as SearchIcon, X, Quote, ChevronDown, Youtube, Music } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { isOfficeOpen, formatOpeningHours, getNextOpeningTime } from '@/lib/delivery-logic';
import Image from 'next/image';
import { VoicesLink } from './VoicesLink';
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
  const actorFirstName = actor?.firstName || actor?.first_name || actorName.split(' ')[0];
  const actorLastName = actor?.lastName || actor?.last_name || actorName.split(' ').slice(1).join(' ');

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
  const isStudio = market.market_code === 'STUDIO';
  const isAcademy = market.market_code === 'ACADEMY';
  const isSpecial = isPortfolio || isArtist || isAdeming || isStudio || isAcademy;

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
          { name: t('footer.link.discover.ademing', 'Ademing (Rust)'), href: 'https://ademing.be' },
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
              © 2026 Voices Artists. <span className="opacity-50"><VoiceglotText translationKey="footer.powered_by_voices" defaultText="Powered by Voices.be" /></span>
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
                <ButtonInstrument as="a" href={`https://${process.env.NEXT_PUBLIC_SITE_URL || (market.market_code.toLowerCase() === 'be' ? 'voices.be' : 'voices.eu')}`} variant="plain" size="none" className="hover:text-va-black transition-colors underline decoration-black/10 underline-offset-4 ml-1">
                  {market.name || 'Voices'}
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

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
          {/* Brand Column */}
          <ContainerInstrument className="space-y-8 flex flex-col items-start">
            <ButtonInstrument as={VoicesLink} href="/" variant="plain" size="none" onClick={() => playClick('light')} className="flex items-center gap-3 group justify-start">
              {isArtist ? (
                <TextInstrument as="span" className="text-2xl font-light tracking-tighter text-va-black">
                  <VoiceglotText  translationKey="footer.artist.name" defaultText={actorName.toUpperCase()} />
                </TextInstrument>
              ) : (
                <VoiceglotImage  
                  src={market.logo_url} 
                  alt={market.name} 
                  width={200} 
                  height={80}
                  journey="common"
                  category="branding"
                  className="h-10 md:h-12 w-auto transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </ButtonInstrument>
            <TextInstrument className="text-va-black/40 text-lg font-light leading-relaxed max-w-sm text-left">
              {isPortfolio 
                ? <VoiceglotText  translationKey="footer.portfolio.tagline" defaultText="De stem achter het verhaal. Warme, natuurlijke voice-over & host." />
                : isArtist
                ? <VoiceglotText  translationKey="footer.artist.tagline" defaultText="Independent singer releasing music on his own terms. Supported by Voices Artists." />
                : <VoiceglotText  translationKey="footer.tagline" defaultText="Vind de juiste stem voor jouw verhaal. Vandaag besteld, morgen klaar." />
              }
            </TextInstrument>

            {/* Micro-Review Widget (Social Proof) */}
            {!isSpecial && (
                <VoicesLink href="/agency/reviews" className="flex items-center gap-4 py-4 px-5 bg-white rounded-[20px] border border-black/5 shadow-aura-sm group/review-widget hover:shadow-aura transition-all duration-500">
                <ContainerInstrument className="flex flex-col">
                  <ContainerInstrument className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="text-[#fabc05]" fill="currentColor" />
                    ))}
                  </ContainerInstrument>
                  <TextInstrument className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest">
                    <VoiceglotText translationKey="footer.reviews.rating_label" defaultText="Google Rating" />
                  </TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="w-px h-8 bg-black/5" />
                <ContainerInstrument className="flex flex-col">
                  <TextInstrument className="text-xl font-light text-va-black leading-none">
                    {averageRating}<span className="text-[13px] text-va-black/20 ml-0.5">/5</span>
                  </TextInstrument>
                  <TextInstrument className="text-[10px] font-bold text-va-black/20 uppercase tracking-tighter">
                    {totalReviews} <VoiceglotText translationKey="footer.reviews.count_label" defaultText="reviews" />
                  </TextInstrument>
                </ContainerInstrument>
              </VoicesLink>
            )}

            <ContainerInstrument className="flex flex-col gap-4">
              <ContainerInstrument className="flex gap-4 justify-start">
                {socialIcons.map((social) => (
                  <ContainerInstrument key={social.id} className="relative group/social">
                    <ButtonInstrument 
                      as="a"
                      href={activeSocials[social.id] || '#'}
                      aria-label={social.alt}
                      size="none"
                      onClick={(e) => {
                        if (isEditMode) {
                          e.preventDefault();
                          setIsEditingSocial(social.id);
                          setEditValue(activeSocials[social.id] || '');
                          playClick('pro');
                        } else {
                          playClick('light');
                        }
                      }}
                      className={cn(
                        "w-10 h-10 rounded-full bg-va-black/10 flex items-center justify-center group/social-btn transition-all duration-300 shadow-sm",
                        isEditMode && "ring-2 ring-primary/20"
                      )}
                    >
                      <social.icon size={18} strokeWidth={1.5} className="text-va-black group-hover/social-btn:text-white shrink-0" />
                    </ButtonInstrument>

                    <AnimatePresence>
                      {isEditingSocial === social.id && (
                        <motion.div 
                          ref={popoverRef}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-black/10 p-3 z-50"
                        >
                          <ContainerInstrument className="flex flex-col gap-3">
                            <TextInstrument className="text-[11px] font-bold text-va-black/40 uppercase tracking-widest">{social.alt} URL</TextInstrument>
                            <ContainerInstrument className="flex items-center gap-2 bg-va-off-white px-3 py-2 rounded-lg border border-black/5">
                              <SearchIcon size={14} className="text-va-black/30" />
                              <input 
                                autoFocus
                                type="text" 
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="https://..."
                                className="bg-transparent border-none outline-none text-[13px] font-medium w-full"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') updateSocialLink(social.id, editValue);
                                  if (e.key === 'Escape') setIsEditingSocial(null);
                                }}
                              />
                            </ContainerInstrument>
                            <ContainerInstrument className="flex justify-end gap-2">
                            <button onClick={() => setIsEditingSocial(null)} className="px-3 py-1.5 text-[11px] font-bold text-va-black/40 hover:text-va-black">
                              <VoiceglotText translationKey="common.cancel" defaultText="Annuleer" />
                            </button>
                            <button onClick={() => updateSocialLink(social.id, editValue)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                              <Check size={12} strokeWidth={3} /> <VoiceglotText translationKey="common.save" defaultText="Save" />
                            </button>
                          </ContainerInstrument>
                        </ContainerInstrument>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>

            <ContainerInstrument className="flex flex-col gap-2">
              <ContainerInstrument className="relative group/contact">
                <ButtonInstrument 
                  as="a"
                  href={(() => {
                    const isPhoneOpen = generalSettings?.phone_hours ? isOfficeOpen(generalSettings.phone_hours) : true;
                    return isPhoneOpen ? `tel:${activePhone.replace(/\s+/g, '')}` : undefined;
                  })()}
                  variant="plain"
                  size="none"
                  onClick={(e) => {
                    if (isEditMode) {
                      e.preventDefault();
                      setIsEditingContact('phone');
                      setEditValue(activePhone);
                      playClick('pro');
                    } else {
                      const isPhoneOpen = generalSettings?.phone_hours ? isOfficeOpen(generalSettings.phone_hours) : true;
                      if (!isPhoneOpen) {
                        e.preventDefault();
                        playClick('error');
                        toast.error(t('footer.error.phone_closed', 'Onze studio is momenteel telefonisch gesloten.'));
                      }
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 text-[14px] font-light text-va-black/60 hover:text-primary transition-colors",
                    generalSettings?.phone_hours && !isOfficeOpen(generalSettings.phone_hours) && "opacity-50"
                  )}
                >
                  <Phone size={14} strokeWidth={1.5} />
                  <span>{activePhone}</span>
                  {generalSettings?.phone_hours && (
                    <span className={cn("w-1.5 h-1.5 rounded-full ml-1", isOfficeOpen(generalSettings.phone_hours) ? "bg-green-500" : "bg-amber-500")} />
                  )}
                </ButtonInstrument>
                <AnimatePresence>
                  {isEditingContact === 'phone' && (
                    <motion.div 
                      ref={popoverRef}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-black/10 p-3 z-50"
                    >
                      <ContainerInstrument className="flex flex-col gap-3">
                        <TextInstrument className="text-[11px] font-bold text-va-black/40 uppercase tracking-widest">
                          <VoiceglotText translationKey="common.phone_number" defaultText="Telefoonnummer" />
                        </TextInstrument>
                        <input 
                          autoFocus
                          type="text" 
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-va-off-white px-3 py-2 rounded-lg border border-black/5 text-[13px] font-medium w-full outline-none focus:ring-2 focus:ring-primary/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateContactInfo('phone', editValue);
                            if (e.key === 'Escape') setIsEditingContact(null);
                          }}
                        />
                        <ContainerInstrument className="flex justify-end gap-2">
                          <button onClick={() => setIsEditingContact(null)} className="px-3 py-1.5 text-[11px] font-bold text-va-black/40 hover:text-va-black">
                            <VoiceglotText translationKey="common.cancel" defaultText="Annuleer" />
                          </button>
                          <button onClick={() => updateContactInfo('phone', editValue)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                            <Check size={12} strokeWidth={3} /> <VoiceglotText translationKey="common.save" defaultText="Save" />
                          </button>
                        </ContainerInstrument>
                      </ContainerInstrument>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ContainerInstrument>

              <ContainerInstrument className="relative group/contact">
                <ButtonInstrument 
                  as="a"
                  href={`mailto:${activeEmail}`}
                  variant="plain"
                  size="none"
                  onClick={(e) => {
                    if (isEditMode) {
                      e.preventDefault();
                      setIsEditingContact('email');
                      setEditValue(activeEmail);
                      playClick('pro');
                    }
                  }}
                  className="flex items-center gap-2 text-[14px] font-light text-va-black/60 hover:text-primary transition-colors"
                >
                  <Mail size={14} strokeWidth={1.5} />
                  <span>{activeEmail}</span>
                </ButtonInstrument>
                <AnimatePresence>
                  {isEditingContact === 'email' && (
                    <motion.div 
                      ref={popoverRef}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-black/10 p-3 z-50"
                    >
                      <ContainerInstrument className="flex flex-col gap-3">
                        <TextInstrument className="text-[11px] font-bold text-va-black/40 uppercase tracking-widest">
                          <VoiceglotText translationKey="common.email_address" defaultText="Email adres" />
                        </TextInstrument>
                        <input 
                          autoFocus
                          type="text" 
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-va-off-white px-3 py-2 rounded-lg border border-black/5 text-[13px] font-medium w-full outline-none focus:ring-2 focus:ring-primary/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateContactInfo('email', editValue);
                            if (e.key === 'Escape') setIsEditingContact(null);
                          }}
                        />
                        <ContainerInstrument className="flex justify-end gap-2">
                          <button onClick={() => setIsEditingContact(null)} className="px-3 py-1.5 text-[11px] font-bold text-va-black/40 hover:text-va-black">
                            <VoiceglotText translationKey="common.cancel" defaultText="Annuleer" />
                          </button>
                          <button onClick={() => updateContactInfo('email', editValue)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                            <Check size={12} strokeWidth={3} /> <VoiceglotText translationKey="common.save" defaultText="Save" />
                          </button>
                        </ContainerInstrument>
                      </ContainerInstrument>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Links Columns */}
        {activeSections.map((section: any, i: number) => (
          <ContainerInstrument key={i} className="space-y-6 flex flex-col items-start relative group/section w-full md:w-auto">
            {/* Mobile Accordion Header */}
            <button 
              onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
              className="flex items-center justify-between w-full md:hidden py-4 border-b border-black/5"
            >
              <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase text-left">
                <VoiceglotText translationKey={`footer.section.${i}.title`} defaultText={section.title} />
              </HeadingInstrument>
              <ChevronDown 
                size={16} 
                className={cn("text-va-black/20 transition-transform duration-300", openAccordion === i && "rotate-180")} 
              />
            </button>

            {/* Desktop Header */}
            <HeadingInstrument level={4} className="hidden md:block text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase text-left">
              <VoiceglotText translationKey={`footer.section.${i}.title`} defaultText={section.title} />
            </HeadingInstrument>

            <AnimatePresence>
              {(openAccordion === i || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                <motion.ul 
                  initial={typeof window !== 'undefined' && window.innerWidth < 768 ? { height: 0, opacity: 0 } : false}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col items-start space-y-1 w-full overflow-hidden md:!h-auto md:!opacity-100"
                >
                  {section.links.map((link: any, j: number) => (
                    <li key={j} className="w-full flex justify-start items-center gap-2 group/link">
                      <ButtonInstrument 
                        as={VoicesLink}
                        href={link.href} 
                        variant="plain"
                        size="none"
                        onClick={() => playClick('light')}
                        className="text-[15px] font-light text-va-black/60 hover:text-primary transition-colors duration-300 py-1"
                      >
                        {link.name}
                        {section.badges?.[link.name] && (
                          <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest rounded">
                            {section.badges[link.name]}
                          </span>
                        )}
                      </ButtonInstrument>

                      {isEditMode && (
                        <ContainerInstrument className="flex items-center gap-1 opacity-0 group-hover/link:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setIsEditingLink({ sectionIdx: i, linkIdx: j });
                              setEditValue(link.href);
                              playClick('pro');
                            }}
                            className="p-1 text-primary hover:bg-primary/10 rounded"
                          >
                            <LinkIcon size={12} />
                          </button>
                          <button 
                            onClick={() => removeLink(i, j)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </ContainerInstrument>
                      )}

                      <AnimatePresence>
                        {isEditingLink?.sectionIdx === i && isEditingLink?.linkIdx === j && (
                          <motion.div 
                            ref={popoverRef}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-black/10 p-3 z-50"
                          >
                            <ContainerInstrument className="flex flex-col gap-3">
                              <TextInstrument className="text-[11px] font-bold text-va-black/40 uppercase tracking-widest">
                                <VoiceglotText translationKey="common.link_url" defaultText="Link URL" />
                              </TextInstrument>
                              <ContainerInstrument className="flex items-center gap-2 bg-va-off-white px-3 py-2 rounded-lg border border-black/5">
                                <SearchIcon size={14} className="text-va-black/30" />
                                <input 
                                  autoFocus
                                  type="text" 
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  placeholder="https://..."
                                  className="bg-transparent border-none outline-none text-[13px] font-medium w-full"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') updateLinkUrl(i, j, editValue);
                                    if (e.key === 'Escape') setIsEditingLink(null);
                                  }}
                                />
                              </ContainerInstrument>
                              <ContainerInstrument className="flex justify-end gap-2">
                                <button onClick={() => setIsEditingLink(null)} className="px-3 py-1.5 text-[11px] font-bold text-va-black/40 hover:text-va-black">
                                  <VoiceglotText translationKey="common.cancel" defaultText="Annuleer" />
                                </button>
                                <button onClick={() => updateLinkUrl(i, j, editValue)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                                  <Check size={12} strokeWidth={3} /> <VoiceglotText translationKey="common.save" defaultText="Save" />
                                </button>
                              </ContainerInstrument>
                            </ContainerInstrument>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  ))}
                  {isEditMode && (
                    <li className="pt-2">
                      <button 
                        onClick={() => addLink(i)}
                        className="flex items-center gap-2 text-[11px] font-bold text-primary hover:opacity-70 transition-opacity"
                      >
                        <Plus size={12} strokeWidth={3} /> <VoiceglotText translationKey="footer.add_link" defaultText="Link toevoegen" />
                      </button>
                    </li>
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>

      {/* Bottom Bar */}
      <ContainerInstrument className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <ContainerInstrument className="flex flex-col md:flex-row items-center gap-8">
          <TextInstrument className="flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/20 ">
             2026 {market.name}. {isSpecial && (
              <TextInstrument as="span">
                <VoiceglotText translationKey="footer.powered_by" defaultText="Powered by" />
                <ButtonInstrument as="a" href={`https://${process.env.NEXT_PUBLIC_SITE_URL || (market.market_code.toLowerCase() === 'be' ? 'voices.be' : 'voices.eu')}`} variant="plain" size="none" className="hover:text-va-black transition-colors underline decoration-black/10 underline-offset-4 ml-1">
                  <VoiceglotText  translationKey="auto.globalfooter.voices_be.46435e" defaultText={market.market_code.toLowerCase() === 'be' ? 'Voices.be' : 'Voices'} />
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
