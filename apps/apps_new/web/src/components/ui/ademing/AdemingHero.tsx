"use client";

import { Play, Sparkles } from "lucide-react";
import { VoiceglotText } from "../VoiceglotText";
import { motion } from "framer-motion";
import { AdemingTrackCard } from "./AdemingTrackCard";
import { 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument 
} from "../LayoutInstruments";

export const AdemingHero = ({ featuredTrack, onTrackClick }: { featuredTrack?: any, onTrackClick?: (track: any) => void }) => {
  return (
    <SectionInstrument className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-48 px-6">
      {/* Decorative elements - literal replication of kelder animations */}
      <ContainerInstrument className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl animate-breathe-glow" />
      <ContainerInstrument className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-breathe-glow" style={{ animationDelay: '-2s' }} />
      
      <ContainerInstrument className="max-w-5xl mx-auto relative">
        <ContainerInstrument className="text-center space-y-16">
          {/* Main heading - exact font and spacing */}
          <HeadingInstrument level={1} className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] text-foreground tracking-tighter animate-fade-in">
            <VoiceglotText 
              translationKey="hero.main.title" 
              defaultText="Welkom bij een moment van rust, voor jezelf" 
            />
          </HeadingInstrument>

          {/* Persoonlijke boodschap - more space and better leading */}
          <TextInstrument className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <VoiceglotText 
              translationKey="hero.main.subtitle" 
              defaultText="Hoi, ik ben Julie. Samen met Johfrah maakten we Ademing—een zachte plek waar je even mag thuiskomen bij jezelf. We bereiden ons voor op de grote lancering, maar je kunt nu alvast kennismaken met onze eerste aflevering: Lente." 
            />
          </TextInstrument>

          {/* Inline Track Card - Replacing CTA Button */}
          <ContainerInstrument className="flex justify-center pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {featuredTrack ? (
              <ContainerInstrument className="max-w-sm w-full">
                <AdemingTrackCard 
                  track={featuredTrack} 
                  onClick={() => onTrackClick?.(featuredTrack)}
                />
              </ContainerInstrument>
            ) : (
              <ButtonInstrument 
                onClick={() => {
                  const element = document.getElementById('meditatie');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-primary text-white px-10 py-5 rounded-full text-xl font-medium shadow-soft hover:shadow-medium hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-4 group"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                <VoiceglotText 
                  translationKey="hero.cta.text" 
                  defaultText="Luister naar Lente" 
                />
              </ButtonInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </SectionInstrument>
  );
};
