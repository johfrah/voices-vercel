"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';
import { VoiceglotImage } from '../VoiceglotImage';
import { VoicesLink } from '../VoicesLink';
import { Star, Phone, Mail, Instagram, Youtube, Music, Facebook, Linkedin, Calculator, Globe2, HelpCircle, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useVoicesState } from '@/contexts/VoicesStateContext';

export function AgencyFooter({ market, activeSocials, activePhone, activeEmail, reviewStats }: any) {
  const { t } = useTranslation();
  const { state: voicesState } = useVoicesState();
  
  const averageRating = reviewStats?.averageRating || "4.9";
  const totalReviews = reviewStats?.totalCount || "390";

  // 🛡️ CHRIS-PROTOCOL: Determine current journey for review context
  const currentJourneyId = voicesState.current_journey === 'telephony' ? '3' : null;

  const popularLanguages = [
    { name: t('common.lang.nl_be', 'Vlaams'), href: '/agency/stemmen/vlaams' },
    { name: t('common.lang.nl_nl', 'Nederlands'), href: '/agency/stemmen/nederlands' },
    { name: t('common.lang.fr_be', 'Frans (België)'), href: '/agency/stemmen/frans-belgie' },
    { name: t('common.lang.en_gb', 'Engels (UK)'), href: '/agency/stemmen/engels-uk' },
  ];

  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
      {/* Kolom 1: Brand & Reviews */}
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
        
        <VoicesLink href="/agency/reviews" className="flex items-center gap-4 py-4 px-5 bg-white rounded-[20px] border border-black/5 shadow-aura-sm group/review-widget hover:shadow-aura transition-all duration-500">
          <ContainerInstrument className="flex flex-col">
            <ContainerInstrument className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="text-[#fabc05]" fill="currentColor" />
              ))}
            </ContainerInstrument>
            <TextInstrument className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest">
              <VoiceglotText translationKey="footer.reviews.rating_label" defaultText={currentJourneyId === '3' || currentJourneyId === '26' ? "Telephony Rating" : "Google Rating"} />
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

        <TextInstrument className="text-va-black/40 text-[14px] font-light leading-relaxed max-w-sm">
          <VoiceglotText translationKey="footer.agency.tagline" defaultText="Het vriendelijkste stemmenbureau van de Benelux. Vandaag besteld, morgen klaar." />
        </TextInstrument>
      </ContainerInstrument>

      {/* Kolom 2: Direct boeken & Prijzen */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.booking.title" defaultText="Direct Boeken" />
        </HeadingInstrument>
        <ul className="space-y-3">
          <li>
            <VoicesLink href="/agency/stemmen" className="flex items-center gap-2 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors group">
              <Music size={16} strokeWidth={1.5} className="text-primary/40 group-hover:text-primary" />
              <VoiceglotText translationKey="footer.link.listen_voices" defaultText="Beluister onze stemmen" />
            </VoicesLink>
          </li>
          <li>
            <VoicesLink href="/agency/zo-werkt-het" className="flex items-center gap-2 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors group">
              <HelpCircle size={16} strokeWidth={1.5} className="text-primary/40 group-hover:text-primary" />
              <VoiceglotText translationKey="footer.link.how_it_works" defaultText="Hoe werkt het?" />
            </VoicesLink>
          </li>
          <li>
            <VoicesLink href="/tarieven" className="flex items-center gap-2 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors group">
              <Calculator size={16} strokeWidth={1.5} className="text-primary/40 group-hover:text-primary" />
              <VoiceglotText translationKey="footer.link.rates" defaultText="Tarieven overzicht" />
            </VoicesLink>
          </li>
        </ul>

        <div className="pt-4 space-y-4">
          <HeadingInstrument level={4} className="text-[11px] font-bold tracking-[0.1em] text-va-black/20 uppercase">
            <VoiceglotText translationKey="footer.section.languages.title" defaultText="Populaire talen" />
          </HeadingInstrument>
          <ul className="grid grid-cols-1 gap-2">
            {popularLanguages.map((lang, i) => (
              <li key={i}>
                <VoicesLink href={lang.href} className="flex items-center gap-2 text-[14px] font-light text-va-black/40 hover:text-primary transition-colors">
                  <Globe2 size={12} strokeWidth={1.5} />
                  {lang.name}
                </VoicesLink>
              </li>
            ))}
          </ul>
        </div>
      </ContainerInstrument>

      {/* Kolom 3: Vertrouwen & Support */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.trust.title" defaultText="Vertrouwen" />
        </HeadingInstrument>
        <ul className="space-y-3">
          <li>
            <VoicesLink href="/agency/zo-werkt-het/#faq" className="text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
              <VoiceglotText translationKey="footer.link.faq" defaultText="Veelgestelde vragen" />
            </VoicesLink>
          </li>
          <li>
            <VoicesLink href="/contact" className="text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
              <VoiceglotText translationKey="footer.link.contact" defaultText="Neem contact op" />
            </VoicesLink>
          </li>
        </ul>

        <div className="pt-4">
          <HeadingInstrument level={4} className="text-[11px] font-bold tracking-[0.1em] text-va-black/20 uppercase mb-4">
            <VoiceglotText translationKey="footer.section.payment.title" defaultText="Veilig betalen" />
          </HeadingInstrument>
          <ContainerInstrument className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <Image src="/assets/common/branding/payment/mollie.svg" alt="Mollie" width={50} height={15} className="h-3 w-auto" />
            <Image src="/assets/common/branding/payment/bancontact.svg" alt="Bancontact" width={25} height={15} className="h-4 w-auto" />
            <Image src="/assets/common/branding/payment/visa.svg" alt="Visa" width={30} height={15} className="h-2.5 w-auto" />
          </ContainerInstrument>
        </div>
      </ContainerInstrument>

      {/* Kolom 4: Contact & Bereikbaarheid */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.contact.title" defaultText="Contact" />
        </HeadingInstrument>
        
        <ContainerInstrument className="space-y-4 w-full">
          <a href={`mailto:${activeEmail}`} className="flex items-center gap-3 p-3 bg-va-black/5 rounded-[12px] border border-black/5 hover:bg-primary/5 hover:border-primary/10 transition-all group">
            <Mail size={18} strokeWidth={1.5} className="text-primary/40 group-hover:text-primary" />
            <div className="flex flex-col">
              <TextInstrument className="text-[11px] font-bold uppercase tracking-widest text-va-black/30">Email ons</TextInstrument>
              <TextInstrument className="text-[14px] font-medium text-va-black/70">{activeEmail}</TextInstrument>
            </div>
          </a>

          <a href={`tel:${activePhone.replace(/\s+/g, '')}`} className="flex items-center gap-3 p-3 bg-va-black/5 rounded-[12px] border border-black/5 hover:bg-primary/5 hover:border-primary/10 transition-all group">
            <Phone size={18} strokeWidth={1.5} className="text-primary/40 group-hover:text-primary" />
            <div className="flex flex-col">
              <TextInstrument className="text-[11px] font-bold uppercase tracking-widest text-va-black/30">Bel de studio</TextInstrument>
              <TextInstrument className="text-[14px] font-medium text-va-black/70">{activePhone}</TextInstrument>
            </div>
          </a>

          <VoicesLink href="/contact" className="flex items-center justify-center gap-2 w-full py-3 bg-va-black text-white rounded-[12px] text-[13px] font-bold hover:bg-primary transition-colors shadow-aura-sm">
            <MessageSquare size={16} strokeWidth={2} />
            <VoiceglotText translationKey="footer.link.casting_help" defaultText="Casting-hulp nodig?" />
          </VoicesLink>
        </ContainerInstrument>

        <div className="flex gap-3 pt-2">
          {['instagram', 'linkedin', 'facebook'].map((id) => (
            activeSocials[id] && (
              <ButtonInstrument 
                key={id}
                as="a"
                href={activeSocials[id]}
                size="none"
                className="w-9 h-9 rounded-full bg-va-black/5 flex items-center justify-center hover:bg-va-black group transition-all duration-300"
              >
                {id === 'instagram' && <Instagram size={16} strokeWidth={1.5} className="text-va-black group-hover:text-white" />}
                {id === 'linkedin' && <Linkedin size={16} strokeWidth={1.5} className="text-va-black group-hover:text-white" />}
                {id === 'facebook' && <Facebook size={16} strokeWidth={1.5} className="text-va-black group-hover:text-white" />}
              </ButtonInstrument>
            )
          ))}
        </div>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
