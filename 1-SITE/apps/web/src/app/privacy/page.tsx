"use client";

import React from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

/**
 * 🛡️ PRIVACY POLICY PAGE (NUCLEAR 2026)
 */
export default function PrivacyPage() {
  return (
    <PageWrapperInstrument className="pt-32 pb-40 px-6 md:px-12 bg-va-off-white min-h-screen">
      <ContainerInstrument className="max-w-4xl mx-auto">
        
        {/* Header */}
        <SectionInstrument className="mb-16">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/10 mb-8">
            <Shield strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="privacy.badge" defaultText="Privacy & Veiligheid" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none mb-6"><VoiceglotText translationKey="privacy.title" defaultText="Jouw Privacy." /><TextInstrument className="text-va-black/40 font-medium text-xl"><VoiceglotText 
              translationKey="privacy.subtitle" 
              defaultText="Bij Voices.be nemen we de bescherming van jouw data serieus. Hier lees je hoe we omgaan met je gegevens." 
            /></TextInstrument></HeadingInstrument>
        </SectionInstrument>

        <ContainerInstrument className="bg-white shadow-aura rounded-[40px] p-12 space-y-12">
          <section className="space-y-4">
            <ContainerInstrument className="flex items-center gap-3 text-primary mb-4">
              <Eye size={20} />
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight"><VoiceglotText translationKey="auto.page.welke_gegevens_verza.3f2ccd" defaultText="Welke gegevens verzamelen we?" /></HeadingInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light"><VoiceglotText translationKey="auto.page.we_verzamelen_alleen.f7b480" defaultText="We verzamelen alleen de gegevens die nodig zijn om onze diensten te leveren. Dit omvat je naam, e-mailadres, bedrijfsgegevens en de informatie die je verstrekt in briefings voor stemacteurs." /></TextInstrument>
          </section>

          <section className="space-y-4">
            <ContainerInstrument className="flex items-center gap-3 text-primary mb-4">
              <Lock strokeWidth={1.5} size={20} />
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight"><VoiceglotText translationKey="auto.page.hoe_beschermen_we_je.c13679" defaultText="Hoe beschermen we je data?" /></HeadingInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light"><VoiceglotText translationKey="auto.page.al_je_gegevens_worde.b06875" defaultText="Al je gegevens worden opgeslagen in een beveiligde cloud-omgeving (Supabase) met strikte toegangscontrole. We maken gebruik van versleutelde verbindingen en moderne beveiligingsprotocollen om misbruik te voorkomen." /></TextInstrument>
          </section>

          <section className="space-y-4">
            <ContainerInstrument className="flex items-center gap-3 text-primary mb-4">
              <FileText size={20} />
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight"><VoiceglotText translationKey="auto.page.jouw_rechten.73346d" defaultText="Jouw Rechten" /></HeadingInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light"><VoiceglotText translationKey="auto.page.je_hebt_op_elk_momen.4459b6" defaultText="Je hebt op elk moment het recht om je gegevens in te zien, te corrigeren of te laten verwijderen. Dit kun je eenvoudig doen via je accountinstellingen of door contact met ons op te nemen." /></TextInstrument>
          </section>

          <ContainerInstrument className="pt-12 border-t border-va-off-white">
            <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/20"><VoiceglotText translationKey="auto.page.laatst_bijgewerkt__1.e82338" defaultText="Laatst bijgewerkt: 10 februari 2026" /></TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
