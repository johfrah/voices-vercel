"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '../LayoutInstruments';
import { VoiceglotText } from '../VoiceglotText';
import { VoicesLink } from '../VoicesLink';
import { Phone, Mail, Calendar, BookOpen, GraduationCap } from 'lucide-react';

export function StudioFooter({ market, activeSocials, activePhone, activeEmail }: any) {
  const { t } = useTranslation();

  // 🛡️ CHRIS-PROTOCOL: Exacte sync met Supabase Source of Truth
  const workshops = [
    { name: 'Perfect spreken in 1 dag', href: '/studio/perfect-spreken-in-1-dag', description: 'Spreken met helderheid, warmte en impact.' },
    { name: 'Voice-overs voor beginners', href: '/studio/masterclass', description: 'De start van je professionele traject.' },
    { name: 'Maak je eigen podcast', href: '/studio/maak-je-eigen-podcast', description: 'Van concept tot professionele opname.' },
    { name: 'Maak je eigen radioshow', href: '/studio/maak-je-eigen-radioshow', description: 'De dynamiek van live radio maken.' },
    { name: 'Perfectie van intonatie', href: '/studio/perfectie-van-intonatie', description: 'De fijne kneepjes van de juiste klemtoon.' },
    { name: 'Perfectie van articulatie', href: '/studio/perfectie-van-articulatie', description: 'Heldere uitspraak voor elke microfoon.' },
    { name: 'Audioboeken inspreken', href: '/studio/audioboeken-inspreken', description: 'Urenlang boeien met je stem.' },
    { name: 'Documentaires inspreken', href: '/studio/documentaires-inspreken', description: 'De kunst van de voice-over bij beeld.' },
    { name: 'Speel een stemmetje in een tekenfilm', href: '/studio/tekenfilm-stemmetjes', description: 'Karakterstemmen en stemacteren.' },
    { name: 'Meditatief spreken', href: '/studio/meditaties-inspreken', description: 'Rust en verbinding in je stem.' },
    { name: 'Verwen je stem!', href: '/studio/verwen-je-stem', description: 'Onderhoud en verzorging van je instrument.' },
    { name: 'Voice-over voor audio-descriptie', href: '/studio/audio-descriptie', description: 'Beeld vertalen naar stem.' }
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

      {/* Kolom 2: Onze Workshops (De 12 uit Supabase) */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start lg:col-span-2">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.studio.workshops" defaultText="Onze Workshops" />
        </HeadingInstrument>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 w-full">
          {workshops.map((workshop, i) => (
            <li key={i}>
              <VoicesLink href={workshop.href} className="flex flex-col gap-0.5 group">
                <TextInstrument className="text-[14px] font-medium text-va-black/70 group-hover:text-primary transition-colors">
                  {workshop.name}
                </TextInstrument>
                <TextInstrument className="text-[11px] font-light text-va-black/40 leading-snug">
                  {workshop.description}
                </TextInstrument>
              </VoicesLink>
            </li>
          ))}
        </ul>
        <div className="pt-4 border-t border-black/5 w-full">
          <VoicesLink href="/studio/workshops" className="flex items-center gap-2 text-[13px] font-bold text-primary hover:opacity-70 transition-opacity">
            <Calendar size={14} />
            <VoiceglotText translationKey="footer.link.studio.editions" defaultText="Bekijk alle komende edities" />
          </VoicesLink>
        </div>
      </ContainerInstrument>

      {/* Kolom 4: Contact & Info */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.contact.title" defaultText="Contact" />
        </HeadingInstrument>
        
        <ContainerInstrument className="space-y-4 w-full">
          <div className="flex flex-col gap-1 list-none">
            <TextInstrument className="text-[14px] font-medium text-va-black/70">Bernadette Timmermans</TextInstrument>
            <TextInstrument className="text-[11px] font-light text-va-black/40 leading-snug italic">Gerenommeerde stemcoach</TextInstrument>
          </div>
          <div className="flex flex-col gap-1 list-none pb-4">
            <TextInstrument className="text-[14px] font-medium text-va-black/70">Johfrah Lefebvre</TextInstrument>
            <TextInstrument className="text-[11px] font-light text-va-black/40 leading-snug italic">Voice-over & regisseur</TextInstrument>
          </div>
          
          <div className="pt-4 border-t border-black/5 space-y-3">
            <a href={`mailto:${activeEmail}`} className="flex items-center gap-2 text-[14px] font-light text-va-black/60 hover:text-primary transition-colors">
              <Mail size={14} strokeWidth={1.5} />
              <span>{activeEmail}</span>
            </a>
            <a href={`tel:${activePhone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-[14px] font-light text-va-black/60 hover:text-primary transition-colors">
              <Phone size={14} strokeWidth={1.5} />
              <span>{activePhone}</span>
            </a>
          </div>
        </ContainerInstrument>
        
        <div className="pt-4 space-y-3 w-full border-t border-black/5">
          <VoicesLink href="/academy" className="flex items-center gap-2 text-[13px] font-light text-va-black/40 hover:text-primary transition-colors">
            <GraduationCap size={14} />
            <span>Naar de Academy</span>
          </VoicesLink>
          <VoicesLink href="/studio/faq" className="flex items-center gap-2 text-[13px] font-light text-va-black/40 hover:text-primary transition-colors">
            <BookOpen size={14} />
            <span>Veelgestelde vragen</span>
          </VoicesLink>
        </div>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
