import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Award, Camera, Tv } from "lucide-react";
import { Metadata } from "next";
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Host & Reporter | Johfrah",
  description: "Regisseur en reporter. Johfrah brengt verhalen tot leven als host en presentator.",
};

export default function JohfrahHostPage() {
  const videos = [
    { id: 'fma3fyhhz', title: 'Unizo Reporter' },
    { id: 'frraoowha', title: 'Zorg Leuven' }
  ];

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32">
      <SectionInstrument>
        <ContainerInstrument className="max-w-7xl mx-auto px-6">
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <ContainerInstrument className="space-y-8">
              <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-600 text-[15px] font-black tracking-widest">
                <Tv size={12} /> 
                <VoiceglotText translationKey="portfolio.johfrah.host.badge" defaultText="Host & Reporter" />
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                Echt en <br /><VoiceglotText translationKey="auto.page.dichtbij_.ce8f48" defaultText="dichtbij." /></HeadingInstrument>
              
              <TextInstrument className="text-xl text-va-black/60 leading-relaxed font-light"><VoiceglotText translationKey="auto.page.als_regisseur_weet_i.b7dd34" defaultText="Als regisseur weet ik hoe je een verhaal vertelt. Geen ingestudeerde praatjes, maar een menselijke verbinding die echt binnenkomt." /></TextInstrument>

              <ContainerInstrument className="grid grid-cols-2 gap-6">
                <ContainerInstrument className="p-6 bg-white rounded-3xl shadow-sm border border-black/5">
                  <Award className="text-primary mb-4" size={24} />
                  <TextInstrument className="font-black text-[15px] tracking-widest mb-1"><VoiceglotText translationKey="auto.page.ervaring.6cec8e" defaultText="Ervaring" /></TextInstrument>
                  <TextInstrument className="text-[15px] font-bold"><VoiceglotText translationKey="auto.page.regisseur.eccc5e" defaultText="Regisseur" /></TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="p-6 bg-white rounded-3xl shadow-sm border border-black/5">
                  <Camera className="text-primary mb-4" size={24} />
                  <TextInstrument className="font-black text-[15px] tracking-widest mb-1"><VoiceglotText translationKey="auto.page.expertise.57b0ea" defaultText="Expertise" /></TextInstrument>
                  <TextInstrument className="text-[15px] font-bold"><VoiceglotText translationKey="auto.page.regie___presentatie.687c0d" defaultText="Regie & Presentatie" /></TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl">
              <Image 
                src="/assets/common/branding/johfrah/johfrah-host.jpg" 
                alt="Johfrah as Host"
                fill
                className="object-cover"
              />
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Video Showcase */}
          <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter mb-12 text-center"><VoiceglotText translationKey="auto.page.in_actie.b5aa14" defaultText="In Actie" /></HeadingInstrument>
          
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {videos.map((video) => (
              <ContainerInstrument key={video.id} className="aspect-video bg-va-black rounded-[32px] overflow-hidden shadow-xl">
                <iframe
                  src={`https://www.videoask.com/${video.id}`}
                  className="w-full h-full border-0"
                  allow="camera; microphone; autoplay; encrypted-media;"
                  title={video.title}
                />
              </ContainerInstrument>
            ))}
          </ContainerInstrument>

          <ContainerInstrument className="bg-primary text-white p-16 rounded-[60px] text-center space-y-8 mb-24">
            <HeadingInstrument level={2} className="text-5xl font-black tracking-tighter"><VoiceglotText translationKey="auto.page.samen_iets_moois_mak.4d02ac" defaultText="Samen iets moois maken?" /><TextInstrument className="text-xl text-white/80 max-w-2xl mx-auto font-light"><VoiceglotText translationKey="auto.page.laten_we_kijken_hoe_.950cbb" defaultText="Laten we kijken hoe we jouw merk of event een menselijk gezicht kunnen geven." /></TextInstrument></HeadingInstrument>
            <ButtonInstrument as="a" href="/contact" className="va-btn-pro !bg-white !text-primary"><VoiceglotText translationKey="auto.page.laten_we_praten.58853f" defaultText="Laten we praten" /></ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
