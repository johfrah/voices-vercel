"use client";

import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Music, Image as ImageIcon, Trash2, 
  Search, Filter, Plus, CheckSquare, Square, Tag, 
  ArrowUpDown, MoreVertical, X, Download, Eye, EyeOff, AlertCircle, Link as LinkIcon,
  Youtube, User, ChevronRight, RefreshCw, Play
} from 'lucide-react';
import { useSonicDNA } from '@/lib/sonic-dna';
import Image from 'next/image';

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
        alert('YouTube video is succesvol geconverteerd naar een lokale asset! 🚀');
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
    if (type.startsWith('image/')) return <ImageIcon className="text-blue-500" />;
    if (type.startsWith('audio/')) return <Music className="text-purple-500" />;
    if (type.startsWith('video/')) return <Play className="text-red-500" />;
    return <FileText className="text-gray-500" />;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 👤 ACTOR SIDEBAR */}
      <div className="w-full lg:w-64 space-y-6">
        <div className="bg-white rounded-[32px] shadow-aura p-6 space-y-4">
          <div className="flex items-center gap-2 text-va-black font-black tracking-tighter text-sm">
            <User size={16} />
            Stemacteurs
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto no-scrollbar">
            <button
              onClick={() => { playClick('light'); setSelectedActorId(null); }}
              className={`w-full text-left px-4 py-2 rounded-xl text-[15px] font-bold transition-all ${
                selectedActorId === null ? 'bg-va-black text-white' : 'hover:bg-va-off-white text-va-black/40'
              }`}
            >
              Alle Media
            </button>
            {actors.map(actor => (
              <button
                key={actor.id}
                onClick={() => { playClick('light'); setSelectedActorId(actor.id); }}
                className={`w-full text-left px-4 py-2 rounded-xl text-[15px] font-bold transition-all flex items-center justify-between group ${
                  selectedActorId === actor.id ? 'bg-primary text-white' : 'hover:bg-va-off-white text-va-black/60'
                }`}
              >
                <span>{actor.firstName} {actor.lastName}</span>
                <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedActorId === actor.id ? 'opacity-100' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        {/* YouTube Section (Visible when actor selected) */}
        {selectedActorId && youtubeUrl && (
          <div className="bg-red-50 rounded-[32px] p-6 space-y-4 border border-red-100 animate-in fade-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-black tracking-tighter text-sm">
                <Youtube size={18} />
                YouTube
              </div>
              {!youtubeUrl.startsWith('local:') && (
                <button 
                  onClick={handleYoutubeConvert}
                  disabled={isConverting}
                  className="p-2 bg-white text-red-600 rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                  title="Converteer naar lokale asset"
                >
                  <RefreshCw size={14} className={isConverting ? 'animate-spin' : ''} />
                </button>
              )}
            </div>

            {youtubeUrl.startsWith('local:') ? (
              <div className="p-4 bg-green-100 text-green-700 rounded-2xl text-[15px] font-black tracking-widest flex items-center gap-2">
                <CheckSquare size={14} /> Geconverteerd
              </div>
            ) : (
              <a 
                href={youtubeUrl} 
                target="_blank" 
                className="block aspect-video bg-va-black rounded-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 flex items-center justify-center text-white/20 group-hover:text-white/40 transition-colors">
                  <Youtube size={40} />
                </div>
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-va-black/60 backdrop-blur-md rounded-lg text-[15px] text-white font-bold truncate">
                  {youtubeUrl}
                </div>
              </a>
            )}
            
            {!youtubeUrl.startsWith('local:') && (
              <p className="text-[15px] text-red-600/60 font-medium leading-relaxed">
                Klik op de refresh knop om deze video direct in onze eigen player af te spelen.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 🖼️ MAIN GRID AREA */}
      <div className="flex-1 space-y-8">
        {/* 🚀 NUCLEAR HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-va-black text-white rounded-xl flex items-center justify-center shadow-aura">
                <ImageIcon size={20} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter">
                {selectedActorId ? `${actors.find(a => a.id === selectedActorId)?.firstName}'s Portfolio` : 'Media Engine'}
              </h2>
            </div>
            <p className="text-va-black/40 font-medium max-w-md text-sm">
              {selectedActorId 
                ? `Alle media gekoppeld aan deze stemacteur.` 
                : 'Centraal beheer van alle assets. Geoptimaliseerd voor snelheid en System-integriteit.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group min-w-[240px]">
              <input 
                type="text"
                placeholder="Zoek assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
                className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-6 shadow-aura focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
            </div>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border-none rounded-2xl py-4 px-6 shadow-aura text-sm font-black tracking-widest focus:ring-2 focus:ring-primary/20"
            >
              <option value="newest">Nieuwst</option>
              <option value="oldest">Oudst</option>
              <option value="name">Naam (A-Z)</option>
              <option value="size">Grootte</option>
            </select>

            <label className={`
              flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[15px] cursor-pointer transition-all shadow-pro
              ${isUploading ? 'bg-va-black/10 text-va-black/30' : 'bg-va-black text-white hover:scale-105 active:scale-95'}
            `}>
              {isUploading ? <Upload className="animate-bounce" size={16} /> : <Plus size={16} />}
              {isUploading ? 'Bezig...' : 'Upload'}
              <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
            </label>
          </div>
        </div>

        {/* 🛠️ BULK ACTIONS BAR */}
        {selectedIds.length > 0 && (
          <div className="bg-va-black text-white p-4 rounded-[24px] shadow-aura flex items-center justify-between animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4 ml-4">
              <span className="text-[15px] font-black tracking-widest">
                {selectedIds.length} geselecteerd
              </span>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => handleBulkVisibility(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-[15px] font-black tracking-widest">
                <Eye size={14} /> Publiek
              </button>
              <button onClick={() => handleBulkVisibility(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-[15px] font-black tracking-widest">
                <EyeOff size={14} /> Privé
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl transition-all text-[15px] font-black tracking-widest">
                <Trash2 size={14} /> Verwijderen
              </button>
            </div>
          </div>
        )}

        {/* 📂 FILTERS */}
        {!selectedActorId && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['all', 'agency', 'studio', 'academy', 'common'].map((j) => (
                <button
                  key={j}
                  onClick={() => { playClick('light'); setFilterJourney(j); }}
                  className={`
                    px-6 py-2 rounded-full text-[15px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${filterJourney === j ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-va-black/40 hover:bg-va-off-white shadow-sm'}
                  `}
                >
                  {j === 'all' ? 'Alles' : j}
                </button>
              ))}
            </div>

            <button
              onClick={() => { playClick('light'); setFilterStatus(filterStatus === 'orphans' ? 'all' : 'orphans'); }}
              className={`
                px-6 py-2 rounded-full text-[15px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                ${filterStatus === 'orphans' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white text-va-black/40 hover:bg-va-off-white shadow-sm'}
              `}
            >
              <AlertCircle size={14} /> Wees-media
            </button>
          </div>
        )}

        {/* 🖼️ BENTO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/50 animate-pulse rounded-[40px] border border-black/5" />
            ))
          ) : media.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white rounded-[48px] shadow-aura border-2 border-dashed border-va-black/5">
              <div className="w-24 h-24 bg-va-off-white rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="text-va-black/10" size={40} />
              </div>
              <h3 className="text-2xl font-black tracking-tighter">Geen media gevonden</h3>
              <p className="text-va-black/40 font-medium">Pas je filters aan of upload een nieuw bestand.</p>
            </div>
          ) : (
            media.map((item) => (
              <div 
                key={item.id}
                className={`
                  group relative bg-white rounded-[40px] shadow-aura overflow-hidden transition-all duration-500
                  ${selectedIds.includes(item.id) ? 'ring-4 ring-primary ring-inset scale-[0.98]' : 'hover:scale-[1.02]'}
                `}
              >
                {/* Selection Trigger */}
                <div 
                  onClick={(e) => toggleSelect(item.id, e)}
                  className={`
                    absolute top-6 right-6 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer
                    ${selectedIds.includes(item.id) ? 'bg-primary text-white scale-110' : 'bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100'}
                  `}
                >
                  {selectedIds.includes(item.id) ? <CheckSquare size={14} /> : <Square size={14} className="text-va-black/20" />}
                </div>

                {/* Preview Area */}
                <div className="aspect-square bg-va-off-white flex items-center justify-center relative overflow-hidden">
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
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-aura group-hover:rotate-12 transition-transform">
                      {getFileIcon(item.fileType)}
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleVisibility(item.id, item.isPublic); }}
                      className={`
                        px-3 py-1 backdrop-blur-md rounded-full text-[15px] font-black uppercase tracking-widest transition-all flex items-center gap-1
                        ${item.isPublic ? 'bg-green-500/80 text-white' : 'bg-va-black/80 text-white'}
                      `}
                    >
                      {item.isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
                      {item.isPublic ? 'Public' : 'Private'}
                    </button>
                    {item.isOrphan && (
                      <div className="px-3 py-1 bg-orange-500/80 backdrop-blur-md text-white rounded-full text-[15px] font-black tracking-widest flex items-center gap-1">
                        <AlertCircle size={10} /> Wees
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[15px] font-black truncate tracking-tight text-va-black">{item.fileName}</h4>
                    <div className="flex items-center gap-2 text-[15px] font-bold text-va-black/30 tracking-widest">
                      <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                      <span className="w-1 h-1 rounded-full bg-va-black/10" />
                      <span>{new Date(item.createdAt).toLocaleDateString('nl-BE')}</span>
                    </div>
                  </div>

                  {/* Relations */}
                  {item.relations && item.relations.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-black/5">
                      <div className="flex flex-wrap gap-1">
                        {item.relations.map((rel, i) => (
                          <div key={i} className="px-2 py-1 bg-primary/5 text-primary rounded-lg text-[15px] font-bold">
                            <span className="opacity-40">{rel.type}:</span> {rel.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
