"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';
import { VoicesLink } from '../VoicesLink';
import { Phone, Mail, Instagram, Youtube, Music, Facebook, Linkedin } from 'lucide-react';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

export function PortfolioFooter({ market, actor, activeSocials }: any) {
  const { t } = useTranslation();
  
  const actorName = actor?.display_name || 'Johfrah Lefebvre';
  const actorFirstName = actor?.first_name || actorName.split(' ')[0];
  const actorLastName = actor?.last_name || actorName.split(' ').slice(1).join(' ');

  const socialIcons = [
    { id: 'instagram', icon: Instagram, alt: 'Instagram' },
    { id: 'youtube', icon: Youtube, alt: 'YouTube' },
    { id: 'spotify', icon: Music, alt: 'Spotify' },
    { id: 'facebook', icon: Facebook, alt: 'Facebook' },
    { id: 'linkedin', icon: Linkedin, alt: 'LinkedIn' },
  ];

  return (
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
            <ButtonInstrument 
              as={VoicesLink}
              href="/tarieven"
              className="bg-va-black text-white px-8 py-4 rounded-[12px] font-bold text-[15px] hover:bg-primary transition-all w-fit shadow-aura-sm"
            >
              Bereken mijn prijs
            </ButtonInstrument>
            
            <div className="pt-4 flex flex-col gap-3">
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
            </div>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Rechterkolom: Navigatie & Socials */}
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
  );
}
