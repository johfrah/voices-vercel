import { WorkshopContent } from "@/components/studio/WorkshopContent";
import { AudioRecorderInstrument } from "@/components/ui/AudioRecorderInstrument";
import { AccordionInstrument } from "@/components/ui/AccordionInstrument";
import { BentoCard } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { WorkshopProgram } from "@/components/ui/Studio/WorkshopProgram";
import { StudioVideoPlayer } from "@/components/ui/StudioVideoPlayer";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { getFaqs } from "@/lib/api-server";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { cleanText } from "@/lib/utils";
import { ArrowRight, Play } from 'lucide-react';
import { Metadata } from 'next';
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 *  STUDIO DETAIL PAGE (VOICES 2026)
 * 
 * Gebaseerd op de Studio-layout:
 * - Hero met Video & Directe CTA
 * - Uitleg & Dagindeling
 * - FAQ & Inschrijftool
 */

const WORKSHOP_SUBTITLES: Record<string, { start: number; end: number; text: string }[]> = {
  'perfect-spreken': [
    { start: 0, end: 2.64, text: "Wil jij perfect leren spreken?" },
    { start: 2.76, end: 7.56, text: "Wil jij een hele warme stem, een perfecte spraak, verstaanbaarheid..." },
    { start: 7.68, end: 10.88, text: "en een gerichte intonatie? Dat kan." },
    { start: 11.0, end: 15.72, text: "Die drie componenten, articulatie, stem, intonatie, dat hoort bij elkaar." },
    { start: 15.84, end: 18.68, text: "Je kan zeker leren om een professionele spreker te worden." },
    { start: 18.80, end: 22.68, text: "Dat kan in één dag. Veel oefeningen wel, maar het kan zeker." },
    { start: 22.80, end: 24.28, text: "Welkom." }
  ],
  'voice-overs-voor-beginners': [
    { start: 0.0, end: 1.68, text: "Wat is het proximity effect?" },
    { start: 1.68, end: 2.68, text: "What's implosives?" },
    { start: 2.68, end: 7.0, text: "Waarom moet je je ogen openen, lachen en met je handen bewegen als je inspreekt?" },
    { start: 7.0, end: 9.92, text: "Ben je benieuwd wat we in de workshop VoiceOver allemaal gaan leren?" },
    { start: 9.92, end: 12.76, text: "Wel, het wordt een zeer interactieve en toffe workshop." },
    { start: 12.76, end: 14.28, text: "En verwacht je aan veel actie?" },
    { start: 14.28, end: 18.04, text: "We zijn maar een kleine groep, dus we gaan er meteen invliegen met een scriptanalyse," },
    { start: 18.04, end: 21.76, text: "een goede stemopwarmingsoefening en dan maximale microfoontijd." },
    { start: 21.76, end: 25.72, text: "We gaan iedereen zo veel mogelijk meteen voor de leeuwen gooien, voor de microfoon." },
    { start: 25.72, end: 26.72, text: "Met u laten doen." },
    { start: 26.72, end: 28.36, text: "In de tijd dat hij je doet..." },
    { start: 28.36, end: 29.36, text: "Ja, sorry." },
    { start: 29.72, end: 31.4, text: "We zijn al eens in het verder." },
    { start: 31.4, end: 34.52, text: "Geloof me, het vliegt voorbij, maar daarna doen we het nog een paar keer." },
    { start: 34.52, end: 35.88, text: "En je wilt dat we het nog eens doen, h?" },
    { start: 35.88, end: 36.88, text: "Ja, mogen we ook nog eens?" },
    { start: 36.88, end: 40.44, text: "En dan gaan we samen luisteren, feedback geven, verbeteren en samen zorgen we ervoor" },
    { start: 40.44, end: 44.32, text: "dat je de beste technieken hebt om prachtige VoiceOvers in te spreken." },
    { start: 44.32, end: 45.52, text: "Ik zie je graag op de workshop." }
  ],
  'opname-en-nabewerking': [
    { start: 0.0, end: 5.28, text: "Wil jij leren hoe je goede geluidsopnames maakt, doe dan mee aan deze workshop, want" },
    { start: 5.28, end: 10.36, text: "ik toon je al mijn shortcuts en de beste manieren om je audio op te nemen en professioneel te" },
    { start: 10.36, end: 11.36, text: "bewerken." },
    { start: 11.36, end: 11.86, text: "Tot dan!" }
  ],
  'audiodescriptie': [
    { start: 0.0, end: 2.44, text: "Goedemiddag, mijn naam is Guido Godon." },
    { start: 2.52, end: 5.04, text: "Ik heb ongeveer 40 jaar voor de VRT gewerkt." },
    { start: 5.12, end: 9.2, text: "Vooral sonorisatie en de audiodescriptie in het bijzonder." },
    { start: 9.28, end: 13.76, text: "Audiodescriptie heeft, om te beginnen, een maatschappelijke meerwaarde." },
    { start: 13.84, end: 15.76, text: "Niet alleen voor blinden of slechtszienden," },
    { start: 15.84, end: 18.84, text: "maar je mag het bekijken als een nieuw product." },
    { start: 18.92, end: 20.92, text: "Een verhaal, een luisterspel." },
    { start: 21.0, end: 24.2, text: "We gaan nu toch een beetje beginnen met spanning op te wauwen." },
    { start: 24.28, end: 26.36, text: "Er mag een beetje meer peper bij nu." },
    { start: 26.44, end: 29.0, text: "In de straat van de brand hangt een dichte rook." },
    { start: 29.04, end: 33.08, text: "Politiemensen rennen door elkaar en de brandweerlui springen uit hun wagens." },
    { start: 33.16, end: 37.88, text: "Ik zal dat nog een beetje mystieker maken." },
    { start: 37.96, end: 39.56, text: "Er hangt een dichte rook." },
    { start: 42.08, end: 44.12, text: "Dat is toch een beetje angstaanjagend." },
    { start: 44.2, end: 47.32, text: "Voor ons als kijker, die brandweerlui, dat is dagelijkse kost." },
    { start: 47.4, end: 49.88, text: "Maar er hangt een dichte rook. Jij bent de verteller." },
    { start: 49.96, end: 53.4, text: "En als dat helpt om je armen te gebruiken, dat helpt ook." },
    { start: 53.48, end: 55.88, text: "Ik hoor dat. Dat werkt absoluut." },
    { start: 55.96, end: 58.0, text: "Ik heb specifiek voor audiodescriptie gekozen," },
    { start: 58.08, end: 62.68, text: "omdat dat een niet zo wijd gekende discipline is." },
    { start: 62.76, end: 66.08, text: "We hebben verschillende programma's mogen zelf inspreken." },
    { start: 66.16, end: 69.24, text: "Dat ging van Onder Vuur, wat iets anders is als Chantal," },
    { start: 69.32, end: 71.16, text: "als Dertigers en ook een jeugdreeks." },
    { start: 71.24, end: 73.08, text: "Die variatie was ook wel heel leuk." },
    { start: 73.16, end: 75.08, text: "Je hebt dat in het script. Dat is één ding." },
    { start: 75.16, end: 78.36, text: "Dat script moet goed in elkaar zitten, dat moet goed geschreven zijn," },
    { start: 78.44, end: 81.24, text: "om het daarna nog ook goed te laten bekken." },
    { start: 81.32, end: 84.24, text: "Gio trekt de vrouw Cordata haar huis uit." },
    { start: 84.32, end: 87.16, text: "Dat is niet spannend. Je lacht er een beetje mee." },
    { start: 87.24, end: 90.6, text: "Het voordeel is om aan de slag te gaan met mensen die in de industrie werken." },
    { start: 90.68, end: 93.32, text: "Dat was iets waar je bijna geen toegang tot hebt." },
    { start: 93.4, end: 95.6, text: "Het is een cadeau om een workshop te krijgen" },
    { start: 95.68, end: 97.56, text: "van iemand die daar zoveel ervaring in heeft." },
    { start: 97.64, end: 99.24, text: "Zeg, Giovra." },
    { start: 99.32, end: 101.56, text: "Met Guido Godon hadden we wel een topper in huis." },
    { start: 101.64, end: 106.48, text: "Dat is ongelooflijk. Als er één man is die AD ademt..." },
    { start: 106.56, end: 107.56, text: "Dan is het Guido." },
    { start: 107.64, end: 112.16, text: "Ik vond het heel fijn om vandaag met deze mensen te kunnen samenwerken." },
    { start: 112.24, end: 115.76, text: "Aflevering per aflevering hebben we geleerd om een verhaal te vertellen." },
    { start: 115.84, end: 117.16, text: "Dikke merci, zou ik zeggen." },
    { start: 117.24, end: 118.76, text: "Graag gedaan. Ik heb ervan genoten." },
    { start: 118.84, end: 119.84, text: "Dan is het goed." }
  ],
  'verwen-je-stem': [
    { start: 0.0, end: 2.0, text: "Waaaah!" },
    { start: 2.0, end: 5.0, text: "Dat is een oefening. Een oefening voor je stem." },
    { start: 5.0, end: 10.0, text: "In de workshop Verwen je stem, gaan we dus heel goed voor je stem zorgen." },
    { start: 10.0, end: 12.0, text: "Meer nog, we gaan ze verwennen." },
    { start: 12.0, end: 14.0, text: "Want die stem moet blijven functioneren." },
    { start: 14.0, end: 16.0, text: "Geen stem, geen werk." },
    { start: 16.0, end: 17.0, text: "Dat is niet ok." },
    { start: 17.0, end: 19.0, text: "We gaan ze verwennen en we gaan ze trainen, die stem." },
    { start: 19.0, end: 21.0, text: "Door die oefening die ik net heb voorgedaan." },
    { start: 21.0, end: 24.0, text: "Want die spieren moeten goed opgewarmd worden." },
    { start: 24.0, end: 26.0, text: "Die moeten nog sterker gemaakt worden." },
    { start: 26.0, end: 27.0, text: "Dat gaan we allemaal doen." },
    { start: 27.0, end: 31.0, text: "Nog veel meer oefeningen in de workshop Verwen je stem." },
    { start: 31.0, end: 32.0, text: "Ik verwacht jullie allemaal." },
    { start: 32.0, end: 33.0, text: "Tot gauw!" }
  ],
  'perfectie-van-intonatie': [
    { start: 0.0, end: 2.76, text: "De workshop intonatie, dat is een hele fijne." },
    { start: 2.92, end: 5.8, text: "Want als je goed oefent en alles goed onder controle krijgt," },
    { start: 5.96, end: 7.6, text: "dan kan je meer impact hebben." },
    { start: 7.76, end: 11.24, text: "Wat je zegt wordt dan belangrijker, duidelijker, whatever." },
    { start: 11.4, end: 12.64, text: "Ik geef een voorbeeld." },
    { start: 12.8, end: 14.56, text: "Dat is een mooie landweg." },
    { start: 14.72, end: 17.28, text: "Meestal gaan de mensen omhoog, en dat is niet fout." },
    { start: 17.44, end: 21.76, text: "Maar wat gebeurt er als je zegt dat is een hele mooie landweg?" },
    { start: 21.92, end: 23.2, text: "Oh, dan geloof ik je meer." },
    { start: 23.36, end: 24.76, text: "We gaan dus drie dingen leren." },
    { start: 24.92, end: 28.04, text: "Werken met toonhoofden, luidheid en tempo." },
    { start: 28.2, end: 29.2, text: "Komt wel goed." }
  ],
  'documentaires-inspreken': [
    { start: 0.0, end: 5.32, text: "Hallo, ik ben Annemie en ik ben documentaire-stem voor VRT1 en VRT Canvas." },
    { start: 5.44, end: 8.0, text: "In de workshop Documentaire leer je dat." },
    { start: 8.12, end: 11.96, text: "We gaan op beeld inlezen, we gaan teksten lezen alsof we ze zelf vertellen." },
    { start: 12.08, end: 13.8, text: "Ik bedoel, alsof we ze zelf geschreven hebben." },
    { start: 13.92, end: 20.24, text: "En wat daarbij belangrijk is, zijn empathie, energie en echtheid, geloofwaardigheid." },
    { start: 20.36, end: 24.0, text: "Want ik moet je natuurlijk als kijker kunnen volgen in wat je aan het vertellen bent." },
    { start: 24.12, end: 26.08, text: "Maar dat leer je. Je bereidt je uiteraard wel voor." },
    { start: 26.2, end: 29.08, text: "Je krijgt beeld, je krijgt tekst om je voor te bereiden." },
    { start: 29.24, end: 30.84, text: "Maar dan gaan we het samen gewoon proberen." },
    { start: 30.96, end: 35.68, text: "Je gaat jezelf ontdekken op beeld. Je gaat zien hoe jij klinkt op dat beeld." },
    { start: 35.8, end: 36.88, text: "En we gaan het samen doen." },
    { start: 37.0, end: 40.4, text: "Dus spreekt het jou aan om dat te leren, om door mij geregisseerd te worden..." },
    { start: 40.52, end: 42.2, text: "...en misschien zelfs een beetje genterviewd..." },
    { start: 42.32, end: 47.2, text: "...om te komen tot jouw echte jij en jouw echte stem en jouw echte vertelstijl?" },
    { start: 47.32, end: 48.76, text: "Schrijf je in." },
    { start: 48.88, end: 50.8, text: "Ik kijk ernaar uit, toch?" }
  ],
  'maak-je-eigen-radioshow': [
    { start: 0.0, end: 5.16, text: "Hallo, ik ben Corneel De Clercq en ik presenteer al ongeveer 10 jaar programma's bij Radio 1." },
    { start: 5.16, end: 10.24, text: "En in de workshop Radio maken probeer ik je te leren hoe je een radioshow maakt." },
    { start: 10.24, end: 15.64, text: "Van een voorbereiding tot een goed interview afnemen, tot echt plaatjes aan elkaar praten." },
    { start: 15.64, end: 19.8, text: "En aan het einde van deze workshop ga je naar huis met een afgewerkte radioshow." },
    { start: 19.8, end: 25.52, text: "Dus als je wil meedoen aan deze workshop, schrijf je dan nu in via voices.be slash studio." },
    { start: 25.52, end: 26.72, text: "Tot dan!" }
  ],
  'perfectie-van-articulatie': [
    { start: 0.0, end: 3.0, text: "Je bent natuurlijk benieuwd naar de workshop articulatie." },
    { start: 3.0, end: 5.0, text: "Wat gaan we daarin doen?" },
    { start: 5.0, end: 6.0, text: "Heel eenvoudig." },
    { start: 6.0, end: 9.0, text: "Bewegen, bewegen en nog eens bewegen." },
    { start: 9.0, end: 10.0, text: "Ik ben je fitnesscoach." },
    { start: 10.0, end: 13.0, text: "Fitness voor je mond, je lippen, je tong, je kaak." },
    { start: 13.0, end: 15.0, text: "Dat moet allemaal bewegen." },
    { start: 15.0, end: 16.0, text: "Open daarmee." },
    { start: 16.0, end: 18.0, text: "Niet mompelen zoals veel mensen dat doen." },
    { start: 18.0, end: 20.0, text: "En we gaan dat ook correct doen, natuurlijk." },
    { start: 20.0, end: 22.0, text: "Dus hou je vast aan de takken van de mast." },
    { start: 22.0, end: 24.0, text: "Want we gaan oefenen en bewegen." },
    { start: 24.0, end: 26.0, text: "Doe maar sportieve kledij aan." },
    { start: 26.0, end: 27.0, text: "Echt waar." }
  ],
  'audioboeken-inspreken': [
    { start: 0.0, end: 3.8, text: "In zo'n workshop audioboeken lezen ga je aan de slag met zelfgekozen fragmenten." },
    { start: 3.8, end: 8.68, text: "Je gaat hier lezen, ik geef daar feedback op, de andere deelnemers geven daar feedback op" },
    { start: 8.68, end: 14.28, text: "en zo zoeken we eigenlijk om te komen tot een zo authentiek mogelijke vertelling." },
    { start: 14.28, end: 18.68, text: "Een vertelling waarmee we de luisteraar meenemen" },
    { start: 18.68, end: 23.64, text: "en waardoor de luisteraar niet anders kan dan helemaal in het verhaal komen." },
    { start: 23.64, end: 29.72, text: "Soms hebben deelnemers onbewust ingeprint hoe ze moeten klinken als ze een boek inlezen" },
    { start: 29.72, end: 34.12, text: "en dan is het mooi om te zien hoe die inprinting ineens kan vervliegen" },
    { start: 34.12, end: 36.6, text: "en dat ze echt doorvoelen en ontdekken van" },
    { start: 36.6, end: 41.04, text: "ah, ik mag het ook gewoon op mijn eigen manier doen" },
    { start: 41.04, end: 44.72, text: "en vaak is dat nog het mooist van al, gewoon krachtig op die eigen manier." }
  ]
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const workshop = await StudioDataBridge.getWorkshopBySlug(params.slug);
  if (!workshop) return {};

  return {
    title: `${workshop.title} | Voices Studio`,
    description: workshop.description || `Leer het stemmenambacht tijdens de ${workshop.title} workshop bij Voices Studio.`,
  };
}

