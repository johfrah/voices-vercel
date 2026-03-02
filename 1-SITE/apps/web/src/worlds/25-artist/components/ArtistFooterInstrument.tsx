"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { VoicesLinkInstrument } from '@/components/ui/VoicesLinkInstrument';
import { Phone, Mail, Instagram, Youtube, Music, Facebook, Linkedin } from 'lucide-react';
import Image from 'next/image';

export function ArtistFooter({ market, activeSocials, activePhone, activeEmail }: any) {
  const { t } = useTranslation();

  const socialIcons = [
    { id: 'instagram', icon: Instagram, alt: 'Instagram' },
    { id: 'youtube', icon: Youtube, alt: 'YouTube' },
    { id: 'spotify', icon: Music, alt: 'Spotify' },
    { id: 'facebook', icon: Facebook, alt: 'Facebook' },
    { id: 'linkedin', icon: Linkedin, alt: 'LinkedIn' },
  ];

  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
      <ContainerInstrument className="space-y-8 flex flex-col items-start">
        <VoicesLinkInstrument href="/" className="flex items-center gap-3 group justify-start">
          <Image  
            src={market.logo_url} 
            alt={market.name} 
            width={180} 
            height={60}
            className="h-12 w-auto transition-transform duration-500 group-hover:scale-105"
          />
        </VoicesLinkInstrument>
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

      {/* Artist Links are dynamic via market.footer_sections in GlobalFooter */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-white/20 uppercase">
          <VoiceglotText translationKey="footer.contact.title" defaultText="Contact" />
        </HeadingInstrument>
        <ContainerInstrument className="space-y-3">
          <a href={`mailto:${activeEmail}`} className="flex items-center gap-2 text-[15px] font-light text-white/40 hover:text-white transition-colors">
            <Mail size={14} strokeWidth={1.5} />
            <TextInstrument as="span">{activeEmail}</TextInstrument>
          </a>
          <a href={`tel:${activePhone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-[15px] font-light text-white/40 hover:text-white transition-colors">
            <Phone size={14} strokeWidth={1.5} />
            <TextInstrument as="span">{activePhone}</TextInstrument>
          </a>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
