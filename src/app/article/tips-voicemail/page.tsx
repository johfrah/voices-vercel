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
import { Lightbulb, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

/**
 * ARTICLE: TIPS-VOICEMAIL (PHYSICAL FALLBACK)
 * Theme: Inspiratie
 */
export default function VoicemailTipsArticlePage() {
  const tips = [
    { title: "Houd het kort", text: "Niemand wacht graag. Beperk je boodschap tot de essentie: wie ben je, waarom neem je niet op en wanneer ben je er weer." },
    { title: "Spreek glimlachend", text: "Je hoort een glimlach door de telefoon. Het maakt je boodschap direct een stuk vriendelijker." },
    { title: "Vermijd clichés", text: "Vervang 'uw oproep is belangrijk voor ons' door iets menselijks, zoals 'we helpen je graag zo snel mogelijk'." },
    { title: "Check je techniek", text: "Zorg voor een ruisvrije opname. Een professionele stem verdient een professionele afwerking." },
    { title: "Update regelmatig", text: "Niets is zo frustrerend als een kerstboodschap in juli. Houd je meldingen actueel." }
  ];

  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-5xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[15px] font-black uppercase tracking-widest text-va-black/40 hover:text-primary transition-all mb-8"
          >
            <ArrowLeft size={14} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-black uppercase tracking-[0.2em] text-primary mb-4">
            <VoiceglotText translationKey="article.theme.inspiration" defaultText="Inspiratie" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="tips.voicemail.title" defaultText="5 tips om te scoren met je voicemail" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={2}>
          {tips.map((tip, i) => (
            <BentoCard 
              key={i}
              span="md" 
              className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-10"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div className="space-y-2">
                  <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight">
                    <VoiceglotText translationKey={`tips.voicemail.tip${i+1}.title`} defaultText={tip.title} />
                  </HeadingInstrument>
                  <TextInstrument className="text-va-black/60 leading-relaxed">
                    <VoiceglotText translationKey={`tips.voicemail.tip${i+1}.text`} defaultText={tip.text} />
                  </TextInstrument>
                </div>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
