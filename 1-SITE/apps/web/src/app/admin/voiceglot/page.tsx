"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { 
  Search, 
  Lock, 
  Unlock, 
  History, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  Filter,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

/**
 *  VOICEGLOT MASTER TABLE (GOD MODE 2026)
 * 
 * Volledig overzicht van alle vertalingen met lifecycle beheer.
 */
export default function VoiceglotMasterPage() {
  const { playClick } = useSonicDNA();
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hideInternal, setHideHideInternal] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTranslations(1, true);
    fetchStats();
    
    // Auto-refresh stats every 10 seconds during healing
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const [isHealingAll, setIsHealingAll] = useState(false);

  const fetchStats = async () => {
    console.log('📡 [Voiceglot Page] Fetching stats...');
    try {
      console.log('📡 [Voiceglot Page] Fetching stats...');
      const res = await fetch('/api/admin/voiceglot/stats');
      const text = await res.text();
      console.log('📡 [Voiceglot Page] Raw Stats Response:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('❌ [Voiceglot Page] Stats JSON Parse Error:', parseErr);
        toast.error('Stats API gaf geen geldige JSON terug');
        return;
      }
      
      console.log('📊 [Voiceglot Page] Stats Received:', data);
      
      if (res.ok) {
        setStats(data);
      } else {
        console.error('❌ [Voiceglot Page] Stats API Error:', data.error || 'Unknown error');
        toast.error(`Stats Error: ${data.error || '500'}`);
      }
    } catch (e: any) {
      console.error('❌ [Voiceglot Page] Stats Fetch Failed:', e.message);
      toast.error(`Netwerkfout bij ophalen stats: ${e.message}`);
    }
  };

  //  CHRIS-PROTOCOL: Live Polling (Godmode 2026)
  // We verversen de data elke 5 seconden als er healing bezig is
  useEffect(() => {
    const hasHealing = translations.some(t => t.status === 'healing');
    if (hasHealing || isHealingAll) {
      const timer = setTimeout(() => {
        fetchStats();
        // We verversen alleen de huidige pagina
        fetchTranslations(page, false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [translations, isHealingAll, page]);

  const handleHealAll = async () => {
    if (!confirm('Weet je zeker dat je alle ontbrekende vertalingen wilt genereren via AI? Dit kan even duren.')) return;
    
    setIsHealingAll(true);
    playClick('pro');
    try {
      const res = await fetch('/api/admin/voiceglot/heal-all', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.healedCount} vertalingen gegenereerd!`);
        fetchTranslations(1, true);
        fetchStats();
        playClick('success');
      }
    } catch (e) {
      toast.error('Healing mislukt.');
    } finally {
      setIsHealingAll(false);
    }
  };

  const fetchTranslations = async (pageNum: number, isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    else setIsFetchingMore(true);

    try {
      const res = await fetch(`/api/admin/voiceglot/list?page=${pageNum}&limit=100`);
      const text = await res.text();
      console.log(`📋 [Voiceglot Page] Raw List Response (Page ${pageNum}):`, text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('❌ [Voiceglot Page] List JSON Parse Error:', parseErr);
        toast.error('List API gaf geen geldige JSON terug');
        return;
      }
      
      console.log(`📋 [Voiceglot Page] List Received (Page ${pageNum}):`, data);
      
      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }
      
      if (isInitial) {
        setTranslations(data.translations || []);
      } else {
        // Alleen toevoegen als ze er nog niet in zitten (voorkom dubbelen bij polling)
        setTranslations(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newItems = (data.translations || []).filter((t: any) => !existingIds.has(t.id));
          // Als we polling doen (isInitial=false maar pageNum=page), willen we de bestaande items updaten
          if (pageNum === page && !isFetchingMore) {
            return prev.map(item => {
              const updated = (data.translations || []).find((t: any) => t.id === item.id);
              return updated ? updated : item;
            });
          }
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (e) {
      console.error('❌ [Voiceglot Page] Translations Fetch Failed:', e);
      toast.error('Kon vertalingen niet laden.');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      fetchTranslations(page + 1);
    }
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleStartEdit = (trans: any) => {
    setEditingId(trans.id);
    setEditingText(trans.translatedText);
    playClick('soft');
  };

  const handleSaveEdit = async (trans: any) => {
    if (editingText === trans.translatedText) {
      setEditingId(null);
      return;
    }

    setIsSaving(true);
    playClick('pro');
    try {
      const res = await fetch('/api/admin/voiceglot/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trans.id,
          key: trans.translationKey,
          lang: trans.lang,
          text: editingText,
          isManual: true
        })
      });

      if (res.ok) {
        setTranslations(prev => prev.map(item => 
          item.id === trans.id ? { ...item, translatedText: editingText, isLocked: true, isManuallyEdited: true } : item
        ));
        toast.success('Vertaling bijgewerkt en vergrendeld');
        setEditingId(null);
        playClick('success');
      }
    } catch (e) {
      toast.error('Opslaan mislukt');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLock = async (id: number, currentLocked: boolean) => {
    playClick('pro');
    try {
      const res = await fetch(`/api/admin/voiceglot/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isLocked: !currentLocked })
      });
      if (res.ok) {
        setTranslations(prev => prev.map(trans => trans.id === id ? { ...trans, isLocked: !currentLocked } : trans));
        toast.success(!currentLocked ? 'Vertaling vergrendeld' : 'Vertaling ontgrendeld');
      }
    } catch (e) {
      toast.error('Actie mislukt.');
    }
  };

  const filtered = translations.filter(trans => {
    const matchesSearch = trans.translationKey.toLowerCase().includes(search.toLowerCase()) || 
                         trans.originalText.toLowerCase().includes(search.toLowerCase()) ||
                         trans.translatedText.toLowerCase().includes(search.toLowerCase());
    const matchesLang = filterLang === 'all' || trans.lang === filterLang;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'locked' && trans.isLocked) ||
                         (filterStatus === 'auto' && !trans.isLocked && !trans.isManuallyEdited);
    return matchesSearch && matchesLang && matchesStatus;
  });

  // Group translations by key for the Matrix View
  // CHRIS-PROTOCOL: Registry-Centric handling
  const groupedList = translations
    .filter((item: any) => {
      if (hideInternal && item.translationKey.startsWith('knowledge.')) return false;
      return true;
    })
    .map((item: any) => {
      const langs: Record<string, any> = {};
      (item.translations || []).forEach((t: any) => {
        langs[t.lang] = t;
      });
      return {
        key: item.translationKey,
        originalText: item.originalText,
        context: item.context,
        sourceLang: item.sourceLang,
        langs
      };
    });

  const isSlop = (text: string, lang: string, original: string) => {
    if (!text || lang.startsWith('nl')) return false;
    const lower = text.toLowerCase();
    const sourceLower = original.toLowerCase();
    
    // Als de bron al in de doeltaal is, is het technisch gezien slop (geen vertaling nodig)
    if (lower === sourceLower) return true;
    
    const dutchWords = [' de ', ' het ', ' een ', ' is ', ' zijn ', ' met ', ' voor '];
    return dutchWords.filter(word => lower.includes(word)).length >= 2;
  };

  if (loading) return (
    <ContainerInstrument className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link href="/admin/settings/markets" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            Terug naar Markt Beheer
          </Link>
          <div className="flex items-center gap-4">
            <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
              Voiceglot Registry
            </HeadingInstrument>
            {stats?.nonNlSourceWarning && (
              <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl flex items-center gap-2 text-amber-700 animate-bounce-slow">
                <AlertCircle size={16} />
                <span className="text-[12px] font-bold uppercase tracking-tight">Non-NL Sources Detected</span>
              </div>
            )}
          </div>
        </ContainerInstrument>

        <ButtonInstrument 
          onClick={handleHealAll}
          disabled={isHealingAll}
          className={cn(
            "va-btn-pro flex items-center gap-2 transition-all duration-500",
            isHealingAll ? "!bg-amber-500 !text-white animate-pulse" : "!bg-primary"
          )}
        >
          {isHealingAll ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {isHealingAll ? 'Healing Bezig...' : stats?.coverage?.some((c: any) => c.percentage < 100) ? 'Hervat Healing' : 'Vertaal Alles (AI)'}
        </ButtonInstrument>
      </SectionInstrument>

      {/* Stats & Progress Indicators */}
      {stats && stats.coverage ? (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
          {stats.isCached && (
            <div className="absolute -top-6 right-0 flex items-center gap-1.5 text-[10px] font-bold text-va-black/20 uppercase tracking-widest animate-pulse">
              <History size={10} />
              Cached Data ({new Date(stats.updatedAt).toLocaleTimeString()})
            </div>
          )}
          {['en', 'fr', 'de', 'es', 'pt', 'it'].map((langCode) => {
            const langStats = stats.coverage.find((s: any) => s.lang === langCode);
            const count = langStats ? langStats.count : 0;
            const percentage = langStats ? langStats.percentage : 0;
            
            return (
              <div key={langCode} className="bg-white p-6 rounded-[24px] shadow-aura border border-black/5 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest text-va-black/20">{langCode}</span>
                    <span className="text-2xl font-light tracking-tighter">{langCode.toUpperCase()}</span>
                  </div>
                  <span className="text-[13px] font-bold text-primary">{percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-va-off-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-[11px] font-medium text-va-black/40">
                  {count} / {stats.totalStrings} teksten live
                </div>
              </div>
            );
          })}
        </div>
      ) : stats?.error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[24px] flex items-center gap-4 text-red-600">
          <AlertCircle size={24} />
          <div>
            <div className="text-[13px] font-bold uppercase tracking-widest">Stats Error</div>
            <div className="text-[15px] font-medium">{stats.error}</div>
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <ContainerInstrument className="flex gap-4 items-center bg-white p-6 rounded-[24px] shadow-aura border border-black/5">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
          <InputInstrument 
            placeholder="Zoek in keys, brontekst of vertaling..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 bg-va-off-white border-none rounded-xl py-4"
          />
        </div>
        <select 
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          className="bg-va-off-white border-none rounded-xl py-4 px-6 text-[15px] font-medium outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Alle talen</option>
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
          <option value="it">Italiano</option>
          <option value="pt">Português</option>
          <option value="nl-be">Vlaams</option>
          <option value="nl-nl">Nederlands</option>
        </select>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-va-off-white border-none rounded-xl py-4 px-6 text-[15px] font-medium outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Alle status</option>
          <option value="locked">Vergrendeld (Locked)</option>
          <option value="auto">Automatisch (AI)</option>
        </select>
        <button 
          onClick={() => setHideHideInternal(!hideInternal)}
          className={cn(
            "px-6 py-4 rounded-xl text-[15px] font-medium transition-all",
            hideInternal ? "bg-va-black text-white" : "bg-va-off-white text-va-black/40"
          )}
        >
          {hideInternal ? 'Internal Verborgen' : 'Toon Internal'}
        </button>
      </ContainerInstrument>

      {/* Table */}
      <div className="bg-white rounded-[32px] shadow-aura border border-black/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          {/* ... (thead blijft gelijk) */}
          <thead>
            <tr className="bg-va-off-white/50 border-b border-black/5">
              <th className="px-8 py-6 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase w-1/4">Key & Bron (NL)</th>
              {['en', 'fr', 'de', 'es', 'pt'].map(l => (
                <th key={l} className="px-6 py-6 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">{l}</th>
              ))}
              <th className="px-8 py-6 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {groupedList.map((group: any) => (
              <tr key={group.key} className="group hover:bg-va-off-white/30 transition-colors">
                {/* ... (td's blijven gelijk) */}
                <td className="px-8 py-6 align-top">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-mono text-primary font-bold">{group.key}</span>
                      {group.context && (
                        <span className="text-[10px] font-bold bg-va-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter" title="Oorsprong van deze tekst">
                          {group.context}
                        </span>
                      )}
                      {group.sourceLang && group.sourceLang !== 'nl' && (
                        <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse" title="Deze tekst lijkt niet in het Nederlands te zijn ingevoerd">
                          Source: {String(group.sourceLang).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <TextInstrument className="text-[14px] text-va-black/80 font-medium leading-relaxed">
                      {group.originalText}
                    </TextInstrument>
                  </div>
                </td>
                {['en', 'fr', 'de', 'es', 'pt'].map(lang => {
                  const trans = group.langs[lang];
                  const slopDetected = trans ? isSlop(trans.translatedText, lang, group.originalText) : false;
                  
                  return (
                    <td key={lang} className={cn("px-6 py-6 align-top border-l border-black/[0.02]", slopDetected && "bg-red-50/50")}>
                      {trans ? (
                        <div className="flex flex-col gap-2 group/cell relative">
                          {editingId === trans.id ? (
                            <div className="flex flex-col gap-2">
                              <textarea 
                                autoFocus
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(trans); }
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                className="w-full bg-va-off-white border-2 border-primary/20 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-primary transition-all min-h-[80px]"
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingId(null)} className="text-[11px] font-bold text-va-black/40">ANNULEER</button>
                                <button 
                                  onClick={() => handleSaveEdit(trans)}
                                  disabled={isSaving}
                                  className="text-[11px] font-bold text-primary"
                                >
                                  {isSaving ? 'OPSLAAN...' : 'OPSLAAN'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <TextInstrument 
                                className={cn(
                                  "text-[13px] leading-snug cursor-pointer hover:text-primary transition-colors",
                                  trans.isLocked ? "text-va-black font-medium" : "text-blue-600/80",
                                  slopDetected && "text-red-600 underline decoration-dotted font-bold"
                                )}
                                onClick={() => handleStartEdit(trans)}
                              >
                                {trans.translatedText}
                              </TextInstrument>
                              <div className="flex items-center justify-between mt-auto pt-2">
                                <div className="flex items-center gap-1.5">
                                  {trans.status === 'healing' ? (
                                    <>
                                      <Loader2 size={8} className="animate-spin text-amber-500" />
                                      <span className="text-[9px] font-black uppercase tracking-tighter text-amber-500">Healing</span>
                                    </>
                                  ) : trans.status === 'healing_failed' ? (
                                    <>
                                      <AlertCircle size={8} className="text-red-500" />
                                      <span className="text-[9px] font-black uppercase tracking-tighter text-red-500">Failed</span>
                                    </>
                                  ) : (
                                    <>
                                      {trans.isLocked ? (
                                        <Lock size={8} className="text-va-black/40" />
                                      ) : (
                                        <Sparkles size={8} className={cn(slopDetected ? "text-red-400" : "text-blue-400")} />
                                      )}
                                      <span className="text-[9px] font-black uppercase tracking-tighter text-va-black/20">
                                        {trans.isLocked ? 'Locked' : slopDetected ? 'Slop' : 'Auto'}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <button 
                                  onClick={() => toggleLock(trans.id, trans.isLocked)}
                                  className="opacity-0 group-hover/cell:opacity-100 transition-opacity"
                                >
                                  {trans.isLocked ? <Lock size={10} className="text-va-black" /> : <Unlock size={10} className="text-va-black/20 hover:text-va-black" />}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-va-black/10">
                          <span className="text-[10px] font-bold uppercase tracking-widest italic">Missing</span>
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-8 py-6 text-right align-top">
                  <button 
                    className="p-2 bg-va-off-white text-va-black/40 hover:text-primary rounded-lg transition-all"
                    title="Geschiedenis bekijken"
                  >
                    <History size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {hasMore && (
          <div className="p-12 flex justify-center border-t border-black/5 bg-va-off-white/20">
            <ButtonInstrument 
              onClick={loadMore}
              disabled={isFetchingMore}
              className="va-btn-pro !bg-white !text-va-black border border-black/10 flex items-center gap-2"
            >
              {isFetchingMore ? <Loader2 className="animate-spin" size={16} /> : <Filter size={16} />}
              {isFetchingMore ? 'Laden...' : 'Laad meer vertalingen'}
            </ButtonInstrument>
          </div>
        )}
      </div>
    </PageWrapperInstrument>
  );
}
