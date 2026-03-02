"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowLeft, LayoutDashboard, Film, Music, FileText, RefreshCw, HardDrive, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useWorld } from '@/contexts/WorldContext';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function MediaEnginePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { activeWorld } = useWorld();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const worldParam = activeWorld ? `?world=${activeWorld.code}` : '';
      const res = await fetch(`/api/admin/operational${worldParam}`);
      const json = await res.json();
      setData(json.media);
    } catch (err) {
      console.error('Failed to fetch media data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeWorld]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-6 md:p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug" />
          </Link>
          
          <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start gap-6">
            <ContainerInstrument>
              <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-bold px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
                Bestanden
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-4xl md:text-6xl font-light tracking-tighter mb-4">
                Audiopost Studio
              </HeadingInstrument>
              
              <TextInstrument className="text-lg md:text-xl text-black/40 font-light tracking-tight max-w-2xl">
                Centraal beheer van alle video, audio en documenten binnen het platform.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center justify-center gap-2 w-full md:w-auto"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Stats Grid */}
        <ContainerInstrument className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <ContainerInstrument className="bg-white p-6 md:p-8 rounded-[20px] md:rounded-[30px] border border-black/[0.03] shadow-sm">
            <Film className="text-primary mb-4" size={24} />
            <TextInstrument className="text-[11px] md:text-[13px] font-bold tracking-widest text-black/20 uppercase mb-1">Video</TextInstrument>
            <HeadingInstrument level={3} className="text-2xl md:text-3xl font-light">{data?.stats?.video || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-6 md:p-8 rounded-[20px] md:rounded-[30px] border border-black/[0.03] shadow-sm">
            <Music className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[11px] md:text-[13px] font-bold tracking-widest text-black/20 uppercase mb-1">Audio</TextInstrument>
            <HeadingInstrument level={3} className="text-2xl md:text-3xl font-light">{data?.stats?.audio || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-6 md:p-8 rounded-[20px] md:rounded-[30px] border border-black/[0.03] shadow-sm">
            <FileText className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[11px] md:text-[13px] font-bold tracking-widest text-black/20 uppercase mb-1">Docs</TextInstrument>
            <HeadingInstrument level={3} className="text-2xl md:text-3xl font-light">{data?.stats?.application || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-6 md:p-8 rounded-[20px] md:rounded-[30px] border border-black/[0.03] shadow-sm">
            <HardDrive className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[11px] md:text-[13px] font-bold tracking-widest text-black/20 uppercase mb-1">Totaal</TextInstrument>
            <HeadingInstrument level={3} className="text-2xl md:text-3xl font-light">{data?.files?.length || 0}</HeadingInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Media Table - Desktop */}
        <ContainerInstrument className="hidden md:block bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
          <ContainerInstrument className="p-8 border-b border-black/[0.03]">
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
              Recente Assets
            </HeadingInstrument>
          </ContainerInstrument>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-va-off-white/50 border-b border-black/[0.03]">
                  <th className="px-8 py-4 text-[13px] font-bold tracking-widest text-black/20 uppercase">Bestand</th>
                  <th className="px-8 py-4 text-[13px] font-bold tracking-widest text-black/20 uppercase">Type</th>
                  <th className="px-8 py-4 text-[13px] font-bold tracking-widest text-black/20 uppercase">Grootte</th>
                  <th className="px-8 py-4 text-[13px] font-bold tracking-widest text-black/20 uppercase">Datum</th>
                  <th className="px-8 py-4 text-[13px] font-bold tracking-widest text-black/20 uppercase text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-black/20">Laden...</td>
                  </tr>
                ) : data?.files?.map((file: any) => (
                  <tr key={file.id} className="hover:bg-va-off-white/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-va-black/5 rounded-lg flex items-center justify-center">
                          {file.file_type?.includes('video') ? <Film size={18} /> : file.file_type?.includes('audio') ? <Music size={18} /> : <FileText size={18} />}
                        </div>
                        <div>
                          <TextInstrument className="font-bold text-va-black">{file.file_name}</TextInstrument>
                          <TextInstrument className="text-[13px] text-black/40">{file.journey || 'Global'}</TextInstrument>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[13px] font-medium text-va-black/60">{file.file_type}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[13px] font-medium text-va-black/60">{Math.round(file.file_size / 1024)} KB</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[13px] font-medium text-va-black/60">{format(new Date(file.created_at), 'dd MMM yyyy', { locale: nl })}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-va-black/5 rounded-lg text-va-black/40 hover:text-primary transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 hover:bg-va-black/5 rounded-lg text-va-black/40 hover:text-primary transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContainerInstrument>

        {/* Media List - Mobile */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="p-20 text-center text-black/20">Laden...</div>
          ) : data?.files?.map((file: any) => (
            <div key={file.id} className="bg-white rounded-[20px] border border-black/[0.03] shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-va-black/5 rounded-xl flex items-center justify-center shrink-0">
                  {file.file_type?.includes('video') ? <Film size={20} /> : file.file_type?.includes('audio') ? <Music size={20} /> : <FileText size={20} />}
                </div>
                <div className="min-w-0">
                  <TextInstrument className="font-bold text-va-black truncate">{file.file_name}</TextInstrument>
                  <TextInstrument className="text-sm text-black/40">{file.journey || 'Global'} • {Math.round(file.file_size / 1024)} KB</TextInstrument>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-black/[0.02]">
                <TextInstrument className="text-sm font-light text-va-black/40">
                  {format(new Date(file.created_at), 'dd MMM yyyy', { locale: nl })}
                </TextInstrument>
                <div className="flex gap-2">
                  <button className="p-3 bg-va-off-white rounded-full text-primary active:bg-primary active:text-white transition-all">
                    <Eye size={18} />
                  </button>
                  <button className="p-3 bg-va-off-white rounded-full text-primary active:bg-primary active:text-white transition-all">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
