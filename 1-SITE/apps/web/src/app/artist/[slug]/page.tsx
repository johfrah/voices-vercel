import { getActor } from "@/lib/api-server";
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { ArrowLeft, Play, Star, Heart, Share2, Mic, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";

export const dynamic = 'force-dynamic';

export default function ArtistDetailPage({ params }: { params: { slug: string } }) {
  return (
    <PageWrapperInstrument>
      <Suspense fallback={<LoadingScreenInstrument />}>
        <ArtistDetailContent params={params} />
      </Suspense>
    </PageWrapperInstrument>
  );
}

async function ArtistDetailContent({ params }: { params: { slug: string } }) {
  const artist = await getActor(params.slug);

  if (!artist) {
    return (
      <PageWrapperInstrument className="flex items-center justify-center min-h-screen">
        <HeadingInstrument level={1}>
          <VoiceglotText translationKey="artist.not_found" defaultText="Artist not found" />
        </HeadingInstrument>
      </PageWrapperInstrument>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": artist.display_name,
    "jobTitle": "Voice-over Artist",
    "image": artist.photo_url,
    "description": `Professionele stemacteur ${artist.display_name}. Beschikbaar voor commerciële projecten.`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://voices.be/artist/${params.slug}`
    },
    "_llm_context": {
      "persona": "Musical Confidant",
      "journey": "artist_detail",
      "intent": "book_voice",
      "capabilities": ["listen_demos", "book_artist"],
      "lexicon": {
        "voice-over": "Stem",
        "actor": "Artiest",
        "demo": "Fragment"
      }
    }
  };

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectionInstrument className="mb-12 flex items-center justify-between">
        <Link 
          href="/artist" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/40 hover:text-primary transition-all"
        >
          <ArrowLeft size={14} /> 
          <VoiceglotText translationKey="artist.back_to_artists" defaultText="Terug naar alle artiesten" />
        </Link>
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Heart size={18} />
          </ButtonInstrument>
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Share2 size={18} />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid className="mb-20">
        <BentoCard span="sm" className="!p-0 overflow-hidden bg-white shadow-aura">
          <ContainerInstrument className="aspect-[4/5] relative">
            <Image 
              src={artist.photo_url || '/placeholder-artist.jpg'} 
              alt={artist.display_name} 
              fill
              className="object-cover"
            />
            <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/80 via-transparent to-transparent" />
            <ContainerInstrument className="absolute bottom-8 left-8 right-8">
              <HeadingInstrument level={1} className="text-3xl font-light text-white tracking-tighter mb-2">
                <VoiceglotText translationKey={`artist.${artist.id}.name`} defaultText={artist.display_name} noTranslate={true} />
              </HeadingInstrument>
              <ContainerInstrument className="flex items-center gap-2">
                <ContainerInstrument className="px-3 py-1 bg-primary rounded-full text-[8px] font-medium text-white uppercase tracking-widest">
                  <VoiceglotText translationKey="artist.badge.featured" defaultText="Stem" />
                </ContainerInstrument>
                <ContainerInstrument className="flex items-center gap-1 text-white/60 text-[10px] font-medium uppercase tracking-widest">
                  <Star size={10} className="text-primary" fill="currentColor" /> 
                  <VoiceglotText translationKey="artist.score" defaultText="9.8" />
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        <BentoCard span="xl" className="bg-va-off-white/50 backdrop-blur-md border-white/20 shadow-aura p-12">
          <ContainerInstrument className="flex justify-between items-center mb-12">
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tight">
              <VoiceglotText translationKey="artist.portfolio.title" defaultText="Portfolio & " />
              <TextInstrument as="span" className="text-primary italic">
                <VoiceglotText translationKey="artist.portfolio.subtitle" defaultText="Werken" />
              </TextInstrument>
            </HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artist.demos?.map((demo: any, i: number) => (
              <ContainerInstrument 
                key={i}
                className="group p-6 rounded-[24px] bg-white border border-black/5 hover:border-primary/20 transition-all flex items-center justify-between cursor-pointer"
              >
                <ContainerInstrument className="flex items-center gap-4">
                  <ContainerInstrument className="w-12 h-12 rounded-xl bg-va-off-white flex items-center justify-center text-va-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={4} className="font-medium tracking-tight text-sm">
                      <VoiceglotText translationKey={`artist.demo.${i}.title`} defaultText={demo.title} />
                    </HeadingInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[10px] font-medium text-va-black/20 uppercase tracking-widest">
                  <VoiceglotText translationKey={`artist.demo.${i}.category`} defaultText={demo.category} />
                </TextInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </BentoCard>

        <ContainerInstrument className="space-y-8">
          <BentoCard span="sm" className="bg-va-black text-white p-8">
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-6">
              <VoiceglotText translationKey="artist.booking.title" defaultText="Boeking" />
            </HeadingInstrument>
            <ButtonInstrument className="va-btn-pro w-full mt-8 !bg-primary flex items-center justify-center gap-2 group">
              <VoiceglotText translationKey="artist.book_now" defaultText="Nu Boeken" /> <Mic size={16} />
            </ButtonInstrument>
          </BentoCard>

          <BentoCard span="sm" className="hred text-white p-8">
            <HeadingInstrument level={4} className="text-[10px] font-medium uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> 
              <VoiceglotText translationKey="artist.guarantee.title" defaultText="Kwaliteit" />
            </HeadingInstrument>
            <TextInstrument className="text-xs font-light leading-relaxed">
              <VoiceglotText 
                translationKey="artist.guarantee.text" 
                defaultText="Elke stem op ons platform is zorgvuldig gescreend op kwaliteit en professionaliteit." 
              />
            </TextInstrument>
          </BentoCard>
        </ContainerInstrument>
      </BentoGrid>

      {/* 🌟 REVIEWS SPECIFIEK VOOR DEZE STEM */}
      {artist.reviews && artist.reviews.length > 0 && (
        <ReviewsInstrument 
          reviews={artist.reviews} 
          title={`Ervaringen met ${artist.display_name}`}
          subtitle={`Lees wat anderen zeggen over de samenwerking met ${artist.display_name}.`}
          translationKeyPrefix={`artist.${artist.id}.reviews`}
        />
      )}
    </PageWrapperInstrument>
  );
}