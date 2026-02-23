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
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTranslations();
  }, []);

  const [isHealingAll, setIsHealingAll] = useState(false);

  const handleHealAll = async () => {
    if (!confirm('Weet je zeker dat je alle ontbrekende vertalingen wilt genereren via AI? Dit kan even duren.')) return;
    
    setIsHealingAll(true);
    playClick('pro');
    try {
      const res = await fetch('/api/admin/voiceglot/heal-all', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.healedCount} vertalingen gegenereerd!`);
        fetchTranslations();
        playClick('success');
      }
    } catch (e) {
      toast.error('Healing mislukt.');
    } finally {
      setIsHealingAll(false);
    }
  };

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/voiceglot/list');
      const data = await res.json();
      setTranslations(data.translations || []);
    } catch (e) {
      toast.error('Kon vertalingen niet laden.');
    } finally {
      setLoading(false);
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
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
            Voiceglot Registry
          </HeadingInstrument>
        </ContainerInstrument>

        <ButtonInstrument 
          onClick={handleHealAll}
          disabled={isHealingAll}
          className="va-btn-pro !bg-primary flex items-center gap-2"
        >
          {isHealingAll ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {isHealingAll ? 'Vertaalwerk bezig...' : 'Vertaal Alles (AI)'}
        </ButtonInstrument>
      </SectionInstrument>

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
      </ContainerInstrument>

      {/* Table */}
      <div className="bg-white rounded-[32px] shadow-aura border border-black/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-va-off-white/50 border-b border-black/5">
              <th className="px-8 py-6 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Key & Taal</th>
              <th className="px-8 py-6 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Bron (NL)</th>
              <th className="px-8 py-6 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Vertaling</th>
              <th className="px-8 py-6 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Lifecycle</th>
              <th className="px-8 py-6 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {filtered.map((trans) => (
              <tr key={trans.id} className="group hover:bg-va-off-white/30 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-mono text-primary font-bold mb-1">{trans.translationKey}</span>
                    <span className="text-[11px] font-black uppercase text-va-black/20 tracking-widest">{trans.lang}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <TextInstrument className="text-[15px] text-va-black/60" title={trans.originalText}>
                    {trans.originalText}
                  </TextInstrument>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1 group/cell">
                    {editingId === trans.id ? (
                      <div className="flex gap-2 items-center">
                        <input 
                          autoFocus
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(trans);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="flex-grow bg-va-off-white border-2 border-primary/20 rounded-lg px-3 py-2 text-[15px] outline-none focus:border-primary transition-all"
                        />
                        <button 
                          onClick={() => handleSaveEdit(trans)}
                          disabled={isSaving}
                          className="p-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <TextInstrument 
                          className={cn("text-[15px] font-medium cursor-pointer hover:text-primary transition-colors flex-grow", trans.isLocked ? "text-va-black" : "text-blue-600")}
                          onClick={() => handleStartEdit(trans)}
                        >
                          {trans.translatedText}
                        </TextInstrument>
                        <Sparkles 
                          size={14} 
                          className="text-va-black/10 opacity-0 group-hover/cell:opacity-100 transition-opacity cursor-pointer hover:text-primary" 
                          onClick={() => handleStartEdit(trans)}
                        />
                      </div>
                    )}
                    {trans.lastAuditedAt && (
                      <span className="text-[10px] text-va-black/20 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Gescand: {new Date(trans.lastAuditedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    {trans.isLocked ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-va-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <Lock size={10} /> Locked
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles size={10} /> Auto
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => toggleLock(trans.id, trans.isLocked)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        trans.isLocked ? "bg-va-black text-white" : "bg-va-off-white text-va-black/40 hover:text-va-black"
                      )}
                      title={trans.isLocked ? "Ontgrendelen" : "Vergrendelen"}
                    >
                      {trans.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button 
                      className="p-2 bg-va-off-white text-va-black/40 hover:text-primary rounded-lg transition-all"
                      title="Geschiedenis bekijken"
                    >
                      <History size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapperInstrument>
  );
}
