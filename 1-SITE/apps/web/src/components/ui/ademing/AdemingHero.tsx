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
              defaultText="Hoi, ik ben Julie. Samen met Johfrah maakten we Ademing—een zachte plek waar je even mag thuiskomen bij jezelf. Of je nu 5 minuten hebt of een half uur, er is altijd ruimte voor jouw moment." 
            />
          </p>

          {/* CTA Button - original shadow-soft and rounded-full */}
          <div className="flex justify-center pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button 
              className="bg-primary text-white px-10 py-5 rounded-full text-xl font-medium shadow-soft hover:shadow-medium hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-4 group"
            >
              <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <VoiceglotText 
                translationKey="hero.cta.text" 
                defaultText="Start je persoonlijke reis" 
              />
            </button>
          </div>

          {/* Social proof - literal replication of kelder avatars */}
          <div className="pt-16 flex flex-wrap items-center justify-center gap-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-6 bg-white/40 backdrop-blur-md px-8 py-4 rounded-full border border-primary/5 shadow-soft">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-4 border-background shadow-soft flex items-center justify-center text-[10px] font-bold text-primary/40" 
                  >
                    <img src={`/assets/ademing/user-${i}.jpg`} alt="" className="w-full h-full object-cover rounded-full" />
                  </div>
                ))}
              </div>
              <span className="text-lg font-medium">
                <VoiceglotText 
                  translationKey="hero.social.users" 
                  defaultText="Meer dan 500 mensen vonden hun rust" 
                />
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-8 py-4 rounded-full border border-primary/5 shadow-soft">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-lg font-medium">
                <VoiceglotText 
                  translationKey="hero.social.meditations" 
                  defaultText="50+ liefdevolle meditaties" 
                />
              </span>
            </div>
          </div>

          {/* Quote van Julie - original italic style */}
          <div className="pt-16 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <p className="text-xl italic text-muted-foreground/80 leading-relaxed font-serif">
              <VoiceglotText 
                translationKey="hero.quote.text" 
                defaultText="Meditatie hoeft niet perfect te zijn. Het gaat erom dat je er bent, voor jezelf. En dat mag op jouw manier." 
              />
            </p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
              <VoiceglotText 
                translationKey="hero.quote.author" 
                defaultText="— Julie" 
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
