"use client";

import { MarketManager } from '@config/market-manager';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Construction, Mail } from "lucide-react";

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

import Image from 'next/image';
import { VoiceglotText } from './VoiceglotText';

/**
 * UNDER CONSTRUCTION PAGE (2026)
 * 
 * Een minimalistisch instrument dat voldoet aan de Zero Laws.
 */
export default function UnderConstruction() {
  const market = MarketManager.getCurrentMarket();
  const { playClick, playSwell } = useSonicDNA();
  const { isAdmin } = useAuth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-va-off-white">
      {/* ⚡ ADMIN BYPASS LINK */}
      {isAdmin && (
        <div className="fixed top-8 right-8 z-50">
          <Link 
            href="/auth/login" 
            className="text-[15px] font-black tracking-widest bg-va-black text-white px-6 py-3 rounded-full hover:bg-primary transition-all shadow-lg"
            onClick={() => playClick('pro')}
          >
            <VoiceglotText translationKey="admin.dashboard.link" defaultText="Admin Dashboard" />
          </Link>
        </div>
      )}
      {/* 🧪 LIQUID BACKGROUND (Tone of Voice) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full hred blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full hblue blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center space-y-12 animate-fade-in">
        {/* LOGO */}
        <div 
          className="group cursor-pointer transition-transform duration-700 hover:scale-105"
          onMouseEnter={() => playSwell()}
          onClick={() => playClick('soft')}
        >
          <Image 
            src={market.logo_url} 
            alt={market.name} 
            width={240}
            height={96}
            className="h-16 md:h-24 w-auto drop-shadow-aura"
          />
        </div>

        {/* BENTO STATUS BOX */}
        <div className="w-full bg-white/80 backdrop-blur-xl border border-black/5 p-12 rounded-[32px] shadow-aura space-y-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/10">
            <Construction size={12} className="animate-pulse" /> <VoiceglotText translationKey="construction.badge" defaultText="Voices in Aanbouw" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-medium leading-tight tracking-tight text-va-black/80">
            <VoiceglotText translationKey="construction.title.part1" defaultText="Binnenkort een nieuwe" /> <br/>
            <span className="text-va-black"><VoiceglotText translationKey="construction.title.part2" defaultText="ervaring voor stemmen." /></span>
          </h1>

          <p className="text-lg text-va-black/40 font-normal leading-relaxed max-w-md mx-auto">
            <VoiceglotText translationKey="construction.subtitle" defaultText="We werken momenteel aan ons platform." /> <br/>
            <VoiceglotText translationKey="construction.cta_text" defaultText="Heb je nu een stem nodig?" />
          </p>

          <div className="pt-4">
            <a 
              href={`mailto:${market.email}`}
              onMouseEnter={() => playSwell()}
              onClick={() => playClick('pro')}
              className="va-btn-pro inline-flex items-center gap-4 !px-12 !py-8 text-lg group"
            >
              <Mail size={24} className="group-hover:rotate-12 transition-transform" />
              {market.email}
            </a>
          </div>
        </div>

        {/* SONIC DNA INDICATOR VERWIJDERD OP VERZOEK */}
      </div>

      {/* LLM Context Layer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Voices Under Construction",
        "description": "Voices is currently under construction",
        "data-voices-context": "Landing",
        "data-voices-intent": "Waiting",
        "_llm_context": {
          "intent": "wait_for_launch",
          "persona": "visitor",
          "market": market.market_code
        }
      })}} />

      {/* 🚪 MAT: VISITOR INTELLIGENCE TRACKER */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const hash = document.cookie.split('; ').find(row => row.startsWith('voices_visitor_hash='))?.split('=')[1];
          if (hash) {
            fetch('/api/marketing/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'pageview',
                pathname: window.location.pathname,
                referrer: document.referrer,
                intent: 'under_construction',
                iapContext: { status: 'waiting', domain: window.location.hostname }
              })
            }).catch(() => {});
          }
        })();
      `}} />
    </main>
  );
}
