"use client";

import { ContainerInstrument, HeadingInstrument, SectionInstrument, TextInstrument, ButtonInstrument, LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Eye, Send, MessageSquare, Sparkles, Zap, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

/**
 *  VUME ADMIN PREVIEW (2026)
 * 
 * DNA: Live beheer voor alle mailtemplates met interactieve feedback.
 * Chris-Protocol: Volledig instrument-based.
 */

const TEMPLATES = [
  {
    id: 'magic-link',
    name: 'Magic Link',
    journey: 'auth',
    icon: <ShieldCheck strokeWidth={1.5} size={20} />,
    description: 'Inloglink voor gebruikers.',
    previewSubject: 'Inloggen op Voices.be',
    context: { name: 'Johfrah', link: 'https://voices.be/account/callback?token=test' }
  },
  {
    id: 'studio-experience',
    name: 'Studio Experience',
    journey: 'studio',
    icon: <Sparkles strokeWidth={1.5} size={20} />,
    description: 'Bevestiging voor workshops en masterclasses.',
    previewSubject: 'Je plek in de studio is gereserveerd',
    context: { 
      name: 'Johfrah', 
      workshopName: 'Masterclass Stemacteren', 
      date: '25 februari 2026', 
      time: '14:00',
      optOutToken: 'test-token'
    }
  },
  {
    id: 'invoice-reply',
    name: 'Invoice Reply',
    journey: 'agency',
    icon: <ShoppingCart strokeWidth={1.5} size={20} />,
    description: 'Bevestiging van ontvangst factuur.',
    previewSubject: 'Factuur goed ontvangen',
    context: { userName: 'Johfrah', invoiceNumber: 'INV-2026-001', amount: 1250.50 }
  }
];

export default function VumeAdminPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [selectedTemplate, setSelectedThread] = useState<any>(TEMPLATES[0]);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/admin/dashboard');
  }, [isAdmin, isLoading, router]);

  const loadPreview = async (template: any) => {
    setSelectedThread(template);
    try {
      const res = await fetch('/api/admin/test-vume/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id, context: template.context })
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (isAdmin) loadPreview(TEMPLATES[0]);
  }, [isAdmin]);

  const handleSendTest = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/test-vume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate.id, recipient: 'johfrah@voices.be' })
      });
      if (res.ok) alert('Testmail verzonden naar johfrah@voices.be');
    } catch (e) { alert('Fout bij verzenden'); }
    finally { setIsSending(false); }
  };

  if (isLoading) return <LoadingScreenInstrument />;
  if (!isAdmin) return null;

  return (
    <SectionInstrument className="fixed inset-0 z-30 bg-va-off-white flex flex-col pt-4 overflow-hidden h-screen">
      <ContainerInstrument className="flex-grow flex flex-col px-6 pb-6 max-w-none min-h-0">
        
        {/* HEADER */}
        <ContainerInstrument className="flex items-center justify-between mb-8 flex-shrink-0">
          <ContainerInstrument className="space-y-2">
            <ButtonInstrument onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors">
              <ArrowLeft strokeWidth={1.5} size={14} /> Terug naar Dashboard
            </ButtonInstrument>
            <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter flex items-center gap-4">
              VUME <TextInstrument as="span" className="text-va-black/20 font-light">Unified Mail Engine</TextInstrument>
            </HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="flex items-center gap-4">
            <ButtonInstrument 
              onClick={handleSendTest}
              disabled={isSending}
              className="bg-va-black text-white px-8 py-4 rounded-[10px] text-[15px] font-light tracking-widest flex items-center gap-3 hover:bg-primary transition-all disabled:opacity-50"
            >
              <Send strokeWidth={1.5} size={16} className={isSending ? 'animate-pulse' : ''} />
              {isSending ? 'Verzenden...' : 'Stuur Test naar Johfrah'}
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-12 gap-6 flex-grow min-h-0">
          
          {/* LEFT: TEMPLATE LIST */}
          <ContainerInstrument className="col-span-3 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40 px-2 ">Templates</TextInstrument>
            {TEMPLATES.map((t) => (
              <ButtonInstrument 
                key={t.id}
                onClick={() => loadPreview(t)}
                className={`w-full text-left p-6 rounded-[20px] border transition-all flex flex-col gap-3 ${selectedTemplate.id === t.id ? 'bg-white shadow-aura border-primary/20' : 'bg-transparent border-black/5 hover:border-black/10'}`}
              >
                <ContainerInstrument className="flex items-center gap-3">
                  <ContainerInstrument className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedTemplate.id === t.id ? 'bg-primary text-white' : 'bg-va-black/5 text-va-black/40'}`}>
                    {t.icon}
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <TextInstrument className="font-bold text-[15px]">{t.name}</TextInstrument>
                    <TextInstrument className="text-[15px] opacity-40 tracking-widest font-light">{t.journey}</TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[15px] text-va-black/60 leading-relaxed font-light">{t.description}</TextInstrument>
              </ButtonInstrument>
            ))}
          </ContainerInstrument>

          {/* CENTER: LIVE PREVIEW */}
          <ContainerInstrument className="col-span-6 bg-white rounded-[30px] shadow-aura border border-black/[0.03] overflow-hidden flex flex-col relative">
            <ContainerInstrument className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <ContainerInstrument className="flex items-center gap-3">
                <ContainerInstrument className="flex gap-1.5">
                  <ContainerInstrument className="w-3 h-3 rounded-full bg-red-400/20" />
                  <ContainerInstrument className="w-3 h-3 rounded-full bg-yellow-400/20" />
                  <ContainerInstrument className="w-3 h-3 rounded-full bg-green-400/20" />
                </ContainerInstrument>
                <TextInstrument className="text-[15px] font-mono text-va-black/40 ml-4">Subject: {selectedTemplate.previewSubject}</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex gap-2">
                <ButtonInstrument className="p-2 rounded-lg hover:bg-white transition-all text-va-black/40 hover:text-va-black"><Eye strokeWidth={1.5} size={16} /></ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="flex-grow overflow-y-auto bg-[#FAFAFA] p-8 flex justify-center">
              <ContainerInstrument className="w-full max-w-[600px] shadow-2xl rounded-[20px] overflow-hidden bg-white h-fit">
                {previewHtml ? (
                  <iframe 
                    srcDoc={previewHtml} 
                    className="w-full border-none min-h-[800px]" 
                    title="Mail Preview"
                  />
                ) : (
                  <ContainerInstrument className="h-[600px] flex items-center justify-center">
                    <Zap strokeWidth={1.5} className="animate-pulse text-primary/20" size={48} />
                  </ContainerInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* RIGHT: FEEDBACK & AI AGENT */}
          <ContainerInstrument className="col-span-3 flex flex-col gap-6">
            <ContainerInstrument className="bg-va-black text-white p-8 rounded-[30px] shadow-aura space-y-6">
              <HeadingInstrument level={3} className="text-2xl font-light flex items-center gap-3">
                <MessageSquare strokeWidth={1.5} className="text-primary" /> Feedback
              </HeadingInstrument>
              <TextInstrument className="text-white/60 text-[15px] leading-relaxed font-light">
                Klik op een template om de live preview te zien. Geef hieronder je feedback voor Mark & Laya.
              </TextInstrument>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Vb: 'Maak de knop groter' of 'De tekst mag warmer'..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-[20px] p-4 text-[15px] font-light focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-white/20"
              />
              <ButtonInstrument 
                onClick={() => {
                  alert('Feedback verzonden naar de AI Agents!');
                  setFeedback('');
                }}
                className="w-full bg-primary text-white py-4 rounded-[10px] text-[15px] font-light tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <Zap strokeWidth={1.5} size={16} /> Update via AI
              </ButtonInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="bg-white p-8 rounded-[30px] border border-black/[0.03] shadow-aura flex-grow">
              <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-va-black/40 mb-6 ">IAP Context</HeadingInstrument>
              <ContainerInstrument className="space-y-4">
                <ContainerInstrument className="p-4 bg-va-off-white rounded-xl space-y-1">
                  <TextInstrument className="text-[15px] tracking-widest text-va-black/30 font-light">Journey</TextInstrument>
                  <TextInstrument className="font-bold text-[15px] capitalize">{selectedTemplate.journey}</TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="p-4 bg-va-off-white rounded-xl space-y-1">
                  <TextInstrument className="text-[15px] tracking-widest text-va-black/30 font-light">Persona</TextInstrument>
                  <TextInstrument className="font-bold text-[15px]">Professional Voice-over</TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

        </ContainerInstrument>
      </ContainerInstrument>
    </SectionInstrument>
  );
}
