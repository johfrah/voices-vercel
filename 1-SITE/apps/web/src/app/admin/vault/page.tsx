"use client";

import React, { useState, useEffect } from 'react';
import { ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, InputInstrument, PageWrapperInstrument, SectionInstrument, SelectInstrument, OptionInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Search, Filter, FileText, Mic, Video, Shield, ArrowLeft, Download, ExternalLink, Calendar, User, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

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
      case 'script': return <FileText size={16} className="text-blue-500" />;
      case 'briefing': return <Shield size={16} className="text-orange-500" />;
      case 'demo_inbound': return <Mic size={16} className="text-purple-500" />;
      case 'example_video': return <Video size={16} className="text-red-500" />;
      default: return <FileText size={16} className="text-gray-400" />;
    }
  };

  return (
    <PageWrapperInstrument className="va-page-wrapper">
      <SectionInstrument className="va-section-grid pt-32">
        <ContainerInstrument className="va-container">
          
          {/* Header */}
          <ContainerInstrument className="mb-12 flex justify-between items-end border-b border-gray-100 pb-8">
            <ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-3 mb-2">
                <ButtonInstrument onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ArrowLeft size={16} />
                </ButtonInstrument>
                <HeadingInstrument level={1} className="text-4xl font-bold tracking-tight text-black">
                  <VoiceglotText translationKey="admin.vault.title" defaultText="The Vault" />
                  <TextInstrument as="span" className="text-orange-500 text-2xl ml-2 font-light">
                    <VoiceglotText translationKey="admin.vault.subtitle" defaultText="Kluis" />
                  </TextInstrument>
                </HeadingInstrument>
              </ContainerInstrument>
              <TextInstrument className="text-gray-500 tracking-widest text-[15px] font-black flex items-center gap-2">
                <Shield size={12} />
                <VoiceglotText translationKey="admin.vault.description" defaultText="Beveiligde Documenten & Inbound Assets" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Filters Bar */}
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <ContainerInstrument className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <InputInstrument 
                placeholder="Zoek op bestandsnaam..." 
                className="pl-12 py-3 bg-gray-50 border-none rounded-2xl text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e: any) => e.key === 'Enter' && fetchFiles()}
              />
            </ContainerInstrument>
            <ContainerInstrument className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <InputInstrument 
                placeholder="Project ID (6 cijfers)" 
                className="pl-12 py-3 bg-gray-50 border-none rounded-2xl text-sm"
                value={projectIdFilter}
                onChange={(e) => setProjectIdFilter(e.target.value)}
                onKeyDown={(e: any) => e.key === 'Enter' && fetchFiles()}
              />
            </ContainerInstrument>
            <SelectInstrument 
              className="py-3 px-4 bg-gray-50 border-none rounded-2xl text-sm appearance-none cursor-pointer"
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
              className="bg-va-black text-white rounded-2xl font-black tracking-widest text-[15px] hover:scale-[1.02] transition-all"
            >
              <VoiceglotText translationKey="admin.vault.filter.btn" defaultText="Filteren" />
            </ButtonInstrument>
          </ContainerInstrument>

          {/* Files Grid */}
          {isLoading ? (
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
              {[1,2,3,4,5,6,7,8].map(i => (
                <ContainerInstrument key={i} className="h-48 bg-gray-100 rounded-3xl" />
              ))}
            </ContainerInstrument>
          ) : files.length > 0 ? (
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <ContainerInstrument key={file.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <ContainerInstrument className="flex justify-between items-start mb-4">
                    <ContainerInstrument className="p-3 bg-gray-50 rounded-2xl group-hover:bg-va-black group-hover:text-white transition-colors">
                      {getCategoryIcon(file.category)}
                    </ContainerInstrument>
                    <ContainerInstrument className="flex gap-2">
                      <ButtonInstrument className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-va-black">
                        <Download size={16} />
                      </ButtonInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  <HeadingInstrument level={3} className="font-bold text-sm mb-1 truncate" title={file.originalName}>
                    {file.originalName}
                  </HeadingInstrument>
                  
                  <ContainerInstrument className="space-y-2">
                    <ContainerInstrument className="flex items-center gap-2 text-[15px] text-gray-400 font-bold tracking-widest">
                      <Calendar size={10} />
                      {format(new Date(file.createdAt), 'dd MMM yyyy', { locale: nl })}
                    </ContainerInstrument>
                    
                    {file.customer && (
                      <ContainerInstrument className="flex items-center gap-2 text-[15px] text-gray-600 font-bold">
                        <User size={10} />
                        {file.customer.firstName} {file.customer.lastName}
                      </ContainerInstrument>
                    )}

                    {file.project && (
                      <ContainerInstrument className="inline-block px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-[15px] font-black tracking-widest">
                        <VoiceglotText translationKey="admin.vault.project_id" defaultText="Project" /> #{file.project.wpOrderId}
                      </ContainerInstrument>
                    )}
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          ) : (
            <ContainerInstrument className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Shield size={48} className="mx-auto text-gray-300 mb-4" />
              <TextInstrument className="text-gray-500 font-bold">
                <VoiceglotText translationKey="admin.vault.empty" defaultText="Geen bestanden gevonden in de kluis." />
              </TextInstrument>
            </ContainerInstrument>
          )}

        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}