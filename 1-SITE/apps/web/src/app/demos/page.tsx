"use client";

import { ContainerInstrument, HeadingInstrument, SectionInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Play, FileText, ChevronRight, Globe, Zap, Shield, Phone, Video, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import nextDynamic from "next/dynamic";

// NUCLEAR LOADING MANDATE
const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-va-off-white" />
});

/**
 * DEMO DISCOVERY ENGINE (MASTERCLASS 2026)
 * 
 * Een intelligente interface om de verrijkte audio-data en blueprints te verkennen.
 * Gevoed door de 'Sonic Intelligence' laag (Sectors, Blueprints, Media Intelligence).
 */
export default function DemoDiscoveryPage() {
  const [mounted, setMounted] = useState(false);
  const [sectors, setSectors] = useState<any[]>([]);
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDemoId, setActiveDemoId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchDiscoveryData();
  }, []);

  const fetchDiscoveryData = async () => {
    setIsLoading(true);
    try {
      const [sectorsRes, blueprintsRes, demosRes] = await Promise.all([
        fetch('/api/admin/config?type=sectors').then(res => res.json()),
        fetch('/api/admin/config?type=blueprints').then(res => res.json()),
        fetch('/api/admin/config?type=demos_enriched').then(res => res.json())
      ]);

      setSectors(sectorsRes.results || []);
      setBlueprints(blueprintsRes.results || []);
      setDemos(demosRes.results || []);
    } catch (err) {
      console.error('Failed to fetch discovery data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDemos = useMemo(() => {
    return demos.filter(demo => {
      const matchesSector = !selectedSector || demo.sector_id === parseInt(selectedSector);
      const matchesSearch = !searchQuery || 
        demo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        demo.actor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        demo.transcript?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSector && matchesSearch;
    });
  }, [demos, selectedSector, searchQuery]);

  if (!mounted) return null;

  return (
    <>
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>

      <SectionInstrument className="!pt-40 pb-32 relative z-50">
        <ContainerInstrument plain className="max-w-[1440px] mx-auto px-6 md:px-12">
          
          {/* Header */}
          <div className="mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap size={14} className="text-primary animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Sonic Intelligence Discovery</span>
            </div>
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black max-w-4xl">
              Ontdek de *stem* van jouw sector.
            </HeadingInstrument>
            <TextInstrument className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight max-w-2xl">
              Verken duizenden geanalyseerde demo's en blueprints, direct gekoppeld aan jouw branche.
            </TextInstrument>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            <div className="lg:col-span-8 relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors">
                <Search size={20} strokeWidth={1.5} />
              </div>
              <input 
                type="text"
                placeholder="Zoek op sector, keyword of acteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-20 bg-white/80 backdrop-blur-xl border border-black/5 rounded-[24px] pl-16 pr-8 text-xl font-light outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-aura-sm"
              />
            </div>
            <div className="lg:col-span-4">
              <select 
                value={selectedSector || ""}
                onChange={(e) => setSelectedSector(e.target.value || null)}
                className="w-full h-20 bg-white/80 backdrop-blur-xl border border-black/5 rounded-[24px] px-8 text-xl font-light outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-aura-sm"
              >
                <option value="">Alle Sectoren</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                // Skeletons
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-[300px] bg-va-black/5 rounded-[32px] animate-pulse" />
                ))
              ) : filteredDemos.length > 0 ? (
                filteredDemos.map((demo) => (
                  <motion.div
                    key={demo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white/60 backdrop-blur-md border border-black/5 rounded-[32px] p-8 hover:bg-white hover:shadow-aura-lg transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{demo.sector_name || "Algemeen"}</p>
                        <h3 className="text-2xl font-light tracking-tight text-va-black">{demo.actor_name}</h3>
                        <p className="text-[14px] text-va-black/40 font-light italic">"{demo.name}"</p>
                      </div>
                      <button 
                        onClick={() => setActiveDemoId(activeDemoId === demo.id ? null : demo.id)}
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                          activeDemoId === demo.id ? "bg-va-black text-primary scale-110" : "bg-va-off-white text-va-black/20 group-hover:bg-primary/10 group-hover:text-primary"
                        )}
                      >
                        {activeDemoId === demo.id ? <Play size={24} fill="currentColor" /> : <Play size={24} strokeWidth={1.5} />}
                      </button>
                    </div>

                    {/* Transcript / Blueprint Preview */}
                    <div className="bg-va-off-white/50 rounded-2xl p-5 mb-6 relative z-10">
                      <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-va-black/20">
                        <FileText size={12} />
                        <span>Transcript Blueprint</span>
                      </div>
                      <p className="text-[14px] font-light text-va-black/60 leading-relaxed line-clamp-3">
                        {demo.transcript || "Analyseert audio..."}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-va-black/5 text-[11px] font-bold text-va-black/40">
                        <Globe size={12} />
                        {demo.language_label || "NL"}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-va-black/5 text-[11px] font-bold text-va-black/40">
                        <Shield size={12} />
                        {demo.media_type_label || "Telefonie"}
                      </div>
                    </div>

                    {/* Background Decor */}
                    <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-primary/5 blur-[40px] rounded-full group-hover:bg-primary/10 transition-colors duration-700" />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center space-y-4">
                  <div className="w-20 h-20 bg-va-off-white rounded-full flex items-center justify-center mx-auto text-va-black/10">
                    <Search size={40} strokeWidth={1} />
                  </div>
                  <h3 className="text-2xl font-light text-va-black/40">Geen demo's gevonden voor deze filters.</h3>
                  <button onClick={() => { setSelectedSector(null); setSearchQuery(""); }} className="text-primary font-bold uppercase tracking-widest text-[11px] hover:underline">Reset Filters</button>
                </div>
              )}
            </AnimatePresence>
          </div>

        </ContainerInstrument>
      </SectionInstrument>
    </>
  );
}
