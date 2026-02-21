"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { cleanText } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { BentoCard } from '../BentoGrid';

import { useTranslation } from '@/contexts/TranslationContext';

interface WorkshopProgramProps {
  dagindeling?: string;
  image?: string;
}

export const WorkshopProgram: React.FC<WorkshopProgramProps> = ({ dagindeling, image }) => {
  const { t } = useTranslation();
  return (
    <BentoCard span="lg" className="bg-va-off-white p-12">
      <h3 className="text-3xl font-light tracking-tight mb-10">
        <VoiceglotText  translationKey="workshop.program.title" defaultText="Programma van de dag" />
      </h3>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="prose prose-base prose-black max-w-none text-black/70 font-light leading-relaxed">
          {dagindeling ? (
            <div className="whitespace-pre-line">
              <VoiceglotText translationKey={`workshop.program.content.${dagindeling.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}`} defaultText={cleanText(dagindeling)} />
            </div>
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
            alt={t('common.program', "Programma")}
            fill
            className="object-cover grayscale"
          />
        </div>
      </div>
    </BentoCard>
  );
};
