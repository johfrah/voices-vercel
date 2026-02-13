"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { BentoCard } from '../BentoGrid';

interface WorkshopProgramProps {
  dagindeling?: string;
  image?: string;
}

export const WorkshopProgram: React.FC<WorkshopProgramProps> = ({ dagindeling, image }) => {
  return (
    <BentoCard span="lg" className="bg-va-off-white p-12">
      <h3 className="text-3xl font-black tracking-tight mb-10">
        <VoiceglotText translationKey="workshop.program.title" defaultText="Programma van de dag" />
      </h3>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="prose prose-sm prose-black max-w-none text-black/60 font-medium leading-relaxed">
          {dagindeling ? (
            <div dangerouslySetInnerHTML={{ __html: dagindeling }} />
          ) : (
            <ul className="space-y-4 list-none p-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="flex gap-4">
                  <CheckCircle2 strokeWidth={1.5} className="text-primary shrink-0" size={20} />
                  <span>
                    <VoiceglotText 
                      translationKey={`workshop.program.step${i}`} 
                      defaultText={`Programma stap ${i}...`} 
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative rounded-[32px] overflow-hidden aspect-square md:aspect-auto">
          <Image 
            src={image || "/assets/studio/programma.jpg"} 
            alt="Programma"
            fill
            className="object-cover grayscale"
          />
        </div>
      </div>
    </BentoCard>
  );
};
