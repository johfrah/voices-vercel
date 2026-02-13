import React from 'react';
import { WorkshopQuiz } from '@/components/studio/WorkshopQuiz';
import { ContainerInstrument, SectionInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-black pt-24 pb-12">
      <ContainerInstrument>
        <ContainerInstrument className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
            <VoiceglotText translationKey="studio.quiz.title" defaultText="Ontdek jouw stem" />
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            <VoiceglotText 
              translationKey="studio.quiz.subtitle" 
              defaultText="Niet zeker welke workshop bij je past? Beantwoord een paar vragen en we geven je direct advies." 
            />
          </p>
        </ContainerInstrument>

        <ContainerInstrument className="flex justify-center">
          <WorkshopQuiz />
        </ContainerInstrument>
      </ContainerInstrument>
    </main>
  );
}
