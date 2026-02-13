import React from 'react';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { cn } from '@/lib/utils';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Check, Clock, Mic, Scissors, Download } from 'lucide-react';

export type OrderStatus = 'queued' | 'recording' | 'editing' | 'ready' | 'completed';

interface SpatialOrderTrackerProps {
  status: OrderStatus;
  className?: string;
}

/**
 * ⚡ SPATIAL ORDER TRACKER INSTRUMENT
 * 
 * Visualiseert de voortgang van een order via Spatial Growth.
 * Volgt de "Vriendelijke Autoriteit" ToV.
 */
export const SpatialOrderTrackerInstrument = ({ 
  status,
  className 
}: SpatialOrderTrackerProps) => {
  const { playSwell, playClick } = useSonicDNA();
  const steps = [
    { id: 'queued', icon: Clock, label: 'In de wachtrij', key: 'order.status.queued' },
    { id: 'recording', icon: Mic, label: 'In opname', key: 'order.status.recording' },
    { id: 'editing', icon: Scissors, label: 'Montage', key: 'order.status.editing' },
    { id: 'ready', icon: Download, label: 'Klaar voor download', key: 'order.status.ready' },
  ];

  const getCurrentStepIndex = () => {
    if (status === 'completed') return steps.length;
    return steps.findIndex(s => s.id === status);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <ContainerInstrument className={cn("w-full py-12", className)}>
      <ContainerInstrument className="relative flex justify-between">
        {/* Background Line */}
        <ContainerInstrument className="absolute top-1/2 left-0 w-full h-0.5 bg-va-black/5 -translate-y-1/2" />
        
        {/* Progress Line (Spatial Growth) */}
        <ContainerInstrument 
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex || status === 'completed';
          const isActive = index === currentIndex;

          return (
            <ContainerInstrument 
              key={step.id} 
              className="relative z-10 flex flex-col items-center gap-4 group"
              onMouseEnter={() => playSwell()}
              onClick={() => playClick('soft')}
            >
              {/* Node */}
              <ContainerInstrument 
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-aura",
                  isCompleted ? "bg-primary text-white" : 
                  isActive ? "bg-va-black text-white scale-110" : 
                  "bg-white text-va-black/20"
                )}
              >
                {isCompleted ? <Check strokeWidth={1.5} size={20} /> : <Icon strokeWidth={1.5} size={20} />}
              </ContainerInstrument>

              {/* Label */}
              <ContainerInstrument className="absolute top-16 whitespace-nowrap text-center">
                <TextInstrument 
                  className={cn(
                    "text-[15px] font-medium uppercase tracking-widest transition-colors",
                    isActive ? "text-va-black" : "text-va-black/20"
                  )}
                ><VoiceglotText  translationKey={step.key} defaultText={step.label} /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          );
        })}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
