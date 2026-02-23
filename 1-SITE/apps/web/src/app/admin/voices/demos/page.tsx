"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument,
  FixedActionDockInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Music, 
  Search,
  GripVertical,
  Play,
  Pause,
  Trash2,
  Plus,
  Filter,
  RefreshCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
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
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 *  DEMO MANAGER (GOD MODE 2026)
 * 
 * Centraal beheer voor alle demo's van alle stemmen.
 * Maakt het mogelijk om demo's te hernoemen, categoriseren en sorteren.
 */

interface DemoRecord {
  id: number;
  actorId: number;
  name: string;
  url: string;
  type: string | null;
  isPublic: boolean;
  menuOrder: number;
  actorName: string;
  actorStatus: string;
}

function SortableDemoRow({ 
  demo, 
  onUpdate, 
  onDelete,
  playingUrl,
  onTogglePlay
}: { 
  demo: DemoRecord; 
  onUpdate: (id: number, updates: Partial<DemoRecord>) => void;
  onDelete: (id: number) => void;
  playingUrl: string | null;
  onTogglePlay: (url: string) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const { playClick } = useSonicDNA();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: demo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPlaying = playingUrl === demo.url;

  const handleInlineSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/actors/demos/${demo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: demo.name,
          category: demo.type,
          isPublic: demo.isPublic
        })
      });
      if (res.ok) {
        playClick('success');
        toast.success(`"${demo.name}" opgeslagen`);
      } else {
        throw new Error('Opslaan mislukt');
      }
    } catch (err) {
      toast.error('Fout bij opslaan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <ContainerInstrument 
        className={`bg-white border border-black/5 p-4 rounded-[20px] flex items-center gap-6 transition-all hover:shadow-aura group ${
          isDragging ? 'shadow-2xl scale-[1.01] ring-primary/20 ring-2' : ''
        }`}
      >
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 text-va-black/10 hover:text-primary transition-colors"
        >
          <GripVertical size={18} strokeWidth={1.5} />
        </div>

        {/* Play Button */}
        <button 
          onClick={() => onTogglePlay(demo.url)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isPlaying ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-va-off-white text-va-black/40 hover:text-primary hover:bg-primary/5'
          }`}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Actor Info */}
        <div className="w-48 hidden md:block">
          <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/20 mb-1">Stem / Context</TextInstrument>
          <div className="flex flex-col">
            <TextInstrument className="text-sm font-bold truncate">{demo.actorName}</TextInstrument>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                demo.actorStatus === 'live' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                {demo.actorStatus === 'live' ? 'Agency Site' : 'Portfolio Only'}
              </span>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div className="flex-1">
          <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/20 mb-1">Label / Titel</TextInstrument>
          <div className="flex items-center gap-2">
            <InputInstrument 
              value={demo.name}
              onChange={(e) => onUpdate(demo.id, { name: e.target.value })}
              onBlur={handleInlineSave}
              className="bg-va-off-white border-none rounded-xl px-4 py-2 w-full text-sm font-medium focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Category Select */}
        <div className="w-40">
          <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/20 mb-1">Categorie</TextInstrument>
          <select 
            value={demo.type || ''}
            onChange={(e) => {
              onUpdate(demo.id, { type: e.target.value });
              // Direct opslaan bij verandering van categorie
              setTimeout(handleInlineSave, 100);
            }}
            className="bg-va-off-white border-none rounded-xl px-4 py-2 w-full text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
          >
            <option value="">Geen</option>
            <option value="commercial">Commercial</option>
            <option value="corporate">Corporate</option>
            <option value="telephony">Telephony</option>
            <option value="e-learning">E-learning</option>
            <option value="animation">Animation</option>
            <option value="demo">General Demo</option>
          </select>
        </div>

        {/* Visibility */}
        <div className="w-24 flex flex-col items-center">
          <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/20 mb-1">Status</TextInstrument>
          <button 
            onClick={() => {
              const newVal = !demo.isPublic;
              onUpdate(demo.id, { isPublic: newVal });
              // Direct opslaan bij toggelen van status
              setTimeout(handleInlineSave, 100);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              demo.isPublic ? 'bg-green-500/10 text-green-600' : 'bg-va-black/5 text-va-black/40'
            }`}
          >
            {isSaving ? <Loader2 size={10} className="animate-spin" /> : (demo.isPublic ? <CheckCircle2 size={10} /> : <Clock size={10} />)}
            {demo.isPublic ? 'Public' : 'Hidden'}
          </button>
        </div>

        {/* Delete */}
        <button 
          onClick={() => onDelete(demo.id)}
          className="p-2 text-va-black/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} strokeWidth={1.5} />
        </button>
      </ContainerInstrument>
    </div>
  );
}

