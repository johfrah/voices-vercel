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
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { 
  Search, 
  RefreshCw, 
  Link as LinkIcon, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Globe,
  Database,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

/**
 * 🏛️ ROUTING COMMAND CENTER (GOD MODE 2026)
 * 
 * Visueel beheer van de slug_registry en platform integriteit.
 */
export default function RoutingDashboardPage() {
  const { playClick } = useSonicDNA();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [slugs, setSlugs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    redirects: 0,
    actors: 0,
    articles: 0
  });

  useEffect(() => {
    fetchSlugs();
  }, []);

  const fetchSlugs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/routing/list');
      const data = await res.json();
      if (res.ok) {
        setSlugs(data.slugs);
        setStats(data.stats);
      } else {
        toast.error('Kon routing data niet laden');
      }
    } catch (e) {
      toast.error('Netwerkfout bij ophalen slugs');
    } finally {
      setLoading(false);
    }
  };

  const handleNuclearSync = async () => {
    if (!confirm('Dit regenereert de volledige sitemap en synchroniseert alle slugs met de database. Doorgaan?')) return;
    
    setSyncing(true);
    playClick('pro');
    toast.loading('Nuclear Sync bezig...', { id: 'sync' });

    try {
      const res = await fetch('/api/admin/routing/sync', { method: 'POST' });
      if (res.ok) {
        toast.success('Platform Integrity Synced!', { id: 'sync' });
        playClick('success');
        fetchSlugs();
      } else {
        throw new Error('Sync mislukt');
      }
    } catch (e) {
      toast.error('Sync Error: Probeer het handmatig via de terminal', { id: 'sync' });
    } finally {
      setSyncing(false);
    }
  };

  const filteredSlugs = slugs.filter(s => {
    const matchesSearch = s.slug.toLowerCase().includes(search.toLowerCase()) || 
                         (s.canonical_slug && s.canonical_slug.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' || s.routing_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <div className="flex items-center gap-3 text-va-black/30 text-[15px] font-light tracking-widest uppercase">
            <ShieldCheck size={16} />
            Directiekamer
          </div>
          <HeadingInstrument level={1} className="text-7xl font-light tracking-tighter">
            Routing <span className="text-primary">Ledger</span>
          </HeadingInstrument>
        </ContainerInstrument>

        <div className="flex gap-4">
          <ButtonInstrument 
            onClick={fetchSlugs}
            className="va-btn-pro !bg-white !text-va-black border border-black/5"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
          </ButtonInstrument>
          <ButtonInstrument 
            onClick={handleNuclearSync}
            disabled={syncing}
            className="va-btn-pro flex items-center gap-3 !bg-va-black !text-white hover:!bg-primary transition-all duration-500"
          >
            {syncing ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
            Nuclear Sync
          </ButtonInstrument>
        </div>
      </SectionInstrument>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Totaal Slugs', value: stats.total, icon: LinkIcon, color: 'text-va-black' },
          { label: 'Redirects', value: stats.redirects, icon: RefreshCw, color: 'text-amber-500' },
          { label: 'Stemmen', value: stats.actors, icon: Globe, color: 'text-blue-500' },
          { label: 'Artikelen', value: stats.articles, icon: CheckCircle2, color: 'text-green-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] shadow-aura border border-black/5 space-y-2">
            <div className="flex justify-between items-start">
              <stat.icon size={24} className={cn("opacity-20", stat.color)} />
              <span className={cn("text-4xl font-light tracking-tighter", stat.color)}>{stat.value}</span>
            </div>
            <div className="text-[11px] font-black uppercase tracking-widest text-va-black/20">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <ContainerInstrument className="flex gap-4 items-center bg-white p-6 rounded-[24px] shadow-aura border border-black/5">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
          <InputInstrument 
            placeholder="Zoek op slug of bestemming..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 bg-va-off-white border-none rounded-xl py-4"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-va-off-white border-none rounded-xl py-4 px-6 text-[15px] font-medium outline-none"
        >
          <option value="all">Alle Types</option>
          <option value="actor">Stemmen</option>
          <option value="article">Artikelen</option>
          <option value="blog">Blog</option>
          <option value="language">Talen</option>
          <option value="country">Landen</option>
          <option value="attribute">Kenmerken</option>
        </select>
      </ContainerInstrument>

      {/* Main Table */}
      <div className="bg-white rounded-[40px] shadow-aura border border-black/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-va-off-white/50 border-b border-black/5">
              <th className="px-10 py-8 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">URL (Slug)</th>
              <th className="px-10 py-8 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Type</th>
              <th className="px-10 py-8 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Bestemming / Canonical</th>
              <th className="px-10 py-8 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Markt</th>
              <th className="px-10 py-8 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary/20" size={40} />
                </td>
              </tr>
            ) : filteredSlugs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-va-black/20 font-light italic">
                  Geen slugs gevonden die voldoen aan de criteria.
                </td>
              </tr>
            ) : filteredSlugs.map((s) => (
              <tr key={s.id} className="group hover:bg-va-off-white/30 transition-colors">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      s.canonical_slug ? "bg-amber-400" : "bg-green-400"
                    )} />
                    <span className="font-mono text-[14px] font-medium text-va-black">/{s.slug}</span>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <span className="px-3 py-1 bg-va-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-va-black/40">
                    {s.routing_type}
                  </span>
                </td>
                <td className="px-10 py-6">
                  {s.canonical_slug ? (
                    <div className="flex items-center gap-2 text-amber-600">
                      <RefreshCw size={12} />
                      <span className="font-mono text-[13px]">/{s.canonical_slug}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-va-black/40">
                      <Database size={12} />
                      <span className="text-[13px]">Entity ID: {s.entity_id}</span>
                    </div>
                  )}
                </td>
                <td className="px-10 py-6">
                  <span className="text-[12px] font-bold text-va-black/20">{s.market_code}</span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={`/${s.slug}`} 
                      target="_blank" 
                      className="p-3 bg-va-off-white hover:bg-primary hover:text-white rounded-xl transition-all"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button className="p-3 bg-va-off-white hover:bg-red-500 hover:text-white rounded-xl transition-all">
                      <Trash2 size={14} />
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
