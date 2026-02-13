import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Construction, Mic, Star, Zap } from "lucide-react";
import Link from "next/link";

export default function LiteFrontpage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SpotlightDashboard />

      {/* Hero Section - Lite Version */}
      <div className="mb-32 space-y-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/10 ">
          <Construction size={12} className="animate-pulse" /> 
          <VoiceglotText translationKey="lite.badge" defaultText="Voices in Aanbouw" />
        </div>
        <h1 className="text-7xl md:text-[120px] font-light leading-[0.85] tracking-tighter max-w-5xl ">
          <VoiceglotText translationKey="lite.title.part1" defaultText="De" /> <span className="text-primary"><VoiceglotText translationKey="lite.title.highlight" defaultText="vriendelijkste" /></span> <br/>
          <VoiceglotText translationKey="lite.title.part2" defaultText="Stemmen-Ervaring." />
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-12 pt-4">
          <p className="text-xl text-va-black/60 max-w-md font-light leading-relaxed">
            <VoiceglotText 
              translationKey="lite.intro" 
              defaultText="We bouwen momenteel aan het meest intelligente stemmen-ecosysteem van 2026. Binnenkort openen we de deuren van ons vernieuwde platform." 
            />
          </p>
          <div className="flex gap-4">
            <Link strokeWidth={1.5} href="/agency" className="va-btn-pro !px-10 !py-6 text-base font-light tracking-widest"><VoiceglotText translationKey="lite.cta" defaultText="Bekijk Stemmen" /></Link>
          </div>
        </div>
      </div>

      {/* Bento Grid - Lite Features */}
      <BentoGrid className="mb-32">
        <BentoCard span="xl" className="h-[400px] flex flex-col justify-between group overflow-hidden relative p-12 bg-va-black text-white !rounded-[20px]">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-primary rounded-[20px] flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/20">
              <Mic size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-5xl font-light tracking-tighter mb-6 leading-none text-primary ">
              <VoiceglotText translationKey="lite.feature1.title" defaultText="Voices Platform" />
            </h3>
            <p className="text-white/50 font-light max-w-sm text-lg">
              <VoiceglotText translationKey="lite.feature1.text" defaultText="Een actieve, geautomatiseerde verkoper die 24/7 voor u klaarstaat." />
            </p>
          </div>
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/20 transition-all duration-1000" />
        </BentoCard>

        <div className="grid grid-cols-1 gap-8">
          <BentoCard span="sm" className="bg-white border border-black/5 p-8 flex flex-col justify-between h-[184px] shadow-sm !rounded-[20px]">
            <div>
              <Zap strokeWidth={1.5} className="text-primary mb-4" size={24} />
              <h3 className="text-xl font-light tracking-tight mb-2 ">
                <VoiceglotText translationKey="lite.feature2.title" defaultText="Snelheid" />
              </h3>
              <p className="text-va-black/40 text-[15px] font-light leading-relaxed">
                <VoiceglotText translationKey="lite.feature2.text" defaultText="Geleverd binnen 24 uur, direct in uw inbox." />
              </p>
            </div>
          </BentoCard>

          <BentoCard span="sm" className="hmagic text-white p-8 flex flex-col justify-between h-[184px] !rounded-[20px]">
            <div>
              <Star strokeWidth={1.5} className="mb-4 text-white" size={24} />
              <h3 className="text-xl font-light tracking-tight mb-2 ">
                <VoiceglotText translationKey="lite.feature3.title" defaultText="Kwaliteit" />
              </h3>
              <p className="text-white/80 text-[15px] font-light leading-relaxed">
                <VoiceglotText translationKey="lite.feature3.text" defaultText="Alleen de beste stemmen, handmatig geselecteerd." />
              </p>
            </div>
          </BentoCard>
        </div>
      </BentoGrid>

      {/* Status Bento */}
      <BentoCard span="full" className="bg-va-off-white p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-black/5 mb-32 !rounded-[20px]">
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-4xl font-light tracking-tighter ">
            <VoiceglotText translationKey="lite.status.title" defaultText="Blijf op de" /> <span className="text-primary"><VoiceglotText translationKey="lite.status.highlight" defaultText="hoogte" /></span>
          </h2>
          <p className="text-va-black/40 font-light">
            <VoiceglotText translationKey="lite.status.text" defaultText="Laat je e-mail achter voor exclusieve toegang tot de launch." />
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-4">
          <input 
            type="email" 
            placeholder="jouw@email.com" 
            className="flex-1 md:w-80 px-8 py-6 rounded-[10px] bg-white border border-black/5 font-light focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <button className="va-btn-pro !px-10 font-light tracking-widest"><VoiceglotText translationKey="lite.status.cta" defaultText="Launch Alert" /></button>
        </div>
      </BentoCard>

      {/* Footer Lite */}
      <div className="text-center py-20 border-t border-black/5">
        <p className="text-[15px] font-light tracking-[0.3em] text-va-black/20 "><VoiceglotText translationKey="auto.litefrontpage.voices__copy__2026.44a3a4" defaultText="Voices &copy; 2026" /></p>
      </div>

      {/* LLM Context Layer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Voices Lite",
        "description": "Voices is currently under construction",
        "data-voices-context": "Landing",
        "data-voices-intent": "Waiting",
        "_llm_context": {
          "intent": "wait_for_launch",
          "persona": "visitor"
        }
      })}} />
    </main>
  );
}
