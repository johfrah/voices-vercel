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
import { FileText, Shield, Scale, Gavel } from 'lucide-react';

/**
 * 📜 TERMS & CONDITIONS PAGE (NUCLEAR 2026)
 */
export default function TermsPage() {
  return (
    <PageWrapperInstrument className="pt-32 pb-40 px-6 md:px-12 bg-va-off-white min-h-screen">
      <ContainerInstrument className="max-w-4xl mx-auto">
        
        {/* Header */}
        <SectionInstrument className="mb-16">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/10 mb-8">
            <Scale size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="terms.badge" defaultText="Juridisch" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="terms.title" defaultText="Algemene Voorwaarden." />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl">
            <VoiceglotText 
              translationKey="terms.subtitle" 
              defaultText="De kleine lettertjes, maar dan in een duidelijk jasje. Hier lees je de afspraken die we met elkaar maken." 
            />
          </TextInstrument>
        </SectionInstrument>

        <div className="bg-white shadow-aura rounded-[40px] p-12 space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Gavel size={20} />
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight">1. Dienstverlening</HeadingInstrument>
            </div>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light">
              Voices.be treedt op als bemiddelaar tussen opdrachtgevers en stemacteurs. Wij zorgen voor een vlekkeloze afhandeling van de boeking, betaling en levering van de audiobestanden.
            </TextInstrument>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Shield size={20} />
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight">2. Gebruiksrechten (Buy-outs)</HeadingInstrument>
            </div>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light">
              De prijs van een opname is inclusief de gebruiksrechten voor het overeengekomen mediatype (bijv. online, radio, TV) en de overeengekomen periode. Voor commercieel gebruik buiten deze afspraken is een aanvullende buy-out vereist.
            </TextInstrument>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary mb-4">
              <FileText size={20} />
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight">3. Betaling & Levering</HeadingInstrument>
            </div>
            <TextInstrument className="text-va-black/60 leading-relaxed font-light">
              Bestellingen worden in behandeling genomen zodra de betaling is ontvangen (via Mollie of overschrijving). De levertijd gaat in op het moment dat het volledige script en alle instructies door de stemacteur zijn ontvangen.
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
