import { ArrowRight, X, Zap } from 'lucide-react';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    TextInstrument
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

/**
 * ⚡ HITL ACTION CARD INSTRUMENT
 * 
 * Een kaart die de admin een actie voorstelt (HITL).
 * Wordt gebruikt in de Mailbox Sidebar of Dashboard.
 */
export const HitlActionCardInstrument = ({ 
  title, 
  description, 
  type = 'reorder',
  onApprove,
  onDismiss 
}: { 
  title: string;
  description: string;
  type?: 'reorder' | 'offer' | 'bridge';
  onApprove: () => void;
  onDismiss: () => void;
}) => {
  const getIcon = () => {
    switch (type) {
      case 'reorder': return <Zap strokeWidth={1.5} size={14} className="text-yellow-500" />;
      case 'offer': return <Zap strokeWidth={1.5} size={14} className="text-green-500" />;
      case 'bridge': return <Zap strokeWidth={1.5} size={14} className="text-blue-500" />;
      default: return <Zap strokeWidth={1.5} size={14} className="text-primary" />;
    }
  };

  return (
    <ContainerInstrument className="bg-va-black text-white p-4 rounded-2xl shadow-aura border border-white/5 relative overflow-hidden group">
      {/* Background Glow */}
      <ContainerInstrument className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 blur-2xl rounded-full group-hover:bg-primary/20 transition-all" />
      
      <ContainerInstrument className="flex justify-between items-start mb-3 relative z-10">
          <ContainerInstrument className="flex items-center gap-2">
          {getIcon()}
          <HeadingInstrument level={4} className="text-[15px] font-medium tracking-widest text-white/40"><VoiceglotText translationKey="hitl.suggestion" defaultText="Voicy Suggestie" /></HeadingInstrument>
        </ContainerInstrument>
        <ButtonInstrument onClick={onDismiss} className="text-white/20 hover:text-white transition-colors">
          <X strokeWidth={1.5} size={12} />
        </ButtonInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="relative z-10">
        <HeadingInstrument level={3} className="text-[15px] font-medium mb-1">
          {title}
        </HeadingInstrument>
        <TextInstrument className="text-[15px] text-white/60 leading-relaxed mb-4 font-light">
          {description}
        </TextInstrument>

        <ButtonInstrument 
          onClick={onApprove}
          className="w-full py-2 bg-white text-va-black rounded-xl text-[15px] font-medium tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
        ><VoiceglotText translationKey="common.approve" defaultText="Goedkeuren & Versturen" /><ArrowRight strokeWidth={1.5} size={12} /></ButtonInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
