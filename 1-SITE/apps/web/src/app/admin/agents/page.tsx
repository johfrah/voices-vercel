"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  FixedActionDockInstrument,
  LoadingScreenInstrument,
  InputInstrument,
  LabelInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAdminTracking } from '@/hooks/useAdminTracking';
import { 
  ArrowLeft, 
  Bot, 
  Save, 
  History, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  Code, 
  Activity,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface AgentPrompt {
  id: number;
  agentSlug: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  version: number;
  isActive: boolean;
  metadata: any;
  updatedAt: string;
}

export default function AgentControlCenter() {
  const { logAction } = useAdminTracking();
  const [agents, setAgents] = useState<AgentPrompt[]>([]);
  const [selectedAgent, setSelectedItem] = useState<AgentPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [changeNote, setChangeNote] = useState('');

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
        if (data.length > 0 && !selectedAgent) {
          setSelectedItem(data[0]);
          setEditPrompt(data[0].systemPrompt);
        }
      }
    } catch (e) {
      console.error('Failed to fetch agents:', e);
      toast.error('Kon agents niet laden.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleSave = async () => {
    if (!selectedAgent || !editPrompt) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAgent.id,
          systemPrompt: editPrompt,
          changeNote: changeNote || 'Handmatige update via beheer'
        })
      });

      if (res.ok) {
        const updated = await res.json();
        toast.success(`${selectedAgent.name} geüpdatet naar v${updated.version}`);
        logAction('agent_prompt_update', { slug: selectedAgent.agentSlug, version: updated.version });
        setChangeNote('');
        await fetchAgents();
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      toast.error('Fout bij opslaan van instructies.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingScreenInstrument message="Gegevens ophalen..." />;

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        {/* Header Section */}
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-light px-3 py-1 rounded-full tracking-widest">
                <VoiceglotText translationKey="admin.agents.badge" defaultText="Assistent Beheer" />
              </ContainerInstrument>
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
                <VoiceglotText translationKey="admin.agents.title" defaultText="Slimme Assistenten" />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-black/40 font-light tracking-tight max-w-2xl">
                <VoiceglotText translationKey="admin.agents.subtitle" defaultText="Beheer de instructies van alle AI-assistenten binnen het platform." />
              </TextInstrument>
            </div>
          </div>
        </SectionInstrument>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 items-start">
          {/* Sidebar: Agent List */}
          <div className="space-y-4">
            <HeadingInstrument level={3} className="text-[11px] font-medium tracking-[0.2em] text-va-black/20 uppercase px-4">Actieve Agents</HeadingInstrument>
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedItem(agent);
                    setEditPrompt(agent.systemPrompt);
                  }}
                  className={`w-full flex items-center justify-between p-5 rounded-[20px] transition-all group ${
                    selectedAgent?.id === agent.id 
                      ? 'bg-va-black text-white shadow-aura-lg scale-[1.02]' 
                      : 'bg-white border border-black/[0.03] hover:border-primary/30 text-va-black'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${
                      selectedAgent?.id === agent.id ? 'bg-primary text-va-black' : 'bg-va-off-white text-va-black/20 group-hover:text-primary transition-colors'
                    }`}>
                      <Bot size={20} strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <div className="text-[15px] font-light tracking-tight">{agent.name}</div>
                      <div className={`text-[11px] font-light tracking-widest uppercase ${
                        selectedAgent?.id === agent.id ? 'text-white/40' : 'text-va-black/30'
                      }`}>v{agent.version} • {agent.agentSlug}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className={selectedAgent?.id === agent.id ? 'text-primary' : 'text-va-black/10'} />
                </button>
              ))}
            </div>

            {/* System Status Card */}
            <div className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-sm mt-8 space-y-6">
              <div className="flex items-center gap-3 text-green-600">
                <Activity size={18} strokeWidth={1.5} />
                <span className="text-[13px] font-bold tracking-widest uppercase">Systeem Status</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-light text-va-black/40">OpenAI API</span>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-green-600"><CheckCircle2 size={12} /> Live</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-light text-va-black/40">Prompt Sync</span>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-green-600"><CheckCircle2 size={12} /> 100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main: Editor */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {selectedAgent ? (
                <motion.div
                  key={selectedAgent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[20px] border border-black/[0.03] shadow-sm overflow-hidden flex flex-col min-h-[700px]"
                >
                  {/* Editor Header */}
                  <div className="p-8 border-b border-black/[0.03] flex justify-between items-center bg-va-off-white/30">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-va-black text-white rounded-[15px] flex items-center justify-center shadow-lg">
                        <Code size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <HeadingInstrument level={2} className="text-2xl font-light tracking-tight">System Prompt: {selectedAgent.name}</HeadingInstrument>
                        <TextInstrument className="text-[14px] text-va-black/40 font-light">{selectedAgent.description || 'Geen beschrijving beschikbaar.'}</TextInstrument>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-va-black text-white rounded-full text-[11px] font-bold tracking-widest uppercase">Version {selectedAgent.version}</div>
                      {selectedAgent.isActive ? (
                        <div className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[11px] font-bold tracking-widest uppercase flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Active
                        </div>
                      ) : (
                        <div className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-[11px] font-bold tracking-widest uppercase">Inactive</div>
                      )}
                    </div>
                  </div>

                  {/* Editor Content */}
                  <div className="flex-1 p-8 space-y-6">
                    <div className="space-y-2">
                      <LabelInstrument className="text-[11px] font-medium tracking-[0.2em] text-va-black/20 uppercase ml-1">Instructies (System Message)</LabelInstrument>
                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        className="w-full h-[400px] p-8 bg-va-off-white/50 border border-black/[0.03] rounded-[20px] text-[15px] font-mono leading-relaxed focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all custom-scrollbar"
                        placeholder="Voer hier de system prompt in..."
                      />
                    </div>

                    <div className="space-y-2">
                      <LabelInstrument className="text-[11px] font-medium tracking-[0.2em] text-va-black/20 uppercase ml-1">Wijzigingsnotitie</LabelInstrument>
                      <InputInstrument
                        value={changeNote}
                        onChange={(e) => setChangeNote(e.target.value)}
                        placeholder="Wat heb je aangepast in deze versie?"
                        className="w-full bg-va-off-white/50 border-none rounded-[15px] py-4 px-6 text-[15px] font-light"
                      />
                    </div>
                  </div>

                  {/* Editor Footer */}
                  <div className="p-8 border-t border-black/[0.03] bg-va-off-white/30 flex justify-between items-center">
                    <div className="flex items-center gap-4 text-va-black/30">
                      <History size={16} strokeWidth={1.5} />
                      <span className="text-[13px] font-light italic">Laatste wijziging: {new Date(selectedAgent.updatedAt).toLocaleString('nl-BE')}</span>
                    </div>
                    <ButtonInstrument
                      onClick={handleSave}
                      disabled={isSaving || editPrompt === selectedAgent.systemPrompt}
                      className="va-btn-pro !bg-va-black flex items-center gap-3 px-10 py-4"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={1.5} />}
                      <span className="font-bold tracking-widest text-[12px] uppercase">Instructies Bijwerken</span>
                    </ButtonInstrument>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-va-black/20 italic font-light">Selecteer een agent om te beheren.</div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ContainerInstrument>

      {/* LLM Context Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "Assistent Beheer",
            "description": "Beheer van AI-assistenten en instructies.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "agent_management",
              "capabilities": ["edit_prompts", "version_control", "system_monitoring"],
              "lexicon": ["Assistent", "Instructies", "Inzichten"],
              "visual_dna": ["Code Editor", "Sidebar Navigation", "Chris-Protocol"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
