"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  BellOff,
  Loader2,
  RefreshCw,
  Archive,
  RotateCcw,
  Search,
  Flame,
  CheckSquare2,
  Square,
  ArrowUpDown,
  Keyboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

interface Conversation {
  id: number;
  status: string;
  updated_at: string;
  iap_context: any;
  user_id: string | null;
  guest_name?: string;
  guest_email?: string;
  lastMessage?: string;
  message_count?: number;
}

interface Message {
  id: string;
  sender_type: 'user' | 'ai' | 'admin';
  message: string;
  created_at: string;
  metadata?: {
    interaction_type?: 'text' | 'chip' | 'tool';
    current_page?: string;
  };
  attachments?: any;
}

interface ObservabilitySummary {
  total: number;
  errors: number;
  error_rate_pct: number;
  avg_ms: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  slow_over_100ms: number;
}

interface ChatObservabilitySnapshot {
  generated_at: string;
  api: {
    last_1m: ObservabilitySummary;
    last_5m: ObservabilitySummary;
  };
  sse: {
    last_1m: ObservabilitySummary;
    last_5m: ObservabilitySummary;
  };
}

const normalizeConversation = (item: any): Conversation => ({
  id: Number(item?.id),
  status: String(item?.status || "open"),
  updated_at: String(item?.updated_at || item?.updatedAt || new Date().toISOString()),
  iap_context: item?.iap_context || item?.iapContext || {},
  user_id: item?.user_id || item?.userId || null,
  guest_name: item?.guest_name || item?.guestName || undefined,
  guest_email: item?.guest_email || item?.guestEmail || undefined,
  lastMessage: item?.lastMessage || item?.last_message || undefined,
  message_count: Number(item?.message_count || item?.messageCount || 0),
});

const normalizeMessage = (item: any): Message => ({
  id: String(item?.id),
  sender_type: item?.sender_type || item?.senderType || "user",
  message: String(item?.message || ""),
  created_at: String(item?.created_at || item?.createdAt || new Date().toISOString()),
  metadata: item?.metadata || {},
  attachments: item?.attachments,
});

const getMinutesSinceUpdate = (updatedAt?: string) => {
  if (!updatedAt) return 9999;
  const parsed = new Date(updatedAt).getTime();
  if (Number.isNaN(parsed)) return 9999;
  return Math.max(0, Math.floor((Date.now() - parsed) / 60000));
};

const getHotScore = (conversation: Conversation) => {
  const statusScore = conversation.status === 'admin_active' ? 50 : conversation.status === 'open' ? 35 : 5;
  const messageScore = Math.min(conversation.message_count || 0, 25) * 2;
  const recencyScore = Math.max(0, 60 - getMinutesSinceUpdate(conversation.updated_at));
  return statusScore + messageScore + recencyScore;
};

