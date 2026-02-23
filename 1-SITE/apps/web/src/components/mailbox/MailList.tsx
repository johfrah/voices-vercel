import { ButtonInstrument, ContainerInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { cn } from '@/lib/utils/utils';

interface MailItem {
  id: number;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isUnread: boolean;
  hasAttachment?: boolean;
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
            <TextInstrument as="span" className="text-[15px] text-va-black/30 font-medium whitespace-nowrap">
              {mail.date}
            </TextInstrument>
          </ContainerInstrument>

          <TextInstrument as="h4" className={cn(
            "text-[15px] mb-1 truncate pr-8",
            mail.isUnread ? "font-bold text-va-black" : "font-medium text-va-black/80"
          )}>
            {mail.subject}
          </TextInstrument>
          <TextInstrument className="text-[15px] text-va-black/40 line-clamp-2 leading-relaxed font-light">
            {mail.preview}
          </TextInstrument>
        </ButtonInstrument>
      ))}
    </ContainerInstrument>
  );
};
