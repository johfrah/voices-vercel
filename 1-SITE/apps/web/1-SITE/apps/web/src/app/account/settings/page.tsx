import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Settings, ArrowLeft, User, Lock, Bell, Shield, BadgeCheck } from 'lucide-react';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { ActorProfileForm } from '@/components/forms/ActorProfileForm';
import { LiquidBackground } from '@/components/ui/LiquidBackground';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  
  const handleSave = async (data: any) => {
    "use server";
    console.log(' CHRIS-PROTOCOL: Saving actor profile data...', data);
    // Hier komt de DbService.updateRecord aanroep
  };

  return (
    <PageWrapperInstrument>
      <LiquidBackground />
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <SectionInstrument className="mb-16">
          <Link  
            href="/account" 
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="account.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          <ContainerInstrument className="space-y-4">
            <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/10">
              <Settings strokeWidth={1.5} size={12} fill="currentColor" /> 
              <VoiceglotText  translationKey="account.settings.badge" defaultText="Account Instellingen" />
            </ContainerInstrument>
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-tight">
              <VoiceglotText  translationKey="account.settings.title_part1" defaultText="Jouw " />
              <TextInstrument as="span" className="text-primary font-light">
                <VoiceglotText  translationKey="account.settings.title_part2" defaultText="Profiel" />
              </TextInstrument>
            </HeadingInstrument>
            <TextInstrument className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight max-w-2xl">
              <VoiceglotText  translationKey="account.settings.subtitle" defaultText="Beheer je persoonlijke gegevens, talen en artistieke kenmerken." />
            </TextInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/*  Links: De Anker (4 kolommen) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-aura border border-black/[0.02] text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-va-off-white rounded-[32px] flex items-center justify-center text-va-black/20 overflow-hidden border border-black/[0.05]">
                  <User size={64} strokeWidth={1} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                  <BadgeCheck size={20} strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <HeadingInstrument level={3} className="text-2xl tracking-tight font-medium">
                  {auth.user?.firstName} {auth.user?.lastName}
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 text-[13px] tracking-widest uppercase">
                  <VoiceglotText translationKey="account.settings.role_actor" defaultText="Pro Voice Actor" />
                </TextInstrument>
              </div>
              <div className="pt-6 border-t border-black/[0.03] flex justify-center gap-8">
                <div className="text-center">
                  <TextInstrument className="text-xl font-medium leading-none">12</TextInstrument>
                  <TextInstrument className="text-[10px] text-va-black/40 uppercase tracking-tighter">
                    <VoiceglotText translationKey="account.settings.projects" defaultText="Projecten" />
                  </TextInstrument>
                </div>
                <div className="text-center">
                  <TextInstrument className="text-xl font-medium leading-none">4.9</TextInstrument>
                  <TextInstrument className="text-[10px] text-va-black/40 uppercase tracking-tighter">
                    <VoiceglotText translationKey="account.settings.rating" defaultText="Rating" />
                  </TextInstrument>
                </div>
              </div>
            </div>

            <div className="bg-va-black text-white p-8 rounded-[40px] shadow-aura space-y-6 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                <Lock strokeWidth={1.5} size={24} />
              </div>
              <div>
                <HeadingInstrument level={3} className="text-xl tracking-tight mb-2 text-white">
                  <VoiceglotText translationKey="account.settings.security.title" defaultText="Beveiliging" />
                </HeadingInstrument>
                <TextInstrument className="text-white/40 text-[14px] leading-relaxed">
                  <VoiceglotText translationKey="account.settings.security.text" defaultText="Wijzig je wachtwoord of activeer extra beveiliging voor je account." />
                </TextInstrument>
              </div>
              <ButtonInstrument variant="link" className="text-primary p-0 h-auto flex items-center gap-2 group-hover:gap-4 transition-all">
                <VoiceglotText translationKey="account.settings.security.cta" defaultText="Wachtwoord Wijzigen" />
                <ArrowLeft strokeWidth={1.5} size={14} className="rotate-180" />
              </ButtonInstrument>
            </div>

            {/*  AGENCY WORKSPACE (2026) */}
            <div className="bg-white p-8 rounded-[40px] shadow-aura border border-black/[0.02] space-y-6">
              <div className="w-12 h-12 bg-va-off-white rounded-2xl flex items-center justify-center text-va-black/40">
                <Shield strokeWidth={1.5} size={24} />
              </div>
              <div>
                <HeadingInstrument level={3} className="text-xl tracking-tight mb-2">
                  <VoiceglotText translationKey="account.settings.agency.title" defaultText="Agency Workspace" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 text-[14px] leading-relaxed">
                  <VoiceglotText translationKey="account.settings.agency.text" defaultText="Nodig teamleden uit om samen te werken aan projecten en audities." />
                </TextInstrument>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-va-off-white rounded-xl border border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                      {auth.user?.firstName?.substring(0, 1)}{auth.user?.lastName?.substring(0, 1)}
                    </div>
                    <TextInstrument className="text-[13px] font-medium">
                      {auth.user?.firstName} {auth.user?.lastName} (Admin)
                    </TextInstrument>
                  </div>
                </div>
                <ButtonInstrument className="w-full bg-va-black text-white py-3 rounded-xl text-[13px] font-bold tracking-tight hover:bg-primary transition-all">
                  <VoiceglotText translationKey="account.settings.agency.invite" defaultText="Teamlid Uitnodigen" />
                </ButtonInstrument>
              </div>
            </div>
          </div>

          {/*  Rechts: De Inhoud (8 kolommen) */}
          <div className="lg:col-span-8">
            <ActorProfileForm mode="settings" onSave={handleSave} />
          </div>
        </div>
      </div>
    </PageWrapperInstrument>
  );
}
