"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { VOICES_CONFIG } from '@config/config';
import { useSonicDNA } from '@/lib/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Activity, 
  Check, 
  ChevronRight, 
  HelpCircle, 
  Lock, 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  Shield, 
  Unlock, 
  X, 
  Maximize2, 
  Minimize2,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, FormInstrument, HeadingInstrument, InputInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

export const VoicyChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [mailForm, setMailForm] = useState({ email: '', message: '' });
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [isFullMode, setIsFullMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'mail' | 'phone' | 'faq' | 'admin'>('chat');
  const [chatMode, setChatMode] = useState<'ask' | 'agent'>('ask');
  const [customer360, setCustomer360] = useState<any>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { state } = useCheckout();
  const { playClick } = useSonicDNA();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { isEditMode, toggleEditMode } = useEditMode();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🌐 Get current language
  const language = typeof window !== 'undefined' ? (document.cookie.split('; ').find(row => row.startsWith('voices_lang='))?.split('=')[1] || 'nl') : 'nl';

  // 🧠 Listen for Voicy Suggestions from other components
  useEffect(() => {
    const handleSuggestion = (e: any) => {
      const { title, content, type, actions, tab } = e.detail || {};
      setIsOpen(true);
      if (tab) setActiveTab(tab);
      else setActiveTab('chat');
      
      playClick('deep');
      
      setMessages(prev => [...prev, {
        id: `suggestion-${Date.now()}`,
        role: 'assistant',
        content: content || `Ik heb een suggestie voor je: ${title}`,
        timestamp: new Date().toISOString(),
        isSuggestion: true,
        actions: actions || [],
        media: e.detail?.media || []
      }]);
    };

    window.addEventListener('voicy:suggestion', handleSuggestion);
    return () => window.removeEventListener('voicy:suggestion', handleSuggestion);
  }, [playClick]);

  // 🧠 UCI Integration: Fetch Customer 360 data when authenticated
  useEffect(() => {
    const fetchUCI = async () => {
      if (isAuthenticated && user?.email) {
        try {
          const res = await fetch(`/api/intelligence/customer-360?email=${user.email}`);
          if (res.ok) {
            const data = await res.json();
            setCustomer360(data);
            
            // Proactive Welcome based on Vibe
            if (data.intelligence.leadVibe === 'burning') {
              setMessages(prev => [...prev, {
                id: 'proactive-burning',
                role: 'assistant',
                content: `Welkom terug, ${data.firstName}! 🔥 Ik zie dat je een trouwe klant bent. Kan ik je helpen met een nieuwe boeking voor ${data.dna.topJourneys[0] || 'je project'}?`,
                timestamp: new Date().toISOString()
              }]);
            }
          }
        } catch (e) {
          console.error("UCI Fetch failed", e);
        }
      }
    };
    fetchUCI();
  }, [isAuthenticated, user]);

  // ⚡ Real-time SSE Integration
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const lastId = messages.length > 0 ? messages[messages.length - 1].id : 0;
    const eventSource = new EventSource(`/api/chat/sse?conversationId=${conversationId}&lastMessageId=${lastId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_messages') {
        const newMsgs = data.messages.filter((m: any) => !messages.find(existing => existing.id === m.id.toString()));
        if (newMsgs.length > 0) {
          setMessages(prev => [...prev, ...newMsgs.map((m: any) => ({
            id: m.id.toString(),
            role: m.senderType === 'ai' ? 'assistant' : m.senderType,
            content: m.message,
            timestamp: m.createdAt
          }))]);
          playClick('deep');
        }
      }
    };

    return () => eventSource.close();
  }, [isOpen, conversationId, messages, playClick]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hallo! 👋 Ik ben Voicy, je AI-assistent. Hoe kan ik je vandaag helpen?',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    playClick(isOpen ? 'light' : 'deep');
    setIsOpen(!isOpen);
  };

  const handleSend = async (e?: React.FormEvent, overrideValue?: string) => {
    e?.preventDefault();
    const messageToSend = overrideValue || inputValue;
    if (!messageToSend.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    playClick('light');

    try {
      // 🧪 Check for active Cody Preview Logic
      const previewLogic = typeof window !== 'undefined' ? sessionStorage.getItem('cody_preview_logic') : null;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          message: userMessage.content,
          language: language,
          mode: chatMode,
          previewLogic: previewLogic, // 🧪 Stuur preview code mee naar de API
          context: {
            briefing: state.briefing,
            isAuthenticated,
            user: user?.email,
            customer360: customer360
          }
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.content || "Ik ben even de verbinding kwijt, maar ik ben er nog!",
        timestamp: new Date().toISOString(),
        actions: data.actions || [],
        media: data.media || []
      };

      // 🌐 VOICEGLOT: Ensure AI content is translated if needed
      if (language !== 'nl' && aiResponse.content) {
        try {
          const transRes = await fetch('/api/translations/heal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: `chat.dynamic.${aiResponse.id}`,
              originalText: aiResponse.content,
              currentLang: language
            })
          });
          const transData = await transRes.json();
          if (transData.success && transData.text) {
            aiResponse.content = transData.text;
          }
        } catch (e) {
          console.error("Voicy translation failed", e);
        }
      }

      setMessages(prev => [...prev, aiResponse]);
      playClick('deep');
    } catch (error) {
      console.error("Chat API error:", error);
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oeps, er ging iets mis bij het verwerken van je bericht. Probeer het later nog eens!",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleMailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailForm.email || !mailForm.message) return;

    setIsSendingMail(true);
    playClick('light');

    try {
      const response = await fetch('/api/mailbox/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mailForm.email,
          message: mailForm.message,
          source: 'voicy_mail_tab',
          context: {
            customer360: customer360,
            isAuthenticated
          }
        })
      });

      if (response.ok) {
        setMailSent(true);
        playClick('success');
        setMailForm({ email: '', message: '' });
      } else {
        throw new Error('Failed to send mail');
      }
    } catch (error) {
      console.error("Mail submission error:", error);
    } finally {
      setIsSendingMail(false);
    }
  };

  // 🧠 Smart Chips logic
  const getSmartChips = () => {
    if (isAdmin) {
      return [
        { label: "Edit Mode", action: "toggle_edit_mode", icon: Lock },
        { label: "Dashboard", action: "open_dashboard", icon: Activity },
        { label: "Mailbox", action: "open_mailbox", icon: Mail },
        { label: "Nieuwe Pagina", action: "create_page", icon: Shield }
      ];
    }

    const chips = [];
    
    // Context-based chips
    if (state.selectedActor) {
      chips.push({ label: `Prijs voor ${state.selectedActor.first_name}`, action: "calculate_price", icon: MessageSquare });
      chips.push({ label: "Direct Boeken", action: "check", icon: Check });
    } else {
      chips.push({ label: "Stemmen Zoeken", action: "browse_voices", icon: MessageSquare });
    }

    if (state.vat_number) {
      chips.push({ label: "Check BTW Status", action: "check_vat", icon: Shield });
    }

    if (state.briefing.length > 0) {
      chips.push({ label: "Woorden Tellen", icon: Activity });
    }

    chips.push({ label: "Tarieven", action: "ask_pricing", icon: HelpCircle });
    chips.push({ label: "Hoe werkt het?", action: "ask_how_it_works", icon: HelpCircle });

    return chips;
  };

  return (
    <ContainerInstrument className="fixed bottom-8 right-8 z-[100]">
      {/* Smart Chips (Floating above toggle) */}
      {!isOpen && (
        <ContainerInstrument className="absolute bottom-20 right-0 flex flex-col items-end gap-2 pointer-events-none">
          <AnimatePresence>
            {getSmartChips().map((chip, i) => (
              <motion.button
                key={chip.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                  if (chip.action === 'toggle_edit_mode') toggleEditMode();
                  else handleSend(undefined, chip.label);
                }}
                className="pointer-events-auto bg-white/90 backdrop-blur-md border border-black/5 px-4 py-2 rounded-full shadow-aura flex items-center gap-2 group hover:bg-primary hover:text-white transition-all"
              >
                <chip.icon size={12} className="text-primary group-hover:text-white transition-colors" />
                <TextInstrument className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  {chip.label}
                </TextInstrument>
              </motion.button>
            ))}
          </AnimatePresence>
        </ContainerInstrument>
      )}

      {/* Chat Toggle Button */}
      <ButtonInstrument
        onClick={toggleChat}
        className={`w-16 h-16 rounded-full shadow-aura flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group relative overflow-hidden ${
          isOpen ? 'bg-va-black text-white rotate-90' : 'bg-white text-va-black'
        }`}
      >
        {isOpen ? <X size={28} /> : (
          <div className="relative w-full h-full rounded-full overflow-hidden bg-transparent">
            <Image 
              src={VOICES_CONFIG.assets.placeholders.voicy} 
              alt="Voicy" 
              fill
              className="object-cover"
            />
          </div>
        )}
        {!isOpen && (
          <ContainerInstrument className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </ButtonInstrument>

      {/* Chat Window */}
      <ContainerInstrument className={`absolute bottom-20 right-0 bg-white rounded-[32px] shadow-aura flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right ${
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
      } ${
        isFullMode 
          ? 'fixed inset-8 w-auto h-auto right-8 bottom-8 z-[101]' 
          : 'w-[400px] h-[600px]'
      }`}>
        {/* Header */}
        <ContainerInstrument className="p-6 bg-va-black text-white flex justify-between items-center relative overflow-hidden">
          <ContainerInstrument className="relative z-10">
            <HeadingInstrument level={3} className="text-lg font-black uppercase tracking-tighter">
              <VoiceglotText translationKey="chat.title" defaultText="Voicy" />
            </HeadingInstrument>
            <ContainerInstrument className="flex items-center gap-2">
              <TextInstrument as="span" className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <TextInstrument as="span" className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                <VoiceglotText translationKey="chat.status.online" defaultText="Online & Klaar" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="flex items-center gap-2 relative z-10">
            <ButtonInstrument 
              onClick={() => setIsFullMode(!isFullMode)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              {isFullMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </ButtonInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
        </ContainerInstrument>

        {/* Tabs */}
        <ContainerInstrument className="flex border-b border-black/5 p-2 gap-1">
          {[
            { id: 'chat', icon: MessageSquare, label: 'Chat', translationKey: 'chat.tabs.chat' },
            { id: 'mail', icon: Mail, label: 'Mail', translationKey: 'chat.tabs.mail' },
            { id: 'phone', icon: Phone, label: 'Bel', translationKey: 'chat.tabs.phone' },
            { id: 'faq', icon: HelpCircle, label: 'FAQ', translationKey: 'chat.tabs.faq' },
            ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Admin', translationKey: 'chat.tabs.admin' }] : []),
          ].map((tab) => (
            <ButtonInstrument
              key={tab.id}
              onClick={() => {
                playClick('light');
                setActiveTab(tab.id as any);
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${
                activeTab === tab.id ? 'bg-primary/5 text-primary' : 'text-va-black/30 hover:bg-black/5'
              }`}
            >
              <tab.icon size={18} />
              <TextInstrument as="span" className="text-[9px] font-black uppercase tracking-widest">
                <VoiceglotText translationKey={tab.translationKey} defaultText={tab.label} />
              </TextInstrument>
            </ButtonInstrument>
          ))}
        </ContainerInstrument>

        {/* Mode Selector (Ask vs Agent) */}
        {activeTab === 'chat' && (
          <ContainerInstrument className="px-6 py-2 bg-va-off-white/50 border-b border-black/5 flex justify-center">
            <div className="flex bg-white p-1 rounded-full border border-black/5 shadow-sm">
              <button 
                onClick={() => { setChatMode('ask'); playClick('light'); }}
                className={`px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${chatMode === 'ask' ? 'bg-va-black text-white shadow-md' : 'text-va-black/30 hover:text-va-black'}`}
              >
                Ask
              </button>
              <button 
                onClick={() => { setChatMode('agent'); playClick('pro'); }}
                className={`px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${chatMode === 'agent' ? 'bg-primary text-white shadow-md' : 'text-va-black/30 hover:text-va-black'}`}
              >
                {chatMode === 'agent' && <Zap size={10} className="animate-pulse" />}
                Agent
              </button>
            </div>
          </ContainerInstrument>
        )}

        {/* Content Area */}
        <ContainerInstrument className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'chat' && (
            <ContainerInstrument className={`flex-1 overflow-hidden relative flex ${isFullMode ? 'flex-row' : 'flex-col'}`}>
              <ContainerInstrument className="flex-1 flex flex-col overflow-hidden border-r border-black/5">
                <ContainerInstrument ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {messages.map((msg) => (
                    <ContainerInstrument
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <ContainerInstrument className={`max-w-[80%] p-4 rounded-[24px] text-sm font-medium leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                          : 'bg-va-off-white text-va-black rounded-tl-none'
                      }`}>
                        {msg.content}
                        {msg.actions && msg.actions.length > 0 && (
                          <ContainerInstrument className="mt-4 flex flex-wrap gap-2">
                          {msg.actions.map((action: any, i: number) => (
                            <ButtonInstrument
                              key={i}
                              onClick={() => {
                                if (action.action === 'toggle_edit_mode') {
                                  toggleEditMode();
                                  setMessages(prev => [...prev, {
                                    id: Date.now().toString(),
                                    role: 'assistant',
                                    content: `Edit Mode is nu ${!isEditMode ? 'ingeschakeld' : 'uitgeschakeld'}.`,
                                    timestamp: new Date().toISOString()
                                  }]);
                                  return;
                                }
                                if (action.action === 'create_page') {
                                  window.location.href = '/admin/pages/new';
                                  return;
                                }
                                if (action.action === 'manage_layouts') {
                                  window.location.href = '/admin/pages';
                                  return;
                                }
                                if (action.action === 'open_dashboard') {
                                  window.location.href = '/admin/dashboard';
                                  return;
                                }
                                if (action.action === 'draft_from_vault') {
                                  window.location.href = '/admin/vault';
                                  return;
                                }
                                if (action.action === 'open_approvals') {
                                  window.location.href = '/admin/approvals';
                                  return;
                                }
                                if (action.action === 'create_project_quote') {
                                  window.location.href = '/agency';
                                  return;
                                }

                                // 🌐 Handle dynamic language-aware links
                                if (typeof action.action === 'string' && action.action.startsWith('/')) {
                                  window.location.href = action.action;
                                  return;
                                }

                                const result = typeof action.action === 'function' ? action.action() : `Actie uitgevoerd: ${action.label}`;
                                setMessages(prev => [...prev, {
                                  id: Date.now().toString(),
                                  role: 'assistant',
                                  content: result,
                                  timestamp: new Date().toISOString()
                                }]);
                              }}
                              className="px-4 py-2 bg-white text-primary rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm"
                            >
                              <VoiceglotText translationKey={`chat.action.${action.label.toLowerCase().replace(/\s+/g, '_')}`} defaultText={action.label} />
                            </ButtonInstrument>
                          ))}
                        </ContainerInstrument>
                      )}

                      {msg.media && msg.media.length > 0 && (
                        <ContainerInstrument className="mt-4 space-y-3">
                          {msg.media.map((item: any, i: number) => (
                            <ContainerInstrument key={i} className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                              <TextInstrument className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                                {item.title}
                              </TextInstrument>
                              {item.type === 'audio' ? (
                                <audio controls className="w-full h-8 accent-primary">
                                  <source src={item.url} type="audio/mpeg" />
                                </audio>
                              ) : (
                                <video controls className="w-full rounded-xl shadow-lg">
                                  <source src={item.url} type="video/mp4" />
                                </video>
                              )}
                            </ContainerInstrument>
                          ))}
                        </ContainerInstrument>
                      )}
                    </ContainerInstrument>
                    </ContainerInstrument>
                  ))}
                </ContainerInstrument>

                {/* Input Area */}
                <ContainerInstrument className="p-6 border-t border-black/5 bg-white">
                  <FormInstrument onSubmit={handleSend} className="relative">
                    <InputInstrument
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Typ je bericht..."
                      className="w-full bg-va-off-white border-none rounded-full py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <ButtonInstrument
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-va-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send size={18} />
                    </ButtonInstrument>
                  </FormInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              {isFullMode && (
                <ContainerInstrument className="w-96 bg-va-off-white p-8 overflow-y-auto custom-scrollbar space-y-8">
                  <ContainerInstrument>
                    <HeadingInstrument level={4} className="text-xs font-black uppercase tracking-widest text-va-black/30 mb-6">
                      Project Details
                    </HeadingInstrument>
                    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/40">Type</TextInstrument>
                        <TextInstrument className="text-xs font-black uppercase">{state.usage}</TextInstrument>
                      </div>
                      <div className="flex justify-between items-center">
                        <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/40">Woorden</TextInstrument>
                        <TextInstrument className="text-xs font-black">{state.briefing.split(/\s+/).filter(Boolean).length}</TextInstrument>
                      </div>
                      <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                        <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-primary">Totaal</TextInstrument>
                        <TextInstrument className="text-lg font-black text-primary">€ {state.pricing.total.toFixed(2)}</TextInstrument>
                      </div>
                    </div>
                  </ContainerInstrument>

                  {state.selectedActor && (
                    <ContainerInstrument>
                      <HeadingInstrument level={4} className="text-xs font-black uppercase tracking-widest text-va-black/30 mb-6">
                        Geselecteerde Stem
                      </HeadingInstrument>
                      <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                          {state.selectedActor.first_name[0]}
                        </div>
                        <div>
                          <TextInstrument className="text-sm font-black">{state.selectedActor.first_name}</TextInstrument>
                          <TextInstrument className="text-[10px] font-bold uppercase opacity-40">{state.selectedActor.native_lang}</TextInstrument>
                        </div>
                      </div>
                    </ContainerInstrument>
                  )}

                  <ContainerInstrument className="pt-4">
                    <ButtonInstrument 
                      as="a" 
                      href="/checkout"
                      className="w-full py-4 bg-va-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      Direct Afrekenen <ChevronRight size={14} />
                    </ButtonInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          )}

          {activeTab === 'mail' && (
            <ContainerInstrument className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {mailSent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                      <Check size={32} />
                    </div>
                    <HeadingInstrument level={4} className="text-xl font-black uppercase tracking-tighter">
                      <VoiceglotText translationKey="chat.mail.sent.title" defaultText="Bericht verzonden!" />
                    </HeadingInstrument>
                    <TextInstrument className="text-sm text-va-black/40 font-medium">
                      <VoiceglotText translationKey="chat.mail.sent.text" defaultText="Bedankt! We hebben je bericht ontvangen en reageren zo snel mogelijk." />
                    </TextInstrument>
                    <ButtonInstrument 
                      onClick={() => setMailSent(false)}
                      className="va-btn-pro px-8 py-3 text-[10px]"
                    >
                      <VoiceglotText translationKey="chat.mail.sent.cta" defaultText="Nog een bericht sturen" />
                    </ButtonInstrument>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-6"
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Mail size={24} />
                      </div>
                      <HeadingInstrument level={4} className="text-lg font-black uppercase tracking-tighter">
                        <VoiceglotText translationKey="chat.mail.title" defaultText="Stuur ons een bericht" />
                      </HeadingInstrument>
                      <TextInstrument className="text-xs text-va-black/40 font-medium">
                        <VoiceglotText translationKey="chat.mail.subtitle" defaultText="We reageren meestal binnen het uur." />
                      </TextInstrument>
                    </div>

                    <FormInstrument onSubmit={handleMailSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-va-black/30 ml-4">
                          <VoiceglotText translationKey="chat.mail.label.email" defaultText="Jouw E-mail" />
                        </label>
                        <InputInstrument 
                          type="email" 
                          required
                          value={mailForm.email}
                          onChange={(e) => setMailForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="naam@bedrijf.be"
                          className="w-full bg-va-off-white border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-va-black/30 ml-4">
                          <VoiceglotText translationKey="chat.mail.label.message" defaultText="Jouw Bericht" />
                        </label>
                        <textarea 
                          required
                          value={mailForm.message}
                          onChange={(e) => setMailForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Hoe kunnen we je helpen?"
                          className="w-full bg-va-off-white border-none rounded-[24px] py-4 px-6 text-sm font-medium min-h-[120px] focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"
                        />
                      </div>
                      <ButtonInstrument 
                        type="submit" 
                        disabled={isSendingMail}
                        className="w-full py-4 bg-va-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                      >
                        {isSendingMail ? <VoiceglotText translationKey="chat.mail.sending" defaultText="Verzenden..." /> : <VoiceglotText translationKey="chat.mail.submit" defaultText="Bericht Versturen" />}
                        {!isSendingMail && <Send size={14} />}
                      </ButtonInstrument>
                    </FormInstrument>

                    <div className="pt-4 border-t border-black/5 text-center">
                      <TextInstrument className="text-[9px] font-bold text-va-black/20 uppercase tracking-widest">
                        <VoiceglotText translationKey="chat.mail.direct" defaultText="Direct contact?" /> <a href="mailto:johfrah@voices.be" className="text-primary hover:underline">johfrah@voices.be</a>
                      </TextInstrument>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ContainerInstrument>
          )}

          {activeTab === 'phone' && (
            <ContainerInstrument className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <ContainerInstrument className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Phone size={32} />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-2">
                <HeadingInstrument level={4} className="text-xl font-black uppercase tracking-tighter">
                  <VoiceglotText translationKey="chat.phone.title" defaultText="Bel de studio" />
                </HeadingInstrument>
                <TextInstrument className="text-sm text-va-black/40 font-medium">
                  <VoiceglotText translationKey="chat.phone.subtitle" defaultText="Direct contact met onze regisseurs." />
                </TextInstrument>
              </ContainerInstrument>
              <a href="tel:+3227931991" className="va-btn-pro w-full">+32 (0)2 793 19 91</a>
            </ContainerInstrument>
          )}

          {activeTab === 'faq' && (
            <ContainerInstrument className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              <HeadingInstrument level={4} className="text-xs font-black uppercase tracking-widest text-va-black/30 mb-4">
                <VoiceglotText translationKey="chat.faq.title" defaultText="Veelgestelde vragen" />
              </HeadingInstrument>
              {[
                { q: "Wat zijn de tarieven?", key: "chat.faq.q1" },
                { q: "Hoe snel wordt er geleverd?", key: "chat.faq.q2" },
                { q: "Kan ik een gratis proefopname krijgen?", key: "chat.faq.q3" },
                { q: "Welke talen bieden jullie aan?", key: "chat.faq.q4" }
              ].map((faq, i) => (
                  <ButtonInstrument
                    key={i}
                    onClick={() => {
                      setActiveTab('chat');
                      handleSend(undefined, faq.q);
                    }}
                    className="w-full text-left p-4 rounded-2xl bg-va-off-white hover:bg-primary/5 hover:text-primary transition-all text-sm font-bold flex justify-between items-center group"
                  >
                    <TextInstrument as="span">
                      <VoiceglotText translationKey={faq.key} defaultText={faq.q} />
                    </TextInstrument>
                    <Send size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  </ButtonInstrument>
              ))}
            </ContainerInstrument>
          )}

          {activeTab === 'admin' && isAdmin && (
            <ContainerInstrument className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <HeadingInstrument level={4} className="text-xs font-black uppercase tracking-widest text-va-black/30 mb-4">
                <VoiceglotText translationKey="chat.admin.title" defaultText="Admin Control Panel" />
              </HeadingInstrument>
              
              <ContainerInstrument className="space-y-4">
                <ButtonInstrument
                  onClick={() => {
                    playClick('pro');
                    toggleEditMode();
                  }}
                  className={`w-full p-6 rounded-[24px] flex items-center justify-between transition-all ${
                    isEditMode ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-va-off-white text-va-black hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEditMode ? 'bg-white/20' : 'bg-va-black/5'}`}>
                      {isEditMode ? <Unlock size={20} /> : <Lock size={20} />}
                    </div>
                    <div className="text-left">
                      <TextInstrument className="text-sm font-black uppercase tracking-tight">
                        <VoiceglotText translationKey="admin.edit_mode.title" defaultText="Edit Mode" />
                      </TextInstrument>
                      <TextInstrument className={`text-[10px] font-bold uppercase opacity-60 ${isEditMode ? 'text-white' : 'text-va-black'}`}>
                        {isEditMode ? <VoiceglotText translationKey="common.enabled" defaultText="Ingeschakeld" /> : <VoiceglotText translationKey="common.disabled" defaultText="Uitgeschakeld" />}
                      </TextInstrument>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isEditMode ? 'bg-white/30' : 'bg-va-black/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isEditMode ? 'left-7' : 'left-1'}`} />
                  </div>
                </ButtonInstrument>

                <div className="grid grid-cols-2 gap-3">
                  <ButtonInstrument
                    as="a"
                    href="/admin/dashboard"
                    className="p-4 rounded-2xl bg-va-off-white hover:bg-black/5 transition-all text-left space-y-1"
                  >
                    <Activity size={16} className="text-va-black/40" />
                    <TextInstrument className="text-[10px] font-black uppercase tracking-widest block">
                      <VoiceglotText translationKey="nav.dashboard" defaultText="Dashboard" />
                    </TextInstrument>
                  </ButtonInstrument>
                  <ButtonInstrument
                    as="a"
                    href="/account/mailbox"
                    className="p-4 rounded-2xl bg-va-off-white hover:bg-black/5 transition-all text-left space-y-1"
                  >
                    <Mail size={16} className="text-va-black/40" />
                    <TextInstrument className="text-[10px] font-black uppercase tracking-widest block">
                      <VoiceglotText translationKey="nav.mailbox" defaultText="Mailbox" />
                    </TextInstrument>
                  </ButtonInstrument>
                </div>

                {customer360 && (
                  <ContainerInstrument className="p-4 bg-va-black text-white rounded-[24px] space-y-3">
                    <HeadingInstrument level={5} className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      <VoiceglotText translationKey="account.dna.title" defaultText="Klant DNA" />
                    </HeadingInstrument>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black">{customer360.firstName?.[0]}</div>
                      <div>
                        <TextInstrument className="text-xs font-black">
                          <VoiceglotText translationKey={`user.${customer360.id}.name`} defaultText={`${customer360.firstName} ${customer360.lastName}`} noTranslate={true} />
                        </TextInstrument>
                        <TextInstrument className="text-[9px] font-bold uppercase opacity-40">
                          {customer360.intelligence?.leadVibe} <VoiceglotText translationKey="common.vibe" defaultText="Vibe" />
                        </TextInstrument>
                      </div>
                    </div>
                  </ContainerInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
