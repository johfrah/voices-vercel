"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
  import {
    Calendar,
    Check,
    ChevronRight,
    HelpCircle,
    Info,
    LayoutDashboard,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    PlayCircle,
    Search,
    Send,
    Shield,
    ShoppingCart,
    User,
    X,
    Zap
} from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { ButtonInstrument, ContainerInstrument, FormInstrument, HeadingInstrument, InputInstrument, LabelInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

export const VoicyChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mailForm, setMailForm] = useState({ email: '', message: '' });
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [isFullMode, setIsFullMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'mail' | 'phone' | 'faq' | 'admin'>('chat');
  const [chatMode, setChatMode] = useState<'ask' | 'agent'>('ask');
  const [customer360, setCustomer360] = useState<any>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [clickedChips, setClickedChips] = useState<string[]>([]);
  const [isHoveringVoicy, setIsHoveringVoicy] = useState(false);
  const [showChips, setShowChips] = useState(false);
  const chipsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { state } = useCheckout();
  const { playClick } = useSonicDNA();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { isEditMode, toggleEditMode } = useEditMode();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<number>(0);

  //  CHRIS-PROTOCOL: Track last DB ID for SSE without triggering loops
  useEffect(() => {
    const lastDbMsg = [...messages].reverse().find(m => {
      const idStr = m.id?.toString() || '';
      return idStr && 
             !isNaN(parseInt(idStr)) && 
             !idStr.startsWith('temp-') && 
             !idStr.startsWith('suggestion-') && 
             !idStr.startsWith('welcome') && 
             !idStr.startsWith('proactive-') &&
             parseInt(idStr) < 2147483647;
    });
    if (lastDbMsg) {
      lastIdRef.current = parseInt(lastDbMsg.id.toString());
    }
  }, [messages]);

  //  Persist Conversation ID and Load History
  useEffect(() => {
    const savedId = localStorage.getItem('voicy_conversation_id');
    if (savedId) {
      const parsedId = parseInt(savedId);
      setConversationId(parsedId);
      loadHistory(parsedId);
    }
  }, []);

  const loadHistory = async (id: number) => {
    setIsInitialLoading(true);
    try {
      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'history', conversationId: id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.messages.length > 0) {
          setMessages(data.messages);
        }
      }
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setIsInitialLoading(false);
    }
  };

  //  Determine Journey
  const isAcademyJourney = pathname?.includes('/academy');
  const isStudioJourney = pathname?.includes('/studio') && !isAcademyJourney;
  const isAgencyJourney = !isStudioJourney && !isAcademyJourney;

  //  Get current language
  const language = typeof window !== 'undefined' ? (document.cookie.split('; ').find(row => row.startsWith('voices_lang='))?.split('=')[1] || 'nl') : 'nl';

  //  Listen for Voicy Suggestions from other components
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

  //  UCI Integration: Fetch Customer 360 data when authenticated
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
                content: `Welkom terug, ${data.firstName}!  Ik zie dat je een trouwe klant bent. Kan ik je helpen met een nieuwe boeking voor ${data.dna.topJourneys[0] || 'je project'}?`,
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

  //  Real-time SSE Integration
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const lastId = lastIdRef.current;
    
    let eventSource: EventSource | null = new EventSource(`/api/chat/sse/?conversationId=${conversationId}&lastMessageId=${lastId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_messages') {
          //  CHRIS-PROTOCOL: Gebruik een functionele update om de meest recente messages state te gebruiken zonder de dependency array te vervuilen
          setMessages(prev => {
            const newMsgs = data.messages.filter((m: any) => !prev.find(existing => existing.id === m.id.toString()));
            if (newMsgs.length === 0) return prev;
            
            //  Sonic feedback alleen bij echt nieuwe berichten
            playClick('deep');
            
            return [...prev, ...newMsgs.map((m: any) => ({
              id: m.id.toString(),
              role: m.senderType === 'ai' ? 'assistant' : m.senderType,
              content: m.message,
              timestamp: m.createdAt
            }))];
          });
        }
      } catch (e) {
        console.error("SSE Parse Error:", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };

    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [isOpen, conversationId, playClick, messages]); //  Added messages to dependency array to fix linter warning, but logic inside uses functional update to avoid loops

  useEffect(() => {
    if (!isInitialLoading && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hallo!  Ik ben Voicy, je AI-assistent. Hoe kan ik je vandaag helpen?',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages.length, isInitialLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isOpen]); //  Added .length to prevent unnecessary scrolls, but keep it reactive to new messages

  useEffect(() => {
    //  AUTO-SHOW CHIPS (CHRIS-PROTOCOL: Proactieve interactie)
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowChips(true);
        // Verberg ze weer na 8 seconden als er geen interactie is
        if (chipsTimeoutRef.current) clearTimeout(chipsTimeoutRef.current);
        chipsTimeoutRef.current = setTimeout(() => {
          setShowChips(false);
        }, 8000);
      }, 2000);
      return () => {
        clearTimeout(timer);
        if (chipsTimeoutRef.current) clearTimeout(chipsTimeoutRef.current);
      };
    } else {
      setShowChips(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isHoveringVoicy && !isOpen) {
      setShowChips(true);
    }
  }, [isHoveringVoicy, isOpen]);

  const toggleChat = () => {
    playClick(isOpen ? 'light' : 'deep');
    setIsOpen(!isOpen);
  };

  const handleSend = async (e?: React.FormEvent, overrideValue?: string) => {
    e?.preventDefault();
    const messageToSend = overrideValue || inputValue;
    if (!messageToSend.trim()) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    playClick('light');

    //  CORE MESSAGE HANDLER
    // Slaat berichten direct op in Supabase en triggeert AI-logica
    const aiResponse = {
      id: `temp-ai-${Date.now()}`,
      role: 'assistant',
      content: '', // Wordt hieronder gevuld
      timestamp: new Date().toISOString(),
      actions: [],
      media: [],
      isDbError: false
    };

    try {
      //  Check for active Cody Preview Logic
      const previewLogic = typeof window !== 'undefined' ? sessionStorage.getItem('cody_preview_logic') : null;

      //  CHRIS-PROTOCOL: Timeout na 30 seconden om "vastlopen" te voorkomen (Gemini kan traag zijn)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(" Voicy: Chat request timed out after 30s");
        controller.abort();
      }, 30000);

      console.log("[Voicy] Sending message to API...", { message: userMessage.content });
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          action: 'send',
          message: userMessage.content,
          language: language,
          mode: chatMode,
          previewLogic: previewLogic, //  Stuur preview code mee naar de API
          context: {
            journey: isAcademyJourney ? 'academy' : isStudioJourney ? 'studio' : 'agency',
            briefing: state.briefing,
            isAuthenticated,
            user: user?.email,
            customer360: customer360
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
      const data = await response.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem('voicy_conversation_id', data.conversationId.toString());
      }
      
      aiResponse.content = data.content || data.message || "Ik ben even de verbinding kwijt, maar ik ben er nog!";
      aiResponse.actions = data.actions || [];
      aiResponse.media = data.media || [];
      aiResponse.isDbError = !!data._db_error;

      //  VOICEGLOT: Ensure AI content is translated if needed
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
    } catch (error: any) {
      console.error("Chat API error:", error);
      
      //  CHRIS-PROTOCOL: Extract details if available
      let errorMessage = "Oeps, er ging iets mis bij het verwerken van je bericht. Probeer het later nog eens!";
      
      if (error.name === 'AbortError') {
        errorMessage = "Voicy doet er iets langer over dan normaal. Ik probeer het nog eens, of stuur ons een mailtje!";
      } else if (error.message?.includes('Network response was not ok') || error.message?.includes('Server error')) {
        errorMessage = "Ik heb even moeite om verbinding te maken met het brein. Probeer je het nog een keer?";
      }

      const errorResponse = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
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

  //  Smart Chips logic
  const getSmartChips = () => {
    if (isAdmin) {
      return []; //  ADMIN MANDATE: Geen zwevende chips voor admin (staan al in CMD+K)
    }

    const chips = [];
    
    //  Context-based chips (Journey Aware)
    if (isAgencyJourney) {
      if (state.selectedActor) {
        chips.push({ label: `Prijs voor ${state.selectedActor.first_name}`, action: "calculate_price", icon: Info });
        chips.push({ label: "Direct Boeken", action: "check", icon: Check });
      } else {
        chips.push({ label: "Stemmen Zoeken", action: "browse_voices", icon: Search });
      }

      if (state.vat_number) {
        chips.push({ label: "Check BTW Status", action: "check_vat", icon: Shield });
      }

      chips.push({ label: "Tarieven", action: "ask_pricing", icon: ShoppingCart });
    }

    if (isStudioJourney) {
      chips.push({ label: "Workshop Data", action: "ask_workshop_dates", icon: Calendar });
      chips.push({ label: "Locatie & Studio", action: "ask_location", icon: MapPin });
      chips.push({ label: "Aan de slag", action: "ask_enrollment", icon: Zap });
    }

    if (isAcademyJourney) {
      chips.push({ label: "Cursus Aanbod", action: "browse_courses", icon: Info });
      chips.push({ label: "Gratis Proefles", action: "start_free_lesson", icon: PlayCircle });
      chips.push({ label: "Hoe werkt de Academy?", action: "ask_how_it_works", icon: HelpCircle });
    }

    chips.push({ label: "Hoe werkt het?", action: "ask_how_it_works", icon: HelpCircle });

    return chips.filter(chip => !clickedChips.includes(chip.label));
  };

  return (
    <ContainerInstrument 
      className="fixed bottom-8 right-8 z-[100] touch-manipulation"
      onMouseEnter={() => setIsHoveringVoicy(true)}
      onMouseLeave={() => setIsHoveringVoicy(false)}
    >
      {/* Smart Chips (Floating above toggle) */}
      {!isOpen && showChips && (
        <ContainerInstrument className="absolute bottom-20 right-0 flex flex-col items-end gap-2 pointer-events-none">
          <AnimatePresence>
            {getSmartChips().map((chip, i) => (
              <motion.button
                key={`${chip.label}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setClickedChips(prev => [...prev, chip.label]);
                  setIsOpen(true);
                  if (chip.action === 'toggle_edit_mode') toggleEditMode();
                  else handleSend(undefined, chip.label);
                }}
                className="pointer-events-auto bg-white/95 backdrop-blur-md border border-black/5 px-4 py-2 rounded-full shadow-aura flex items-center gap-2 group hover:bg-primary hover:text-white transition-all"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {(() => {
                    const Icon = (chip as any).icon;
                    if (!Icon) return null;
                    return <Icon strokeWidth={1.5} size={18} className="text-primary group-hover:text-white transition-colors" />;
                  })()}
                </div>
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
        className={`w-16 h-16 rounded-full shadow-aura flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group relative touch-manipulation ${
          isOpen ? 'bg-va-black text-white rotate-90' : 'bg-primary text-white'
        }`}
      >
        {isOpen ? <X strokeWidth={1.5} size={28} /> : (
          <MessageCircle strokeWidth={1.5} size={32} className="relative z-10" />
        )}
        {!isOpen && (
          <ContainerInstrument plain className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
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
        <ContainerInstrument plain className="p-6 bg-va-black text-white flex justify-between items-center relative overflow-hidden">
          <ContainerInstrument plain className="relative z-10">
            <HeadingInstrument level={3} className="text-lg font-light tracking-tighter"><VoiceglotText  translationKey="chat.title" defaultText="Voicy" /></HeadingInstrument>
            <ContainerInstrument plain className="flex items-center gap-2">
              <TextInstrument as="span" className="w-1.5 h-1.2 rounded-full bg-green-500 animate-pulse font-light" />
              <TextInstrument as="span" className="text-[15px] font-light tracking-widest opacity-60"><VoiceglotText  translationKey="chat.status.online" defaultText="Online & Klaar" /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument plain className="flex items-center gap-2 relative z-10">
            <ButtonInstrument 
              onClick={() => setIsFullMode(!isFullMode)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              {isFullMode ? <ChevronRight strokeWidth={1.5} size={18} className="rotate-180 opacity-40" /> : <Info strokeWidth={1.5} size={18} className="opacity-40" />}
            </ButtonInstrument>
          </ContainerInstrument>

          <ContainerInstrument plain className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
        </ContainerInstrument>

        {/* Tabs */}
        <ContainerInstrument plain className="flex border-b border-black/5 p-2 gap-1 bg-va-off-white/30">
          {[
            { id: 'chat', icon: MessageCircle, label: 'Chat', translationKey: 'chat.tabs.chat' },
            { id: 'mail', icon: Mail, label: 'Mail', translationKey: 'chat.tabs.mail' },
            { id: 'phone', icon: Phone, label: 'Bel', translationKey: 'chat.tabs.phone' },
            { id: 'faq', icon: HelpCircle, label: 'FAQ', translationKey: 'chat.tabs.faq' },
            ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Admin', translationKey: 'chat.tabs.admin' }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <ButtonInstrument
                key={tab.id}
                onClick={() => {
                  playClick('light');
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                  activeTab === tab.id ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-va-black/30 hover:bg-black/5'
                }`}
              >
                <Icon size={14} strokeWidth={1.5} className={activeTab === tab.id ? 'text-primary' : 'text-va-black/20'} />
                <TextInstrument as="span" className="text-[15px] font-light tracking-widest"><VoiceglotText  translationKey={tab.translationKey} defaultText={tab.label} /></TextInstrument>
              </ButtonInstrument>
            );
          })}
        </ContainerInstrument>

        {/* Mode Selector (Ask vs Agent) */}
        {activeTab === 'chat' && (
          <ContainerInstrument plain className="px-6 py-3 bg-va-off-white/50 border-b border-black/5 flex justify-center">
            <ContainerInstrument plain className="flex bg-white p-1 rounded-full border border-black/5 shadow-sm">
              <ButtonInstrument 
                onClick={() => { setChatMode('ask'); playClick('light'); }}
                className={`px-6 py-1.5 rounded-full text-[15px] font-light tracking-widest transition-all ${chatMode === 'ask' ? 'bg-va-black text-white shadow-md' : 'text-va-black/30 hover:text-va-black'}`}
              >
                <VoiceglotText  translationKey="chat.mode.ask" defaultText="Ask" />
              </ButtonInstrument>
              <ButtonInstrument 
                onClick={() => { setChatMode('agent'); playClick('pro'); }}
                className={`px-6 py-1.5 rounded-full text-[15px] font-light tracking-widest transition-all flex items-center gap-2 ${chatMode === 'agent' ? 'bg-primary text-white shadow-md' : 'text-va-black/30 hover:text-va-black'}`}
              >
                {chatMode === 'agent' && <Zap size={10} className="brightness-0 invert animate-pulse" />}
                <VoiceglotText  translationKey="chat.mode.agent" defaultText="Agent" />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        )}

        {/* Content Area */}
        <ContainerInstrument plain className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'chat' && (
            <ContainerInstrument plain className={`flex-1 overflow-hidden relative flex ${isFullMode ? 'flex-row' : 'flex-col'}`}>
              <ContainerInstrument plain className="flex-1 flex flex-col overflow-hidden border-r border-black/5">
                <ContainerInstrument plain ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                  {isInitialLoading ? (
                    <ContainerInstrument plain className="h-full flex items-center justify-center">
                      <TextInstrument className="text-[13px] tracking-widest opacity-40 animate-pulse">GESCHIEDENIS LADEN...</TextInstrument>
                    </ContainerInstrument>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <ContainerInstrument
                          plain
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <ContainerInstrument plain className={`max-w-[85%] p-4 rounded-[20px] text-[15px] font-light leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                              : 'bg-va-off-white text-va-black rounded-tl-none'
                          }`}>
                            {msg.isDbError && (
                              <ContainerInstrument plain className="text-[15px] tracking-widest opacity-40 mb-1 flex items-center gap-1">
                                <Shield strokeWidth={1.5} size={10} /> Offline Mode
                              </ContainerInstrument>
                            )}
                            {msg.content.includes("Oeps, er ging iets mis") ? (
                              <ContainerInstrument plain className="space-y-4">
                                <ContainerInstrument plain className="flex items-center gap-3 text-red-500">
                                  <Info strokeWidth={1.5} size={18} className="text-primary" />
                                  <TextInstrument className="font-light">{msg.content}</TextInstrument>
                                </ContainerInstrument>
                                <ButtonInstrument 
                                  onClick={() => handleSend(undefined, messages[messages.length-2]?.content)}
                                  className="w-full py-2 bg-va-black/5 text-va-black rounded-xl text-[15px] font-light tracking-widest hover:bg-va-black/10 transition-all"
                                >
                                  <VoiceglotText translationKey="auto.voicychat.opnieuw_proberen" defaultText="OPNIEUW PROBEREN" />
                                </ButtonInstrument>
                              </ContainerInstrument>
                            ) : msg.content}
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
                                    if (action.action === 'browse_workshops') {
                                      window.location.href = '/studio';
                                      return;
                                    }
                                    if (action.action === 'book_session') {
                                      window.location.href = '/studio/book';
                                      return;
                                    }
                                    if (action.action === 'browse_courses') {
                                      window.location.href = '/academy';
                                      return;
                                    }
                                    if (action.action === 'start_free_lesson') {
                                      window.location.href = '/academy';
                                      return;
                                    }
                                    if (action.action === 'quote') {
                                      window.location.href = '/agency';
                                      return;
                                    }
                                    if (action.action === 'browse_voices') {
                                      window.location.href = '/artist';
                                      return;
                                    }

                                    //  Handle dynamic language-aware links
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
                                  <VoiceglotText  translationKey={`chat.action.${action.label.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')}`} defaultText={action.label} />
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

                      {/*  TYPING INDICATOR (CHRIS-PROTOCOL: 100ms Feedback) */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <ContainerInstrument plain className="bg-va-off-white text-va-black p-4 rounded-[20px] rounded-tl-none flex items-center gap-2">
                            <div className="flex gap-1">
                              <motion.span 
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                className="w-1.5 h-1.5 bg-primary rounded-full" 
                              />
                              <motion.span 
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                className="w-1.5 h-1.5 bg-primary rounded-full" 
                              />
                              <motion.span 
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                className="w-1.5 h-1.5 bg-primary rounded-full" 
                              />
                            </div>
                            <TextInstrument className="text-[13px] tracking-widest opacity-40 font-light">
                              <VoiceglotText translationKey="chat.status.typing" defaultText="VOICY DENKT NA..." />
                            </TextInstrument>
                          </ContainerInstrument>
                        </motion.div>
                      )}
                    </>
                  )}
                </ContainerInstrument>

                {/* Input Area */}
                <ContainerInstrument plain className="p-4 md:p-6 border-t border-black/5 bg-white">
                  <FormInstrument onSubmit={handleSend} className="relative">
                    <InputInstrument
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Typ je bericht..."
                      className="w-full bg-va-off-white border-none rounded-full py-3 md:py-4 pl-5 md:pl-6 pr-12 md:pr-14 text-[15px] font-light focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <ButtonInstrument
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-va-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                      <ChevronRight strokeWidth={1.5} size={18} className="text-white" />
                    </ButtonInstrument>
                  </FormInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              {isFullMode && (
                <ContainerInstrument plain className="w-96 bg-va-off-white p-8 overflow-y-auto custom-scrollbar space-y-8">
                  <ContainerInstrument plain>
                    <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-va-black/30 mb-6"><VoiceglotText  translationKey="auto.voicychat.project_details.ba5160" defaultText="Project Details" /></HeadingInstrument>
                    <ContainerInstrument plain className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
                      <ContainerInstrument plain className="flex justify-between items-center">
                        <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText  translationKey="common.type" defaultText="Type" /></TextInstrument>
                        <TextInstrument className="text-[15px] font-light ">{state.usage}</TextInstrument>
                      </ContainerInstrument>
                      <ContainerInstrument plain className="flex justify-between items-center">
                        <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText  translationKey="auto.voicychat.woorden.721081" defaultText="Woorden" /></TextInstrument>
                        <TextInstrument className="text-[15px] font-light">{state.briefing.split(/\s+/).filter(Boolean).length}</TextInstrument>
                      </ContainerInstrument>
                      <ContainerInstrument plain className="pt-4 border-t border-black/5 flex justify-between items-center">
                        <TextInstrument className="text-[15px] font-light tracking-widest text-primary"><VoiceglotText  translationKey="auto.voicychat.totaal.e28895" defaultText="Totaal" /></TextInstrument>
                        <TextInstrument className="text-lg font-light text-primary"> {state.pricing.total.toFixed(2)}</TextInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  {state.selectedActor && (
                    <ContainerInstrument plain>
                      <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-va-black/30 mb-6"><VoiceglotText  translationKey="auto.voicychat.geselecteerde_stem.4b43a4" defaultText="Geselecteerde Stem" /></HeadingInstrument>
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
                      Direct afrekenen <ChevronRight strokeWidth={1.5} size={14} />
                    </ButtonInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          )}

          {activeTab === 'mail' && (
            <ContainerInstrument plain className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
              <AnimatePresence  mode="wait">
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
                      <VoiceglotText  translationKey="chat.mail.sent.title" defaultText="Bericht verzonden!" />
                    </HeadingInstrument>
                    <TextInstrument className="text-[15px] text-va-black/40 font-light">
                      <VoiceglotText  translationKey="chat.mail.sent.text" defaultText="Bedankt! We hebben je bericht ontvangen en reageren zo snel mogelijk." />
                    </TextInstrument>
                    <ButtonInstrument 
                      onClick={() => setMailSent(false)}
                      className="va-btn-pro px-8 py-3 text-[15px]"
                    >
                      <VoiceglotText  translationKey="chat.mail.sent.cta" defaultText="Nog een bericht sturen" />
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
                        <VoiceglotText  translationKey="chat.mail.title" defaultText="Stuur ons een bericht" />
                      </HeadingInstrument>
                      <TextInstrument className="text-[15px] text-va-black/40 font-light">
                        <VoiceglotText  translationKey="chat.mail.subtitle" defaultText="We reageren meestal binnen het uur." />
                      </TextInstrument>
                    </ContainerInstrument>

                    <FormInstrument onSubmit={handleMailSubmit} className="space-y-4">
                      <ContainerInstrument plain className="space-y-1">
                        <LabelInstrument><VoiceglotText  translationKey="chat.mail.label.email" defaultText="Jouw E-mail" /></LabelInstrument>
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
                        <LabelInstrument><VoiceglotText  translationKey="chat.mail.label.message" defaultText="Jouw Bericht" /></LabelInstrument>
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
                        {isSendingMail ? <VoiceglotText  translationKey="chat.mail.sending" defaultText="Verzenden..." /> : <VoiceglotText  translationKey="chat.mail.submit" defaultText="Bericht Versturen" />}
                        {!isSendingMail && <Send strokeWidth={1.5} size={14} />}
                      </ButtonInstrument>
                    </FormInstrument>

              <ContainerInstrument plain className="pt-4 border-t border-black/5 text-center">
                <TextInstrument className="text-[15px] font-light text-va-black/20 tracking-widest">
                  <VoiceglotText  translationKey="chat.mail.direct" defaultText="Direct contact?" />
                  <ButtonInstrument as="a" href="mailto:johfrah@voices.be" className="text-primary hover:underline ml-2">
                    <VoiceglotText  translationKey="auto.voicychat.johfrah_voices_be.1bbc86" defaultText="johfrah@voices.be" />
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
                  <VoiceglotText  translationKey="chat.phone.title" defaultText="Bel de studio" />
                </HeadingInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light">
                  <VoiceglotText  translationKey="chat.phone.subtitle" defaultText="Direct contact met onze regisseurs." />
                </TextInstrument>
              </ContainerInstrument>
              <ButtonInstrument as="a" href="tel:+3227931991" className="va-btn-pro w-full">+32 (0)2 793 19 91</ButtonInstrument>
            </ContainerInstrument>
          )}

          {activeTab === 'faq' && (
            <ContainerInstrument plain className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              <HeadingInstrument level={4} className="text-[15px] font-medium tracking-widest text-va-black/30 mb-4"><VoiceglotText  translationKey="chat.faq.title" defaultText="Veelgestelde vragen" /></HeadingInstrument>
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
                    <TextInstrument as="span"><VoiceglotText  translationKey={faq.key} defaultText={faq.q} /></TextInstrument>
                    <Send strokeWidth={1.5} size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  </ButtonInstrument>
              ))}
            </ContainerInstrument>
          )}

          {activeTab === 'admin' && isAdmin && (
            <ContainerInstrument plain className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <HeadingInstrument level={4} className="text-[15px] font-medium tracking-widest text-va-black/30 mb-4"><VoiceglotText  translationKey="chat.admin.title" defaultText="Admin Control Panel" /></HeadingInstrument>
              
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
                      <Zap strokeWidth={1.5} size={20} className={isEditMode ? 'text-white' : 'text-primary'} />
                    </ContainerInstrument>
                    <ContainerInstrument plain className="text-left">
                      <TextInstrument className="text-[15px] font-light tracking-tight"><VoiceglotText  translationKey="admin.edit_mode.title" defaultText="Edit Mode" /></TextInstrument>
                      <TextInstrument className={`text-[15px] font-light opacity-60 ${isEditMode ? 'text-white' : 'text-va-black'}`}>
                        {isEditMode ? <VoiceglotText  translationKey="common.enabled" defaultText="Ingeschakeld" /> : <VoiceglotText  translationKey="common.disabled" defaultText="Uitgeschakeld" />}
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
                      <LayoutDashboard strokeWidth={1.5} size={16} className="text-primary/40" />
                    </ContainerInstrument>
                    <TextInstrument className="text-[15px] font-light tracking-widest block"><VoiceglotText  translationKey="nav.dashboard" defaultText="Dashboard" /></TextInstrument>
                  </ButtonInstrument>
                  <ButtonInstrument
                    as="a"
                    href="/admin/mailbox"
                    className="p-4 rounded-2xl bg-va-off-white hover:bg-black/5 transition-all text-left space-y-1"
                  >
                    <ContainerInstrument plain className="w-4 h-4 mb-1">
                      <Mail strokeWidth={1.5} size={16} className="text-primary/40" />
                    </ContainerInstrument>
                    <TextInstrument className="text-[15px] font-light tracking-widest block"><VoiceglotText  translationKey="nav.mailbox" defaultText="Mailbox" /></TextInstrument>
                  </ButtonInstrument>
                </ContainerInstrument>

                {customer360 && (
                  <ContainerInstrument plain className="p-4 bg-va-black text-white rounded-[24px] space-y-3">
                    <HeadingInstrument level={5} className="text-[15px] font-light tracking-widest opacity-40"><VoiceglotText  translationKey="account.dna.title" defaultText="Klant DNA" /></HeadingInstrument>
                    <ContainerInstrument plain className="flex items-center gap-3">
                      <ContainerInstrument plain className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-light">{customer360.firstName?.[0]}</ContainerInstrument>
                      <ContainerInstrument plain>
                        <TextInstrument className="text-[15px] font-light"><VoiceglotText  translationKey={`user.${customer360.id}.name`} defaultText={`${customer360.firstName} ${customer360.lastName}`} noTranslate={true} /></TextInstrument>
                        <TextInstrument className="text-[15px] font-light opacity-40">
                          {customer360.intelligence?.leadVibe} <VoiceglotText  translationKey="common.vibe" defaultText="Vibe" />
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
