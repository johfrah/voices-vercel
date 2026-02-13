import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Copy, FileText } from "lucide-react";

/**
 * SCRIPTS: TELEFOON TEKSTEN (PHYSICAL PAGE)
 * 
 * "Inspiratie voor je centrale."
 */
export default function ScriptsPage() {
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
      <LiquidBackground strokeWidth={1.5} / />
      
      <SectionInstrument className="max-w-6xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-16">
          <TextInstrument className="text-[15px] font-black tracking-[0.2em] text-primary mb-4"><VoiceglotText strokeWidth={1.5} translationKey="scripts.category" defaultText="Inspiratie" / /></TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none mb-6"><VoiceglotText strokeWidth={1.5} translationKey="scripts.title" defaultText="Voorbeeldteksten voor je telefooncentrale" / /><TextInstrument className="text-xl text-va-black/40 font-medium max-w-2xl"><VoiceglotText strokeWidth={1.5} 
              translationKey="scripts.intro" 
              defaultText="Geen inspiratie? Gebruik onze beproefde teksten als basis voor jouw eigen boodschap. Kopieer, plak en pas aan." 
            / /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid strokeWidth={1.5} columns={2}>
          {categories.map((cat, i) => (
            <BentoCard 
              key={i}
              span="md" 
              className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-10 flex flex-col justify-between"
            >
              <ContainerInstrument>
                <ContainerInstrument className="flex items-center gap-3 mb-6">
                  <ContainerInstrument className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText strokeWidth={1.5} size={20} / />
                  </ContainerInstrument>
                  <HeadingInstrument level={3} className="text-xl font-black tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey={`${cat.key}.title`} defaultText={cat.title} / /></HeadingInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="p-6 bg-va-off-white rounded-2xl border border-black/5 relative group">
                  <TextInstrument className="text-[15px] font-medium leading-relaxed text-va-black/70 italic">
                    &quot;<VoiceglotText strokeWidth={1.5} translationKey={`${cat.key}.content`} defaultText={cat.content} / />&quot;
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              
              <button className="mt-8 flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/30 hover:text-primary transition-all">
                <Copy strokeWidth={1.5} size={14} / />
                <VoiceglotText strokeWidth={1.5} translationKey="scripts.copy_button" defaultText="Kopieer Tekst" / />
              </button>
            </BentoCard>
          ))}
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
