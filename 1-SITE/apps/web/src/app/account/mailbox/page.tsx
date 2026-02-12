"use client";

import { EmailComposerInstrument } from '@/components/mailbox/EmailComposerInstrument';
import { EmailListItemInstrument } from '@/components/mailbox/EmailListItemInstrument';
import { EmailThreadViewInstrument } from '@/components/mailbox/EmailThreadViewInstrument';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, LoadingScreenInstrument, SectionInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useHotkeys } from '@/hooks/useHotkeys';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Brain, Download, FileText, Hash, History, Lock, Mail, MessageSquare, MessageSquareQuote, Mic, Plus, RefreshCw, Search, ShieldCheck, TrendingUp, X, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type MailboxTab = 'inbox' | 'insights' | 'faq';

/**
 * ⚡ MAILBOX PAGE (GOD MODE 2026)
 */
export default function MailboxPage() {
  const { isAdmin, isLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [mails, setMails] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFolder, setActiveFolder] = useState('INBOX');
  const [activeAccount, setActiveAccount] = useState('johfrah@voices.be');
  const [activeTab, setActiveTab] = useState<MailboxTab>('inbox');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [sortByValue, setSortByValue] = useState(false);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [customerDna, setCustomerDna] = useState<any>(null);
  const [projectDna, setProjectDna] = useState<any>(null);
  const [faqProposals, setFaqProposals] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [isFaqLoading, setIsFaqLoading] = useState(false);
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isComposing, setIsComposing] = useState(false);
  const [composerDefaults, setComposerDefaults] = useState({ to: '', subject: '', body: '' });
  const [spotlightFile, setSpotlightFile] = useState<any>(null);

  const t_inbox = t('mailbox.folder.inbox', 'Inbox');
  const t_archive = t('mailbox.folder.archive', 'Archive');
  const t_sent = t('mailbox.folder.sent', 'Sent');
  const t_trash = t('mailbox.folder.trash', 'Trash');
  const t_vault = t('mailbox.folder.vault', 'The Vault');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/account');
    }
  }, [isAdmin, isLoading, router]);

  const fetchInsights = React.useCallback(async () => {
    setIsInsightsLoading(true);
    try {
      const res = await fetch(`/api/mailbox/insights?startDate=${dateRange.start}&endDate=${dateRange.end}&compare=${compareWithPrevious}`);
      if (res.ok) setInsights(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsInsightsLoading(false); }
  }, [dateRange.start, dateRange.end, compareWithPrevious]);

  const fetchFaqProposals = React.useCallback(async () => {
    setIsFaqLoading(true);
    try {
      const res = await fetch(`/api/mailbox/faq-proposals?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (res.ok) setFaqProposals(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsFaqLoading(false); }
  }, [dateRange.start, dateRange.end]);

  const fetchCustomerDna = React.useCallback(async (userId: number) => {
    try {
      const res = await fetch(`/api/mailbox/customer-dna/${userId}`);
      if (res.ok) setCustomerDna(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchProjectDna = React.useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/mailbox/project-dna/${projectId}`);
      if (res.ok) setProjectDna(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const updateThreadBody = (threadId: string, htmlBody: string, isSuperPrivate: boolean, attachments?: any[]) => {
    setSelectedThread((prev: any) => {
      if (!prev || prev.id !== threadId) return prev;
      return {
        ...prev,
        messages: [{
          ...prev.messages[0],
          htmlBody,
          isSuperPrivate,
          attachments: attachments || []
        }]
      };
    });
  };

  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [draftMethod, setDraftMethod] = useState<string | null>(null);

  const generateAiDraft = async (mailId: number) => {
    setIsDrafting(true);
    setDraftMethod(null);
    try {
      const res = await fetch('/api/mailbox/shadow-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mailId })
      });
      if (res.ok) {
        const data = await res.json();
        setAiDraft(data.draft);
        setDraftMethod(data.method);
        setComposerDefaults(prev => ({
          ...prev,
          body: data.draft.replace(/\n/g, '<br>')
        }));
        setIsComposing(true);
      }
    } catch (e) {
      console.error('AI Draft failed:', e);
    } finally {
      setIsDrafting(false);
    }
  };

  const [timeTravelContext, setTimeTravelContext] = useState<any>(null);

  const fetchTimeTravelContext = async (userId: number) => {
    try {
      const res = await fetch(`/api/mailbox/time-travel/${userId}`);
      if (res.ok) setTimeTravelContext(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleMailClick = React.useCallback(async (mail: any) => {
    setSelectedThread({
      id: mail.threadId,
      subject: mail.subject,
      messages: [{
        id: mail.id,
        sender: mail.sender,
        senderEmail: mail.sender, 
        date: mail.date,
        htmlBody: mail.preview || "",
        isSuperPrivate: true,
        attachments: []
      }]
    });

    if (mail.iapContext?.userId) {
      // Check of de userId van de afzender niet de eigenaar van de mailbox is
      const isOwner = mail.sender.toLowerCase().includes(activeAccount.toLowerCase());
      
      if (isOwner && mail.recipient) {
        // Als de eigenaar de afzender is, probeer de DNA van de ontvanger te vinden
        const recipientEmail = mail.recipient.replace(/.*<(.+)>$/, '$1').toLowerCase().trim();
        try {
          const res = await fetch(`/api/mailbox/customer-dna/search?email=${encodeURIComponent(recipientEmail)}`);
          if (res.ok) {
            const data = await res.json();
            setCustomerDna(data);
            if (data.user?.id) fetchTimeTravelContext(data.user.id);
          } else {
            setCustomerDna(null);
            setTimeTravelContext(null);
          }
        } catch (e) { console.error(e); }
      } else {
        fetchCustomerDna(mail.iapContext.userId);
        fetchTimeTravelContext(mail.iapContext.userId);
      }
    } else {
      setCustomerDna(null);
      setTimeTravelContext(null);
    }

    const mailContext = (mail.subject + ' ' + (mail.preview || '')).toLowerCase();
    const projectMatch = mailContext.match(/\b(\d{6})\b/);
    if (projectMatch) fetchProjectDna(projectMatch[1]);
    else setProjectDna(null);

    try {
      const res = await fetch(`/api/mailbox/message/${mail.id}`);
      if (res.ok) {
        const threadData = await res.json();
        setSelectedThread(threadData);
      }
    } catch (e) { console.error(e); }
  }, [fetchCustomerDna, fetchProjectDna, activeAccount]);

  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});

  const refreshInbox = React.useCallback(async (reset = true, autoOpenFirst = false, folder = activeFolder, account = activeAccount) => {
    setIsRefreshing(true);
    if (reset) {
      setActiveFolder(folder);
      setActiveAccount(account);
      setActiveTab('inbox');
      setOffset(0);
    }
    const currentOffset = reset ? 0 : offset;
    try {
      const res = await fetch(`/api/mailbox/inbox?limit=50&offset=${currentOffset}&folder=${folder}&account=${account}&sortByValue=${sortByValue}`);
      if (res.ok) {
        const data = await res.json();
        setTotalCount(data.totalCount);
        
        // Update folder counts dynamically
        if (reset) {
          setFolderCounts(prev => ({
            ...prev,
            [folder]: data.totalCount
          }));
          setMails(data.mails);
          setOffset(data.mails.length);
          if (autoOpenFirst && data.mails.length > 0) {
            setSelectedIndex(0);
            handleMailClick(data.mails[0]);
          }
        } else {
          setMails(prev => [...prev, ...data.mails]);
          setOffset(prev => prev + data.mails.length);
        }
        setHasMore(data.mails.length === 50);
      }
    } catch (error) {
      console.error('📬 Mailbox Error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeFolder, activeAccount, offset, sortByValue, handleMailClick]);

  const startFullSync = async () => {
    setIsSyncing(true);
    try {
      fetch('/api/mailbox/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'INBOX.Archive', limit: 10 })
      }).then(res => res.json()).then(data => {
        console.log('🧠 AI Sync Result:', data.message);
      });
    } catch (e) {
      console.error('🧠 AI Sync Error:', e);
    }

    setSyncProgress({ current: 0, total: 153460 });
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev.current >= prev.total) {
          clearInterval(interval);
          setIsSyncing(false);
          return prev;
        }
        return { ...prev, current: prev.current + Math.floor(Math.random() * 1200) + 300 };
      });
    }, 800);
  };

  useEffect(() => {
    if (isAdmin) {
      refreshInbox(true, true, activeFolder, activeAccount);
      
      // Pre-fetch counts for other folders
      ['INBOX', 'INBOX.Archive', 'Sent', 'Trash'].forEach(f => {
        if (f !== activeFolder) {
          fetch(`/api/mailbox/inbox?limit=1&offset=0&folder=${f}&account=${activeAccount}`)
            .then(res => res.json())
            .then(data => {
              setFolderCounts(prev => ({ ...prev, [f]: data.totalCount }));
            });
        }
      });
    }
  }, [isAdmin, refreshInbox, activeAccount, activeFolder]);

  useEffect(() => {
    if (isAdmin) {
      fetchInsights();
      fetchFaqProposals();
    }
  }, [isAdmin, dateRange, compareWithPrevious, fetchInsights, fetchFaqProposals]);

  const handleArchiveMail = async (id: number) => {
    // Optimistic Update: Verwijder direct uit de lijst
    const originalMails = [...mails];
    const originalTotal = totalCount;
    
    setMails(prev => prev.filter(m => m.id !== id.toString() && m.id !== id));
    setTotalCount(prev => Math.max(0, prev - 1));

    try {
      const response = await fetch(`/api/mailbox/archive/${id}`, { method: 'POST' });
      if (!response.ok) throw new Error('Archive failed');
      // Succes! Geen actie nodig, UI is al bijgewerkt.
    } catch (e) {
      console.error('❌ Archive failed, rolling back:', e);
      setMails(originalMails);
      setTotalCount(originalTotal);
    }
  };

  const handleCloseThread = () => setSelectedThread(null);
  const handleCompose = () => {
    setComposerDefaults({ to: '', subject: '', body: '' });
    setIsComposing(true);
  };

  const handleReply = (message: any) => {
    setComposerDefaults({
      to: message.senderEmail,
      subject: `Re: ${selectedThread.subject}`,
      body: `<br><br>Op ${new Date(message.date).toLocaleString()} schreef ${message.sender}:<br><blockquote>${message.htmlBody}</blockquote>`
    });
    setIsComposing(true);
  };

  const handleSendEmail = async (data: { to: string; subject: string; body: string }) => {
    try {
      const response = await fetch('/api/mailbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) setIsComposing(false);
    } catch (e) { console.error(e); }
  };

  useHotkeys({
    'j': () => {
      setSelectedIndex(prev => {
        const next = Math.min(prev + 1, mails.length - 1);
        const el = document.getElementById(`mail-item-${next}`);
        el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return next;
      });
    },
    'k': () => {
      setSelectedIndex(prev => {
        const next = Math.max(prev - 1, 0);
        const el = document.getElementById(`mail-item-${next}`);
        el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return next;
      });
    },
    'enter': () => {
      if (selectedIndex >= 0 && mails[selectedIndex]) {
        handleMailClick(mails[selectedIndex]);
      }
    },
    'escape': () => {
      if (selectedThread) handleCloseThread();
      else if (activeTab !== 'inbox') setActiveTab('inbox');
      setIsComposing(false);
    },
    'c': () => handleCompose(),
    'r': () => {
      if (selectedThread && selectedThread.messages?.[0]) {
        handleReply(selectedThread.messages[0]);
      }
    },
    'f': () => {
      if (selectedThread && selectedThread.messages?.[0]) {
        setComposerDefaults({
          to: '',
          subject: `Fwd: ${selectedThread.subject}`,
          body: `<br><br>--- Doorgestuurd bericht ---<br>${selectedThread.messages[0].htmlBody}`
        });
        setIsComposing(true);
      }
    },
    'e': () => {
      if (selectedIndex >= 0 && mails[selectedIndex]) {
        handleArchiveMail(mails[selectedIndex].id);
      }
    }
  });

  if (isLoading) return <LoadingScreenInstrument />;
  if (!isAdmin) return null;

  return (
    <SectionInstrument className="fixed inset-0 z-30 bg-white flex flex-col pt-4 overflow-hidden h-screen">
      <ContainerInstrument className="flex-grow flex flex-col px-6 pb-6 max-w-none min-h-0">
          
          <ContainerInstrument className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4 flex-shrink-0">
            <ContainerInstrument className="space-y-4">
              <ButtonInstrument onClick={() => router.push('/account')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/40 hover:text-primary transition-colors">
                <ArrowLeft size={14} />
                <VoiceglotText translationKey="common.back" defaultText="Terug" />
              </ButtonInstrument>
              <HeadingInstrument level={1} className="text-6xl font-black uppercase tracking-tighter">
                <VoiceglotText translationKey="mailbox.title" defaultText="Mailbox" />
              </HeadingInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="flex items-center gap-4">
              {isSyncing && (
                <div className="flex items-center gap-3 bg-va-black/5 px-4 py-2 rounded-2xl border border-va-black/10">
                  <div className="flex flex-col items-end">
                    <TextInstrument as="span" className="text-[8px] font-black uppercase tracking-tighter text-va-black/40">
                      <VoiceglotText translationKey="mailbox.sync.status" defaultText="AI Brain Syncing" />
                    </TextInstrument>
                    <span className="text-[10px] font-mono font-bold">{syncProgress.current.toLocaleString()} / {syncProgress.total.toLocaleString()}</span>
                  </div>
                  <div className="w-20 h-1.5 bg-va-black/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-va-black"
                      initial={{ width: 0 }}
                      animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <ButtonInstrument 
                onClick={startFullSync}
                disabled={isSyncing}
                className="bg-va-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Brain size={14} className={isSyncing ? 'animate-pulse' : ''} />
                <VoiceglotText translationKey="mailbox.ai_sync" defaultText={isSyncing ? "Syncing..." : "Start AI Brain Sync"} />
              </ButtonInstrument>
              <ButtonInstrument onClick={handleCompose} className="bg-white text-va-black border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                <Plus size={14} />
                <VoiceglotText translationKey="mailbox.compose" defaultText="Nieuw bericht" />
              </ButtonInstrument>
              <ButtonInstrument 
                onClick={() => setSortByValue(!sortByValue)}
                className={`p-3 rounded-2xl border transition-all ${sortByValue ? 'bg-va-black text-white border-va-black' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                title="Sorteer op commerciële waarde"
              >
                <TrendingUp size={16} />
              </ButtonInstrument>
              <ButtonInstrument onClick={() => refreshInbox()} disabled={isRefreshing} className={`p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`} title="Synchroniseren">
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 flex-grow min-h-0 gap-2">
            <ContainerInstrument className="w-64 flex-shrink-0 border-r border-gray-100 pr-2 min-h-0 bg-va-off-white border border-black/[0.03] p-8 flex flex-col justify-between">
              <ContainerInstrument className="space-y-8 h-full overflow-y-auto custom-scrollbar">
                <ContainerInstrument className="space-y-4">
                  <div className="px-2">
                    <select 
                      value={activeAccount}
                      onChange={(e) => refreshInbox(true, true, 'INBOX', e.target.value)}
                      className="w-full bg-va-black text-white text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-2xl shadow-lg focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer border-none"
                    >
                      <option value="all">📬 {t('mailbox.accounts.all', 'Alle Accounts')}</option>
                      <option value="johfrah@voices.be">Voices.be</option>
                      <option value="info@johfrah.be">Johfrah.be</option>
                    </select>
                  </div>
                </ContainerInstrument>

                <ContainerInstrument className="relative mb-4">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20 text-gray-400" />
                  <InputInstrument type="text" placeholder="Zoek..." className="w-full bg-white border border-black/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all py-2.5 text-sm bg-gray-50/50 border-none rounded-2xl focus:ring-2 focus:ring-va-black/5" />
                </ContainerInstrument>
                
                <ContainerInstrument className="space-y-4">
                  <HeadingInstrument level={4} className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 px-2">
                    <VoiceglotText translationKey="mailbox.folders" defaultText="Folders" />
                  </HeadingInstrument>
                  <ContainerInstrument className="space-y-1.5">
                    {[
                      { name: t_inbox, id: 'INBOX' },
                      { name: t_archive, id: 'INBOX.Archive' },
                      { name: t_sent, id: 'Sent' },
                      { name: t_trash, id: 'Trash' },
                      { name: t_vault, id: 'vault', onClick: () => router.push('/admin/vault') },
                    ].map((folder: any) => {
                      const isSelected = activeFolder === folder.id;
                      const displayCount = folderCounts[folder.id] || 0;
                      
                      return (
                        <ButtonInstrument 
                          key={folder.id} 
                          onClick={folder.onClick || (() => refreshInbox(true, false, folder.id))} 
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${isSelected ? 'bg-white shadow-sm ring-1 ring-black/5 font-bold text-va-black' : 'text-gray-500 hover:text-va-black hover:bg-gray-50'}`}
                        >
                          {folder.name}
                          {displayCount > 0 && <TextInstrument as="span" className="text-xs font-mono opacity-50">{displayCount.toLocaleString()}</TextInstrument>}
                        </ButtonInstrument>
                      );
                    })}
                  </ContainerInstrument>
                </ContainerInstrument>

                <ContainerInstrument className="space-y-4">
                  <HeadingInstrument level={4} className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 px-2">
                    <VoiceglotText translationKey="mailbox.intelligence" defaultText="Intelligence" />
                  </HeadingInstrument>
                  <ContainerInstrument className="space-y-1.5">
                    {[
                      { name: 'Trends & SWOT', id: 'insights', icon: <TrendingUp size={16} /> },
                      { name: 'FAQ Proposals', id: 'faq', icon: <MessageSquare size={16} /> },
                      { name: 'Kansen', id: 'leads', icon: <AlertCircle size={16} /> },
                    ].map((tag) => (
                      <ButtonInstrument key={tag.id} onClick={() => { if (tag.id === 'insights' || tag.id === 'faq') { setActiveTab(tag.id as MailboxTab); setSelectedThread(null); } }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === tag.id ? 'bg-white shadow-sm ring-1 ring-black/5 font-bold text-va-black' : 'text-gray-500 hover:text-va-black hover:bg-gray-50'}`}>
                        {tag.icon}
                        <VoiceglotText translationKey={`mailbox.tag.${tag.id}`} defaultText={tag.name} />
                      </ButtonInstrument>
                    ))}
                  </ContainerInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className={`bg-white shadow-aura p-0 overflow-hidden flex-grow relative overflow-hidden h-full min-h-0 ${selectedThread || activeTab !== 'inbox' ? 'flex gap-0' : ''}`}>
              <AnimatePresence mode="wait">
                {activeTab === 'inbox' && !selectedThread ? (
                  <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full overflow-y-auto custom-scrollbar">
                    <ContainerInstrument className="space-y-px">
                      {mails.map((mail, index) => (
                        <EmailListItemInstrument 
                          key={mail.id} 
                          id={`mail-item-${index}`}
                          mail={mail} 
                          isSelected={selectedIndex === index} 
                          isSemanticResult={mail.isSemanticResult}
                          similarity={mail.similarity}
                          onClick={() => { setSelectedIndex(index); handleMailClick(mail); }} 
                          onArchive={() => handleArchiveMail(mail.id)} 
                        />
                      ))}
                      {hasMore && !isRefreshing && (
                        <ButtonInstrument onClick={() => refreshInbox(false)} className="w-full py-8 text-[10px] font-black uppercase tracking-widest text-va-black/20 hover:text-va-black transition-all">
                          Laad meer berichten
                        </ButtonInstrument>
                      )}
                      {isRefreshing && (
                        <ContainerInstrument className="w-full py-8 flex flex-col items-center gap-3">
                          <RefreshCw size={20} className="animate-spin text-va-black/20" />
                          <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-va-black/20">
                            <VoiceglotText translationKey="common.loading" defaultText="Laden..." />
                          </TextInstrument>
                        </ContainerInstrument>
                      )}
                    </ContainerInstrument>
                  </motion.div>
                ) : activeTab === 'insights' ? (
                    <motion.div key="insights" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full p-6 space-y-6 overflow-y-auto custom-scrollbar">
                      <ContainerInstrument className="flex justify-between items-end border-b border-gray-100 pb-4">
                        <ContainerInstrument>
                          <HeadingInstrument level={2} className="text-2xl font-black tracking-tight text-gray-900">
                            <VoiceglotText translationKey="mailbox.insights.title" defaultText="Insights" />
                          </HeadingInstrument>
                          <TextInstrument className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            <VoiceglotText translationKey="mailbox.insights.subtitle" defaultText="Trends & Sentiment" />
                          </TextInstrument>
                        </ContainerInstrument>
                        <ContainerInstrument className="flex items-center gap-3">
                          <ButtonInstrument 
                            onClick={() => setCompareWithPrevious(!compareWithPrevious)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${compareWithPrevious ? 'bg-va-black text-white border-va-black' : 'bg-white text-gray-400 border-gray-100'}`}
                          >
                            {compareWithPrevious ? 'Trendanalyse AAN' : 'Trendanalyse UIT'}
                          </ButtonInstrument>
                          <ContainerInstrument className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1">
                            <input 
                              type="date" 
                              value={dateRange.start} 
                              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                              className="bg-transparent text-[10px] font-bold outline-none"
                            />
                            <span className="text-[10px] font-black text-gray-300">→</span>
                            <input 
                              type="date" 
                              value={dateRange.end} 
                              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                              className="bg-transparent text-[10px] font-bold outline-none"
                            />
                          </ContainerInstrument>
                          <ButtonInstrument onClick={() => setActiveTab('inbox')} className="text-[10px] font-black uppercase tracking-widest text-va-black hover:underline">
                            <VoiceglotText translationKey="mailbox.back_to_inbox" defaultText="Terug naar Inbox" />
                          </ButtonInstrument>
                        </ContainerInstrument>
                      </ContainerInstrument>
                      {isInsightsLoading ? (
                      <ContainerInstrument className="animate-pulse space-y-6">
                        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ContainerInstrument className="h-48 bg-gray-100 rounded-[24px]" />
                          <ContainerInstrument className="h-48 bg-gray-100 rounded-[24px]" />
                        </ContainerInstrument>
                        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {[1, 2, 3, 4].map(i => (
                            <ContainerInstrument key={i} className="h-32 bg-gray-100 rounded-[20px]" />
                          ))}
                        </ContainerInstrument>
                      </ContainerInstrument>
                    ) : insights ? (
                        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ContainerInstrument className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                            <HeadingInstrument level={3} className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                              <TrendingUp size={12} className="text-va-black" />
                              <VoiceglotText translationKey="mailbox.insights.trends" defaultText="Markt Trends" />
                            </HeadingInstrument>
                            <ContainerInstrument className="space-y-3">
                              {insights.trends.map((trend: any, i: number) => (
                                <ContainerInstrument 
                                  key={i} 
                                  onClick={() => setSelectedInsight({ type: 'Trend', ...trend })}
                                  className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-va-black/10"
                                >
                                  <div className="flex justify-between items-center mb-0.5">
                                    <TextInstrument className="text-[13px] font-bold">{trend.label}</TextInstrument>
                                    <TextInstrument className={`text-[13px] font-black ${trend.status === 'up' ? 'text-green-600' : 'text-red-500'}`}>{trend.change}</TextInstrument>
                                  </div>
                                  {trend.explanation && (
                                    <TextInstrument className="text-[10px] text-gray-400 leading-tight">{trend.explanation}</TextInstrument>
                                  )}
                                </ContainerInstrument>
                              ))}
                            </ContainerInstrument>
                          </ContainerInstrument>
                          <ContainerInstrument className="bg-va-black text-white p-5 rounded-[24px] shadow-xl">
                            <HeadingInstrument level={3} className="text-[9px] font-black uppercase tracking-widest text-va-white/40 mb-4 flex items-center gap-2">
                              <Brain size={12} className="text-va-white" />
                              <VoiceglotText translationKey="mailbox.insights.sentiment" defaultText="Sentiment" />
                            </HeadingInstrument>
                            <ContainerInstrument className="text-center py-2">
                              <ContainerInstrument className="text-4xl font-black mb-1">{insights.sentiment.score}</ContainerInstrument>
                              <TextInstrument className="text-[11px] font-bold uppercase tracking-widest text-va-white/60">{insights.sentiment.label}</TextInstrument>
                            </ContainerInstrument>
                            {insights.comparisonSummary && (
                              <ContainerInstrument className="mt-1 mb-3 p-2.5 bg-va-white/5 rounded-xl border border-va-white/10">
                                <TextInstrument className="text-[10px] font-medium text-va-white/80 leading-relaxed italic">
                                  &quot;{insights.comparisonSummary}&quot;
                                </TextInstrument>
                              </ContainerInstrument>
                            )}
                            <ContainerInstrument className="mt-4 space-y-2">
                              <ContainerInstrument 
                                onClick={() => setSelectedInsight({ type: 'Sentiment Positief', ...insights.sentiment.topPositive })}
                                className="p-2.5 bg-va-white/10 rounded-xl border border-va-white/5 cursor-pointer hover:bg-va-white/20 transition-all"
                              >
                                <TextInstrument className="text-[8px] uppercase font-black text-green-400 mb-0.5">
                                  <VoiceglotText translationKey="mailbox.insights.positive" defaultText="Top Positief" />
                                </TextInstrument>
                                <TextInstrument className="text-[11px] font-bold">{insights.sentiment.topPositive.text || insights.sentiment.topPositive}</TextInstrument>
                              </ContainerInstrument>
                              <ContainerInstrument 
                                onClick={() => setSelectedInsight({ type: 'Sentiment Negatief', ...insights.sentiment.topNegative })}
                                className="p-2.5 bg-va-white/10 rounded-xl border border-va-white/5 cursor-pointer hover:bg-va-white/20 transition-all"
                              >
                                <TextInstrument className="text-[8px] uppercase font-black text-red-400 mb-0.5">
                                  <VoiceglotText translationKey="mailbox.insights.negative" defaultText="Top Negatief" />
                                </TextInstrument>
                                <TextInstrument className="text-[11px] font-bold">{insights.sentiment.topNegative.text || insights.sentiment.topNegative}</TextInstrument>
                              </ContainerInstrument>
                            </ContainerInstrument>
                          </ContainerInstrument>
                          <ContainerInstrument className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-3">
                            {Object.entries(insights.swot).map(([key, items]: [string, any]) => (
                              <ContainerInstrument key={key} className="bg-white p-4 rounded-[20px] border border-gray-100">
                                <HeadingInstrument level={4} className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">{key}</HeadingInstrument>
                                <ContainerInstrument as="ul" className="space-y-1.5">
                                  {items.map((item: any, i: number) => (
                                    <ContainerInstrument 
                                      as="li" 
                                      key={i} 
                                      onClick={() => setSelectedInsight({ type: key, ...item })}
                                      className="text-[11px] font-bold leading-tight flex gap-2 cursor-pointer hover:text-va-black transition-colors"
                                    >
                                      <TextInstrument as="span" className="text-va-black">•</TextInstrument>{item.text || item}
                                    </ContainerInstrument>
                                  ))}
                                </ContainerInstrument>
                              </ContainerInstrument>
                            ))}
                          </ContainerInstrument>
                        </ContainerInstrument>
                      ) : (
                        <ContainerInstrument className="animate-pulse space-y-8">
                          <ContainerInstrument className="h-48 bg-gray-100 rounded-[32px]" />
                          <ContainerInstrument className="h-64 bg-gray-100 rounded-[32px]" />
                        </ContainerInstrument>
                      )}
                    </motion.div>
                  ) : activeTab === 'faq' ? (
                    <motion.div key="faq" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full p-8 space-y-8 overflow-y-auto custom-scrollbar">
                      <ContainerInstrument className="flex justify-between items-end border-b border-gray-100 pb-6">
                        <ContainerInstrument>
                          <HeadingInstrument level={2} className="text-3xl font-black tracking-tight text-gray-900">
                            <VoiceglotText translationKey="mailbox.faq.title" defaultText="FAQ Proposals" />
                          </HeadingInstrument>
                          <TextInstrument className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                            <VoiceglotText translationKey="mailbox.faq.subtitle" defaultText="Extractie" />
                          </TextInstrument>
                        </ContainerInstrument>
                        <ContainerInstrument className="flex items-center gap-4">
                          <ContainerInstrument className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                            <input 
                              type="date" 
                              value={dateRange.start} 
                              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                              className="bg-transparent text-[10px] font-bold outline-none"
                            />
                            <span className="text-[10px] font-black text-gray-300">→</span>
                            <input 
                              type="date" 
                              value={dateRange.end} 
                              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                              className="bg-transparent text-[10px] font-bold outline-none"
                            />
                          </ContainerInstrument>
                          <ButtonInstrument onClick={() => setActiveTab('inbox')} className="text-[10px] font-black uppercase tracking-widest text-va-black hover:underline">
                            <VoiceglotText translationKey="mailbox.back_to_inbox" defaultText="Terug naar Inbox" />
                          </ButtonInstrument>
                        </ContainerInstrument>
                      </ContainerInstrument>
                      <ContainerInstrument className="grid grid-cols-1 gap-4">
                        {isFaqLoading ? (
                          [1, 2, 3].map((i) => (
                            <ContainerInstrument key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm animate-pulse">
                              <ContainerInstrument className="h-12 bg-gray-50 rounded-2xl w-3/4 mb-4" />
                              <ContainerInstrument className="h-20 bg-gray-50 rounded-2xl w-full" />
                            </ContainerInstrument>
                          ))
                        ) : faqProposals.length > 0 ? (
                          faqProposals.map((proposal, i) => (
                            <ContainerInstrument key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                              <ContainerInstrument className="flex justify-between items-start mb-4">
                                <ContainerInstrument className="flex items-center gap-3">
                                  <ContainerInstrument className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <MessageSquareQuote size={20} />
                                  </ContainerInstrument>
                                  <ContainerInstrument>
                                    <TextInstrument className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                      <VoiceglotText translationKey="mailbox.faq.pattern" defaultText="Patroon" /> ({proposal.frequency}x)
                                    </TextInstrument>
                                    <HeadingInstrument level={3} className="font-bold text-lg text-gray-900">{proposal.question}</HeadingInstrument>
                                  </ContainerInstrument>
                                </ContainerInstrument>
                                <ContainerInstrument className="flex gap-2">
                                  <ButtonInstrument className="px-4 py-2 bg-va-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    <VoiceglotText translationKey="mailbox.faq.add" defaultText="Toevoegen" />
                                  </ButtonInstrument>
                                  <ButtonInstrument className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    <VoiceglotText translationKey="mailbox.faq.ignore" defaultText="Negeren" />
                                  </ButtonInstrument>
                                </ContainerInstrument>
                              </ContainerInstrument>
                              <ContainerInstrument className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-sm text-gray-600">&quot;{proposal.suggestedAnswer}&quot;</ContainerInstrument>
                              <ContainerInstrument className="mt-4 flex items-center gap-4">
                                <ContainerInstrument className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                  <Brain size={12} />Confidence: {(proposal.confidence * 100).toFixed(0)}%
                                </ContainerInstrument>
                              </ContainerInstrument>
                            </ContainerInstrument>
                          ))
                        ) : (
                          <ContainerInstrument className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
                            <TextInstrument className="text-gray-400 font-bold">
                              <VoiceglotText translationKey="mailbox.faq.empty" defaultText="Geen nieuwe FAQ voorstellen gevonden." />
                            </TextInstrument>
                          </ContainerInstrument>
                        )}
                      </ContainerInstrument>
                    </motion.div>
                  ) : (
                    <motion.div key="thread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full h-full overflow-hidden min-h-0">
                      {/* 📧 List Pane (Always visible in thread view for quick switching) */}
                      <ContainerInstrument className="w-96 flex-shrink-0 border-r border-gray-100 overflow-y-auto h-full hidden lg:block custom-scrollbar">
                        <ContainerInstrument className="va-mailbox-list space-y-px">
                      {mails.map((mail, index) => (
                            <EmailListItemInstrument 
                              key={mail.id} 
                              id={`mail-item-${index}`}
                              mail={mail} 
                              isSelected={selectedThread?.id === mail.threadId} 
                              onClick={() => { setSelectedIndex(index); handleMailClick(mail); }} 
                              onArchive={() => handleArchiveMail(mail.id)} 
                            />
                          ))}
                        </ContainerInstrument>
                      </ContainerInstrument>

                      {/* 📖 Reader Pane */}
                      <ContainerInstrument className="flex-grow overflow-y-auto h-full bg-gray-50/30 custom-scrollbar">
                        <EmailThreadViewInstrument thread={selectedThread} actorId={customerDna?.actor?.id} onClose={handleCloseThread} onReply={handleReply} />
                      </ContainerInstrument>

                      {/* 👤 DNA Pane (Right) */}
                      <ContainerInstrument className="w-80 flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto h-full hidden xl:block custom-scrollbar">
                        <div className="p-6">
                          <HeadingInstrument level={4} className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <ShieldCheck size={12} className="text-va-black" />
                            <VoiceglotText translationKey="mailbox.customer_dna" defaultText="Customer DNA" />
                          </HeadingInstrument>
                          {customerDna ? (
                            <ContainerInstrument className="space-y-8">
                              <ContainerInstrument className="flex items-center gap-4">
                                {customerDna.signatureAssets?.[0] ? (
                                  <ContainerInstrument className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100">
                                    <Image 
                                      src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(customerDna.signatureAssets[0].filePath)}`} 
                                      alt="Avatar" 
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover" 
                                    />
                                  </ContainerInstrument>
                                ) : (
                                  <ContainerInstrument className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-va-black font-bold">{customerDna.user.firstName[0]}{customerDna.user.lastName?.[0]}</ContainerInstrument>
                                )}
                                <ContainerInstrument>
                                  <div className="flex items-center gap-2">
                                    <HeadingInstrument level={3} className="font-bold text-sm">{customerDna.user.firstName} {customerDna.user.lastName}</HeadingInstrument>
                                    {customerDna.actor && (
                                      <span className="text-[7px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-black uppercase tracking-widest border border-blue-100">
                                        Voice Actor
                                      </span>
                                    )}
                                  </div>
                                  <TextInstrument className="text-[10px] text-gray-500">{customerDna.user.email}</TextInstrument>
                                </ContainerInstrument>
                              </ContainerInstrument>
                              {timeTravelContext && (
                                <ContainerInstrument className={`p-4 rounded-2xl border ${timeTravelContext.sentiment === 'Attention Required' ? 'bg-red-50 border-red-100' : 'bg-va-black/5 border-va-black/5'}`}>
                                  <HeadingInstrument level={4} className="text-[10px] font-black uppercase tracking-widest text-va-black/40 mb-2 flex items-center gap-2">
                                    <History size={12} />
                                    Vibe Check: {timeTravelContext.vibe}
                                  </HeadingInstrument>
                                  <TextInstrument className="text-[11px] font-bold text-va-black">{timeTravelContext.summary}</TextInstrument>
                                  <ContainerInstrument className="mt-2 flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                      timeTravelContext.sentiment === 'Positive' ? 'bg-green-100 text-green-700' : 
                                      timeTravelContext.sentiment === 'Attention Required' ? 'bg-red-100 text-red-700' : 
                                      'bg-gray-100 text-gray-500'
                                    }`}>
                                      {timeTravelContext.sentiment}
                                    </span>
                                  </ContainerInstrument>
                                </ContainerInstrument>
                              )}
                              
                              {customerDna.actorAssignments && customerDna.actorAssignments.length > 0 && (
                                <ContainerInstrument className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl">
                                  <HeadingInstrument level={4} className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-4 flex items-center gap-2">
                                    <Mic size={12} />
                                    Assignments ({customerDna.actorAssignments.filter((a: any) => a.status === 'approved').length} voltooid)
                                  </HeadingInstrument>
                                  <ContainerInstrument className="space-y-3">
                                    {customerDna.actorAssignments.slice(0, 5).map((asg: any) => (
                                      <ContainerInstrument key={asg.id} className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                          <TextInstrument className="text-[10px] font-bold text-gray-900 truncate max-w-[120px]">{asg.name}</TextInstrument>
                                          <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                                            asg.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                            asg.status === 'waiting' ? 'bg-orange-100 text-orange-700 animate-pulse' : 
                                            'bg-gray-100 text-gray-500'
                                          }`}>
                                            {asg.status}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <TextInstrument className="text-[8px] text-gray-400 font-bold uppercase">Project #{asg.orderId}</TextInstrument>
                                          <TextInstrument className="text-[9px] font-black text-blue-600">€{asg.total}</TextInstrument>
                                        </div>
                                      </ContainerInstrument>
                                    ))}
                                    {customerDna.actorAssignments.length > 5 && (
                                      <ButtonInstrument className="w-full py-2 text-[8px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-600 transition-colors">
                                        Bekijk alle {customerDna.actorAssignments.length} projecten
                                      </ButtonInstrument>
                                    )}
                                  </ContainerInstrument>
                                </ContainerInstrument>
                              )}

                              <ContainerInstrument className="grid grid-cols-2 gap-4">
                                <ContainerInstrument className="bg-gray-50 p-3 rounded-2xl">
                                  <TextInstrument className="text-[8px] uppercase text-gray-400 font-bold mb-1"><VoiceglotText translationKey="mailbox.dna.orders" defaultText="Orders" /></TextInstrument>
                                  <TextInstrument className="font-bold text-lg">{customerDna.orders.length}</TextInstrument>
                                </ContainerInstrument>
                                <ContainerInstrument className="bg-gray-50 p-3 rounded-2xl relative overflow-hidden">
                                  {customerDna.actor && (
                                    <div className="absolute top-0 right-0 bg-va-black text-white px-1.5 py-0.5 rounded-bl-lg text-[7px] font-black uppercase tracking-tighter z-10">
                                      Actor
                                    </div>
                                  )}
                                  <TextInstrument className="text-[8px] uppercase text-gray-400 font-bold mb-1"><VoiceglotText translationKey="mailbox.dna.vault" defaultText="Vault Files" /></TextInstrument>
                                  <TextInstrument className="font-bold text-lg">{customerDna.vault.length}</TextInstrument>
                                </ContainerInstrument>
                              </ContainerInstrument>
                              {projectDna && (
                                <ContainerInstrument className="bg-va-black text-white p-4 rounded-2xl shadow-lg border border-va-black/10">
                                  <HeadingInstrument level={4} className="text-[10px] font-black uppercase tracking-widest text-va-white/60 mb-3 flex items-center gap-2"><Hash size={12} className="text-va-white" />Project DNA #{projectDna.order.wpOrderId}</HeadingInstrument>
                                  <ContainerInstrument className="space-y-4">
                                    <ContainerInstrument className="flex justify-between items-center">
                                      <TextInstrument as="span" className="text-[10px] font-bold uppercase opacity-60 text-va-white">
                                        <VoiceglotText translationKey="common.status" defaultText="Status" />
                                      </TextInstrument>
                                      <TextInstrument as="span" className="px-2 py-0.5 bg-va-white/20 rounded text-[9px] font-black uppercase tracking-widest">{projectDna.order.status}</TextInstrument>
                                    </ContainerInstrument>
                                    {projectDna.order.items?.map((item: any) => (
                                      <ContainerInstrument key={item.id} className="flex items-center gap-3 p-2 bg-va-white/10 rounded-xl">
                                        <ContainerInstrument className="w-8 h-8 rounded-lg bg-va-white/20 flex items-center justify-center text-[10px] font-bold">{item.actor?.firstName[0]}</ContainerInstrument>
                                        <ContainerInstrument className="min-w-0">
                                          <TextInstrument className="text-[10px] font-bold truncate">{item.actor?.firstName} {item.actor?.lastName}</TextInstrument>
                                          <TextInstrument className="text-[8px] opacity-60 uppercase">{item.deliveryStatus || 'Pending'}</TextInstrument>
                                        </ContainerInstrument>
                                      </ContainerInstrument>
                                    ))}
                                <ContainerInstrument className="pt-2 grid grid-cols-2 gap-2">
                                  <ButtonInstrument 
                                    onClick={() => generateAiDraft(selectedThread.messages[0].id)}
                                    disabled={isDrafting}
                                    className={`py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1 ${draftMethod === 'semantic_matching' ? 'bg-va-black text-white' : 'bg-va-black/10 text-va-black'}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Brain size={12} className={isDrafting ? 'animate-spin' : ''} />
                                      {isDrafting ? 'Drafting...' : 'Voicy Draft'}
                                    </div>
                                    {draftMethod === 'semantic_matching' && (
                                      <span className="text-[7px] opacity-60">Semantic Match Active</span>
                                    )}
                                  </ButtonInstrument>
                                  <ButtonInstrument className="py-2 bg-va-white/20 text-va-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                                    <VoiceglotText translationKey="mailbox.dna.update_status" defaultText="Update" />
                                  </ButtonInstrument>
                                </ContainerInstrument>
                                  </ContainerInstrument>
                                </ContainerInstrument>
                              )}
                            {customerDna.outstanding && customerDna.outstanding.length > 0 && (
                              <ContainerInstrument className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
                                <HeadingInstrument level={4} className="text-[10px] font-black uppercase tracking-widest text-orange-700 mb-3 flex items-center gap-2"><AlertCircle size={12} /><VoiceglotText translationKey="mailbox.dna.yuki_title" defaultText="Openstaande Facturen (Yuki)" /></HeadingInstrument>
                                <ContainerInstrument className="space-y-2">
                                  {customerDna.outstanding.map((inv: any) => (
                                    <ContainerInstrument key={inv.id} className="flex justify-between items-center text-[10px]"><TextInstrument as="span" className="font-medium text-orange-800">{inv.invoiceNr}</TextInstrument><TextInstrument as="span" className="font-black text-orange-900">€{inv.openAmount}</TextInstrument></ContainerInstrument>
                                  ))}
                                  <ContainerInstrument className="pt-2 border-t border-orange-200 mt-2 flex justify-between items-center">
                                    <TextInstrument as="span" className="text-[9px] font-black uppercase text-orange-700">
                                      <VoiceglotText translationKey="mailbox.billing.outstanding" defaultText="Totaal Openstaand" />
                                    </TextInstrument>
                                    <TextInstrument as="span" className="text-sm font-black text-orange-900">
                                      €{customerDna.outstanding.reduce((sum: number, inv: any) => sum + parseFloat(inv.openAmount), 0).toFixed(2)}
                                    </TextInstrument>
                                  </ContainerInstrument>
                                </ContainerInstrument>
                              </ContainerInstrument>
                            )}
                            <ContainerInstrument>
                              <HeadingInstrument level={4} className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-3 flex items-center gap-2"><Lock size={10} /><VoiceglotText translationKey="mailbox.dna.vault_title" defaultText="The Vault (Kluis)" /></HeadingInstrument>
                              <ContainerInstrument className="space-y-2">
                                {customerDna.vault.length > 0 ? customerDna.vault.slice(0, 5).map((file: any) => (
                                  <ContainerInstrument key={file.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group" onClick={() => setSpotlightFile(file)}>
                                    <ContainerInstrument className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                      {file.category === 'demo_inbound' ? <Mic size={14} /> : <FileText size={14} />}
                                    </ContainerInstrument>
                                    <ContainerInstrument className="flex-grow min-w-0">
                                      <div className="flex items-center gap-2">
                                        <TextInstrument className="text-[10px] font-bold truncate">{file.originalName}</TextInstrument>
                                        {file.actorId && <span className="text-[6px] bg-blue-100 text-blue-600 px-1 rounded font-black uppercase">Actor Asset</span>}
                                      </div>
                                      <TextInstrument className="text-[8px] text-gray-400 uppercase">{file.category}</TextInstrument>
                                    </ContainerInstrument>
                                  </ContainerInstrument>
                                )) : <TextInstrument className="text-[10px] text-gray-400 italic"><VoiceglotText translationKey="mailbox.dna.vault_empty" defaultText="Geen bestanden in de kluis." /></TextInstrument>}
                              </ContainerInstrument>
                            </ContainerInstrument>
                            <ContainerInstrument>
                              <HeadingInstrument level={4} className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-3 flex items-center gap-2"><History size={10} /><VoiceglotText translationKey="mailbox.dna.history_title" defaultText="Bestelgeschiedenis" /></HeadingInstrument>
                              <ContainerInstrument className="space-y-2">
                                {customerDna.orders.length > 0 ? customerDna.orders.map((order: any) => (
                                  <ContainerInstrument key={order.id} className="p-3 bg-gray-50 rounded-2xl"><ContainerInstrument className="flex justify-between items-start mb-1"><TextInstrument className="text-[10px] font-bold">#{order.wpOrderId || order.id}</TextInstrument><TextInstrument className="text-[10px] font-black">€{order.total}</TextInstrument></ContainerInstrument><TextInstrument className="text-[8px] text-gray-400 uppercase">{new Date(order.createdAt).toLocaleDateString()}</TextInstrument></ContainerInstrument>
                                )) : <TextInstrument className="text-[10px] text-gray-400 italic"><VoiceglotText translationKey="mailbox.dna.history_empty" defaultText="Nog geen bestellingen." /></TextInstrument>}
                              </ContainerInstrument>
                            </ContainerInstrument>
                          </ContainerInstrument>
                        ) : <ContainerInstrument className="animate-pulse space-y-4"><ContainerInstrument className="h-12 bg-gray-100 rounded-2xl w-full" /><ContainerInstrument className="h-24 bg-gray-100 rounded-2xl w-full" /><ContainerInstrument className="h-48 bg-gray-100 rounded-2xl w-full" /></ContainerInstrument>}
                        </div>
                      </ContainerInstrument>
                    </motion.div>
                  )}
              </AnimatePresence>
            </ContainerInstrument>
          </ContainerInstrument>

      {isComposing && (
        <EmailComposerInstrument initialTo={composerDefaults.to} initialSubject={composerDefaults.subject} initialBody={composerDefaults.body} onClose={() => setIsComposing(false)} onSend={handleSendEmail} />
      )}

      {/* 🧠 INSIGHT DRILL-DOWN MODAL */}
      <AnimatePresence>
        {spotlightFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-va-black/90 backdrop-blur-md flex items-center justify-center p-8"
            onClick={() => setSpotlightFile(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors" onClick={() => setSpotlightFile(null)}>
              <X size={32} />
            </button>

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-5xl w-full max-h-full flex flex-col items-center gap-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full flex justify-between items-center text-white/80">
                <div className="flex flex-col">
                  <span className="text-2xl font-black">{spotlightFile.originalName || spotlightFile.filename}</span>
                  <span className="text-xs uppercase tracking-widest opacity-50">{spotlightFile.category} • {(spotlightFile.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <a 
                  href={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.filePath || spotlightFile.path)}`} 
                  download={spotlightFile.originalName || spotlightFile.filename}
                  className="bg-white text-va-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
                >
                  <Download size={18} />
                  Downloaden
                </a>
              </div>

              <div className="w-full aspect-video bg-black/40 rounded-[32px] overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl">
                {/\.(mp4|webm|mov)$/i.test(spotlightFile.originalName || spotlightFile.filename) ? (
                  <video 
                    src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.filePath || spotlightFile.path)}`} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-full"
                  />
                ) : /\.(jpg|jpeg|png|gif|webp)$/i.test(spotlightFile.originalName || spotlightFile.filename) ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.filePath || spotlightFile.path)}`} 
                      alt={spotlightFile.originalName || spotlightFile.filename}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : /\.(mp3|wav|ogg|m4a)$/i.test(spotlightFile.originalName || spotlightFile.filename) ? (
                  <div className="flex flex-col items-center gap-8 w-full p-12">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                      <Mic size={48} className="text-white" />
                    </div>
                    <audio 
                      src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.filePath || spotlightFile.path)}`} 
                      controls 
                      autoPlay 
                      className="w-full max-w-md"
                    />
                  </div>
                ) : /\.pdf$/i.test(spotlightFile.originalName || spotlightFile.filename) ? (
                  <iframe 
                    src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.filePath || spotlightFile.path)}`} 
                    className="w-full h-full border-none"
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <FileText size={64} className="mx-auto text-white/20" />
                    <p className="text-white/50 font-bold">
                      <VoiceglotText translationKey="mailbox.preview.unavailable" defaultText="Voorvertoning niet beschikbaar voor dit bestandstype." />
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        {selectedInsight && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-va-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[80vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-va-black/40 mb-2 block">{selectedInsight.type}</span>
                  <HeadingInstrument level={2} className="text-2xl font-black text-va-black">{selectedInsight.label || selectedInsight.text || "Detail Analyse"}</HeadingInstrument>
                </div>
                <ButtonInstrument onClick={() => setSelectedInsight(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft className="rotate-90" />
                </ButtonInstrument>
              </div>

              <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 🚀 ACTIONABLE RECOMMENDATIONS */}
                <div className="space-y-6">
                  <HeadingInstrument level={4} className="text-[10px] font-black uppercase tracking-widest text-va-black flex items-center gap-2">
                    <Zap size={14} className="text-va-black" />
                    Vooruitdenkende Acties
                  </HeadingInstrument>
                  <div className="space-y-3">
                    {(selectedInsight.actions?.map((action: string, i: number) => (
                      <div key={i} className="p-4 bg-va-black text-white rounded-2xl flex gap-3 items-start shadow-lg">
                        <div className="w-5 h-5 bg-va-white/20 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                        <TextInstrument className="text-xs font-bold leading-relaxed">{action}</TextInstrument>
                      </div>
                    ))) || <TextInstrument className="text-xs italic text-gray-400">
                      <VoiceglotText translationKey="mailbox.actions.empty" defaultText="Geen specifieke acties geformuleerd." />
                    </TextInstrument>}
                  </div>
                </div>

                {/* 📧 SOURCE EVIDENCE */}
                <div className="space-y-6">
                  <HeadingInstrument level={4} className="text-[10px] font-black uppercase tracking-widest text-va-black flex items-center gap-2">
                    <Mail size={14} className="text-va-black" />
                    Bewijslast (E-mails)
                  </HeadingInstrument>
                  <div className="space-y-3">
                    {selectedInsight.sourceMailIds?.map((id: number) => {
                      const mail = insights?.allSourceMails?.find((m: any) => m.id === id);
                      if (!mail) return null;
                      return (
                        <div key={id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-va-black/10 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <TextInstrument className="text-[10px] font-black text-va-black truncate max-w-[150px]">{mail.sender}</TextInstrument>
                            <TextInstrument className="text-[8px] font-bold text-gray-400">{new Date(mail.date).toLocaleDateString()}</TextInstrument>
                          </div>
                          <TextInstrument className="text-[11px] font-bold mb-1 block">{mail.subject}</TextInstrument>
                          <TextInstrument className="text-[10px] text-gray-500 line-clamp-2 italic">&quot;{mail.body}&quot;</TextInstrument>
                        </div>
                      );
                    }) || <TextInstrument className="text-xs italic text-gray-400">
                      <VoiceglotText translationKey="mailbox.emails.empty" defaultText="Geen specifieke mails gekoppeld." />
                    </TextInstrument>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        </ContainerInstrument>
      </SectionInstrument>
  );
}
