import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Mail, Phone, MapPin } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Johfrah",
  description: "Neem direct contact op met Johfrah Lefebvre voor voice-over, regie of host opdrachten.",
};

export default function JohfrahContactPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32">
      <SectionInstrument>
        <ContainerInstrument className="max-w-4xl mx-auto px-6">
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter mb-8">
            <VoiceglotText translationKey="portfolio.johfrah.contact.title" defaultText="Laten we praten" />
          </HeadingInstrument>
          
          <TextInstrument className="text-xl text-va-black/60 mb-12 font-light">
            <VoiceglotText 
              translationKey="portfolio.johfrah.contact.intro" 
              defaultText="Heb je een project waar je mijn stem, regie of host-skills voor wilt inzetten? Ik hoor het graag." 
            />
          </TextInstrument>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail strokeWidth={1.5} size={20} />
                </div>
                <div>
                  <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/30">Email</TextInstrument>
                  <a href="mailto:johfrah@johfrah.be" className="text-lg font-bold hover:text-primary transition-colors">johfrah@johfrah.be</a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Phone strokeWidth={1.5} size={20} />
                </div>
                <div>
                  <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/30">Telefoon</TextInstrument>
                  <a href="tel:+3227931991" className="text-lg font-bold hover:text-primary transition-colors">+32 (0)2 793 19 91</a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <MapPin size={20} />
                </div>
                <div>
                  <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/30">Locatie</TextInstrument>
                  <TextInstrument className="text-lg font-bold">Brussel / Antwerpen, België</TextInstrument>
                </div>
              </div>
            </div>

            {/* Direct Action */}
            <div className="bg-va-black text-white p-10 rounded-[40px] space-y-6 shadow-2xl">
              <HeadingInstrument level={3} className="text-2xl font-black tracking-tight">
                Direct Boeken?
              </HeadingInstrument>
              <TextInstrument className="text-white/60 text-sm leading-relaxed font-light">
                Wil je direct een stemopname inplannen of een offerte aanvragen via de Voices Engine?
              </TextInstrument>
              <ButtonInstrument as="a" href="https://voices.be/studio/book" className="va-btn-pro w-full text-center">
                Plan een sessie
              </ButtonInstrument>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
