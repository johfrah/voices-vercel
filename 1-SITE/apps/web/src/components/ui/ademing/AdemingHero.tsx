"use client";

import { Play, Sparkles } from "lucide-react";
import { VoiceglotText } from "../VoiceglotText";
import { motion } from "framer-motion";

export const AdemingHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-24 px-6">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center space-y-8">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-relaxed text-foreground">
            <VoiceglotText 
              contentKey="hero.main.title" 
              defaultValue="Welkom bij een moment van rust, voor jezelf" 
            />
          </h1>

          {/* Persoonlijke boodschap */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <VoiceglotText 
              contentKey="hero.main.subtitle" 
              defaultValue="Hoi, ik ben Julie. Samen met Johfrah maakten we Ademing—een zachte plek waar je even mag thuiskomen bij jezelf. Of je nu 5 minuten hebt of een half uur, er is altijd ruimte voor jouw moment." 
            />
          </p>

          {/* CTA Button */}
          <div className="flex justify-center pt-4">
            <button 
              className="bg-primary text-white px-8 py-4 rounded-full text-lg font-medium shadow-soft hover:shadow-medium transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <VoiceglotText 
                contentKey="hero.cta.text" 
                defaultValue="Start je persoonlijke reis" 
              />
            </button>
          </div>

          {/* Social proof */}
          <div className="pt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-background shadow-soft" 
                  />
                ))}
              </div>
              <VoiceglotText 
                contentKey="hero.social.users" 
                defaultValue="Meer dan 500 mensen vonden hun rust" 
              />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <VoiceglotText 
                contentKey="hero.social.meditations" 
                defaultValue="50+ liefdevolle meditaties" 
              />
            </div>
          </div>

          {/* Quote van Julie */}
          <div className="pt-8 max-w-2xl mx-auto">
            <p className="text-base italic text-muted-foreground leading-relaxed">
              <VoiceglotText 
                contentKey="hero.quote.text" 
                defaultValue="Meditatie hoeft niet perfect te zijn. Het gaat erom dat je er bent, voor jezelf. En dat mag op jouw manier." 
              />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <VoiceglotText 
                contentKey="hero.quote.author" 
                defaultValue="— Julie" 
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
