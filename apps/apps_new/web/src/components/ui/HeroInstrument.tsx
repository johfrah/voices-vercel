"use client";

import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from 'react';
import { VoiceglotText } from "./VoiceglotText";

const HERO_IMAGES = [
  {
    url: "/assets/agency/voices/nl/nl/female/kristel-A-216105/kristel-photo.jpg",
    name: "Kristel",
    role: "Stemactrice"
  },
  {
    url: "/assets/agency/voices/be/nl/male/johfrah-A-182508/johfrah-photo.jpg",
    name: "Johfrah Lefebvre",
    role: "Founder & Stemacteur"
  },
  {
    url: "/assets/agency/voices/nl/nl/female/carolina-A-186284/carolina-photo.jpg",
    name: "Carolina",
    role: "Stemactrice"
  }
];

/**
 * HERO INSTRUMENT
 * 
 * De eerste indruk van de frontpage.
 * Volgt de Voices-Mix: Vivid Presence + 20px rond.
 */
export const HeroInstrument: React.FC = () => {
  const market = MarketManager.getCurrentMarket();
  const isPortfolio = market.market_code === 'PORTFOLIO';
  const isArtist = market.market_code === 'ARTIST';
  const isAdeming = market.market_code === 'ADEMING';
  
  const ctaHref = market.hero_cta?.href || (isPortfolio ? '/demos' : isArtist ? '/music' : isAdeming ? '/ademing' : '/agency');
  const ctaText = market.hero_cta?.text || (isPortfolio ? "Bekijk mijn stemmen" : isArtist ? "Listen to my music" : isAdeming ? "Start met luisteren" : "Vind jouw stem");
  
  const [imageIndex, setImageIndex] = React.useState(0);

  // Filter images based on market theme
  const filteredImages = React.useMemo(() => {
    if (market.hero_images && market.hero_images.length > 0) {
      return market.hero_images;
    }
    return HERO_IMAGES;
  }, [market.hero_images]);

  React.useEffect(() => {
    if (filteredImages.length <= 1) return;
    const timer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % filteredImages.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [filteredImages]);

  const currentActor = filteredImages[imageIndex % filteredImages.length];

  return (
    <div className="va-hero-container relative overflow-hidden py-24 md:py-32">
      <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black mb-8">
            <VoiceglotText  translationKey="home.hero.title_part1" defaultText="Vind de" />
            {" "}
            <span className="text-primary italic">
              <VoiceglotText  translationKey="home.hero.title_highlight" defaultText="stem" />
            </span>
            <br />
            <VoiceglotText  translationKey="home.hero.title_part2" defaultText="voor jouw verhaal." />
          </h1>
          <p className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight max-w-lg mb-12">
            <VoiceglotText  translationKey="home.hero.subtitle" defaultText="Van bedrijfsfilm tot commercial. Wij vinden de beste stem voor jouw boodschap." />
          </p>
          <div className="flex items-center gap-4">
            <Link  href={ctaHref} className="va-btn-pro !px-10 !py-6 text-base !rounded-[10px]"><VoiceglotText  translationKey="home.hero.cta_primary" defaultText={ctaText} /></Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg group bg-va-off-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={imageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }} //  Zachte fade van 2 seconden
              className="absolute inset-0"
            >
              <Image  
                src={currentActor.url} 
                alt={currentActor.name}
                fill
                className="object-cover"
                priority
              />
              
              {/*  ACTOR LABEL (Progressive Disclosure) */}
              <div className="absolute bottom-8 left-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-[15px] shadow-sm border border-black/[0.03]">
                  <p className="text-[15px] font-light tracking-tight text-va-black">{currentActor.name}</p>
                  <p className="text-[15px] font-extralight tracking-widest text-black/40 mt-0.5">{currentActor.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
        </div>
      </div>
    </div>
  );
};
