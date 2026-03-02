'use client';

import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { Archive, ArrowRight, Check, ChevronRight, Search as SearchIcon, Star, Tag } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import dynamic from "next/dynamic";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  confidence: 'high' | 'medium' | 'low' | 'verified';
  uploadDate?: string;
  legacyContext?: any;
}

interface PhotoItem {
  path: string;
  fileName: string;
  source: string;
  suggestions: Suggestion[];
  processed?: boolean;
  uploadDate?: string;
  legacyContext?: any;
  finderTags?: string[];
  analysis?: {
    description: string;
    labels: string[];
    vibe: string;
    loading?: boolean;
    authenticity?: string;
    suggested_alt?: string;
  };
}

//  Picnic-style Swipe Card Component (Voices Hero Left Style)
const SwipeCard = ({ 
  item, 
  groupName, 
  onAction, 
  onAnalyze, 
  actors,
  processingId 
}: { 
  item: PhotoItem, 
  groupName: string, 
  onAction: (action: 'match' | 'ignore' | 'archive', path: string, actorId?: string, category?: string) => void,
  onAnalyze: (item: PhotoItem) => void,
  actors: any[],
  processingId: string | null
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const archiveOpacity = useTransform(x, [-150, -50], [1, 0]);
  const matchOpacity = useTransform(x, [50, 150], [0, 1]);
  const [searchQuery, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const isFeatured = item.fileName.includes('featured') || item.fileName.includes('photo') || item.fileName.includes('avatar');
  const isSvg = item.fileName.endsWith('.svg');
  const needsVision = !isFeatured && !isSvg;

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50) {
      onAction('archive', item.path);
    } else if (info.offset.x > 50) {
      if (item.suggestions?.length > 0) {
        onAction('match', item.path, item.suggestions[0].id);
      } else {
        onAction('match', item.path, undefined, 'general');
      }
    }
  };

  const filteredActors = searchQuery.length > 1 
    ? actors.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <motion.div
      key={item.path}
      initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={`relative bg-white rounded-[40px] p-12 shadow-aura border border-black/[0.03] w-full max-w-6xl transition-all hover:shadow-aura-lg ${processingId === item.path ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Swipe Indicators */}
      <motion.div style={{ opacity: archiveOpacity }} className="absolute inset-0 bg-red-500 rounded-[40px] z-20 flex items-center justify-center pointer-events-none">
        <Archive strokeWidth={1.5} size={64} className="text-white" />
      </motion.div>
      <motion.div style={{ opacity: matchOpacity }} className="absolute inset-0 bg-green-500 rounded-[40px] z-20 flex items-center justify-center pointer-events-none">
        <Check strokeWidth={1.5} size={64} className="text-white" />
      </motion.div>

      <ContainerInstrument plain className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* LINKS: Info & Meta (voices-hero-left) */}
        <ContainerInstrument plain className="voices-hero-left !space-y-8">
          <ContainerInstrument plain>
            <ContainerInstrument plain className="voices-hero-badge mb-4">
              <TextInstrument className="w-1.5 h-1.5 rounded-full bg-va-primary/40 animate-pulse font-light" />
              <TextInstrument as="span" className="text-[15px] font-bold tracking-wider text-va-black/40">
                {item.source || 'Auto'}  {groupName}
              </TextInstrument>
            </ContainerInstrument>
            
            <HeadingInstrument level={2} className="text-3xl md:text-4xl font-light tracking-tighter text-va-black mb-2 break-all">
              {item.fileName}
            </HeadingInstrument>
            <TextInstrument className="text-[15px] font-mono text-va-black/20 truncate">
              {item.path}
            </TextInstrument>
          </ContainerInstrument>

          {/* Quick Actions & Categories */}
          <ContainerInstrument className="space-y-4">
            <TextInstrument className="text-[15px] font-bold tracking-widest text-va-black/30">Quick Categorize</TextInstrument>
            <ContainerInstrument className="flex flex-wrap gap-2">
              {[
                { id: 'brand', label: 'Brand Image', icon: Tag },
                { id: 'logo', label: 'Logo / Icon', icon: Star },
                { id: 'featured', label: 'Featured Content', icon: Check }
              ].map(cat => {
                const Icon = cat.icon;
                return (
                  <ButtonInstrument 
                    key={cat.id}
                    onClick={() => onAction('match', item.path, undefined, cat.id)}
                    className="px-6 py-3 bg-va-off-white hover:bg-va-black hover:text-white rounded-xl text-[15px] font-medium flex items-center gap-2 transition-all"
                  >
                    {Icon && (typeof Icon === 'function' || (typeof Icon === 'object' && (Icon as any).$$typeof)) ? <Icon strokeWidth={1.5} size={14} /> : Icon} {cat.label}
                  </ButtonInstrument>
                );
              })}
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Search & Suggestions */}
          <ContainerInstrument className="space-y-4">
            <TextInstrument className="text-[15px] font-bold tracking-widest text-va-black/30">Match Voice Actor</TextInstrument>
            
            {!showSearch ? (
              <ContainerInstrument className="space-y-2">
                {item.suggestions?.length > 0 ? (
                  item.suggestions.map((s: any) => (
                    <ButtonInstrument
                      key={s.id}
                      onClick={() => onAction('match', item.path, s.id)}
                      className={`w-full px-6 py-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        s.confidence === 'verified' ? 'bg-va-primary/5 border-va-primary/20' : 'bg-white border-black/[0.05] hover:border-va-primary'
                      }`}
                    >
                      <ContainerInstrument>
                        <TextInstrument className="text-[15px] font-medium text-black">{s.name}</TextInstrument>
                        <TextInstrument className="text-[15px] text-gray-400 font-bold tracking-tighter">
                          {s.confidence === 'verified' ? ' Verified Match' : `${s.confidence} confidence`}
                        </TextInstrument>
                      </ContainerInstrument>
                      <ChevronRight strokeWidth={1.5} size={18} className="text-va-primary/40 group-hover:translate-x-1 transition-transform" />
                    </ButtonInstrument>
                  ))
                ) : (
                  <ButtonInstrument 
                    onClick={() => setShowSearch(true)}
                    className="w-full px-6 py-4 border border-dashed border-black/10 hover:border-va-primary hover:bg-va-primary/5 rounded-2xl text-[15px] text-va-black/40 flex items-center justify-center gap-2 transition-all"
                  >
                    <SearchIcon strokeWidth={1.5} size={16} /> Find Voice Actor...
                  </ButtonInstrument>
                )}
              </ContainerInstrument>
            ) : (
              <ContainerInstrument className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <ContainerInstrument className="relative">
                  <InputInstrument 
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Type name..."
                    className="w-full pl-12 pr-4 py-4 bg-va-off-white border-none rounded-2xl text-[15px]"
                  />
                  <SearchIcon strokeWidth={1.5} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" />
                  <ButtonInstrument 
                    onClick={() => setShowSearch(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-va-primary"
                  >
                    ESC
                  </ButtonInstrument>
                </ContainerInstrument>
                
                <ContainerInstrument className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar bg-va-off-white/50 rounded-2xl p-2">
                  {filteredActors.map(actor => (
                    <ButtonInstrument
                      key={actor.id}
                      onClick={() => onAction('match', item.path, actor.id)}
                      className="w-full px-4 py-3 hover:bg-white rounded-xl text-left flex items-center justify-between group shadow-sm transition-all"
                    >
                      <TextInstrument className="text-[15px] font-medium">{actor.name}</TextInstrument>
                      <ChevronRight strokeWidth={1.5} size={14} className="text-va-primary opacity-0 group-hover:opacity-100 transition-all" />
                    </ButtonInstrument>
                  ))}
                  {searchQuery.length > 1 && filteredActors.length === 0 && (
                    <TextInstrument className="text-[15px] text-gray-400 italic p-4 text-center font-light">No actors found...</TextInstrument>
                  )}
                </ContainerInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>

          {/* Bottom Actions */}
          <ContainerInstrument className="flex gap-4 pt-4 border-t border-black/[0.03]">
            <ButtonInstrument 
              onClick={() => onAction('archive', item.path)}
              className="flex-1 py-4 bg-va-off-white text-va-black/40 hover:bg-red-500 hover:text-white rounded-2xl text-[15px] font-bold tracking-widest transition-all"
            >
              Archive (Left)
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => onAction('ignore', item.path)}
              className="px-8 py-4 border border-black/5 text-va-black/20 hover:border-va-black hover:text-va-black rounded-2xl text-[15px] font-bold tracking-widest transition-all"
            >
              Skip
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* RECHTS: De Foto (voices-hero-right) */}
        <ContainerInstrument plain className="voices-hero-right">
          <ContainerInstrument plain className="relative aspect-[4/5] w-full rounded-[32px] overflow-hidden shadow-aura-lg border border-black/5 bg-va-black group touch-none">
            <Image  
              src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(item.path)}`}
              alt={item.fileName}
              fill
              className="object-cover"
              unoptimized
              priority
            />
            
            {/* Overlay indicators for swipe direction */}
            <ContainerInstrument className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-transparent to-green-500/0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </motion.div>
  );
};

