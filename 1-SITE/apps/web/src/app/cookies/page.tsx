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
 * 🍪 COOKIE POLICY PAGE (NUCLEAR 2026)
 */
export default function CookiesPage() {
  return (
    <PageWrapperInstrument className="pt-32 pb-40 px-6 md:px-12 bg-va-off-white min-h-screen">
      <ContainerInstrument className="max-w-4xl mx-auto">
        
        {/* Header */}
        <SectionInstrument className="mb-16">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/10 mb-8">
            <Cookie size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="cookies.badge" defaultText="Cookiebeleid" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="cookies.title" defaultText="Cookies & Tracking." />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl">
            <VoiceglotText 
              translationKey="cookies.subtitle" 
              defaultText="Hoe we cookies gebruiken om jouw ervaring op Voices.be te verbeteren." 
            />
          </TextInstrument>
        </SectionInstrument>

        <div className="bg-white shadow-aura rounded-[40px] p-12 space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Shield size={20} />
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight">Functionele Cookies</HeadingInstrument>
            </div>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light">
              Deze cookies zijn noodzakelijk voor de werking van de website. Ze onthouden bijvoorbeeld je taalkeuze, je winkelmandje en of je bent ingelogd.
            </TextInstrument>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Eye size={20} />
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight">Analytische Cookies</HeadingInstrument>
            </div>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light">
              We gebruiken geanonimiseerde data om te begrijpen hoe bezoekers onze site gebruiken. Dit helpt ons om de navigatie en de snelheid van de site continu te verbeteren.
            </TextInstrument>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Settings size={20} />
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight">Jouw Voorkeuren</HeadingInstrument>
            </div>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light">
              Je kunt je cookie-instellingen op elk moment aanpassen via de instellingen van je browser.
            </TextInstrument>
          </section>

          <div className="pt-12 border-t border-va-off-white">
            <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/20">
              Laatst bijgewerkt: 10 februari 2026
            </TextInstrument>
          </div>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
