import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Award, Heart, Mic, Star } from "lucide-react";
import { Metadata } from "next";
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Over Johfrah | De stem achter het verhaal",
  description: "Ontdek het verhaal van Johfrah Lefebvre: van Emmy Award winnend regisseur tot warme Vlaamse voice-over.",
};

export default function JohfrahAboutPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32">
      <SectionInstrument>
        <ContainerInstrument className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
            <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl sticky top-32">
              <Image 
                src="/assets/common/branding/johfrah/johfrah-about.jpg" 
                alt="Johfrah Lefebvre"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                  <Heart size={12} fill="currentColor" /> 
                  <VoiceglotText translationKey="portfolio.johfrah.about.badge" defaultText="Mijn Verhaal" />
                </div>
                
                <HeadingInstrument level={1} className="text-6xl font-black leading-[0.9] tracking-tighter">
                  Verhalen vertellen <br /> is mijn natuur.
                </HeadingInstrument>
                
                <TextInstrument className="text-xl text-va-black/70 leading-relaxed">
                  Of het nu is via een lens, een edit-suite of een microfoon: mijn passie ligt bij het overbrengen van emotie en informatie op een manier die mensen raakt.
                </TextInstrument>
              </div>

              <div className="prose prose-va max-w-none text-va-black/60 space-y-6">
                <p>
                  Mijn reis begon achter de schermen. Als televisieregisseur leerde ik hoe je een verhaal structureert en hoe je de juiste toon zet. Die ervaring bleek goud waard toen ik de stap zette naar de microfoon.
                </p>
                <p>
                  Vandaag combineer ik die twee werelden. Ik spreek niet alleen teksten in; ik regisseer ze terwijl ik ze uitspreek. Ik begrijp wat een editor nodig heeft, wat een regisseur zoekt en vooral: wat een luisteraar wil horen.
                </p>
                <p>
                  Met een International Emmy Award op de schouw en duizenden uren in de studio, breng ik een niveau van professionaliteit en rust mee naar elk project.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Award size={20} />
                    <TextInstrument className="font-black uppercase text-xs tracking-widest">Erkenning</TextInstrument>
                  </div>
                  <TextInstrument className="text-sm font-medium">
                    Winnaar van een International Emmy Award voor regie. Een bewijs van mijn oog voor detail en vertelkracht.
                  </TextInstrument>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Mic size={20} />
                    <TextInstrument className="font-black uppercase text-xs tracking-widest">Vakmanschap</TextInstrument>
                  </div>
                  <TextInstrument className="text-sm font-medium">
                    Duizenden producties voor nationale en internationale merken. Van intieme meditaties tot knallende commercials.
                  </TextInstrument>
                </div>
              </div>

              <div className="pt-12">
                <ButtonInstrument as="a" href="/contact" className="va-btn-pro">
                  Laten we samenwerken
                </ButtonInstrument>
              </div>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
