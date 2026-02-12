import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Award, Camera, Mic, Tv } from "lucide-react";
import { Metadata } from "next";
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Host & Reporter | Johfrah",
  description: "Internationaal bekroonde regisseur en reporter. Johfrah brengt verhalen tot leven als host en presentator.",
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest">
                <Tv size={12} /> 
                <VoiceglotText translationKey="portfolio.johfrah.host.badge" defaultText="Host & Reporter" />
              </div>
              
              <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                Authentieke <br /> Presentatie.
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-va-black/60 leading-relaxed">
                Als internationaal Emmy Award winnend regisseur begrijp ik hoe een verhaal verteld moet worden. Niet als een &apos;pratend hoofd&apos;, maar als een menselijke verbinder.
              </TextInstrument>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-black/5">
                  <Award className="text-primary mb-4" size={24} />
                  <TextInstrument className="font-black uppercase text-[10px] tracking-widest mb-1">Ervaring</TextInstrument>
                  <TextInstrument className="text-sm font-bold">Emmy Award Winnaar</TextInstrument>
                </div>
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-black/5">
                  <Camera className="text-primary mb-4" size={24} />
                  <TextInstrument className="font-black uppercase text-[10px] tracking-widest mb-1">Expertise</TextInstrument>
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
          <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tighter mb-12 text-center">
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
            <HeadingInstrument level={2} className="text-5xl font-black uppercase tracking-tighter">
              Klaar voor de camera?
            </HeadingInstrument>
            <TextInstrument className="text-xl text-white/80 max-w-2xl mx-auto">
              Laten we samen kijken hoe we jouw merk of event menselijk en boeiend kunnen presenteren.
            </TextInstrument>
            <ButtonInstrument as="a" href="/contact" className="va-btn-pro !bg-white !text-primary">
              Boek Johfrah als Host
            </ButtonInstrument>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
