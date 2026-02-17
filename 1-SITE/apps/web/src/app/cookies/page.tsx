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
import { Cookie, Shield, Eye, Settings } from 'lucide-react';

/**
 *  COOKIE POLICY PAGE (NUCLEAR 2026)
 */
export default function CookiesPage() {
  return (
    <PageWrapperInstrument className="pt-32 pb-40 px-6 md:px-12 bg-va-off-white min-h-screen">
      <ContainerInstrument className="max-w-4xl mx-auto">
        
        {/* Header */}
        <SectionInstrument className="mb-16">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/10 mb-8">
            <Cookie strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText  translationKey="cookies.badge" defaultText="Cookiebeleid" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6"><VoiceglotText  translationKey="cookies.title" defaultText="Cookies & Tracking." /><TextInstrument className="text-va-black/40 font-medium text-xl"><VoiceglotText  
              translationKey="cookies.subtitle" 
              defaultText="Hoe we cookies gebruiken om jouw ervaring op Voices.be te verbeteren." 
            /></TextInstrument></HeadingInstrument>
        </SectionInstrument>

        <ContainerInstrument className="bg-white shadow-aura rounded-[40px] p-12 space-y-12">
          <section className="space-y-4">
            <ContainerInstrument className="flex items-center gap-3 text-primary mb-4">
              <Shield strokeWidth={1.5} size={20} />
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight"><VoiceglotText  translationKey="auto.page.functionele_cookies.ee4c45" defaultText="Functionele Cookies" /></HeadingInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light"><VoiceglotText  translationKey="auto.page.deze_cookies_zijn_no.beee68" defaultText="Deze cookies zijn noodzakelijk voor de werking van de website. Ze onthouden bijvoorbeeld je taalkeuze, je winkelmandje en of je bent ingelogd." /></TextInstrument>
          </section>

          <section className="space-y-4">
            <ContainerInstrument className="flex items-center gap-3 text-primary mb-4">
              <Eye strokeWidth={1.5} size={20} />
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight"><VoiceglotText  translationKey="auto.page.analytische_cookies.58f50b" defaultText="Analytische Cookies" /></HeadingInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light"><VoiceglotText  translationKey="auto.page.we_gebruiken_geanoni.d9a96b" defaultText="We gebruiken geanonimiseerde data om te begrijpen hoe bezoekers onze site gebruiken. Dit helpt ons om de navigatie en de snelheid van de site continu te verbeteren." /></TextInstrument>
          </section>

          <section className="space-y-4">
            <ContainerInstrument className="flex items-center gap-3 text-primary mb-4">
              <Settings strokeWidth={1.5} size={20} />
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight"><VoiceglotText  translationKey="auto.page.jouw_voorkeuren.1003ed" defaultText="Jouw Voorkeuren" /></HeadingInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light"><VoiceglotText  translationKey="auto.page.je_kunt_je_cookie_in.771b39" defaultText="Je kunt je cookie-instellingen op elk moment aanpassen via de instellingen van je browser." /></TextInstrument>
          </section>

          <ContainerInstrument className="pt-12 border-t border-va-off-white">
            <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/20"><VoiceglotText  translationKey="auto.page.laatst_bijgewerkt__1.e82338" defaultText="Laatst bijgewerkt: 10 februari 2026" /></TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
