import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Award, Heart, Mic } from "lucide-react";
import { Metadata } from "next";
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Over Johfrah | De stem achter het verhaal",
  description: "Ontdek het verhaal van Johfrah Lefebvre: van regisseur tot warme Vlaamse voice-over.",
};

export default function JohfrahAboutPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32">
      <SectionInstrument>
        <ContainerInstrument className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
            <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden shadow-aura sticky top-32">
              <Image 
                src="/assets/common/branding/johfrah/johfrah-about.jpg" 
                alt="Johfrah Lefebvre"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[10px] font-light uppercase tracking-widest">
                  <Heart size={12} fill="currentColor" /> 
                  <VoiceglotText translationKey="portfolio.johfrah.about.badge" defaultText="Mijn Verhaal" />
                </div>
                
                <HeadingInstrument level={1} className="text-6xl font-light leading-[0.9] tracking-tighter">
                  Verhalen vertellen <br /> zit in mijn bloed.
                </HeadingInstrument>
                
                <TextInstrument className="text-xl text-va-black/70 leading-relaxed font-light">
                  Of het nu door een lens is of voor een microfoon: ik zoek altijd naar de emotie die mensen echt raakt.
                </TextInstrument>
              </div>

              <div className="prose prose-va max-w-none text-va-black/60 space-y-6 font-light">
                <p>
                  Mijn weg begon achter de schermen. Als regisseur leerde ik hoe je een verhaal bouwt en de juiste toon zet. Die blik neem ik nu mee naar de studio.
                </p>
                <p>
                  Ik spreek niet alleen teksten in; ik begrijp wat een regisseur zoekt en wat een editor nodig heeft. Ik voel de cadans van een montage en weet precies waar de klemtoon moet liggen om de boodschap te laten landen.
                </p>
                <p>
                  Met jaren ervaring en duizenden uren in de studio breng ik rust en professionaliteit naar elk project. Geen gedoe, gewoon goed werk.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Award size={20} strokeWidth={1.5} />
                    <TextInstrument className="font-light uppercase text-xs tracking-widest">Erkenning</TextInstrument>
                  </div>
                  <TextInstrument className="text-sm font-light">
                    Jarenlange ervaring als regisseur. Ik weet hoe je een verhaal vertelt dat blijft hangen.
                  </TextInstrument>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Mic size={20} strokeWidth={1.5} />
                    <TextInstrument className="font-light uppercase text-xs tracking-widest">Vakmanschap</TextInstrument>
                  </div>
                  <TextInstrument className="text-sm font-light">
                    Duizenden producties voor nationale en internationale merken. Van intieme meditaties tot knallende commercials.
                  </TextInstrument>
                </div>
              </div>

              <div className="pt-12">
                <ButtonInstrument as="a" href="/contact" className="va-btn-pro !rounded-[10px] !font-light !tracking-widest !uppercase">
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
