"use client";

import { useSonicDNA } from '@/lib/engines/sonic-dna';
import {
    AlertCircle,
    CheckSquare,
    ChevronRight,
    Eye, EyeOff,
    FileText,
    Image as ImageIcon,
    Music,
    Play,
    Plus,
    RefreshCw,
    Search,
    Square,
    Trash2,
    Upload,
    User,
    X,
    Youtube
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument,
  HeadingInstrument,
  InputInstrument,
  SelectInstrument,
  OptionInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '../ui/VoiceglotText';
import { cn } from '@/lib/utils/utils';

interface MediaItem {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  journey: string;
  category: string;
  labels: string[] | null;
  isPublic: boolean;
  isOrphan: boolean;
  relations: { type: string, name: string }[];
  createdAt: string;
}

interface Actor {
  id: number;
  firstName: string;
  lastName: string;
}

export const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [filterJourney, setFilterJourney] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'orphans'>('all');
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const { playClick } = useSonicDNA();

  const fetchMedia = React.useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/backoffice/media?sort=${sortBy}`;
      if (filterJourney !== 'all') url += `&journey=${filterJourney}`;
      if (filterStatus === 'orphans') url += `&filter=orphans`;
      if (selectedActorId) url += `&actorId=${selectedActorId}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.results || []);
        setYoutubeUrl(data.youtubeUrl || null);
      }
    } catch (e) {
      console.error('Failed to fetch media', e);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, filterJourney, filterStatus, selectedActorId, searchQuery]);

  useEffect(() => {
    fetchActors();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const fetchActors = async () => {
    try {
      const res = await fetch('/api/backoffice/actors');
      if (res.ok) {
        const data = await res.json();
        setActors(data);
      }
    } catch (e) {
      console.error('Failed to fetch actors', e);
    }
  };

  const handleYoutubeConvert = async () => {
    if (!selectedActorId || !youtubeUrl) return;
    
    setIsConverting(true);
    playClick('deep');

    try {
      const res = await fetch('/api/backoffice/media/convert-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: selectedActorId, youtubeUrl }),
      });

      if (res.ok) {
        await fetchMedia();
        playClick('light');
        alert('YouTube video is succesvol geconverteerd naar een lokale asset! ');
      } else {
        const err = await res.json();
        alert(`Fout bij conversie: ${err.error}`);
      }
    } catch (e) {
      console.error('Conversion failed', e);
    } finally {
      setIsConverting(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    playClick('deep');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('journey', filterJourney === 'all' ? 'common' : filterJourney);
    formData.append('category', 'uploads');
    formData.append('labels', JSON.stringify(['nieuw']));
    formData.append('isPublic', 'true');

    try {
      const res = await fetch('/api/backoffice/media', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await fetchMedia();
        playClick('light');
      }
    } catch (e) {
      console.error('Upload failed', e);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleVisibility = async (id: number, currentStatus: boolean) => {
    playClick('light');
    const formData = new FormData();
    formData.append('action', 'update-visibility');
    formData.append('id', id.toString());
    formData.append('isPublic', (!currentStatus).toString());

    try {
      const res = await fetch('/api/backoffice/media', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setMedia(media.map(m => m.id === id ? { ...m, isPublic: !currentStatus } : m));
      }
    } catch (e) {
      console.error('Visibility update failed', e);
    }
  };

  const handleBulkVisibility = async (isPublic: boolean) => {
    playClick('deep');
    const formData = new FormData();
    formData.append('action', 'bulk-visibility');
    formData.append('ids', JSON.stringify(selectedIds));
    formData.append('isPublic', isPublic.toString());

    try {
      const res = await fetch('/api/backoffice/media', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setMedia(media.map(m => selectedIds.includes(m.id) ? { ...m, isPublic } : m));
        setSelectedIds([]);
      }
    } catch (e) {
      console.error('Bulk visibility failed', e);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Weet je zeker dat je ${selectedIds.length} bestanden wilt verwijderen?`)) return;
    
    playClick('deep');
    const formData = new FormData();
    formData.append('action', 'bulk-delete');
    formData.append('ids', JSON.stringify(selectedIds));

    try {
      const res = await fetch('/api/backoffice/media', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setMedia(media.filter(m => !selectedIds.includes(m.id)));
        setSelectedIds([]);
      }
    } catch (e) {
      console.error('Bulk delete failed', e);
    }
  };

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playClick('light');
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon   className="text-blue-500"  />;
    if (type.startsWith('audio/')) return <Music className="text-purple-500" strokeWidth={1.5} />;
    if (type.startsWith('video/')) return <Play className="text-red-500" strokeWidth={1.5} />;
    return <FileText className="text-va-black/40" strokeWidth={1.5} />;
  };

  return (
    <ContainerInstrument className="flex flex-col lg:flex-row gap-8">
      {/*  ACTOR SIDEBAR */}
      <ContainerInstrument className="w-full lg:w-64 space-y-6">
        <ContainerInstrument className="bg-white rounded-[20px] shadow-aura p-6 space-y-4 border border-va-black/5">
          <ContainerInstrument className="flex items-center gap-2 text-va-black font-light tracking-widest text-[15px] ">
            <User strokeWidth={1.5} size={16} />
            <VoiceglotText  translationKey="common.voice_actors" defaultText="Stemacteurs" />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-1 max-h-[400px] overflow-y-auto no-scrollbar">
            <ButtonInstrument
              onClick={() => { playClick('light'); setSelectedActorId(null); }}
              className={cn(
                "w-full text-left px-4 py-2 rounded-[10px] text-[15px] font-light transition-all",
                selectedActorId === null ? 'bg-va-black text-white' : 'hover:bg-va-off-white text-va-black/40'
              )}
            >
              <VoiceglotText  translationKey="media.all_media" defaultText="Alle Media" />
            </ButtonInstrument>
            {actors.map(actor => (
              <ButtonInstrument
                key={actor.id}
                onClick={() => { playClick('light'); setSelectedActorId(actor.id); }}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-[10px] text-[15px] font-light transition-all flex items-center justify-between group",
                  selectedActorId === actor.id ? 'bg-primary text-white' : 'hover:bg-va-off-white text-va-black/60'
                )}
              >
                <TextInstrument>{actor.firstName} {actor.lastName}</TextInstrument>
                <ChevronRight size={12} strokeWidth={1.5} className={cn("opacity-0 group-hover:opacity-100 transition-opacity", selectedActorId === actor.id ? 'opacity-100' : '')} />
              </ButtonInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>

        {/* YouTube Section */}
        {selectedActorId && youtubeUrl && (
          <ContainerInstrument className="bg-red-500/5 rounded-[20px] p-6 space-y-4 border border-red-500/10 animate-in fade-in slide-in-from-left duration-500">
            <ContainerInstrument className="flex items-center justify-between">
              <ContainerInstrument className="flex items-center gap-2 text-red-600 font-light tracking-widest text-[15px] ">
                <Youtube size={18} strokeWidth={1.5} />
                YouTube
              </ContainerInstrument>
              {!youtubeUrl.startsWith('local:') && (
                <ButtonInstrument 
                  onClick={handleYoutubeConvert}
                  disabled={isConverting}
                  className="p-2 bg-white text-red-600 rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                  title="Converteer naar lokale asset"
                >
                  <RefreshCw size={14} strokeWidth={1.5} className={isConverting ? 'animate-spin' : ''} />
                </ButtonInstrument>
              )}
            </ContainerInstrument>

            {youtubeUrl.startsWith('local:') ? (
              <ContainerInstrument className="p-4 bg-emerald-500/10 text-emerald-600 rounded-[10px] text-[15px] font-light tracking-widest flex items-center gap-2">
                <CheckSquare size={14} strokeWidth={1.5} /> 
                <VoiceglotText  translationKey="media.converted" defaultText="Geconverteerd" />
              </ContainerInstrument>
            ) : (
              <a 
                href={youtubeUrl} 
                target="_blank" 
                className="block aspect-video bg-va-black rounded-[10px] relative overflow-hidden group"
              >
                <ContainerInstrument className="absolute inset-0 flex items-center justify-center text-white/20 group-hover:text-white/40 transition-colors">
                  <Youtube size={40} strokeWidth={1.5} />
                </ContainerInstrument>
                <ContainerInstrument className="absolute bottom-2 left-2 right-2 p-2 bg-va-black/60 backdrop-blur-md rounded-lg text-[15px] text-white font-light truncate tracking-widest">
                  {youtubeUrl}
                </ContainerInstrument>
              </a>
            )}
            
            {!youtubeUrl.startsWith('local:') && (
              <TextInstrument className="text-[15px] text-red-600/60 font-light leading-relaxed">
                <VoiceglotText  translationKey="media.youtube_hint" defaultText="Klik op de refresh knop om deze video direct in onze eigen player af te spelen." />
              </TextInstrument>
            )}
          </ContainerInstrument>
        )}
      </ContainerInstrument>

      {/*  MAIN GRID AREA */}
      <ContainerInstrument className="flex-1 space-y-8">
        {/*  NUCLEAR HEADER */}
        <ContainerInstrument className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <ContainerInstrument>
            <ContainerInstrument className="flex items-center gap-3 mb-2">
              <ContainerInstrument className="w-10 h-10 bg-va-black text-white rounded-[10px] flex items-center justify-center shadow-aura">
                <ImageIcon   size={20}  />
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-3xl font-light tracking-tight">
                {selectedActorId ? `${actors.find(a => a.id === selectedActorId)?.firstName}'s Portfolio` : <VoiceglotText  translationKey="media.engine_title" defaultText="Media Engine" />}
              </HeadingInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-va-black/40 font-light max-w-md text-[15px]">
              {selectedActorId 
                ? <VoiceglotText  translationKey="media.actor_portfolio_desc" defaultText="Alle media gekoppeld aan deze stemacteur." />
                : <VoiceglotText  translationKey="media.engine_desc" defaultText="Centraal beheer van alle assets van Voices. Geoptimaliseerd voor snelheid en integriteit." />}
            </TextInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="flex flex-wrap items-center gap-3">
            <ContainerInstrument className="relative group min-w-[240px]">
              <InputInstrument 
                type="text"
                placeholder="Zoek assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
                className="w-full bg-white border border-va-black/5 rounded-[10px] py-4 pl-12 pr-6 shadow-aura focus:ring-2 focus:ring-primary/20 transition-all text-[15px] font-light"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} strokeWidth={1.5} />
            </ContainerInstrument>

            <SelectInstrument 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-va-black/5 rounded-[10px] py-4 px-6 shadow-aura text-[15px] font-light tracking-widest focus:ring-2 focus:ring-primary/20"
            >
              <OptionInstrument value="newest">Nieuwst</OptionInstrument>
              <OptionInstrument value="oldest">Oudst</OptionInstrument>
              <OptionInstrument value="name">Naam (A-Z)</OptionInstrument>
              <OptionInstrument value="size">Grootte</OptionInstrument>
            </SelectInstrument>

            <label className={cn(
              "flex items-center gap-2 px-8 py-4 rounded-[10px] font-light uppercase tracking-widest text-[15px] cursor-pointer transition-all shadow-aura",
              isUploading ? "bg-va-black/10 text-va-black/30" : "bg-va-black text-white hover:scale-105 active:scale-95"
            )}>
              {isUploading ? <Upload className="animate-bounce" size={16} strokeWidth={1.5} /> : <Plus strokeWidth={1.5} size={16} />}
              <VoiceglotText  translationKey={isUploading ? "common.processing" : "common.upload"} defaultText={isUploading ? "Bezig..." : "Upload"} />
              <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
            </label>
          </ContainerInstrument>
        </ContainerInstrument>

        {/*  BULK ACTIONS BAR */}
        {selectedIds.length > 0 && (
          <ContainerInstrument className="bg-va-black text-white p-4 rounded-[20px] shadow-aura flex items-center justify-between animate-in slide-in-from-top duration-500">
            <ContainerInstrument className="flex items-center gap-4 ml-4">
              <TextInstrument className="text-[15px] font-light tracking-widest ">
                {selectedIds.length} <VoiceglotText  translationKey="common.selected" defaultText="geselecteerd" />
              </TextInstrument>
              <ButtonInstrument 
                onClick={() => setSelectedIds([])}
                className="text-white/40 hover:text-white transition-colors p-0 bg-transparent"
              >
                <X strokeWidth={1.5} size={16} />
              </ButtonInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="flex items-center gap-2">
              <ButtonInstrument onClick={() => handleBulkVisibility(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-[10px] transition-all text-[15px] font-light tracking-widest bg-transparent text-white border border-white/10">
                <Eye size={14} strokeWidth={1.5} /> <VoiceglotText  translationKey="common.public" defaultText="Publiek" />
              </ButtonInstrument>
              <ButtonInstrument onClick={() => handleBulkVisibility(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-[10px] transition-all text-[15px] font-light tracking-widest bg-transparent text-white border border-white/10">
                <EyeOff size={14} strokeWidth={1.5} /> <VoiceglotText  translationKey="common.private" defaultText="Priv" />
              </ButtonInstrument>
              <ButtonInstrument onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-[10px] transition-all text-[15px] font-light tracking-widest text-white">
                <Trash2 size={14} strokeWidth={1.5} /> <VoiceglotText  translationKey="common.delete" defaultText="Verwijderen" />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        )}

        {/*  FILTERS */}
        {!selectedActorId && (
          <ContainerInstrument className="flex flex-wrap items-center justify-between gap-4">
            <ContainerInstrument className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['all', 'agency', 'studio', 'academy', 'common'].map((j) => (
                <ButtonInstrument
                  key={j}
                  onClick={() => { playClick('light'); setFilterJourney(j); }}
                  className={cn(
                    "px-6 py-2 rounded-full text-[15px] font-light uppercase tracking-widest transition-all whitespace-nowrap",
                    filterJourney === j ? 'bg-primary text-white shadow-aura' : 'bg-white text-va-black/40 hover:bg-va-off-white shadow-sm border border-va-black/5'
                  )}
                >
                  {j === 'all' ? <VoiceglotText  translationKey="common.all" defaultText="Alles" /> : j}
                </ButtonInstrument>
              ))}
            </ContainerInstrument>

            <ButtonInstrument
              onClick={() => { playClick('light'); setFilterStatus(filterStatus === 'orphans' ? 'all' : 'orphans'); }}
              className={cn(
                "px-6 py-2 rounded-full text-[15px] font-light uppercase tracking-widest transition-all flex items-center gap-2",
                filterStatus === 'orphans' ? 'bg-orange-500 text-white shadow-aura' : 'bg-white text-va-black/40 hover:bg-va-off-white shadow-sm border border-va-black/5'
              )}
            >
              <AlertCircle size={14} strokeWidth={1.5} /> <VoiceglotText  translationKey="media.orphans" defaultText="Wees-media" />
            </ButtonInstrument>
          </ContainerInstrument>
        )}

        {/*  BENTO GRID */}
        <ContainerInstrument className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ContainerInstrument key={i} className="aspect-square bg-white/50 animate-pulse rounded-[20px] border border-va-black/5" />
            ))
          ) : media.length === 0 ? (
            <ContainerInstrument className="col-span-full py-32 text-center bg-white rounded-[20px] shadow-aura border-2 border-dashed border-va-black/5">
              <ContainerInstrument className="w-24 h-24 bg-va-off-white rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon   className="text-va-black/10" size={40}  />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
                <VoiceglotText  translationKey="media.none_found" defaultText="Geen media gevonden" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/40 font-light mt-2">
                <VoiceglotText  translationKey="media.none_found_desc" defaultText="Pas je filters aan of upload een nieuw bestand." />
              </TextInstrument>
            </ContainerInstrument>
          ) : (
            media.map((item) => (
              <ContainerInstrument 
                key={item.id}
                className={cn(
                  "group relative bg-white rounded-[20px] shadow-aura overflow-hidden transition-all duration-500 border border-va-black/5",
                  selectedIds.includes(item.id) ? 'ring-2 ring-primary ring-inset scale-[0.98]' : 'hover:scale-[1.02]'
                )}
              >
                {/* Selection Trigger */}
                <ContainerInstrument 
                  onClick={(e) => toggleSelect(item.id, e)}
                  className={cn(
                    "absolute top-6 right-6 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
                    selectedIds.includes(item.id) ? 'bg-primary text-white scale-110' : 'bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100'
                  )}
                >
                  {selectedIds.includes(item.id) ? <CheckSquare size={14} strokeWidth={1.5} /> : <Square size={14} strokeWidth={1.5} className="text-va-black/20" />}
                </ContainerInstrument>

                {/* Preview Area */}
                <ContainerInstrument className="aspect-square bg-va-off-white flex items-center justify-center relative overflow-hidden">
                  {item.fileType.startsWith('image/') ? (
                    <Image  
                      src={`https://www.voices.be/assets/${item.filePath}`} 
                      alt={item.fileName}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : item.fileType.startsWith('video/') ? (
                    <video 
                      src={`https://www.voices.be/assets/${item.filePath}`}
                      className="w-full h-full object-cover"
                      muted
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    <ContainerInstrument className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-aura group-hover:rotate-12 transition-transform">
                      {getFileIcon(item.fileType)}
                    </ContainerInstrument>
                  )}
                  
                  {/* Status Badges */}
                  <ContainerInstrument className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    <ButtonInstrument 
                      onClick={(e) => { e.stopPropagation(); toggleVisibility(item.id, item.isPublic); }}
                      className={cn(
                        "px-3 py-1 backdrop-blur-md rounded-full text-[15px] font-light uppercase tracking-widest transition-all flex items-center gap-1 border-none",
                        item.isPublic ? 'bg-emerald-500/80 text-white' : 'bg-va-black/80 text-white'
                      )}
                    >
                      {item.isPublic ? <Eye size={10} strokeWidth={1.5} /> : <EyeOff size={10} strokeWidth={1.5} />}
                      {item.isPublic ? 'Public' : 'Private'}
                    </ButtonInstrument>
                    {item.isOrphan && (
                      <ContainerInstrument className="px-3 py-1 bg-orange-500/80 backdrop-blur-md text-white rounded-full text-[15px] font-light tracking-widest flex items-center gap-1">
                        <AlertCircle size={10} strokeWidth={1.5} /> Wees
                      </ContainerInstrument>
                    )}
                  </ContainerInstrument>
                </ContainerInstrument>

                {/* Info Area */}
                <ContainerInstrument className="p-6 space-y-4">
                  <ContainerInstrument className="space-y-1">
                    <HeadingInstrument level={4} className="text-[15px] font-medium truncate tracking-tight text-va-black">{item.fileName}</HeadingInstrument>
                    <ContainerInstrument className="flex items-center gap-2 text-[15px] font-light text-va-black/30 tracking-widest ">
                      <TextInstrument>{(item.fileSize / 1024).toFixed(0)} KB</TextInstrument>
                      <ContainerInstrument className="w-1 h-1 rounded-full bg-va-black/10" />
                      <TextInstrument>{new Date(item.createdAt).toLocaleDateString('nl-BE')}</TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  {/* Relations */}
                  {item.relations && item.relations.length > 0 && (
                    <ContainerInstrument className="space-y-1.5 pt-3 border-t border-va-black/5">
                      <ContainerInstrument className="flex flex-wrap gap-1">
                        {item.relations.map((rel, i) => (
                          <ContainerInstrument key={i} className="px-2 py-1 bg-primary/5 text-primary rounded-lg text-[15px] font-light tracking-widest">
                            <TextInstrument className="opacity-40 font-light">{rel.type}:</TextInstrument> {rel.name}
                          </ContainerInstrument>
                        ))}
                      </ContainerInstrument>
                    </ContainerInstrument>
                  )}
                </ContainerInstrument>
              </ContainerInstrument>
            ))
          )}
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
