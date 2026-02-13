import React from 'react';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Settings, ArrowLeft, User, Lock, Bell, Shield } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-16">
        <Link strokeWidth={1.5} 
          href="/account" 
          className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft strokeWidth={1.5} size={12} /> 
          <VoiceglotText strokeWidth={1.5} translationKey="account.back_to_dashboard" defaultText="Terug naar Dashboard" / />
        </Link>
        <ContainerInstrument className="space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/10">
            <Settings strokeWidth={1.5} size={12} fill="currentColor" / /> 
            <VoiceglotText strokeWidth={1.5} translationKey="account.settings.badge" defaultText="Account Instellingen" / />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter"><VoiceglotText strokeWidth={1.5} translationKey="account.settings.title_part1" defaultText="Jouw " / /><TextInstrument as="span" className="text-primary font-light"><VoiceglotText strokeWidth={1.5} translationKey="account.settings.title_part2" defaultText="Profiel" / /></TextInstrument></HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light"><VoiceglotText strokeWidth={1.5} translationKey="account.settings.subtitle" defaultText="Beheer je persoonlijke gegevens en voorkeuren." / /></TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid>
        <BentoCard span="lg" className="bg-white shadow-aura p-12 space-y-8">
          <ContainerInstrument className="flex items-center gap-4 border-b border-va-off-white pb-8">
            <ContainerInstrument className="w-16 h-16 bg-va-black rounded-2xl flex items-center justify-center text-white text-2xl font-light">
              JD
            </ContainerInstrument>
            <ContainerInstrument>
              <HeadingInstrument level={3} className="text-xl font-light tracking-tight">
                <VoiceglotText strokeWidth={1.5} translationKey="account.settings.personal_title" defaultText="Persoonlijke Gegevens" / />
                <TextInstrument className="text-va-black/40 text-[15px] font-light">
                  <VoiceglotText strokeWidth={1.5} translationKey="account.settings.personal_subtitle" defaultText="Update je naam en e-mailadres." / />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ContainerInstrument className="space-y-2">
              <TextInstrument as="label" className="text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText strokeWidth={1.5} translationKey="common.first_name" defaultText="Voornaam" / /></TextInstrument>
              <InputInstrument type="text" className="w-full bg-va-off-white border-none rounded-xl py-4 px-6 text-[15px] font-light" defaultValue="John" />
            </ContainerInstrument>
            <ContainerInstrument className="space-y-2">
              <TextInstrument as="label" className="text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText strokeWidth={1.5} translationKey="common.last_name" defaultText="Achternaam" / /></TextInstrument>
              <InputInstrument type="text" className="w-full bg-va-off-white border-none rounded-xl py-4 px-6 text-[15px] font-light" defaultValue="Doe" />
            </ContainerInstrument>
          </ContainerInstrument>

          <ButtonInstrument className="va-btn-pro w-full md:w-auto"><VoiceglotText strokeWidth={1.5} translationKey="common.save_changes" defaultText="Wijzigingen Opslaan" / /></ButtonInstrument>
        </BentoCard>

        <BentoCard span="sm" className="bg-va-black text-white p-12 flex flex-col justify-between group">
          <ContainerInstrument>
            <ContainerInstrument className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mb-6">
              <Lock strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-2">
              <VoiceglotText strokeWidth={1.5} translationKey="account.settings.security_title" defaultText="Beveiliging" / />
              <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed">
                <VoiceglotText strokeWidth={1.5} translationKey="account.settings.security_text" defaultText="Wijzig je wachtwoord of activeer extra beveiliging." / />
              </TextInstrument>
            </HeadingInstrument>
          </ContainerInstrument>
          <ButtonInstrument className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
            <VoiceglotText strokeWidth={1.5} translationKey="account.settings.change_password" defaultText="Wachtwoord Wijzigen" / />
            <ArrowLeft strokeWidth={1.5} size={14} className="rotate-180" />
          </ButtonInstrument>
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
