"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';
import { VoicesLink } from '../VoicesLink';
import { Phone, Mail, Calendar, Users, BookOpen, GraduationCap } from 'lucide-react';

export function StudioFooter({ market, activeSocials, activePhone, activeEmail }: any) {
  const { t } = useTranslation();

  const workshops = [
    { 
      name: 'Perfect spreken in 1 dag', 
      href: '/studio/perfect-spreken-in-1-dag',
      description: 'Spreken met helderheid, warmte en impact.'
    },
    { 
      name: 'Voice-overs voor beginners', 
      href: '/studio/masterclass',
      description: 'De start van je professionele traject.'
    },
    { 
      name: 'Storytelling & Presentatie', 
      href: '/studio/storytelling',
      description: 'Til je podcast of presentatie naar een hoger niveau.'
    },
    { 
      name: 'Uitspraak & Stemgebruik', 
      href: '/studio/uitspraak',
      description: 'Essentiële vaardigheden voor elke spreker.'
    }
  ];

  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
      {/* Kolom 1: Studio Brand (Berny DNA) */}
      <ContainerInstrument className="space-y-8 flex flex-col items-start">
        <VoicesLink href="/studio" className="flex items-center gap-3 group justify-start">
          <TextInstrument className="text-2xl font-light tracking-tighter text-va-black">
            Voices <span className="text-primary italic">Studio</span>
          </TextInstrument>
        </VoicesLink>
        <TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed max-w-sm text-left italic">
          <VoiceglotText translationKey="footer.studio.promise" defaultText="&quot;Workshops voor professionele sprekers.&quot;" />
        </TextInstrument>
        <TextInstrument className="text-va-black/60 text-[14px] font-light leading-relaxed max-w-sm">
          <VoiceglotText translationKey="footer.studio.tagline" defaultText="Verbeter je stem, ontdek verschillende voice-overstijlen en perfectioneer je opnamevaardigheden." />
        </TextInstrument>
      </ContainerInstrument>

      {/* Kolom 2: Onze Workshops */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.studio.workshops" defaultText="Onze Workshops" />
        </HeadingInstrument>
        <ul className="space-y-4">
          {workshops.map((workshop, i) => (
            <li key={i}>
              <VoicesLink href={workshop.href} className="flex flex-col gap-0.5 group">
                <TextInstrument className="text-[15px] font-medium text-va-black/70 group-hover:text-primary transition-colors">
                  {workshop.name}
                </TextInstrument>
                <TextInstrument className="text-[12px] font-light text-va-black/40 leading-snug">
                  {workshop.description}
                </TextInstrument>
              </VoicesLink>
            </li>
          ))}
          <li className="pt-2 border-t border-black/5 w-full">
            <VoicesLink href="/studio/workshops" className="flex items-center gap-2 text-[13px] font-bold text-primary hover:opacity-70 transition-opacity">
              <Calendar size={14} />
              <VoiceglotText translationKey="footer.link.studio.editions" defaultText="Bekijk alle komende edities" />
            </VoicesLink>
          </li>
        </ul>
      </ContainerInstrument>

      {/* Kolom 3: De Instructeurs */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.studio.coaches" defaultText="De Instructeurs" />
        </HeadingInstrument>
        <ul className="space-y-4">
          <li className="flex flex-col gap-1">
            <TextInstrument className="text-[15px] font-medium text-va-black/70">Bernadette Timmermans</TextInstrument>
            <TextInstrument className="text-[12px] font-light text-va-black/40 leading-snug">Gerenommeerde stemcoach & auteur van 'Klink Klaar'.</TextInstrument>
          </li>
          <li className="flex flex-col gap-1">
            <TextInstrument className="text-[15px] font-medium text-va-black/70">Johfrah Lefebvre</TextInstrument>
            <TextInstrument className="text-[12px] font-light text-va-black/40 leading-snug">Bedreven Vlaamse voice-over & regisseur.</TextInstrument>
          </li>
        </ul>
      </ContainerInstrument>

      {/* Kolom 4: Contact & Info */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.contact.title" defaultText="Contact" />
        </HeadingInstrument>
        <ContainerInstrument className="space-y-3 w-full">
          <a href={`mailto:${activeEmail}`} className="flex items-center gap-2 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
            <Mail size={14} strokeWidth={1.5} />
            <span>{activeEmail}</span>
          </a>
          <a href={`tel:${activePhone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-[15px] font-light text-va-black/60 hover:text-primary transition-colors">
            <Phone size={14} strokeWidth={1.5} />
            <span>{activePhone}</span>
          </a>
        </ContainerInstrument>
        
        <div className="pt-4 space-y-3 w-full border-t border-black/5">
          <VoicesLink href="/academy" className="flex items-center gap-2 text-[14px] font-light text-va-black/40 hover:text-primary transition-colors">
            <GraduationCap size={14} />
            <span>Naar de Academy</span>
          </VoicesLink>
          <VoicesLink href="/studio/faq" className="flex items-center gap-2 text-[14px] font-light text-va-black/40 hover:text-primary transition-colors">
            <BookOpen size={14} />
            <span>Veelgestelde vragen</span>
          </VoicesLink>
        </div>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
