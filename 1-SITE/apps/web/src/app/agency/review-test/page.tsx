import { HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import React from 'react';
import { AudioReviewDashboard } from '@/components/audio/AudioReviewDashboard';
import GlobalNav from '@/components/ui/GlobalNav';
import GlobalFooter from '@/components/ui/GlobalFooter';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

/**
 * 🚀 SPOTLIGHT PREVIEW: AUDIO PIPELINE (2026)
 * 
 * Deze pagina dient als test-omgeving voor de nieuwe Audio Pipeline interface.
 * Hier kunnen we de Smart Mix, Waveform en Feedback tools live bekijken.
 */

export default function AudioReviewTestPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <GlobalNav />
      
      <div className="max-w-7xl mx-auto pt-32 pb-20 px-6">
        <div className="mb-12">
          <TextInstrument as="span" className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[15px] font-bold tracking-widest mb-4"><VoiceglotText translationKey="auto.page.spotlight_feature_pr.501ec9" defaultText="Spotlight Feature Preview" /></TextInstrument>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter text-va-black mb-4">
            Audio Review <TextInstrument as="span" className="text-primary font-extralight"><VoiceglotText translationKey="auto.page.engine.7bfa30" defaultText="Engine" /></TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-xl text-gray-500 max-w-2xl font-light"><VoiceglotText translationKey="auto.page.test_hier_de_interac.dd28cd" defaultText="Test hier de interactieve feedback loop. Pas de muziekbalans aan, 
            bekijk de geanimeerde waveform en simuleer de Dropbox-export." /></TextInstrument>
        </div>

        <AudioReviewDashboard 
          orderId="8842"
          projectName="Astra Corporate Explainer"
          voiceUrl="/assets/temp/voice-sample.mp3"
          musicUrl="/assets/temp/music-sample.mp3"
        />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-12">
          <div>
            <HeadingInstrument level={3} className="text-lg font-light text-va-black mb-4"><VoiceglotText translationKey="auto.page.hoe_werkt_dit_.8f1504" defaultText="Hoe werkt dit?" /></HeadingInstrument>
            <ul className="space-y-4 text-va-black/60 text-[15px]">
              <li className="flex gap-3">
                <TextInstrument as="span" className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[15px] font-light shrink-0">1</TextInstrument>
                <TextInstrument as="span">De <strong><VoiceglotText translationKey="auto.page.smart_mix.efdf9b" defaultText="Smart Mix" /></strong><VoiceglotText translationKey="auto.page.slider_stuurt_live_o.95f79a" defaultText="slider stuurt live opdrachten naar de backend (FFMPEG) om de ducking-intensiteit aan te passen." /></TextInstrument>
              </li>
              <li className="flex gap-3">
                <TextInstrument as="span" className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[15px] font-light shrink-0">2</TextInstrument>
                <TextInstrument as="span">De <strong><VoiceglotText translationKey="auto.page.sonic_dna_waveform.90d655" defaultText="Sonic DNA Waveform" /></strong><VoiceglotText translationKey="auto.page.visualiseert_de_audi.4d02b0" defaultText="visualiseert de audio en reageert op interacties." /></TextInstrument>
              </li>
              <li className="flex gap-3">
                <TextInstrument as="span" className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[15px] font-light shrink-0">3</TextInstrument>
                <TextInstrument as="span">Bij <strong><VoiceglotText translationKey="auto.page.goedkeuring.d09d55" defaultText="Goedkeuring" /></strong><VoiceglotText translationKey="auto.page.wordt_de_finale_mast.ff3aab" defaultText="wordt de finale mastering chain toegepast en gesynct naar Dropbox." /></TextInstrument>
              </li>
            </ul>
          </div>
          <div className="bg-va-off-white p-8 rounded-[20px] border border-black/5">
            <HeadingInstrument level={3} className="text-lg font-light text-va-black mb-2"><VoiceglotText translationKey="auto.page.core_mandaat.834017" defaultText="Core Mandaat" /><TextInstrument className="text-[15px] text-va-black/40 leading-relaxed font-light"><VoiceglotText translationKey="auto.page.dit_is_een_100__next.743f24" defaultText="Dit is een 100% Next.js implementatie. Er wordt geen PHP gebruikt voor de rendering of de audio-logica. 
              De data-bridge communiceert direct met de Node.js services." /></TextInstrument></HeadingInstrument>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </main>
  );
}
