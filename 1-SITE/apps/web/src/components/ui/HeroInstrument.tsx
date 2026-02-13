"use client";

import Link from "next/link";
import Image from "next/image";
import React from 'react';
import { VoiceglotText } from "./VoiceglotText";
import { MarketManager } from "@config/market-manager";

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from "./LayoutInstruments";

/**
 * HERO INSTRUMENT
 * 
 * De eerste indruk van de frontpage.
 * Volgt de Voices-Mix: Vivid Presence + 20px rond.
 */
export const HeroInstrument: React.FC = () => {
  const market = MarketManager.getCurrentMarket();
  const isPortfolio = market.market_code === 'JOHFRAH';
  const ctaHref = isPortfolio ? '/#demos' : '/agency';

  return (
    <ContainerInstrument className="va-hero-container relative overflow-hidden py-16 md:py-32">
      <ContainerInstrument className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <ContainerInstrument className="relative z-10">
          <ContainerInstrument className="va-hero-badge inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-[20px] text-primary text-[15px] md:text-[15px] font-light tracking-widest border border-primary/10 mb-6 md:mb-8 ">
            <Image  src="/assets/common/branding/icons/INFO.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} /> <VoiceglotText  translationKey="home.hero.badge" defaultText="De beste stemmen van de Benelux" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-4xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black mb-6 md:mb-8">
            <VoiceglotText  translationKey="home.hero.title_part1" defaultText="Vind de " />
            <TextInstrument as="span" className="text-primary italic font-light">
              <VoiceglotText  translationKey="home.hero.title_highlight" defaultText="stem" />
            </TextInstrument>
            <br />
            <VoiceglotText  translationKey="home.hero.title_part2" defaultText="voor jouw verhaal." />
          </HeadingInstrument>
          <TextInstrument className="text-lg md:text-2xl font-light text-va-black/40 leading-tight tracking-tight max-w-lg mb-8 md:mb-12">
            <VoiceglotText  translationKey="home.hero.subtitle" defaultText="Van bedrijfsfilm tot commercial. Wij vinden de beste stem voor jouw boodschap." />
          </TextInstrument>
          <ContainerInstrument className="flex items-center gap-4">
            <ButtonInstrument 
              as={Link}
              href={ctaHref} 
              className="va-btn-pro !px-8 md:!px-10 !py-4 md:!py-6 text-base !rounded-[10px] "
            >
              <VoiceglotText  translationKey="home.hero.cta_primary" defaultText={isPortfolio ? "Bekijk mijn stemmen" : "Vind jouw stem"} />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg group">
          <Image  
            src="/assets/voices-photo.jpg" 
            alt="Voices Artist"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
