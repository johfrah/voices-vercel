"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import {
    closestCenter,
    defaultDropAnimationSideEffects,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import React, { useState } from 'react';

interface DnDOrchestratorProps {
  items: any[];
  onReorder: (newItems: any[]) => void;
  onAdd: (type: string, index: number) => void;
  children: React.ReactNode;
}

/**
 *  BENTO DND ORCHESTRATOR
 * Beheer-modus Drag-and-Drop: Beheert de interactie tussen de Architect en de Pagina.
 */
export const DnDOrchestrator: React.FC<DnDOrchestratorProps> = ({ 
  items, 
  onReorder, 
  onAdd, 
  children 
}) => {
  const { playClick, playSwell } = useSonicDNA();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    playClick('soft');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
      playClick('success');
    }

    setActiveId(null);
  };

  return (
    <DndContext strokeWidth={1.5} 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext strokeWidth={1.5} 
        items={items.map(i => i.id)} 
        strategy={rectSortingStrategy}
      >
        {children}
      </SortableContext>
      
      <DragOverlay strokeWidth={1.5} dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeId ? (
          <div className="bg-primary/20 border-2 border-primary border-dashed rounded-2xl p-4 backdrop-blur-md">
            <span className="text-[15px] font-black text-primary">Moving Block...</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
