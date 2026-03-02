"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGridInstrument';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  ChevronUp, 
  ChevronDown, 
  Settings, 
  Eye, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';

const AVAILABLE_INSTRUMENTS = [
  { type: 'HeroInstrument', label: 'Hero Sectie', icon: Layout, description: 'Grote binnenkomer met foto\'s en CTA.' },
  { type: 'PricingInstrument', label: 'Prijs Calculator', icon: LinkIcon, description: 'Interactieve voice-over calculator.' },
  { type: 'CTAInstrument', label: 'Call to Action', icon: Plus, description: 'Opvallende knop-sectie voor conversie.' },
  { type: 'ReviewsInstrument', label: 'Reviews', icon: Eye, description: 'Social proof carrousel.' },
  { type: 'HowItWorksInstrument', label: 'Hoe het werkt', icon: Type, description: 'Stappenplan gids.' },
  { type: 'BentoShowcase', label: 'Bento Showcase', icon: Layout, description: 'Modern grid met video\'s en iconen.' },
  { type: 'AccordionInstrument', label: 'FAQ / Accordion', icon: Type, description: 'Vragen en antwoorden.' }
];

export default function PageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [activeBlock, setActiveBlock] = useState<number | null>(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${slug}`);
      const data = await res.json();
      if (data.success) {
        setPage(data.page);
        setBlocks(data.blocks || []);
      } else {
        toast.error('Pagina niet gevonden.');
        router.push('/admin/pages');
      }
    } catch (error) {
      toast.error('Fout bij laden pagina.');
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: {
            title: page.title,
            seoData: page.seoData
          },
          blocks: blocks.map((b, idx) => ({
            ...b,
            displayOrder: idx
          }))
        })
      });
      if (res.ok) {
        toast.success('Pagina succesvol opgeslagen!');
      } else {
        toast.error('Fout bij opslaan.');
      }
    } catch (error) {
      toast.error('Er is een fout opgetreden.');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: string) => {
    const newBlock = {
      type,
      settings: {
        data: {
          title: 'Nieuwe ' + type,
          subtitle: 'Vul hier je tekst in...'
        }
      },
      displayOrder: blocks.length
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlock(blocks.length);
    toast.success(`${type} toegevoegd!`);
  };

  const removeBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
    setActiveBlock(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
    setActiveBlock(targetIndex);
  };

  const updateBlockData = (index: number, field: string, value: any) => {
    const newBlocks = [...blocks];
    newBlocks[index].settings.data[field] = value;
    setBlocks(newBlocks);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <ContainerInstrument>
          <Link href="/admin/pages" className="inline-flex items-center gap-2 text-[13px] font-black tracking-widest text-black/30 hover:text-primary transition-colors mb-4 uppercase">
            <ArrowLeft size={14} strokeWidth={2.5} /> Terug naar Architect
          </Link>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">
            {page.title} <TextInstrument as="span" className="text-primary font-light">Editor.</TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light mt-2 tracking-widest uppercase text-[12px]">
            Slug: /{page.slug} | World ID: {page.world_id || 'Common'}
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument 
            as="a" 
            href={`/${page.slug}`} 
            target="_blank"
            variant="plain" 
            className="bg-va-off-white text-va-black px-6 py-3 rounded-xl flex items-center gap-2 border border-black/5 hover:bg-black/5 transition-all"
          >
            <Eye size={18} /> BEKIJK LIVE
          </ButtonInstrument>
          <ButtonInstrument 
            onClick={handleSave}
            disabled={saving}
            className="bg-va-black text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-primary transition-all shadow-lg"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} OPSLAAN
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT: BLOCK LIST & BUILDER */}
        <div className="lg:col-span-4 space-y-8">
          <BentoCard span="full" className="bg-white p-8 border border-black/5 shadow-aura">
            <div className="flex items-center justify-between mb-8">
              <TextInstrument className="text-[15px] font-black tracking-widest uppercase text-black/40">Pagina Structuur</TextInstrument>
              <TextInstrument className="text-[11px] font-bold text-primary px-2 py-1 bg-primary/5 rounded-md uppercase tracking-widest">{blocks.length} BLOKKEN</TextInstrument>
            </div>

            <div className="space-y-3">
              {blocks.map((block, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveBlock(idx)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                    activeBlock === idx ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-va-off-white border-black/5 hover:border-black/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-va-black text-white flex items-center justify-center text-[11px] font-black">{idx + 1}</div>
                    <div>
                      <div className={cn("text-[14px] font-medium", activeBlock === idx ? "text-primary" : "text-va-black")}>{block.type}</div>
                      <div className="text-[11px] text-va-black/30 truncate max-w-[150px]">{block.settings?.data?.title || 'Geen titel'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'up'); }} className="p-1.5 hover:bg-black/5 rounded-lg"><ChevronUp size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'down'); }} className="p-1.5 hover:bg-black/5 rounded-lg"><ChevronDown size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeBlock(idx); }} className="p-1.5 hover:text-red-500 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {blocks.length === 0 && (
                <div className="py-12 text-center text-black/20 italic font-light border-2 border-dashed border-black/5 rounded-2xl">Sleep hier instrumenten naartoe of klik op een instrument hieronder.</div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-black/5">
              <TextInstrument className="text-[13px] font-black tracking-widest uppercase text-black/20 mb-6 block">Instrumentarium</TextInstrument>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_INSTRUMENTS.map((inst) => (
                  <button
                    key={inst.type}
                    onClick={() => addBlock(inst.type)}
                    className="flex flex-col items-center gap-3 p-4 bg-va-off-white border border-black/5 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
                  >
                    <inst.icon size={20} className="text-black/20 group-hover:text-primary transition-colors" />
                    <span className="text-[11px] font-black tracking-widest uppercase text-black/40 group-hover:text-va-black">{inst.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </BentoCard>
        </div>

        {/* RIGHT: BLOCK EDITOR */}
        <div className="lg:col-span-8">
          {activeBlock !== null ? (
            <BentoCard span="full" className="bg-white p-12 border border-black/5 shadow-aura min-h-[600px]">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    {(() => {
                      const inst = AVAILABLE_INSTRUMENTS.find(i => i.type === blocks[activeBlock].type);
                      const Icon = inst?.icon || Layout;
                      return <Icon size={24} />;
                    })()}
                  </div>
                  <div>
                    <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter">{blocks[activeBlock].type}</HeadingInstrument>
                    <TextInstrument className="text-[12px] text-va-black/40 font-light tracking-widest uppercase">Instrument Instellingen</TextInstrument>
                  </div>
                </div>
                <ButtonInstrument variant="plain" onClick={() => setActiveBlock(null)} className="text-va-black/30 hover:text-va-black">SLUIT EDITOR</ButtonInstrument>
              </div>

              <div className="space-y-8 max-w-2xl">
                <ContainerInstrument plain className="space-y-2">
                  <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase">Hoofdtitel</TextInstrument>
                  <InputInstrument 
                    value={blocks[activeBlock].settings?.data?.title || ''}
                    onChange={(e) => updateBlockData(activeBlock, 'title', e.target.value)}
                    className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[18px] font-medium"
                  />
                </ContainerInstrument>

                <ContainerInstrument plain className="space-y-2">
                  <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase">Subtekst / Beschrijving</TextInstrument>
                  <textarea 
                    rows={4}
                    value={blocks[activeBlock].settings?.data?.subtitle || ''}
                    onChange={(e) => updateBlockData(activeBlock, 'subtitle', e.target.value)}
                    className="w-full p-6 bg-va-off-white border-none rounded-xl text-[15px] font-light focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                  />
                </ContainerInstrument>

                <div className="grid grid-cols-2 gap-6">
                  <ContainerInstrument plain className="space-y-2">
                    <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase">Knop Tekst</TextInstrument>
                    <InputInstrument 
                      value={blocks[activeBlock].settings?.data?.ctaText || ''}
                      onChange={(e) => updateBlockData(activeBlock, 'ctaText', e.target.value)}
                      className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px]"
                    />
                  </ContainerInstrument>
                  <ContainerInstrument plain className="space-y-2">
                    <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase">Knop Link (URL of DNA)</TextInstrument>
                    <InputInstrument 
                      value={blocks[activeBlock].settings?.data?.ctaHref || ''}
                      onChange={(e) => updateBlockData(activeBlock, 'ctaHref', e.target.value)}
                      className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px]"
                    />
                  </ContainerInstrument>
                </div>

                <div className="pt-12 border-t border-black/5">
                  <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-6 block">Geavanceerde DNA Koppeling</TextInstrument>
                  <div className="p-6 bg-va-black rounded-2xl text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Settings className="text-primary" size={24} />
                      <div>
                        <div className="text-[15px] font-medium">Smart Data Injection</div>
                        <div className="text-[11px] text-white/40 uppercase tracking-widest">Koppel dit instrument aan een database entiteit</div>
                      </div>
                    </div>
                    <ButtonInstrument variant="plain" className="bg-white/10 text-white hover:bg-primary hover:text-va-black px-6 py-2 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all">KOPPEL DNA</ButtonInstrument>
                  </div>
                </div>
              </div>
            </BentoCard>
          ) : (
            <div className="bg-va-off-white rounded-[40px] border-2 border-dashed border-black/5 min-h-[600px] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-aura flex items-center justify-center text-va-black/10 mb-8">
                <Layout size={40} />
              </div>
              <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter text-va-black/20 mb-4">Selecteer een blok om te bewerken</HeadingInstrument>
              <TextInstrument className="text-va-black/20 max-w-xs font-light">Klik op een instrument in de linkerlijst om de inhoud, titels en instellingen aan te passen.</TextInstrument>
            </div>
          )}
        </div>
      </div>
    </PageWrapperInstrument>
  );
}
