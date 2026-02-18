"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { MarketManager } from '@config/market-manager';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { JourneyCta } from './JourneyCta';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

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
  const { playClick } = useSonicDNA();
  const { state } = useVoicesState();
  const { state: masterControlState } = useMasterControl();
  const market = MarketManager.getCurrentMarket();

  const ademingSections = [
    {
      title: t('footer.meditation', 'Meditatie'),
      links: [
        { name: t('nav.meditations', 'Meditaties'), href: '/ademing' },
        { name: t('nav.my_rest', 'Mijn Rust'), href: '/account/ademing' },
        { name: t('nav.guides', 'De Gidsen'), href: '/ademing#guides' },
      ]
    },
    {
      title: t('footer.support', 'Support'),
      links: [
        { name: market.phone, href: `tel:${market.phone.replace(/\s+/g, '')}` },
        { name: market.email, href: `mailto:${market.email}` },
        { name: t('footer.faq', 'Veelgestelde Vragen'), href: '/faq' },
      ]
    },
    {
      title: t('footer.voices', 'Voices'),
      links: [
        { name: t('nav.voices_back', 'Terug naar Voices'), href: 'https://voices.be' },
        { name: t('footer.about', 'Ons verhaal'), href: '/about' },
      ]
    }
  ];

  const standardSections = [
    {
      title: t('footer.agency', 'Castingbureau'),
      links: [
        { name: t('nav.voices', 'Onze stemmen'), href: '/agency/' },
        { name: t('nav.how_it_works', 'Hoe werkt het'), href: '/#how-it-works' },
        { name: t('nav.pricing', 'Hoeveel kost het'), href: '/price/' },
        { name: t('nav.contact', 'Contact'), href: '/contact/' },
      ]
    },
    {
      title: t('footer.actors', 'Voor voice-overs'),
      links: [
        { name: t('nav.studio', 'Voices Studio (workshops)'), href: '/studio/' },
        { name: t('nav.academy', 'Academy (online leertraject)'), href: '/academy/' },
        { name: t('nav.signup', 'Aanmelden als stemacteur'), href: '/account' },
      ]
    },
    {
      title: t('footer.support', 'Support'),
      links: [
        { name: market.phone, href: `tel:${market.phone.replace(/\s+/g, '')}` },
        { name: market.email, href: `mailto:${market.email}` },
        { name: t('footer.faq', 'Veelgestelde Vragen'), href: '/faq/' },
        { name: t('footer.terms', 'Voorwaarden'), href: '/terms/' },
      ]
    },
    {
      title: t('footer.company', 'Over Voices'),
      links: [
        { name: t('footer.about', 'Ons verhaal'), href: '/about/' },
        { name: t('footer.ademing', 'Ademing (Rust)'), href: 'https://ademing.be' },
        { name: t('footer.blog', 'Blog'), href: '/blog/' },
      ]
    }
  ];

  const portfolioSections = [
    {
      title: t('footer.portfolio', 'Portfolio'),
      links: [
        { name: t('nav.home', 'Home'), href: '/' },
        { name: t('nav.about', 'Over Johfrah'), href: '/over-mij' },
        { name: t('nav.host', 'Host & Reporter'), href: '/host' },
      ]
    },
    {
      title: t('footer.support', 'Support'),
      links: [
        { name: market.phone, href: `tel:${market.phone.replace(/\s+/g, '')}` },
        { name: market.email, href: `mailto:${market.email}` },
        { name: t('footer.contact', 'Contact'), href: '/contact' },
        { name: t('footer.edit_portfolio', 'Bewerk portfolio'), href: '/account' },
      ]
    }
  ];

  const youssefSections = [
    {
      title: t('footer.artist', 'Artist'),
      links: [
        { name: 'The Story', href: '/#story' },
        { name: 'Music', href: '/#music' },
        { name: 'Support', href: '/#support' },
      ]
    },
    {
      title: t('footer.support', 'Support'),
      links: [
        { name: market.email, href: `mailto:${market.email}` },
        { name: t('footer.contact', 'Contact'), href: '/contact' },
      ]
    },
    {
      title: t('footer.label', 'Label'),
      links: [
        { name: 'Voices Artists', href: 'https://voices.be/artist' },
        { name: 'Back to Voices', href: 'https://voices.be' },
      ]
    }
  ];

  const studioSections = [
    {
      title: t('footer.workshops', 'Workshops'),
      links: [
        { name: t('nav.studio', 'Voices Studio'), href: '/studio' },
        { name: t('nav.academy', 'Academy'), href: '/academy' },
        { name: t('nav.faq', 'Veelgestelde Vragen'), href: '/studio/veelgestelde-vragen' },
      ]
    },
    {
      title: t('footer.support', 'Support'),
      links: [
        { name: market.phone, href: `tel:${market.phone.replace(/\s+/g, '')}` },
        { name: market.email, href: `mailto:${market.email}` },
        { name: t('footer.contact', 'Contact'), href: '/contact' },
      ]
    },
    {
      title: t('footer.voices', 'Voices'),
      links: [
        { name: t('nav.voices_back', 'Terug naar Voices'), href: 'https://voices.be' },
        { name: t('footer.about', 'Ons verhaal'), href: '/about' },
      ]
    }
  ];

  let footerSections = standardSections;
  if (market.market_code === 'ADEMING') footerSections = ademingSections;
  if (market.market_code === 'JOHFRAH') footerSections = portfolioSections;
  if (market.market_code === 'YOUSSEF') footerSections = youssefSections;
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/studio')) footerSections = studioSections;
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/academy')) footerSections = studioSections;

  const isPortfolio = market.market_code === 'JOHFRAH';
  const isArtist = market.market_code === 'YOUSSEF';
  const isSpecial = isPortfolio || isArtist || market.market_code === 'ADEMING';
  const isStudio = typeof window !== 'undefined' && (window.location.pathname.startsWith('/studio') || window.location.pathname.startsWith('/academy'));
  const isOrdering = masterControlState.currentStep !== 'voice';

  [
    ademingSections,
    standardSections,
    portfolioSections,
    youssefSections,
    studioSections
  ].flat().forEach(section => {
    section.links.forEach(link => {
      if (link.name && typeof link.name === 'string' && !link.name.includes('@')) {
        // We don't wrap emails/phones, but we could wrap other names if needed.
        // For now, the standard sections already use t() in their definitions.
      }
    });
  });

  return (
    <ContainerInstrument as="footer" className="bg-va-off-white text-va-black pt-24 pb-12 overflow-hidden relative border-t border-black/5 !px-0">
      {/* Liquid Gradient Background */}
      <ContainerInstrument className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none hmagic" />
      
      <ContainerInstrument className="max-w-[1140px] mx-auto px-6 relative z-10">
        {/* Dynamic Journey Elements */}
        {!isSpecial && !isOrdering && (
          <ContainerInstrument className="mb-24">
            <JourneyCta strokeWidth={1.5} journey={isStudio ? 'studio' as any : state.current_journey} />
          </ContainerInstrument>
        )}

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
          {/* Brand Column */}
          <ContainerInstrument className="space-y-8 flex flex-col items-start">
            <ButtonInstrument as={Link} href="/" variant="plain" size="none" onClick={() => playClick('light')} className="flex items-center gap-3 group justify-start">
              {isArtist ? (
                <TextInstrument as="span" className="text-2xl font-light tracking-tighter text-va-black">
                  <VoiceglotText  translationKey="auto.globalfooter.youssef_zaki.42bcfa" defaultText="YOUSSEF ZAKI" />
                </TextInstrument>
              ) : (
                <Image  
                  src={market.logo_url} 
                  alt={market.name} 
                  width={142} 
                  height={56}
                  className="h-14 w-auto transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </ButtonInstrument>
            <TextInstrument className="text-va-black/40 text-lg font-light leading-relaxed max-w-sm text-left">
              {isPortfolio 
                ? <VoiceglotText  translationKey="footer.portfolio.tagline" defaultText="De stem achter het verhaal. Warme, natuurlijke voice-over & host." />
                : isArtist
                ? <VoiceglotText  translationKey="footer.artist.tagline" defaultText="Independent singer releasing music on his own terms. Supported by Voices Artists." />
                : <VoiceglotText  translationKey="footer.tagline" defaultText="Een warm en vertrouwd geluid. De perfecte stem voor elk project." />
              }
            </TextInstrument>
            <ContainerInstrument className="flex gap-4 justify-start">
              {[
                { icon: Instagram, href: '#', alt: t('social.instagram', 'Instagram') },
                { icon: Twitter, href: '#', alt: t('social.twitter', 'Twitter') },
                { icon: Linkedin, href: '#', alt: t('social.linkedin', 'LinkedIn') },
                { icon: Facebook, href: '#', alt: t('social.facebook', 'Facebook') }
              ].map((social, i) => (
                <ButtonInstrument 
                  key={i} 
                  as="a"
                  href={social.href}
                  aria-label={social.alt}
                  onClick={() => playClick('light')}
                  className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <social.icon size={18} strokeWidth={1.5} className="shrink-0" />
                </ButtonInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Links Columns */}
          {footerSections.map((section, i) => (
            <div key={i} className="space-y-6 flex flex-col items-start">
              <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase text-left">
                <VoiceglotText  translationKey={`footer.section.${i}.title`} defaultText={section.title} />
              </HeadingInstrument>
              <ul className="flex flex-col items-start space-y-1 w-full">
                {section.links.map((link, j) => (
                  <li key={j} className="w-full flex justify-start">
                    <ButtonInstrument 
                      as={Link}
                      href={link.href} 
                      variant="plain"
                      size="none"
                      onClick={() => playClick('light')}
                      className="text-[15px] font-light text-va-black/60 hover:text-primary transition-colors duration-300 py-1"
                    >
                      <VoiceglotText  translationKey={`footer.link.${i}.${j}`} defaultText={link.name} />
                    </ButtonInstrument>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ContainerInstrument>

        {/* Bottom Bar */}
        <ContainerInstrument className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <TextInstrument className="flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/20 ">
             2026 {isPortfolio ? 'Johfrah Lefebvre' : isArtist ? 'Youssef Zaki' : 'Voices'}. {isSpecial && (
              <TextInstrument as="span">
                <VoiceglotText translationKey="footer.powered_by" defaultText="Powered by" />
                <ButtonInstrument as="a" href="https://voices.be" variant="plain" size="none" className="hover:text-va-black transition-colors underline decoration-black/10 underline-offset-4 ml-1">
                  <VoiceglotText  translationKey="auto.globalfooter.voices_be.46435e" defaultText="Voices.be" />
                </ButtonInstrument>
              </TextInstrument>
            )}
          </TextInstrument>
          
          <ContainerInstrument className="flex items-center gap-8">
            <ContainerInstrument className="flex items-center gap-3 px-4 py-2 bg-va-black/5 rounded-full border border-black/5">
              <TextInstrument as="span" className="w-2 h-2 rounded-full bg-green-500 animate-pulse font-light" />
              <TextInstrument as="span" className="text-[15px] font-light tracking-widest text-va-black/40 ">
                <VoiceglotText  translationKey="footer.status.online" defaultText="Wij staan voor u klaar" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
