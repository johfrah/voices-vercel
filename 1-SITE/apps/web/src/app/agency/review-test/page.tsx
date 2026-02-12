import { HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import React from 'react';
import { AudioReviewDashboard } from '@/components/audio/AudioReviewDashboard';
import GlobalNav from '@/components/ui/GlobalNav';
import GlobalFooter from '@/components/ui/GlobalFooter';

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
          <TextInstrument as="span" className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            Spotlight Feature Preview
          </TextInstrument>
          <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter text-gray-900 mb-4">
            Audio Review <TextInstrument as="span" className="text-primary">Engine</TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-xl text-gray-500 max-w-2xl">
            Test hier de interactieve feedback loop. Pas de muziekbalans aan, 
            bekijk de geanimeerde waveform en simuleer de Dropbox-export.
          </TextInstrument>
        </div>

        <AudioReviewDashboard 
          orderId="8842"
          projectName="Astra Corporate Explainer"
          voiceUrl="/assets/temp/voice-sample.mp3"
          musicUrl="/assets/temp/music-sample.mp3"
        />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-12">
          <div>
            <HeadingInstrument level={3} className="text-lg font-bold text-gray-900 mb-4">Hoe werkt dit?</HeadingInstrument>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li className="flex gap-3">
                <TextInstrument as="span" className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">1</TextInstrument>
                <TextInstrument as="span">De <strong>Smart Mix</strong> slider stuurt live opdrachten naar de backend (FFMPEG) om de ducking-intensiteit aan te passen.</TextInstrument>
              </li>
              <li className="flex gap-3">
                <TextInstrument as="span" className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">2</TextInstrument>
                <TextInstrument as="span">De <strong>Sonic DNA Waveform</strong> visualiseert de audio en reageert op interacties.</TextInstrument>
              </li>
              <li className="flex gap-3">
                <TextInstrument as="span" className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">3</TextInstrument>
                <TextInstrument as="span">Bij <strong>Goedkeuring</strong> wordt de finale mastering chain toegepast en gesynct naar Dropbox.</TextInstrument>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
            <HeadingInstrument level={3} className="text-lg font-bold text-gray-900 mb-2">Core Mandaat</HeadingInstrument>
            <TextInstrument className="text-sm text-gray-500 leading-relaxed">
              Dit is een 100% Next.js implementatie. Er wordt geen PHP gebruikt voor de rendering of de audio-logica. 
              De data-bridge communiceert direct met de Node.js services.
            </TextInstrument>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </main>
  );
}
