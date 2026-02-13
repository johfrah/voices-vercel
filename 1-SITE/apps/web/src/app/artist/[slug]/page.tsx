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
    <PageWrapperInstrument className="max-w-6xl mx-auto px-6 py-20 relative z-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectionInstrument className="mb-12 flex items-center justify-between">
        <Link 
          href="/artist" 
          className="inline-flex items-center gap-2 text-[10px] font-light tracking-widest text-va-black/40 hover:text-primary transition-all"
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

      {/* 🎭 STORY LAYOUT HERO */}
      <SectionInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-start">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg group">
            <Image 
              src={artist.photo_url || '/placeholder-artist.jpg'} 
              alt={artist.display_name} 
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-va-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>
        </div>
        
        <div className="lg:col-span-7 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-light tracking-widest border border-primary/10">
              <VoiceglotText translationKey="artist.badge.featured" defaultText="Voice Artist" />
            </span>
            <div className="flex items-center gap-1 text-va-black/40 text-[10px] font-light tracking-widest">
              <Star size={10} className="text-primary" fill="currentColor" /> 
              <VoiceglotText translationKey="artist.score" defaultText="9.8 Rating" />
            </div>
          </div>

          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black mb-8">
            <VoiceglotText translationKey={`artist.${artist.id}.name`} defaultText={artist.display_name} noTranslate={true} />
          </HeadingInstrument>

          <p className="text-xl md:text-2xl font-light text-va-black/60 leading-tight tracking-tight max-w-xl mb-12">
            <VoiceglotText 
              translationKey={`artist.${artist.id}.bio`} 
              defaultText={`Ontmoet de stem achter het verhaal. ${artist.display_name} brengt karakter, warmte en autoriteit naar elk project.`} 
            />
          </p>

          <div className="flex flex-wrap gap-4">
            <ButtonInstrument className="va-btn-pro !px-10 !py-6 text-base !rounded-[10px] !bg-va-black !text-white flex items-center gap-2 group">
              <VoiceglotText translationKey="artist.book_now" defaultText="Direct Boeken" />
              <Mic size={18} className="group-hover:rotate-12 transition-transform" />
            </ButtonInstrument>
            <ButtonInstrument className="va-btn-pro !px-10 !py-6 text-base !rounded-[10px] !bg-white !text-va-black border border-black/5 flex items-center gap-2">
              <Play size={18} />
              <VoiceglotText translationKey="artist.listen_all" defaultText="Beluister Demos" />
            </ButtonInstrument>
          </div>
        </div>
      </SectionInstrument>

      {/* 🎞️ BEHIND THE SCENES / VIDEO SECTION */}
      <SectionInstrument className="mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-va-off-white p-12 rounded-[20px] border border-black/[0.03] flex flex-col justify-center">
            <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter mb-6">
              <VoiceglotText translationKey="artist.video.title" defaultText="In de " />
              <span className="text-primary italic">Studio</span>
            </HeadingInstrument>
            <p className="text-lg font-light text-va-black/40 leading-relaxed mb-8">
              <VoiceglotText 
                translationKey="artist.video.text" 
                defaultText="Bekijk hoe deze stem tot leven komt. Van de eerste take tot de perfecte master." 
              />
            </p>
          </div>
          <div className="relative aspect-video rounded-[20px] overflow-hidden shadow-aura group cursor-pointer bg-va-black flex items-center justify-center">
            {/* Placeholder voor video - in werkelijkheid artist.video_url */}
            <div className="absolute inset-0 opacity-40">
              <Image src={artist.photo_url || ''} alt="Video background" fill className="object-cover blur-sm" />
            </div>
            <div className="relative z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
              <Play size={32} fill="currentColor" className="ml-1" />
            </div>
          </div>
        </div>
      </SectionInstrument>

      <BentoGrid className="mb-32">
        <BentoCard span="full" className="bg-white shadow-aura p-12 !rounded-[20px]">
          <ContainerInstrument className="flex justify-between items-center mb-12">
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tight">
              <VoiceglotText translationKey="artist.portfolio.title" defaultText="Portfolio & " />
              <span className="text-primary italic">
                <VoiceglotText translationKey="artist.portfolio.subtitle" defaultText="Demos" />
              </span>
            </HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artist.demos?.map((demo: any, i: number) => (
              <ContainerInstrument 
                key={i}
                className="group p-5 rounded-[15px] bg-va-off-white border border-black/[0.02] hover:bg-white hover:shadow-aura transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center text-va-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <span className="text-xs font-light">0{i+1}</span>
                  </div>
                  <div>
                    <HeadingInstrument level={4} className="font-light tracking-tight text-sm text-va-black">
                      <VoiceglotText translationKey={`artist.demo.${i}.title`} defaultText={demo.title} />
                    </HeadingInstrument>
                    <TextInstrument className="text-[10px] font-light text-va-black/20 tracking-widest">
                      <VoiceglotText translationKey={`artist.demo.${i}.category`} defaultText={demo.category} />
                    </TextInstrument>
                  </div>
                </div>
                <Play size={14} className="text-va-black/10 group-hover:text-primary transition-colors" />
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </BentoCard>
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