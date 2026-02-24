"use client";

import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument,
    LoadingScreenInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useEditMode } from '@/contexts/EditModeContext';
import {
    ArrowLeft,
    Save,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 *  PAGE EDITOR (CMS)
 * Bewerk pagina-content direct in de database.
 */
export default function PageEditorPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/admin/pages/${slug}`);
        const data = await res.json();
        if (data.success) {
          setPage(data.page);
          setBlocks(data.blocks || []);
        }
      } catch (e) {
        console.error('Failed to fetch page', e);
        toast.error('Pagina laden mislukt');
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchPage();
  }, [slug]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          blocks: blocks
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Pagina succesvol opgeslagen');
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error('Failed to save page', e);
      toast.error('Opslaan mislukt');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingScreenInstrument />;

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1200px] mx-auto min-h-screen">
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link href="/admin/pages" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_pages" defaultText="Terug naar overzicht" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
            {page?.title || 'Pagina Bewerken'}
          </HeadingInstrument>
        </ContainerInstrument>

        <ButtonInstrument 
          onClick={handleSave}
          disabled={isSaving}
          className="va-btn-pro !bg-va-black flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          <VoiceglotText translationKey="admin.save_page" defaultText="Pagina Opslaan" />
        </ButtonInstrument>
      </SectionInstrument>

      <ContainerInstrument className="space-y-8">
        <ContainerInstrument className="bg-white p-8 rounded-[40px] border border-black/5 shadow-aura">
          <HeadingInstrument level={2} className="text-2xl font-light mb-6">Algemene Informatie</HeadingInstrument>
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-black tracking-widest text-black/30 uppercase mb-2 block">Titel</label>
              <input 
                type="text" 
                value={page?.title || ''} 
                onChange={(e) => setPage({ ...page, title: e.target.value })}
                className="w-full bg-va-off-white border border-black/5 rounded-[10px] px-6 py-4 text-[15px] font-medium"
              />
            </div>
            <div>
              <label className="text-[13px] font-black tracking-widest text-black/30 uppercase mb-2 block">Slug</label>
              <input 
                type="text" 
                value={page?.slug || ''} 
                disabled
                className="w-full bg-va-off-white/50 border border-black/5 rounded-[10px] px-6 py-4 text-[15px] font-medium text-black/20"
              />
            </div>
          </div>
        </ContainerInstrument>

        <ContainerInstrument className="space-y-6">
          <HeadingInstrument level={2} className="text-2xl font-light">Content Blocks</HeadingInstrument>
          {blocks.map((block, index) => (
            <ContainerInstrument key={block.id} className="bg-white p-8 rounded-[40px] border border-black/5 shadow-aura">
              <div className="flex justify-between items-center mb-6">
                <TextInstrument className="px-4 py-1 bg-primary/10 text-primary rounded-full text-[13px] font-black tracking-widest">
                  {block.type.toUpperCase()}
                </TextInstrument>
                <TextInstrument className="text-black/20 text-[13px] font-black tracking-widest">#{index + 1}</TextInstrument>
              </div>
              <textarea 
                value={block.content || ''} 
                onChange={(e) => {
                  const newBlocks = [...blocks];
                  newBlocks[index].content = e.target.value;
                  setBlocks(newBlocks);
                }}
                rows={10}
                className="w-full bg-va-off-white border border-black/5 rounded-[10px] px-6 py-4 text-[15px] font-medium font-mono"
              />
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
