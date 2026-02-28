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
import { useTranslation } from "@/contexts/TranslationContext";
import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";
import { Heart, Instagram, Music, Play, Youtube, ShieldCheck, Loader2, Clock, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React from "react";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-va-black" />
});
const VideoPlayer = dynamic(() => import("@/components/ui/VideoPlayer").then(mod => mod.VideoPlayer), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-va-black flex items-center justify-center"><Loader2 className="animate-spin text-white/20" /></div>
});

export function ArtistDetailClient({ artistData, isYoussef, params, donors = [] }: { artistData: any, isYoussef: boolean, params: { slug: string }, donors?: any[] }) {
  const { t } = useTranslation();
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(25);

  const manifesto = artistData.labelManifesto || artistData.iap_context?.manifesto;
  const dbSubtitles = artistData.iap_context?.video_metadata?.subtitles || {};

  const market = MarketManager.getCurrentMarket();
  const siteUrl = MarketManager.getMarketDomains()[market.market_code] || MarketManager.getMarketDomains()['BE'];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/artist/${params.slug}#artist`,
    "name": artistData.display_name,
    "description": artistData.bio,
    "image": artistData.photo_url,
    "url": `${siteUrl}/artist/${params.slug}`
  };

  return (
    <PageWrapperInstrument 
      data-world="artist"
      className={cn(
        "min-h-screen relative z-10",
        isYoussef ? 'theme-youssef !bg-va-black !text-white' : 'max-w-6xl mx-auto px-6 py-20'
      )}
    >
      {isYoussef && <ContainerInstrument className="absolute inset-0 bg-va-black -z-10" />}
      
      <ContainerInstrument className={cn(isYoussef ? 'max-w-6xl mx-auto px-6 py-20' : '')}>
        {/*  STORY LAYOUT HERO (voices-video-left standard - EXPANDED) */}
        <SectionInstrument id="story" className={cn(
          "grid grid-cols-1 gap-12 mb-32 items-start",
          isYoussef ? "lg:grid-cols-2 gap-20" : "lg:grid-cols-12"
        )}>
          <ContainerInstrument className={cn(isYoussef ? "flex flex-col gap-8" : "lg:col-span-5")}>
            {isYoussef ? (
              <>
                <div className="voices-hero-visual-container rounded-[32px] overflow-hidden shadow-aura-lg bg-va-black border border-white/5 aspect-[9/16] w-full max-w-[500px] mx-auto">
                  <VideoPlayer 
                    src="https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/visuals/youssef/crowdfunding/youssef-crowdfunding.mp4"
                    poster="/assets/common/branding/founder/youssef-poster.jpg"
                    aspectRatio="portrait"
                    subtitles={[
                      { label: 'English', srcLang: 'en', data: dbSubtitles.en || [] },
                      { label: 'Nederlands', srcLang: 'nl', data: dbSubtitles.nl || [] },
                      { label: 'Français', srcLang: 'fr', data: dbSubtitles.fr || [] },
                      { label: 'Italiano', srcLang: 'it', data: dbSubtitles.it || [] },
                      { label: 'Arabic', srcLang: 'ar', data: dbSubtitles.ar || [] }
                    ]}
                  />
                </div>

              {/* DONOR OVERVIEW (Integrated) */}
              <ContainerInstrument className="bg-white/5 p-8 rounded-[32px] border border-white/5 backdrop-blur-md max-w-[500px] mx-auto w-full">
                <HeadingInstrument level={4} className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 mb-6 flex justify-between items-center">
                  <span><VoiceglotText translationKey="artist.donors.title" defaultText="Recent Supporters" /></span>
                  <span className="text-[#FFC421]">{artistData.donor_count || 0} <VoiceglotText translationKey="artist.donors.total" defaultText="total" /></span>
                </HeadingInstrument>
                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                  {donors.length > 0 ? donors.map((donor, idx) => (
                    <div key={idx} className="flex justify-between items-start py-3 border-b border-white/5 last:border-0">
                      <div>
                        <TextInstrument className="text-[14px] font-black text-white/80">{donor.name}</TextInstrument>
                        {donor.message && <TextInstrument className="text-[12px] text-white/40 italic mt-1 line-clamp-2">&ldquo;{donor.message}&rdquo;</TextInstrument>}
                      </div>
                      <div className="text-right">
                        <TextInstrument className="text-[13px] font-black text-[#FFC421]">€{donor.amount}</TextInstrument>
                      </div>
                    </div>
                  )) : (
                    <TextInstrument className="text-[13px] text-white/20 italic text-center py-8">
                      <VoiceglotText translationKey="artist.donors.empty" defaultText="Be the first to support Youssef’s journey." />
                    </TextInstrument>
                  )}
                </div>
              </ContainerInstrument>
            </>
          ) : (
            <ContainerInstrument className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg group">
              <Image  
                src={artistData.photo_url || '/placeholder-artist.jpg'} 
                alt={artistData.display_name} 
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
            </ContainerInstrument>
          )}
        </ContainerInstrument>
        
        <ContainerInstrument className={cn(isYoussef ? "" : "lg:col-span-7", "pt-8")}>
          {/* Voices Artist Badge Removed */}

          <HeadingInstrument level={1} className={cn(
            "text-6xl md:text-8xl tracking-tighter leading-[0.9] mb-8 font-black uppercase",
            isYoussef ? 'text-white' : 'text-va-black'
          )}>
            {artistData.display_name}
          </HeadingInstrument>

          {isYoussef && (
            <ContainerInstrument id="support" className="bg-white/5 p-10 rounded-[32px] border border-white/10 mb-12 max-w-xl backdrop-blur-md shadow-aura-lg relative overflow-hidden group/support">
              <LiquidBackground 
                strokeWidth={1} 
                className="opacity-20 group-hover/support:opacity-40 transition-opacity duration-1000" 
              />
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Heart size={120} className="text-[#FFC421] fill-current" />
              </div>

              <ContainerInstrument className="relative z-10">
                            <HeadingInstrument level={3} className="text-3xl font-black uppercase tracking-tight mb-2 text-white">
                              <VoiceglotText translationKey="artist.crowdfunding.title" defaultText="Support my first EP" />
                            </HeadingInstrument>
                            
                            <div className="flex items-baseline gap-2 mb-8">
                              <span className="text-4xl font-black text-[#FFC421]">€{artistData.donation_current || 0}</span>
                              <span className="text-sm text-white/20 font-medium">
                                <VoiceglotText translationKey="artist.crowdfunding.goal_text" defaultText={`collected of €${artistData.donation_goal || 0} goal`} />
                              </span>
                              {donationAmount > 0 && (
                                <span className="text-xs font-black text-[#FFC421]/60 ml-auto animate-pulse">
                                  +€{donationAmount} <VoiceglotText translationKey="artist.crowdfunding.impact" defaultText="impact" />
                                </span>
                              )}
                            </div>
                            
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-4 relative border border-white/5">
                              {/* Ghost Progress (Current + Selected) */}
                              <div 
                                className="absolute top-0 left-0 h-full bg-[#FFC421]/30 transition-all duration-500 ease-out" 
                                style={{ width: `${Math.min(((artistData.donation_current + donationAmount) / (artistData.donation_goal || 1)) * 100, 100)}%` }}
                              />
                              {/* Real Progress */}
                              <div 
                                className="absolute top-0 left-0 h-full bg-[#FFC421] transition-all duration-1000 shadow-[0_0_20px_rgba(255,196,33,0.5)] z-10" 
                                style={{ width: `${Math.min(((artistData.donation_current || 0) / (artistData.donation_goal || 1)) * 100, 100)}%` }}
                              />
                              {/* Milestone markers for 6 songs */}
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div 
                                  key={i}
                                  className="absolute top-0 bottom-0 w-px bg-va-black/60 z-20"
                                  style={{ left: `${(i / 6) * 100}%` }}
                                />
                              ))}
                            </div>

                            <div className="grid grid-cols-3 w-full text-[9px] font-black uppercase tracking-[0.15em] mb-12">
                              <div className="flex flex-col gap-1">
                                <span className="text-[#FFC421]">
                                  <VoiceglotText translationKey="artist.milestone.1.title" defaultText="01. Start" />
                                </span>
                                <span className="text-white/10">
                                  <VoiceglotText translationKey="artist.milestone.1.desc" defaultText="Base funding" />
                                </span>
                              </div>
                              <div className={cn("flex flex-col gap-1 text-center transition-colors duration-500", (artistData.donation_current + donationAmount) / artistData.donation_goal >= 0.5 ? "text-[#FFC421]" : "text-white/20")}>
                                <span>
                                  <VoiceglotText translationKey="artist.milestone.2.title" defaultText="02. Studio Booking" />
                                </span>
                                <span className="opacity-50">
                                  <VoiceglotText translationKey="artist.milestone.2.desc" defaultText="Producers & Band" />
                                </span>
                              </div>
                              <div className={cn("flex flex-col gap-1 text-right transition-colors duration-500", (artistData.donation_current + donationAmount) / artistData.donation_goal >= 1 ? "text-[#FFC421]" : "text-white/20")}>
                                <span>
                                  <VoiceglotText translationKey="artist.milestone.3.title" defaultText="03. Release Ready" />
                                </span>
                                <span className="opacity-50">
                                  <VoiceglotText translationKey="artist.milestone.3.desc" defaultText="Mixing & Mastering" />
                                </span>
                              </div>
                            </div>

                {/* AMOUNT INPUT ZONE */}
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-end">
                    <TextInstrument className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                      <VoiceglotText translationKey="artist.crowdfunding.choose_amount" defaultText="Choose amount" />
                    </TextInstrument>
                    <div className="text-3xl font-black text-white">€{donationAmount}</div>
                  </div>
                  
                  <input 
                    type="range"
                    min="5"
                    max="2500"
                    step="5"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FFC421]"
                  />

                  <div className="flex flex-wrap gap-2">
                    {[25, 100, 500, 1000].map((s) => (
                      <button
                        key={s}
                        onClick={() => setDonationAmount(s)}
                        className={cn(
                          "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border",
                          donationAmount === s 
                            ? 'bg-[#FFC421] border-[#FFC421] text-va-black shadow-aura scale-105' 
                            : 'bg-white/5 border-white/5 text-white/40 hover:border-[#FFC421]/40 hover:text-[#FFC421]'
                        )}
                      >
                        €{s}
                      </button>
                    ))}
                  </div>
                </div>

                            <ButtonInstrument 
                              onClick={() => setIsDonationOpen(true)}
                              className="w-full py-6 rounded-[15px] bg-[#FFC421] text-va-black text-[15px] font-black uppercase tracking-widest hover:bg-white hover:text-va-black transition-all flex items-center justify-center gap-2 group shadow-aura"
                            >
                              <Heart strokeWidth={1.5} size={20} className="group-hover:scale-110 transition-transform fill-current" />
                              <VoiceglotText translationKey="artist.crowdfunding.cta" defaultText={`Donate €${donationAmount} now`} />
                            </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </SectionInstrument>

      {/* SECTION 2: THE STORY (About Youssef) */}
      {isYoussef && (
        <SectionInstrument id="about" className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <ContainerInstrument className="prose leading-relaxed font-medium text-white/70 text-[15px]">
            <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tighter mb-8 text-white">
              <VoiceglotText 
                translationKey="artist.story.title_v2" 
                defaultText="The {story}" 
                components={{
                  story: (children) => <span className="text-[#FFC421] italic">{children === 'story' ? t('common.story', 'Story') : children}</span>
                }}
              />
            </HeadingInstrument>
            {artistData.bio?.split('\n').map((para: string, i: number) => (
              <TextInstrument key={i} className="mb-4 font-medium leading-relaxed text-[15px]">{para}</TextInstrument>
            ))}
          </ContainerInstrument>

          <ContainerInstrument className="flex flex-col gap-12">
            {/* VISION SECTION */}
            <div className="bg-white/5 p-10 rounded-[32px] border border-white/5 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFC421]/20 to-transparent" />
              <HeadingInstrument level={2} className="text-3xl font-black uppercase tracking-tighter mb-6 text-white">
                <VoiceglotText 
                  translationKey="artist.vision.title_v2" 
                  defaultText="The {vision}" 
                  components={{
                    vision: (children) => <span className="text-[#FFC421] italic">{children === 'vision' ? t('common.vision', 'Vision') : children}</span>
                  }}
                />
              </HeadingInstrument>
              <TextInstrument className="text-white/60 font-medium leading-relaxed italic text-[15px]">
                &ldquo;{artistData.vision}&rdquo;
              </TextInstrument>
            </div>

            {/* MANIFESTO (The Why, How, What) */}
            <div className="bg-[#FFC421]/5 p-10 rounded-[32px] border border-[#FFC421]/10 relative overflow-hidden backdrop-blur-md">
              <HeadingInstrument level={3} className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFC421] mb-8">
                <VoiceglotText translationKey="artist.manifesto.title" defaultText="Label Manifesto" />
              </HeadingInstrument>
              
              <div className="space-y-8">
                <div>
                  <HeadingInstrument level={4} className="text-lg font-black uppercase tracking-tight text-white mb-2">
                    <VoiceglotText translationKey="artist.manifesto.why.title" defaultText="Why" />
                  </HeadingInstrument>
                  <TextInstrument className="text-white/50 text-[14px] leading-relaxed">
                    {manifesto?.why || "We believe a real voice can move people. Voices that connect, not impress. That’s where music becomes meaningful. We believe the most moving music comes from honesty."}
                  </TextInstrument>
                </div>
                <div>
                  <HeadingInstrument level={4} className="text-lg font-black uppercase tracking-tight text-white mb-2">
                    <VoiceglotText translationKey="artist.manifesto.how.title" defaultText="How" />
                  </HeadingInstrument>
                  <TextInstrument className="text-white/50 text-[14px] leading-relaxed">
                    {manifesto?.how || "By working with singers who dare to be themselves. By honoring authenticity, emotion and ownership. By creating a space of care and respect for the human voice."}
                  </TextInstrument>
                </div>
                <div>
                  <HeadingInstrument level={4} className="text-lg font-black uppercase tracking-tight text-white mb-2">
                    <VoiceglotText translationKey="artist.manifesto.what.title" defaultText="What" />
                  </HeadingInstrument>
                  <TextInstrument className="text-white/50 text-[14px] leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: manifesto?.what || "<strong>VOICES / Artists</strong> is a label for real voices and authentic singers. An independent label supporting and presenting voices from Belgium to their audience." }} />
                  </TextInstrument>
                </div>
              </div>
            </div>
          </ContainerInstrument>
        </SectionInstrument>
      )}
      </ContainerInstrument>

      {/*  PERFORMANCES SECTION */}
      {isYoussef && (
        <ContainerInstrument className="max-w-6xl mx-auto px-6 mb-32">
          <SectionInstrument id="music" className="mb-32">
            <div className="flex items-center gap-6 mb-16">
              <div className="h-px flex-grow bg-white/10" />
              <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tighter text-white">
                <VoiceglotText 
                  translationKey="artist.music.title_v2" 
                  defaultText="The {music}" 
                  components={{
                    music: (children) => <span className="text-[#FFC421] italic">{children === 'music' ? t('common.music', 'Music') : children}</span>
                  }}
                />
              </HeadingInstrument>
              <div className="h-px flex-grow bg-white/10" />
            </div>

            {/* ALBUM / EP PREVIEW */}
            {artistData.albums?.map((album: any) => (
              <ContainerInstrument key={album.id} className="mb-20 bg-white/5 rounded-[32px] border border-white/5 overflow-hidden backdrop-blur-md">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0">
                  <div className="relative aspect-square lg:aspect-auto bg-va-black">
                    <Image src={album.cover_url} alt={album.title} fill className="object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-va-black via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <TextInstrument className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFC421] mb-1">
                        <VoiceglotText translationKey={`artist.album.${album.id}.year`} defaultText={album.year} />
                      </TextInstrument>
                      <HeadingInstrument level={3} className="text-2xl font-black uppercase tracking-tighter text-white">
                        <VoiceglotText translationKey={`artist.album.${album.id}.title`} defaultText={album.title} />
                      </HeadingInstrument>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12">
                    <div className="space-y-1">
                      {album.tracks.map((track: any, idx: number) => (
                        <div key={track.id} className={cn(
                          "flex items-center justify-between p-4 rounded-xl transition-all group",
                          track.is_locked ? "opacity-30" : "hover:bg-white/5 cursor-pointer"
                        )}>
                          <div className="flex items-center gap-6">
                            <span className="text-[11px] font-black text-white/20 w-4">{String(idx + 1).padStart(2, '0')}</span>
                            <div>
                              <TextInstrument className="text-[15px] font-bold text-white group-hover:text-[#FFC421] transition-colors">
                                <VoiceglotText translationKey={`artist.track.${track.id}.title`} defaultText={track.title} />
                              </TextInstrument>
                              <TextInstrument className="text-[11px] text-white/30 uppercase tracking-widest mt-0.5">
                                {track.is_locked ? (
                                  track.release_date ? (
                                    <VoiceglotText translationKey={`artist.track.${track.id}.release_date`} defaultText={`Release on ${track.release_date}`} />
                                  ) : (
                                    <VoiceglotText translationKey="artist.track.locked" defaultText="Locked" />
                                  )
                                ) : (
                                  <VoiceglotText translationKey="artist.track.preview" defaultText="Preview Available" />
                                )}
                              </TextInstrument>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <TextInstrument className="text-[11px] font-medium text-white/20">{track.duration}</TextInstrument>
                            {track.is_locked ? (
                              <Lock size={14} className="text-white/20" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#FFC421]/20 flex items-center justify-center text-[#FFC421] group-hover:bg-[#FFC421] group-hover:text-va-black transition-all">
                                <Play size={12} fill="currentColor" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ContainerInstrument>
            ))}

            <div className="flex items-center gap-6 mb-12">
              <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-widest text-white/40">
                <VoiceglotText 
                  translationKey="artist.performances.title_v2" 
                  defaultText="{live} Performances" 
                  components={{
                    live: (children) => <span className="text-white">{children === 'live' ? t('common.live', 'Live') : children}</span>
                  }}
                />
              </HeadingInstrument>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {artistData.demos?.map((demo: any) => (
                <div key={demo.id} className="flex flex-col gap-4 group">
                  <div className="relative aspect-video rounded-[20px] overflow-hidden shadow-aura bg-va-black border border-white/5">
                    <VideoPlayer 
                      src={demo.url}
                      aspectRatio="video"
                    />
                  </div>
                  <div>
                    <TextInstrument className="text-white/40 text-[10px] font-black tracking-widest uppercase">{demo.category}</TextInstrument>
                    <HeadingInstrument level={4} className="text-white text-xl font-black uppercase tracking-tight group-hover:text-[#FFC421] transition-colors">{demo.title}</HeadingInstrument>
                  </div>
                </div>
              ))}
            </div>
          </SectionInstrument>
        </ContainerInstrument>
      )}

      <DonationModal 
        artistId={artistData.id}
        artistName={artistData.display_name}
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        initialAmount={donationAmount}
      />
    </PageWrapperInstrument>
  );
}