export default function PhotoMatcherPage() {
  const [manifest, setManifest] = useState<PhotoItem[]>([]);
  const [actors, setActors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAutoMatched, setShowAutoMatched] = useState(false);
  const [autoMatchedItems, setAutoMatchedItems] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [undoStack, setUndoStack] = useState<{ path: string, action: string }[]>([]);
  const [filterTagged, setFilterTagged] = useState(false);
  
  const itemsPerPage = 48;

  const wpThumbnailPattern = /-\d+x\d+(\.(jpg|jpeg|png|webp))$/i;
  const wpScaledPattern = /-(scaled|-1)(\.(jpg|jpeg|png|webp))$/i;
  
  const getBaseName = (fileName: string) => {
    let base = fileName.replace(/-\d+x\d+(\.(jpg|jpeg|png|webp))$/i, '$1');
    base = base.replace(/-(scaled|-1)(\.(jpg|jpeg|png|webp))$/i, '$2');
    return base;
  };

  const allActiveItems = manifest.filter(item => !item.processed);
  
  const goldItems = allActiveItems.filter(item => {
    const isWpThumbnail = wpThumbnailPattern.test(item.fileName);
    const isWpScaled = wpScaledPattern.test(item.fileName);
    const baseName = getBaseName(item.fileName);
    const hasOriginal = allActiveItems.some(other => 
      other.path !== item.path && 
      (other.fileName === baseName || 
       (!wpThumbnailPattern.test(other.fileName) && !wpScaledPattern.test(other.fileName) && getBaseName(other.fileName) === baseName))
    );
    return !isWpThumbnail && !isWpScaled && !hasOriginal;
  });

  const totalInitialItems = 59436;
  const processedCount = manifest.filter(i => i.processed).length;
  const progressPercentage = Math.round((processedCount / totalInitialItems) * 100);
  
  const slopItems = allActiveItems.filter(item => {
    const isWpThumbnail = wpThumbnailPattern.test(item.fileName);
    const isWpScaled = wpScaledPattern.test(item.fileName);
    const baseName = getBaseName(item.fileName);
    const hasOriginal = allActiveItems.some(other => 
      other.path !== item.path && 
      (other.fileName === baseName || 
       (!wpThumbnailPattern.test(other.fileName) && !wpScaledPattern.test(other.fileName) && getBaseName(other.fileName) === baseName))
    );
    return isWpThumbnail || isWpScaled || hasOriginal;
  });

  const savedGB = (slopItems.length * 0.5 / 1024).toFixed(2);

  const totalItems = showAutoMatched ? autoMatchedItems.length : goldItems.length;
  const unprocessedItems = showAutoMatched 
    ? autoMatchedItems.filter(i => !i.processed)
    : goldItems.filter(i => !i.processed);
  
  const filteredUnprocessedItems = filterTagged 
    ? unprocessedItems.filter(i => i.finderTags?.includes('Behouden'))
    : unprocessedItems;

  const currentItem = filteredUnprocessedItems[0];
  const nextItem = filteredUnprocessedItems[1];

  //  Pre-load next images (aggressive)
  useEffect(() => {
    if (filteredUnprocessedItems.length > 1) {
      // Pre-load de volgende 5 images
      filteredUnprocessedItems.slice(1, 6).forEach(item => {
        const img = new (window as any).Image();
        img.src = `/api/admin/photo-matcher/serve?path=${encodeURIComponent(item.path)}`;
      });
    }
  }, [filteredUnprocessedItems]);

  const fetchActors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/actors'); // Gebruik de bestaande API
      if (res.ok) {
        const data = await res.json();
        // Map de data naar een simpel formaat voor de search
        setActors(data.map((a: any) => ({
          id: a.id,
          name: `${a.first_name} ${a.last_name || ''}`.trim(),
          slug: a.slug
        })));
      }
    } catch (err) {
      console.error('error fetching actors:', err);
    }
  }, []);

  const fetchManifest = useCallback(() => {
    // Check local storage first for faster initial load
    const cached = localStorage.getItem('photo-manifest-cache');
    if (cached) {
      try {
        setManifest(JSON.parse(cached));
        setLoading(false);
      } catch (e) {}
    }

    fetch('/photo-manifest.json')
      .then(res => res.json())
      .then((data: PhotoItem[]) => {
        setManifest(data);
        localStorage.setItem('photo-manifest-cache', JSON.stringify(data));
        setLoading(false);
      })
      .catch(err => {
        console.error(' error loading manifest:', err);
        setLoading(false);
      });
  }, []);

  const fetchAutoMatched = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/photo-matcher/auto-matched');
      if (res.ok) {
        const data = await res.json();
        setAutoMatchedItems(data);
      }
    } catch (err) {
      console.error('error fetching auto-matched:', err);
    }
  }, []);

  useEffect(() => {
    fetchManifest();
    fetchAutoMatched();
    fetchActors();
  }, [fetchManifest, fetchAutoMatched, fetchActors]);

  const analyzeImage = async (item: PhotoItem) => {
    setManifest(prev => prev.map(i => 
      i.path === item.path ? { ...i, analysis: { description: '', labels: [], vibe: '', loading: true } } : i
    ));

    try {
      const context = { fileName: item.fileName, path: item.path, legacyContext: item.legacyContext, source: item.source };
      const res = await fetch(`/api/admin/photo-matcher/analyze?path=${encodeURIComponent(item.path)}&context=${encodeURIComponent(JSON.stringify(context))}`);
      if (res.ok) {
        const analysis = await res.json();
        setManifest(prev => prev.map(i => i.path === item.path ? { ...i, analysis: { ...analysis, loading: false } } : i));
      }
    } catch (err) {
      setManifest(prev => prev.map(i => i.path === item.path ? { ...i, analysis: undefined } : i));
    }
  };

  const scanPage = async () => {
    if (scanning) return;
    const unprocessedItems = manifest.filter(i => !i.processed);
    const itemsToScan = unprocessedItems.filter(item => !item.analysis);
    if (itemsToScan.length === 0) return;
    setScanning(true);
    setScanProgress(0);
    let completed = 0;
    for (const item of itemsToScan) {
      await analyzeImage(item);
      completed++;
      setScanProgress(Math.round((completed / itemsToScan.length) * 100));
    }
    setScanning(false);
  };

  const handleAction = useCallback(async (action: 'match' | 'ignore' | 'archive', photoPath: string, actorId?: string, category?: string) => {
    // Voeg toe aan undo stack (max 5)
    setUndoStack(prev => [...prev.slice(-4), { path: photoPath, action }]);

    // Optimistic UI: Markeer direct als verwerkt
    setManifest(prev => prev.map(item => item.path === photoPath ? { ...item, processed: true } : item));
    
    try {
      if (action === 'match') {
        await fetch('/api/admin/photo-matcher/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoPath, actorId, category })
        });
      }

      if (action === 'archive') {
        await fetch('/api/admin/photo-matcher/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoPath })
        });
      }
    } catch (err) {
      console.error('Background action failed:', err);
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    // Markeer weer als onverwerkt in de lokale state
    setManifest(prev => prev.map(item => 
      item.path === lastAction.path ? { ...item, processed: false } : item
    ));

    console.log(' Undo performed for:', lastAction.path);
  }, [undoStack]);

  //  Keyboard Speed Workflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'Escape') {
        handleUndo();
        return;
      }

      if (!currentItem) return;

      if (e.key === 'ArrowLeft') {
        handleAction('archive', currentItem.path);
      } else if (e.key === 'ArrowRight') {
        if (currentItem.suggestions?.length > 0) {
          handleAction('match', currentItem.path, currentItem.suggestions[0].id);
        } else {
          // Force match to general if no suggestion
          handleAction('match', currentItem.path, undefined, 'general');
        }
      } else if (e.key === 'ArrowDown') {
        handleAction('ignore', currentItem.path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem, handleAction, handleUndo]);

  if (loading) return (
    <ContainerInstrument className="p-10 text-center">
      <TextInstrument><VoiceglotText  translationKey="admin.photo_matcher.loading" defaultText="Loading photos..." /></TextInstrument>
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white selection:bg-primary selection:text-white overflow-x-hidden">
      <Suspense fallback={null}>
        <LiquidBackground />
      </Suspense>
      
      {/*  Minimal Floating Stats Overlay */}
      <ContainerInstrument className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-xl rounded-full px-8 py-4 shadow-aura border border-black/5 flex items-center gap-12 pointer-events-none">
        <ContainerInstrument className="flex items-center gap-4">
          <TextInstrument className="text-[15px] text-va-black/40 tracking-[0.2em] font-bold">Progress</TextInstrument>
          <ContainerInstrument className="w-32 h-1.5 bg-va-black/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-va-primary" 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-medium text-va-black">{progressPercentage}%</TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="flex items-center gap-4">
          <TextInstrument className="text-[15px] text-va-black/40 tracking-[0.2em] font-bold">Savings</TextInstrument>
          <TextInstrument className="text-[15px] font-medium text-va-primary">{savedGB} GB</TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="flex items-center gap-4">
          <TextInstrument className="text-[15px] text-va-black/40 tracking-[0.2em] font-bold">Remaining</TextInstrument>
          <TextInstrument className="text-[15px] font-medium text-va-black">{totalItems}</TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="h-8 w-px bg-va-black/5" />

        <ButtonInstrument 
          onClick={() => setFilterTagged(!filterTagged)}
          className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 pointer-events-auto ${
            filterTagged 
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
              : 'bg-va-off-white text-va-black/40 hover:bg-va-black hover:text-white'
          }`}
        >
          <Tag size={14} fill={filterTagged ? 'currentColor' : 'none'} />
          {filterTagged ? 'Alleen Behouden' : 'Toon alles'}
        </ButtonInstrument>

        {undoStack.length > 0 && (
          <ContainerInstrument className="flex items-center gap-2 px-4 py-1.5 bg-va-primary/10 rounded-full border border-va-primary/20 animate-in fade-in zoom-in duration-300">
            <TextInstrument className="text-[15px] text-va-primary font-bold tracking-widest">
              ESC to Undo ({undoStack.length})
            </TextInstrument>
          </ContainerInstrument>
        )}
      </ContainerInstrument>

      <ContainerInstrument className="max-w-6xl mx-auto pt-32 pb-32 px-4 h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentItem ? (
            <SwipeCard 
              key={currentItem.path} 
              item={currentItem} 
              groupName={currentItem.legacyContext?.post_title || currentItem.legacyContext?.parent_id || 'Uncategorized'} 
              onAction={handleAction} 
              onAnalyze={analyzeImage}
              actors={actors}
              processingId={processingId}
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <TextInstrument className="text-6xl font-light"></TextInstrument>
              <HeadingInstrument level={2} className="text-3xl font-light">Alles verwerkt!</HeadingInstrument>
              <ButtonInstrument onClick={() => window.location.reload()} className="va-btn-pro px-8 py-4">Herladen</ButtonInstrument>
            </motion.div>
          )}
        </AnimatePresence>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
