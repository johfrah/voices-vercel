import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { LiquidBackground } from '@/components/ui/LiquidBackground';
import { PricingCalculator } from '@/components/ui/PricingCalculator';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarieven | Voices',
  description: 'Bereken direct de prijs voor jouw voice-over project.',
};

export default function TarievenPage() {
  return (
    <PageWrapperInstrument className="bg-va-off-white">
      <LiquidBackground />
      
      <ContainerInstrument className="py-48 relative z-10">
        <header className="mb-32 max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <TextInstrument className="text-[15px] font-medium tracking-[0.4em] text-primary/60 mb-8 block "><VoiceglotText translationKey="pricing.pretitle" defaultText="Transparante prijzen" /></TextInstrument>
          <HeadingInstrument level={1} className="text-[8vw] lg:text-[120px] font-light tracking-tighter mb-12 leading-[0.85] text-va-black"><VoiceglotText translationKey="pricing.title" defaultText="Tarieven" /></HeadingInstrument>
          <ContainerInstrument className="w-32 h-1 bg-black/5 rounded-full" />
        </header>

        <SectionInstrument className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <PricingCalculator />
        </SectionInstrument>

        <footer className="mt-48 max-w-3xl">
          <ContainerInstrument className="prose prose-xl text-va-black/40 font-medium leading-relaxed tracking-tight">
            <p>
              <VoiceglotText 
                translationKey="pricing.footer_text" 
                defaultText="Onze tarieven zijn inclusief studiosessie, nabewerking en retakes op tone-of-voice. Voor tekstwijzigingen achteraf rekenen we een klein supplement. Geen verrassingen achteraf, gewoon de beste kwaliteit." 
              />
            </p>
          </ContainerInstrument>
        </footer>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
