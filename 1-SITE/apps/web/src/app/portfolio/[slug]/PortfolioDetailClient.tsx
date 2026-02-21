"use client";

import { useTranslation } from "@/contexts/TranslationContext";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { JohfrahPortfolioSkeleton } from "@/components/portfolio/JohfrahPortfolioSkeleton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { cn } from "@/lib/utils";
import { useEditMode } from "@/contexts/EditModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Award, Mic, Settings, Clock, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, Suspense, useMemo } from 'react';
import dynamic from "next/dynamic";
import { useCheckout } from "@/contexts/CheckoutContext";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });
const StudioVideoPlayer = dynamic(() => import("@/components/ui/StudioVideoPlayer").then(mod => mod.StudioVideoPlayer), { ssr: false });
const ReviewsInstrument = dynamic(() => import("@/components/ui/ReviewsInstrument").then(mod => mod.ReviewsInstrument), { ssr: false });

export function PortfolioDetailClient({ actor }: { actor: any }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { isEditMode, toggleEditMode, openEditModal } = useEditMode();
  const { isAdmin } = useAuth();
  const { selectActor } = useCheckout();

  const getPortfolioHref = (subPath: string) => {
    if (typeof window === 'undefined') return `/portfolio/${actor.slug}${subPath}`;
    const host = window.location.host;
    if (host.includes(`${actor.slug}.be`)) {
      return subPath;
    }
    return `/portfolio/${actor.slug}${subPath}`;
  };

  useEffect(() => {
    selectActor(actor);
    
    //  CHRIS-PROTOCOL: Handle sub-routes via hash mapping
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const subRoute = path.split('/').pop();
      if (subRoute && ['demos', 'host', 'tarieven', 'contact'].includes(subRoute)) {
        const element = document.getElementById(subRoute);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }
      }
    }

    return () => selectActor(null);
  }, [actor, selectActor]);

  const handleActorUpdate = (updatedActor: any) => {
    // In a real scenario, this would update the state or re-fetch
    console.log("Actor updated:", updatedActor);
  };

  const data = useMemo(() => {
    return {
      name: actor?.display_name || t('common.job_title.voice_actor', "Voice Actor"),
      title: actor?.tagline || t('common.job_title.pro_voice_over', "Professional Voice-over"),
      image: actor?.photo_url || "/assets/common/branding/placeholder-actor.jpg",
      extended_bio: actor?.bio || t('common.job_title.pro_voice_over_desc', "Professional voice-over artist."),
      reporter_videos: actor?.actor_videos && actor.actor_videos.length > 0
        ? actor.actor_videos.filter((v: any) => (v.type === 'reporter' || v.type === 'host') && v.status !== 'rejected').slice(0, 2).map((v: any) => ({ id: v.url, title: v.name, status: v.status }))
        : [],
      portfolio_videos: actor?.actor_videos && actor.actor_videos.length > 0
        ? actor.actor_videos.filter((v: any) => (v.type === 'portfolio' || !v.type) && v.status !== 'rejected').map((v: any) => ({ id: v.url, title: v.name, status: v.status }))
        : [],
      studio_specs: actor?.studioSpecs || actor?.studio_specs || {
        microphone: "",
        interface: "",
        preamp: "",
        booth: ""
      },
      connectivity: actor?.connectivity || {
        source_connect: false,
        zoom: false,
        cleanfeed: false,
        session_link: false
      },
      portfolio_photos: actor?.portfolioPhotos || actor?.portfolio_photos || [],
      tier: actor?.portfolio_tier || 'none', // 'none', 'mic', 'studio', 'agency'
      tier_config: actor?.tier_config || (actor?.portfolio_tier === 'mic' ? {
        showLastName: true,
        showContactDetails: true,
        showStudioSpecs: true,
        showConnectivity: false,
        showPortfolioPhotos: true,
        allowCustomWidget: false
      } : actor?.portfolio_tier === 'studio' ? {
        showLastName: true,
        showContactDetails: true,
        showStudioSpecs: true,
        showConnectivity: true,
        showPortfolioPhotos: true,
        allowCustomWidget: true
      } : actor?.portfolio_tier === 'agency' ? {
        showLastName: true,
        showContactDetails: true,
        showStudioSpecs: true,
        showConnectivity: true,
        showPortfolioPhotos: true,
        allowCustomWidget: true,
        allowCustomDomain: true
      } : {
        showLastName: false,
        showContactDetails: false,
        showStudioSpecs: false,
        showConnectivity: false,
        showPortfolioPhotos: false,
        allowCustomWidget: false
      })
    };
  }, [actor]);

  const [pricingConfig, setPricingConfig] = useState<any>(null);
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/pricing/config');
        const data = await res.json();
        setPricingConfig(data);
      } catch (err) {
        console.error('Failed to fetch pricing config', err);
      }
    };
    fetchConfig();
  }, []);

  const config = pricingConfig || { basePrice: 0, videoBasePrice: 0 };
  const dynamicRates = useMemo(() => [
    { label: t('common.media.online', "Online Media"), price: actor?.rates?.GLOBAL?.online || (config.videoBasePrice / 100), desc: t('common.media.online_desc', "Social media, YouTube, Web") },
    { label: t('common.media.elearning', "E-learning"), price: actor?.rates?.GLOBAL?.e_learning || (config.videoBasePrice / 100), desc: t('common.media.elearning_desc', "Per module") },
    { label: t('common.media.commercial', "Commercial"), price: actor?.rates?.GLOBAL?.radio_national || (config.basePrice / 100), desc: t('common.media.commercial_desc', "Radio / TV Nationaal") }
  ], [actor, config, t]);

  if (loading) return <JohfrahPortfolioSkeleton />;

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white selection:bg-primary selection:text-white">
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      
      <div className="fixed top-8 left-8 z-[210]">
        <LanguageSwitcher />
      </div>

      {/*  VOICES MASTER HERO (STORY LAYOUT) */}
      <SectionInstrument id="hero" className={`relative pt-48 pb-64 overflow-hidden transition-all duration-500 ${isEditMode ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''}`}>
        {(isAdmin || process.env.NODE_ENV === 'development') && (
          <div className="fixed bottom-8 right-8 z-[210] flex flex-col gap-3">
            <ButtonInstrument 
              onClick={() => openEditModal(actor, handleActorUpdate)}
              className="va-btn-pro !rounded-full w-14 h-14 flex items-center justify-center shadow-aura-lg group"
              title={t('action.edit_profile', "Edit Profile")}
            >
              <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={toggleEditMode}
              className={cn(
                "!rounded-full w-14 h-14 flex items-center justify-center shadow-aura-lg transition-all duration-500",
                isEditMode ? "bg-primary text-white" : "bg-white text-va-black/40 hover:text-primary"
              )}
              title={isEditMode ? t('action.exit_edit_mode', "Exit Edit Mode") : t('action.quick_edit_mode', "Quick Edit Mode")}
            >
              <Zap size={20} fill={isEditMode ? "currentColor" : "none"} />
            </ButtonInstrument>
          </div>
        )}
        <ContainerInstrument className="max-w-5xl mx-auto px-6">
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <ContainerInstrument className="lg:col-span-7 space-y-12">
              <div className="space-y-4">
                <HeadingInstrument level={1} className="text-7xl md:text-9xl font-extralight leading-[0.85] tracking-tighter text-va-black">
                  {data.name.split(' ')[0]} <br />
                  <span className="text-primary/30 italic">
                    {data.tier_config.showLastName ? data.name.split(' ').slice(1).join(' ') : ''}
                  </span>
                </HeadingInstrument>
                <TextInstrument className="text-2xl md:text-3xl font-light text-va-black/30 leading-tight tracking-tight max-w-xl">
                  <VoiceglotText translationKey={`portfolio.${actor.slug}.title`} defaultText={data.title} />
                </TextInstrument>
              </div>

              <TextInstrument className="max-w-lg text-lg text-va-black/60 leading-relaxed font-light">
                <VoiceglotText translationKey={`portfolio.${actor.slug}.bio`} defaultText={data.extended_bio} />
              </TextInstrument>

              <div className="flex flex-wrap items-center gap-10 pt-6">
                <ButtonInstrument 
                  as={Link}
                  href={getPortfolioHref('/bestellen')}
                  className="va-btn-pro !rounded-[10px] px-12 py-6 text-base shadow-aura-lg hover:scale-105 transition-transform duration-500"
                >
                  <VoiceglotText translationKey="portfolio.cta.order" defaultText="Direct bestellen" />
                </ButtonInstrument>
                <ButtonInstrument as="a" href="#demos" variant="plain" size="none" className="text-[13px] font-light tracking-widest text-va-black/30 hover:text-primary transition-all duration-500 flex items-center gap-4 group">
                  <VoiceglotText translationKey="portfolio.cta.demos" defaultText="Beluister demo's" />
                  <ContainerInstrument className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-700 shadow-sm group-hover:shadow-aura-sm">
                    <ArrowRight strokeWidth={1.5} size={18} className="group-hover:translate-x-1.5 transition-transform duration-500 ease-va-bezier" />
                  </ContainerInstrument>
                </ButtonInstrument>
              </div>
            </ContainerInstrument>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className="lg:col-span-5 relative"
            >
              <ContainerInstrument className="aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg relative group">
                <Image  
                  src={data.image} 
                  alt={data.name}
                  fill
                  className="object-cover transition-transform duration-[3000ms] group-hover:scale-110 va-bezier"
                  priority
                />
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/20 to-transparent opacity-40" />
              </ContainerInstrument>
              
              {/* Floating DNA Element */}
              <ContainerInstrument className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            </motion.div>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  HOST & REPORTER SECTION (VOICES-VIDEO-LEFT STANDARD) */}
      {data.reporter_videos.length > 0 && (
        <SectionInstrument id="host" className="py-48 bg-white relative overflow-hidden">
          <ContainerInstrument className="max-w-[1140px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_0.6fr] gap-16 items-center">
              
              {/* Video Column (Left - 40%) */}
              <ContainerInstrument className="flex justify-center order-2 lg:order-1">
                <ContainerInstrument className="voices-hero-visual-container w-full max-w-[365px] aspect-[9/16] max-h-[650px] rounded-[32px] overflow-hidden shadow-aura-lg relative group">
                  <Suspense fallback={<ContainerInstrument className="w-full h-full bg-va-black/5 animate-pulse rounded-[32px]" />}>
                    <StudioVideoPlayer 
                      url={data.reporter_videos[0].id} 
                      aspect="portrait"
                      className="w-full h-full rounded-[32px]"
                    />
                  </Suspense>
                </ContainerInstrument>
              </ContainerInstrument>

              {/* Text Column (Right - 60%) */}
              <ContainerInstrument className="space-y-12 order-1 lg:order-2">
                  <ContainerInstrument className="space-y-6">
                    <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/5 rounded-full">
                      <Award strokeWidth={1.5} size={16} className="text-primary" />
                      <TextInstrument className="text-[11px] font-light tracking-[0.2em] text-primary uppercase">
                        <VoiceglotText translationKey="portfolio.host.label" defaultText="Host & Reporter" />
                      </TextInstrument>
                    </ContainerInstrument>
                    <HeadingInstrument level={2} className="text-6xl md:text-7xl font-extralight tracking-tighter leading-none text-va-black">
                      <VoiceglotText translationKey={`portfolio.${actor.slug}.host.title`} defaultText="Echt en dichtbij." />
                    </HeadingInstrument>
                    <TextInstrument className="text-2xl text-va-black/40 font-light leading-snug max-w-xl">
                      <VoiceglotText translationKey={`portfolio.${actor.slug}.host.intro`} defaultText="Ik breng verhalen tot leven, recht voor de camera of midden in de actie." />
                    </TextInstrument>
                  </ContainerInstrument>

                  <ContainerInstrument className="space-y-8">
                    <TextInstrument className="text-lg text-va-black/60 font-light leading-relaxed border-l-2 border-primary/20 pl-8 max-w-lg">
                      <VoiceglotText translationKey={`portfolio.${actor.slug}.host.experience`} defaultText="Als regisseur zie ik het grotere plaatje. Dat helpt me om als host de juiste snaar te raken." />
                    </TextInstrument>
                    
                    <ContainerInstrument className="flex flex-wrap gap-6 pt-4">
                      <ButtonInstrument className="va-btn-pro !rounded-[10px] px-10 py-4 text-[13px] font-light tracking-[0.2em] uppercase shadow-aura">
                        <VoiceglotText translationKey="portfolio.cta.showreel" defaultText="Bekijk showreel" />
                      </ButtonInstrument>
                      <ButtonInstrument 
                        variant="ghost"
                        className="text-[13px] font-light tracking-[0.2em] uppercase text-va-black/40 hover:text-primary transition-all duration-500 flex items-center gap-4 group"
                      >
                        <VoiceglotText translationKey="portfolio.cta.book_host" defaultText="Boek als host" />
                        <ArrowRight strokeWidth={1.5} size={16} className="group-hover:translate-x-1 transition-transform" />
                      </ButtonInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
              </ContainerInstrument>

            </div>
          </ContainerInstrument>
        </SectionInstrument>
      )}

      {/*  THE BENTO MATRIX (NUCLEAR ZEN) */}
      <SectionInstrument className="max-w-6xl mx-auto px-6 pb-64">
        <BentoGrid strokeWidth={1.5} columns={3} className="gap-10">
          
          {/* Vertical Video Stack (Secondary Videos) */}
          <ContainerInstrument className="md:col-span-1 space-y-10">
            {data.reporter_videos.slice(1).map((video: any, idx: number) => (
              <ContainerInstrument key={idx} className="aspect-[9/16] rounded-[20px] overflow-hidden relative group shadow-aura border border-black/5 bg-white">
                <Suspense fallback={<ContainerInstrument className="w-full h-full bg-va-black/5 animate-pulse rounded-[20px]" />}>
                  <StudioVideoPlayer 
                    url={video.id} 
                    aspect="portrait"
                    className="w-full h-full rounded-[20px]"
                  />
                </Suspense>
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8 pointer-events-none">
                    <TextInstrument className="text-white text-[11px] font-light tracking-[0.2em] uppercase">{video.title}</TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>

          {/* Investment Card */}
          <BentoCard id="tarieven" span="md" className="bg-white p-12 rounded-[20px] shadow-aura flex flex-col justify-between border border-black/[0.03] hover:shadow-aura-lg transition-all duration-700">
            <ContainerInstrument>
              <HeadingInstrument level={3} className="text-[11px] font-light tracking-[0.2em] text-va-black/30 mb-12 uppercase">
                <VoiceglotText  translationKey="portfolio.rates.title" defaultText="Investering" />
              </HeadingInstrument>
              <ContainerInstrument className="space-y-10">
                {dynamicRates.map((rate, i) => (
                  <ContainerInstrument key={i} className="group">
                    <ContainerInstrument className="flex justify-between items-end mb-3">
                      <TextInstrument as="span" className="font-light text-[13px] tracking-[0.1em] text-va-black/40 group-hover:text-primary transition-colors uppercase">
                        <VoiceglotText  translationKey={`portfolio.rates.${rate.label.toLowerCase().replace(' ', '_')}.label`} defaultText={rate.label} />
                      </TextInstrument>
                      <TextInstrument as="span" className="text-3xl font-extralight tracking-tighter text-va-black leading-none">
                        €{rate.price}
                      </TextInstrument>
                    </ContainerInstrument>
                    <TextInstrument className="text-va-black/40 text-[14px] font-light leading-relaxed">
                      <VoiceglotText  translationKey={`portfolio.rates.${rate.label.toLowerCase().replace(' ', '_')}.desc`} defaultText={rate.desc} />
                    </TextInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="pt-12 border-t border-black/[0.03] mt-12 space-y-4">
              <TextInstrument className="text-[11px] font-light tracking-[0.2em] text-va-black/20 uppercase">
                <VoiceglotText translationKey="portfolio.studio.setup" defaultText="Studio setup" />
              </TextInstrument>
              {data.tier_config.showStudioSpecs ? (
                <TextInstrument className="text-[14px] text-va-black/40 font-light leading-relaxed">
                  {data.studio_specs.microphone && <span>{data.studio_specs.microphone} <br /></span>}
                  {data.studio_specs.interface && <span>{data.studio_specs.interface} <br /></span>}
                  {data.studio_specs.preamp && <span>{data.studio_specs.preamp} <br /></span>}
                  {data.studio_specs.booth && <span>{data.studio_specs.booth} <br /></span>}
                  {data.tier_config.showConnectivity && (
                    <span className="flex flex-wrap gap-2 mt-2">
                      {data.connectivity.source_connect && <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">SourceConnect</span>}
                      {data.connectivity.zoom && <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Zoom</span>}
                      {data.connectivity.cleanfeed && <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Cleanfeed</span>}
                      {data.connectivity.session_link && <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">SessionLink</span>}
                    </span>
                  )}
                </TextInstrument>
              ) : (
                <TextInstrument className="text-[12px] text-va-black/20 italic font-light">
                  <VoiceglotText translationKey="portfolio.studio.locked" defaultText="Studio details beschikbaar voor premium leden." />
                </TextInstrument>
              )}
            </ContainerInstrument>
          </BentoCard>

          {/* Portfolio Showcase (The Brands) */}
          {data.portfolio_videos.length > 0 && (
            <BentoCard id="portfolio-showcase" span="full" className="bg-white p-20 rounded-[20px] shadow-aura border border-black/[0.02]">
              <ContainerInstrument className="max-w-2xl mb-20">
                <HeadingInstrument level={2} className="text-6xl md:text-7xl font-extralight tracking-tighter leading-none mb-10 text-va-black">
                  <VoiceglotText translationKey="portfolio.showcase.title" defaultText="Werk voor topmerken." />
                </HeadingInstrument>
                <TextInstrument className="text-lg text-va-black/40 font-light leading-relaxed">
                  <VoiceglotText translationKey="portfolio.showcase.subtitle" defaultText="Een selectie van projecten waar ik mijn stem aan mocht lenen." />
                </TextInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {data.portfolio_videos.map((video: any, idx: number) => (
                      <ContainerInstrument key={idx} className="group relative aspect-video rounded-[15px] overflow-hidden shadow-aura-sm border border-black/5 bg-va-off-white transition-all duration-700 hover:shadow-aura-lg hover:-translate-y-1">
                        {video.status === 'pending' && (
                          <ContainerInstrument className="absolute top-2 right-2 z-20 px-2 py-1 bg-amber-500/90 backdrop-blur-md rounded text-[8px] font-light text-white tracking-[0.2em] uppercase flex items-center gap-1">
                            <Clock size={8} /> <VoiceglotText translationKey="common.status.in_review" defaultText="In review" />
                          </ContainerInstrument>
                        )}
                        <Suspense fallback={<ContainerInstrument className="w-full h-full bg-va-black/5 animate-pulse rounded-[15px]" />}>
                          <StudioVideoPlayer 
                            url={video.id} 
                            aspect="video"
                            className="w-full h-full rounded-[15px]"
                          />
                        </Suspense>
                    <ContainerInstrument className="absolute inset-0 bg-va-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6 text-center backdrop-blur-[2px] pointer-events-none">
                      <TextInstrument className="text-white text-[12px] font-light tracking-[0.2em] uppercase leading-tight">
                        {video.title.replace(' Portfolio', '')}
                      </TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </BentoCard>
          )}

          {/* Demos Section */}
          <BentoCard id="demos" span="full" className="bg-white p-20 rounded-[20px] shadow-aura border border-black/[0.02]">
            <ContainerInstrument className="max-w-2xl mb-20">
              <HeadingInstrument level={2} className="text-6xl md:text-7xl font-extralight tracking-tighter leading-none mb-10 text-va-black">
                <VoiceglotText translationKey="portfolio.demos.title" defaultText="De stem die jouw verhaal draagt." />
              </HeadingInstrument>
              <TextInstrument className="text-lg text-va-black/40 font-light leading-relaxed">
                <VoiceglotText translationKey="portfolio.demos.subtitle" defaultText="Luister naar mijn werk. Altijd met de juiste nuance en menselijke klik." />
              </TextInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {actor?.demos?.filter((d: any) => d.status !== 'rejected').map((demo: any, i: number) => (
                <ContainerInstrument 
                  key={i}
                  className="group p-10 rounded-[20px] bg-va-off-white border border-black/[0.03] hover:border-primary/20 hover:bg-white hover:shadow-aura transition-all duration-700 va-bezier flex flex-col justify-between min-h-[250px] cursor-pointer relative overflow-hidden"
                >
                  {demo.status === 'pending' && (
                    <ContainerInstrument className="absolute top-4 right-4 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-light text-amber-600 tracking-[0.2em] uppercase flex items-center gap-1.5">
                      <Clock size={10} /> <VoiceglotText translationKey="common.status.in_review" defaultText="In review" />
                    </ContainerInstrument>
                  )}
                  <ContainerInstrument>
                    <ContainerInstrument className="w-14 h-14 rounded-[12px] bg-white flex items-center justify-center text-va-black/10 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-sm mb-8">
                      <Mic strokeWidth={1.5} size={24} />
                    </ContainerInstrument>
                    <TextInstrument className="font-light tracking-[0.2em] uppercase text-[13px] text-va-black/40 group-hover:text-primary transition-colors mb-3">
                      <VoiceglotText  translationKey={`portfolio.demo.${i}.category`} defaultText={demo.category} />
                    </TextInstrument>
                    <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">
                      <VoiceglotText  translationKey={`portfolio.demo.${i}.title`} defaultText={demo.title} />
                    </HeadingInstrument>
                  </ContainerInstrument>
                  
                  <ContainerInstrument className="flex justify-end">
                    <ContainerInstrument className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-4 group-hover:translate-x-0 border border-primary/10">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </BentoCard>

          {/* Reviews Section */}
          <ContainerInstrument className="md:col-span-3 pt-32">
            <ReviewsInstrument 
              reviews={actor?.reviews || []} 
              title={`${t('voice.reviews.title_prefix', 'Ervaringen met')} ${actor?.display_name}.`}
              subtitle={`${t('voice.reviews.subtitle_prefix', 'Lees waarom klanten kiezen voor het vakmanschap van')} ${actor?.display_name}.`}
              isPortfolio={true}
              averageRating="5.0"
              totalReviews={String(actor?.reviews?.length || 0)}
            />
          </ContainerInstrument>
        </BentoGrid>
      </SectionInstrument>

      {/* FAQ Section */}
      <SectionInstrument className="py-48 bg-va-black text-white relative overflow-hidden">
        <ContainerInstrument className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/*  LOUIS-MANDATE: Portfolio Gallery Integration */}
        {data.portfolio_photos.length > 0 && data.tier_config.showPortfolioPhotos && (
          <ContainerInstrument className="max-w-7xl mx-auto px-6 mb-48 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {data.portfolio_photos.map((photo: any, idx: number) => (
                <ContainerInstrument key={idx} className={cn(
                  "relative aspect-square rounded-[30px] overflow-hidden shadow-aura border border-white/10 group",
                  idx % 3 === 0 ? "md:col-span-2 md:row-span-2" : ""
                )}>
                  <Image src={photo.url} alt={`${data.name} Portfolio ${idx}`} fill className="object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                  <ContainerInstrument className="absolute inset-0 bg-va-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </ContainerInstrument>
              ))}
            </div>
          </ContainerInstrument>
        )}

        <ContainerInstrument className="max-w-5xl mx-auto px-6 relative z-10">
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <ContainerInstrument>
              <HeadingInstrument level={2} className="text-5xl md:text-6xl font-extralight tracking-tighter leading-tight mb-8">
                <VoiceglotText translationKey="portfolio.faq.title" defaultText="Veelgestelde vragen." />
              </HeadingInstrument>
              <TextInstrument className="text-lg text-white/40 font-light leading-relaxed mb-12">
                <VoiceglotText translationKey="portfolio.faq.subtitle" defaultText="Heb je een vraag over een samenwerking, de studio of de levering?" />
              </TextInstrument>
              
              <ContainerInstrument className="space-y-6">
                {[
                  { title: t('portfolio.faq.delivery.title', "Snelle Levering"), desc: t('portfolio.faq.delivery.desc', "Meestal binnen 24 uur in je mailbox."), icon: Clock },
                  { title: t('portfolio.faq.studio.title', "Professionele Studio"), desc: t('portfolio.faq.studio.desc', "Opnames met high-end apparatuur."), icon: Mic },
                  { title: t('portfolio.faq.retakes.title', "Inclusief Retakes"), desc: t('portfolio.faq.retakes.desc', "Kleine aanpassingen in tone-of-voice zijn gratis."), icon: MessageSquare }
                ].map((item, i) => (
                  <ContainerInstrument key={i} className="flex gap-4">
                    <ContainerInstrument className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0 border border-white/10">
                      <item.icon size={18} strokeWidth={1.5} />
                    </ContainerInstrument>
                    <ContainerInstrument>
                      <TextInstrument className="text-[15px] font-light text-white mb-1">{item.title}</TextInstrument>
                      <TextInstrument className="text-[14px] text-white/40 font-light">{item.desc}</TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="bg-white/5 backdrop-blur-xl rounded-[40px] p-12 border border-white/10 shadow-2xl">
              <ContainerInstrument className="space-y-8">
                <ContainerInstrument className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full text-primary text-[10px] font-light tracking-[0.2em] uppercase">
                  <VoiceglotText translationKey="common.faq" defaultText="Faq" />
                </ContainerInstrument>
                <ContainerInstrument className="space-y-8">
                  {[
                    { q: t('portfolio.faq.q1', "Hoe snel heb ik mijn audio?"), a: t('portfolio.faq.a1', "Standaard binnen 24 uur.") },
                    { q: t('portfolio.faq.q2', "Wat is een buyout?"), a: t('portfolio.faq.a2', "Een vergoeding voor het gebruiksrecht.") },
                    { q: t('portfolio.faq.q3', "Zijn retakes inbegrepen?"), a: t('portfolio.faq.a3', "Zeker. Kleine aanpassingen zijn kosteloos.") }
                  ].map((faq, i) => (
                    <ContainerInstrument key={i} className="space-y-2">
                      <TextInstrument className="text-[15px] font-light text-primary">{faq.q}</TextInstrument>
                      <TextInstrument className="text-[14px] text-white/60 font-light leading-relaxed">{faq.a}</TextInstrument>
                    </ContainerInstrument>
                  ))}
                </ContainerInstrument>
                <ButtonInstrument as="a" href={getPortfolioHref('/tarieven')} variant="ghost" className="w-full text-white/40 hover:text-primary transition-colors text-[11px] font-light tracking-[0.2em] uppercase">
                  <VoiceglotText translationKey="portfolio.cta.view_rates" defaultText="Bekijk alle tarieven & details" />
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  VOICES SIGNATURE CTA (LIGHT) */}
      <SectionInstrument id="contact" className="py-64 bg-white relative overflow-hidden border-t border-black/[0.03]">
        <ContainerInstrument className="absolute inset-0 opacity-[0.03] pointer-events-none hmagic" />
        <ContainerInstrument className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <HeadingInstrument level={2} className="text-7xl md:text-9xl font-extralight text-va-black tracking-tighter leading-[0.85] mb-16">
            <VoiceglotText translationKey="portfolio.cta.ready_title" defaultText="Klaar voor jouw verhaal?" />
          </HeadingInstrument>
          <ContainerInstrument className="flex flex-col md:flex-row items-center justify-center gap-12">
            <ButtonInstrument 
              onClick={() => {
                window.dispatchEvent(new CustomEvent(`${actor.slug}:open-configurator`));
              }}
              className="va-btn-pro !rounded-[10px] px-20 py-8 text-xl shadow-aura-lg hover:scale-105 transition-transform duration-500"
            >
              <VoiceglotText translationKey="portfolio.cta.start_project" defaultText="Start een project" />
            </ButtonInstrument>
            {data.tier_config.showContactDetails ? (
              <a href={`tel:${actor.phone || '+32475123456'}`} className="text-va-black/40 hover:text-primary transition-colors font-light tracking-[0.2em] uppercase text-[13px]">
                {t('portfolio.cta.call_direct_prefix', "Bel direct:")} {actor.phone || '+32 475 12 34 56'}
              </a>
            ) : (
              <TextInstrument className="text-va-black/20 font-light tracking-[0.2em] uppercase text-[11px]">
                <VoiceglotText translationKey="portfolio.cta.contact_via_voices" defaultText="Contact via Voices" />
              </TextInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
