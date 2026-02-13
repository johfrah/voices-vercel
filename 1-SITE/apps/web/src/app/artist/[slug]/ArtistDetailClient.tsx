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
import { useState } from "react";

export function ArtistDetailClient({ artistData, isYoussef, params }: { artistData: any, isYoussef: boolean, params: { slug: string } }) {
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": artistData.display_name,
    "jobTitle": "Artist",
    "image": artistData.photo_url,
    "description": artistData.bio,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://voices.be/artist/${params.slug}`
    }
  };

  return (
    <PageWrapperInstrument className={`min-h-screen relative z-10 ${isYoussef ? 'theme-youssef !bg-va-black !text-white' : 'max-w-6xl mx-auto px-6 py-20'}`}>
      {isYoussef && <div className="absolute inset-0 bg-va-black -z-10" />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className={`${isYoussef ? 'max-w-6xl mx-auto px-6 py-20' : ''}`}>
        {/* 🎭 STORY LAYOUT HERO */}
        <SectionInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-start">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg group">
              <Image 
                src={artistData.photo_url || '/placeholder-artist.jpg'} 
                alt={artistData.display_name} 
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
            </div>
            
            {/* Social Links */}
            {isYoussef && (
              <div className="flex justify-center gap-6 mt-8">
                <a href={artistData.socials.instagram} target="_blank" className="text-white/20 hover:text-primary transition-colors">
                  <Instagram size={24} />
                </a>
                <a href={artistData.socials.youtube} target="_blank" className="text-white/20 hover:text-primary transition-colors">
                  <Youtube size={24} />
                </a>
                <a href="#" className="text-white/20 hover:text-primary transition-colors">
                  <Music size={24} />
                </a>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-7 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-[15px] font-light tracking-widest border ${isYoussef ? 'bg-primary/20 text-primary border-primary/20' : 'bg-primary/10 text-primary border border-primary/10'}`}>
                <VoiceglotText translationKey="artist.badge.featured" defaultText="Voices Artist" />
              </span>
            </div>

            <HeadingInstrument level={1} className={`text-6xl md:text-8xl tracking-tighter leading-[0.9] mb-8 ${isYoussef ? 'font-black text-white uppercase' : 'font-light text-va-black'}`}>
              {artistData.display_name}
            </HeadingInstrument>

            <div className={`prose prose-lg leading-relaxed mb-12 max-w-xl ${isYoussef ? 'font-medium text-white/60' : 'font-light text-va-black/60'}`}>
              {artistData.bio.split('\n').map((para: string, i: number) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>

            {isYoussef && (
              <div className="bg-white/5 p-8 rounded-[20px] border border-white/5 mb-12 max-w-xl backdrop-blur-sm">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <HeadingInstrument level={3} className="text-2xl font-black tracking-tight mb-1 text-white">
                      Support my next release
                    </HeadingInstrument>
                    <TextInstrument className="text-sm text-white/40 font-medium">
                      Help me reach the goal for my new studio session.
                    </TextInstrument>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">€{artistData.donation_current}</span>
                    <span className="text-sm text-white/20 font-medium ml-1">/ €{artistData.donation_goal}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-8">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(artistData.donation_current / artistData.donation_goal) * 100}%` }}
                  />
                </div>
                <ButtonInstrument 
                  onClick={() => setIsDonationOpen(true)}
                  className="w-full va-btn-pro !py-6 text-base !rounded-[10px] !bg-primary !text-white flex items-center justify-center gap-2 group"
                >
                  <Heart size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-black tracking-widest text-[15px]">Support Youssef</span>
                </ButtonInstrument>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <ButtonInstrument className={`va-btn-pro !px-10 !py-6 text-base !rounded-[10px] flex items-center gap-2 group ${isYoussef ? '!bg-white/5 !text-white border border-white/10 hover:!bg-white/10' : '!bg-white !text-va-black border border-black/5'}`}>
                <Play size={18} className="group-hover:text-primary transition-colors" />
                <span className={isYoussef ? 'font-black uppercase tracking-widest text-[15px]' : ''}>
                  <VoiceglotText translationKey="artist.listen_all" defaultText="Listen to Demos" />
                </span>
              </ButtonInstrument>
            </div>
          </div>
        </SectionInstrument>

        {/* 🎞️ VIDEO SECTION */}
        {isYoussef && (
          <SectionInstrument className="mb-32">
            <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter mb-12 text-center text-white">
              Live <span className="text-primary italic">Performances</span>
            </HeadingInstrument>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative aspect-video rounded-[20px] overflow-hidden shadow-aura group cursor-pointer bg-va-black border border-white/5">
                <Image 
                  src="https://www.voices.be/wp-content/uploads/portfolio/276051/hero.jpg" 
                  alt="Live performance" 
                  fill 
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <TextInstrument className="text-white/40 text-[15px] font-black tracking-widest ">The Voice France</TextInstrument>
                  <HeadingInstrument level={4} className="text-white text-xl font-black tracking-tight">Fix You (Coldplay Cover)</HeadingInstrument>
                </div>
              </div>
              <div className="relative aspect-video rounded-[20px] overflow-hidden shadow-aura group cursor-pointer bg-va-black border border-white/5">
                <Image 
                  src="https://www.voices.be/wp-content/uploads/portfolio/276051/hero.jpg" 
                  alt="Live performance" 
                  fill 
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <TextInstrument className="text-white/40 text-[15px] font-black tracking-widest ">Brussels Street Session</TextInstrument>
                  <HeadingInstrument level={4} className="text-white text-xl font-black tracking-tight">My Funny Valentine</HeadingInstrument>
                </div>
              </div>
            </div>
          </SectionInstrument>
        )}

        <BentoGrid className="mb-32">
          <BentoCard span="full" className={`${isYoussef ? 'bg-white/5 border border-white/5 text-white' : 'bg-white shadow-aura'} p-12 !rounded-[20px]`}>
            <ContainerInstrument className="flex justify-between items-center mb-12">
              <HeadingInstrument level={2} className={`text-3xl tracking-tight ${isYoussef ? 'font-black uppercase' : 'font-light'}`}>
                Latest <span className="text-primary italic">Releases</span>
              </HeadingInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artistData.demos?.map((demo: any, i: number) => (
                <ContainerInstrument 
                  key={i}
                  className={`group p-5 rounded-[15px] transition-all flex items-center justify-between cursor-pointer ${isYoussef ? 'bg-white/5 border border-white/5 hover:bg-white/10' : 'bg-va-off-white border border-black/[0.02] hover:bg-white hover:shadow-aura'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center transition-all shadow-sm ${isYoussef ? 'bg-white/10 text-white group-hover:bg-primary' : 'bg-white text-va-black group-hover:bg-primary group-hover:text-white'}`}>
                      <span className="text-[15px] font-bold">{i+1}</span>
                    </div>
                    <div>
                      <HeadingInstrument level={4} className={`tracking-tight text-sm ${isYoussef ? 'font-black uppercase text-white' : 'font-light text-va-black'}`}>
                        {demo.title}
                      </HeadingInstrument>
                      <TextInstrument className={`text-[15px] tracking-widest uppercase ${isYoussef ? 'font-black text-white/20' : 'font-light text-va-black/20'}`}>
                        {demo.category}
                      </TextInstrument>
                    </div>
                  </div>
                  <Play size={14} className={`${isYoussef ? 'text-white/10' : 'text-va-black/10'} group-hover:text-primary transition-colors`} />
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </div>

      <DonationModal 
        artistId={artistData.id}
        artistName={artistData.display_name}
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />
    </PageWrapperInstrument>
  );
}
