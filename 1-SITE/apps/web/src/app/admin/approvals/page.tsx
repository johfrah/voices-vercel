"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Bell, Check, X, Edit3, ArrowLeft, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

/**
 * 🛡️ ADMIN APPROVALS (NUCLEAR 2026)
 * 
 * "Nooit acties vanuit het systeem zonder human in de loop."
 */
export default function AdminApprovalsPage() {
  const { playClick } = useSonicDNA();
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await fetch('/api/admin/approvals');
      if (res.ok) {
        const data = await res.json();
        setPending(data);
      }
    } catch (e) {
      console.error('Failed to fetch approvals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject', reasoning?: string) => {
    playClick(action === 'approve' ? 'success' : 'pop');
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, reasoning })
      });
      if (res.ok) {
        setPending(prev => prev.filter(item => item.id !== id));
        toast.success(action === 'approve' ? 'Goedgekeurd!' : 'Geweigerd.');
      }
    } catch (e) {
      toast.error('Fout bij verwerken.');
    }
  };

  if (loading) return (
    <ContainerInstrument className="min-h-screen flex items-center justify-center">
      <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} / />
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link strokeWidth={1.5} href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText strokeWidth={1.5} translationKey="admin.back_to_cockpit" defaultText="Terug" / />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter "><VoiceglotText strokeWidth={1.5} translationKey="admin.approvals.title" defaultText="Approval Queue" / /></HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex items-center gap-3 px-6 py-3 bg-va-black text-white rounded-2xl shadow-lg">
          <Bell strokeWidth={1.5} size={16} className={pending.length > 0 ? 'animate-bounce text-primary' : 'opacity-20'} />
          <TextInstrument className="text-[15px] font-black tracking-widest">
            {pending.length} <VoiceglotText strokeWidth={1.5} translationKey="admin.approvals.pending_count" defaultText="Wachtende Acties" / />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {pending.length > 0 ? (
        <BentoGrid strokeWidth={1.5} columns={3}>
          {pending.map((item) => (
            <BentoCard key={item.id} span="sm" className="bg-white border border-black/5 p-8 flex flex-col justify-between group hover:shadow-aura transition-all">
              <ContainerInstrument className="space-y-6">
                <ContainerInstrument className="flex justify-between items-start">
                  <ContainerInstrument className={`px-3 py-1 rounded-full text-[15px] font-black uppercase tracking-widest ${
                    item.priority === 'nuclear' ? 'bg-red-500 text-white animate-pulse' : 'bg-va-off-white text-va-black/40'
                  }`}>
                    {item.type} • {item.priority}
                  </ContainerInstrument>
                  <TextInstrument className="text-[15px] font-bold text-va-black/20">{new Date(item.createdAt).toLocaleString('nl-BE')}</TextInstrument>
                </ContainerInstrument>

                <ContainerInstrument className="space-y-2">
                  <HeadingInstrument level={3} className="text-lg font-black tracking-tight leading-tight">
                    {item.payload?.subject || item.payload?.title || 'Geen onderwerp'}
                  </HeadingInstrument>
                  <TextInstrument className="text-[15px] text-va-black/40 font-medium line-clamp-3">
                    {item.reasoning}
                  </TextInstrument>
                </ContainerInstrument>

                {/* Nuclear Alerts */}
                {(item.isValueSensitive || item.isBrandSensitive) && (
                  <ContainerInstrument className="space-y-2">
                    {item.isValueSensitive && (
                      <ContainerInstrument className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-[20px]">
                        <ShieldAlert strokeWidth={1.5} size={12} className="text-red-500" / />
                        <TextInstrument className="text-[15px] font-black text-red-500 tracking-widest"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.waarde_alarm__kortin.381129" defaultText="Waarde-Alarm (Korting)" / /></TextInstrument>
                      </ContainerInstrument>
                    )}
                    {item.isBrandSensitive && (
                      <ContainerInstrument className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/10 rounded-[20px]">
                        <Sparkles strokeWidth={1.5} size={12} className="text-primary" />
                        <TextInstrument className="text-[15px] font-black text-primary tracking-widest"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.fame_alarm__topmerk_.dc7782" defaultText="Fame-Alarm (Topmerk)" / /></TextInstrument>
                      </ContainerInstrument>
                    )}
                  </ContainerInstrument>
                )}
              </ContainerInstrument>

              <ContainerInstrument className="mt-8 pt-6 border-t border-black/5 flex gap-2">
                <ButtonInstrument 
                  onClick={() => handleAction(item.id, 'approve')}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl text-[15px] font-black tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <Check strokeWidth={1.5} size={14} /><VoiceglotText strokeWidth={1.5} translationKey="auto.page.goedkeuren.f6b131" defaultText="Goedkeuren" / />
                </ButtonInstrument>
                <ButtonInstrument 
                  onClick={() => handleAction(item.id, 'reject')}
                  className="w-12 py-3 bg-va-off-white text-va-black/20 rounded-xl hover:text-red-500 transition-all flex items-center justify-center"
                >
                  <X strokeWidth={1.5} size={14} />
                </ButtonInstrument>
              </ContainerInstrument>
            </BentoCard>
          ))}
        </BentoGrid>
      ) : (
        <ContainerInstrument className="bg-white border border-black/5 p-20 rounded-[40px] text-center space-y-4">
          <ContainerInstrument className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <Check strokeWidth={1.5} size={40} />
          </ContainerInstrument>
          <HeadingInstrument level={2} className="text-2xl font-black tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.alles_clean.817d14" defaultText="Alles Clean" / /><TextInstrument className="text-va-black/40 font-medium"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.er_zijn_momenteel_ge.56e606" defaultText="Er zijn momenteel geen acties die op goedkeuring wachten." / /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      )}
    </PageWrapperInstrument>
  );
}