export default function DemoManagerPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { playClick } = useSonicDNA();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actors, setActors] = useState<any[]>([]);
  const [demos, setDemos] = useState<DemoRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [hasChanges, setHasChanges] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/actors');
      const data = await res.json();
      if (data.success) {
        setActors(data.actors);
        const allDemos: DemoRecord[] = [];
        data.actors.forEach((actor: any) => {
          if (actor.demos) {
            actor.demos.forEach((demo: any) => {
              allDemos.push({
                ...demo,
                actorName: `${actor.firstName} ${actor.lastName || ''}`.trim(),
                actorStatus: actor.status
              });
            });
          }
        });
        // Sort by actor name and then menu order
        allDemos.sort((a, b) => a.actorName.localeCompare(b.actorName) || a.menuOrder - b.menuOrder);
        setDemos(allDemos);
      }
    } catch (error) {
      toast.error('Fout bij laden demo\'s');
    } finally {
      setLoading(false);
    }
  };

  const filteredDemos = useMemo(() => {
    return demos.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                           d.actorName.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || d.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [demos, search, filterType]);

  const handleUpdate = (id: number, updates: Partial<DemoRecord>) => {
    setDemos(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    setHasChanges(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Weet je zeker dat je deze demo wilt verwijderen?')) {
      setDemos(prev => prev.filter(d => d.id !== id));
      setHasChanges(true);
      playClick('pop');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDemos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update menuOrder for the moved items
        return newItems.map((item, index) => ({ ...item, menuOrder: index }));
      });
      setHasChanges(true);
      playClick('success');
    }
  };

  const handleTogglePlay = (url: string) => {
    if (audio && playingUrl === url) {
      audio.pause();
      setPlayingUrl(null);
      return;
    }

    if (audio) {
      audio.pause();
    }

    const newAudio = new Audio(url);
    newAudio.play();
    newAudio.onended = () => setPlayingUrl(null);
    setAudio(newAudio);
    setPlayingUrl(url);
    playClick('pop');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    playClick('pro');
    
    try {
      // CHRIS-PROTOCOL: We groeperen de demo's per acteur om ze via de bestaande actor API op te slaan
      // Maar we kunnen nu ook de specifieke demo API gebruiken voor individuele updates
      const updatePromises = demos.map(demo => 
        fetch(`/api/admin/actors/demos/${demo.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: demo.name,
            category: demo.type,
            isPublic: demo.isPublic
          })
        })
      );

      const results = await Promise.all(updatePromises);
      const allOk = results.every(r => r.ok);

      if (allOk) {
        toast.success('Alle wijzigingen opgeslagen!');
        setHasChanges(false);
        playClick('success');
      } else {
        throw new Error('Sommige demo\'s konden niet worden opgeslagen');
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      toast.error(`Fout bij opslaan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-[1400px] mx-auto">
        {/* Header */}
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            Terug naar Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                Demo Management
              </div>
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
                Alle demo&#39;s
              </HeadingInstrument>
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Hernoem, categoriseer en sorteer alle demo&#39;s van alle stemmen op één centrale plek.
              </TextInstrument>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
                <InputInstrument 
                  type="text" 
                  placeholder="Zoek op naam of stem..."
                  className="bg-white border border-black/5 rounded-[15px] pl-12 pr-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all w-80 shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="relative">
                <Filter strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-black/5 rounded-[15px] pl-12 pr-10 py-4 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all shadow-sm appearance-none cursor-pointer min-w-[180px]"
                >
                  <option value="all">Alle types</option>
                  <option value="commercial">Commercial</option>
                  <option value="corporate">Corporate</option>
                  <option value="telephony">Telephony</option>
                  <option value="e-learning">E-learning</option>
                  <option value="animation">Animation</option>
                  <option value="demo">General Demo</option>
                </select>
              </div>

              <ButtonInstrument 
                onClick={fetchData}
                variant="outline"
                className="w-14 h-14 rounded-[15px] border-black/5 flex items-center justify-center hover:bg-white transition-all shadow-sm"
              >
                <RefreshCcw size={20} strokeWidth={1.5} className={loading ? 'animate-spin' : ''} />
              </ButtonInstrument>
            </div>
          </div>
        </SectionInstrument>

        {/* Demo List */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredDemos.map(d => d.id)}
            strategy={verticalListSortingStrategy}
          >
            <ContainerInstrument className="grid grid-cols-1 gap-4 mb-32">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-24 bg-white/50 rounded-[20px] animate-pulse border border-black/5" />
                ))
              ) : filteredDemos.length > 0 ? (
                filteredDemos.map((demo) => (
                  <SortableDemoRow 
                    key={demo.id} 
                    demo={demo} 
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    playingUrl={playingUrl}
                    onTogglePlay={handleTogglePlay}
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-white/50 rounded-[32px] border border-dashed border-black/10">
                  <Music size={48} className="mx-auto text-va-black/10 mb-4" />
                  <TextInstrument className="text-va-black/40 font-medium">Geen demo&#39;s gevonden die voldoen aan je zoekopdracht.</TextInstrument>
                </div>
              )}
            </ContainerInstrument>
          </SortableContext>
        </DndContext>

        {/* Save Dock */}
        {hasChanges && (
          <FixedActionDockInstrument>
            <ContainerInstrument plain className="flex items-center gap-6">
              <div className="flex flex-col">
                <TextInstrument className="text-[10px] font-black uppercase tracking-[0.2em] text-va-black/40">Ongepubliceerde wijzigingen</TextInstrument>
                <TextInstrument className="text-sm font-bold text-primary">Je hebt demo&#39;s aangepast</TextInstrument>
              </div>
              
              <div className="flex items-center gap-3">
                <ButtonInstrument 
                  onClick={() => {
                    setHasChanges(false);
                    fetchData();
                  }}
                  variant="outline"
                  className="!rounded-full !px-8 !py-3 border-black/10 hover:bg-va-black/5"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest">Annuleren</span>
                </ButtonInstrument>
                
                <ButtonInstrument 
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="!bg-va-black !text-white !rounded-full !px-10 !py-3 flex items-center gap-2 shadow-xl shadow-va-black/20 hover:scale-105 transition-all"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span className="text-[11px] font-black uppercase tracking-widest">Wijzigingen Opslaan</span>
                </ButtonInstrument>
              </div>
            </ContainerInstrument>
          </FixedActionDockInstrument>
        )}
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
