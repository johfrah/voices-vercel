"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { VOICES_CONFIG } from '@config/config';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Check,
    ChevronRight,
    HelpCircle,
    Mail,
    Maximize2,
    MessageSquare,
    Minimize2,
    Phone,
    Send,
    Shield,
    X,
    Zap
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, FormInstrument, HeadingInstrument, InputInstrument, LabelInstrument, TextInstrument } from './LayoutInstruments';
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
        { label: "Edit Mode", action: "toggle_edit_mode", src: "/assets/common/branding/icons/MENU.svg" },
        { label: "Dashboard", action: "open_dashboard", src: "/assets/common/branding/icons/INFO.svg" },
        { label: "Mailbox", action: "open_mailbox", src: "/assets/common/branding/icons/ACCOUNT.svg" },
        { label: "Nieuwe Pagina", action: "create_page", src: "/assets/common/branding/icons/FORWARD.svg" }
      ];
    }

    const chips = [];
    
    // Context-based chips
    if (state.selectedActor) {
      chips.push({ label: `Prijs voor ${state.selectedActor.first_name}`, action: "calculate_price", src: "/assets/common/branding/icons/INFO.svg" });
      chips.push({ label: "Direct Boeken", action: "check", src: "/assets/common/branding/icons/RIGHT.svg" });
    } else {
      chips.push({ label: "Stemmen Zoeken", action: "browse_voices", src: "/assets/common/branding/icons/SEARCH.svg" });
    }

    if (state.vat_number) {
      chips.push({ label: "Check BTW Status", action: "check_vat", src: "/assets/common/branding/icons/INFO.svg" });
    }

    if (state.briefing.length > 0) {
      chips.push({ label: "Woorden Tellen", src: "/assets/common/branding/icons/INFO.svg" });
    }

    chips.push({ label: "Tarieven", action: "ask_pricing", src: "/assets/common/branding/icons/CART.svg" });
    chips.push({ label: "Hoe werkt het?", action: "ask_how_it_works", src: "/assets/common/branding/icons/INFO.svg" });

    return chips;
  };

  return (
    <ContainerInstrument plain className="fixed bottom-8 right-8 z-[100]">
      {/* Smart Chips (Floating above toggle) */}
      {!isOpen && (
        <ContainerInstrument plain className="absolute bottom-20 right-0 flex flex-col items-end gap-2 pointer-events-none">
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
                {chip.src ? (
                  <ContainerInstrument plain className="w-5 h-5 flex items-center justify-center">
                    <Image  
                      src={chip.src} 
                      alt={chip.label} 
                      width={20} 
                      height={20} 
                      className="w-full h-full group-hover:invert group-hover:brightness-0 transition-all"
                      style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                    / />
                  </ContainerInstrument>
                ) : (
                  <ContainerInstrument plain className="w-5 h-5 flex items-center justify-center">
                    {(() => {
                      const Icon = (chip as any).icon;
                      return Icon ? <Icon strokeWidth={1.5} size={16} className="text-primary group-hover:text-white transition-colors" / /> : null;
                    })()}
                  </ContainerInstrument>
                )}
                <TextInstrument className="text-[15px] font-light tracking-widest whitespace-nowrap">
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
        className={`w-16 h-16 rounded-full shadow-aura flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group relative ${
          isOpen ? 'bg-va-black text-white rotate-90' : 'bg-transparent text-va-black'
        }`}
      >
        {isOpen ? <X strokeWidth={1.5} size={28} /> : (
          <ContainerInstrument plain className="relative w-full h-full rounded-full overflow-hidden">
            <Image  
              src={VOICES_CONFIG.assets.placeholders.voicy} 
              alt="Voicy" 
              fill
              className="object-contain p-1"
            / />
          </ContainerInstrument>
        )}
        {!isOpen && (
          <ContainerInstrument plain className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
        )}
      </ButtonInstrument>

      {/* Chat Window */}
      <ContainerInstrument plain className={`absolute bottom-20 right-0 bg-white rounded-[32px] shadow-aura flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right ${
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
      } ${
        isFullMode 
          ? 'fixed inset-8 w-auto h-auto right-8 bottom-8 z-[101]' 
          : 'w-[400px] h-[600px]'
      }`}>
        {/* Header */}
        <ContainerInstrument plain className="p-8 bg-va-black text-white flex justify-between items-center relative overflow-hidden">
          <ContainerInstrument plain className="relative z-10">
            <HeadingInstrument level={3} className="text-xl font-light tracking-tighter"><VoiceglotText strokeWidth={1.5} translationKey="chat.title" defaultText="Voicy" / /></HeadingInstrument>
            <ContainerInstrument plain className="flex items-center gap-2 mt-1">
              <TextInstrument as="span" className="w-2 h-2 rounded-full bg-green-500 animate-pulse font-light" />
              <TextInstrument as="span" className="text-[15px] font-light tracking-widest opacity-60"><VoiceglotText strokeWidth={1.5} translationKey="chat.status.online" defaultText="Online & Klaar" / /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument plain className="flex items-center gap-2 relative z-10">
            <ButtonInstrument 
              onClick={() => setIsFullMode(!isFullMode)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              {isFullMode ? <Minimize2 strokeWidth={1.5} size={18} / /> : <Maximize2 strokeWidth={1.5} size={18} / />}
            </ButtonInstrument>
          </ContainerInstrument>

          <ContainerInstrument plain className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
        </ContainerInstrument>

        {/* Tabs */}
        <ContainerInstrument plain className="flex border-b border-black/5 p-4 gap-2">
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
              className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl transition-all ${
                activeTab === tab.id ? 'bg-primary/5 text-primary' : 'text-va-black/30 hover:bg-black/5'
              }`}
            >
              <tab.icon size={18} />
              <TextInstrument as="span" className="text-[15px] font-light tracking-widest"><VoiceglotText strokeWidth={1.5} translationKey={tab.translationKey} defaultText={tab.label} / /></TextInstrument>
            </ButtonInstrument>
          ))}
        </ContainerInstrument>

        {/* Mode Selector (Ask vs Agent) */}
        {activeTab === 'chat' && (
          <ContainerInstrument plain className="px-8 py-4 bg-va-off-white/50 border-b border-black/5 flex justify-center">
            <ContainerInstrument plain className="flex bg-white p-1.5 rounded-full border border-black/5 shadow-sm">
              <ButtonInstrument 
                onClick={() => { setChatMode('ask'); playClick('light'); }}
                className={`px-8 py-2.5 rounded-full text-[15px] font-light tracking-widest transition-all ${chatMode === 'ask' ? 'bg-va-black text-white shadow-md' : 'text-va-black/30 hover:text-va-black'}`}
              >
                <VoiceglotText strokeWidth={1.5} translationKey="chat.mode.ask" defaultText="Ask" / />
              </ButtonInstrument>
              <ButtonInstrument 
                onClick={() => { setChatMode('agent'); playClick('pro'); }}
                className={`px-8 py-2.5 rounded-full text-[15px] font-light tracking-widest transition-all flex items-center gap-2 ${chatMode === 'agent' ? 'bg-primary text-white shadow-md' : 'text-va-black/30 hover:text-va-black'}`}
              >
                {chatMode === 'agent' && <Zap strokeWidth={1.5} size={10} className="animate-pulse" />}
                <VoiceglotText strokeWidth={1.5} translationKey="chat.mode.agent" defaultText="Agent" / />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        )}

        {/* Content Area */}
        <ContainerInstrument plain className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'chat' && (
            <ContainerInstrument plain className={`flex-1 overflow-hidden relative flex ${isFullMode ? 'flex-row' : 'flex-col'}`}>
              <ContainerInstrument plain className="flex-1 flex flex-col overflow-hidden border-r border-black/5">
                <ContainerInstrument plain ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                  {messages.map((msg) => (
                    <ContainerInstrument
                      plain
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <ContainerInstrument plain className={`max-w-[85%] p-4 md:p-6 rounded-[24px] text-[15px] font-light leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                          : 'bg-va-off-white text-va-black rounded-tl-none'
                      }`}>
                        {msg.content}
                        {msg.actions && msg.actions.length > 0 && (
                          <ContainerInstrument plain className="mt-4 flex flex-wrap gap-2">
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
                              className="px-4 py-2 bg-white text-primary rounded-full text-[15px] font-light tracking-widest hover:scale-105 transition-all shadow-sm"
                            >
                              <VoiceglotText strokeWidth={1.5} translationKey={`chat.action.${action.label.toLowerCase().replace(/\s+/g, '_')}`} defaultText={action.label} / />
                            </ButtonInstrument>
                          ))}
                        </ContainerInstrument>
                        )}

                        {msg.media && msg.media.length > 0 && (
                          <ContainerInstrument plain className="mt-4 space-y-3">
                            {msg.media.map((item: any, i: number) => (
                              <ContainerInstrument plain key={i} className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                                <TextInstrument className="text-[15px] font-black tracking-widest mb-2 opacity-60">
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
                <ContainerInstrument plain className="p-6 md:p-8 border-t border-black/5 bg-white">
                  <FormInstrument onSubmit={handleSend} className="relative">
                    <InputInstrument
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Typ je bericht..."
                      className="w-full bg-va-off-white border-none rounded-full py-4 md:py-5 pl-6 md:pl-8 pr-14 md:pr-16 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <ButtonInstrument
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-va-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send strokeWidth={1.5} size={18} />
                    </ButtonInstrument>
                  </FormInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              {isFullMode && (
                <ContainerInstrument plain className="w-96 bg-va-off-white p-8 overflow-y-auto custom-scrollbar space-y-8">
                  <ContainerInstrument plain>
                    <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-va-black/30 mb-6"><VoiceglotText strokeWidth={1.5} translationKey="auto.voicychat.project_details.ba5160" defaultText="Project Details" / /></HeadingInstrument>
                    <ContainerInstrument plain className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
                      <ContainerInstrument plain className="flex justify-between items-center">
                        <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText strokeWidth={1.5} translationKey="common.type" defaultText="Type" / /></TextInstrument>
                        <TextInstrument className="text-[15px] font-light ">{state.usage}</TextInstrument>
                      </ContainerInstrument>
                      <ContainerInstrument plain className="flex justify-between items-center">
                        <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText strokeWidth={1.5} translationKey="auto.voicychat.woorden.721081" defaultText="Woorden" / /></TextInstrument>
                        <TextInstrument className="text-[15px] font-light">{state.briefing.split(/\s+/).filter(Boolean).length}</TextInstrument>
                      </ContainerInstrument>
                      <ContainerInstrument plain className="pt-4 border-t border-black/5 flex justify-between items-center">
                        <TextInstrument className="text-[15px] font-light tracking-widest text-primary"><VoiceglotText strokeWidth={1.5} translationKey="auto.voicychat.totaal.e28895" defaultText="Totaal" / /></TextInstrument>
                        <TextInstrument className="text-lg font-light text-primary">€ {state.pricing.total.toFixed(2)}</TextInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  {state.selectedActor && (
                    <ContainerInstrument plain>
                      <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-va-black/30 mb-6"><VoiceglotText strokeWidth={1.5} translationKey="auto.voicychat.geselecteerde_stem.4b43a4" defaultText="Geselecteerde Stem" / /></HeadingInstrument>
                      <ContainerInstrument plain className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-4">
                        <ContainerInstrument plain className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-light text-primary">
                          {state.selectedActor.first_name[0]}
                        </ContainerInstrument>
                        <ContainerInstrument plain>
                          <TextInstrument className="text-[15px] font-light">{state.selectedActor.first_name}</TextInstrument>
                          <TextInstrument className="text-[15px] font-light opacity-40">{state.selectedActor.native_lang}</TextInstrument>
                        </ContainerInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  )}

                  <ContainerInstrument plain className="pt-4">
                    <ButtonInstrument 
                      as="a" 
                      href="/checkout"
                      className="w-full py-4 bg-va-black text-white rounded-2xl text-[15px] font-light tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      Direct afrekenen <ChevronRight strokeWidth={1.5} size={14} / />
                    </ButtonInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          )}

          {activeTab === 'mail' && (
            <ContainerInstrument plain className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
              <AnimatePresence strokeWidth={1.5} mode="wait">
                {mailSent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <ContainerInstrument plain className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                      <Check strokeWidth={1.5} size={32} />
                    </ContainerInstrument>
                    <HeadingInstrument level={4} className="text-xl font-light tracking-tighter">
                      <VoiceglotText strokeWidth={1.5} translationKey="chat.mail.sent.title" defaultText="Bericht verzonden!" / />
                      <TextInstrument className="text-[15px] text-va-black/40 font-light">
                        <VoiceglotText strokeWidth={1.5} translationKey="chat.mail.sent.text" defaultText="Bedankt! We hebben je bericht ontvangen en reageren zo snel mogelijk." / />
                      </TextInstrument>
                    </HeadingInstrument>
                    <ButtonInstrument 
                      onClick={() => setMailSent(false)}
                      className="va-btn-pro px-8 py-3 text-[15px]"
                    >
                      <VoiceglotText strokeWidth={1.5} translationKey="chat.mail.sent.cta" defaultText="Nog een bericht sturen" / />
                    </ButtonInstrument>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-6"
                  >
                    <ContainerInstrument plain className="flex flex-col items-center text-center space-y-2">
                      <ContainerInstrument plain className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Mail strokeWidth={1.5} size={24} />
                      </ContainerInstrument>
                      <HeadingInstrument level={4} className="text-lg font-light tracking-tighter">
                        <VoiceglotText strokeWidth={1.5} translationKey="chat.mail.title" defaultText="Stuur ons een bericht" / />
                        <TextInstrument className="text-[15px] text-va-black/40 font-light">
                          <VoiceglotText strokeWidth={1.5} translationKey="chat.mail.subtitle" defaultText="We reageren meestal binnen het uur." / />
                        </TextInstrument>
                      </HeadingInstrument>
                    </ContainerInstrument>

                    <FormInstrument onSubmit={handleMailSubmit} className="space-y-4">
                      <ContainerInstrument plain className="space-y-1">
                        <LabelInstrument><VoiceglotText strokeWidth={1.5} translationKey="chat.mail.label.email" defaultText="Jouw E-mail" / /></LabelInstrument>
                        <InputInstrument 
                          type="email" 
                          required
                          value={mailForm.email}
                          onChange={(e) => setMailForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="naam@bedrijf.be"
                          className="w-full bg-va-off-white border-none rounded-2xl py-3 px-6 text-[15px] font-light focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </ContainerInstrument>
                      <ContainerInstrument plain className="space-y-1">
                        <LabelInstrument><VoiceglotText strokeWidth={1.5} translationKey="chat.mail.label.message" defaultText="Jouw Bericht" / /></LabelInstrument>
                        <textarea 
                          required
                          value={mailForm.message}
                          onChange={(e) => setMailForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Hoe kunnen we je helpen?"
                          className="w-full bg-va-off-white border-none rounded-[24px] py-4 px-6 text-[15px] font-light min-h-[120px] focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"
                        />
                      </ContainerInstrument>
                      <ButtonInstrument 
                        type="submit" 
                        disabled={isSendingMail}
                        className="w-full py-4 bg-va-black text-white rounded-2xl text-[15px] font-medium tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                      >
                        {isSendingMail ? <VoiceglotText strokeWidth={1.5} translationKey="chat.mail.sending" defaultText="Verzenden..." / /> : <VoiceglotText strokeWidth={1.5} translationKey="chat.mail.submit" defaultText="Bericht Versturen" / />}
                        {!isSendingMail && <Send strokeWidth={1.5} size={14} />}
                      </ButtonInstrument>
                    </FormInstrument>

              <ContainerInstrument plain className="pt-4 border-t border-black/5 text-center">
                <TextInstrument className="text-[15px] font-light text-va-black/20 tracking-widest">
                  <VoiceglotText strokeWidth={1.5} translationKey="chat.mail.direct" defaultText="Direct contact?" / />
                  <ButtonInstrument as="a" href="mailto:johfrah@voices.be" className="text-primary hover:underline ml-2">
                    <VoiceglotText strokeWidth={1.5} translationKey="auto.voicychat.johfrah_voices_be.1bbc86" defaultText="johfrah@voices.be" / />
                  </ButtonInstrument>
                </TextInstrument>
              </ContainerInstrument>
                  </motion.div>
                )}
              </AnimatePresence>
            </ContainerInstrument>
          )}

          {activeTab === 'phone' && (
            <ContainerInstrument plain className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <ContainerInstrument plain className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Phone strokeWidth={1.5} size={32} />
              </ContainerInstrument>
              <ContainerInstrument plain className="space-y-2">
                <HeadingInstrument level={4} className="text-xl font-light tracking-tighter">
                  <VoiceglotText strokeWidth={1.5} translationKey="chat.phone.title" defaultText="Bel de studio" / />
                  <TextInstrument className="text-[15px] text-va-black/40 font-light">
                    <VoiceglotText strokeWidth={1.5} translationKey="chat.phone.subtitle" defaultText="Direct contact met onze regisseurs." / />
                  </TextInstrument>
                </HeadingInstrument>
              </ContainerInstrument>
              <ButtonInstrument as="a" href="tel:+3227931991" className="va-btn-pro w-full">+32 (0)2 793 19 91</ButtonInstrument>
            </ContainerInstrument>
          )}

          {activeTab === 'faq' && (
            <ContainerInstrument plain className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              <HeadingInstrument level={4} className="text-[15px] font-medium tracking-widest text-va-black/30 mb-4"><VoiceglotText strokeWidth={1.5} translationKey="chat.faq.title" defaultText="Veelgestelde vragen" / /></HeadingInstrument>
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
                      className="w-full text-left p-4 rounded-2xl bg-va-off-white hover:bg-primary/5 hover:text-primary transition-all text-[15px] font-light flex justify-between items-center group"
                    >
                    <TextInstrument as="span"><VoiceglotText strokeWidth={1.5} translationKey={faq.key} defaultText={faq.q} / /></TextInstrument>
                    <Send strokeWidth={1.5} size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  </ButtonInstrument>
              ))}
            </ContainerInstrument>
          )}

          {activeTab === 'admin' && isAdmin && (
            <ContainerInstrument plain className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <HeadingInstrument level={4} className="text-[15px] font-medium tracking-widest text-va-black/30 mb-4"><VoiceglotText strokeWidth={1.5} translationKey="chat.admin.title" defaultText="Admin Control Panel" / /></HeadingInstrument>
              
              <ContainerInstrument plain className="space-y-4">
                <ButtonInstrument
                  onClick={() => {
                    playClick('pro');
                    toggleEditMode();
                  }}
                  className={`w-full p-6 rounded-[24px] flex items-center justify-between transition-all ${
                    isEditMode ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-va-off-white text-va-black hover:bg-black/5'
                  }`}
                >
                  <ContainerInstrument plain className="flex items-center gap-4">
                    <ContainerInstrument plain className={`w-10 h-10 rounded-full flex items-center justify-center ${isEditMode ? 'bg-white/20' : 'bg-va-black/5'}`}>
                      <Image  
                        src="/assets/common/branding/icons/MENU.svg" 
                        alt="Edit Mode" 
                        width={20} 
                        height={20} 
                        className={isEditMode ? 'brightness-0 invert' : ''}
                        style={!isEditMode ? { filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' } : {}}
                      / />
                    </ContainerInstrument>
                    <ContainerInstrument plain className="text-left">
                      <TextInstrument className="text-[15px] font-light tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="admin.edit_mode.title" defaultText="Edit Mode" / /></TextInstrument>
                      <TextInstrument className={`text-[15px] font-light opacity-60 ${isEditMode ? 'text-white' : 'text-va-black'}`}>
                        {isEditMode ? <VoiceglotText strokeWidth={1.5} translationKey="common.enabled" defaultText="Ingeschakeld" / /> : <VoiceglotText strokeWidth={1.5} translationKey="common.disabled" defaultText="Uitgeschakeld" / />}
                      </TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument plain className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isEditMode ? 'bg-white/30' : 'bg-va-black/10'}`}>
                    <ContainerInstrument plain className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isEditMode ? 'left-7' : 'left-1'}`} />
                  </ContainerInstrument>
                </ButtonInstrument>

                <ContainerInstrument plain className="grid grid-cols-2 gap-3">
                  <ButtonInstrument
                    as="a"
                    href="/admin/dashboard"
                    className="p-4 rounded-2xl bg-va-off-white hover:bg-black/5 transition-all text-left space-y-1"
                  >
                    <ContainerInstrument plain className="w-4 h-4 mb-1">
                      <Image  
                        src="/assets/common/branding/icons/INFO.svg" 
                        alt="Dashboard" 
                        width={16} 
                        height={16} 
                        className="opacity-40"
                        style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                      / />
                    </ContainerInstrument>
                    <TextInstrument className="text-[15px] font-light tracking-widest block"><VoiceglotText strokeWidth={1.5} translationKey="nav.dashboard" defaultText="Dashboard" / /></TextInstrument>
                  </ButtonInstrument>
                  <ButtonInstrument
                    as="a"
                    href="/admin/mailbox"
                    className="p-4 rounded-2xl bg-va-off-white hover:bg-black/5 transition-all text-left space-y-1"
                  >
                    <ContainerInstrument plain className="w-4 h-4 mb-1">
                      <Image  
                        src="/assets/common/branding/icons/ACCOUNT.svg" 
                        alt="Mailbox" 
                        width={16} 
                        height={16} 
                        className="opacity-40"
                        style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
                      / />
                    </ContainerInstrument>
                    <TextInstrument className="text-[15px] font-light tracking-widest block"><VoiceglotText strokeWidth={1.5} translationKey="nav.mailbox" defaultText="Mailbox" / /></TextInstrument>
                  </ButtonInstrument>
                </ContainerInstrument>

                {customer360 && (
                  <ContainerInstrument plain className="p-4 bg-va-black text-white rounded-[24px] space-y-3">
                    <HeadingInstrument level={5} className="text-[15px] font-light tracking-widest opacity-40"><VoiceglotText strokeWidth={1.5} translationKey="account.dna.title" defaultText="Klant DNA" / /></HeadingInstrument>
                    <ContainerInstrument plain className="flex items-center gap-3">
                      <ContainerInstrument plain className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-light">{customer360.firstName?.[0]}</ContainerInstrument>
                      <ContainerInstrument plain>
                        <TextInstrument className="text-[15px] font-light"><VoiceglotText strokeWidth={1.5} translationKey={`user.${customer360.id}.name`} defaultText={`${customer360.firstName} ${customer360.lastName}`} noTranslate={true} / /></TextInstrument>
                        <TextInstrument className="text-[15px] font-light opacity-40">
                          {customer360.intelligence?.leadVibe} <VoiceglotText strokeWidth={1.5} translationKey="common.vibe" defaultText="Vibe" / />
                        </TextInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
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
