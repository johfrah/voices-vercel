"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, InputInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { CheckCircle2, Clock, MoreVertical, Save, GripVertical } from 'lucide-react';

interface SortableActorRowProps {
  actor: any;
  isEditMode: boolean;
  onStatusToggle: (id: number) => void;
  onPriceChange: (id: number, val: string) => void;
  onSave: (actor: any) => void;
  onEdit: () => void;
  playClick: (type: any) => void;
}

export const SortableActorRow: React.FC<SortableActorRowProps> = ({ 
  actor, 
  isEditMode, 
  onStatusToggle, 
  onPriceChange,
  onSave,
  onEdit,
  playClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: actor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <ContainerInstrument 
        className={`bg-white border border-black/5 p-6 rounded-[20px] flex items-center gap-8 transition-all hover:shadow-aura group ${
          isEditMode ? 'ring-2 ring-primary/5 hover:ring-primary/20' : ''
        } ${isDragging ? 'shadow-2xl scale-[1.02] ring-primary/20 ring-2' : ''}`}
      >
        {/* Drag Handle */}
        {isEditMode && (
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-va-black/20 hover:text-primary transition-colors"
          >
            <GripVertical size={20} strokeWidth={1.5} />
          </div>
        )}

        {/* Avatar & Basic Info */}
        <ContainerInstrument className="w-16 h-16 bg-va-off-white rounded-[10px] flex items-center justify-center font-light text-va-black/20 text-xl overflow-hidden relative">
          {actor.photo_url ? (
            <Image src={actor.photo_url} alt="" fill className="object-cover" />
          ) : (
            actor.firstName?.charAt(0) || '?'
          )}
        </ContainerInstrument>

        <ContainerInstrument className="flex-1">
          <ContainerInstrument className="flex items-center gap-2">
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight">
              {actor.firstName} {actor.lastName}
            </HeadingInstrument>
            <TextInstrument as="span" className="text-[15px] font-light text-va-black/20 tracking-widest">#{actor.wpProductId || actor.id}</TextInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-light text-primary tracking-[0.2em] mt-1 uppercase">
            {actor.nativeLang} native
          </TextInstrument>
        </ContainerInstrument>

        {/* Status */}
        <ContainerInstrument 
          onClick={() => onStatusToggle(actor.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            isEditMode ? 'cursor-pointer hover:scale-105' : 'pointer-events-none'
          } ${
            actor.status === 'live' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
          }`}
        >
          {actor.status === 'live' ? <CheckCircle2 strokeWidth={1.5} size={14} /> : <Clock strokeWidth={1.5} size={14} />}
          <TextInstrument as="span" className="text-[15px] font-light tracking-widest uppercase">{actor.status}</TextInstrument>
        </ContainerInstrument>

        {/* Price */}
        <ContainerInstrument className="w-32">
          <TextInstrument className="text-[11px] font-light text-va-black/30 tracking-widest mb-1 uppercase">Tarief</TextInstrument>
          <ContainerInstrument className={`flex items-center gap-1 text-lg font-light tracking-tighter transition-all ${
            isEditMode ? 'text-primary' : 'text-va-black'
          }`}>
            {isEditMode ? (
              <InputInstrument 
                type="text" 
                value={actor.priceUnpaid || ''}
                onChange={(e) => onPriceChange(actor.id, e.target.value)}
                onBlur={() => playClick('success')}
                className="bg-primary/5 border-none p-0 w-20 focus:ring-0 text-lg font-light"
              />
            ) : (
              <TextInstrument as="span">{actor.priceUnpaid}</TextInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Score */}
        <ContainerInstrument className="text-right pr-4">
          <TextInstrument className="text-[11px] font-light text-va-black/30 tracking-widest mb-1 uppercase">Score</TextInstrument>
          <ContainerInstrument className="flex items-center gap-2 justify-end">
            <ContainerInstrument className="w-24 h-1.5 bg-va-off-white rounded-full overflow-hidden">
              <ContainerInstrument className="h-full bg-primary" style={{ width: `${Math.min(100, (actor.voiceScore || 10) * 10)}%` }} />
            </ContainerInstrument>
            <TextInstrument as="span" className="text-[15px] font-light">{actor.voiceScore || 10}</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Actions */}
        <ContainerInstrument className="flex gap-2">
          <ButtonInstrument 
            onClick={onEdit}
            className="w-10 h-10 bg-va-black text-white rounded-[10px] flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-va-black/10"
          >
            <Settings strokeWidth={1.5} size={16} />
          </ButtonInstrument>
          {isEditMode && (
            <ButtonInstrument 
              onClick={() => onSave(actor)}
              className="w-10 h-10 bg-primary text-white rounded-[10px] flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-primary/20"
            >
              <Save strokeWidth={1.5} size={16} />
            </ButtonInstrument>
          )}
          <ButtonInstrument className="w-10 h-10 bg-va-off-white text-va-black/20 rounded-[10px] flex items-center justify-center hover:text-va-black transition-all">
            <MoreVertical strokeWidth={1.5} size={16} />
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </div>
  );
};
