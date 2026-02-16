import { 
  PageWrapperInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  SectionInstrument,
  TextInstrument
} from '@/components/ui/LayoutInstruments';
import { LiquidBackground } from '@/components/ui/LiquidBackground';
import { AccordionInstrument } from '@/components/ui/AccordionInstrument';
import { WorkshopQuiz } from '@/components/studio/WorkshopQuiz';
import { VoicyFaqButton } from '@/components/studio/feedback/VoicyFaqButton';
import { getFaqs } from '@/lib/api-server';

export const dynamic = 'force-dynamic';

export default async function StudioFaqPage() {
  // 🎙️ Haal de 5 gedestilleerde workshop vragen op via de server API
  const workshopFaqs = await getFaqs('Workshops', 5);

  const accordionItems = (workshopFaqs || []).map(f => ({
    id: f?.id?.toString() || Math.random().toString(),
    title: f?.questionNl || '',
    content: f?.answerNl || ''
  }));

  return (
    <PageWrapperInstrument className="min-h-screen pt-48 pb-40 bg-va-off-white">
      <LiquidBackground />
      
      <ContainerInstrument className="relative z-10 max-w-6xl mx-auto px-6">
        <SectionInstrument className="mb-24 text-center">
          <ContainerInstrument className="inline-block bg-va-black text-white text-[15px] font-light px-6 py-2 rounded-full mb-8 tracking-[0.2em] shadow-aura">
            VOICES STUDIO
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-tight mb-8">
            Hulp & <TextInstrument className="text-primary font-light">Inzichten.</TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed opacity-80">
            Ontdek welk traject bij je past via de quiz of bekijk de meest gestelde vragen over onze workshops.
          </TextInstrument>
        </SectionInstrument>

        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* 🎯 LINKS: VIDEO QUIZ (5 Kolommen) */}
          <ContainerInstrument className="lg:col-span-5 lg:sticky lg:top-40 z-20 w-full min-h-[600px] flex flex-col items-center">
            <WorkshopQuiz   />
          </ContainerInstrument>

          {/* 🎙️ RECHTS: FAQ VRAGEN (7 Kolommen) */}
          <ContainerInstrument className="lg:col-span-7 space-y-12">
            <HeadingInstrument level={2} className="text-4xl font-light tracking-tight mb-8 border-b border-black/10 pb-6 text-va-black">
              Veelgestelde vragen
            </HeadingInstrument>
            
            <AccordionInstrument items={accordionItems} />
            
            {/* 🏁 MINI CTA */}
            <ContainerInstrument className="pt-12 p-10 bg-white/40 backdrop-blur-xl rounded-[32px] border border-black/5 shadow-aura">
              <TextInstrument className="text-va-black text-lg font-light tracking-wide mb-6 opacity-60">
                Staat je vraag er niet tussen? Onze AI-gids Voicy kent alle details van de workshops.
              </TextInstrument>
              <VoicyFaqButton />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* 🧠 LLM CONTEXT */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": (workshopFaqs || []).map(f => ({
              "@type": "Question",
              "name": f?.questionNl || '',
              "acceptedAnswer": {
                "@type": "Answer",
                "text": f?.answerNl || ''
              }
            })),
            "_llm_context": {
              "persona": "Gids",
              "journey": "studio",
              "intent": "workshop_discovery",
              "visual_dna": ["Split Layout", "Video Quiz", "Minimalist Accordion", "High Readability"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
