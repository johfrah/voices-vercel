"use client";

import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument, FixedActionDockInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { useAdminTracking } from '@/hooks/useAdminTracking';
import {
    ArrowLeft,
    Lock,
    Save,
    Search,
    Unlock,
    Loader2,
    RefreshCcw
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableActorRow } from '@/components/admin/SortableActorRow';

interface ActorRecord {
  id: number;
  wpProductId: number | null;
  firstName: string;
  lastName: string | null;
  status: string;
  priceUnpaid: string | null;
  voiceScore: number | null;
  nativeLang: string | null;
  menuOrder: number;
  photo_url?: string;
}

/**
 *  VOICE MANAGER (GOD MODE 2026)
 * 
 * Beheer-modus voor stemacteurs met Drag-and-Drop sortering.
 */
export default function VoiceManagerPage() {
  const { isEditMode, toggleEditMode } = useEditMode();
  const { playClick } = useSonicDNA();
  const { logAction } = useAdminTracking();
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actors, setActors] = useState<ActorRecord[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

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

  const fetchActors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/actors');
      const data = await res.json();
      if (data.success) {
        setActors(data.actors);
      } else {
        toast.error('Fout bij laden acteurs');
      }
    } catch (error) {
      console.error('Failed to fetch actors:', error);
      toast.error('Netwerkfout bij laden acteurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActors();
  }, []);

  const filteredActors = useMemo(() => {
    return actors.filter(a => 
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toString().includes(search) ||
      a.wpProductId?.toString().includes(search)
    );
  }, [actors, search]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActors((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newItems;
      });
      playClick('success');
    }
  };

  const handleStatusToggle = async (id: number) => {
    if (!isEditMode) return;
    playClick('pop');
    const actor = actors.find(a => a.id === id);
    if (!actor) return;

    const newStatus = actor.status === 'live' ? 'pending' : 'live';
    
    // Optimistic update
    setActors(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

    try {
      const res = await fetch(`/api/admin/actors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`${actor.firstName} is nu ${newStatus}`);
    } catch (error) {
      toast.error('Status update mislukt');
      // Revert
      setActors(prev => prev.map(a => a.id === id ? { ...a, status: actor.status } : a));
    }
    
    logAction('toggle_actor_status', { actorId: id, status: newStatus });
  };

  const handlePriceChange = (id: number, val: string) => {
    setActors(prev => prev.map(a => a.id === id ? { ...a, priceUnpaid: val } : a));
    setHasChanges(true);
  };

  const handleSaveActor = async (actor: ActorRecord) => {
    playClick('pro');
    try {
      const res = await fetch(`/api/admin/actors/${actor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_unpaid: actor.priceUnpaid })
      });
      if (!res.ok) throw new Error('Failed to save actor');
      toast.success(`${actor.firstName} opgeslagen`);
    } catch (error) {
      toast.error('Opslaan mislukt');
    }
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    playClick('pro');
    
    const orders = actors.map((a, index) => ({
      id: a.id,
      menuOrder: index + 1
    }));

    try {
      const res = await fetch('/api/admin/actors/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      });
      
      if (res.ok) {
        toast.success('Volgorde opgeslagen!');
        setHasChanges(false);
        playClick('success');
      } else {
        throw new Error('Reorder failed');
      }
    } catch (error) {
      toast.error('Volgorde opslaan mislukt');
    } finally {
      setSaving(false);
    }
    
    logAction('save_actors_reorder');
  };

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter ">
            <VoiceglotText translationKey="admin.voice_manager.title" defaultText="Stemmen" />
          </HeadingInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="flex gap-4 items-center">
          <ContainerInstrument className="relative">
            <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
            <InputInstrument 
              type="text" 
              placeholder="Zoek op naam of ID..."
              className="bg-white border border-black/5 rounded-[10px] pl-12 pr-6 py-4 text-[15px] font-light focus:ring-2 focus:ring-primary/20 transition-all w-80 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </ContainerInstrument>

          <ButtonInstrument 
            onClick={fetchActors}
            variant="outline"
            className="w-12 h-12 rounded-[10px] border-black/5 flex items-center justify-center hover:bg-va-off-white transition-all"
          >
            <RefreshCcw size={18} strokeWidth={1.5} className={loading ? 'animate-spin' : ''} />
          </ButtonInstrument>
          
          <ButtonInstrument 
            onClick={() => {
              playClick('pro');
              toggleEditMode();
            }}
            className={`flex items-center gap-3 px-8 py-4 rounded-[10px] text-[15px] font-light uppercase tracking-widest transition-all shadow-lg ${
              isEditMode 
                ? 'bg-primary text-white shadow-primary/20 scale-105' 
                : 'bg-va-black text-white hover:bg-va-black/80'
            }`}
          >
            {isEditMode ? <Unlock strokeWidth={1.5} size={14} /> : <Lock strokeWidth={1.5} size={14} />}
            {isEditMode ? (
              <VoiceglotText translationKey="admin.edit_mode_on" defaultText="Bewerken AAN" />
            ) : (
              <VoiceglotText translationKey="admin.edit_mode" defaultText="Bewerken" />
            )}
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Actor List with DND */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={filteredActors.map(a => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <ContainerInstrument className="grid grid-cols-1 gap-4">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <ContainerInstrument key={i} className="bg-white border border-black/5 p-6 rounded-[20px] flex items-center gap-8 animate-pulse">
                  <ContainerInstrument className="w-16 h-16 bg-va-off-white rounded-[10px]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-va-off-white rounded-[10px] w-1/4" />
                    <div className="h-4 bg-va-off-white rounded-[10px] w-1/6" />
                  </div>
                  <div className="w-24 h-8 bg-va-off-white rounded-full" />
                  <div className="w-32 h-12 bg-va-off-white rounded-[10px]" />
                  <div className="w-40 h-4 bg-va-off-white rounded-full" />
                </ContainerInstrument>
              ))
            ) : (
              filteredActors.map((actor) => (
                <SortableActorRow 
                  key={actor.id}
                  actor={actor}
                  isEditMode={isEditMode}
                  onStatusToggle={handleStatusToggle}
                  onPriceChange={handlePriceChange}
                  onSave={handleSaveActor}
                  playClick={playClick}
                />
              ))
            )}
          </ContainerInstrument>
        </SortableContext>
      </DndContext>

      {/* Save Order Dock */}
      {isEditMode && hasChanges && (
        <FixedActionDockInstrument>
          <ContainerInstrument plain className="flex items-center gap-4">
            <ButtonInstrument 
              onClick={handleSaveOrder}
              disabled={saving}
              className="va-btn-pro !bg-va-black flex items-center gap-2"
            >
              {saving ? <Loader2 strokeWidth={1.5} className="animate-spin" size={16} /> : <Save strokeWidth={1.5} size={16} />}
              <VoiceglotText translationKey="admin.voices.save_order" defaultText="Nieuwe volgorde opslaan" />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => {
                setHasChanges(false);
                fetchActors();
              }}
              variant="outline"
              className="border-black/10 text-va-black hover:bg-va-black/5"
            >
              <VoiceglotText translationKey="common.cancel" defaultText="Herstellen" />
            </ButtonInstrument>
          </ContainerInstrument>
        </FixedActionDockInstrument>
      )}
    </PageWrapperInstrument>
  );
}
