import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Forward, Reply, ShieldCheck, Download, Rocket, Mic, FileText, Banknote, Play, Pause, X, Maximize2, Sparkles, Languages, Zap, Paperclip, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { PromotionModal } from './PromotionModal';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import md5 from 'md5';

interface Attachment {
  id: number;
  filename: string;
  category: string;
  size: number;
  path: string;
}

interface Message {
  id: number;
  sender: string;
  senderEmail: string;
  date: string;
  htmlBody: string;
  isSuperPrivate: boolean;
  attachments?: Attachment[];
}

interface Thread {
  id: string;
  subject: string;
  messages: Message[];
}

interface EmailThreadViewProps {
  thread: Thread;
  actorId?: number;
  onClose: () => void;
  onReply: (message: Message) => void;
}

export const EmailThreadViewInstrument = ({ thread, actorId, onClose, onReply }: EmailThreadViewProps) => {
  const [promotingFile, setPromotingFile] = useState<Attachment | null>(null);
  const [isDrafting, setIsDrafting] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [spotlightFile, setSpotlightFile] = useState<Attachment | null>(null);
  const [focusedAttachmentId, setFocusedAttachmentId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🍎 SPOTLIGHT SHORTCUT (SPATIE)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && focusedAttachmentId) {
        e.preventDefault();
        const allAttachments = thread.messages.flatMap(m => m.attachments || []);
        const att = allAttachments.find(a => a.id === focusedAttachmentId);
        if (att) setSpotlightFile(att);
      }
      if (e.key === 'Escape' && spotlightFile) {
        setSpotlightFile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedAttachmentId, spotlightFile, thread.messages]);

  const toggleAudio = (att: Attachment) => {
    if (playingId === att.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = `/api/admin/photo-matcher/serve?path=${encodeURIComponent(att.path)}`;
        audioRef.current.play();
        setPlayingId(att.id);
      }
    }
  };

  const handleDraftOffer = async (fileId: number) => {
    setIsDrafting(fileId);
    try {
      const res = await fetch('/api/vault/draft-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaultFileId: fileId })
      });
      if (res.ok) {
        alert('💰 Voicy heeft een concept-offerte klaargezet in de Approval Queue!');
      }
    } catch (error) {
      console.error('❌ Drafting Error:', error);
    } finally {
      setIsDrafting(null);
    }
  };

  const isVideo = (filename: string) => /\.(mp4|webm|mov)$/i.test(filename);
  const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  const isAudio = (filename: string) => /\.(mp3|wav|ogg|m4a)$/i.test(filename);
  const isPdf = (filename: string) => /\.pdf$/i.test(filename);

  return (
    <ContainerInstrument className="va-thread-view max-w-4xl mx-auto relative">
      {/* Thread Header */}
      <ContainerInstrument className="px-4 py-4 border-b border-gray-100">
        <ContainerInstrument className="flex items-start justify-between mb-2">
          <HeadingInstrument level={2} className="text-xl font-black tracking-tight text-gray-900 leading-tight">
            {thread.subject}
          </HeadingInstrument>
          <ButtonInstrument onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors">
            <TextInstrument as="span" className="text-[15px] font-bold">✕</TextInstrument>
          </ButtonInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-pink-50 text-pink-600 px-2 py-0.5 rounded-md text-[15px] font-black tracking-widest border border-pink-100">
            <ShieldCheck strokeWidth={1.5} size={10} />
            SECURE THREAD
          </div>
          <TextInstrument as="span" className="text-[15px] font-black tracking-widest text-gray-400">
            {thread.messages.length} BERICHTEN
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Messages List */}
      <ContainerInstrument className="p-4 space-y-4">
        {thread.messages.map((message) => {
          const senderName = message.sender.split('<')[0].replace(/"/g, '').trim() || message.senderEmail;
          const initial = senderName.match(/[a-zA-Z]/)?.[0]?.toUpperCase() || '?';
          const gravatarUrl = `https://www.gravatar.com/avatar/${md5(message.senderEmail)}?s=80&d=blank`;

          return (
            <ContainerInstrument key={message.id} className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
              {/* Message Header (Spark Style) */}
              <div className="px-6 py-5 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-va-black text-white flex items-center justify-center text-sm font-bold relative overflow-hidden shrink-0">
                    <Image 
                      src={gravatarUrl} 
                      alt="" 
                      fill
                      className="object-cover z-10" 
                      unoptimized
                    />
                    <span className="relative z-0">{initial}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <TextInstrument as="span" className="text-sm font-black text-gray-900">
                        {senderName}
                      </TextInstrument>
                      <TextInstrument as="span" className="text-[15px] text-gray-400 font-medium">
                        to &apos;Johfrah Lefebvre&apos;
                      </TextInstrument>
                    </div>
                    <TextInstrument as="p" className="text-[15px] text-gray-400 font-medium">
                      {message.senderEmail}
                    </TextInstrument>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <TextInstrument as="span" className="text-[15px] font-bold text-gray-400">
                    {format(new Date(message.date), 'd MMM, HH:mm', { locale: nl })}
                  </TextInstrument>
                  <ButtonInstrument className="p-1 text-gray-300 hover:text-va-black transition-colors">
                    <X strokeWidth={1.5} size={14} className="rotate-45" />
                  </ButtonInstrument>
                </div>
              </div>

              {/* AI Quick Actions (Spark Style) */}
              <div className="px-6 pb-2 flex gap-2">
                <ButtonInstrument className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[15px] font-black tracking-widest border border-blue-100/50 hover:bg-blue-100 transition-all">
                  <Sparkles strokeWidth={1.5} size={12} />
                  Translate to English
                </ButtonInstrument>
                <ButtonInstrument className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-[15px] font-black tracking-widest border border-gray-100 hover:bg-gray-100 transition-all">
                  <Languages size={12} />
                </ButtonInstrument>
              </div>

              {/* Message Body */}
              <div 
                className="px-6 py-4 text-[15px] text-gray-800 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: message.htmlBody }} 
              />

              {/* Attachments (Spark Style Cards) */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="px-6 pb-6 mt-4 border-t border-gray-50 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Paperclip size={14} />
                      <span className="text-[15px] font-bold tracking-widest">{message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}</span>
                    </div>
                    <ButtonInstrument className="text-[15px] font-black text-blue-600 hover:underline tracking-widest">
                      Save all {(message.attachments.reduce((sum, a) => sum + a.size, 0) / 1024).toFixed(0)} KB
                    </ButtonInstrument>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {message.attachments.map((att) => (
                      <div 
                        key={att.id} 
                        onMouseEnter={() => setFocusedAttachmentId(att.id)}
                        onMouseLeave={() => setFocusedAttachmentId(null)}
                        onClick={() => setSpotlightFile(att)}
                        className="group/att cursor-pointer"
                      >
                        <div className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden ${focusedAttachmentId === att.id ? 'bg-gray-50 border-va-black/20 shadow-md' : 'bg-white border-gray-100 shadow-sm'}`}>
                          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                            {isPdf(att.filename) ? <FileText size={24} /> : isAudio(att.filename) ? <Mic size={24} /> : isVideo(att.filename) ? <Play size={24} /> : <ImageIcon size={24} />}
                          </div>
                          <div className="text-center px-2">
                            <p className="text-[15px] font-black text-gray-900 truncate w-full max-w-[100px]">{att.filename}</p>
                            <p className="text-[15px] font-bold text-gray-400 ">{(att.size / 1024).toFixed(0)} KB</p>
                          </div>
                          
                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-va-black/5 opacity-0 group-hover/att:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <div className="bg-white p-2 rounded-full shadow-lg text-va-black">
                              <Maximize2 size={14} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Quick Replies (Spark Style) */}
              <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-[15px] font-black text-blue-600 mr-2 flex items-center gap-1"><Sparkles strokeWidth={1.5} size={10} /> +ai</span>
                  {['Interested', 'Not interested', 'Thanks'].map((reply) => (
                    <ButtonInstrument key={reply} className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-[15px] font-bold text-gray-600 hover:border-va-black transition-all shadow-sm">
                      {reply}
                    </ButtonInstrument>
                  ))}
                </div>
                <div className="flex gap-4">
                  <ButtonInstrument onClick={() => onReply(message)} className="text-gray-300 hover:text-va-black transition-colors">
                    <Reply size={18} />
                  </ButtonInstrument>
                  <ButtonInstrument className="text-gray-300 hover:text-va-black transition-colors">
                    <Forward size={18} />
                  </ButtonInstrument>
                </div>
              </div>
            </ContainerInstrument>
          );
        })}
      </ContainerInstrument>

      {/* 🍎 SPOTLIGHT OVERLAY */}
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
              <X strokeWidth={1.5} size={32} />
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
                  <span className="text-2xl font-black">{spotlightFile.filename}</span>
                  <span className="text-[15px] tracking-widest opacity-50">{spotlightFile.category} • {(spotlightFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <a 
                  href={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.path)}`} 
                  download={spotlightFile.filename}
                  className="bg-white text-va-black px-6 py-3 rounded-2xl font-black tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
                >
                  <Download size={18} />
                  Downloaden
                </a>
              </div>

              <div className="w-full aspect-video bg-black/40 rounded-[32px] overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl">
                {isVideo(spotlightFile.filename) ? (
                  <video 
                    src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.path)}`} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-full"
                  />
                ) : isImage(spotlightFile.filename) ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.path)}`} 
                      alt={spotlightFile.filename}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : isAudio(spotlightFile.filename) ? (
                  <div className="flex flex-col items-center gap-8 w-full p-12">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                      <Mic size={48} className="text-white" />
                    </div>
                    <audio 
                      src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.path)}`} 
                      controls 
                      autoPlay 
                      className="w-full max-w-md"
                    />
                  </div>
                ) : isPdf(spotlightFile.filename) ? (
                  <iframe 
                    src={`/api/admin/photo-matcher/serve?path=${encodeURIComponent(spotlightFile.path)}`} 
                    className="w-full h-full border-none"
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <FileText size={64} className="mx-auto text-white/20" />
                    <p className="text-white/50 font-bold">Voorvertoning niet beschikbaar voor dit bestandstype.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} className="hidden" onEnded={() => setPlayingId(null)} />
      {promotingFile && (
        <PromotionModal 
          file={promotingFile}
          actorId={actorId}
          onClose={() => setPromotingFile(null)}
          onSuccess={() => {
            // Refresh logic
          }}
        />
      )}
    </ContainerInstrument>
  );
};
