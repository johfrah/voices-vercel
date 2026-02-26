"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';
import { VoicesLink } from '../VoicesLink';
import { Phone, Mail, Instagram, Youtube, Music, Facebook, Linkedin } from 'lucide-react';

export function AcademyFooter({ market, activeSocials, activePhone, activeEmail }: any) {
  const { t } = useTranslation();

  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
      {/* Academy Brand */}
      <ContainerInstrument className="space-y-8 flex flex-col items-start">
        <VoicesLink href="/academy" className="flex items-center gap-3 group justify-start">
          <TextInstrument className="text-2xl font-light tracking-tighter text-va-black">
            Voices <span className="text-primary italic">Academy</span>
          </TextInstrument>
        </VoicesLink>
        <TextInstrument className="text-va-black/40 text-lg font-light leading-relaxed max-w-sm text-left">
          <VoiceglotText translationKey="footer.academy.tagline" defaultText="Leer het vak van de beste stemmen en regisseurs. Jouw stem, jouw carrière." />
        </TextInstrument>
      </ContainerInstrument>

      {/* Academy Courses */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.academy.courses" defaultText="Opleidingen" />
        </HeadingInstrument>
        <ul className="space-y-2">
          {[
            { name: t('footer.link.academy.basic', 'Basisopleiding'), href: '/academy/basis' },
            { name: t('footer.link.academy.pro', 'Pro-Traject'), href: '/academy/pro' },
            { name: t('footer.link.academy.masterclass', 'Masterclasses'), href: '/academy/masterclass' },
            { name: t('footer.link.academy.coaching', 'Personal Coaching'), href: '/academy/coaching' },
          ].map((link, i) => (
            <li key={i}>
              <VoicesLink href={link.href} className="text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
                {link.name}
              </VoicesLink>
            </li>
          ))}
        </ul>
      </ContainerInstrument>

      {/* Community & Growth */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.academy.growth" defaultText="Groei" />
        </HeadingInstrument>
        <ul className="space-y-2">
          {[
            { name: t('footer.link.academy.studio', 'Voices Studio'), href: '/studio' },
            { name: t('footer.link.academy.portfolio', 'Portfolio maken'), href: '/academy/portfolio' },
            { name: t('footer.link.academy.signup', 'Aanmelden als stem'), href: '/account' },
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
