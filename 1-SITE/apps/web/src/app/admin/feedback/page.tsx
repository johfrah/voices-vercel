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
import { VoiceglotImage } from '@/components/ui/VoiceglotImage';
import { ArrowLeft, LayoutDashboard, MessageSquare, Star, RefreshCw, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function FeedbackPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/operational-2');
      const json = await res.json();
      setData(json.feedback);
    } catch (err) {
      console.error('Failed to fetch feedback data:', err);
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
                Reputation Intelligence
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
                Feedback
              </HeadingInstrument>
              
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Verzamel, analyseer en reageer op klantbeoordelingen om de Voices ervaring continu te verbeteren.
              </TextInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={fetchData} 
              className="va-btn-pro !bg-va-black flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw strokeWidth={1.5} size={16} className={loading ? 'animate-spin' : ''} />
              Feedback Vernieuwen
            </ButtonInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {/* Feedback List */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center text-black/20 font-medium">Laden...</div>
          ) : data.length > 0 ? (
            data.map((review) => (
              <ContainerInstrument key={review.id} className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-sm group hover:border-primary/20 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6">
                    <div className="w-16 h-16 bg-va-black/5 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                      {review.authorPhotoUrl ? (
                        <VoiceglotImage src={review.authorPhotoUrl} alt={review.authorName} width={64} height={64} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <User className="text-va-black/20" size={32} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <HeadingInstrument level={3} className="text-xl font-bold text-va-black">{review.authorName}</HeadingInstrument>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? 'text-primary fill-primary' : 'text-va-black/10'} />
                          ))}
                        </div>
                      </div>
                      <TextInstrument className="text-[15px] text-va-black/60 leading-relaxed max-w-3xl">
                        {review.textNl || review.textEn || 'Geen tekstuele beoordeling achtergelaten.'}
                      </TextInstrument>
                      <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-black/20">
                        <span>{format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: nl })}</span>
                        <span>•</span>
                        <span>{review.provider || 'Google'}</span>
                      </div>
                    </div>
                  </div>
                  <ButtonInstrument variant="plain" className="p-4 bg-va-black/5 rounded-2xl text-va-black/20 group-hover:bg-primary group-hover:text-white transition-all">
                    <MessageSquare size={20} />
                  </ButtonInstrument>
                </div>
              </ContainerInstrument>
            ))
          ) : (
            <div className="py-20 text-center text-black/20 font-medium">
              Geen recente feedback gevonden.
            </div>
          )}
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
