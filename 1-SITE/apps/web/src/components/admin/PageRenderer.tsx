"use client";

import { DnDOrchestrator } from "@/components/admin/DnDOrchestrator";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument
} from "@/components/ui/LayoutInstruments";
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import React, { useEffect, useState } from 'react';

interface PageRendererProps {
  slug: string;
  initialLayout: any;
}

/**
 * 🎨 DYNAMIC PAGE RENDERER (CLIENT-SIDE FOR DND)
 * Dit component rendert de Bento Blueprint en beheert de Drag-and-Drop interacties.
 */
export const PageRenderer: React.FC<PageRendererProps> = ({ slug, initialLayout }) => {
  const { isEditMode } = useEditMode();
  const { playClick } = useSonicDNA();
  const [layout, setLayout] = useState(initialLayout);

  // Zorg dat elke kaart een stabiele ID heeft voor DnD
  useEffect(() => {
    if (layout?.layoutJson?.sections) {
      const updatedSections = layout.layoutJson.sections.map((section: any, sIdx: number) => ({
        ...section,
        id: section.id || `section-${sIdx}`,
        cards: section.cards?.map((card: any, cIdx: number) => ({
          ...card,
          id: card.id || `card-${sIdx}-${cIdx}`
        }))
      }));
      setLayout({
        ...layout,
        layoutJson: { ...layout.layoutJson, sections: updatedSections }
      });
    }

    // Luister naar widget drops vanuit de Architect
    const handleAddWidget = (e: any) => {
      const { type, targetId } = e.detail;
      const newSections = [...layout.layoutJson.sections];
      
      // Zoek de sectie waar de widget gedropt is
      const sectionIdx = newSections.findIndex(s => s.id === targetId);
      if (sectionIdx !== -1) {
        const newCard = {
          id: `card-${Date.now()}`,
          type,
          span: 'sm',
          content: type === 'text' ? 'Nieuwe tekst...' : '',
          title: type.toUpperCase()
        };
        newSections[sectionIdx].cards = [...(newSections[sectionIdx].cards || []), newCard];
        
        const newLayout = {
          ...layout,
          layoutJson: { ...layout.layoutJson, sections: newSections }
        };
        setLayout(newLayout);
        playClick('success');
      }
    };

    window.addEventListener('bento:add-widget', handleAddWidget);

    // Luister naar System suggesties
    const handleApplySuggestion = (e: any) => {
      const { suggestion } = e.detail;
      const newSections = [...layout.layoutJson.sections];
      
      suggestion.suggestedChanges.forEach((change: any) => {
        if (change.action === 'resize' && change.cardIndex !== undefined) {
          newSections[change.sectionIndex].cards[change.cardIndex].span = change.targetSpan;
        }
        if (change.action === 'move' && change.cardIndex !== undefined) {
          const cards = [...newSections[change.sectionIndex].cards];
          const [movedCard] = cards.splice(change.cardIndex, 1);
          cards.splice(change.targetPosition, 0, movedCard);
          newSections[change.sectionIndex].cards = cards;
        }
      });

      setLayout({
        ...layout,
        layoutJson: { ...layout.layoutJson, sections: newSections }
      });
      playClick('success');
    };

    window.addEventListener('bento:apply-suggestion', handleApplySuggestion);

    return () => {
      window.removeEventListener('bento:add-widget', handleAddWidget);
      window.removeEventListener('bento:apply-suggestion', handleApplySuggestion);
    };
  }, [layout, playClick]);

  const handleReorderCards = async (sectionIdx: number, newCards: any[]) => {
    const newSections = [...layout.layoutJson.sections];
    newSections[sectionIdx].cards = newCards;
    
    const newLayout = {
      ...layout,
      layoutJson: { ...layout.layoutJson, sections: newSections }
    };
    
    setLayout(newLayout);

    // TODO: Atomic Sync naar de database
    try {
      await fetch('/api/admin/pages/update-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, layoutJson: newLayout.layoutJson })
      });
    } catch (error) {
      console.error('Failed to sync layout:', error);
    }
  };

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-20 space-y-6">
        <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter"><VoiceglotText  
            translationKey={`page.${slug}.title`} 
            defaultText={layout.title || 'Nieuwe Pagina'} 
          /></HeadingInstrument>
      </SectionInstrument>

      {layout.layoutJson?.sections?.map((section: any, sIdx: number) => (
        <DnDOrchestrator strokeWidth={1.5} 
          key={section.id || sIdx}
          items={section.cards || []}
          onReorder={(newCards) => handleReorderCards(sIdx, newCards)}
          onAdd={() => {}}
        >
          <BentoGrid strokeWidth={1.5} columns={section.columns || 3} className="mb-12" id={section.id}>
            {section.cards?.map((card: any, cIdx: number) => (
              <BentoCard 
                key={card.id || cIdx} 
                id={card.id}
                span={card.span || 'sm'} 
                title={card.title}
                className={card.className}
              >
                <ContainerInstrument className="p-8">
                  {card.type === 'text' && (
                    <VoiceglotText  
                      translationKey={`page.${slug}.section.${sIdx}.card.${cIdx}.text`} 
                      defaultText={card.content || 'Voeg tekst toe...'} 
                      as="p"
                      className="text-lg opacity-60"
                    />
                  )}
                  {/* Meer types zoals video, cta, etc. kunnen hier worden toegevoegd */}
                </ContainerInstrument>
              </BentoCard>
            ))}
          </BentoGrid>
        </DnDOrchestrator>
      ))}

      {/* LLM Context Layer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": layout.title,
        "_llm_context": {
          "slug": slug,
          "iap_context": layout.iapContext
        }
      })}} />
    </PageWrapperInstrument>
  );
};
