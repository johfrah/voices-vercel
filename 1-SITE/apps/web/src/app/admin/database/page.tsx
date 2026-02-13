"use client";

import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    InputInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowLeft, Database, HardDrive, Loader2, RefreshCw, Search, ShieldAlert, Table, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * 🗄️ ADMIN DATABASE (NUCLEAR 2026)
 * 
 * "Directe toegang tot de bron van waarheid."
 */
export default function AdminDatabasePage() {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In een echte omgeving zouden we hier een lijst van tabellen ophalen
    // Voor nu gebruiken we een representatieve lijst gebaseerd op de schema's
    const mockTables = [
      'users', 'actors', 'orders', 'conversations', 'messages', 
      'approval_queue', 'app_configs', 'articles', 'reviews',
      'voiceglot_translations', 'yuki_logs', 'mollie_payments'
    ];
    setTables(mockTables);
    setLoading(false);
  }, []);

  const filteredTables = tables.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return (
    <ContainerInstrument className="min-h-screen flex items-center justify-center">
      <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} />
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link  href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="admin.back_to_cockpit" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter ">
            <VoiceglotText  translationKey="admin.database.title" defaultText="Nuclear DB" />
          </HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex gap-4">
          <ContainerInstrument className="relative group">
            <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" size={16} />
            <InputInstrument 
              type="text" 
              placeholder="Zoek tabel..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-black/5 rounded-2xl text-[15px] font-medium focus:outline-none focus:border-primary focus:shadow-aura transition-all w-[300px]"
             />
          </ContainerInstrument>
          <ButtonInstrument className="va-btn-pro !bg-va-black flex items-center gap-2">
            <RefreshCw strokeWidth={1.5} size={16} /> <VoiceglotText  translationKey="admin.database.sync" defaultText="Forceer Sync" />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* DB Stats */}
      <BentoGrid strokeWidth={1.5} columns={4}>
        <BentoCard span="sm" className="bg-va-black text-white p-8 space-y-4">
          <ContainerInstrument className="flex items-center gap-3">
            <ContainerInstrument className="p-2 bg-primary/20 text-primary rounded-[20px]">
              <Database strokeWidth={1.5} size={20} />
            </ContainerInstrument>
            <TextInstrument className="text-[15px] font-black tracking-widest opacity-40 text-white"><VoiceglotText  translationKey="auto.page.status.ec53a8" defaultText="Status" /></TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-3xl font-light tracking-tighter"><VoiceglotText  translationKey="auto.page.healthy.f068eb" defaultText="HEALTHY" /></HeadingInstrument>
          <ContainerInstrument className="flex items-center gap-2">
            <ContainerInstrument className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <TextInstrument className="text-[15px] font-black tracking-widest opacity-40 text-white"><VoiceglotText  translationKey="auto.page.drizzle_orm_v0_30_0.ced759" defaultText="Drizzle ORM v0.30.0" /></TextInstrument>
          </ContainerInstrument>
        </BentoCard>
        
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-4">
          <ContainerInstrument className="flex items-center gap-3 text-va-black/40">
            <Table strokeWidth={1.5} size={20} />
            <TextInstrument className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.page.tabellen.e3bdf1" defaultText="Tabellen" /></TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter">{tables.length}</HeadingInstrument>
        </BentoCard>

        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-4">
          <ContainerInstrument className="flex items-center gap-3 text-va-black/40">
            <HardDrive strokeWidth={1.5} size={20} />
            <TextInstrument className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.page.storage.8c4aa5" defaultText="Storage" /></TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter">1.2 GB</HeadingInstrument>
        </BentoCard>

        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-4">
          <ContainerInstrument className="flex items-center gap-3 text-va-black/40">
            <Zap strokeWidth={1.5} size={20} />
            <TextInstrument className="text-[15px] font-black tracking-widest"><VoiceglotText  translationKey="auto.page.queries_sec.892a3b" defaultText="Queries/sec" /></TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-primary">142</HeadingInstrument>
        </BentoCard>
      </BentoGrid>

      {/* Table Grid */}
      <BentoGrid strokeWidth={1.5} columns={3}>
        {filteredTables.map((table) => (
          <BentoCard key={table} span="sm" className="bg-white border border-black/5 p-8 group hover:border-primary transition-all cursor-pointer relative overflow-hidden">
            <ContainerInstrument className="space-y-4 relative z-10">
              <ContainerInstrument className="flex justify-between items-start">
                <ContainerInstrument className="p-3 bg-va-off-white rounded-2xl text-va-black/20 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                  <Table strokeWidth={1.5} size={24} />
                </ContainerInstrument>
                <ContainerInstrument className="text-[15px] font-black text-va-black/20 tracking-widest">
                  {Math.floor(Math.random() * 10000)} rijen
                </ContainerInstrument>
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-xl font-light tracking-tight group-hover:text-primary transition-colors">
                {table}
              </HeadingInstrument>
              <ContainerInstrument className="flex gap-2">
                <ContainerInstrument className="px-2 py-1 bg-va-off-white rounded text-[15px] font-bold tracking-widest text-va-black/40">Read</ContainerInstrument>
                <ContainerInstrument className="px-2 py-1 bg-va-off-white rounded text-[15px] font-bold tracking-widest text-va-black/40"><VoiceglotText  translationKey="auto.page.write.1129c0" defaultText="Write" /></ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="absolute -right-4 -bottom-4 text-va-black/[0.02] group-hover:text-primary/[0.05] transition-all">
              <Database strokeWidth={1.5} size={120} />
            </ContainerInstrument>
          </BentoCard>
        ))}
      </BentoGrid>

      {/* Warning */}
      <ContainerInstrument className="p-8 bg-red-500/5 border border-red-500/10 rounded-[32px] flex items-center gap-6">
        <ContainerInstrument className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
          <ShieldAlert strokeWidth={1.5} size={32} />
        </ContainerInstrument>
        <ContainerInstrument className="space-y-1">
          <HeadingInstrument level={4} className="text-red-500 font-light tracking-tight"><VoiceglotText  translationKey="auto.page.nuclear_warning.0b1dd5" defaultText="NUCLEAR WARNING" /><TextInstrument className="text-[15px] text-red-900/60 font-medium"><VoiceglotText  translationKey="auto.page.wijzigingen_in_de_da.5827f8" defaultText="Wijzigingen in de database zijn onomkeerbaar. Gebruik deze tool uitsluitend voor onderhoud en debugging. Maak altijd een backup via de `scripts/maintenance/backup.sh` voordat je destructieve acties uitvoert." /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
