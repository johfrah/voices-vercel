import { 
  PageWrapperInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  SectionInstrument,
  TextInstrument 
} from '@/components/ui/LayoutInstruments';
import { LiquidBackground } from '@/components/ui/LiquidBackground';
import { StudioFeedbackForm } from '@/components/studio/feedback/StudioFeedbackForm';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

export default function StudioFeedbackPage() {
  return (
    <PageWrapperInstrument className="min-h-screen pt-32 pb-40 bg-va-off-white">
      <LiquidBackground />
      
      <ContainerInstrument className="relative z-10">
        <SectionInstrument className="mb-20 text-center">
          <ContainerInstrument className="inline-block bg-va-black text-white text-[15px] font-light px-4 py-1 rounded-full mb-6 tracking-[0.2em] ">
            Voices Studio
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-none mb-8">
            Jouw <TextInstrument as="span" className="text-primary font-light">Inzichten.</TextInstrument>
          </HeadingInstrument>
          <p className="text-va-black/40 text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Bedankt voor je deelname aan onze workshop. Jouw feedback is essentieel voor het bewaken van onze Masterclass-kwaliteit.
          </p>
        </SectionInstrument>

        <StudioFeedbackForm />
      </ContainerInstrument>

      {/*  LLM CONTEXT */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Studio Feedback",
            "_llm_context": {
              "persona": "Gids",
              "journey": "studio",
              "intent": "provide_feedback",
              "visual_dna": ["Liquid DNA", "Split-Screen Rhythm"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
