import { ContainerInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Paperclip, Mic, FileText, Image as ImageIcon, Check, Archive, Brain, User } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import md5 from 'md5';

interface EmailListItemProps {
  id?: string;
  mail: any;
  isSelected?: boolean;
  isSemanticResult?: boolean;
  similarity?: number;
  onClick: () => void;
  onArchive?: () => void;
}

export const EmailListItemInstrument = ({
  id,
  mail,
  isSelected,
  isSemanticResult,
  similarity,
  onClick,
  onArchive
}: EmailListItemProps) => {
  const { sender, subject, preview, date, iapContext, isUnread, avatarUrl, hasAttachments } = mail;
  const intent = iapContext?.intent;
  const persona = iapContext?.persona;
  const senderEmail = sender.replace(/.*<(.+)>$/, '$1').toLowerCase().trim();
  const senderName = sender.split('<')[0].replace(/"/g, '').trim() || senderEmail;
  const initial = senderName.match(/[a-zA-Z]/)?.[0]?.toUpperCase() || '?';
  const gravatarUrl = `https://www.gravatar.com/avatar/${md5(senderEmail)}?s=80&d=blank`;
  const x = useMotionValue(0);
  
  // Kleurverandering op basis van swipe afstand
  const background = useTransform(
    x,
    [-100, 0, 100],
    ["#ef4444", "#ffffff", "#22c55e"]
  );

  const opacity = useTransform(x, [-100, -50, 0, 50, 100], [1, 0, 0, 0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onArchive?.();
    } else if (info.offset.x < -100) {
      onArchive?.();
    }
  };

  const getPersonaBadge = (p: string) => {
    switch (p) {
      case 'customer': return { label: 'KLANT', color: 'bg-green-100 text-green-700' };
      case 'voice_talent': return { label: 'STEM', color: 'bg-blue-100 text-blue-700' };
      case 'potential_talent': return { label: 'AUDITIE', color: 'bg-purple-100 text-purple-700' };
      case 'partner': return { label: 'PARTNER', color: 'bg-orange-100 text-orange-700' };
      case 'accounting': return { label: 'FINANCIEEL', color: 'bg-yellow-100 text-yellow-700' };
      case 'student': return { label: 'STUDENT', color: 'bg-indigo-100 text-indigo-700' };
      case 'technical': return { label: '🚨 ERROR', color: 'bg-red-100 text-red-700' };
      case 'financial_service': return { label: '🏦 BANK', color: 'bg-emerald-100 text-emerald-700' };
      case 'security': return { label: '🛡️ SECURITY', color: 'bg-slate-800 text-white' };
      case 'infrastructure': return { label: '📦 INFRA', color: 'bg-zinc-100 text-zinc-700' };
      case 'bounce': return { label: '⚠️ BOUNCE', color: 'bg-orange-50 text-orange-600' };
      case 'calendar': return { label: '📅 AGENDA', color: 'bg-sky-100 text-sky-700' };
      case 'suspicious': return { label: '🚩 CHECK', color: 'bg-rose-600 text-white animate-pulse' };
      case 'noise': return { label: 'RUIS', color: 'bg-gray-100 text-gray-400' };
      default: return null;
    }
  };

  const personaBadge = persona ? getPersonaBadge(persona) : null;

  return (
    <ContainerInstrument className={`relative overflow-hidden border-b border-gray-50 ${isSelected ? 'ring-1 ring-va-black/10 ring-inset z-20 bg-gray-50/50' : ''}`}>
      {/* Swipe Backgrounds */}
      <motion.div 
        style={{ background }}
        className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none"
      >
        <motion.div style={{ opacity: useTransform(x, [0, 50], [0, 1]) }}>
          <Check strokeWidth={1.5} className="text-white" size={20} />
        </motion.div>
        <motion.div style={{ opacity: useTransform(x, [0, -50], [0, 1]) }}>
          <Archive strokeWidth={1.5} className="text-white" size={20} / />
        </motion.div>
      </motion.div>

      <motion.div 
        id={id}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={onClick}
        className={`relative z-10 bg-white py-3 px-4 transition-colors cursor-pointer active:bg-gray-50 ${isUnread ? 'bg-blue-50/30' : ''} ${isSelected ? 'bg-gray-50' : ''}`}
      >
        <ContainerInstrument className="flex items-center gap-4">
          <ContainerInstrument className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[15px] font-light relative shadow-sm overflow-hidden ${isSemanticResult ? 'bg-va-black text-white' : 'bg-gray-100 text-gray-500'}`}>
            {avatarUrl ? (
              <Image strokeWidth={1.5} src={avatarUrl} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" / />
            ) : gravatarUrl ? (
              <ContainerInstrument className="relative w-full h-full">
                <Image strokeWidth={1.5} 
                  src={gravatarUrl} 
                  alt="" 
                  fill
                  className="object-cover z-10" 
                  unoptimized
                / />
                <ContainerInstrument className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 absolute inset-0 z-0">
                  {initial}
                </ContainerInstrument>
              </ContainerInstrument>
            ) : isSemanticResult ? (
              <Brain size={16} />
            ) : (
              initial
            )}
            {intent === 'quote_request' && (
              <ContainerInstrument className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-20" />
            )}
            {intent === 'demo_submission' && (
              <ContainerInstrument className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full z-20" />
            )}
          </ContainerInstrument>
          
          <ContainerInstrument className="flex-grow min-w-0">
            <ContainerInstrument className="flex justify-between items-center mb-0.5">
              <ContainerInstrument className="flex items-center gap-2 min-w-0">
                <TextInstrument as="span" className="text-[15px] font-light text-gray-900 truncate">
                  {sender.split('<')[0].replace(/"/g, '').trim()}
                </TextInstrument>
                {personaBadge && (
                  <TextInstrument className={`text-[15px] font-light tracking-widest px-1.5 py-0.5 rounded flex-shrink-0 ${personaBadge.color}`}>
                    {personaBadge.label}
                  </TextInstrument>
                )}
                {intent && !personaBadge && (
                  <TextInstrument className={`text-[15px] font-light tracking-widest px-1.5 py-0.5 rounded flex-shrink-0 ${
                    intent === 'quote_request' ? 'bg-green-100 text-green-700' : 
                    intent === 'demo_submission' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {intent.split('_')[0]}
                  </TextInstrument>
                )}
                {isSemanticResult && similarity && (
                  <TextInstrument className="text-[15px] font-light tracking-widest px-1.5 py-0.5 rounded bg-va-black text-white flex-shrink-0">
                    {Math.round(similarity * 100)}% Match
                  </TextInstrument>
                )}
              </ContainerInstrument>
              <TextInstrument as="span" className="text-[15px] text-gray-400 flex-shrink-0 font-light">
                {formatDistanceToNow(new Date(date), { addSuffix: false, locale: nl })}
              </TextInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="flex items-center gap-2">
              <TextInstrument as="p" className="text-[15px] font-light text-gray-800 truncate flex-grow">
                {subject}
              </TextInstrument>
              {hasAttachments && (
                <Paperclip size={12} className="text-gray-400 flex-shrink-0" />
              )}
            </ContainerInstrument>
            <TextInstrument as="p" className="text-[15px] text-gray-500 truncate mt-0.5 font-light">
              {preview.replace(/[\n\r]/g, ' ')}
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </motion.div>
    </ContainerInstrument>
  );
};
