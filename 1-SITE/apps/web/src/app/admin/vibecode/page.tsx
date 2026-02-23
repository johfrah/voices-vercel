"use client";

import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    InputInstrument,
    LabelInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { cn } from '@/lib/utils/utils';
import { ArrowLeft, Code2, History, Loader2, Play, RefreshCw, Save, ShieldAlert, Sparkles, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 *  VIBECODE BACKEND (NUCLEAR 2026)
 * 
 * "Code schrijven op basis van de vibe van het project."
 */
export default function VibecodePage() {
  const [code, setCode] = useState(`//  VIBECODE: Pas de logica van de Freedom Machine aan
// Intent: "Versnel de checkout vibe"

export async function onBeforeCheckout(context) {
  if (context.urgency > 0.8) {
    context.applyVibe('express-delivery');
    console.log(" Express vibe toegepast!");
  }
}`);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [gitStatus, setGitStatus] = useState<'idle' | 'staged' | 'pushed'>('idle');
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'assistant'>('editor');
  const [metadata, setMetadata] = useState({ title: '', description: '' });

  const templates = [
    { title: 'Nieuwe Pagina', description: 'Maak een nieuwe content pagina aan.', code: '# Nieuwe Pagina\n\nSchrijf hier je content in Markdown...', type: 'page' },
    { title: 'Urgentie Boost', description: 'Verhoogt de focus op snelheid bij hoge urgentie.', code: '//  VIBECODE: Urgentie Boost\nexport async function onInteraction(ctx) {\n  if (ctx.intent === "quote" && ctx.urgency > 0.7) {\n    ctx.showSmartChip("Directe Auditie");\n  }\n}', type: 'vibe' },
    { title: 'Vriendelijke Voicy', description: 'Maakt de AI-assistent extra behulpzaam en informeel.', code: '//  VIBECODE: Vriendelijke Vibe\nexport async function onAiResponse(ctx) {\n  ctx.setTone("warm-informal");\n  ctx.addEmoji("");\n}', type: 'vibe' },
    { title: 'Pricing Guard', description: 'Voegt extra validatie toe aan complexe offertes.', code: '//  VIBECODE: Pricing Guard\nexport async function onPriceCalculate(price) {\n  if (price < 50) return price * 1.2; // Nuclear Margin Protection\n  return price;\n}', type: 'vibe' },
  ];

  const handlePreview = () => {
    setIsExecuting(true);
    setIsPreviewing(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cody_preview_logic', code);
      sessionStorage.setItem('cody_preview_active', 'true');
    }
    setTimeout(() => {
      setIsExecuting(false);
      toast.success("Live Preview geactiveerd voor jouw sessie!");
    }, 1000);
  };

  const handleStopPreview = () => {
    setIsPreviewing(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cody_preview_logic');
      sessionStorage.removeItem('cody_preview_active');
    }
    toast("Preview gestopt. Site draait weer op core logica.");
  };

  const handleSave = async () => {
    setIsExecuting(true);
    const isPage = code.startsWith('#');
    const finalFilename = isPage ? `page/${metadata.title || 'nieuwe-pagina'}` : 'checkout-vibe';

    try {
      const res = await fetch('/api/admin/vibecode/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: finalFilename,
          code: code,
          metadata: { 
            title: metadata.title || (isPage ? 'Nieuwe Pagina' : 'Untitled Vibe'), 
            strength: 0.98,
            description: metadata.description
          }
        })
      });
      if (res.ok) {
        handleStopPreview();
        setGitStatus('staged');
        toast.success(isPage ? "Pagina lokaal aangemaakt!" : "Vibe lokaal opgeslagen (Git-ready)!");
      }
    } catch (e) {
      toast.error("Opslaan mislukt.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handlePush = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/admin/vibecode/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'super-push' })
      });
      if (res.ok) {
        setGitStatus('pushed');
        toast.success("Super-Push voltooid! Database, Code en Git zijn gesynct.");
      } else {
        throw new Error("Push mislukt");
      }
    } catch (e) {
      toast.error("Super-Push mislukt. Controleer server autorisatie.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSyncKnowledge = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/admin/vibecode/sync', { method: 'POST' });
      const data = await res.json();
      toast.success(`Knowledge Sync voltooid: ${data.syncedCount} bronnen overgezet!`);
    } catch (e) {
      toast.error("Sync mislukt.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link  href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="admin.back_to_dashboard" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter ">
            Cody <TextInstrument className="text-primary inline font-light"><VoiceglotText  translationKey="auto.page.engine.7bfa30" defaultText="Engine" /></TextInstrument>
          </HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument 
            onClick={handleSyncKnowledge}
            disabled={isExecuting}
            className="va-btn-pro !bg-va-black flex items-center gap-2"
          >
            {isExecuting ? <Loader2 strokeWidth={1.5} className="animate-spin" size={16} /> : <RefreshCw size={16} strokeWidth={1.5} />}
            <VoiceglotText  translationKey="admin.vibecode.sync_kb" defaultText="Sync Knowledge Base" />
          </ButtonInstrument>
          <ContainerInstrument className="flex bg-va-off-white p-1 rounded-[20px] border border-black/5">
            <ButtonInstrument 
              onClick={() => setActiveTab('editor')} 
              className={cn(
                "px-6 py-3 rounded-[10px] text-[15px] font-black uppercase tracking-widest transition-all",
                activeTab === 'editor' ? 'bg-va-black text-white shadow-lg' : 'text-va-black/30'
              )}
            >
              <VoiceglotText  translationKey="common.editor" defaultText="Editor" />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => setActiveTab('templates')} 
              className={cn(
                "px-6 py-3 rounded-[10px] text-[15px] font-black uppercase tracking-widest transition-all",
                activeTab === 'templates' ? 'bg-va-black text-white shadow-lg' : 'text-va-black/30'
              )}
            >
              <VoiceglotText  translationKey="common.templates" defaultText="Templates" />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => setActiveTab('assistant')} 
              className={cn(
                "px-6 py-3 rounded-[10px] text-[15px] font-black uppercase tracking-widest transition-all",
                activeTab === 'assistant' ? 'bg-va-black text-white shadow-lg' : 'text-va-black/30'
              )}
            >
              <VoiceglotText  translationKey="common.ai_assistant" defaultText="AI Assistant" />
            </ButtonInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="flex gap-2">
            {isPreviewing ? (
              <ButtonInstrument 
                onClick={handleStopPreview}
                className="va-btn-pro !bg-red-500 !text-white flex items-center gap-2 shadow-lg shadow-red-500/20"
              >
                <X strokeWidth={1.5} size={16} /> <VoiceglotText  translationKey="admin.vibecode.stop_preview" defaultText="Stop Preview" />
              </ButtonInstrument>
            ) : (
              <ButtonInstrument 
                onClick={handlePreview}
                disabled={isExecuting}
                className="va-btn-pro !bg-va-off-white !text-va-black flex items-center gap-2"
              >
                <Play size={16} strokeWidth={1.5} /> <VoiceglotText  translationKey="admin.vibecode.live_preview" defaultText="Live Preview" />
              </ButtonInstrument>
            )}
            <ButtonInstrument 
              onClick={handleSave}
              disabled={isExecuting}
              className="va-btn-pro !bg-va-off-white !text-va-black flex items-center gap-2"
            >
              <Save size={16} strokeWidth={1.5} /> <VoiceglotText  translationKey="admin.vibecode.save_local" defaultText="Save Local" />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={handlePush}
              disabled={isExecuting || gitStatus !== 'staged'}
              className={cn(
                "va-btn-pro flex items-center gap-2 transition-all",
                gitStatus === 'staged' ? '!bg-primary !text-white shadow-lg shadow-primary/20' : '!bg-va-black !text-white opacity-50'
              )}
            >
              {isExecuting ? <Loader2 strokeWidth={1.5} className="animate-spin" size={16} /> : <Zap strokeWidth={1.5} size={16} />}
              <VoiceglotText  translationKey="admin.vibecode.push_live" defaultText="Push to Live" />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid strokeWidth={1.5} columns={3}>
        {/* Editor / Content Area */}
        <BentoCard span="lg" className="bg-va-black border-white/5 p-0 overflow-hidden min-h-[600px] flex flex-col">
          {activeTab === 'editor' && (
            <ContainerInstrument className="flex flex-col flex-1">
              <ContainerInstrument className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <TextInstrument className="text-[15px] font-black text-white/20 tracking-widest flex items-center gap-2">
                  <Code2 size={12} strokeWidth={1.5} /> <VoiceglotText  translationKey="admin.vibecode.filename" defaultText="shadow-logic.cody" />
                </TextInstrument>
                <TextInstrument className="text-[15px] font-black text-primary tracking-widest animate-pulse">
                   <VoiceglotText  translationKey="admin.vibecode.live_connection" defaultText="Live Connection" />
                </TextInstrument>
              </ContainerInstrument>

              {/* Metadata Inputs */}
              <ContainerInstrument className="px-10 py-6 bg-white/5 border-b border-white/5 grid grid-cols-2 gap-6">
                <ContainerInstrument className="space-y-2">
                  <LabelInstrument className="text-[15px] font-black tracking-widest text-white/30 ml-2">
                    <VoiceglotText  translationKey="admin.vibecode.meta_title_label" defaultText="Titel / Slug" />
                  </LabelInstrument>
                  <InputInstrument 
                    type="text" 
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="bijv: over-ons of checkout-vibe"
                    className="w-full bg-white/5 border border-white/10 rounded-[10px] py-2 px-4 text-[15px] text-white outline-none focus:border-primary/50 transition-all"
                  />
                </ContainerInstrument>
                <ContainerInstrument className="space-y-2">
                  <LabelInstrument className="text-[15px] font-black tracking-widest text-white/30 ml-2">
                    <VoiceglotText  translationKey="admin.vibecode.meta_desc_label" defaultText="Omschrijving" />
                  </LabelInstrument>
                  <InputInstrument 
                    type="text" 
                    value={metadata.description}
                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Wat doet deze wijziging?"
                    className="w-full bg-white/5 border border-white/10 rounded-[10px] py-2 px-4 text-[15px] text-white outline-none focus:border-primary/50 transition-all"
                  />
                </ContainerInstrument>
              </ContainerInstrument>
              
              {/* Git Status Bar */}
              <ContainerInstrument className="px-6 py-2 bg-white/5 border-b border-white/5 flex items-center gap-4">
                <ContainerInstrument className="flex items-center gap-2">
                  <ContainerInstrument className={cn("w-1.5 h-1.5 rounded-full", gitStatus === 'idle' ? 'bg-white/20' : 'bg-green-500')} />
                  <TextInstrument className="text-[15px] font-black tracking-widest text-white/40">
                    <VoiceglotText  translationKey="admin.vibecode.status.local" defaultText="Local Save" />
                  </TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="w-4 h-[1px] bg-white/10" />
                <ContainerInstrument className="flex items-center gap-2">
                  <ContainerInstrument className={cn("w-1.5 h-1.5 rounded-full", gitStatus === 'staged' || gitStatus === 'pushed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20')} />
                  <TextInstrument className="text-[15px] font-black tracking-widest text-white/40">
                    <VoiceglotText  translationKey="admin.vibecode.status.staged" defaultText="Git Staged" />
                  </TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="w-4 h-[1px] bg-white/10" />
                <ContainerInstrument className="flex items-center gap-2">
                  <ContainerInstrument className={cn("w-1.5 h-1.5 rounded-full", gitStatus === 'pushed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20')} />
                  <TextInstrument className="text-[15px] font-black tracking-widest text-white/40">
                    <VoiceglotText  translationKey="admin.vibecode.status.pushed" defaultText="Combell Deploy" />
                  </TextInstrument>
                </ContainerInstrument>
                
                {gitStatus === 'staged' && (
                  <ContainerInstrument className="ml-auto flex items-center gap-2">
                    <TextInstrument className="text-[15px] font-black tracking-widest text-primary animate-pulse">
                      <VoiceglotText  translationKey="admin.vibecode.status.waiting" defaultText="Waiting for Push..." />
                    </TextInstrument>
                  </ContainerInstrument>
                )}
              </ContainerInstrument>

              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-transparent p-10 text-primary/80 font-mono text-[15px] outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </ContainerInstrument>
          )}

          {activeTab === 'templates' && (
            <ContainerInstrument className="p-10 grid grid-cols-2 gap-6">
              {templates.map(t => (
                <ContainerInstrument 
                  key={t.title} 
                  onClick={() => { setCode(t.code); setActiveTab('editor'); }} 
                  className="p-6 bg-white/5 border border-white/10 rounded-[20px] hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <HeadingInstrument level={4} className="text-white font-light tracking-tight mb-2 group-hover:text-primary">{t.title}</HeadingInstrument>
                  <TextInstrument className="text-white/40 text-[15px] font-medium">{t.description}</TextInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          )}

          {activeTab === 'assistant' && (
            <ContainerInstrument className="p-10 flex flex-col items-center justify-center h-full space-y-8">
              <ContainerInstrument className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-pulse">
                <Sparkles strokeWidth={1.5} size={48} />
              </ContainerInstrument>
              <ContainerInstrument className="max-w-md text-center space-y-4">
                <HeadingInstrument level={3} className="text-white text-2xl font-light ">
                  <VoiceglotText  translationKey="admin.vibecode.assistant.title" defaultText="Cody Assistant" />
                </HeadingInstrument>
                <TextInstrument className="text-white/40 font-medium">
                  <VoiceglotText  translationKey="admin.vibecode.assistant.desc" defaultText="Beschrijf in gewoon Nederlands wat je wilt veranderen, en ik schrijf de code voor je." />
                </TextInstrument>
                <InputInstrument 
                  type="text" 
                  placeholder="Bijv: 'Maak Voicy wat zakelijker op de checkout pagina'"
                  className="w-full bg-white/5 border border-white/10 rounded-[10px] py-4 px-6 text-white outline-none focus:border-primary transition-all"
                />
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </BentoCard>

        {/* Sidebar Stats */}
        <ContainerInstrument className="space-y-8">
          <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-4">
            <ContainerInstrument className="flex items-center gap-3">
              <ContainerInstrument className="p-2 bg-primary/10 text-primary rounded-[10px]">
                <Zap strokeWidth={1.5} size={20} />
              </ContainerInstrument>
              <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/30">
                <VoiceglotText  translationKey="admin.vibecode.vibe_strength" defaultText="Vibe Strength" />
              </TextInstrument>
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter">98.4%</HeadingInstrument>
            <ContainerInstrument className="w-full bg-va-off-white h-1.5 rounded-full overflow-hidden">
              <ContainerInstrument className="bg-primary h-full w-[98%]" />
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-8 space-y-6">
            <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest opacity-40">
              <VoiceglotText  translationKey="auto.page.active_personas.8cbab4" defaultText="Active Personas" />
            </HeadingInstrument>
            <ContainerInstrument className="space-y-3">
              {['Musical Confidant', 'Nuclear Architect', 'Voice Over Pro'].map(p => (
                <ContainerInstrument key={p} className="flex items-center justify-between p-3 bg-white/5 rounded-[10px] border border-white/5">
                  <TextInstrument className="text-[15px] font-bold tracking-tight">{p}</TextInstrument>
                  <Sparkles strokeWidth={1.5} size={12} className="text-primary" />
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-4">
            <ContainerInstrument className="flex items-center gap-3">
              <History size={18} className="text-va-black/20" strokeWidth={1.5} />
              <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/30">
                <VoiceglotText  translationKey="auto.page.recent_changes.42110d" defaultText="Recent Changes" />
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="space-y-2">
              <TextInstrument className="text-[15px] font-medium text-va-black/40 italic">
                <VoiceglotText  translationKey="auto.page._quot_checkout_flow_.594e1a" defaultText="&quot;Checkout flow optimized for mobile vibes&quot;" />
              </TextInstrument>
              <TextInstrument className="text-[15px] font-medium text-va-black/40 italic">
                <VoiceglotText  translationKey="auto.page._quot_voiceglot_heal.8e1775" defaultText="&quot;Voiceglot healing threshold adjusted&quot;" />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>
        </ContainerInstrument>
      </BentoGrid>

      {/* Warning */}
      <ContainerInstrument className="p-8 bg-va-black text-white rounded-[20px] flex items-center gap-6">
        <ContainerInstrument className="w-16 h-16 bg-primary text-white rounded-[10px] flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <ShieldAlert size={32} strokeWidth={1.5} />
        </ContainerInstrument>
        <ContainerInstrument className="space-y-1">
          <HeadingInstrument level={4} className="text-primary font-light tracking-tight">
            <VoiceglotText  translationKey="admin.vibecode.protocol.title" defaultText="VIBECODE PROTOCOL" />
          </HeadingInstrument>
          <TextInstrument className="text-[15px] opacity-60 font-medium">
            <VoiceglotText  translationKey="admin.vibecode.protocol.desc" defaultText="Vibecode overschrijft de standaard logica van de Freedom Machine. Wijzigingen zijn direct merkbaar voor alle gebruikers in de Shadow Layer. Gebruik met uiterste precisie." />
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