// Helper voor Base64 naar Uint8Array (nodig voor VAPID key)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const LiveChatWatcher = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [listFilter, setListFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [listError, setListError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<'latest' | 'hot'>('hot');
  const [bulkSelectedIds, setBulkSelectedIds] = useState<number[]>([]);
  const [metrics, setMetrics] = useState<ChatObservabilitySnapshot | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const replyInputRef = useRef<HTMLInputElement | null>(null);

  // Check Push Status op mount
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsPushEnabled(!!subscription);
        });
      });
    }
  }, []);

  const togglePush = async () => {
    if (process.env.NODE_ENV !== 'production') {
      alert('Push notificaties zijn alleen actief in productie.');
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notificaties worden niet ondersteund op dit toestel.');
      return;
    }

    setIsPushLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (isPushEnabled) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await fetch('/api/admin/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'unsubscribe', subscription })
          });
        }
        setIsPushEnabled(false);
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Je moet toestemming geven voor notificaties.');
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) throw new Error('VAPID Public Key missing');

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });

        const res = await fetch('/api/admin/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'subscribe', 
            subscription: {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!) as any)),
                auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!) as any))
              }
            }
          })
        });

        if (res.ok) {
          setIsPushEnabled(true);
        }
      }
    } catch (err) {
      console.error('Push toggle failed', err);
      alert('Fout bij instellen notificaties.');
    } finally {
      setIsPushLoading(false);
    }
  };

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) || null,
    [conversations, selectedId]
  );

  const visibleConversations = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    const filtered = !needle
      ? conversations
      : conversations.filter((conversation) => {
      const haystack = [
        conversation.id,
        conversation.guest_name || '',
        conversation.guest_email || '',
        conversation.lastMessage || '',
        conversation.iap_context?.journey || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === 'hot') {
        const hotDiff = getHotScore(b) - getHotScore(a);
        if (hotDiff !== 0) return hotDiff;
      }
      const aTs = new Date(a.updated_at || 0).getTime();
      const bTs = new Date(b.updated_at || 0).getTime();
      return bTs - aTs;
    });

    return sorted;
  }, [conversations, searchQuery, sortMode]);

  const conversationCounters = useMemo(() => {
    return conversations.reduce(
      (acc, conversation) => {
        if (conversation.status === 'archived') acc.archived += 1;
        else if (conversation.status === 'admin_active') acc.adminActive += 1;
        else acc.open += 1;
        return acc;
      },
      { open: 0, adminActive: 0, archived: 0 }
    );
  }, [conversations]);

  const fetchConversations = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (silent) setIsRefreshing(true);
      else setLoading(true);
      setListError(null);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch('/api/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            action: 'conversations',
            userId: 'all',
            filter: listFilter,
            limit: listFilter === 'all' ? 300 : 180,
          }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          const message = payload?.error || `HTTP ${res.status}`;
          throw new Error(message);
        }

        const data = await res.json();
        const normalized = Array.isArray(data) ? data.map(normalizeConversation) : [];
        setConversations(normalized);
      } catch (error) {
        const isAbort = error instanceof DOMException && error.name === 'AbortError';
        if (!isAbort) {
          console.error('[LiveChatWatcher] Failed to fetch conversations', error);
          setConversations([]);
        }
        setListError(isAbort ? 'Timeout bij laden van gesprekken. Probeer opnieuw.' : 'Gesprekken konden niet geladen worden.');
      } finally {
        clearTimeout(timeout);
        if (silent) setIsRefreshing(false);
        else setLoading(false);
      }
    },
    [listFilter]
  );

  const fetchMessageHistory = useCallback(async (conversationId: number) => {
    const res = await fetch('/api/chat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'history', conversationId }),
    });
    if (!res.ok) throw new Error(`History HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.success || !Array.isArray(data?.messages)) return [];
    return data.messages.map(normalizeMessage);
  }, []);

  const updateConversationStatus = useCallback(
    async (conversationId: number, status: 'open' | 'admin_active' | 'archived') => {
      setStatusUpdatingId(conversationId);
      try {
        const res = await fetch('/api/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_status',
            conversationId,
            status,
          }),
        });
        if (!res.ok) throw new Error(`Status HTTP ${res.status}`);
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === conversationId ? { ...conversation, status, updated_at: new Date().toISOString() } : conversation
          )
        );
        if (listFilter === 'active' && status === 'archived' && selectedId === conversationId) {
          setSelectedId(null);
          setMessages([]);
        }
      } catch (error) {
        console.error('[LiveChatWatcher] Failed to update status', error);
        alert('Status-update mislukt. Probeer opnieuw.');
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [listFilter, selectedId]
  );

  const handleReplySubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedId) return;
      const message = replyDraft.trim();
      if (!message) return;
      setSendingReply(true);
      try {
        const res = await fetch('/api/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            conversationId: selectedId,
            message,
            senderType: 'admin',
          }),
        });
        if (!res.ok) throw new Error(`Send HTTP ${res.status}`);
        setReplyDraft('');
        await fetchConversations({ silent: true });
      } catch (error) {
        console.error('[LiveChatWatcher] Failed to send reply', error);
        alert('Antwoord versturen mislukt. Probeer opnieuw.');
      } finally {
        setSendingReply(false);
      }
    },
    [fetchConversations, replyDraft, selectedId]
  );

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'metrics' }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMetrics(data);
    } catch {
      // Observability is non-blocking for operator workflow.
    }
  }, []);

  const bulkUpdateStatus = useCallback(
    async (status: 'open' | 'admin_active' | 'archived') => {
      if (!bulkSelectedIds.length) return;
      try {
        const res = await fetch('/api/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'bulk_update_status',
            conversationIds: bulkSelectedIds,
            status,
          }),
        });
        if (!res.ok) throw new Error(`Bulk status HTTP ${res.status}`);
        if (status === 'archived' && selectedId && bulkSelectedIds.includes(selectedId) && listFilter === 'active') {
          setSelectedId(null);
          setMessages([]);
        }
        setBulkSelectedIds([]);
        await fetchConversations({ silent: true });
      } catch (error) {
        console.error('[LiveChatWatcher] Bulk status update failed', error);
        alert('Bulk-update mislukt. Probeer opnieuw.');
      }
    },
    [bulkSelectedIds, fetchConversations, listFilter, selectedId]
  );

  const toggleBulkSelection = useCallback((conversationId: number) => {
    setBulkSelectedIds((prev) =>
      prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId]
    );
  }, []);

  const toggleSelectAllVisible = useCallback(() => {
    const visibleIds = visibleConversations.map((conversation) => conversation.id);
    setBulkSelectedIds((prev) => {
      const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.includes(id));
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });
  }, [visibleConversations]);

  useEffect(() => {
    const validIds = new Set(conversations.map((conversation) => conversation.id));
    setBulkSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [conversations]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTextField = !!target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('contenteditable') === 'true'
      );

      if (event.key === '/' && !isTextField) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (isTextField) return;
      if (visibleConversations.length === 0) return;

      const currentIndex = selectedId
        ? visibleConversations.findIndex((conversation) => conversation.id === selectedId)
        : -1;

      if (event.key.toLowerCase() === 'j') {
        event.preventDefault();
        const nextIndex = Math.min(visibleConversations.length - 1, currentIndex + 1);
        setSelectedId(visibleConversations[nextIndex].id);
        return;
      }

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const prevIndex = Math.max(0, currentIndex === -1 ? 0 : currentIndex - 1);
        setSelectedId(visibleConversations[prevIndex].id);
        return;
      }

      if (event.key.toLowerCase() === 'x' && selectedId) {
        event.preventDefault();
        updateConversationStatus(selectedId, 'archived');
        return;
      }

      if (event.key.toLowerCase() === 'r' && selectedId) {
        event.preventDefault();
        updateConversationStatus(selectedId, 'open');
        return;
      }

      if (event.key.toLowerCase() === 'a' && selectedId) {
        event.preventDefault();
        updateConversationStatus(selectedId, 'admin_active');
        return;
      }

      if (event.key === 'Enter' && selectedId) {
        event.preventDefault();
        replyInputRef.current?.focus();
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId, updateConversationStatus, visibleConversations]);

  useEffect(() => {
    fetchConversations();
    fetchMetrics();
    const interval = setInterval(() => {
      fetchConversations({ silent: true });
    }, 7000);
    const metricsInterval = setInterval(() => {
      fetchMetrics();
    }, 15000);
    return () => {
      clearInterval(interval);
      clearInterval(metricsInterval);
    };
  }, [fetchConversations, fetchMetrics]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedId) {
      sseRef.current?.close();
      sseRef.current = null;
      setMessages([]);
      return;
    }

    let mounted = true;
    setLoadingMessages(true);

    const initConversationStream = async () => {
      try {
        const historyMessages = await fetchMessageHistory(selectedId);
        if (!mounted) return;
        setMessages(historyMessages);

        const lastId =
          historyMessages.length > 0
            ? Math.max(...historyMessages.map((message: Message) => (isNaN(parseInt(message.id, 10)) ? 0 : parseInt(message.id, 10))))
            : 0;

        sseRef.current?.close();
        const eventSource = new EventSource(`/api/chat/sse/?conversationId=${selectedId}&lastMessageId=${lastId}&pollMs=1200`);
        sseRef.current = eventSource;

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type !== 'new_messages') return;
          setMessages((prev) => {
            const existingIds = new Set(prev.map((message) => String(message.id)));
            const incoming = (data.messages || [])
              .map(normalizeMessage)
              .filter((message: Message) => !existingIds.has(String(message.id)));
            if (incoming.length === 0) return prev;
            return [...prev, ...incoming];
          });
        };

        eventSource.onerror = () => {
          eventSource.close();
        };
      } catch (error) {
        if (!mounted) return;
        console.error('[LiveChatWatcher] Failed to initialize conversation stream', error);
      } finally {
        if (mounted) setLoadingMessages(false);
      }
    };

    initConversationStream();

    return () => {
      mounted = false;
      sseRef.current?.close();
      sseRef.current = null;
    };
  }, [fetchMessageHistory, selectedId]);

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
            {selectedConversation ? (selectedConversation.guest_name || `Chat #${selectedConversation.id}`) : "Live Chat Watcher"}
          </HeadingInstrument>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePush}
            disabled={isPushLoading}
            className={cn(
              "p-2 rounded-full transition-all",
              isPushEnabled ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"
            )}
          >
            {isPushLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isPushEnabled ? (
              <Bell size={18} />
            ) : (
              <BellOff size={18} />
            )}
          </button>
          {!selectedId && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <TextInstrument className="text-[10px] font-bold tracking-widest uppercase opacity-60">Live</TextInstrument>
            </div>
          )}
        </div>
      </ContainerInstrument>

      <ContainerInstrument className="flex-1 flex overflow-hidden relative">
        {/* Conversation List */}
        <ContainerInstrument 
          className={cn(
            "w-full md:w-80 border-r border-black/5 overflow-y-auto bg-white transition-all duration-300",
            selectedId && "hidden md:block"
          )}
        >
          <ContainerInstrument className="sticky top-0 z-10 bg-white border-b border-black/5 p-3 space-y-3">
            <ContainerInstrument className="flex items-center gap-2">
              <button
                onClick={() => setListFilter('active')}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
                  listFilter === 'active' ? "bg-va-black text-white" : "bg-va-off-white text-va-black/50"
                )}
              >
                Actief ({conversationCounters.open + conversationCounters.adminActive})
              </button>
              <button
                onClick={() => setListFilter('archived')}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
                  listFilter === 'archived' ? "bg-va-black text-white" : "bg-va-off-white text-va-black/50"
                )}
              >
                Gesloten ({conversationCounters.archived})
              </button>
              <button
                onClick={() => setListFilter('all')}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
                  listFilter === 'all' ? "bg-va-black text-white" : "bg-va-off-white text-va-black/50"
                )}
              >
                Alles ({conversations.length})
              </button>
            </ContainerInstrument>

            <ContainerInstrument className="flex items-center gap-2">
              <ContainerInstrument className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-va-black/30" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek gesprek..."
                  className="w-full bg-va-off-white rounded-full pl-9 pr-3 py-2 text-xs border-none outline-none focus:ring-2 focus:ring-primary/20"
                />
              </ContainerInstrument>
              <button
                onClick={() => setSortMode((prev) => (prev === 'hot' ? 'latest' : 'hot'))}
                className={cn(
                  "h-8 px-2 rounded-full transition-all flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold",
                  sortMode === 'hot'
                    ? "bg-orange-500/10 text-orange-600"
                    : "bg-va-off-white text-va-black/50"
                )}
                title="Sorteer op hot score of recent"
              >
                {sortMode === 'hot' ? <Flame size={12} /> : <ArrowUpDown size={12} />}
                {sortMode === 'hot' ? 'Hot' : 'Recent'}
              </button>
              <button
                onClick={() => fetchConversations({ silent: true })}
                className="w-8 h-8 rounded-full bg-va-off-white hover:bg-va-black hover:text-white transition-all flex items-center justify-center"
                title="Ververs gesprekken"
              >
                <RefreshCw size={13} className={cn(isRefreshing && "animate-spin")} />
              </button>
            </ContainerInstrument>

            {metrics && (
              <ContainerInstrument className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold uppercase tracking-wider">
                  API p95 {Math.round(metrics.api.last_5m.p95_ms)}ms
                </span>
                <span className="text-[9px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 font-bold uppercase tracking-wider">
                  SSE p95 {Math.round(metrics.sse.last_5m.p95_ms)}ms
                </span>
                <span className="text-[9px] px-2 py-1 rounded-full bg-va-black/5 text-va-black/60 font-bold uppercase tracking-wider">
                  Error {metrics.api.last_5m.error_rate_pct}%
                </span>
              </ContainerInstrument>
            )}

            <ContainerInstrument className="flex items-center justify-between gap-2 flex-wrap">
              <ContainerInstrument className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={toggleSelectAllVisible}
                  className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-va-off-white text-va-black/60"
                >
                  {visibleConversations.length > 0 && visibleConversations.every((conversation) => bulkSelectedIds.includes(conversation.id))
                    ? 'Deselecteer zichtbaar'
                    : 'Selecteer zichtbaar'}
                </button>
                {bulkSelectedIds.length > 0 && (
                  <button
                    onClick={() => setBulkSelectedIds([])}
                    className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-va-black text-white"
                  >
                    Wis selectie ({bulkSelectedIds.length})
                  </button>
                )}
              </ContainerInstrument>
              <TextInstrument className="text-[9px] uppercase tracking-widest text-va-black/40 inline-flex items-center gap-1">
                <Keyboard size={11} />
                / zoeken · j/k navigeren · a/x/r status
              </TextInstrument>
            </ContainerInstrument>

            {bulkSelectedIds.length > 0 && (
              <ContainerInstrument className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => bulkUpdateStatus('admin_active')}
                  className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-primary/10 text-primary"
                >
                  Overnemen
                </button>
                <button
                  onClick={() => bulkUpdateStatus('archived')}
                  className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-orange-500/10 text-orange-600"
                >
                  Sluiten
                </button>
                <button
                  onClick={() => bulkUpdateStatus('open')}
                  className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-700"
                >
                  Heropenen
                </button>
              </ContainerInstrument>
            )}

            {listError && (
              <TextInstrument className="text-[10px] text-red-500 font-semibold tracking-wide">
                {listError}
              </TextInstrument>
            )}
          </ContainerInstrument>

          {visibleConversations.length === 0 ? (
            <div className="p-10 text-center opacity-20">
              <MessageCircle size={48} className="mx-auto mb-4" />
              <p className="text-sm uppercase tracking-widest font-bold">Geen gesprekken gevonden</p>
            </div>
          ) : (
            visibleConversations.map((conv) => (
              <ContainerInstrument
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedId(conv.id);
                  }
                }}
                className={cn(
                  "w-full p-4 border-b border-black/5 text-left hover:bg-va-off-white transition-all flex flex-col gap-2 cursor-pointer",
                  selectedId === conv.id && "bg-va-off-white border-l-4 border-l-primary"
                )}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleBulkSelection(conv.id);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                        bulkSelectedIds.includes(conv.id)
                          ? "bg-primary/10 text-primary"
                          : "bg-va-black/5 text-va-black/40"
                      )}
                      aria-label={bulkSelectedIds.includes(conv.id) ? "Deselecteer gesprek" : "Selecteer gesprek"}
                    >
                      {bulkSelectedIds.includes(conv.id) ? <CheckSquare2 size={12} /> : <Square size={12} />}
                    </button>
                    <ContainerInstrument className="w-8 h-8 rounded-full bg-va-black/5 flex items-center justify-center shrink-0">
                      <User size={14} className="text-va-black/40" />
                    </ContainerInstrument>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate">
                        {conv.guest_name || `Klant #${conv.id}`}
                      </span>
                      {conv.guest_email && (
                        <span className="text-[10px] text-va-black/40 truncate">
                          {conv.guest_email}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] opacity-40 font-medium shrink-0">
                    {(() => {
                      if (!conv.updated_at) return "Onbekend";
                      const date = new Date(conv.updated_at);
                      if (isNaN(date.getTime())) return "Ongeldige datum";
                      return formatDistanceToNow(date, { addSuffix: true, locale: nl });
                    })()}
                  </span>
                </div>

                <ContainerInstrument className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                      conv.status === 'admin_active'
                        ? "bg-primary/10 text-primary"
                        : conv.status === 'archived'
                          ? "bg-va-black/10 text-va-black/50"
                          : "bg-emerald-500/10 text-emerald-600"
                    )}
                  >
                    {conv.status === 'admin_active' ? 'In Regie' : conv.status === 'archived' ? 'Gesloten' : 'Open'}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-va-black/5 text-va-black/50">
                    #{conv.id}
                  </span>
                  {conv.iap_context?.journey && (
                    <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full font-bold uppercase tracking-wider">
                      {conv.iap_context.journey}
                    </span>
                  )}
                  {sortMode === 'hot' && getHotScore(conv) >= 70 && (
                    <span className="text-[9px] px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1">
                      <Flame size={10} />
                      Hot
                    </span>
                  )}
                </ContainerInstrument>

                {conv.lastMessage && (
                  <TextInstrument className="text-[11px] text-va-black/50 leading-relaxed line-clamp-2">
                    {conv.lastMessage}
                  </TextInstrument>
                )}
              </ContainerInstrument>
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
              <ContainerInstrument className="px-4 py-3 bg-white border-b border-black/5 flex items-center justify-between gap-2">
                <ContainerInstrument className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider",
                      selectedConversation?.status === 'admin_active'
                        ? "bg-primary/10 text-primary"
                        : selectedConversation?.status === 'archived'
                          ? "bg-va-black/10 text-va-black/50"
                          : "bg-emerald-500/10 text-emerald-600"
                    )}
                  >
                    {selectedConversation?.status === 'admin_active'
                      ? 'In Regie'
                      : selectedConversation?.status === 'archived'
                        ? 'Gesloten'
                        : 'Open'}
                  </span>
                  <TextInstrument className="text-[11px] text-va-black/50">
                    {selectedConversation?.message_count || messages.length} berichten
                  </TextInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[10px] text-va-black/40 uppercase tracking-widest">
                  Laatste update: {selectedConversation?.updated_at ? formatDistanceToNow(new Date(selectedConversation.updated_at), { addSuffix: true, locale: nl }) : 'onbekend'}
                </TextInstrument>
              </ContainerInstrument>

              {/* Chat Messages */}
              <ContainerInstrument 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {loadingMessages && (
                  <ContainerInstrument className="flex items-center gap-2 text-va-black/40 text-xs font-semibold uppercase tracking-widest">
                    <Loader2 size={14} className="animate-spin" />
                    Gesprek laden...
                  </ContainerInstrument>
                )}

                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.sender_type === 'user' ? "mr-auto" : "ml-auto items-end"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-[20px] text-sm font-medium leading-relaxed shadow-sm relative group/msg",
                      msg.sender_type === 'user'
                        ? "bg-white text-va-black rounded-tl-none" 
                        : msg.sender_type === 'ai'
                          ? "bg-va-black text-white rounded-tr-none"
                          : "bg-primary text-white rounded-tr-none"
                    )}>
                      {msg.message}
                      
                      {/* Interaction Type Badge */}
                      {(() => {
                        const type = msg.metadata?.interaction_type || msg.attachments?.interaction_type;
                        if (!type || type === 'text') return null;
                        
                        return (
                          <div className={cn(
                            "absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm",
                            type === 'chip' ? "bg-primary text-white" : "bg-orange-500 text-white"
                          )}>
                            {type}
                          </div>
                        );
                      })()}

                      {/* Page Context */}
                      {(() => {
                        const page = msg.metadata?.current_page || msg.attachments?.current_page;
                        if (!page) return null;
                        
                        return (
                          <div className="mt-2 pt-2 border-t border-black/5 text-[9px] opacity-40 font-mono truncate max-w-full">
                            📍 {page}
                          </div>
                        );
                      })()}
                    </div>
                    <span className="text-[9px] mt-1 opacity-30 font-bold uppercase tracking-widest">
                      {msg.sender_type === 'ai' ? 'Voicy' : msg.sender_type === 'user' ? 'Klant' : 'Admin'} • {(() => {
                        if (!msg.created_at) return "N/A";
                        const date = new Date(msg.created_at);
                        if (isNaN(date.getTime())) return "N/A";
                        return date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
                      })()}
                    </span>
                  </div>
                ))}
              </ContainerInstrument>

              {/* Reply Input */}
              <div className="p-4 bg-white border-t border-black/5">
                <form 
                  onSubmit={handleReplySubmit}
                  className="flex gap-2"
                >
                  <input 
                    ref={replyInputRef}
                    name="reply"
                    type="text" 
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder="Typ je antwoord..." 
                    disabled={sendingReply || selectedConversation?.status === 'archived'}
                    className="flex-1 px-4 py-2 bg-va-off-white rounded-full text-sm border-none focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <ButtonInstrument
                    type="submit"
                    disabled={sendingReply || !replyDraft.trim() || selectedConversation?.status === 'archived'}
                    className="bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2 rounded-full disabled:opacity-40"
                  >
                    {sendingReply ? (
                      <ContainerInstrument className="inline-flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin" />
                        Verzenden...
                      </ContainerInstrument>
                    ) : (
                      "Verstuur"
                    )}
                  </ButtonInstrument>
                </form>
              </div>

              {/* Quick Actions */}
              <div className="p-4 bg-white border-t border-black/5 flex gap-2 overflow-x-auto no-scrollbar">
                <ButtonInstrument 
                  onClick={() => selectedId && updateConversationStatus(selectedId, 'admin_active')}
                  disabled={!selectedId || statusUpdatingId === selectedId || selectedConversation?.status === 'archived'}
                  className={cn(
                    "whitespace-nowrap text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full flex items-center gap-2 transition-all",
                    selectedConversation?.status === 'admin_active' 
                      ? "bg-primary text-white scale-105" 
                      : "bg-va-black text-white hover:bg-va-black/80",
                    statusUpdatingId === selectedId && "opacity-50"
                  )}
                >
                  <Zap size={12} className={cn(selectedConversation?.status === 'admin_active' ? "text-white" : "text-primary")} /> 
                  {selectedConversation?.status === 'admin_active' ? "In Regie" : "Overnemen"}
                </ButtonInstrument>

                {selectedConversation?.status === 'admin_active' && (
                  <ButtonInstrument 
                    onClick={() => selectedId && updateConversationStatus(selectedId, 'open')}
                    disabled={statusUpdatingId === selectedId}
                    className="whitespace-nowrap bg-green-500 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full flex items-center gap-2 hover:bg-green-600 transition-all disabled:opacity-40"
                  >
                    <Bot size={12} className="text-white" /> Vrijgeven aan Voicy
                  </ButtonInstrument>
                )}

                {selectedConversation?.status === 'archived' ? (
                  <ButtonInstrument
                    onClick={() => selectedId && updateConversationStatus(selectedId, 'open')}
                    disabled={statusUpdatingId === selectedId}
                    className="whitespace-nowrap bg-blue-500 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-40"
                  >
                    <RotateCcw size={12} className="text-white" /> Heropen gesprek
                  </ButtonInstrument>
                ) : (
                  <ButtonInstrument
                    onClick={() => selectedId && updateConversationStatus(selectedId, 'archived')}
                    disabled={statusUpdatingId === selectedId}
                    className="whitespace-nowrap bg-orange-500 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full flex items-center gap-2 hover:bg-orange-600 transition-all disabled:opacity-40"
                  >
                    <Archive size={12} className="text-white" /> Sluit gesprek
                  </ButtonInstrument>
                )}
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
