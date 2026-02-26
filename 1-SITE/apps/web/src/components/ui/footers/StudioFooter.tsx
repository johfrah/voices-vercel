"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';
import { VoicesLink } from '../VoicesLink';
import { Phone, Mail, Instagram, Youtube, Music, Facebook, Linkedin } from 'lucide-react';
import Image from 'next/image';

export function StudioFooter({ market, activeSocials, activePhone, activeEmail }: any) {
  const { t } = useTranslation();

  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
      {/* Studio Brand */}
      <ContainerInstrument className="space-y-8 flex flex-col items-start">
        <VoicesLink href="/studio" className="flex items-center gap-3 group justify-start">
          <TextInstrument className="text-2xl font-light tracking-tighter text-va-black">
            Voices <span className="text-primary italic">Studio</span>
          </TextInstrument>
        </VoicesLink>
        <TextInstrument className="text-va-black/40 text-lg font-light leading-relaxed max-w-sm text-left">
          <VoiceglotText translationKey="footer.studio.tagline" defaultText="Professionele opnames en regie voor stemacteurs en merken." />
        </TextInstrument>
      </ContainerInstrument>

      {/* Studio Services */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.studio.title" defaultText="Studio" />
        </HeadingInstrument>
        <ul className="space-y-2">
          {[
            { name: t('footer.link.studio.recording', 'Opnames'), href: '/studio/opnames' },
            { name: t('footer.link.studio.direction', 'Regie'), href: '/studio/regie' },
            { name: t('footer.link.studio.workshops', 'Workshops'), href: '/studio/workshops' },
            { name: t('footer.link.studio.contact', 'Boek de studio'), href: '/contact' },
          ].map((link, i) => (
            <li key={i}>
              <VoicesLink href={link.href} className="text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
                {link.name}
              </VoicesLink>
            </li>
          ))}
        </ul>
      </ContainerInstrument>

      {/* Academy Journey */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.academy.title" defaultText="Academy" />
        </HeadingInstrument>
        <ul className="space-y-2">
          {[
            { name: t('footer.link.academy.courses', 'Opleidingen'), href: '/academy' },
            { name: t('footer.link.academy.coaching', 'Personal Coaching'), href: '/academy/coaching' },
            { name: t('footer.link.academy.masterclass', 'Masterclasses'), href: '/academy/masterclass' },
          ].map((link, i) => (
            <li key={i}>
              <VoicesLink href={link.href} className="text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
                {link.name}
              </VoicesLink>
            </li>
          ))}
        </ul>
      </ContainerInstrument>

      {/* Contact */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.contact.title" defaultText="Contact" />
        </HeadingInstrument>
        <ContainerInstrument className="space-y-3">
          <a href={`mailto:${activeEmail}`} className="flex items-center gap-2 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
            <Mail size={14} strokeWidth={1.5} />
            <span>{activeEmail}</span>
          </a>
          <a href={`tel:${activePhone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
            <Phone size={14} strokeWidth={1.5} />
            <span>{activePhone}</span>
          </a>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
