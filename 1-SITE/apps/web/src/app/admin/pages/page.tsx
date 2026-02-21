"use client";

import { BentoCard } from '@/components/ui/BentoGrid';
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
import { useEditMode } from '@/contexts/EditModeContext';
import {
    ArrowLeft,
    ArrowRight,
    ChevronRight,
    FileText,
    Globe,
    Plus,
    Search,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PageRecord {
  id: number;
  title: string;
  slug: string;
  iapContext: any;
  updatedAt: string;
}

/**
 *  PAGE ARCHITECT (CMS)
 * Beheer alle pagina-content direct in de database.
 */
export default function PageArchitectPage() {
  const { isEditMode, toggleEditMode } = useEditMode();
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch('/api/admin/pages');
        const data = await res.json();
        if (data.success) {
          setPages(data.pages);
        }
      } catch (e) {
        console.error('Failed to fetch pages', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPages();
  }, []);

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link  href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="admin.back_to_dashboard" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter ">
            <VoiceglotText  translationKey="admin.architect.title" defaultText="Page Architect" />
          </HeadingInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="flex gap-4 items-center">
          <ContainerInstrument className="relative">
            <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
            <InputInstrument 
              type="text" 
              placeholder="Zoek pagina..."
              className="bg-white border border-black/5 rounded-2xl pl-12 pr-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all w-80 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </ContainerInstrument>
          
          <ButtonInstrument className="va-btn-pro !bg-va-black flex items-center gap-2">
            <Plus strokeWidth={1.5} size={16} /> <VoiceglotText  translationKey="admin.architect.new" defaultText="Nieuwe Pagina" />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pages.map((page) => (
          <BentoCard key={page.id} span="sm" className="bg-white border border-black/5 p-8 rounded-[40px] hover:shadow-aura transition-all group flex flex-col justify-between h-[320px]">
            <ContainerInstrument>
              <ContainerInstrument className="flex justify-between items-start mb-6">
                <ContainerInstrument className="w-12 h-12 bg-va-off-white rounded-2xl flex items-center justify-center text-va-black/20 group-hover:text-primary transition-colors">
                  <FileText strokeWidth={1.5} size={24} />
                </ContainerInstrument>
                <ContainerInstrument className="flex gap-2">
                  <TextInstrument className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[15px] font-black tracking-widest border border-primary/10">
                    {page.iapContext?.journey || 'common'}
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-2">
                <VoiceglotText  translationKey={`page.${page.slug}.title`} defaultText={page.title} noTranslate={true} />
              </HeadingInstrument>
              <TextInstrument className="text-[15px] font-black text-va-black/20 tracking-widest">
                /<VoiceglotText  translationKey={`page.${page.slug}.slug`} defaultText={page.slug} noTranslate={true} />
              </TextInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="flex items-center justify-between pt-8 border-t border-black/5">
              <ContainerInstrument className="flex items-center gap-2 text-va-black/20">
                <Globe strokeWidth={1.5} size={12} />
                <TextInstrument className="text-[15px] font-bold tracking-widest">
                  <VoiceglotText  translationKey="common.status.live" defaultText="Live" />
                </TextInstrument>
              </ContainerInstrument>
              <Link  href={`/admin/pages/${page.slug}`} className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-va-black/20 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <ChevronRight strokeWidth={1.5} size={18} />
              </Link>
            </ContainerInstrument>
          </BentoCard>
        ))}

        <BentoCard span="sm" className="bg-va-black text-white p-8 rounded-[40px] relative overflow-hidden flex flex-col justify-between">
          <ContainerInstrument className="relative z-10">
            <Zap strokeWidth={1.5} className="text-primary mb-6" size={32} />
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-4"><VoiceglotText  translationKey="auto.page.page_intelligence.34032c" defaultText="Page Intelligence" /><TextInstrument className="text-white/40 text-[15px] font-medium leading-relaxed"><VoiceglotText  translationKey="auto.page.voicy_analyseert_wel.dcb226" defaultText="Voicy analyseert welke pagina&apos;s het beste converteren. Er zijn 2 nieuwe optimalisatie-suggesties voor de Academy." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <ButtonInstrument className="relative z-10 text-[15px] font-black tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all">
            Bekijk Suggesties <ArrowRight strokeWidth={1.5} size={12} />
          </ButtonInstrument>
          <ContainerInstrument className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[60px]" />
        </BentoCard>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
