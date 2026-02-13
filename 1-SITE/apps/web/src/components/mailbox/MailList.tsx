"use client";

import { ContainerInstrument, ButtonInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Mail as MailIcon, Paperclip, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MailItem {
  id: number;
  uid: number;
  subject: string;
  from: string;
  date: string;
  preview: string;
  hasAttachments: boolean;
  isUnread: boolean;
  isStarred: boolean;
}

interface MailListProps {
  mails: MailItem[];
  selectedMailId?: number;
  onSelect: (mail: MailItem) => void;
}

export const MailList = ({ mails, selectedMailId, onSelect }: MailListProps) => {
  return (
    <ContainerInstrument className="divide-y divide-black/5">
      {mails.map((mail) => (
        <ButtonInstrument
          key={mail.id}
          onClick={() => onSelect(mail)}
          className={cn(
            "w-full text-left p-4 hover:bg-white/50 transition-all group relative",
            selectedMailId === mail.id && "bg-white shadow-sm z-10",
            mail.isUnread && "bg-primary/5"
          )}
        >
          <ContainerInstrument className="flex justify-between items-start gap-4 mb-2">
            <ContainerInstrument className="flex-1 min-w-0">
              <ContainerInstrument className="flex items-center gap-2">
                {mail.isUnread && (
                  <ContainerInstrument className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
                <TextInstrument as="span" className={cn(
                  "text-[15px] truncate block",
                  mail.isUnread ? "font-bold text-va-black" : "font-medium text-va-black/70"
                )}>
                  {mail.from}
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <TextInstrument as="span" className="text-[15px] text-va-black/40 whitespace-nowrap flex-shrink-0 font-light">
              {mail.date}
            </TextInstrument>
          </ContainerInstrument>

          <TextInstrument as="h4" className={cn(
            "text-[15px] mb-1 truncate pr-8",
            mail.isUnread ? "font-bold text-va-black" : "font-medium text-va-black/80"
          )}>
            {mail.subject}
          </TextInstrument>

          <TextInstrument as="p" className="text-[15px] text-va-black/50 line-clamp-2 leading-relaxed font-light">
            {mail.preview}
          </TextInstrument>

          <ContainerInstrument className="absolute right-4 bottom-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {mail.hasAttachments && <Paperclip size={12} className="text-va-black/40" />}
            {mail.isStarred && <Star strokeWidth={1.5} size={12} className="text-yellow-400 fill-yellow-400" />}
          </ContainerInstrument>
        </ButtonInstrument>
      ))}
    </ContainerInstrument>
  );
};
