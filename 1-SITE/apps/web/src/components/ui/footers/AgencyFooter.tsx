"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';
import { VoiceglotImage } from '../VoiceglotImage';
import { VoicesLink } from '../VoicesLink';
import { Star, Phone, Mail, Instagram, Youtube, Music, Facebook, Linkedin } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function AgencyFooter({ market, activeSocials, activePhone, activeEmail, reviewStats }: any) {
  const { t } = useTranslation();
  const averageRating = reviewStats?.averageRating || "4.9";
  const totalReviews = reviewStats?.totalCount || "390";

  const socialIcons = [
    { id: 'instagram', icon: Instagram, alt: 'Instagram' },
    { id: 'youtube', icon: Youtube, alt: 'YouTube' },
    { id: 'spotify', icon: Music, alt: 'Spotify' },
    { id: 'facebook', icon: Facebook, alt: 'Facebook' },
    { id: 'linkedin', icon: Linkedin, alt: 'LinkedIn' },
  ];

  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
      {/* Brand & Trust */}
      <ContainerInstrument className="space-y-8 flex flex-col items-start">
        <VoicesLink href="/" className="flex items-center gap-3 group justify-start">
          <VoiceglotImage  
            src={market.logo_url} 
            alt={market.name} 
            width={200} 
            height={80}
            journey="common"
            category="branding"
            className="h-10 md:h-12 w-auto transition-transform duration-500 group-hover:scale-105"
          />
        </VoicesLink>
        <TextInstrument className="text-va-black/40 text-lg font-light leading-relaxed max-w-sm text-left">
          <VoiceglotText translationKey="footer.tagline" defaultText="Vind de juiste stem voor jouw verhaal. Vandaag besteld, morgen klaar." />
        </TextInstrument>

        {/* Social Proof */}
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
      </ContainerInstrument>

      {/* Agency Navigation */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.voices.title" defaultText="Kies je stem" />
        </HeadingInstrument>
        <ul className="space-y-2">
          {[
            { name: t('footer.link.voices.browse', 'Onze stemmen'), href: '/agency/' },
            { name: t('footer.link.voices.how_it_works', 'Hoe werkt het'), href: '/agency/zo-werkt-het/' },
            { name: t('footer.link.voices.rates', 'Tarieven'), href: '/tarieven/' },
            { name: t('footer.link.voices.casting_help', 'Casting-hulp'), href: '/contact/' },
          ].map((link, i) => (
            <li key={i}>
              <VoicesLink href={link.href} className="text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
                {link.name}
              </VoicesLink>
            </li>
          ))}
        </ul>
      </ContainerInstrument>

      {/* Trust & Legal */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.trust.title" defaultText="Vertrouwen" />
        </HeadingInstrument>
        <ul className="space-y-2">
          {[
            { name: t('footer.link.trust.faq', 'FAQ'), href: '/agency/zo-werkt-het/#faq' },
            { name: t('footer.link.trust.terms', 'Voorwaarden'), href: '/agency/voorwaarden/' },
            { name: t('footer.link.trust.privacy', 'Privacy'), href: '/privacy/' },
          ].map((link, i) => (
            <li key={i}>
              <VoicesLink href={link.href} className="text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
                {link.name}
              </VoicesLink>
            </li>
          ))}
        </ul>
      </ContainerInstrument>

      {/* Contact & Socials */}
      <ContainerInstrument className="space-y-8 flex flex-col items-start">
        <ContainerInstrument className="space-y-6">
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

        <ContainerInstrument className="flex gap-4">
          {socialIcons.map((social) => (
            activeSocials[social.id] && (
              <ButtonInstrument 
                key={social.id}
                as="a"
                href={activeSocials[social.id]}
                size="none"
                className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center hover:bg-va-black group transition-all duration-300"
              >
                <social.icon size={18} strokeWidth={1.5} className="text-va-black group-hover:text-white" />
              </ButtonInstrument>
            )
          ))}
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
