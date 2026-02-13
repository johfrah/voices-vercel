"use client";

import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, OptionInstrument, PageWrapperInstrument, SectionInstrument, SelectInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ArrowLeft, Calendar, Download, FileText, Hash, Mic, Search, Shield, User, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

/**
 * 🏛️ THE VAULT BROWSER
 * 
 * De centrale interface voor alle privé documenten en inbound assets.
 * Relationeel gelinkt aan Projecten, Klanten en Stemmen.
 */
export default function VaultBrowserPage() {
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchFiles = React.useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/vault/browse?category=${categoryFilter}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      if (projectIdFilter) url += `&projectId=${projectIdFilter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('❌ Vault Fetch Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchQuery, projectIdFilter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'script': return <FileText strokeWidth={1.5} size={16} className="text-blue-500" / />;
      case 'briefing': return <Shield strokeWidth={1.5} size={16} className="text-orange-500" />;
      case 'demo_inbound': return <Mic strokeWidth={1.5} size={16} className="text-purple-500" / />;
      case 'example_video': return <Video strokeWidth={1.5} size={16} className="text-red-500" / />;
      default: return <FileText strokeWidth={1.5} size={16} className="text-va-black/20" / />;
    }
  };

  return (
    <PageWrapperInstrument className="va-page-wrapper">
      <SectionInstrument className="va-section-grid pt-32">
        <ContainerInstrument className="va-container">
          
          {/* Header */}
          <ContainerInstrument className="mb-12 flex justify-between items-end border-b border-black/5 pb-8">
            <ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-3 mb-2">
                <ButtonInstrument onClick={() => router.back()} className="p-2 hover:bg-va-off-white rounded-[10px] transition-colors">
                  <ArrowLeft strokeWidth={1.5} size={16} />
                </ButtonInstrument>
                <HeadingInstrument level={1} className="text-4xl font-light tracking-tight text-va-black">
                  <VoiceglotText translationKey="admin.vault.title" defaultText="The Vault" />
                  <TextInstrument as="span" className="text-primary text-2xl ml-2 font-extralight"><VoiceglotText translationKey="admin.vault.subtitle" defaultText="Kluis" /></TextInstrument>
                </HeadingInstrument>
              </ContainerInstrument>
              <TextInstrument className="text-va-black/40 tracking-widest text-[15px] font-light flex items-center gap-2 ">
                <Shield strokeWidth={1.5} size={12} />
                <VoiceglotText translationKey="admin.vault.description" defaultText="Beveiligde Documenten & Inbound Assets" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Filters Bar */}
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-[20px] border border-black/5 shadow-sm">
            <ContainerInstrument className="relative">
              <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={16} / />
              <InputInstrument 
                placeholder="Zoek op bestandsnaam..." 
                className="pl-12 py-3 bg-va-off-white border-none rounded-[10px] text-[15px] font-light"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e: any) => e.key === 'Enter' && fetchFiles()}
              />
            </ContainerInstrument>
            <ContainerInstrument className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={16} />
              <InputInstrument 
                placeholder="Project ID (6 cijfers)" 
                className="pl-12 py-3 bg-va-off-white border-none rounded-[10px] text-[15px] font-light"
                value={projectIdFilter}
                onChange={(e) => setProjectIdFilter(e.target.value)}
                onKeyDown={(e: any) => e.key === 'Enter' && fetchFiles()}
              />
            </ContainerInstrument>
            <SelectInstrument 
              className="py-3 px-4 bg-va-off-white border-none rounded-[10px] text-[15px] font-light appearance-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <OptionInstrument value="all"><VoiceglotText translationKey="admin.vault.filter.all" defaultText="Alle Categorieën" /></OptionInstrument>
              <OptionInstrument value="script"><VoiceglotText translationKey="admin.vault.filter.scripts" defaultText="Scripts" /></OptionInstrument>
              <OptionInstrument value="briefing"><VoiceglotText translationKey="admin.vault.filter.briefings" defaultText="Briefings" /></OptionInstrument>
              <OptionInstrument value="demo_inbound"><VoiceglotText translationKey="admin.vault.filter.demos" defaultText="Inbound Demo's" /></OptionInstrument>
              <OptionInstrument value="contract"><VoiceglotText translationKey="admin.vault.filter.contracts" defaultText="Contracten" /></OptionInstrument>
            </SelectInstrument>
            <ButtonInstrument 
              onClick={fetchFiles}
              className="bg-va-black text-white rounded-[10px] font-light tracking-widest text-[15px] hover:bg-primary transition-all "
            >
              <VoiceglotText translationKey="admin.vault.filter.btn" defaultText="Filteren" />
            </ButtonInstrument>
          </ContainerInstrument>

          {/* Files Grid */}
          {isLoading ? (
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
              {[1,2,3,4,5,6,7,8].map(i => (
                <ContainerInstrument key={i} className="h-48 bg-va-off-white rounded-[20px]" />
              ))}
            </ContainerInstrument>
          ) : files.length > 0 ? (
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <ContainerInstrument key={file.id} className="bg-white p-5 rounded-[20px] border border-black/5 shadow-sm hover:shadow-md transition-all group">
                  <ContainerInstrument className="flex justify-between items-start mb-4">
                    <ContainerInstrument className="p-3 bg-va-off-white rounded-[10px] group-hover:bg-va-black group-hover:text-white transition-colors">
                      {getCategoryIcon(file.category)}
                    </ContainerInstrument>
                    <ContainerInstrument className="flex gap-2">
                      <ButtonInstrument className="p-2 hover:bg-va-off-white rounded-[10px] transition-colors text-va-black/20 hover:text-va-black">
                        <Download strokeWidth={1.5} size={16} / />
                      </ButtonInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  <HeadingInstrument level={3} className="font-light text-[15px] mb-1 truncate text-va-black" title={file.originalName}>
                    {file.originalName}
                  </HeadingInstrument>
                  
                  <ContainerInstrument className="space-y-2">
                    <ContainerInstrument className="flex items-center gap-2 text-[15px] text-va-black/20 font-light tracking-widest ">
                      <Calendar strokeWidth={1.5} size={10} />
                      {format(new Date(file.createdAt), 'dd MMM yyyy', { locale: nl })}
                    </ContainerInstrument>
                    
                    {file.customer && (
                      <ContainerInstrument className="flex items-center gap-2 text-[15px] text-va-black/40 font-light">
                        <User strokeWidth={1.5} size={10} />
                        {file.customer.firstName} {file.customer.lastName}
                      </ContainerInstrument>
                    )}

                    {file.project && (
                      <ContainerInstrument className="inline-block px-2 py-1 bg-primary/5 text-primary rounded-[20px] text-[15px] font-light tracking-widest ">
                        <VoiceglotText translationKey="admin.vault.project_id" defaultText="Project" /> #{file.project.wpOrderId}
                      </ContainerInstrument>
                    )}
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          ) : (
            <ContainerInstrument className="text-center py-20 bg-va-off-white rounded-[20px] border-2 border-dashed border-black/5">
              <Shield strokeWidth={1.5} size={48} className="mx-auto text-va-black/10 mb-4" />
              <TextInstrument className="text-va-black/40 font-light"><VoiceglotText translationKey="admin.vault.empty" defaultText="Geen bestanden gevonden in de kluis." /></TextInstrument>
            </ContainerInstrument>
          )}

        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
