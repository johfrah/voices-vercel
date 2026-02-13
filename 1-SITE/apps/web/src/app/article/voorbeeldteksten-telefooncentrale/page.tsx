import React from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument
} from "@/components/ui/LayoutInstruments";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { FileText, Copy, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * ARTICLE: VOORBEELDTEKSTEN-TELEFOONCENTRALE (PHYSICAL FALLBACK)
 * Theme: Inspiratie
 */
export default function ScriptsArticlePage() {
  const categories = [
    { 
      title: "Gesloten & Buiten kantooruren", 
      content: "Welkom bij [Bedrijfsnaam]. Momenteel is ons kantoor gesloten. We zijn te bereiken van maandag tot en met vrijdag van 08:30 tot 17:00. Laat een bericht achter of stuur een e-mail naar [E-mailadres]. Bedankt voor uw oproep.",
      key: "scripts.closed"
    },
    { 
      title: "Keuzemenu (IVR)", 
      content: "Welkom bij [Bedrijfsnaam]. Voor onze helpdesk, druk 1. Voor verkoop, druk 2. Voor administratie of andere vragen, blijf aan de lijn of druk 3.",
      key: "scripts.ivr"
    },
    { 
      title: "Wachtbericht", 
      content: "Een moment geduld alstublieft, al onze medewerkers zijn momenteel in gesprek. U wordt zo spoedig mogelijk geholpen. Bedankt voor uw geduld.",
      key: "scripts.waiting"
    },
    { 
      title: "Vakantie & Feestdagen", 
      content: "Goeiedag, welkom bij [Bedrijfsnaam]. In verband met onze jaarlijkse vakantie zijn wij gesloten tot [Datum]. Vanaf [Datum] staan we weer voor u klaar. Kijk voor dringende zaken op onze website.",
      key: "scripts.holiday"
    }
  ];

  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-6xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[10px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 uppercase"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[10px] font-light tracking-[0.2em] text-primary mb-4 uppercase">
            <VoiceglotText translationKey="article.theme.inspiration" defaultText="Inspiratie" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black uppercase">
            <VoiceglotText translationKey="scripts.title" defaultText="Voorbeeldteksten voor je telefooncentrale" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={2}>
          {categories.map((cat, i) => (
            <BentoCard 
              key={i}
              span="md" 
              className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-10 flex flex-col justify-between !rounded-[20px]"
            >
              <ContainerInstrument>
                <ContainerInstrument className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText size={20} strokeWidth={1.5} />
                  </div>
                  <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black uppercase">
                    <VoiceglotText translationKey={`${cat.key}.title`} defaultText={cat.title} />
                  </HeadingInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="p-6 bg-va-off-white rounded-[15px] border border-black/5 relative group">
                  <TextInstrument className="text-sm font-light leading-relaxed text-va-black/70 italic">
                    "<VoiceglotText translationKey={`${cat.key}.content`} defaultText={cat.content} />"
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              
              <button className="mt-8 flex items-center gap-2 text-[10px] font-light tracking-widest text-va-black/30 hover:text-primary transition-all uppercase">
                <Copy size={14} strokeWidth={1.5} />
                <VoiceglotText translationKey="scripts.copy_button" defaultText="Kopieer Tekst" />
              </button>
            </BentoCard>
          ))}
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
