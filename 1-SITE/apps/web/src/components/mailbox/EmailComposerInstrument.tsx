import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Paperclip, Send, X } from 'lucide-react';
import { useState } from 'react';

interface EmailComposerProps {
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  onClose: () => void;
  onSend: (data: { to: string; subject: string; body: string }) => void;
}

export const EmailComposerInstrument = ({
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  onClose,
  onSend
}: EmailComposerProps) => {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !body) return;
    
    setIsSending(true);
    await onSend({ to, subject, body });
    setIsSending(false);
  };

  return (
    <ContainerInstrument className="va-composer-overlay">
      <ContainerInstrument className="va-composer-modal">
        {/* Header */}
        <ContainerInstrument className="va-composer-header">
          <HeadingInstrument level={3} className="va-composer-title">
            <VoiceglotText translationKey="mailbox.compose" defaultText="Nieuw bericht" />
          </HeadingInstrument>
          <ButtonInstrument onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
            <X strokeWidth={1.5} size={20} className="text-va-black/40" />
          </ButtonInstrument>
        </ContainerInstrument>

        {/* Body */}
        <ContainerInstrument className="va-composer-body">
          <ContainerInstrument className="va-composer-field">
            <TextInstrument as="label" className="va-composer-label font-light">
              <VoiceglotText translationKey="mailbox.to" defaultText="Aan" />
            </TextInstrument>
            <InputInstrument 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="ontvanger@email.com"
              className="va-composer-input"
            />
          </ContainerInstrument>

          <ContainerInstrument className="va-composer-field">
            <TextInstrument as="label" className="va-composer-label font-light">
              <VoiceglotText translationKey="mailbox.subject" defaultText="Onderwerp" />
            </TextInstrument>
            <InputInstrument 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Onderwerp van je bericht..."
              className="va-composer-input"
            />
          </ContainerInstrument>

          <ContainerInstrument className="va-composer-field h-full">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Schrijf je bericht..."
              className="va-composer-textarea"
            />
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Footer */}
        <ContainerInstrument className="va-composer-footer">
          <ButtonInstrument onClick={onClose} className="va-composer-btn-discard">
            <VoiceglotText translationKey="common.cancel" defaultText="Annuleren" />
          </ButtonInstrument>
          
          <ContainerInstrument className="flex items-center gap-4">
            <ButtonInstrument className="p-2 text-va-black/40 hover:text-primary transition-colors">
              <Paperclip size={20} />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={handleSend}
              disabled={isSending}
              className="va-composer-btn-send"
            >
              <Send strokeWidth={1.5} size={14} className={isSending ? 'animate-pulse' : ''} />
              <VoiceglotText translationKey="mailbox.send" defaultText={isSending ? "Verzenden..." : "Verzenden"} />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
