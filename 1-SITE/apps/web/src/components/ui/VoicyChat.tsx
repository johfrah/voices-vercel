"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Calendar,
    Check,
    ChevronRight,
    HelpCircle,
    Info,
    LayoutDashboard,
    Loader2,
    Maximize,
    Minimize2,
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
import { isOfficeOpen, getNextOpeningTime } from '@/lib/utils/delivery-logic';
import { ButtonInstrument, ContainerInstrument, FormInstrument, HeadingInstrument, InputInstrument, LabelInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

export const VoicyChatV2: React.FC = () => {
  const { 
    state, 
    updateBriefing, 
    updateUsage, 
    updateMedia, 
    updateCountry, 
    updateCustomer, 
    setStep, 
    selectActor, 
    addItem, 
    resetSelection,
    updateMusic
  } = useCheckout();
  const { playClick: playSonicClick } = useSonicDNA();
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { isEditMode, toggleEditMode } = useEditMode();
  const pathname = usePathname();

  const market = MarketManager.getCurrentMarket();
  const isPortfolioJourney = market.market_code === 'PORTFOLIO';
  const isArtistPage = market.market_code === 'ARTIST' || pathname?.startsWith('/voice/');
  
  // Determine Journey
  const isAcademyJourney = pathname?.includes('/academy');
  const isStudioJourney = pathname?.includes('/studio') && !isAcademyJourney;
  const isAgencyJourney = !isStudioJourney && !isAcademyJourney && !isPortfolioJourney && !isArtistPage;

  const activeEmail = market.email;
  const activePhone = market.phone;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mailForm, setMailForm] = useState({ email: '', message: '' });
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [isFullMode, setIsFullMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'mail' | 'phone' | 'faq' | 'admin' | 'orders'>('chat');
  const [telephonyConfig, setTelephonyConfig] = useState<{ isLive: boolean; whisperMode: string }>({ isLive: true, whisperMode: 'robot' });

  //  CHRIS-PROTOCOL: Sync telephony config from DB
  useEffect(() => {
    fetch('/api/admin/config?type=telephony')
      .then(res => res.json())
      .then(data => {
        if (data.telephony_config) {
          setTelephonyConfig(data.telephony_config);
        }
      })
      .catch(err => console.error('Failed to fetch telephony config', err));
  }, [isOpen]); // Re-check when chat opens
  const [chatMode, setChatMode] = useState<'ask' | 'agent'>('ask');
  const [isCalling, setIsCalling] = useState(false);
  const [callRequested, setCallRequested] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [persona, setPersona] = useState<'voicy' | 'johfrah'>('voicy');
  const [customer360, setCustomer360] = useState<any>(null);
  const [sensorData, setSensorData] = useState<any>({
    currentPage: typeof window !== 'undefined' ? window.location.pathname : '',
    scrollDepth: 0,
    lastInteraction: new Date().toISOString()
  });

  //  SENSOR MODE: Track visitor behavior and sync to DB
  useEffect(() => {
    if (!conversationId || isAdmin) return;

    const trackSensor = async () => {
      const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      
      try {
        await fetch('/api/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sensor_update',
            conversationId,
            sensorData: {
              current_page: window.location.pathname,
              scroll_depth: scrollPercent,
              last_interaction: new Date().toISOString()
            }
          })
        });
      } catch (e) {
        console.warn("[Voicy Sensor] Failed to sync", e);
      }
    };

    const handleScroll = () => {
      // Throttle sensor updates
      if ((window as any)._sensorTimeout) return;
      (window as any)._sensorTimeout = setTimeout(() => {
        trackSensor();
        (window as any)._sensorTimeout = null;
      }, 5000);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial sync
    trackSensor();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [conversationId, isAdmin]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState({ name: '', email: '' });

  const isJohfrah = persona === 'johfrah';

  useEffect(() => {
    const handlePersonaChange = (e: any) => {
      setPersona(e.detail);
    };
    const handleOpenVoicy = (e: any) => {
      setIsOpen(true);
      if (e.detail?.persona) setPersona(e.detail.persona);
      if (e.detail?.tab) setActiveTab(e.detail.tab);
      playSonicClick('deep');
    };
    window.addEventListener('voices:persona_change', handlePersonaChange);
    window.addEventListener('voicy:open', handleOpenVoicy);
    
    // Initial sync from localStorage
    const savedPersona = localStorage.getItem('voices_persona_preference') as 'voicy' | 'johfrah';
    if (savedPersona) setPersona(savedPersona);

    return () => {
      window.removeEventListener('voices:persona_change', handlePersonaChange);
      window.removeEventListener('voicy:open', handleOpenVoicy);
    };
  }, [playSonicClick]);

  const [generalSettings, setGeneralSettings] = useState<any>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [clickedChips, setClickedChips] = useState<string[]>([]);
  const [isHoveringVoicy, setIsHoveringVoicy] = useState(false);
  const [showChips, setShowChips] = useState(false);
  const chipsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<number>(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  //  BUTLER BRIDGE: Execute suggested actions from Voicy
  useEffect(() => {
    const lastMessage = (messages || [])[(messages || []).length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.isButlerAction) {
      console.log(`[Voicy Butler] Executing action: ${lastMessage.action}`, lastMessage.params);
      
      const { action, params } = lastMessage;
      
      switch (action) {
        case 'SET_CONFIGURATOR':
          if (params.words !== undefined) {
            //  VAKMANSCHAP REGEL: Als woorden expliciet zijn, gebruik die. 
            // Anders, als woorden 0 zijn maar er is een script, gebruik dat.
            updateBriefing(" ".repeat(params.words)); 
          }
          if (params.usage) updateUsage(params.usage);
          if (params.media) updateMedia(params.media);
          
          //  MUZIEK RESTRICTIE: Alleen bij telefonie
          if (params.music !== undefined) {
            if (params.usage === 'telephony' || state.usage === 'telephony') {
              updateMusic({ asBackground: !!params.music });
              console.log("[Voicy Butler] Setting music:", params.music);
            } else {
              console.warn("[Voicy Butler] Music requested for non-telephony journey. Ignoring.");
            }
          }
          
          if (params.plan) {
            // We hebben geen directe updatePlan in de context exposed via de bridge, 
            // maar we kunnen de configurator wel sturen.
          }
          playSonicClick('pro');
          break;
          
        case 'FILTER_VOICES':
          // Navigeer naar de stemmenpagina met filters als query params
          const query = new URLSearchParams();
          if (params.language) query.set('lang', params.language);
          if (params.vibe) query.set('vibe', params.vibe);
          if (params.gender) query.set('gender', params.gender);
          window.location.href = `/artist?${query.toString()}`;
          break;
          
        case 'PREFILL_CHECKOUT':
          if (params.email || params.vat_number) {
            updateCustomer({ 
              email: params.email || state.customer.email, 
              vat_number: params.vat_number || state.customer.vat_number 
            });
          }
          if (params.briefing) updateBriefing(params.briefing);
          setStep('details');
          window.location.href = '/checkout';
          break;
          
        case 'NAVIGATE_JOURNEY':
          if (params.url) window.location.href = params.url;
          break;
          
        case 'PLAY_DEMO':
          if (params.demoUrl) {
            // Voeg een tijdelijk audio-bericht toe aan de chat
            setMessages(prev => {
              // Check of dit bericht al bestaat om loops te voorkomen
              if (prev.some(m => m.id === `demo-${params.actorId}`)) return prev;
              return [...prev, {
                id: `demo-${params.actorId}`,
                role: 'assistant',
                content: t('chat.demo.listen', `Luister hier naar de demo:`),
                media: [{ title: t('chat.demo.title', 'Stem Demo'), type: 'audio', url: params.demoUrl }],
                timestamp: new Date().toISOString()
              }];
            });
            playSonicClick('deep');
          }
          break;
          
        case 'VALIDATE_VAT':
          if (params.vatNumber) {
            // Trigger de bestaande BTW-check logica van Kelly
            fetch(`/api/checkout/vat?number=${params.vatNumber}`)
              .then(res => res.json())
              .then(data => {
                if (data.valid) {
                  updateCustomer({ vat_number: params.vatNumber, company: data.companyName, vat_verified: true });
                  setMessages(prev => [...prev, {
                    id: `vat-success-${Date.now()}`,
                    role: 'assistant',
                    content: t('chat.vat.success', `Ik heb het BTW-nummer voor ${data.companyName} geverifieerd en je gegevens klaargezet.`),
                    timestamp: new Date().toISOString()
                  }]);
                } else {
                  setMessages(prev => [...prev, {
                    id: `vat-fail-${Date.now()}`,
                    role: 'assistant',
                    content: t('chat.vat.fail', `Ik kon het BTW-nummer ${params.vatNumber} helaas niet valideren. Kun je het nog eens controleren?`),
                    timestamp: new Date().toISOString()
                  }]);
                }
              });
          }
          break;
          
        case 'ANALYZE_SCRIPT':
          if (params.text) {
            const words = params.text.trim().split(/\s+/).length;
            const wordsPerMinute = state.pricingConfig?.wordsPerMinute || SlimmeKassa.getDefaultConfig().wordsPerMinute || 155;
            const estSeconds = Math.round((words / wordsPerMinute) * 60);
            const target = params.targetDuration || 30;
            const diff = estSeconds - target;
            
            let advice = t('chat.script.analysis', `Je script heeft ${words} woorden. Dat is ongeveer ${estSeconds} seconden aan audio. `, { words, seconds: estSeconds });
            if (Math.abs(diff) <= 5) advice += t('chat.script.perfect', "Dit past perfect!");
            else if (diff > 0) advice += t('chat.script.too_long', `Dat is ${diff} seconden te lang voor je doel van ${target}s. Zal ik helpen het script in te korten?`, { seconds: diff, target });
            else advice += t('chat.script.too_short', `Dat is ${Math.abs(diff)} seconden te kort. Je kunt nog wat extra informatie toevoegen.`, { seconds: Math.abs(diff) });
            
            setMessages(prev => [...prev, {
              id: `script-analysis-${Date.now()}`,
              role: 'assistant',
              content: advice,
              timestamp: new Date().toISOString()
            }]);
            playSonicClick('pro');
          }
          break;
          
        case 'PLACE_ORDER':
          if (params.email) {
            updateCustomer({ email: params.email });
            if (params.briefing) updateBriefing(params.briefing);
            
            //  KELLY-MANDATE: Bereid de order voor via de Mollie API
            setIsTyping(true);
            fetch('/api/checkout/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: params.email,
                first_name: state.customer.first_name || 'Klant',
                last_name: state.customer.last_name || '(via Chat)',
                pricing: {
                  ...state.pricing,
                  total: state.pricing.total,
                },
                items: state.items.length > 0 ? state.items : [{
                  id: `voice-${state.selectedActor?.id || 'unknown'}-${Date.now()}`,
                  type: 'voice_over',
                  actor: state.selectedActor,
                  briefing: params.briefing || state.briefing,
                  pricing: state.pricing
                }],
                selectedActor: state.selectedActor,
                briefing: params.briefing || state.briefing,
                usage: state.usage,
                payment_method: 'bancontact',
                metadata: {
                  words: (params.briefing || state.briefing || '').trim().split(/\s+/).filter(Boolean).length,
                  prompts: state.prompts
                }
              })
            })
            .then(res => res.json())
            .then(data => {
              setIsTyping(false);
              if (data.checkoutUrl) {
                setMessages(prev => [...prev, {
                  id: `order-ready-${Date.now()}`,
                  role: 'assistant',
                  content: t('chat.checkout.ready', `Alles staat klaar voor je bestelling! Klik op de knop hieronder om veilig af te rekenen.`),
                  actions: [{ label: t('chat.checkout.pay_now', "Nu Veilig Betalen"), action: data.checkoutUrl }],
                  timestamp: new Date().toISOString()
                }]);
                playSonicClick('success');
              } else {
                throw new Error(t('chat.error.no_checkout_url', "Geen checkout URL ontvangen"));
              }
            })
            .catch(err => {
              setIsTyping(false);
              console.error("Butler Order Error:", err);
              setMessages(prev => [...prev, {
                id: `order-fail-${Date.now()}`,
                role: 'assistant',
                content: t('chat.error.order_failed', `Er ging iets mis bij het voorbereiden van je bestelling. Zal ik je doorverbinden met een medewerker?`),
                timestamp: new Date().toISOString()
              }]);
            });
          }
          break;
          
        case 'ADD_TO_CART':
          if (state.selectedActor && state.pricing.total > 0) {
            //  KELLY-MANDATE: Voeg het item toe aan het mandje via de CheckoutContext
            const itemId = `voice-${state.selectedActor.id}-${Date.now()}`;
            addItem({
              id: itemId,
              type: 'voice_over',
              actor: state.selectedActor,
              briefing: params.briefing || state.briefing,
              usage: params.usage || state.usage,
              media: state.media,
              pricing: { ...state.pricing }
            });
            
            setMessages(prev => [...prev, {
              id: `cart-add-${Date.now()}`,
              role: 'assistant',
              content: t('chat.cart.added', `Ik heb ${state.selectedActor?.first_name} toegevoegd aan je mandje. Wil je nog een stem zoeken of zal ik de checkout voorbereiden?`, { name: state.selectedActor?.first_name }),
              timestamp: new Date().toISOString()
            }]);
            
            // Reset de calculator voor de volgende selectie
            resetSelection();
            playSonicClick('success');
          } else {
            setMessages(prev => [...prev, {
              id: `cart-fail-${Date.now()}`,
              role: 'assistant',
              content: t('chat.cart.fail', `Ik kon de stem niet toevoegen. Zorg dat je een stem hebt geselecteerd en de prijs is berekend.`),
              timestamp: new Date().toISOString()
            }]);
          }
          break;

        case 'SHOW_LEAD_FORM':
          // 🛡️ CHRIS-PROTOCOL: Inline Lead Identification (v2.15.036)
          if (!isAuthenticated && !conversationId?.toString().includes('guest')) {
            setShowLeadForm(true);
            playSonicClick('pro');
          }
          break;
      }
    }
  }, [
    messages, 
    updateBriefing, 
    updateUsage, 
    updateMedia, 
    updateCustomer, 
    setStep, 
    state.customer.email, 
    state.customer.vat_number, 
    state.briefing,
    state.customer,
    state.media,
    state.usage,
    playSonicClick, 
    state.selectedActor, 
    state.pricing, 
    state.items, 
    addItem, 
    resetSelection,
    updateMusic,
    t
  ]);

  //  CHRIS-PROTOCOL: Escape key support for closing the chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        playSonicClick('light');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, playSonicClick]);

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

    // Fetch system config for opening hours
    fetch('/api/admin/config?type=general')
      .then(res => res.json())
      .then(data => {
        if (data.general_settings) {
          setGeneralSettings(data.general_settings);
        }
      })
      .catch(err => console.error('Failed to fetch system config', err));
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

  //  Get current language
  const language = typeof window !== 'undefined' ? (document.cookie.split('; ').find(row => row.startsWith('voices_lang='))?.split('=')[1] || 'nl') : 'nl';

  //  Listen for Voicy Suggestions from other components
  useEffect(() => {
    const handleSuggestion = (e: any) => {
      const { title, content, type, actions, tab } = e.detail || {};
      
      //  CHRIS-PROTOCOL: Geen Voicy op Artist pagina's
      if (market.market_code === 'ARTIST' || pathname?.startsWith('/voice/')) return;

      setIsOpen(true);
      if (tab) setActiveTab(tab);
      else setActiveTab('chat');
      
      playSonicClick('deep');
      
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
  }, [playSonicClick, market.market_code, pathname]);

  //  UCI Integration: Fetch Customer 360 data when authenticated
  useEffect(() => {
    const fetchUCI = async () => {
      if ((isAuthenticated || isAdmin) && (user?.email || isAdmin)) {
        try {
          const emailParam = user?.email ? `?email=${user.email}` : '';
          const res = await fetch(`/api/intelligence/customer-360${emailParam}`);
          if (res.ok) {
            const data = await res.json();
            setCustomer360(data);
            
            // Proactive Welcome based on Vibe
            const currentVibe = data.intelligence?.leadVibe || 'cold';
            if (currentVibe === 'burning' && !isAdmin) {
              setMessages(prev => [...prev, {
                id: 'proactive-burning',
                role: 'assistant',
                content: isPortfolioJourney 
                  ? `Welkom terug, ${data.first_name}! Kan ik je helpen met een nieuwe boeking of heb je een vraag over mijn tarieven?`
                  : `Welkom terug, ${data.first_name}! Ik zie dat je een trouwe klant bent. Kan ik je helpen met een nieuwe boeking voor ${data.dna.topJourneys[0] || 'je project'}?`,
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
  }, [isAuthenticated, isAdmin, user, isPortfolioJourney]);

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
            const newMsgs = data.messages.filter((m: any) => {
              // Check of het bericht al bestaat op basis van ID
              const existsById = prev.find(existing => existing.id === m.id.toString());
              if (existsById) return false;

              // Check of het een dubbelganger is van een 'temp' bericht (inhoud + rol match)
              const isDuplicateOfTemp = prev.find(existing => 
                existing.id.toString().startsWith('temp-') && 
                existing.content === m.message &&
                existing.role === (m.senderType === 'ai' ? 'assistant' : m.senderType)
              );
              
              return !isDuplicateOfTemp;
            });

            if (newMsgs.length === 0) return prev;
            
            //  Sonic feedback alleen bij echt nieuwe berichten
            playSonicClick('deep');
            
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
  }, [isOpen, conversationId, playSonicClick]); //  Removed messages from dependency array to prevent constant reconnects, logic uses functional updates

  useEffect(() => {
    if (!isInitialLoading && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: isPortfolioJourney 
            ? t('chat.welcome.portfolio', 'Hallo! Ik ben de assistent van deze stemacteur. Hoe kan ik je helpen met je project of een prijsberekening?')
            : t('chat.welcome.general', 'Hallo! Ik ben Voicy, je AI-assistent. Hoe kan ik je vandaag helpen?'),
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages.length, isInitialLoading, isPortfolioJourney, t]);

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
    playSonicClick(isOpen ? 'light' : 'deep');
    setIsOpen(!isOpen);
  };

  const handleSend = async (e?: React.FormEvent, overrideValue?: string, interactionType: 'text' | 'chip' | 'tool' = 'text') => {
    e?.preventDefault();
    const messageToSend = overrideValue || inputValue;
    if (!messageToSend.trim()) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
      metadata: { interaction_type: interactionType }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    playSonicClick('light');

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
      
      //  MAT-MANDATE: Haal intentie op van de Bridge voor context-bewuste AI
      const bridgeIntent = (window as any).Voicy?.getIntent()?.intent || null;

      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          action: 'send',
          message: userMessage.content,
          language: language,
          mode: chatMode,
          persona: persona,
          previewLogic: previewLogic, //  Stuur preview code mee naar de API
          intent: bridgeIntent, //  MAT-MANDATE: Intentie doorgeven
          context: {
            journey: isAcademyJourney ? 'academy' : isStudioJourney ? 'studio' : isPortfolioJourney ? 'portfolio' : 'agency',
            briefing: state.briefing,
            isAuthenticated,
            user: user?.email,
            customer360: customer360,
            generalSettings: generalSettings,
            visitorHash: typeof window !== 'undefined' ? localStorage.getItem('voices_visitor_hash') : null,
            interaction_type: interactionType,
            currentPage: window.location.pathname
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
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
      playSonicClick('deep');
    } catch (error: any) {
      console.error("Chat API error:", error);
      
      //  CHRIS-PROTOCOL: Extract details if available
      let errorMessage = t('chat.error.default', "Oeps, er ging iets mis bij het verwerken van je bericht. Probeer het later nog eens!");
      
      if (error.name === 'AbortError') {
        errorMessage = t('chat.error.slow_response', "Voicy doet er iets langer over dan normaal. Ik probeer het nog eens, of stuur ons een mailtje!");
      } else if (error.message?.includes('Network response was not ok') || error.message?.includes('Server error')) {
        errorMessage = t('chat.error.connection', "Ik ben even de verbinding kwijt. Probeer je het nog een keer?");
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

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormData.email || !leadFormData.name) return;

    setIsTyping(true);
    playSonicClick('success');

    try {
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          message: `Mijn naam is ${leadFormData.name} en mijn email is ${leadFormData.email}`,
          conversationId: conversationId,
          language: language,
          mode: 'agent',
          persona: persona,
          context: {
            journey: isAcademyJourney ? 'academy' : isStudioJourney ? 'studio' : isPortfolioJourney ? 'portfolio' : 'agency',
            briefing: state.briefing,
            isAuthenticated,
            user: user?.email,
            customer360: customer360
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowLeadForm(false);
        setMessages(prev => [...prev, {
          id: `lead-success-${Date.now()}`,
          role: 'assistant',
          content: data.content || t('chat.lead.success', "Bedankt! Ik heb je gegevens genoteerd. Hoe kan ik je verder helpen?"),
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error("Lead submission error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailForm.email || !mailForm.message) return;

    setIsSendingMail(true);
    playSonicClick('light');

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
        playSonicClick('success');
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

  const handleCallbackRequest = async (phoneNumber: string) => {
    setIsCalling(true);
    setCallError(null);
    try {
      const response = await fetch('/api/telephony/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (data.success) {
        setCallRequested(true);
        playSonicClick('pro');
      } else {
        setCallError(data.message || 'Er ging iets mis.');
        playSonicClick('error');
      }
    } catch (err) {
      setCallError('Netwerkfout bij het opzetten van de verbinding.');
      playSonicClick('error');
    } finally {
      setIsCalling(false);
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
        chips.push({ label: t('chat.chip.price_for', `Prijs voor ${state.selectedActor.first_name}`, { name: state.selectedActor.first_name }), action: "calculate_price", icon: Info });
        chips.push({ label: t('chat.chip.book_direct', "Direct Boeken"), action: "check", icon: Check });
      } else {
        chips.push({ label: t('chat.chip.browse_voices', "Stemmen Zoeken"), action: "browse_voices", icon: Search });
      }

      if (state.customer.vat_number) {
        chips.push({ label: t('chat.chip.check_vat', "Check BTW Status"), action: "check_vat", icon: Shield });
      }

      chips.push({ label: t('chat.chip.rates', "Tarieven"), action: "ask_pricing", icon: ShoppingCart });
    }

    if (isStudioJourney) {
      chips.push({ label: t('chat.chip.workshop_dates', "Workshop Data"), action: "ask_workshop_dates", icon: Calendar });
      chips.push({ label: t('chat.chip.location_studio', "Locatie & Studio"), action: "ask_location", icon: MapPin });
      chips.push({ label: t('chat.chip.get_started', "Aan de slag"), action: "ask_enrollment", icon: Zap });
    }

    if (isAcademyJourney) {
      chips.push({ label: t('chat.chip.course_offering', "Cursus Aanbod"), action: "browse_courses", icon: Info });
      chips.push({ label: t('chat.chip.free_lesson', "Gratis Proefles"), action: "start_free_lesson", icon: PlayCircle });
      chips.push({ label: t('chat.chip.how_it_works_academy', "Hoe werkt de Academy?"), action: "ask_how_it_works", icon: HelpCircle });
    }

    chips.push({ label: t('chat.chip.how_it_works', "Hoe werkt het?"), action: "ask_how_it_works", icon: HelpCircle });

    return chips.filter(chip => !clickedChips.includes(chip.label));
  };

  if (isArtistPage) return null;

  return (
    <ContainerInstrument 
      className={cn(
        "fixed bottom-8 right-8 z-[150] touch-manipulation",
        isOpen && "z-[250]"
      )}
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
                  else handleSend(undefined, chip.label, 'chip');
                }}
                className="pointer-events-auto bg-white/95 backdrop-blur-md border border-black/5 px-4 py-2 rounded-full shadow-aura flex items-center gap-2 group hover:bg-va-black hover:text-white transition-all"
              >
                <ContainerInstrument plain className="w-5 h-5 flex items-center justify-center">
                  {(() => {
                    const Icon = (chip as any).icon;
                    if (!Icon) return null;
                    return <Icon strokeWidth={1.5} size={18} className="text-va-black group-hover:text-white transition-colors" />;
                  })()}
                </ContainerInstrument>
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
          isOpen ? 'bg-va-black text-white rotate-90' : 'hred text-white'
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
      <ContainerInstrument plain className={cn(
        "absolute bottom-20 right-0 bg-white rounded-[32px] shadow-aura flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right",
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none',
        isFullMode 
          ? 'fixed inset-8 w-auto h-auto right-8 bottom-8 z-[101]' 
          : 'w-[400px] h-[600px]',
        isJohfrah && "border border-primary/20"
      )}>
        {/* Header */}
        <ContainerInstrument plain className={cn(
          "p-4 bg-va-black text-white flex justify-between items-center relative overflow-hidden",
          isJohfrah && "bg-gradient-to-r from-va-black to-primary/20"
        )}>
          <ContainerInstrument plain className="relative z-10">
            <HeadingInstrument level={3} className="text-base font-light tracking-tighter">
              {activeTab === 'chat' && (
                isJohfrah 
                  ? <VoiceglotText translationKey="chat.title.johfrah" defaultText="Johfrah Lefebvre" noTranslate={true} />
                  : <VoiceglotText translationKey="chat.title" defaultText="Voicy" />
              )}
              {activeTab === 'mail' && <VoiceglotText translationKey="chat.mail.title" defaultText="Mail ons" />}
              {activeTab === 'phone' && <VoiceglotText translationKey="chat.phone.title" defaultText="Bel ons" />}
              {activeTab === 'faq' && <VoiceglotText translationKey="chat.faq.title" defaultText="FAQ" />}
              {activeTab === 'admin' && <VoiceglotText translationKey="chat.admin.title" defaultText="Admin" />}
            </HeadingInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument plain className="flex items-center gap-1 relative z-10">
            <button 
              onClick={() => setIsFullMode(!isFullMode)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white bg-transparent outline-none border-none cursor-pointer"
              title={isFullMode ? t('common.minimize', "Verkleinen") : t('common.maximize', "Vergroten")}
            >
              {isFullMode ? <Minimize2 strokeWidth={1.5} size={16} className="opacity-40" /> : <Maximize strokeWidth={1.5} size={16} className="opacity-40" />}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white bg-transparent outline-none border-none cursor-pointer"
              title={t('common.close', "Sluiten")}
            >
              <X strokeWidth={1.5} size={16} className="opacity-40" />
            </button>
          </ContainerInstrument>

          <ContainerInstrument plain className="absolute top-0 right-0 w-24 h-24 bg-va-black/20 rounded-full blur-2xl -mr-12 -mt-12" />
        </ContainerInstrument>

        {/* Tabs - Always visible for visitors and Admin */}
        <ContainerInstrument plain className="flex border-b border-black/5 p-1.5 gap-1 bg-va-off-white/30">
          {[
            { id: 'chat', icon: MessageCircle, label: 'Chat', translationKey: 'chat.tabs.chat' },
            { id: 'mail', icon: Mail, label: 'Mail', translationKey: 'chat.tabs.mail' },
            { id: 'phone', icon: Phone, label: 'Bel', translationKey: 'chat.tabs.phone' },
            { id: 'faq', icon: HelpCircle, label: 'FAQ', translationKey: 'chat.tabs.faq' },
            ...(isAuthenticated && !isAdmin ? [{ id: 'orders', icon: ShoppingCart, label: 'Orders', translationKey: 'chat.tabs.orders' }] : []),
            ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Admin', translationKey: 'chat.tabs.admin' }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <ButtonInstrument
                key={tab.id}
                onClick={() => {
                  playSonicClick('light');
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                  activeTab === tab.id ? 'bg-va-black text-white shadow-sm ring-1 ring-black/5' : 'bg-va-off-white text-va-black/30 hover:bg-black/5'
                }`}
              >
                <Icon size={12} strokeWidth={1.5} className={activeTab === tab.id ? 'text-white' : 'text-va-black/20'} />
                <TextInstrument as="span" className="text-[13px] font-light tracking-widest"><VoiceglotText  translationKey={tab.translationKey} defaultText={tab.label} /></TextInstrument>
              </ButtonInstrument>
            );
          })}
        </ContainerInstrument>

        {/* Content Area */}
        <ContainerInstrument plain className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'chat' && (
            <ContainerInstrument plain className={`flex-1 overflow-hidden relative flex ${isFullMode ? 'flex-row' : 'flex-col'}`}>
              {/* 🛡️ CHRIS-PROTOCOL: Admin God View Sidebar (v2.16.028) */}
              {isAdmin && isFullMode && (
                <ContainerInstrument plain className="w-64 bg-va-black text-white p-6 border-r border-white/5 space-y-6 overflow-y-auto custom-scrollbar">
                  <HeadingInstrument level={4} className="text-[11px] font-black tracking-[0.2em] uppercase text-primary">System Intelligence</HeadingInstrument>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <TextInstrument className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-2">Live Sensor</TextInstrument>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px]">
                          <span className="opacity-40">Pagina:</span>
                          <span className="text-primary truncate max-w-[120px]">{customer360?.iap_context?.sensor?.current_page || 'Home'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="opacity-40">Scroll:</span>
                          <span>{customer360?.iap_context?.sensor?.scroll_depth || 0}%</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="opacity-40">Laatst:</span>
                          <span>{customer360?.iap_context?.sensor?.last_interaction ? new Date(customer360.iap_context.sensor.last_interaction).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <TextInstrument className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-2">Visitor Vibe</TextInstrument>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          customer360?.intelligence?.leadVibe === 'burning' ? "bg-orange-500" : "bg-blue-500"
                        )} />
                        <span className="text-[13px] font-medium capitalize">{customer360?.intelligence?.leadVibe || 'Neutral'}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <TextInstrument className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-2">Lifecycle Stage</TextInstrument>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                          !isAuthenticated ? "bg-blue-500/20 text-blue-400" : 
                          (customer360?.dna?.totalOrders > 0 ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400")
                        )}>
                          {!isAuthenticated ? 'Presales' : (customer360?.dna?.totalOrders > 0 ? 'Aftersales' : 'Sales')}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <TextInstrument className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-2">Detected Intent</TextInstrument>
                      <span className="text-[13px] font-medium">{customer360?.intelligence?.intent || 'Browsing'}</span>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <TextInstrument className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-2">Customer DNA</TextInstrument>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="opacity-40">Orders:</span>
                          <span>{customer360?.dna?.totalOrders || 0}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="opacity-40">Journey:</span>
                          <span className="text-primary">{customer360?.dna?.topJourneys?.[0] || 'New'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <TextInstrument className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-4">Admin Commands</TextInstrument>
                    <div className="grid grid-cols-1 gap-2">
                      {['/status', '/clear', '/edit'].map(cmd => (
                        <button 
                          key={cmd}
                          onClick={() => handleSend(undefined, cmd, 'tool')}
                          className="text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[12px] font-mono transition-all"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                  </div>
                </ContainerInstrument>
              )}

              <ContainerInstrument plain className="flex-1 flex flex-col overflow-hidden border-r border-black/5">
                <ContainerInstrument plain ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                  {isInitialLoading ? (
                    <ContainerInstrument plain className="h-full flex items-center justify-center">
                      <TextInstrument className="text-[13px] tracking-widest opacity-40 animate-pulse">
                        <VoiceglotText translationKey="chat.loading_history" defaultText="GESCHIEDENIS LADEN..." />
                      </TextInstrument>
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
                              ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' 
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
                                  className="w-full py-2 bg-va-black text-white rounded-xl text-[15px] font-light tracking-widest hover:opacity-80 transition-all"
                                >
                                  <VoiceglotText translationKey="chat.action.try_again" defaultText="OPNIEUW PROBEREN" />
                                </ButtonInstrument>
                              </ContainerInstrument>
                            ) : msg.content}
                            {msg.actions && msg.actions.length > 0 && (
                              <ContainerInstrument plain className="mt-4 flex flex-wrap gap-2">
                              {msg.actions.map((action: any, i: number) => (
                                <ButtonInstrument
                                  key={i}
                                  onClick={() => {
                                    if (action.action === 'johfrah_takeover') {
                                      setPersona('johfrah');
                                      playSonicClick('pro');
                                      localStorage.setItem('voices_persona_preference', 'johfrah');
                                      window.dispatchEvent(new CustomEvent('voices:persona_change', { detail: 'johfrah' }));
                                      setMessages(prev => [...prev, {
                                        id: Date.now().toString(),
                                        role: 'assistant',
                                        content: t('chat.johfrah.takeover', "Ik heb Johfrah een seintje gegeven. Hij neemt de chat zo snel mogelijk van me over!"),
                                        timestamp: new Date().toISOString()
                                      }]);
                                      return;
                                    }
                                    if (action.action === 'toggle_edit_mode') {
                                      toggleEditMode();
                                      setMessages(prev => [...prev, {
                                        id: Date.now().toString(),
                                        role: 'assistant',
                                        content: t('chat.admin.edit_mode_toggled', `Edit Mode is nu ${!isEditMode ? 'ingeschakeld' : 'uitgeschakeld'}.`, { status: !isEditMode ? 'ingeschakeld' : 'uitgeschakeld' }),
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

                                    const result = typeof action.action === 'function' ? action.action() : t('chat.action.executed', `Actie uitgevoerd: ${action.label}`, { label: action.label });
                                    setMessages(prev => [...prev, {
                                      id: Date.now().toString(),
                                      role: 'assistant',
                                      content: result,
                                      timestamp: new Date().toISOString()
                                    }]);
                                  }}
                                  className="px-4 py-2 bg-va-black text-white rounded-full text-[15px] font-light tracking-widest hover:opacity-80 hover:scale-105 transition-all shadow-sm"
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
                                      <VoiceglotText translationKey={`chat.media.${item.title.toLowerCase().replace(/\s+/g, '_')}`} defaultText={item.title} />
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
                            <ContainerInstrument plain className="flex gap-1">
                              <motion.span 
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                className="w-1.5 h-1.5 bg-va-black/40 rounded-full" 
                              />
                              <motion.span 
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                className="w-1.5 h-1.5 bg-va-black/40 rounded-full" 
                              />
                              <motion.span 
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                className="w-1.5 h-1.5 bg-va-black/40 rounded-full" 
                              />
                            </ContainerInstrument>
                            <TextInstrument className="text-[13px] tracking-widest opacity-40 font-light">
                              <VoiceglotText translationKey="chat.status.typing" defaultText="VOICY DENKT NA..." />
                            </TextInstrument>
                          </ContainerInstrument>
                        </motion.div>
                      )}

                      {/* 🛡️ CHRIS-PROTOCOL: Inline Lead Form (v2.15.036) */}
                      {showLeadForm && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex justify-start w-full"
                        >
                          <ContainerInstrument plain className="bg-white border border-black/5 p-6 rounded-[24px] rounded-tl-none shadow-aura w-[90%] space-y-4">
                            <ContainerInstrument plain className="flex items-center gap-3 mb-2">
                              <ContainerInstrument plain className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User size={16} strokeWidth={1.5} />
                              </ContainerInstrument>
                              <TextInstrument className="text-[15px] font-medium tracking-tight">
                                <VoiceglotText translationKey="chat.lead.form_title" defaultText="Even voorstellen" />
                              </TextInstrument>
                            </ContainerInstrument>
                            
                            <FormInstrument onSubmit={handleLeadSubmit} className="space-y-3">
                              <InputInstrument 
                                type="text"
                                required
                                placeholder={t('common.name', "Je naam")}
                                value={leadFormData.name}
                                onChange={(e) => setLeadFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-va-off-white border-none rounded-xl py-3 px-4 text-[14px] font-light focus:ring-2 focus:ring-va-black/10 transition-all"
                              />
                              <InputInstrument 
                                type="email"
                                required
                                placeholder={t('common.email', "Je e-mailadres")}
                                value={leadFormData.email}
                                onChange={(e) => setLeadFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-va-off-white border-none rounded-xl py-3 px-4 text-[14px] font-light focus:ring-2 focus:ring-va-black/10 transition-all"
                              />
                              <ButtonInstrument 
                                type="submit"
                                className="w-full py-3 bg-va-black text-white rounded-xl text-[13px] font-black tracking-widest uppercase hover:opacity-80 transition-all shadow-lg"
                              >
                                <VoiceglotText translationKey="chat.lead.submit" defaultText="GESPREK BEWAREN" />
                              </ButtonInstrument>
                            </FormInstrument>
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
                      placeholder={t('chat.input.placeholder', "Typ je bericht...")}
                      className="w-full bg-va-off-white border-none rounded-full py-3 md:py-4 pl-5 md:pl-6 pr-12 md:pr-14 text-[15px] font-light placeholder:text-va-black/40 focus:ring-2 focus:ring-va-black/10 transition-all"
                    />
                    <ButtonInstrument
                      type="submit"
                      size="none"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-va-black text-white !rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send strokeWidth={1.5} size={18} className="text-white" />
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
                        <TextInstrument className="text-[15px] font-light ">
                          <VoiceglotText translationKey={`common.usage.${state.usage}`} defaultText={state.usage} />
                        </TextInstrument>
                      </ContainerInstrument>
                      <ContainerInstrument plain className="flex justify-between items-center">
                        <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/40"><VoiceglotText  translationKey="common.words" defaultText="Woorden" /></TextInstrument>
                        <TextInstrument className="text-[15px] font-light">{(state.briefing || '').split(/\s+/).filter(Boolean).length}</TextInstrument>
                      </ContainerInstrument>
                      <ContainerInstrument plain className="pt-4 border-t border-black/5 flex justify-between items-center">
                        <TextInstrument className="text-[15px] font-light tracking-widest text-primary"><VoiceglotText  translationKey="common.total" defaultText="Totaal" /></TextInstrument>
                        <TextInstrument className="text-lg font-light text-primary">€ {state.pricing.total.toFixed(2)}</TextInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  {state.selectedActor && (
                    <ContainerInstrument plain>
                      <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-va-black/30 mb-6"><VoiceglotText  translationKey="common.selected_voice" defaultText="Geselecteerde Stem" /></HeadingInstrument>
                      <ContainerInstrument plain className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-4">
                      <ContainerInstrument plain className="w-12 h-12 rounded-full bg-va-black/5 flex items-center justify-center font-light text-va-black">
                        {(state.selectedActor.first_name || '')[0]}
                      </ContainerInstrument>
                        <ContainerInstrument plain>
                          <TextInstrument className="text-[15px] font-light">{state.selectedActor.first_name}</TextInstrument>
                          <TextInstrument className="text-[15px] font-light opacity-40">
                            <VoiceglotText translationKey={state.selectedActor.native_lang_id ? `language.${state.selectedActor.native_lang_id}` : `common.language.${state.selectedActor.native_lang}`} defaultText={state.selectedActor.native_lang_label || MarketManager.getLanguageLabel(state.selectedActor.native_lang)} noTranslate={true} />
                          </TextInstrument>
                        </ContainerInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  )}

                  <ContainerInstrument plain className="pt-4">
                    <ButtonInstrument 
                      as="a" 
                      href="/checkout"
                      className="w-full py-4 bg-va-black text-white rounded-2xl text-[15px] font-light tracking-widest hover:opacity-80 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <VoiceglotText translationKey="chat.checkout.direct" defaultText="Direct afrekenen" /> <ChevronRight strokeWidth={1.5} size={14} />
                    </ButtonInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          )}

          {activeTab === 'mail' && (
            <ContainerInstrument plain className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              <AnimatePresence  mode="wait">
                {mailSent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="h-full flex flex-col items-center justify-center text-center space-y-3"
                  >
                    <ContainerInstrument plain className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                      <Check strokeWidth={1.5} size={24} />
                    </ContainerInstrument>
                    <HeadingInstrument level={4} className="text-lg font-light tracking-tighter">
                      <VoiceglotText  translationKey="chat.mail.sent.title" defaultText="Bericht verzonden!" />
                    </HeadingInstrument>
                    <TextInstrument className="text-[14px] text-va-black/40 font-light">
                      <VoiceglotText  translationKey="chat.mail.sent.text" defaultText="Bedankt! We reageren zo snel mogelijk." />
                    </TextInstrument>
                    <ButtonInstrument 
                      onClick={() => setMailSent(false)}
                      className="va-btn-pro px-6 py-2 text-[14px]"
                    >
                      <VoiceglotText  translationKey="chat.mail.sent.cta" defaultText="Nog een bericht" />
                    </ButtonInstrument>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-4"
                  >
                    <ContainerInstrument plain className="flex flex-col items-center text-center space-y-1">
                      <ContainerInstrument plain className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 shadow-lg mb-2">
                        <Mail strokeWidth={1.5} size={24} className="animate-bounce" />
                      </ContainerInstrument>
                      <HeadingInstrument level={4} className="text-xl font-light tracking-tighter">
                        <VoiceglotText  translationKey="chat.mail.title" defaultText="Stuur ons een bericht" />
                      </HeadingInstrument>
                      <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">
                        <VoiceglotText  translationKey="chat.mail.subtitle" defaultText="We reageren meestal binnen het uur." />
                      </TextInstrument>
                    </ContainerInstrument>

                    <FormInstrument onSubmit={handleMailSubmit} className="space-y-3">
                      <ContainerInstrument plain className="relative group">
                        <ContainerInstrument plain className="absolute left-5 top-1/2 -translate-y-1/2 text-va-black/40 group-focus-within:text-primary transition-colors">
                          <User size={16} strokeWidth={1.5} />
                        </ContainerInstrument>
                        <InputInstrument 
                          type="email" 
                          required
                          value={mailForm.email}
                          onChange={(e) => setMailForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder={t('chat.mail.placeholder.email', "naam@bedrijf.be")}
                          className="w-full bg-va-off-white border-none rounded-xl py-3 pl-12 pr-5 text-[14px] font-light focus:ring-2 focus:ring-va-black/10 transition-all placeholder:text-va-black/60"
                        />
                      </ContainerInstrument>
                      <ContainerInstrument plain className="relative group">
                        <ContainerInstrument plain className="absolute left-5 top-5 text-va-black/40 group-focus-within:text-primary transition-colors">
                          <MessageCircle size={16} strokeWidth={1.5} />
                        </ContainerInstrument>
                        <textarea 
                          required
                          value={mailForm.message}
                          onChange={(e) => setMailForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder={t('chat.mail.placeholder.message', "Hoe kunnen we je helpen?")}
                          className="w-full bg-va-off-white border-none rounded-xl py-3 pl-12 pr-5 text-[14px] font-light min-h-[100px] focus:ring-2 focus:ring-va-black/10 transition-all resize-none outline-none placeholder:text-va-black/60"
                        />
                      </ContainerInstrument>
                      <ButtonInstrument 
                        type="submit" 
                        disabled={isSendingMail}
                        className="w-full py-4 bg-va-black text-white rounded-xl text-[14px] font-medium tracking-widest hover:opacity-80 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                      >
                        {isSendingMail ? <Loader2 className="animate-spin" size={16} /> : <Send strokeWidth={1.5} size={14} />}
                        <TextInstrument className="font-black tracking-widest text-[14px] uppercase">
                          <VoiceglotText translationKey="chat.mail.send_button" defaultText="BERICHT VERSTUREN" />
                        </TextInstrument>
                      </ButtonInstrument>
                    </FormInstrument>

                    <ContainerInstrument plain className="flex items-center gap-3 py-1">
                      <ContainerInstrument plain className="flex-1 h-px bg-black/5" />
                      <TextInstrument className="text-[10px] text-va-black/20 tracking-widest uppercase">
                        <VoiceglotText translationKey="common.or" defaultText="of" />
                      </TextInstrument>
                      <ContainerInstrument plain className="flex-1 h-px bg-black/5" />
                    </ContainerInstrument>

                        <ButtonInstrument 
                          as="a" 
                          href={`mailto:${activeEmail}`} 
                          className="w-full py-3 bg-va-off-white border border-black/5 rounded-xl flex items-center justify-center gap-2 hover:bg-black/5 transition-all group"
                        >
                          <Mail size={14} strokeWidth={1.5} className="text-va-black/40 group-hover:text-primary transition-colors" />
                          <TextInstrument className="text-[14px] font-light tracking-widest">{activeEmail}</TextInstrument>
                        </ButtonInstrument>
                  </motion.div>
                )}
              </AnimatePresence>
            </ContainerInstrument>
          )}

          {activeTab === 'phone' && (
            <ContainerInstrument plain className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-4">
              {(() => {
                const isOfficeOpenStatus = generalSettings?.opening_hours ? isOfficeOpen(generalSettings.opening_hours) : true;
                const isTelephonyLive = telephonyConfig.isLive !== false;
                const isActuallyOpen = isOfficeOpenStatus && isTelephonyLive;
                
                if (callRequested) {
                  return (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="space-y-3"
                    >
                      <ContainerInstrument plain className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
                        <Check strokeWidth={1.5} size={24} />
                      </ContainerInstrument>
                      <HeadingInstrument level={4} className="text-lg font-light tracking-tighter">
                        <VoiceglotText  translationKey="chat.phone.requested.title" defaultText="Verbinding wordt opgezet!" />
                      </HeadingInstrument>
                      <TextInstrument className="text-[14px] text-va-black/40 font-light">
                        <VoiceglotText  translationKey="chat.phone.requested.text" defaultText="Je telefoon gaat over over enkele seconden." />
                      </TextInstrument>
                      <ButtonInstrument 
                        onClick={() => setCallRequested(false)}
                        className="va-btn-pro px-6 py-2 text-[14px]"
                      >
                        <VoiceglotText  translationKey="chat.phone.requested.cta" defaultText="Terug" />
                      </ButtonInstrument>
                    </motion.div>
                  );
                }

                return (
                  <>
                    <ContainerInstrument plain className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg", isActuallyOpen ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600")}>
                      <Phone strokeWidth={1.5} size={24} className={cn(isActuallyOpen && "animate-bounce")} />
                    </ContainerInstrument>
                    <ContainerInstrument plain className="space-y-1">
                      <HeadingInstrument level={4} className="text-lg font-light tracking-tighter">
                        {isActuallyOpen ? (
                          <VoiceglotText translationKey="chat.phone.title.open" defaultText="Directe Studio Lijn" />
                        ) : (
                          <VoiceglotText translationKey="chat.phone.title.closed" defaultText="Studio gesloten" />
                        )}
                      </HeadingInstrument>
                      <TextInstrument className="text-[14px] text-va-black/40 font-light leading-relaxed">
                        {isActuallyOpen ? (
                          <VoiceglotText translationKey="chat.phone.subtitle.open" defaultText="We bellen je binnen 10 seconden." />
                        ) : (
                          <>
                            {!isTelephonyLive ? (
                              <VoiceglotText translationKey="chat.phone.subtitle.manual_offline" defaultText="Johfrah is momenteel in een opname en niet direct bereikbaar." />
                            ) : (
                              <VoiceglotText translationKey="chat.phone.subtitle.closed" defaultText="Momenteel niet bereikbaar." />
                            )}
                            {isTelephonyLive && (() => {
                              const next = generalSettings?.phone_hours ? getNextOpeningTime(generalSettings.phone_hours) : null;
                              return next ? (
                                <span className="block mt-1 font-medium text-primary text-[12px]">
                                  <VoiceglotText translationKey="chat.phone.back_at" defaultText={`Terug vanaf ${next.day} ${next.time}`} noTranslate={true} />
                                </span>
                              ) : null;
                            })()}
                          </>
                        )}
                      </TextInstrument>
                    </ContainerInstrument>

                    {isActuallyOpen && (
                        <ContainerInstrument plain className="w-full space-y-3">
                        <ContainerInstrument plain className="relative group">
                          <ContainerInstrument plain className="absolute left-5 top-1/2 -translate-y-1/2 text-va-black/40 group-focus-within:text-primary transition-colors">
                            <Phone size={16} strokeWidth={1.5} />
                          </ContainerInstrument>
                          <InputInstrument 
                            type="tel"
                            placeholder={t('chat.phone.placeholder', "0475 00 00 00")}
                            className="w-full bg-va-off-white border-none rounded-xl py-3 pl-12 pr-5 text-[14px] font-light focus:ring-2 focus:ring-va-black/10 transition-all placeholder:text-va-black/60"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                          />
                          {callError && (
                            <TextInstrument className="text-red-500 text-[11px] mt-1 text-center">
                              <VoiceglotText translationKey="chat.phone.error" defaultText={callError} noTranslate={true} />
                            </TextInstrument>
                          )}
                        </ContainerInstrument>
                        
                        <ButtonInstrument 
                          onClick={() => handleCallbackRequest(inputValue)}
                          disabled={isCalling || !inputValue}
                          className={cn(
                            "va-btn-pro w-full flex flex-col items-center justify-center py-3 gap-0.5 h-auto",
                            isCalling && "opacity-70"
                          )}
                        >
                          <ContainerInstrument plain className="flex items-center gap-2">
                            {isCalling ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Zap size={14} className="text-primary animate-pulse" />
                            )}
                            <TextInstrument className="font-black tracking-widest text-[14px] uppercase">
                              <VoiceglotText translationKey="chat.phone.call_me_now" defaultText="BEL MIJ NU" />
                            </TextInstrument>
                          </ContainerInstrument>
                          <TextInstrument className="text-[9px] opacity-60 font-light tracking-widest uppercase">
                            <VoiceglotText translationKey="chat.phone.call_me_now_desc" defaultText="Je telefoon gaat direct over" />
                          </TextInstrument>
                        </ButtonInstrument>

                        <ContainerInstrument plain className="flex items-center gap-3 py-1">
                          <ContainerInstrument plain className="flex-1 h-px bg-black/5" />
                          <TextInstrument className="text-[10px] text-va-black/20 tracking-widest uppercase">
                            <VoiceglotText translationKey="common.or" defaultText="of" />
                          </TextInstrument>
                          <ContainerInstrument plain className="flex-1 h-px bg-black/5" />
                        </ContainerInstrument>

                        <ButtonInstrument 
                          as="a" 
                          href={`tel:${activePhone.replace(/\s+/g, '')}`} 
                          className="w-full py-3 bg-va-off-white border border-black/5 rounded-xl flex items-center justify-center gap-2 hover:bg-black/5 transition-all group"
                        >
                          <Phone size={14} strokeWidth={1.5} className="text-va-black/40 group-hover:text-primary transition-colors" />
                          <TextInstrument className="text-[14px] font-light tracking-widest">{activePhone}</TextInstrument>
                        </ButtonInstrument>
                      </ContainerInstrument>
                    )}
                  </>
                );
              })()}
            </ContainerInstrument>
          )}

          {activeTab === 'faq' && (
            <ContainerInstrument plain className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              <HeadingInstrument level={4} className="text-[15px] font-medium tracking-widest text-va-black/30 mb-4"><VoiceglotText  translationKey="chat.faq.title" defaultText="Veelgestelde vragen" /></HeadingInstrument>
              {[
                { q: "Wat zijn de tarieven?", key: "chat.faq.q1" },
                { q: "Hoe snel wordt er geleverd?", key: "chat.faq.q2" },
                ...(state.usage !== 'telefonie' ? [{ q: "Kan ik een gratis proefopname krijgen?", key: "chat.faq.q3" }] : []),
                { q: "Welke talen bieden jullie aan?", key: "chat.faq.q4" }
              ].map((faq, i) => (
                    <ButtonInstrument
                      key={i}
                      onClick={() => {
                        setActiveTab('chat');
                        handleSend(undefined, faq.q, 'chip');
                      }}
                      variant="plain"
                      className="w-full text-left p-4 rounded-2xl bg-va-off-white hover:bg-va-black/5 text-va-black transition-all text-[15px] font-light flex justify-between items-center group"
                    >
                    <TextInstrument as="span"><VoiceglotText  translationKey={faq.key} defaultText={faq.q} /></TextInstrument>
                    <Send strokeWidth={1.5} size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  </ButtonInstrument>
              ))}
            </ContainerInstrument>
          )}

          {activeTab === 'orders' && isAuthenticated && (
            <ContainerInstrument plain className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <HeadingInstrument level={4} className="text-[15px] font-medium tracking-widest text-va-black/30 mb-4">
                <VoiceglotText translationKey="chat.orders.title" defaultText="Mijn Bestellingen" />
              </HeadingInstrument>
              
              {customer360?.dna?.totalOrders > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-va-off-white rounded-2xl border border-black/5">
                    <TextInstrument className="text-[13px] font-medium mb-1">
                      <VoiceglotText translationKey="chat.orders.latest_status" defaultText="Status laatste bestelling" />
                    </TextInstrument>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-[15px] font-bold uppercase tracking-wider text-green-600">
                        {customer360?.dna?.lastOrderStatus || 'In behandeling'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <ButtonInstrument 
                      as="a" 
                      href="/account/orders"
                      className="w-full py-3 bg-va-black text-white rounded-xl text-[13px] font-black tracking-widest uppercase hover:opacity-80 transition-all text-center"
                    >
                      <VoiceglotText translationKey="chat.orders.view_all" defaultText="ALLE BESTELLINGEN" />
                    </ButtonInstrument>
                    <ButtonInstrument 
                      as="a" 
                      href="/account/vault"
                      className="w-full py-3 bg-va-off-white text-va-black rounded-xl text-[13px] font-black tracking-widest uppercase hover:bg-black/5 transition-all text-center"
                    >
                      <VoiceglotText translationKey="chat.orders.vault" defaultText="MIJN BESTANDEN (VAULT)" />
                    </ButtonInstrument>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 opacity-40">
                  <ShoppingCart size={48} className="mx-auto mb-4" />
                  <TextInstrument className="text-[15px] font-light">
                    <VoiceglotText translationKey="chat.orders.none" defaultText="Je hebt nog geen bestellingen." />
                  </TextInstrument>
                </div>
              )}
            </ContainerInstrument>
          )}

          {activeTab === 'admin' && isAdmin && (
            <ContainerInstrument plain className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <HeadingInstrument level={4} className="text-[15px] font-medium tracking-widest text-va-black/30 mb-4"><VoiceglotText  translationKey="chat.admin.title" defaultText="Admin Control Panel" /></HeadingInstrument>
              
              <ContainerInstrument plain className="space-y-4">
                <ButtonInstrument
                  onClick={() => {
                    playSonicClick('pro');
                    toggleEditMode();
                  }}
                  className={`w-full p-6 rounded-[24px] flex items-center justify-between transition-all ${
                    isEditMode ? 'bg-va-black text-white shadow-lg shadow-black/20' : 'bg-va-off-white text-va-black hover:bg-black/5'
                  }`}
                >
                  <ContainerInstrument plain className="flex items-center gap-4">
                    <ContainerInstrument plain className={`w-10 h-10 rounded-full flex items-center justify-center ${isEditMode ? 'bg-white/20' : 'bg-va-black/5'}`}>
                      <Zap strokeWidth={1.5} size={20} className={isEditMode ? 'text-white' : 'text-va-black'} />
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
                      <LayoutDashboard strokeWidth={1.5} size={16} className="text-va-black/40" />
                    </ContainerInstrument>
                    <TextInstrument className="text-[15px] font-light tracking-widest block"><VoiceglotText  translationKey="nav.dashboard" defaultText="Dashboard" /></TextInstrument>
                  </ButtonInstrument>
                  <ButtonInstrument
                    as="a"
                    href="/admin/mailbox"
                    className="p-4 rounded-2xl bg-va-off-white hover:bg-black/5 transition-all text-left space-y-1"
                  >
                    <ContainerInstrument plain className="w-4 h-4 mb-1">
                      <Mail strokeWidth={1.5} size={16} className="text-va-black/40" />
                    </ContainerInstrument>
                    <TextInstrument className="text-[15px] font-light tracking-widest block"><VoiceglotText  translationKey="nav.mailbox" defaultText="Mailbox" /></TextInstrument>
                  </ButtonInstrument>
                </ContainerInstrument>

                {customer360 && (
                  <ContainerInstrument plain className="p-4 bg-va-black text-white rounded-[24px] space-y-3">
                    <HeadingInstrument level={5} className="text-[15px] font-light tracking-widest opacity-40"><VoiceglotText  translationKey="account.dna.title" defaultText="Klant DNA" /></HeadingInstrument>
                    <ContainerInstrument plain className="flex items-center gap-3">
                      <ContainerInstrument plain className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-light">{customer360.first_name?.[0]}</ContainerInstrument>
                      <ContainerInstrument plain>
                        <TextInstrument className="text-[15px] font-light"><VoiceglotText  translationKey={`user.${customer360.id}.name`} defaultText={`${customer360.first_name} ${customer360.last_name}`} noTranslate={true} /></TextInstrument>
                        <TextInstrument className="text-[15px] font-light opacity-40">
                          {customer360.intelligence?.leadVibe || 'cold'} <VoiceglotText  translationKey="common.vibe" defaultText="Vibe" />
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
