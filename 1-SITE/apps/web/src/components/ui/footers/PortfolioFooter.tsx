"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';
import { VoicesLink } from '../VoicesLink';
import { Phone, Mail, Instagram, Youtube, Music, Facebook, Linkedin, ArrowRight } from 'lucide-react';

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

  // 🛡️ CHRIS-PROTOCOL: Filter socials specifiek voor de actor
  const actorSocials = socialIcons.filter(s => actor?.[s.id]);

  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start mb-24">
      {/* Linkerkolom: Brand & Persoonlijke Belofte */}
      <ContainerInstrument className="md:col-span-6 space-y-10">
        <ContainerInstrument className="space-y-6">
          <TextInstrument className="text-4xl font-light tracking-tighter text-va-black">
            {actorFirstName} <span className="text-primary italic">{actorLastName}</span>
          </TextInstrument>
          <TextInstrument className="text-xl text-va-black/60 font-light leading-relaxed max-w-md text-left">
            <VoiceglotText 
              translationKey={`footer.portfolio.${actor?.slug}.tagline`} 
              defaultText={actor?.tagline || "De stem achter het verhaal. Warme, natuurlijke voice-over & host."} 
            />
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="flex flex-col sm:flex-row gap-4">
          <ButtonInstrument 
            as={VoicesLink}
            href="/tarieven"
            className="bg-va-black text-white px-8 py-4 rounded-[12px] font-bold text-[15px] hover:bg-primary transition-all shadow-aura-sm flex items-center gap-2"
          >
            Bereken mijn prijs <ArrowRight size={16} />
          </ButtonInstrument>
          
          <ButtonInstrument 
            as={VoicesLink}
            href="/contact"
            variant="plain"
            className="border border-black/10 px-8 py-4 rounded-[12px] font-bold text-[15px] hover:bg-va-black/5 transition-all"
          >
            Direct contact
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Rechterkolom: Navigatie & Socials (Toegespitst op de Actor) */}
      <ContainerInstrument className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-12">
        <ContainerInstrument className="space-y-6">
          <HeadingInstrument level={4} className="text-[11px] font-black tracking-[0.2em] text-va-black/20 uppercase">
            Mijn Werk
          </HeadingInstrument>
          <ul className="space-y-3">
            {[
              { name: 'Voice-over Demos', href: '/demos' },
              { name: 'Host & Reporter', href: '/host' },
              { name: 'Mijn Tarieven', href: '/tarieven' },
              { name: 'Contact opnemen', href: '/contact' },
            ].map((link) => (
              <li key={link.name}>
                <VoicesLink href={link.href} className="text-[16px] font-light text-va-black/40 hover:text-va-black transition-colors">
                  {link.name}
                </VoicesLink>
              </li>
            ))}
          </ul>
        </ContainerInstrument>

        <ContainerInstrument className="space-y-6">
          <HeadingInstrument level={4} className="text-[11px] font-black tracking-[0.2em] text-va-black/20 uppercase">
            Volg {actorFirstName}
          </HeadingInstrument>
          {actorSocials.length > 0 ? (
            <ContainerInstrument className="flex flex-wrap gap-4">
              {actorSocials.map((social) => (
                <ButtonInstrument 
                  key={social.id}
                  as="a"
                  href={actor[social.id]}
                  size="none"
                  className="w-12 h-12 rounded-full bg-va-black/5 flex items-center justify-center hover:bg-va-black group transition-all duration-500 shadow-sm"
                >
                  <social.icon size={20} strokeWidth={1.5} className="text-va-black group-hover:text-white shrink-0" />
                </ButtonInstrument>
              ))}
            </ContainerInstrument>
          ) : (
            <TextInstrument className="text-[14px] font-light text-va-black/20 italic">
              Geen social media gekoppeld.
            </TextInstrument>
          )}

          <div className="pt-6 space-y-4">
            {actor?.phone && (
              <a href={`tel:${actor.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors group">
                <Phone size={16} strokeWidth={1.5} className="text-primary/40 group-hover:text-primary" />
                <span>{actor.phone}</span>
              </a>
            )}
            {actor?.email && (
              <a href={`mailto:${actor.email}`} className="flex items-center gap-3 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors group">
                <Mail size={16} strokeWidth={1.5} className="text-primary/40 group-hover:text-primary" />
                <span>{actor.email}</span>
              </a>
            )}
          </div>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
