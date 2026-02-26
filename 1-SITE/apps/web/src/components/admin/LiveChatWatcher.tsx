"use client";

import { useEffect, useState, useRef } from "react";
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  PageWrapperInstrument
} from "@/components/ui/LayoutInstruments";
import { 
  MessageCircle, 
  User, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Bot,
  Shield,
  Zap,
  Bell,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

interface Conversation {
  id: number;
  status: string;
  updatedAt: string;
  metadata: any;
  user_id: string | null;
  lastMessage?: string;
}

interface Message {
  id: string;
  senderType: 'user' | 'ai' | 'admin';
  message: string;
  createdAt: string;
}

export const LiveChatWatcher = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/chat/?action=conversations&userId=all'); // We hebben een admin endpoint nodig of deze moet all supporten
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (e) {
        console.error("Failed to fetch conversations", e);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch('/api/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'history', conversationId: selectedId })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMessages(data.messages);
          }
        }
      } catch (e) {
        console.error("Failed to fetch messages", e);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    
    // SSE for real-time updates
    const eventSource = new EventSource(`/api/chat/sse/?conversationId=${selectedId}`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_messages') {
        setMessages(prev => {
          const newMsgs = data.messages.filter((m: any) => !prev.find(p => p.id === m.id.toString()));
          return [...prev, ...newMsgs.map((m: any) => ({
            id: m.id.toString(),
            senderType: m.senderType,
            message: m.message,
            createdAt: m.createdAt
          }))];
        });
      }
    };

    return () => eventSource.close();
  }, [selectedId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <ContainerInstrument className="h-screen flex items-center justify-center bg-va-off-white">
        <Loader2 className="animate-spin text-primary" size={32} />
      </ContainerInstrument>
    );
  }

  return (
    <PageWrapperInstrument className="h-screen flex flex-col bg-va-off-white overflow-hidden">
      {/* Mobile Header */}
      <ContainerInstrument className="p-4 bg-va-black text-white flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {selectedId ? (
            <button onClick={() => setSelectedId(null)} className="p-2 -ml-2">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <Link href="/admin/dashboard" className="p-2 -ml-2">
              <Shield size={20} className="text-primary" />
            </Link>
          )}
          <HeadingInstrument level={1} className="text-lg font-light tracking-tight">
            {selectedId ? `Chat #${selectedId}` : "Live Chat Watcher"}
          </HeadingInstrument>
        </div>
        {!selectedId && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <TextInstrument className="text-[10px] font-bold tracking-widest uppercase opacity-60">Live</TextInstrument>
          </div>
        )}
      </ContainerInstrument>

      <ContainerInstrument className="flex-1 flex overflow-hidden relative">
        {/* Conversation List */}
        <ContainerInstrument 
          className={cn(
            "w-full md:w-80 border-r border-black/5 overflow-y-auto bg-white transition-all duration-300",
            selectedId && "hidden md:block"
          )}
        >
          {conversations.length === 0 ? (
            <div className="p-10 text-center opacity-20">
              <MessageCircle size={48} className="mx-auto mb-4" />
              <p className="text-sm uppercase tracking-widest font-bold">Geen actieve chats</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "w-full p-5 border-b border-black/5 text-left hover:bg-va-off-white transition-all flex flex-col gap-2",
                  selectedId === conv.id && "bg-va-off-white border-l-4 border-l-primary"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <ContainerInstrument className="w-8 h-8 rounded-full bg-va-black/5 flex items-center justify-center">
                      <User size={14} className="text-va-black/40" />
                    </ContainerInstrument>
                    <span className="text-sm font-bold">Klant #{conv.id}</span>
                  </div>
                  <span className="text-[10px] opacity-40 font-medium">
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: nl })}
                  </span>
                </div>
                {conv.metadata?.journey && (
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">
                      {conv.metadata.journey}
                    </span>
                    {conv.metadata?.vibe && (
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                        conv.metadata.vibe === 'burning' ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {conv.metadata.vibe}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </ContainerInstrument>

        {/* Chat Detail */}
        <ContainerInstrument 
          className={cn(
            "flex-1 flex flex-col bg-va-off-white transition-all duration-300",
            !selectedId && "hidden md:flex items-center justify-center opacity-20"
          )}
        >
          {selectedId ? (
            <>
              {/* Chat Messages */}
              <ContainerInstrument 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.senderType === 'user' ? "mr-auto" : "ml-auto items-end"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-[20px] text-sm font-medium leading-relaxed shadow-sm",
                      msg.senderType === 'user' 
                        ? "bg-white text-va-black rounded-tl-none" 
                        : msg.senderType === 'ai'
                          ? "bg-va-black text-white rounded-tr-none"
                          : "bg-primary text-white rounded-tr-none"
                    )}>
                      {msg.message}
                    </div>
                    <span className="text-[9px] mt-1 opacity-30 font-bold uppercase tracking-widest">
                      {msg.senderType === 'ai' ? 'Voicy' : msg.senderType === 'user' ? 'Klant' : 'Admin'} • {new Date(msg.createdAt).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </ContainerInstrument>

              {/* Quick Actions (Future: Intervene) */}
              <div className="p-4 bg-white border-t border-black/5 flex gap-2 overflow-x-auto no-scrollbar">
                <ButtonInstrument className="whitespace-nowrap bg-va-black text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full flex items-center gap-2">
                  <Zap size={12} className="text-primary" /> Overnemen
                </ButtonInstrument>
                <ButtonInstrument className="whitespace-nowrap bg-va-off-white text-va-black/40 text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full">
                  Stuur Notificatie
                </ButtonInstrument>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Bot size={64} className="mx-auto mb-4 opacity-20" />
              <HeadingInstrument level={2} className="text-xl font-light tracking-tighter">Selecteer een gesprek</HeadingInstrument>
              <TextInstrument className="text-sm opacity-40">Live meekijken met Voicy</TextInstrument>
            </div>
          )}
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
};
