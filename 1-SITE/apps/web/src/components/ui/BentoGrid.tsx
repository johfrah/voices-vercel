"use client";

import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from "@/lib/utils";
import { matTrack } from '@/lib/mat-intelligence';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Lock, Maximize2, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  columns?: number;
  id?: string;
}

export function BentoGrid({ children, className, columns = 3, id }: BentoGridProps) {
  const { isEditMode } = useEditMode();
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <ContainerInstrument className={cn(
      "grid gap-6 md:gap-8",
      isEditMode && "edit-mode-section p-8 rounded-va-lg bg-va-black/[0.02]",
      gridCols[columns as keyof typeof gridCols] || 'grid-cols-1 md:grid-cols-3',
      className
    )}>
      {isEditMode && (
        <ContainerInstrument className="edit-mode-handle">
          <GripVertical strokeWidth={1.5} size={10} />
          Bento Grid {id && `(${id})`}
        </ContainerInstrument>
      )}
      {children}
    </ContainerInstrument>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: ReactNode;
  icon?: ReactNode;
  id?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  style?: React.CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
}

export function BentoCard({ 
  children, 
  className, 
  span = 'sm',
  title,
  icon,
  id,
  onClick,
  onMouseEnter,
  style,
  dangerouslySetInnerHTML
}: BentoCardProps) {
  const { isEditMode } = useEditMode();
  const { playClick, playSwell } = useSonicDNA();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: id || 'temp-id',
    disabled: !isEditMode 
  });

  const combinedStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
    ...(style || {})
  };

  const spanClasses = {
    sm: 'md:col-span-1',
    md: 'md:col-span-1 lg:col-span-1',
    lg: 'md:col-span-2',
    xl: 'md:col-span-2 lg:col-span-2',
    full: 'md:col-span-3'
  };

  const handleInteraction = (type: 'click' | 'hover') => {
    if (isEditMode) return;
    
    matTrack({
      event: type,
      intent: `bento_card_${id || 'unnamed'}`,
      iapContext: { card_title: typeof title === 'string' ? title : id }
    });
  };

  return (
    <ContainerInstrument 
      plain
      ref={setNodeRef}
      style={combinedStyle}
      onClick={() => {
        handleInteraction('click');
        onClick?.();
      }}
      onMouseEnter={() => {
        handleInteraction('hover');
        onMouseEnter?.();
      }}
      {...(dangerouslySetInnerHTML ? { dangerouslySetInnerHTML } : {})}
      className={cn(
        "rounded-[20px] overflow-hidden transition-all duration-500 relative group/card va-interactive", // Verwijder p-0 hier, we regelen het in LayoutInstruments
        isEditMode && "ring-2 ring-primary/20 hover:ring-primary/50",
        spanClasses[span],
        className
      )}
    >
      {isEditMode && (
        <ContainerInstrument className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <ContainerInstrument 
            {...attributes}
            {...listeners}
            onMouseEnter={() => playSwell()}
            className="bg-va-black text-white p-2.5 rounded-xl hover:bg-primary transition-all shadow-xl active:scale-90 cursor-grab active:cursor-grabbing"
          >
            <GripVertical strokeWidth={1.5} size={12} />
          </ContainerInstrument>
          <ButtonInstrument 
            onMouseEnter={() => playSwell()}
            onClick={() => playClick('lock')}
            className="bg-va-black text-white p-2.5 rounded-xl hover:bg-primary transition-all shadow-xl active:scale-90"
          >
            <Lock strokeWidth={1.5} size={12} />
          </ButtonInstrument>
          <ButtonInstrument 
            onMouseEnter={() => playSwell()}
            onClick={() => playClick('pro')}
            className="bg-va-black text-white p-2.5 rounded-xl hover:bg-primary transition-all shadow-xl active:scale-90"
          >
            <Maximize2 strokeWidth={1.5} size={12} />
          </ButtonInstrument>
          <ButtonInstrument 
            onMouseEnter={() => playSwell()}
            onClick={() => playClick('soft')}
            className="bg-va-black text-white p-2.5 rounded-xl hover:bg-red-500 transition-all shadow-xl active:scale-90"
          >
            <Trash2 strokeWidth={1.5} size={12} />
          </ButtonInstrument>
        </ContainerInstrument>
      )}
      {isEditMode && (
        <ContainerInstrument className="absolute inset-0 bg-primary/5 pointer-events-none border-2 border-primary/20 rounded-[32px]" />
      )}
      {isEditMode && (
        <ContainerInstrument className="absolute bottom-4 left-8 z-20 bg-va-black/80 backdrop-blur-md text-[15px] font-black text-white px-2 py-1 rounded-md tracking-widest opacity-0 group-hover/card:opacity-100 transition-opacity"><VoiceglotText  translationKey="auto.bentogrid.cvr__4_2____beheer__.aa342c" defaultText="CVR: 4.2% • Beheer: Kwaliteit" /></ContainerInstrument>
      )}
      {(title || icon) && (
        <ContainerInstrument plain className="px-8 pt-8 flex items-center gap-3">
          {icon && <ContainerInstrument plain className="text-primary">{icon}</ContainerInstrument>}
          {title && <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest opacity-30">{title}</HeadingInstrument>}
        </ContainerInstrument>
      )}
      {children}
    </ContainerInstrument>
  );
}
