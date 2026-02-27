"use client";

import { Play, Sparkles } from "lucide-react";
import { VoiceglotText } from "../VoiceglotText";
import { motion } from "framer-motion";

export const AdemingHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-48 px-6">
      {/* Decorative elements - literal replication of kelder animations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl animate-breathe-glow" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-breathe-glow" style={{ animationDelay: '-2s' }} />
      
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center space-y-16">
          {/* Main heading - exact font and spacing */}
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] text-foreground tracking-tighter animate-fade-in">
            <VoiceglotText 
              translationKey="hero.main.title" 
              defaultText="Welkom bij een moment van rust, voor jezelf" 
            />
          </h1>

          {/* Persoonlijke boodschap - more space and better leading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <VoiceglotText 
              translationKey="hero.main.subtitle" 
              defaultText="Hoi, ik ben Julie. Samen met Johfrah maakten we Ademing—een zachte plek waar je even mag thuiskomen bij jezelf. We bereiden ons voor op de grote lancering, maar je kunt nu alvast kennismaken met onze eerste aflevering: Lente." 
            />
          </p>

          {/* CTA Button - original shadow-soft and rounded-full */}
          <div className="flex justify-center pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button 
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
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