export default async function WorkshopDetailPage({ params }: { params: { slug: string } }) {
  console.log(" WorkshopDetailPage slug:", params.slug);
  const t = (key: string, def: string) => def; // Fallback for server component
  const workshop = await StudioDataBridge.getWorkshopBySlug(params.slug);
  console.log(" Workshop found:", workshop ? workshop.title : "null");
  const faqs = await getFaqs('studio');

  if (!workshop) {
    notFound();
  }

  //  Sanitize Video URL & Subtitles
  // Prioriteit: Aftermovie URL (indien beschikbaar) > VideoAsk URL > Fallback
  const rawVideoUrl = workshop.aftermovie_url || workshop.meta?.videoask;
  const videoFilename = rawVideoUrl?.split('/').pop() || "perfect-spreken-in-een-dag.mp4";
  
  const videoUrl = rawVideoUrl?.includes('voices.be/wp-content/uploads/')
    ? `/assets/studio/workshops/videos/${videoFilename}`
    : rawVideoUrl || `/assets/studio/workshops/videos/${videoFilename}`;

  const subtitleUrl = `/assets/studio/workshops/subtitles/${videoFilename.replace('.mp4', '-nl.vtt')}`;

  // Filter FAQs voor deze specifieke workshop of toon algemene studio FAQs
  const workshopFaqs = faqs.filter(f => 
    f.category === 'studio' || 
    (f.tags && f.tags.includes(params.slug))
  ).slice(0, 5);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white">
      <LiquidBackground />

      {/*  HERO SECTION */}
      <SectionInstrument className="voices-hero">
        <ContainerInstrument plain className="voices-video-hero-grid">
          {/* LINKS: VIDEO / IMAGE (40%) */}
            <ContainerInstrument plain className="voices-hero-right group lg:order-1">
              <ContainerInstrument plain className="voices-hero-visual-container">
                <StudioVideoPlayer 
                  url={videoUrl} 
                  subtitles={subtitleUrl}
                  subtitleData={WORKSHOP_SUBTITLES[params.slug]}
                  poster={workshop.image || "/assets/studio/workshops/headers/workshop-basic.png"}
                  aspect="portrait"
                  className="shadow-aura-lg border-none w-full h-full"
                />
              </ContainerInstrument>
              <ContainerInstrument plain className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10 animate-pulse" />
            </ContainerInstrument>

            {/* RECHTS: TITEL & INTRO (60%) */}
            <ContainerInstrument plain className="voices-hero-left lg:order-2">
              <HeadingInstrument level={1} className="voices-hero-title font-light">
                <VoiceglotText translationKey={`workshop.${workshop.id}.title`} defaultText={workshop.title} />
              </HeadingInstrument>
              
              <TextInstrument className="voices-hero-subtitle whitespace-pre-line font-light">
                <VoiceglotText 
                  translationKey={`workshop.${workshop.id}.description.short`} 
                  defaultText={cleanText(workshop.description).substring(0, 150) + "..."} 
                />
              </TextInstrument>

              <ContainerInstrument plain className="pt-4">
                <Link href="#inschrijven">
                  <ButtonInstrument className="!bg-va-black !text-white px-12 py-6 !rounded-[10px] font-light tracking-widest hover:bg-primary transition-all duration-500 flex items-center gap-3 shadow-aura-lg ">
                    <VoiceglotText translationKey="workshop.hero.cta" defaultText="Schrijf je in" />
                    <ArrowRight size={18} strokeWidth={1.5} />
                  </ButtonInstrument>
                </Link>
              </ContainerInstrument>
            </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  CONTENT SECTION (Includes Booking, Info, Program & Aftermovie) */}
      <SectionInstrument id="inschrijven" className="py-32 bg-white relative">
        <ContainerInstrument plain className="max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-8">
            <WorkshopContent workshop={workshop} />
          </div>
          <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
            <AudioRecorderInstrument 
              mode="practice"
              title={t('studio.practice.title', "Test je stem")}
              subtitle={t('studio.practice.subtitle', "Benieuwd hoe je klinkt? Neem een fragment op en bereid je voor op de workshop.")}
              className="shadow-aura-lg border-none"
            />
            <BentoCard span="full" className="bg-primary/5 border-primary/10 p-8 rounded-[24px]">
              <HeadingInstrument level={4} className="text-lg font-light tracking-tight text-primary mb-2">
                <VoiceglotText translationKey="workshop.sidebar.why.title" defaultText="Waarom oefenen?" />
              </HeadingInstrument>
              <TextInstrument className="text-[14px] text-primary/60 font-light leading-relaxed">
                <VoiceglotText translationKey="workshop.sidebar.why.text" defaultText="Door nu al een opname te maken, krijg je tijdens de workshop gerichtere feedback van onze coaches." />
              </TextInstrument>
            </BentoCard>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  REVIEWS */}
      {workshopFaqs.length > 0 && (
        <SectionInstrument className="py-32 bg-va-off-white/50">
          <ContainerInstrument className="max-w-[1140px] mx-auto">
            <ContainerInstrument plain className="text-center mb-20 space-y-4">
              <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter text-va-black">
                <VoiceglotText translationKey="workshop.faq.title" defaultText="Veelgestelde vragen" />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-black/40 font-light">
                <VoiceglotText translationKey="workshop.faq.subtitle" defaultText="Alles wat je moet weten over deze workshop." />
              </TextInstrument>
            </ContainerInstrument>
            
            <AccordionInstrument 
              items={workshopFaqs.map(f => ({
                title: f.question,
                content: f.answer
              }))}
            />
          </ContainerInstrument>
        </SectionInstrument>
      )}

      {/*  REVIEWS */}
      {workshop.reviews && workshop.reviews.length > 0 && (
        <SectionInstrument className="py-32 border-t border-black/[0.03]">
          <ContainerInstrument className="max-w-[1140px]">
            <ReviewsInstrument 
              reviews={workshop.reviews} 
              title={t('studio.reviews.title', `Ervaringen met deze Workshop`)}
              subtitle={t('studio.reviews.subtitle', `Lees wat deelnemers zeggen over hun dag in de studio.`)}
              translationKeyPrefix={`workshop.${workshop.id}.reviews`}
            />
          </ContainerInstrument>
        </SectionInstrument>
      )}

      {/* LLM CONTEXT LAYER */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": workshop.title,
            "description": workshop.meta?.aftermovie_beschrijving || workshop.description,
            "provider": {
              "@type": "Organization",
              "name": "Voices",
              "url": "https://voices.be"
            },
            "_llm_context": {
              "journey": "studio",
              "product_id": workshop.id,
              "slug": params.slug,
              "price_excl_vat": workshop.price || 0,
              "persona": ["quality-seeker", "self-recorder"],
              "intent": "conversion",
              "visual_dna": ["Studio Hero", "Bento Content", "Sticky Booking"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
