"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { MarketManager } from '@config/market-manager';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useVoicesState } from '@/contexts/VoicesStateContext';
import { JourneyCta } from './JourneyCta';
import { JourneyFaq } from './JourneyFaq';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

export default function GlobalFooter() {
  const { t } = useTranslation();
  const { playClick } = useSonicDNA();
  const { state } = useVoicesState();
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
        { name: t('nav.voices', 'Onze stemmen'), href: '/agency' },
        { name: t('nav.how_it_works', 'Hoe werkt het'), href: '/#how-it-works' },
        { name: t('nav.pricing', 'Hoeveel kost het'), href: '/price' },
        { name: t('nav.contact', 'Contact'), href: '/contact' },
      ]
    },
    {
      title: t('footer.actors', 'Voor voice-overs'),
      links: [
        { name: t('nav.studio', 'Voices Studio (workshops)'), href: '/studio' },
        { name: t('nav.academy', 'Academy (online leertraject)'), href: '/academy' },
        { name: t('nav.signup', 'Aanmelden als stemacteur'), href: '/auth/signup' },
      ]
    },
    {
      title: t('footer.support', 'Support'),
      links: [
        { name: market.phone, href: `tel:${market.phone.replace(/\s+/g, '')}` },
        { name: market.email, href: `mailto:${market.email}` },
        { name: t('footer.faq', 'Veelgestelde Vragen'), href: '/faq' },
        { name: t('footer.terms', 'Voorwaarden'), href: '/terms' },
      ]
    },
    {
      title: t('footer.company', 'Over Voices'),
      links: [
        { name: t('footer.about', 'Ons verhaal'), href: '/about' },
        { name: t('footer.ademing', 'Ademing (Rust)'), href: 'https://ademing.be' },
        { name: t('footer.blog', 'Blog'), href: '/blog' },
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
        { name: t('footer.edit_portfolio', 'Bewerk portfolio'), href: '/auth/login' },
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

  let footerSections = standardSections;
  if (market.market_code === 'ADEMING') footerSections = ademingSections;
  if (market.market_code === 'JOHFRAH') footerSections = portfolioSections;
  if (market.market_code === 'YOUSSEF') footerSections = youssefSections;

  const isPortfolio = market.market_code === 'JOHFRAH';
  const isArtist = market.market_code === 'YOUSSEF';
  const isSpecial = isPortfolio || isArtist || market.market_code === 'ADEMING';

  return (
    <ContainerInstrument as="footer" className="bg-va-black text-white pt-24 pb-12 overflow-hidden relative">
      {/* Liquid Gradient Background */}
      <ContainerInstrument className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none hmagic" />
      
      <ContainerInstrument className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Dynamic Journey Elements */}
        {!isSpecial && (
          <ContainerInstrument className="mb-24">
            <JourneyCta journey={state.current_journey} />
            <ContainerInstrument className="mt-12">
              <HeadingInstrument level={4} className="text-[10px] font-light tracking-[0.2em] text-white/20 mb-8 uppercase">
                <VoiceglotText translationKey="footer.journey_faq" defaultText="Veelgestelde vragen voor deze journey" />
              </HeadingInstrument>
              <JourneyFaq journey={state.current_journey} limit={4} />
            </ContainerInstrument>
          </ContainerInstrument>
        )}

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          {/* Brand Column */}
          <ContainerInstrument className="lg:col-span-2 space-y-8">
            <Link href="/" onClick={() => playClick('light')} className="flex items-center gap-3 group">
              {isArtist ? (
                <span className="text-2xl font-light tracking-tighter text-white">YOUSSEF ZAKI</span>
              ) : (
                <Image 
                  src={market.logo_url} 
                  alt={market.name} 
                  width={142}
                  height={56}
                  className="h-14 w-auto brightness-0 invert transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </Link>
            <TextInstrument className="text-white/40 text-lg font-light leading-relaxed max-w-sm">
              {isPortfolio 
                ? <VoiceglotText translationKey="footer.portfolio.tagline" defaultText="De stem achter het verhaal. Warme, natuurlijke voice-over & host." />
                : isArtist
                ? <VoiceglotText translationKey="footer.artist.tagline" defaultText="Independent singer releasing music on his own terms. Supported by Voices Artists." />
                : <VoiceglotText translationKey="footer.tagline" defaultText="Een warm en vertrouwd geluid. De perfecte stem voor elk project." />
              }
            </TextInstrument>
            <ContainerInstrument className="flex gap-4">
              {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                <ButtonInstrument 
                  key={i} 
                  onClick={() => playClick('light')}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Icon size={18} strokeWidth={1.5} />
                </ButtonInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Links Columns */}
          {footerSections.map((section, i) => (
            <ContainerInstrument key={i} className="space-y-8">
              <HeadingInstrument level={4} className="text-[10px] font-light tracking-[0.2em] text-white/20 uppercase">
                <VoiceglotText translationKey={`footer.section.${i}.title`} defaultText={section.title} />
              </HeadingInstrument>
              <ContainerInstrument as="ul" className="space-y-4">
                {section.links.map((link, j) => (
                  <ContainerInstrument as="li" key={j}>
                    <Link 
                      href={link.href} 
                      onClick={() => playClick('light')}
                      className="text-sm font-light text-white/60 hover:text-primary transition-colors duration-300"
                    >
                      <VoiceglotText translationKey={`footer.link.${i}.${j}`} defaultText={link.name} />
                    </Link>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>

        {/* Bottom Bar */}
        <ContainerInstrument className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <TextInstrument className="flex items-center gap-2 text-[10px] font-light tracking-widest text-white/20 uppercase">
            © 2026 {isPortfolio ? 'Johfrah Lefebvre' : isArtist ? 'Youssef Zaki' : 'Voices'}. {isSpecial && (
              <span>Powered by <a href="https://voices.be" className="hover:text-white transition-colors underline decoration-white/10 underline-offset-4">Voices.be</a></span>
            )}
          </TextInstrument>
          
          <ContainerInstrument className="flex items-center gap-8">
            <ContainerInstrument className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <TextInstrument as="span" className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <TextInstrument as="span" className="text-[9px] font-light tracking-widest text-white/40 uppercase">
                <VoiceglotText translationKey="footer.status.online" defaultText="Wij staan voor u klaar" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
