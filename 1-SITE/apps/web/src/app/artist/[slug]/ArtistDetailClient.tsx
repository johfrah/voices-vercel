"use client";

import { DonationModal } from "@/components/artist/DonationModal";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Heart, Instagram, Music, Play, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ArtistDetailClient({ artistData, isYoussef, params }: { artistData: any, isYoussef: boolean, params: { slug: string } }) {
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://www.voices.be/artist/${params.slug}#person`,
    "name": artistData.display_name,
    "jobTitle": "Artist",
    "image": artistData.photo_url || undefined,
    "description": artistData.bio,
    "url": `https://www.voices.be/artist/${params.slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.voices.be/artist/${params.slug}`
    },
    "sameAs": artistData.socials
      ? [
          artistData.socials.instagram,
          artistData.socials.youtube,
          artistData.socials.tiktok,
          artistData.socials.spotify
        ].filter(Boolean)
      : undefined,
    "offers": (() => {
      const hasDonation = artistData.donation_goal != null && artistData.donation_current != null;
      if (!hasDonation) return undefined;
      return [
        {
          "@type": "Offer",
          "name": "Support artist crowdfunding",
          "priceCurrency": "EUR",
          "price": 0,
          "priceSpecification": {
            "@type": "PriceSpecification",
            "minPrice": 0,
            "maxPrice": artistData.donation_goal,
            "priceCurrency": "EUR"
          },
          "availability": "https://schema.org/InStock",
          "url": `https://www.voices.be/artist/${params.slug}`
        }
      ];
    })(),
    "knowsAbout": artistData.demos?.map((d: any) => d.category).filter(Boolean) || undefined
  };

  return (
    <PageWrapperInstrument className={cn(
      "min-h-screen relative z-10",
      isYoussef ? 'theme-youssef !bg-va-black !text-white' : 'max-w-6xl mx-auto px-6 py-20'
    )}>
      {isYoussef && <ContainerInstrument className="absolute inset-0 bg-va-black -z-10" />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ContainerInstrument className={cn(isYoussef ? 'max-w-6xl mx-auto px-6 py-20' : '')}>
        {/*  STORY LAYOUT HERO */}
        <SectionInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-start">
          <ContainerInstrument className="lg:col-span-5">
            <ContainerInstrument className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg group">
              <Image  
                src={artistData.photo_url || '/placeholder-artist.jpg'} 
                alt={artistData.display_name} 
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
            </ContainerInstrument>
            
            {/* Social Links */}
            {isYoussef && (
              <ContainerInstrument className="flex justify-center gap-6 mt-8">
                {artistData.socials?.instagram && (
                  <Link  href={artistData.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-primary transition-colors">
                    <Instagram strokeWidth={1.5} size={24} />
                  </Link>
                )}
                {artistData.socials?.youtube && (
                  <Link  href={artistData.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-primary transition-colors">
                    <Youtube strokeWidth={1.5} size={24} />
                  </Link>
                )}
                <Link  href="#" className="text-white/20 hover:text-primary transition-colors">
                  <Music strokeWidth={1.5} size={24} />
                </Link>
              </ContainerInstrument>
            )}
          </ContainerInstrument>
          
          <ContainerInstrument className="lg:col-span-7 pt-8">
            <ContainerInstrument className="flex items-center gap-3 mb-6">
              <TextInstrument className={cn(
                "px-3 py-1 rounded-full text-[15px] font-light tracking-widest uppercase border",
                isYoussef ? 'bg-primary/20 text-primary border-primary/20' : 'bg-primary/10 text-primary border border-primary/10'
              )}>
                <VoiceglotText  translationKey="artist.badge.featured" defaultText="Voices Artist" />
              </TextInstrument>
            </ContainerInstrument>

            <HeadingInstrument level={1} className={cn(
              "text-6xl md:text-8xl tracking-tighter leading-[0.9] mb-8 font-light",
              isYoussef ? 'text-white' : 'text-va-black'
            )}>
              {artistData.display_name}
            </HeadingInstrument>

            <ContainerInstrument className={cn(
              "prose prose-lg leading-relaxed mb-12 max-w-xl font-light",
              isYoussef ? 'text-white/60' : 'text-va-black/60'
            )}>
              {artistData.bio?.split('\n').map((para: string, i: number) => (
                <TextInstrument key={i} className="mb-4 font-light">{para}</TextInstrument>
              ))}
            </ContainerInstrument>

            {isYoussef && (
              <ContainerInstrument className="bg-white/5 p-8 rounded-[20px] border border-white/5 mb-12 max-w-xl backdrop-blur-sm">
                <ContainerInstrument className="flex justify-between items-end mb-4">
                  <ContainerInstrument>
                    <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-1 text-white">
                      <VoiceglotText  translationKey="auto.artistdetailclient.support_my_next_rele.16456d" defaultText="Support my next release" />
                    </HeadingInstrument>
                    <TextInstrument className="text-[15px] text-white/40 font-light">
                      <VoiceglotText  translationKey="auto.artistdetailclient.help_me_reach_the_go.245a00" defaultText="Help me reach the goal for my new studio session." />
                    </TextInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="text-right">
                    <TextInstrument className="text-2xl font-light text-primary">{artistData.donation_current}</TextInstrument>
                    <TextInstrument className="text-[15px] text-white/20 font-light ml-1 inline">/ {artistData.donation_goal}</TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-8">
                  <ContainerInstrument 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(artistData.donation_current / artistData.donation_goal) * 100}%` }}
                  />
                </ContainerInstrument>
                <ButtonInstrument 
                  onClick={() => setIsDonationOpen(true)}
                  className="w-full va-btn-pro !py-6 text-base !rounded-[10px] !bg-primary !text-white flex items-center justify-center gap-2 group"
                >
                  <Heart strokeWidth={1.5} size={18} className="group-hover:scale-110 transition-transform" />
                  <TextInstrument className="font-light tracking-widest text-[15px] ">
                    <VoiceglotText  translationKey="auto.artistdetailclient.support_youssef.c901c7" defaultText="Support Youssef" />
                  </TextInstrument>
                </ButtonInstrument>
              </ContainerInstrument>
            )}

            <ContainerInstrument className="flex flex-wrap gap-4">
              <ButtonInstrument className={cn(
                "va-btn-pro !px-10 !py-6 text-base !rounded-[10px] flex items-center gap-2 group",
                isYoussef ? '!bg-white/5 !text-white border border-white/10 hover:!bg-white/10' : '!bg-white !text-va-black border border-va-black/5'
              )}>
                <Play strokeWidth={1.5} size={18} className="group-hover:text-primary transition-colors" />
                <TextInstrument className={cn(isYoussef ? 'font-light tracking-widest text-[15px] uppercase' : 'font-light')}>
                  <VoiceglotText  translationKey="artist.listen_all" defaultText="Listen to Demos" />
                </TextInstrument>
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/*  VIDEO SECTION */}
        {isYoussef && (
          <SectionInstrument className="mb-32">
            <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter mb-12 text-center text-white">
              Live <TextInstrument className="text-primary italic inline font-light"><VoiceglotText  translationKey="auto.artistdetailclient.performances.9a63ec" defaultText="Performances" /></TextInstrument>
            </HeadingInstrument>
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ContainerInstrument className="relative aspect-video rounded-[20px] overflow-hidden shadow-aura group cursor-pointer bg-va-black border border-white/5">
                <Image  
                  src="https://www.voices.be/wp-content/uploads/portfolio/276051/hero.jpg" 
                  alt="Live performance" 
                  fill 
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                />
                <ContainerInstrument className="absolute inset-0 flex items-center justify-center">
                  <ContainerInstrument className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play strokeWidth={1.5} size={24} fill="currentColor" className="ml-1" />
                  </ContainerInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="absolute bottom-6 left-6 right-6">
                  <TextInstrument className="text-white/40 text-[15px] font-light tracking-widest ">
                    <VoiceglotText  translationKey="auto.artistdetailclient.the_voice_france.ba498e" defaultText="The Voice France" />
                  </TextInstrument>
                  <HeadingInstrument level={4} className="text-white text-xl font-light tracking-tight">
                    <VoiceglotText  translationKey="auto.artistdetailclient.fix_you__coldplay_co.94bb46" defaultText="Fix You (Coldplay Cover)" />
                  </HeadingInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="relative aspect-video rounded-[20px] overflow-hidden shadow-aura group cursor-pointer bg-va-black border border-white/5">
                <Image  
                  src="https://www.voices.be/wp-content/uploads/portfolio/276051/hero.jpg" 
                  alt="Live performance" 
                  fill 
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                />
                <ContainerInstrument className="absolute inset-0 flex items-center justify-center">
                  <ContainerInstrument className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play strokeWidth={1.5} size={24} fill="currentColor" className="ml-1" />
                  </ContainerInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="absolute bottom-6 left-6 right-6">
                  <TextInstrument className="text-white/40 text-[15px] font-light tracking-widest ">
                    <VoiceglotText  translationKey="auto.artistdetailclient.brussels_street_sess.8cb980" defaultText="Brussels Street Session" />
                  </TextInstrument>
                  <HeadingInstrument level={4} className="text-white text-xl font-light tracking-tight">
                    <VoiceglotText  translationKey="auto.artistdetailclient.my_funny_valentine.4c78df" defaultText="My Funny Valentine" />
                  </HeadingInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </SectionInstrument>
        )}

        <BentoGrid strokeWidth={1.5} className="mb-32">
          <BentoCard span="full" className={cn(isYoussef ? 'bg-white/5 border border-white/5 text-white' : 'bg-white shadow-aura border border-va-black/5', "p-12 !rounded-[20px]")}>
            <ContainerInstrument className="flex justify-between items-center mb-12">
              <HeadingInstrument level={2} className={`text-3xl tracking-tight font-light`}>
                Latest <TextInstrument className="text-primary italic inline font-light"><VoiceglotText  translationKey="auto.artistdetailclient.releases.d50ae4" defaultText="Releases" /></TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artistData.demos?.map((demo: any, i: number) => (
                <ContainerInstrument 
                  key={i}
                  className={cn(
                    "group p-5 rounded-[15px] transition-all flex items-center justify-between cursor-pointer",
                    isYoussef ? 'bg-white/5 border border-white/5 hover:bg-white/10' : 'bg-va-off-white border border-va-black/5 hover:bg-white hover:shadow-aura'
                  )}
                >
                  <ContainerInstrument className="flex items-center gap-4">
                    <ContainerInstrument className={cn(
                      "w-10 h-10 rounded-[10px] flex items-center justify-center transition-all shadow-sm",
                      isYoussef ? 'bg-white/10 text-white group-hover:bg-primary' : 'bg-white text-va-black group-hover:bg-primary group-hover:text-white'
                    )}>
                      <TextInstrument className="text-[15px] font-light">{i+1}</TextInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument>
                      <HeadingInstrument level={4} className={cn("tracking-tight text-[15px] font-light", isYoussef ? 'text-white' : 'text-va-black')}>
                        {demo.title}
                      </HeadingInstrument>
                      <TextInstrument className={cn("text-[15px] tracking-widest font-light uppercase", isYoussef ? 'text-white/20' : 'text-va-black/20')}>
                        {demo.category}
                      </TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <Play strokeWidth={1.5} size={14} className={cn(isYoussef ? 'text-white/10' : 'text-va-black/10', "group-hover:text-primary transition-colors")} />
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </ContainerInstrument>

      <DonationModal strokeWidth={1.5} 
        artistId={artistData.id}
        artistName={artistData.display_name}
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />
    </PageWrapperInstrument>
  );
}
