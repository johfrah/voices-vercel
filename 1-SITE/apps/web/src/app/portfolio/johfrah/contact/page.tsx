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
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-8">
            <VoiceglotText  translationKey="portfolio.johfrah.contact.title" defaultText="Laten we praten" />
          </HeadingInstrument>
          <TextInstrument className="text-[15px] text-va-black/60 mb-12 font-light">
            <VoiceglotText  
              translationKey="portfolio.johfrah.contact.intro" 
              defaultText="Heb je een project waar je mijn stem, regie of host-skills voor wilt inzetten? Ik hoor het graag." 
            />
          </TextInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <ContainerInstrument className="space-y-8">
              <ContainerInstrument className="flex items-center gap-4 group">
                <ContainerInstrument className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail strokeWidth={1.5} size={20} />
                </ContainerInstrument>
                <ContainerInstrument>
                  <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.email.ce8ae9" defaultText="Email" /></TextInstrument>
                  <a href="mailto:johfrah@johfrah.be" className="text-[15px] font-light hover:text-primary transition-colors"><VoiceglotText  translationKey="auto.page.johfrah_johfrah_be.3cb465" defaultText="johfrah@johfrah.be" /></a>
                </ContainerInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="flex items-center gap-4 group">
                <ContainerInstrument className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Phone strokeWidth={1.5} size={20} />
                </ContainerInstrument>
                <ContainerInstrument>
                  <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.telefoon.fe260f" defaultText="Telefoon" /></TextInstrument>
                  <a href="tel:+3227931991" className="text-[15px] font-light hover:text-primary transition-colors">+32 (0)2 793 19 91</a>
                </ContainerInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="flex items-center gap-4 group">
                <ContainerInstrument className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <MapPin strokeWidth={1.5} size={20} />
                </ContainerInstrument>
                <ContainerInstrument>
                  <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="auto.page.locatie.e7a1cf" defaultText="Locatie" /></TextInstrument>
                  <TextInstrument className="text-[15px] font-light"><VoiceglotText  translationKey="auto.page.brussel___antwerpen_.292ffa" defaultText="Brussel / Antwerpen, Belgi" /></TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            {/* Direct Action */}
            <ContainerInstrument className="bg-va-black text-white p-10 rounded-[40px] space-y-6 shadow-2xl">
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tight"><VoiceglotText  translationKey="auto.page.direct_boeken_.f7adf2" defaultText="Direct Boeken?" /><TextInstrument className="text-white/60 text-[15px] leading-relaxed font-light"><VoiceglotText  translationKey="auto.page.wil_je_direct_een_st.61a56d" defaultText="Wil je direct een stemopname inplannen of een offerte aanvragen via de Voices Engine?" /></TextInstrument></HeadingInstrument>
              <ButtonInstrument as="a" href="https://voices.be/studio/book" className="va-btn-pro w-full text-center"><VoiceglotText  translationKey="auto.page.plan_een_sessie.f95b87" defaultText="Plan een sessie" /></ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
