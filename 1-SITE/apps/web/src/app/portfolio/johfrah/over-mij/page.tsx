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
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
            <ContainerInstrument className="relative aspect-[3/4] rounded-[20px] overflow-hidden shadow-aura sticky top-32">
              <Image  
                src="/assets/common/branding/johfrah/johfrah-about.jpg" 
                alt="Johfrah Lefebvre"
                fill
                className="object-cover"
              />
            </ContainerInstrument>

            <ContainerInstrument className="space-y-12">
              <ContainerInstrument className="space-y-6">
                <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest">
                  <Heart strokeWidth={1.5} size={12} fill="currentColor" /> 
                  <VoiceglotText  translationKey="portfolio.johfrah.about.badge" defaultText="Mijn Verhaal" />
                </ContainerInstrument>
                
                <HeadingInstrument level={1} className="text-6xl font-light leading-[0.9] tracking-tighter">
                  Verhalen vertellen <br /><VoiceglotText  translationKey="auto.page.zit_in_mijn_bloed_.172e20" defaultText="zit in mijn bloed." /></HeadingInstrument>
                
                <TextInstrument className="text-xl text-va-black/70 leading-relaxed font-light"><VoiceglotText  translationKey="auto.page.of_het_nu_door_een_l.892369" defaultText="Of het nu door een lens is of voor een microfoon: ik zoek altijd naar de emotie die mensen echt raakt." /></TextInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="prose prose-va max-w-none text-va-black/60 space-y-6 font-light">
                <p><VoiceglotText  translationKey="auto.page.mijn_weg_begon_achte.2a249d" defaultText="Mijn weg begon achter de schermen. Als regisseur leerde ik hoe je een verhaal bouwt en de juiste toon zet. Die blik neem ik nu mee naar de studio." /></p>
                <p><VoiceglotText  translationKey="auto.page.ik_spreek_niet_allee.84c1d0" defaultText="Ik spreek niet alleen teksten in; ik begrijp wat een regisseur zoekt en wat een editor nodig heeft. Ik voel de cadans van een montage en weet precies waar de klemtoon moet liggen om de boodschap te laten landen." /></p>
                <p><VoiceglotText  translationKey="auto.page.met_jaren_ervaring_e.3f9e97" defaultText="Met jaren ervaring en duizenden uren in de studio breng ik rust en professionaliteit naar elk project. Geen gedoe, gewoon goed werk." /></p>
              </ContainerInstrument>

              <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <ContainerInstrument className="space-y-4">
                  <ContainerInstrument className="flex items-center gap-3 text-primary">
                    <Award strokeWidth={1.5} size={20} />
                    <TextInstrument className="font-light text-[15px] tracking-widest"><VoiceglotText  translationKey="auto.page.erkenning.428691" defaultText="Erkenning" /></TextInstrument>
                  </ContainerInstrument>
                  <TextInstrument className="text-[15px] font-light"><VoiceglotText  translationKey="auto.page.jarenlange_ervaring_.4f17b9" defaultText="Jarenlange ervaring als regisseur. Ik weet hoe je een verhaal vertelt dat blijft hangen." /></TextInstrument>
                </ContainerInstrument>

                <ContainerInstrument className="space-y-4">
                  <ContainerInstrument className="flex items-center gap-3 text-primary">
                    <Mic strokeWidth={1.5} size={20} />
                    <TextInstrument className="font-light text-[15px] tracking-widest"><VoiceglotText  translationKey="auto.page.vakmanschap.301957" defaultText="Vakmanschap" /></TextInstrument>
                  </ContainerInstrument>
                  <TextInstrument className="text-[15px] font-light"><VoiceglotText  translationKey="auto.page.duizenden_producties.93c3b5" defaultText="Duizenden producties voor nationale en internationale merken. Van intieme meditaties tot knallende commercials." /></TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="pt-12">
                <ButtonInstrument as="a" href="/contact" className="va-btn-pro !rounded-[10px] !font-light !tracking-widest"><VoiceglotText  translationKey="auto.page.laten_we_samenwerken.38a3b0" defaultText="Laten we samenwerken" /></ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
