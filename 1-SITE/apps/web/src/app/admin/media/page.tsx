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
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function MediaEnginePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/operational');
      const json = await res.json();
      setData(json.media);
    } catch (err) {
      console.error('Failed to fetch media data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <ContainerInstrument className="flex justify-between items-start">
            <ContainerInstrument>
              <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
                Asset Intelligence
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Media Engine
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Centraal beheer van alle video, audio en document assets binnen de Freedom Machine.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Engine Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Stats Grid */}
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <Film className="text-primary mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Video Assets</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.stats?.video || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <Music className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Audio Assets</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.stats?.audio || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <FileText className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Documenten</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.stats?.application || 0}</HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-sm">
            <HardDrive className="text-va-black/40 mb-4" size={24} />
            <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase mb-1">Totaal Bestanden</TextInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light">{data?.files?.length || 0}</HeadingInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Media Table */}
        <ContainerInstrument className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
          <ContainerInstrument className="p-8 border-b border-black/[0.03]">
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">
              Recente Assets
            </HeadingInstrument>
          </ContainerInstrument>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-va-off-white/50 border-b border-black/[0.03]">
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase">Bestand</th>
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase">Type</th>
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase">Grootte</th>
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase">Datum</th>
                  <th className="px-8 py-4 text-[13px] font-black tracking-widest text-black/20 uppercase text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-black/20">Laden...</td>
                  </tr>
                ) : data?.files?.map((file: any) => (
                  <tr key={file.id} className="hover:bg-va-off-white/30 transition-colors">
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
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-va-black/5 rounded-lg text-va-black/40 hover:text-va-black transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 hover:bg-va-black/5 rounded-lg text-va-black/40 hover:text-va-black transition-colors">
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
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
