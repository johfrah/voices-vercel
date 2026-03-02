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
import { ArrowLeft, LayoutDashboard, MessageSquare, RefreshCw, ChevronRight, User, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function VoicyChatPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/operational-2');
      const json = await res.json();
      setData(json.chats);
    } catch (err) {
      console.error('Failed to fetch chat data:', err);
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
                Conversational Intelligence
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Voicy Chat
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Beheer alle AI-conversaties en klantinteracties binnen de Freedom Machine.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Gesprekken Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Search & Filter */}
        <ContainerInstrument className="bg-white p-4 rounded-2xl border border-black/[0.03] mb-8 flex items-center gap-4">
          <Search className="text-black/20 ml-2" size={20} />
          <input 
            type="text" 
            placeholder="Zoek in gesprekken..." 
            className="bg-transparent border-0 outline-none w-full text-[15px] font-medium"
          />
          <ButtonInstrument variant="plain" className="p-2 bg-va-black/5 rounded-lg">
            <Filter size={18} className="text-va-black/40" />
          </ButtonInstrument>
        </ContainerInstrument>

        {/* Chat List */}
        <div className="bg-white rounded-[40px] border border-black/[0.03] shadow-sm overflow-hidden">
          <div className="divide-y divide-black/[0.03]">
            {loading ? (
              <div className="py-20 text-center text-black/20 font-medium">Laden...</div>
            ) : data.length > 0 ? (
              data.map((chat) => (
                <div key={chat.id} className="p-8 hover:bg-va-off-white/30 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-va-black/5 rounded-2xl flex items-center justify-center shrink-0">
                      <User className="text-va-black/20" size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <HeadingInstrument level={3} className="text-lg font-bold text-va-black">{chat.guestName || 'Anonieme Bezoeker'}</HeadingInstrument>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          chat.status === 'open' ? 'bg-primary text-white' : 'bg-va-black/5 text-va-black/40'
                        }`}>
                          {chat.status}
                        </span>
                      </div>
                      <TextInstrument className="text-[14px] text-va-black/60 line-clamp-1 max-w-xl">
                        {chat.intent ? `Intent: ${chat.intent}` : 'Geen intentie gedetecteerd.'}
                      </TextInstrument>
                      <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-black/20">
                        <span>{chat.locationCity || 'Onbekende locatie'}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true, locale: nl })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <TextInstrument className="text-[12px] font-black text-primary uppercase tracking-widest">{chat.journey || 'General'}</TextInstrument>
                      <TextInstrument className="text-[11px] text-black/20">{chat.visitorHash?.substring(0, 8)}</TextInstrument>
                    </div>
                    <button className="w-10 h-10 bg-va-black/5 rounded-full flex items-center justify-center text-va-black/20 group-hover:bg-va-black group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-black/20 font-medium">
                Geen actieve gesprekken gevonden.
              </div>
            )}
          </div>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
