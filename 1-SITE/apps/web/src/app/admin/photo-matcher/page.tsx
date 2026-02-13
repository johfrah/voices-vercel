'use client';

import { ButtonInstrument, ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

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
  analysis?: {
    description: string;
    labels: string[];
    vibe: string;
    loading?: boolean;
  };
}

export default function PhotoMatcherPage() {
  const [manifest, setManifest] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAutoMatched, setShowAutoMatched] = useState(false);
  const [autoMatchedItems, setAutoMatchedItems] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // 📄 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 200;

  // 🧹 Deduplication & Filter Logic
  const wpThumbnailPattern = /-\d+x\d+(\.(jpg|jpeg|png|webp))$/i;
  const wpScaledPattern = /-(scaled|-1)(\.(jpg|jpeg|png|webp))$/i;
  
  const getBaseName = (fileName: string) => {
    let base = fileName.replace(/-\d+x\d+(\.(jpg|jpeg|png|webp))$/i, '$1');
    base = base.replace(/-(scaled|-1)(\.(jpg|jpeg|png|webp))$/i, '$2');
    return base;
  };

  const allActiveItems = manifest.filter(item => !item.processed);
  
  // 💎 Gold Items (unieke bronbestanden)
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

  // 🧠 Visual Grouping Logic
  const groupedItems = paginatedItems.reduce((groups: { [key: string]: PhotoItem[] }, item) => {
    const context = item.legacyContext?.post_title || item.legacyContext?.parent_id || 'Geen Context';
    if (!groups[context]) groups[context] = [];
    groups[context].push(item);
    return groups;
  }, {});

  // 🧹 Slop Items (thumbnails en redundante kopieën)
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

  // 📊 Nuclear Stats
  const totalInitialItems = 59436; // Uit de manifest read
  const processedCount = manifest.filter(i => i.processed).length;
  const progressPercentage = Math.round((processedCount / totalInitialItems) * 100);
  const savedGB = (slopItems.length * 0.5 / 1024).toFixed(2); // Schatting 500KB per thumbnail

  // 🧠 Bulk Vision Scanner
  const scanPage = async () => {
    if (scanning) return;
    
    const itemsToScan = paginatedItems.filter(item => {
      const isFeatured = item.fileName.includes('featured') || item.fileName.includes('photo') || item.fileName.includes('avatar');
      const isSvg = item.fileName.endsWith('.svg');
      return !isFeatured && !isSvg && !item.analysis;
    });

    console.log('✨ Bulk Scan gestart voor', itemsToScan.length, 'items');
    if (itemsToScan.length === 0) {
      alert('Geen items op deze pagina die een Vision scan nodig hebben.');
      return;
    }

    setScanning(true);
    setScanProgress(0);

    let completed = 0;
    const concurrency = 5;
    
    const queue = [...itemsToScan];
    const workers = Array(concurrency).fill(null).map(async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;
        console.log('🚀 Scannen van:', item.fileName);
        await analyzeImage(item);
        completed++;
        setScanProgress(Math.round((completed / itemsToScan.length) * 100));
      }
    });

    await Promise.all(workers);
    setScanning(false);
    console.log('✅ Bulk Scan voltooid');
  };

  // ⌨️ Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key.toLowerCase();
      if (['a', 'm', 's'].includes(key)) {
        // Pak het eerste onverwerkte item op de pagina
        const firstItem = paginatedItems.find(i => !i.processed);
        if (!firstItem) return;

        if (key === 'a') handleAction('archive', firstItem.path);
        if (key === 's') handleAction('ignore', firstItem.path);
        if (key === 'm') {
          const firstSuggestion = firstItem.suggestions?.[0];
          if (firstSuggestion) {
            handleAction('match', firstItem.path, firstSuggestion.id, firstItem.analysis);
          } else if (firstItem.analysis && !firstItem.analysis.loading) {
            handleAction('match', firstItem.path, undefined, firstItem.analysis);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginatedItems]);

  // 🧹 Bulk Cleanup
  const bulkCleanup = async () => {
    if (confirm(`Weet je zeker dat je ${slopItems.length} redundante foto's wilt verplaatsen naar /ARCHIVE/ op de server?`)) {
      for (const item of slopItems) {
        await handleAction('archive', item.path);
      }
      alert('Opschonen voltooid. De bestanden zijn verplaatst naar het archief.');
    }
  };

  const fetchManifest = useCallback(() => {
    console.log('🔄 laden van manifest...');
    setLoading(true);
    fetch('/photo-manifest.json')
      .then(res => {
        console.log('📡 manifest response status:', res.status);
        return res.json();
      })
      .then((data: PhotoItem[]) => {
        console.log('✅ manifest geladen:', data.length, 'items');
        setManifest(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ error loading manifest:', err);
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
  }, [fetchManifest, fetchAutoMatched]);

  // 🧠 Vision Analysis Trigger
  const analyzeImage = async (item: PhotoItem) => {
    setManifest(prev => prev.map(i => 
      i.path === item.path ? { ...i, analysis: { description: '', labels: [], vibe: '', loading: true } } : i
    ));

    try {
      const context = {
        fileName: item.fileName,
        path: item.path,
        legacyContext: item.legacyContext,
        source: item.source
      };
      
      const res = await fetch(`/api/admin/photo-matcher/analyze?path=${encodeURIComponent(item.path)}&context=${encodeURIComponent(JSON.stringify(context))}`);
      if (res.ok) {
        const analysis = await res.json();
        setManifest(prev => prev.map(i => 
          i.path === item.path ? { ...i, analysis: { ...analysis, loading: false } } : i
        ));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('Vision analysis aborted for:', item.fileName);
      } else {
        console.error('vision analysis failed:', err);
      }
      setManifest(prev => prev.map(i => 
        i.path === item.path ? { ...i, analysis: undefined } : i
      ));
    }
  };

  const handleAction = async (action: 'match' | 'ignore' | 'archive', photoPath: string, actorId?: string, analysisData?: any) => {
    setProcessingId(photoPath);
    
    if (action === 'match') {
      try {
        const res = await fetch('/api/admin/photo-matcher/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoPath: photoPath,
            actorId: actorId,
            analysis: analysisData
          })
        });
        if (!res.ok) throw new Error('match failed');
      } catch (err) {
        console.error(err);
        alert('fout bij het matchen of verplaatsen van de foto.');
        setProcessingId(null);
        return;
      }
    }

    if (action === 'archive') {
      try {
        const res = await fetch('/api/admin/photo-matcher/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoPath: photoPath })
        });
        if (!res.ok) throw new Error('archive failed');
      } catch (err) {
        console.error(err);
        alert('fout bij het archiveren van de foto.');
        setProcessingId(null);
        return;
      }
    }

    // Markeer als verwerkt in de lokale state
    setManifest(prev => prev.map(item => 
      item.path === photoPath ? { ...item, processed: true } : item
    ));
    setProcessingId(null);
  };

  if (loading) return (
    <ContainerInstrument className="p-10 text-center">
      <TextInstrument>
        <VoiceglotText translationKey="admin.photo_matcher.loading" defaultText="laden van foto's..." />
      </TextInstrument>
    </ContainerInstrument>
  );

  // 📄 Pagination Logic
  const totalItems = showAutoMatched ? autoMatchedItems.length : goldItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = showAutoMatched 
    ? autoMatchedItems.slice(startIndex, startIndex + itemsPerPage)
    : goldItems.slice(startIndex, startIndex + itemsPerPage);

  if (goldItems.length === 0 && !loading && !showAutoMatched) {
    return (
      <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 font-sans pt-32">
        <ContainerInstrument className="max-w-5xl mx-auto">
          <ContainerInstrument className="py-20 text-center">
            <TextInstrument as="span" className="text-6xl block mb-4 font-light">🎉</TextInstrument>
            <HeadingInstrument level={2} className="text-2xl font-bold text-gray-900">
              <VoiceglotText translationKey="admin.photo_matcher.done_title" defaultText="alles is verwerkt!" />
            </HeadingInstrument>
            <TextInstrument className="text-gray-500 font-light">
              <VoiceglotText translationKey="admin.photo_matcher.done_text" defaultText="lekker gewerkt, de database is weer een stukje schoner." />
            </TextInstrument>
            {slopItems.length > 0 && (
              <ButtonInstrument onClick={bulkCleanup} className="mt-8 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium">
                🧹 ruim nog {slopItems.length} thumbnails op
              </ButtonInstrument>
            )}
            <ButtonInstrument onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-va-black text-white rounded-full text-sm font-medium block mx-auto">
              refresh lijst
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 font-sans pt-32">
      <ContainerInstrument className="max-w-5xl mx-auto">
        {/* 📊 Nuclear Status Dashboard */}
        <ContainerInstrument className="mb-8 bg-va-black text-white rounded-[32px] p-6 shadow-aura flex items-center justify-between">
          <div className="flex gap-10">
            <div>
              <TextInstrument className="text-[15px] text-white/40 tracking-widest mb-1 font-light">Nuclear Progress</TextInstrument>
              <div className="flex items-center gap-3">
                <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-va-primary transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>
                <TextInstrument className="text-sm font-bold">{progressPercentage}%</TextInstrument>
              </div>
            </div>
            <div>
              <TextInstrument className="text-[15px] text-white/40 tracking-widest mb-1 font-light">Space Saved</TextInstrument>
              <TextInstrument className="text-sm font-bold text-va-primary">{savedGB} GB</TextInstrument>
            </div>
            <div>
              <TextInstrument className="text-[15px] text-white/40 tracking-widest mb-1 font-light">Shortcuts</TextInstrument>
              <TextInstrument className="text-[15px] font-medium text-white/60">
                <span className="text-white bg-white/10 px-1.5 py-0.5 rounded mr-1">A</span> Archive 
                <span className="text-white bg-white/10 px-1.5 py-0.5 rounded mx-1 ml-3">M</span> Match 
                <span className="text-white bg-white/10 px-1.5 py-0.5 rounded mx-1 ml-3">S</span> Skip
              </TextInstrument>
            </div>
          </div>
          {scanning && (
            <div className="flex items-center gap-3 bg-va-primary/20 px-4 py-2 rounded-full border border-va-primary/30">
              <div className="w-2 h-2 bg-va-primary rounded-full animate-pulse" />
              <TextInstrument className="text-[15px] font-bold text-va-primary tracking-widest">
                Scanning: {scanProgress}%
              </TextInstrument>
            </div>
          )}
        </ContainerInstrument>

        <ContainerInstrument className="mb-12 flex justify-between items-end border-b border-black/[0.03] pb-8">
          <ContainerInstrument>
            <HeadingInstrument level={1} className="text-4xl font-light tracking-tight text-black mb-2">
              <VoiceglotText translationKey="admin.photo_matcher.title" defaultText="photo matcher" />
            </HeadingInstrument>
            <TextInstrument className="text-gray-400 tracking-widest text-[15px] font-medium">
              {totalItems} <VoiceglotText translationKey="admin.photo_matcher.to_process" defaultText={showAutoMatched ? "automatisch gematchte foto's (ter controle)" : "foto's te verwerken"} />
              {totalPages > 1 && ` • pagina ${currentPage} van ${totalPages}`}
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="flex gap-4">
             <ButtonInstrument 
                onClick={scanPage}
                disabled={scanning}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  scanning ? 'bg-va-primary/10 text-va-primary/40 cursor-not-allowed' : 'bg-va-primary text-white hover:shadow-aura-lg'
                }`}
              >
                {scanning ? '✨ scannen...' : '✨ scan pagina'}
              </ButtonInstrument>
             <ButtonInstrument 
                onClick={bulkCleanup}
                className="px-6 py-2 bg-va-off-white border border-orange-200 text-orange-600 hover:bg-orange-50 transition-all rounded-full text-sm font-medium"
              >
                🧹 bulk cleanup
              </ButtonInstrument>
             <ButtonInstrument 
                onClick={() => { setShowAutoMatched(!showAutoMatched); setCurrentPage(1); }}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  showAutoMatched 
                    ? 'bg-va-primary text-white' 
                    : 'bg-white border border-black/5 text-black hover:border-black'
                }`}
              >
                {showAutoMatched ? 'toon onverwerkt' : `toon auto-matched (${autoMatchedItems.length})`}
              </ButtonInstrument>
             <ButtonInstrument 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-white border border-black/5 text-black hover:border-black transition-all rounded-full text-sm font-medium"
              >
                <VoiceglotText translationKey="admin.photo_matcher.refresh" defaultText="refresh lijst" />
              </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* 📄 Pagination Controls Top */}
        {totalPages > 1 && (
          <ContainerInstrument className="mb-8 flex justify-center gap-2">
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => (
              <ButtonInstrument
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-full text-[15px] font-bold transition-all ${
                  currentPage === i + 1 ? 'bg-va-primary text-white' : 'bg-white border border-black/5 text-gray-400 hover:border-black'
                }`}
              >
                {i + 1}
              </ButtonInstrument>
            ))}
          </ContainerInstrument>
        )}

        <ContainerInstrument className="space-y-12">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="space-y-4">
              <div className="flex items-center gap-4 px-4">
                <div className="h-px flex-grow bg-black/[0.05]" />
                <TextInstrument className="text-[15px] font-bold text-black/20 tracking-[0.3em]">
                  {groupName}
                </TextInstrument>
                <div className="h-px flex-grow bg-black/[0.05]" />
              </div>
              
              <div className="space-y-6">
                {items.map((item: any) => {
                  // 🤖 Vision Logic: Alleen voor beelden die we echt willen houden
                  const isFeatured = item.fileName.includes('featured') || item.fileName.includes('photo') || item.fileName.includes('avatar');
                  const isSvg = item.fileName.endsWith('.svg');
                  const needsVision = !isFeatured && !isSvg;

                  return (
                    <ContainerInstrument 
                      key={item.path || item.id} 
                      className={`bg-white rounded-[40px] p-8 shadow-aura border border-black/[0.03] flex gap-10 items-start transition-all hover:shadow-aura-lg ${processingId === item.path ? 'opacity-50 pointer-events-none' : ''} ${item.processed ? 'hidden' : ''}`}
                    >
                      {/* Foto Preview */}
                      <ContainerInstrument className="w-56 h-56 flex-shrink-0 relative rounded-[32px] overflow-hidden bg-va-off-white border border-black/[0.03]">
                        <Image 
                          src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(item.path || item.filePath)}`}
                          alt={item.fileName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {(item.source === 'Combell Uploads' || item.id) && (
                          <ContainerInstrument className="absolute top-4 right-4 bg-va-primary w-3 h-3 rounded-full border-2 border-white shadow-sm" />
                        )}
                      </ContainerInstrument>

                      {/* Info & Suggestions */}
                      <ContainerInstrument className="flex-grow space-y-6 pt-2">
                        <ContainerInstrument>
                          <ContainerInstrument className="flex items-center gap-3 mb-2">
                            <TextInstrument as="span" className="text-[15px] font-medium tracking-[0.2em] text-va-primary/60">
                              {item.source || 'automatisch'}
                            </TextInstrument>
                            <TextInstrument className="text-[15px] font-mono text-gray-300 break-all">{item.path || item.filePath}</TextInstrument>
                          </ContainerInstrument>
                          <HeadingInstrument level={3} className="text-xl font-light text-gray-900">{item.fileName}</HeadingInstrument>
                        </ContainerInstrument>

                        {/* 🧠 Vision Analysis Section */}
                        {needsVision && (
                          <ContainerInstrument className="p-6 bg-va-off-white rounded-[24px] border border-black/[0.02]">
                            {item.analysis ? (
                              item.analysis.loading ? (
                                <TextInstrument className="text-[15px] text-va-primary/40 animate-pulse font-medium italic">vision analyseert...</TextInstrument>
                              ) : (
                                <div className="space-y-3">
                                  <TextInstrument className="text-sm text-va-black/60 leading-relaxed font-medium">
                                    &ldquo;{item.analysis.description}&rdquo;
                                  </TextInstrument>
                                  <div className="flex flex-wrap gap-2 items-center">
                                    {item.analysis.labels.map((l: string) => (
                                      <span key={l} className="px-3 py-1 bg-white rounded-full text-[15px] font-medium text-gray-400 border border-black/[0.03]">{l}</span>
                                    ))}
                                    <span className="px-3 py-1 bg-va-primary/5 text-va-primary rounded-full text-[15px] font-bold italic">{item.analysis.vibe}</span>
                                    
                                    <ButtonInstrument 
                                      onClick={() => handleAction('match', item.path, undefined, item.analysis)}
                                      className="ml-auto px-4 py-2 bg-va-black text-white rounded-xl text-[15px] font-black tracking-widest hover:bg-va-primary transition-all"
                                    >
                                      verplaats naar assets
                                    </ButtonInstrument>
                                  </div>
                                </div>
                              )
                            ) : (
                              <ButtonInstrument 
                                onClick={() => analyzeImage(item)}
                                className="text-[15px] font-bold text-va-primary/60 hover:text-va-primary transition-colors flex items-center gap-2"
                              >
                                ✨ vision beschrijving genereren
                              </ButtonInstrument>
                            )}
                          </ContainerInstrument>
                        )}

                        <ContainerInstrument className="flex flex-wrap gap-3">
                          {item.suggestions?.length > 0 ? (
                            item.suggestions.map((s: any) => (
                              <ButtonInstrument
                                key={s.id}
                                onClick={() => handleAction('match', item.path, s.id, item.analysis)}
                                className={`px-5 py-4 rounded-2xl border text-left transition-all group flex items-center gap-4 ${
                                  s.confidence === 'verified'
                                    ? 'bg-va-off-white border-va-primary/20'
                                    : 'bg-white border-black/[0.05] hover:border-va-primary'
                                }`}
                              >
                                <ContainerInstrument>
                                  <TextInstrument className="text-sm font-medium text-black">{s.name}</TextInstrument>
                                  <TextInstrument className="text-[15px] text-gray-400 font-medium">
                                    {s.confidence === 'verified' ? '✓ geverifieerd' : s.confidence}
                                  </TextInstrument>
                                </ContainerInstrument>
                              </ButtonInstrument>
                            ))
                          ) : !showAutoMatched && (
                            <TextInstrument className="text-[15px] text-gray-300 italic font-light">geen automatische match gevonden</TextInstrument>
                          )}
                        </ContainerInstrument>
                      </ContainerInstrument>

                      {/* Quick Actions */}
                      <ContainerInstrument className="flex flex-col gap-3 w-36 pt-2">
                        <ButtonInstrument 
                          onClick={() => handleAction('ignore', item.path)}
                          className="w-full py-3 px-4 border border-black/5 text-gray-400 hover:border-black hover:text-black rounded-2xl text-[15px] font-medium tracking-widest transition-all bg-white"
                        >
                          overslaan
                        </ButtonInstrument>
                        <ButtonInstrument 
                          onClick={() => handleAction('archive', item.path)}
                          className="w-full py-3 px-4 bg-va-off-white text-gray-400 hover:text-gray-600 rounded-2xl text-[15px] font-medium tracking-widest transition-all"
                        >
                          archiveren
                        </ButtonInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  );
                })}
              </div>
            </div>
          ))}
        </ContainerInstrument>

        {/* 📄 Pagination Controls Bottom */}
        {totalPages > 1 && (
          <ContainerInstrument className="mt-16 flex justify-center gap-2 pb-20">
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => (
              <ButtonInstrument
                key={i + 1}
                onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-12 h-12 rounded-full text-sm font-medium transition-all ${
                  currentPage === i + 1 ? 'bg-va-primary text-white' : 'bg-white border border-black/5 text-gray-400 hover:border-black'
                }`}
              >
                {i + 1}
              </ButtonInstrument>
            ))}
          </ContainerInstrument>
        )}
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}

// Verwijder de dubbele/foutieve footer code hieronder

