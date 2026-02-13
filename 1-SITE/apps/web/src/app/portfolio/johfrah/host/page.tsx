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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-600 text-[15px] font-black tracking-widest">
                <Tv size={12} /> 
                <VoiceglotText translationKey="portfolio.johfrah.host.badge" defaultText="Host & Reporter" />
              </div>
              
              <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                Echt en <br /> dichtbij.
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-va-black/60 leading-relaxed font-light">
                Als regisseur weet ik hoe je een verhaal vertelt. Geen ingestudeerde praatjes, maar een menselijke verbinding die echt binnenkomt.
              </TextInstrument>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-black/5">
                  <Award className="text-primary mb-4" size={24} />
                  <TextInstrument className="font-black text-[15px] tracking-widest mb-1">Ervaring</TextInstrument>
                  <TextInstrument className="text-sm font-bold">Regisseur</TextInstrument>
                </div>
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-black/5">
                  <Camera className="text-primary mb-4" size={24} />
                  <TextInstrument className="font-black text-[15px] tracking-widest mb-1">Expertise</TextInstrument>
                  <TextInstrument className="text-sm font-bold">Regie & Presentatie</TextInstrument>
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl">
              <Image 
                src="/assets/common/branding/johfrah/johfrah-host.jpg" 
                alt="Johfrah as Host"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Video Showcase */}
          <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter mb-12 text-center">
            In Actie
          </HeadingInstrument>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {videos.map((video) => (
              <div key={video.id} className="aspect-video bg-va-black rounded-[32px] overflow-hidden shadow-xl">
                <iframe
                  src={`https://www.videoask.com/${video.id}`}
                  className="w-full h-full border-0"
                  allow="camera; microphone; autoplay; encrypted-media;"
                  title={video.title}
                />
              </div>
            ))}
          </div>

          <div className="bg-primary text-white p-16 rounded-[60px] text-center space-y-8 mb-24">
            <HeadingInstrument level={2} className="text-5xl font-black tracking-tighter">
              Samen iets moois maken?
            </HeadingInstrument>
            <TextInstrument className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              Laten we kijken hoe we jouw merk of event een menselijk gezicht kunnen geven.
            </TextInstrument>
            <ButtonInstrument as="a" href="/contact" className="va-btn-pro !bg-white !text-primary">
              Laten we praten
            </ButtonInstrument>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
